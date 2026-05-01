// /coins Command by Mr.Cologne!
// Command to display user's currency
// Also has the ability to add and remove coins for testing purposes.

// * Imports
import {
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import User from '../../sql/models/user.js';

// * Command Builder for name and parameters

export const data = new SlashCommandBuilder()
  .setName('coins')
  .setDescription('Lists your coins!')
  .addSubcommand(sub => sub
    .setName('view')
    .setDescription('Check your money!')
  )
  .addSubcommand(sub => sub
    .setName('add')
    .setDescription('Give yourself MONEY')
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of coins you want to add.')
    )
  )
  .addSubcommand(sub => sub
    .setName('remove')
    .setDescription('Make yourself poor!')
  );

// * The Command Function

export async function execute(interaction) {

// * Variables for the user that used the command

  const targetUser = interaction.options.getUser('user') || interaction.user;
  const guildMember = interaction.guild.members.cache.get(targetUser.id);
  const [user] = await User.findOrCreate({ where: { id: await targetUser.id } });

// * This is where each subcommand's actions are made with if else statements.
// * First subcommand action for /coins view

  if (interaction.options.getSubcommand() === 'view') {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${guildMember.nickname || targetUser.displayName}'s Coins`,
        iconURL: guildMember.displayAvatarURL(),
      })
      .setColor(interaction.client.embedColour)
      .addFields(
        // @ts-ignore
        { name: 'Coins', value: user.currency.toString(), inline: true });

    await interaction.editReply({ embeds: [embed] });
  }

// * Second subcommand action for /coins add

  else if (interaction.options.getSubcommand() === 'add') {
    await interaction.deferReply();
    await user.increment('currency', { by: 1 });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${guildMember.nickname || targetUser.displayName}'s Coins`,
        iconURL: guildMember.displayAvatarURL(),
      })
      .setColor(interaction.client.embedColour)
      .addFields(
        // @ts-ignore
        { name: 'Coins', value: user.currency.toString(), inline: true });

    await interaction.editReply({ embeds: [embed] });

  }

  // * Third subcommand action for /coins remove

  else if (interaction.options.getSubcommand() === 'remove') {

  };

};