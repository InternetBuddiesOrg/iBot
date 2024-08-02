const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows your client ping'),

  async execute(interaction) {
    const message = await interaction.deferReply({ fetchReply: true });

    const guildMember = interaction.guild.members.cache.get(interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(interaction.client.embedColour)
      .setTitle('Pong!')
      .setAuthor({
        name: guildMember.nickname || interaction.user.displayName,
        iconURL: guildMember.displayAvatarURL(),
      })
      .addFields([
        {
          name: 'Client Ping',
          value: `${message.createdTimestamp - interaction.createdTimestamp} ms`,
        },
      ])
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  },
};
