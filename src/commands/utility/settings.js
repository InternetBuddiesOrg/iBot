const {
  SlashCommandBuilder,
} = require('discord.js');
const User = require('../../sql/models/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Customise your game pieces')
    .addSubcommand(sub =>
      sub
        .setName('gyattzee')
        .setDescription('Customise your dice colour for Gyattzee')
        .addStringOption(option =>
          option
            .setName('colour')
            .setDescription('The dice colour')
            .setRequired(true)
            .addChoices(
              { name: 'White', value: 'white' },
              { name: 'Black', value: 'black' },
              { name: 'Blue', value: 'blue' },
              { name: 'Fuchsia', value: 'fuchsia' },
              { name: 'Green', value: 'green' },
              { name: 'Orange', value: 'orange' },
              { name: 'Red', value: 'red' },
              { name: 'Yellow', value: 'yellow' },
            ),
        ),
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'gyattzee') {
      const selection = interaction.options.getString('colour');
      const [user] = await User.findOrCreate({ where: { id: await interaction.user.id } });
      await user.update({ diceColour: selection });
      let emoji;

      switch (selection) {
        case 'white':
          emoji = '<a:dra_white:1277477959401345047>';
          break;
        case 'black':
          emoji = '<a:dra_black:1277478120462487634>';
          break;
        case 'blue':
          emoji = '<a:dra_blue:1278118610128076913>';
          break;
        case 'fuchsia':
          emoji = '<a:dra_fuchsia:1277478235113787423>';
          break;
        case 'green':
          emoji = '<a:dra_green:1278118649705791519>';
          break;
        case 'orange':
          emoji = '<a:dra_orange:1277478332879077396>';
          break;
        case 'red':
          emoji = '<a:dra_red:1277478376419889234>';
          break;
        case 'yellow':
          emoji = '<a:dra_yellow:1277478418065133700>';
          break;
      }

      await interaction.reply({
        content: `You are now using **${emoji} ${selection.charAt(0).toUpperCase() + selection.slice(1)}** dice.`,
        ephemeral: true,
      });
    }
  },
};