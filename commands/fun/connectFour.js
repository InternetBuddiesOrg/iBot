const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
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

    // Create accept/deny buttons
    const accept = new ButtonBuilder()
      .setCustomId('accept')
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success);
    const deny = new ButtonBuilder()
      .setCustomId('deny')
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger);

    const confirmationRow = new ActionRowBuilder()
      .addComponents([accept, deny]);

    const acceptDis = new ButtonBuilder()
      .setCustomId('accept')
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true);
    const denyDis = new ButtonBuilder()
      .setCustomId('deny')
      .setLabel('Deny')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true);

    const confirmationRowDis = new ActionRowBuilder()
      .addComponents([acceptDis, denyDis]);


    // Header/label--introduces initiator and opponent
    const response = await interaction.reply({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**`, components: [confirmationRow] });
    const confirmationFilter = i => i.user.id === opponent.id;
    try {
      const confirmation = await response.awaitMessageComponent({ filter: confirmationFilter, time: 60_000 });

      if (confirmation.customId === 'accept') {
        confirmation.update({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# Game accepted!`, components:  [confirmationRowDis] });

        // Create select menu
        const createButtonRows = () => {
          const buttons = [
            new ButtonBuilder()
              .setCustomId('c1')
              .setLabel('1️⃣')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('c2')
              .setLabel('2️⃣')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('c3')
              .setLabel('3️⃣')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('c4')
              .setLabel('4️⃣')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('c5')
              .setLabel('5️⃣')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('c6')
              .setLabel('6️⃣')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('c7')
              .setLabel('7️⃣')
              .setStyle(ButtonStyle.Primary),
          ];

          const row1 = new ActionRowBuilder()
            .addComponents(buttons.slice(0, 4));
          const row2 = new ActionRowBuilder()
            .addComponents(buttons.slice(4));

          return [row1, row2];
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
        let currentTurn = 'a';
        let boardString;
        let boardMatrix;
        let checkDraw;
        const updateBoard = () => {
          boardMatrix = [
            [c1[5], c2[5], c3[5], c4[5], c5[5], c6[5], c7[5]],
            [c1[4], c2[4], c3[4], c4[4], c5[4], c6[4], c7[4]],
            [c1[3], c2[3], c3[3], c4[3], c5[3], c6[3], c7[3]],
            [c1[2], c2[2], c3[2], c4[2], c5[2], c6[2], c7[2]],
            [c1[1], c2[1], c3[1], c4[1], c5[1], c6[1], c7[1]],
            [c1[0], c2[0], c3[0], c4[0], c5[0], c6[0], c7[0]],
          ];
          boardString = `1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣\n**--------------------------**\n${boardMatrix.map(row => row.join(' ')).join('\n')}\n**--------------------------**`;
          checkDraw = !boardMatrix.flat().includes(b);
        };
        updateBoard();

        const checkWin = colour => {
          // Horizontal
          for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
              if (boardMatrix[row][col] === colour && boardMatrix[row][col + 1] === colour && boardMatrix[row][col + 2] === colour && boardMatrix[row][col + 3] === colour) {
                return true;
              }
            }
          }

          // Vertical
          for (let col = 0; col < 7; col++) {
            for (let row = 0; row < 3; row++) {
              if (boardMatrix[row][col] === colour && boardMatrix[row + 1][col] === colour && boardMatrix[row + 2][col] === colour && boardMatrix[row + 3][col] === colour) {
                return true;
              }
            }
          }

          // Diagonal (bottom left-top right)
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
              if (boardMatrix[row][col] === colour && boardMatrix[row + 1][col + 1] === colour && boardMatrix[row + 2][col + 2] === colour && boardMatrix[row + 3][col + 3] === colour) {
                return true;
              }
            }
          }

          // Diagonal (bottom right-top left)
          for (let row = 0; row < 3; row++) {
            for (let col = 3; col < 7; col++) {
              if (boardMatrix[row][col] === colour && boardMatrix[row + 1][col - 1] === colour && boardMatrix[row + 2][col - 2] === colour && boardMatrix[row + 3][col - 3] === colour) {
                return true;
              }
            }
          }

          return false;
        };

        const collect = async (message) => {
          const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
          collector.on('collect', async i => {
            const selection = i.customId;

            async function columnSelect(arr, name) {
              if (i.user.id === interaction.user.id && currentTurn === 'a') { // Player A
                if (arr.indexOf(b) !== -1) { // Checks if column is full
                  arr[arr.indexOf(b)] = r;
                  updateBoard();
                  if (checkWin(r)) {
                    await message.delete();
                    await interaction.channel.send(`${r} **<@${interaction.user.id}> has won!**\n${boardString}`);
                    console.log(`[INFO] @${interaction.user.username} won Connect 4`);
                    return;
                  }
                  if (checkDraw) {
                    await message.delete();
                    await interaction.channel.send(`**Draw!**\n${boardString}`);
                    console.log('[INFO] Connect 4 ended in a draw');
                    return;
                  }
                  await message.delete();
                  const newMessage = await interaction.channel.send({ content: `${y} <@${opponent.id}>'s turn.\n${boardString}`, components: createButtonRows() });
                  collect(newMessage);
                  currentTurn = 'b';
                  console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column ${name}`);
                }
                else {
                  i.reply({ content: 'Select a different column!', ephemeral: true });
                }
              }
              else if (i.user.id === opponent.id && currentTurn === 'b') { // Player B
                if (arr.indexOf(b) !== -1) {
                  arr[arr.indexOf(b)] = y;
                  updateBoard();
                  if (checkWin(y)) {
                    await message.delete();
                    await interaction.channel.send(`${y} **<@${opponent.id}> has won!**\n${boardString}`);
                    console.log(`[INFO] @${opponent.username} won Connect 4`);
                    return;
                  }
                  if (checkDraw) {
                    await message.delete();
                    await interaction.channel.send(`**Draw!**\n${boardString}`);
                    console.log('[INFO] Connect 4 ended in a draw');
                    return;
                  }
                  await message.delete();
                  const newMessage = await interaction.channel.send({ content: `${r} <@${interaction.user.id}>'s turn.\n${boardString}`, components: createButtonRows() });
                  collect(newMessage);
                  currentTurn = 'a';
                  console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column ${name}`);
                }
                else {
                  i.reply({ content: 'Select a different column!', ephemeral: true });
                }
              }
              else if (i.user.id === interaction.user.id || i.user.id === opponent.id) {
                await i.reply({ content: 'It is not your turn!', ephemeral: true });
              }
              else {
                await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
              }
            }

            switch (selection) {
            case 'c1':
              await columnSelect(c1, '1');
              break;
            case 'c2':
              await columnSelect(c2, '2');
              break;
            case 'c3':
              await columnSelect(c3, '3');
              break;
            case 'c4':
              await columnSelect(c4, '4');
              break;
            case 'c5':
              await columnSelect(c5, '5');
              break;
            case 'c6':
              await columnSelect(c6, '6');
              break;
            case 'c7':
              await columnSelect(c7, '7');
              break;
            default:
              break;
            }
          });
        };

        // Game board--deleted and re-sent with each interaction from each player
        const game = await interaction.channel.send({ content: `${r} <@${interaction.user.id}> starts.\n${boardString}`, components: createButtonRows() });
        currentTurn = 'a';
        collect(game);
      }
      else if (confirmation.customId === 'deny') {
        await confirmation.update({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# This request has been denied.`, components:  [confirmationRowDis] });
      }
    }
    catch (e) {
      console.error(e);
      await interaction.editReply({ content: `**<@${interaction.user.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# This request has expired.`, components:  [confirmationRowDis] });
      console.log('[INFO] No response recieved; cancelled');
    }
  },
};
