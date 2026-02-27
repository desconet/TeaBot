const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { getWallets, updateLastBlock } = require('./walletManager');

const ETHERSCAN_API = 'https://api.etherscan.io/api';
const POLL_INTERVAL = 15000; // 15 segundos

// Busca transações de NFT (ERC-721 e ERC-1155) de uma carteira
async function fetchNFTTransactions(address, startBlock) {
  try {
    const [erc721, erc1155] = await Promise.all([
      axios.get(ETHERSCAN_API, {
        params: {
          module: 'account',
          action: 'tokennfttx',
          address,
          startblock: startBlock || '0',
          sort: 'asc',
          apikey: process.env.ETHERSCAN_API_KEY
        }
      }),
      axios.get(ETHERSCAN_API, {
        params: {
          module: 'account',
          action: 'token1155tx',
          address,
          startblock: startBlock || '0',
          sort: 'asc',
          apikey: process.env.ETHERSCAN_API_KEY
        }
      })
    ]);

    const txs721 = erc721.data.status === '1' ? erc721.data.result : [];
    const txs1155 = erc1155.data.status === '1' ? erc1155.data.result : [];

    return [...txs721, ...txs1155].sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));
  } catch (err) {
    console.error(`Erro ao buscar txs de ${address}:`, err.message);
    return [];
  }
}

// Tenta buscar imagem do NFT via OpenSea
async function getNFTImage(contractAddress, tokenId) {
  try {
    const res = await axios.get(
      `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`,
      { headers: { 'X-API-KEY': '' }, timeout: 5000 }
    );
    return res.data?.nft?.image_url || null;
  } catch {
    return null;
  }
}

// Formata o embed igual ao CoffeeBot da imagem
async function buildEmbed(tx, walletLabel, isSale) {
  const nftName = `${tx.tokenName || 'NFT'} #${tx.tokenID}`;
  const action = isSale ? 'sold' : 'bought';
  const ethValue = tx.value ? (Number(tx.value) / 1e18).toFixed(4) : '0.0000';

  const imageUrl = await getNFTImage(tx.contractAddress, tx.tokenID);

  const color = isSale ? 0xFF4444 : 0x44FF88;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${walletLabel} ${action} ${nftName}`)
    .setDescription(`**${walletLabel}** ${action} **${nftName}**`)
    .addFields(
      { name: '**Sold By**', value: `[${tx.from.slice(0, 8)}...](https://etherscan.io/address/${tx.from})`, inline: true },
      { name: '**Bought by**', value: `[${tx.to.slice(0, 8)}...](https://etherscan.io/address/${tx.to})`, inline: true },
      { name: '\u200B', value: '\u200B', inline: false },
      { name: '**Sold for**', value: `${ethValue} ETH`, inline: true },
      { name: '**Marketplace**', value: `[opensea.io](https://opensea.io/assets/ethereum/${tx.contractAddress}/${tx.tokenID})`, inline: true },
      { name: '**Block Explorer**', value: `[Etherscan](https://etherscan.io/tx/${tx.hash})`, inline: true }
    )
    .setTimestamp(Number(tx.timeStamp) * 1000)
    .setFooter({ text: 'NFT Tracker' });

  if (imageUrl) {
    embed.setThumbnail(imageUrl);
  }

  return embed;
}

// Busca o bloco mais recente para inicializar uma carteira nova
async function getLatestBlock() {
  try {
    const res = await axios.get(ETHERSCAN_API, {
      params: {
        module: 'proxy',
        action: 'eth_blockNumber',
        apikey: process.env.ETHERSCAN_API_KEY
      }
    });
    return parseInt(res.data.result, 16).toString();
  } catch {
    return '0';
  }
}

// Loop principal do tracker
async function startTracker(client) {
  console.log('🔍 Tracker de NFTs iniciado...');

  setInterval(async () => {
    const wallets = getWallets();
    const addresses = Object.values(wallets);

    if (addresses.length === 0) return;

    for (const wallet of addresses) {
      try {
        // Inicializa o lastBlock se for '0' (carteira recém adicionada)
        let startBlock = wallet.lastBlock;
        if (startBlock === '0') {
          startBlock = await getLatestBlock();
          updateLastBlock(wallet.address, startBlock);
          continue; // Pula essa rodada para não pegar txs antigas
        }

        const txs = await fetchNFTTransactions(wallet.address, String(Number(startBlock) + 1));

        if (txs.length === 0) continue;

        const channel = await client.channels.fetch(wallet.channelId).catch(() => null);
        if (!channel) {
          console.warn(`Canal não encontrado para carteira ${wallet.address}`);
          continue;
        }

        let highestBlock = startBlock;

        for (const tx of txs) {
          const isSale = tx.from.toLowerCase() === wallet.address.toLowerCase();
          const emb = await buildEmbed(tx, wallet.label, isSale);
          await channel.send({ embeds: [emb] });

          if (Number(tx.blockNumber) > Number(highestBlock)) {
            highestBlock = tx.blockNumber;
          }
        }

        updateLastBlock(wallet.address, highestBlock);

      } catch (err) {
        console.error(`Erro no tracker de ${wallet.address}:`, err.message);
      }
    }
  }, POLL_INTERVAL);
}

module.exports = { startTracker };
