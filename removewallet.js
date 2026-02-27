const { SlashCommandBuilder } = require('discord.js');
const { removeWallet } = require('../walletManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removewallet')
    .setDescription('Remove uma carteira do monitoramento')
    .addStringOption(opt =>
      opt.setName('address')
        .setDescription('Endereço Ethereum da carteira (0x...)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const address = interaction.options.getString('address');

    const removed = removeWallet(address);

    if (!removed) {
      return interaction.reply({
        content: `❌ Carteira \`${address}\` não encontrada no monitoramento.`,
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `🗑️ Carteira **${address}** removida do monitoramento com sucesso!`,
      ephemeral: false
    });
  }
};
