const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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

    // Create select menu
    const menu = new StringSelectMenuBuilder()
      .setCustomId('menu')
      .setPlaceholder('Select which column to drop in!')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('1')
          .setValue('c1'),

        new StringSelectMenuOptionBuilder()
          .setLabel('2')
          .setValue('c2'),

        new StringSelectMenuOptionBuilder()
          .setLabel('3')
          .setValue('c3'),

        new StringSelectMenuOptionBuilder()
          .setLabel('4')
          .setValue('c4'),

        new StringSelectMenuOptionBuilder()
          .setLabel('5')
          .setValue('c5'),

        new StringSelectMenuOptionBuilder()
          .setLabel('6')
          .setValue('c6'),

        new StringSelectMenuOptionBuilder()
          .setLabel('7')
          .setValue('c7'),
      );

    const row = new ActionRowBuilder()
      .addComponents(menu);

    const b = ':black_circle:';
    const y = ':yellow_circle:';
    const r = ':red_circle:';
    let c1 = [b, b, b, b, b, b];
    let c2 = [b, b, b, b, b, b];
    let c3 = [b, b, b, b, b, b];
    let c4 = [b, b, b, b, b, b];
    let c5 = [b, b, b, b, b, b];
    let c6 = [b, b, b, b, b, b];
    let c7 = [b, b, b, b, b, b];
    let r1;
    let r2;
    let r3;
    let r4;
    let r5;
    let r6;
    const regenerateRows = () => {
      r1 = `${c1[0]} ${c2[0]} ${c3[0]} ${c4[0]} ${c5[0]} ${c6[0]} ${c7[0]}`;
      r2 = `${c1[1]} ${c2[1]} ${c3[1]} ${c4[1]} ${c5[1]} ${c6[1]} ${c7[1]}`;
      r3 = `${c1[2]} ${c2[2]} ${c3[2]} ${c4[2]} ${c5[2]} ${c6[2]} ${c7[2]}`;
      r4 = `${c1[3]} ${c2[3]} ${c3[3]} ${c4[3]} ${c5[3]} ${c6[3]} ${c7[3]}`;
      r5 = `${c1[4]} ${c2[4]} ${c3[4]} ${c4[4]} ${c5[4]} ${c6[4]} ${c7[4]}`;
      r6 = `${c1[5]} ${c2[5]} ${c3[5]} ${c4[5]} ${c5[5]} ${c6[5]} ${c7[5]}`;
    };
    let board = `**--------------------------**\n${r1}\n${r2}\n${r3}\n${r4}\n${r5}\n${r6}\n**--------------------------**`;
    if (interaction.user.id === '547975777291862057') {
      // Header/label--introduces initiator and opponent
      await interaction.reply({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**` });
      // Game board--edited with each interaction from each player
      const game = await interaction.channel.send({ content: board, components: [row] });
      c7[0] = r;
      regenerateRows();
      await game.edit({ content: board, components: [row] });
    }
    else {
      await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
    }
  },
};
