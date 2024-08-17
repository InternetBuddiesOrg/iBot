const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const User = require('../../sql/models/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect-four')
    .setDescription('Stupid Dumb Baby Game')
    .addUserOption(option =>
      option
        .setName('opponent')
        .setDescription('Select your opponent')
        .setRequired(true),
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');
    const initiator = interaction.user;

    if (opponent.id === initiator.id) {
      interaction.reply({ content: 'You cannot play against yourself!', ephemeral: true });
      return;
    }

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


    const response = await interaction.reply({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**`, components: [confirmationRow] });
    const confirmationFilter = i => i.user.id === opponent.id;

    try {
      const confirmation = await response.awaitMessageComponent({ filter: confirmationFilter, time: 60_000 });
      if (confirmation.customId === 'accept') {
        confirmation.update({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# Game accepted!`, components: [confirmationRowDis] });
        await startGame(interaction, initiator, opponent);
      }
      else if (confirmation.customId === 'deny') {
        await confirmation.update({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# This request has been denied.`, components: [confirmationRowDis] });
        return;
      }
    }
    catch (e) {
      await interaction.editReply({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# This request has expired.`, components: [confirmationRowDis] });
      console.log('[INFO] No response received; match cancelled');
      return;
    }
  },
};

async function confirmGame(interaction, initiator, opponent) {
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

  const response = await interaction.channel.send({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**`, components: [confirmationRow] });
  const confirmationFilter = i => i.user.id === opponent.id;

  try {
    const confirmation = await response.awaitMessageComponent({ filter: confirmationFilter, time: 60_000 });
    if (confirmation.customId === 'accept') {
      confirmation.update({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# Game accepted!`, components: [confirmationRowDis] });
      await startGame(interaction, initiator, opponent);
    }
    else if (confirmation.customId === 'deny') {
      await confirmation.update({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# This request has been denied.`, components: [confirmationRowDis] });
      return;
    }
  }
  catch (e) {
    await interaction.editReply({ content: `**<@${initiator.id}> challenges <@${opponent.id}> to a game of Connect 4!**\n-# This request has expired.`, components: [confirmationRowDis] });
    console.log('[INFO] No response received; match cancelled');
    return;
  }
}

async function startGame(interaction, playerA, playerB) {
  const rematchFilter = i => i.user.id === playerB.id || i.user.id === playerA.id;
  const createButtonRows = () => {
    const buttons = [];

    const columns = {
      c1: c1,
      c2: c2,
      c3: c3,
      c4: c4,
      c5: c5,
      c6: c6,
      c7: c7,
    };

    Object.keys(columns).forEach((col, index) => {
      const label = (index + 1).toString();
      const button = new ButtonBuilder()
        .setCustomId(col)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary);

      if (!columns[col].includes(b)) {
        button.setDisabled(true);
      }

      buttons.push(button);
    });

    const row1 = new ActionRowBuilder().addComponents(buttons.slice(0, 4));
    const row2 = new ActionRowBuilder().addComponents(buttons.slice(4));
    return [row1, row2];
  };

  const playAgain = new ButtonBuilder()
    .setCustomId('rematch')
    .setLabel('🔄️Play again?')
    .setStyle(ButtonStyle.Secondary);
  const rematchRow = new ActionRowBuilder()
    .addComponents([playAgain]);
  const playAgainDis = new ButtonBuilder()
    .setCustomId('rematch')
    .setLabel('🔄️Play again?')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);
  const rematchRowDis = new ActionRowBuilder()
    .addComponents([playAgainDis]);

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
  let lastMove;

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

  const collect = async message => {
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

    collector.on('collect', async i => {
      const selection = i.customId;
      lastMove = i.customId[1];

      const columnSelect = async (arr, name) => {
        if (i.user.id === playerA.id && currentTurn === 'a') { // Player A
          arr[arr.indexOf(b)] = r;
          updateBoard();

          if (checkWin(r)) {
            await i.message.delete();

            const [winner] = await User.findOrCreate({ where: { id: await playerA.id } });
            const [loser] = await User.findOrCreate({ where: { id: await playerB.id } });
            await winner.increment('wins', { by: 1 });
            await loser.increment('losses', { by: 1 });

            const end = await i.message.channel.send({ content: `${r} **<@${playerA.id}> has won!**\n${boardString}`, components: [] });
            setTimeout(async () => {
              await end.edit({ content: `${r} **<@${playerA.id}> has won!**\n${boardString}`, components: [rematchRow] });
              console.log(`[INFO] @${playerA.username} won Connect 4 (${winner.wins + 1} total wins)`);

              // Rematch logic
              try {
                const rematchConf = await end.awaitMessageComponent({ filter: rematchFilter, time: 60_000 });
                if (rematchConf.customId === 'rematch') {
                  console.log(`[INFO] @${rematchConf.user.username} initiated a rematch`);
                  await end.edit({ content: `${r} **<@${playerA.id}> has won!**\n${boardString}\n-# Rematch requested!`, components: [] });
                  await confirmGame(interaction, rematchConf.user, rematchConf.user === playerA ? playerB : playerA);
                }
              }
              catch (e) {
                console.log('[INFO] No response recieved; rematch cancelled');
                await end.edit({ content: `${r} **<@${playerA.id}> has won!**\n${boardString}\n-# Rematch time expired.`, components: [rematchRowDis] });
                return;
              }

              return;
            }, 500);
          }
          else if (checkDraw) {
            await i.message.delete();
            const end = await i.message.channel.send({ content: `**Draw!**\n${boardString}`, components: [] });
            setTimeout(async () => {
              await end.edit({ content: `**Draw!**\n${boardString}`, components: [rematchRow] });
              console.log('[INFO] Connect 4 ended in a draw');

              // Rematch logic
              try {
                const rematchConf = await end.awaitMessageComponent({ filter: rematchFilter, time: 60_000 });
                if (rematchConf.customId === 'rematch') {
                  console.log(`[INFO] @${rematchConf.user.username} initiated a rematch`);
                  await end.edit({ content: `**Draw!**\n${boardString}\n-# Rematch requested!`, components: [] });
                  await confirmGame(interaction, rematchConf.user, rematchConf.user === playerA ? playerB : playerA);
                }
              }
              catch (e) {
                console.log('[INFO] No response recieved; rematch cancelled');
                await end.edit({ content: `**Draw!**\n${boardString}\n-# Rematch time expired.`, components: [rematchRowDis] });
                return;
              }

              return;
            }, 500);
          }
          else {
            currentTurn = 'b';
            await i.deferUpdate();
            await i.message.edit({ content: `${y} <@${playerB.id}>'s turn.\n${boardString}\n-# ${i.guild.members.cache.get(playerA.id).nickname || playerA.displayName}'s last move was in column ${lastMove}`, components: createButtonRows() });
            console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column ${name}`);
          }
        }
        else if (i.user.id === playerB.id && currentTurn === 'b') { // Player B
          arr[arr.indexOf(b)] = y;
          updateBoard();

          if (checkWin(y)) {

            const [winner] = await User.findOrCreate({ where: { id: await playerB.id } });
            const [loser] = await User.findOrCreate({ where: { id: await playerA.id } });
            await winner.increment('wins', { by: 1 });
            await loser.increment('losses', { by: 1 });

            await i.message.delete();
            const end = await i.message.channel.send({ content: `${y} **<@${playerB.id}> has won!**\n${boardString}`, components: [] });
            setTimeout(async () => {
              await end.edit({ content: `${y} **<@${playerB.id}> has won!**\n${boardString}`, components: [rematchRow] });
              console.log(`[INFO] @${playerB.username} won Connect 4 (${winner.wins + 1} total points)`);

              // Rematch logic
              try {
                const rematchConf = await end.awaitMessageComponent({ filter: rematchFilter, time: 60_000 });
                if (rematchConf.customId === 'rematch') {
                  console.log(`[INFO] @${rematchConf.user.username} initiated a rematch`);
                  await end.edit({ content: `${y} **<@${playerB.id}> has won!**\n${boardString}\n-# Rematch requested!`, components: [] });
                  await confirmGame(interaction, rematchConf.user, rematchConf.user === playerA ? playerB : playerA);
                }
              }
              catch (e) {
                console.log('[INFO] No response recieved; rematch cancelled');
                await end.edit({ content: `${y} **<@${playerB.id}> has won!**\n${boardString}\n-# Rematch time expired.`, components: [rematchRowDis] });
                return;
              }

              return;
            }, 500);
          }
          else if (checkDraw) {
            await i.message.delete();
            const end = await i.message.channel.send({ content: `**Draw!**\n${boardString}`, components: [] });
            setTimeout(async () => {
              await end.edit({ content: `**Draw!**\n${boardString}`, components: [rematchRow] });
              console.log('[INFO] Connect 4 ended in a draw');

              // Rematch logic
              try {
                const rematchConf = await end.awaitMessageComponent({ filter: rematchFilter, time: 60_000 });
                if (rematchConf.customId === 'rematch') {
                  console.log(`[INFO] @${rematchConf.user.username} initiated a rematch`);
                  await end.edit({ content: `**Draw!**\n${boardString}\n-# Rematch requested!`, components: [] });
                  await confirmGame(interaction, rematchConf.user, rematchConf.user === playerA ? playerB : playerA);
                }
              }
              catch (e) {
                console.log('[INFO] No response recieved; rematch cancelled');
                await end.edit({ content: `**Draw!**\n${boardString}\n-# Rematch time expired.`, components: [rematchRowDis] });
                return;
              }

              return;
            }, 500);
          }
          else {
            currentTurn = 'a';
            await i.deferUpdate();
            await i.message.edit({ content: `${r} <@${playerA.id}>'s turn.\n${boardString}\n-# ${i.guild.members.cache.get(playerB.id).nickname || playerB.displayName}'s last move was in column ${lastMove}`, components: createButtonRows() });
            console.log(`[INFO] Updated Connect 4 board: @${i.user.username} selected column ${name}`);
          }
        }
        else if (i.user.id === playerA.id || i.user.id === playerB.id) {
          await i.reply({ content: 'It is not your turn!', ephemeral: true });
        }
        else {
          await i.reply({ content: 'You are not a part of this game!', ephemeral: true });
        }
      };

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

  const game = await interaction.followUp({ content: `${r} <@${playerA.id}> starts.\n${boardString}`, components: createButtonRows() });
  currentTurn = 'a';
  collect(game);
}
