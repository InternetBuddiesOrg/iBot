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
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('The amount of coins you want to remove.')
    )
  )
  .addSubcommand(sub => sub
    .setName('set')
    .setDescription(`Set another user's coins`)
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user whose coins you are setting.')
    )
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('The amount of coins you are setting.')
    )
  )

// * The Command Function

export async function execute(interaction) {

// * Variables for the user that used the command

  const targetUser = interaction.options.getUser('user') || interaction.user;
  const guildMember = interaction.guild.members.cache.get(targetUser.id);
  const [user] = await User.findOrCreate({ where: { id: await targetUser.id } });
  // @ts-ignore
  const userCoinAmountString = (user) => `${user.currency}`;

// * This is where each subcommand's actions are made with if else statements.
// * First subcommand action for /coins view

  if (interaction.options.getSubcommand() === 'view') {
    await interaction.deferReply()

    await interaction.editReply(`${guildMember}, You currently have **${userCoinAmountString(user)}** coins.`);
  }

// * Second subcommand action for /coins add

  else if (interaction.options.getSubcommand() === 'add') {
    await interaction.deferReply();
    const addAmount = interaction.options.getInteger('amount');
    await user.increment('currency', { by: addAmount });
    await user.reload();


    await interaction.editReply(`You added **${addAmount}** coins! You now have **${userCoinAmountString(user)}** coins!`);

  }

  // * Third subcommand action for /coins remove

  else if (interaction.options.getSubcommand() === 'remove') {

        await interaction.deferReply();
    const removeAmount = -(interaction.options.getInteger('amount'));
    await user.increment('currency', { by: removeAmount });
    await user.reload();

    await interaction.editReply(`You removed **${removeAmount + -2*removeAmount}** coins! You now have **${userCoinAmountString(user)}** coins!`);

  }

  // * Fourth subcommand action for /coins set

  else if (interaction.options.getSubcommand() === 'set') {

    await interaction.deferReply();
    const setAmount = interaction.options.getInteger('amount');
    await user.update({ currency: setAmount });
    await user.save(); // Is this redundant?

    await interaction.editReply(`You set ${targetUser}'s coins to ${userCoinAmountString(user)}!`);
  }

};