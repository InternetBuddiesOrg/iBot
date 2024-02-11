const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Server test command'),

  async execute(interaction) {
    await interaction.reply(`# ${interaction.guild.name}\nID: ${interaction.guild.id}`);
  },
}
