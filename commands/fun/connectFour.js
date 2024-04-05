const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect-four')
    .setDescription('Play the classic "Fun Game" of connecting the Four'),

  async execute(interaction) {
    const reply = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      });
    await interaction.reply({ embeds: [reply] });
  },
};
