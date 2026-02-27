const { SlashCommandBuilder } = require('discord.js');
const { addWallet } = require('../walletManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addwallet')
    .setDescription('Adiciona uma carteira para monitorar NFTs')
    .addStringOption(opt =>
      opt.setName('address')
        .setDescription('Endereço Ethereum da carteira (0x...)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('label')
        .setDescription('Apelido para a carteira (ex: pastel, pransky)')
        .setRequired(false)
    )
    .addChannelOption(opt =>
      opt.setName('canal')
        .setDescription('Canal onde serão enviadas as notificações (padrão: canal atual)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const address = interaction.options.getString('address');
    const label = interaction.options.getString('label');
    const channel = interaction.options.getChannel('canal') || interaction.channel;

    // Valida o endereço Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return interaction.reply({
        content: '❌ Endereço Ethereum inválido. Deve começar com `0x` e ter 42 caracteres.',
        ephemeral: true
      });
    }

    const added = addWallet(address, label, channel.id);

    if (!added) {
      return interaction.reply({
        content: `⚠️ A carteira \`${address}\` já está sendo monitorada!`,
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `✅ Carteira **${label || address}** adicionada!\n📡 Monitorando em ${channel}\n⏳ As notificações começarão a partir da próxima transação.`,
      ephemeral: false
    });
  }
};
