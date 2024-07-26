const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect-four')
    .setDescription('Stupid Dumb Baby Game')
    .addUserOption(option =>
      option.setName('challenge')
        .setDescription('Select your opponent')
        .setRequired(true)),

  async execute(interaction) {
    const opponent = interaction.options.getUser('challenge');

    // Create select menu
    const createSelectMenu = () => {
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

      return new ActionRowBuilder()
        .addComponents(menu);
    };

    const b = ':black_circle:';
    const y = ':yellow_circle:';
    const r = ':red_circle:';
    const c1 = [b, b, b, b, b, b];
    const c2 = [b, b, b, b, b, b];
    const c3 = [b, b, b, b, b, b];
    const c4 = [b, b, b, b, b, b];
    const c5 = [b, b, b, b, b, b];
    const c6 = [b, b, b, b, b, b];
    const c7 = [b, b, b, b, b, b];
    let r1;
    let r2;
    let r3;
    let r4;
    let r5;
    let r6;
    let board;
    const regenerateRows = () => {
      r1 = `${c1[5]} ${c2[5]} ${c3[5]} ${c4[5]} ${c5[5]} ${c6[5]} ${c7[5]}`;
      r2 = `${c1[4]} ${c2[4]} ${c3[4]} ${c4[4]} ${c5[4]} ${c6[4]} ${c7[4]}`;
      r3 = `${c1[3]} ${c2[3]} ${c3[3]} ${c4[3]} ${c5[3]} ${c6[3]} ${c7[3]}`;
      r4 = `${c1[2]} ${c2[2]} ${c3[2]} ${c4[2]} ${c5[2]} ${c6[2]} ${c7[2]}`;
      r5 = `${c1[1]} ${c2[1]} ${c3[1]} ${c4[1]} ${c5[1]} ${c6[1]} ${c7[1]}`;
      r6 = `${c1[0]} ${c2[0]} ${c3[0]} ${c4[0]} ${c5[0]} ${c6[0]} ${c7[0]}`;
      board = `**--------------------------**\n${r1}\n${r2}\n${r3}\n${r4}\n${r5}\n${r6}\n**--------------------------**`;
    };
    regenerateRows();

    const handleCollector = async (message) => {
      const collector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
      collector.on('collect', async i => {
        const selection = i.values[0];
        if (selection === 'c1') {
          if (i.user.id === interaction.user.id) { // player A
            if (c1[c1.indexOf(b)] !== -1) { // checks if column is full
              c1[c1.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 1`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c1[c1.indexOf(b)] !== -1) {
              c1[c1.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 1`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
        else if (selection === 'c2') {
          if (i.user.id === interaction.user.id) { // player A
            if (c2[c2.indexOf(b)] !== -1) {
              c2[c2.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 2`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c2[c2.indexOf(b)] !== -1) {
              c2[c2.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 2`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
        else if (selection === 'c3') {
          if (i.user.id === interaction.user.id) { // player A
            if (c3[c3.indexOf(b)] !== -1) {
              c3[c3.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 3`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c3[c3.indexOf(b)] !== -1) {
              c3[c3.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 3`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
        else if (selection === 'c4') {
          if (i.user.id === interaction.user.id) { // player A
            if (c4[c4.indexOf(b)] !== -1) {
              c4[c4.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 4`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c4[c4.indexOf(b)] !== -1) {
              c4[c4.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 4`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
        else if (selection === 'c5') {
          if (i.user.id === interaction.user.id) { // player A
            if (c5[c5.indexOf(b)] !== -1) {
              c5[c5.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 5`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c5[c5.indexOf(b)] !== -1) {
              c5[c5.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 5`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
        else if (selection === 'c6') {
          if (i.user.id === interaction.user.id) { // player A
            if (c6[c6.indexOf(b)] !== -1) {
              c6[c6.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 6`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c6[c6.indexOf(b)] !== -1) {
              c6[c6.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 6`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
        else if (selection === 'c7') {
          if (i.user.id === interaction.user.id) { // player A
            if (c7[c7.indexOf(b)] !== -1) {
              c7[c7.indexOf(b)] = r;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 7`);
            }
          }
          else if (i.user.id === opponent.id) { // player B
            if (c7[c7.indexOf(b)] !== -1) {
              c7[c7.indexOf(b)] = y;
              regenerateRows();
              await message.delete();
              const row = createSelectMenu();
              const newMessage = await interaction.channel.send({ content: board, components: [row] });
              handleCollector(newMessage);
              console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 7`);
            }
          }
          else {
            await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
          }
        }
      });
    };

    if (interaction.user.id === '547975777291862057') { // if-else statement only here for develeopment
      // Header/label--introduces initiator and opponent
      await interaction.reply({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**` });

      // Game board--deleted and re-sent with each interaction from each player
      const row = createSelectMenu();
      const game = await interaction.channel.send({ content: board, components: [row] });

      handleCollector(game);

      // // Header/label--introduces initiator and opponent
      // await interaction.reply({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**` });

      // // Game board--edited with each interaction from each player
      // let row = createSelectMenu();
      // const game = await interaction.channel.send({ content: board, components: [row] });

      // // const collectorFilterA = i => i.user.id === interaction.user.id;
      // // const collectorFilterB = i => i.user.id === opponent.id;

      // const collector = game.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
      // collector.on('collect', async i => {
      //   const selection = i.values[0];
      //   if (selection === 'c1') {
      //     if (c1[c1.indexOf(b)] !== -1) {
      //       c1[c1.indexOf(b)] = r;
      //       regenerateRows();
      //       await game.delete();
      //       row = createSelectMenu();
      //       await interaction.channel.send({ content: board, components: [row] });
      //       console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column 1`);
      //     }
      //   }
      //   else if (selection === 'c2') {
      //     console.log(`[INFO] Updated Connect 4 board: ${'a'} selected column 2`);
      //   }
      //   else if (selection === 'c3') {
      //     console.log(`[INFO] Updated Connect 4 board: ${'a'} selected column 3`);
      //   }
      //   else if (selection === 'c4') {
      //     console.log(`[INFO] Updated Connect 4 board: ${'a'} selected column 4`);
      //   }
      //   else if (selection === 'c5') {
      //     console.log(`[INFO] Updated Connect 4 board: ${'a'} selected column 5`);
      //   }
      //   else if (selection === 'c6') {
      //     console.log(`[INFO] Updated Connect 4 board: ${'a'} selected column 6`);
      //   }
      //   else if (selection === 'c7') {
      //     console.log(`[INFO] Updated Connect 4 board: ${'a'} selected column 7`);
      //   }
      // });
    }
    else {
      await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
    }
  },
};
