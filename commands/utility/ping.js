const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows your client ping'),

  async execute(interaction, client) {
    const message = await interaction.deferReply({ fetchReply: true });
    const embed = new EmbedBuilder()
      .setColor('#F0CD40')
      .setTitle('Pong!')
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .addFields([
        {
          name: 'API Latency',
          value: `${client.ws.ping} ms`,
          inline: true,
        },
        {
          name: 'Client Ping',
          value: `${message.createdTimestamp - interaction.createdTimestamp} ms`,
        },
      ])
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};
