import {
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Shows your client ping');
export async function execute(interaction) {
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
        name: 'API Latency',
        value: `${interaction.client.ws.ping} ms`,
      },
      {
        name: 'Client Ping',
        value: `${message.createdTimestamp - interaction.createdTimestamp} ms`,
      },
      // For later: make these inline if possible
    ])
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}
