const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('User test command'),

  async execute(interaction) {
    await interaction.reply(`# ${interaction.user.username}\nID: ${interaction.user.id}`);
  },
}
