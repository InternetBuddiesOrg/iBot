const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping test command'),

  async execute(interaction) {
    await interaction.reply('ping\'d');
  },
}
