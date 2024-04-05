const {
  SlashCommandBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect-four')
    .setDescription('Play the classic "Fun Game" of connecting the Four'),

  async execute(interaction) {
    const b = ':black_circle:';
    const blank = `# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}\n# ${b}   ${b}   ${b}   ${b}   ${b}   ${b}   ${b}`;
    if (interaction.user.id === '547975777291862057') {
      await interaction.reply(blank);
    }
    else {
      await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
    }
  },
};
