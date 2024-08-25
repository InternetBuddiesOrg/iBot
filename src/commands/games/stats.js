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
    )
    .addSubcommand(sub =>
      sub
        .setName('gyattzee')
        .setDescription('Lists your Gyattzee stats'),
    ),

  async execute(interaction) {
    const guildMember = interaction.guild.members.cache.get(interaction.user.id);
    const [user] = await User.findOrCreate({ where: { id: await interaction.user.id } });

    if (interaction.options.getSubcommand() === 'connect-4') {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${guildMember.nickname || interaction.user.displayName}'s Connect 4 stats`,
          iconURL: guildMember.displayAvatarURL(),
        })
        .setColor(interaction.client.embedColour)
        .addFields(
          { name: 'Wins', value: user.c4Wins.toString(), inline: true },
          { name: 'Losses', value: user.c4Losses.toString(), inline: true },
        );

      await interaction.editReply({ embeds: [embed] });
    }

    else if (interaction.options.getSubcommand() === 'gyattzee') {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${guildMember.nickname || interaction.user.displayName}'s Gyattzee stats`,
          iconURL: guildMember.displayAvatarURL(),
        })
        .setColor(interaction.client.embedColour)
        .addFields(
          { name: 'Total score', value: user.yahtzeeTotalScore.toString(), inline: true },
          { name: 'High score', value: user.yahtzeeHighScore.toString(), inline: true },
          { name: 'Multiplayer wins', value: user.yahtzeeMultiWins.toString(), inline: true },
        );

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
