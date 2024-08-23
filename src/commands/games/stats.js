const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const User = require('../../sql/models/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Lists your game stats')
    .addSubcommand(sub =>
      sub
        .setName('connect-4')
        .setDescription('Lists your Connect 4 stats'),
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'connect-4') {
      const guildMember = interaction.guild.members.cache.get(interaction.user.id);
      await interaction.deferReply();
      const [user] = await User.findOrCreate({ where: { id: await interaction.user.id } });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${guildMember.nickname || interaction.user.displayName}'s Connect 4 stats`,
          iconURL: guildMember.displayAvatarURL(),
        })
        .setColor(interaction.client.embedColour)
        .addFields(
          { name: 'Wins', value: user.wins.toString(), inline: true },
          { name: 'Losses', value: user.losses.toString(), inline: true },
        );

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
