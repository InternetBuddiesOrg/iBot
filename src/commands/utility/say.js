const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make iBot do your bidding')
    .addStringOption(option =>
      option
        .setName('phrase')
        .setDescription('phrase')
        .setRequired(true),
    ),
  async execute(interaction) {
    const phrase = interaction.options.getString('phrase');

    await interaction.deferReply();
    await interaction.deleteReply();
    await interaction.channel.send(`${phrase}`);
  },
};