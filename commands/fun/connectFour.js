const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect-four')
    .setDescription('Play the classic "Fun Game" of connecting the Four')
    .addUserOption(option =>
      option.setName('challenge')
        .setDescription('Select your opponent')
        .setRequired(true)),

  async execute(interaction) {
    const opponent = interaction.options.getUser('challenge');

    // Create buttons
    const col1 = new ButtonBuilder()
      .setCustomId('col1')
      .setLabel('⭕️')
      .setStyle(ButtonStyle.Primary);

    const col2 = new ButtonBuilder()
      .setCustomId('col2')
      .setLabel('⭕️')
      .setStyle(ButtonStyle.Primary);

    const col3 = new ButtonBuilder()
      .setCustomId('col3')
      .setLabel('⭕️')
      .setStyle(ButtonStyle.Primary);

    const col4 = new ButtonBuilder()
      .setCustomId('col4')
      .setLabel('⭕️')
      .setStyle(ButtonStyle.Primary);

    const col5 = new ButtonBuilder()
      .setCustomId('col5')
      .setLabel('⭕️')
      .setStyle(ButtonStyle.Primary);

    // const col6 = new ButtonBuilder()
    //   .setLabel('⭕️')
    //   .setStyle(ButtonStyle.Primary);

    // const col7 = new ButtonBuilder()
    //   .setLabel('⭕️')
    //   .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
      .addComponents(col1, col2, col3, col4, col5);

    const b = ':black_circle:';
    const blank = `# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}`;
    if (interaction.user.id === '547975777291862057') {
      await interaction.reply({
        content: `## @${interaction.user.username} challenges @${opponent.username} to a game of Connect 4!\n${blank}`,
        components: [row],
      });
    }
    else {
      await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
    }
  },
};
