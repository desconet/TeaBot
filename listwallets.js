const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWallets } = require('../walletManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listwallets')
    .setDescription('Lista todas as carteiras monitoradas'),

  async execute(interaction) {
    const wallets = getWallets();
    const list = Object.values(wallets);

    if (list.length === 0) {
      return interaction.reply({
        content: '📭 Nenhuma carteira está sendo monitorada no momento.\nUse `/addwallet` para adicionar uma!',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📡 Carteiras Monitoradas')
      .setDescription(`Total: **${list.length}** carteiras`)
      .setTimestamp();

    for (const wallet of list) {
      const channel = `<#${wallet.channelId}>`;
      const shortAddr = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
      const etherscanLink = `[${shortAddr}](https://etherscan.io/address/${wallet.address})`;

      embed.addFields({
        name: wallet.label,
        value: `📬 ${etherscanLink}\n📢 Canal: ${channel}\n📅 Adicionada: <t:${Math.floor(new Date(wallet.addedAt).getTime() / 1000)}:R>`,
        inline: true
      });
    }

    return interaction.reply({ embeds: [embed] });
  }
};
