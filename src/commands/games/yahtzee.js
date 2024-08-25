const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} = require('discord.js');
const User = require('../../sql/models/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gyattzee')
    .setDescription('Gyatt dice')
    .addSubcommand(sub =>
      sub
        .setName('solo')
        .setDescription('Singleplayer Gyatt dice'),
    )
    .addSubcommand(sub =>
      sub
        .setName('multi')
        .setDescription('Multiplayer Gyatt dice')
        .addUserOption(option =>
          option
            .setName('opponent-1')
            .setDescription('Select an opponent')
            .setRequired(true),
        )
        .addUserOption(option =>
          option
            .setName('opponent-2')
            .setDescription('Select another opponent (optional)'),
        )
        .addUserOption(option =>
          option
            .setName('opponent-3')
            .setDescription('Select another opponent (optional)'),
        )
        .addUserOption(option =>
          option
            .setName('opponent-4')
            .setDescription('Select another opponent (optional)'),
        )
        .addUserOption(option =>
          option
            .setName('opponent-5')
            .setDescription('Select another opponent (optional)'),
        ),
    ),

  async execute(interaction) {
    // Dice emoji arrays
    const diceEmojis = [
      '<:d1:1273785081860980747>',
      '<:d2:1273785008292630570>',
      '<:d3:1273786004972638238>',
      '<:d4:1273785100143689799>',
      '<:d5:1273785115406766110>',
      '<:d6:1273785062441226331>',
    ];
    // eslint-disable-next-line no-unused-vars
    const selectedEmojis = [
      '<:d1s:1274162501013082225>',
      '<:d2s:1274162513566498877>',
      '<:d3s:1274162525788700762>',
      '<:d4s:1274162537289617489>',
      '<:d5s:1274162548270170162>',
      '<:d6s:1274162559536336917>',
    ];
    const rollingEmojis = [
      '<a:d1rwhite:1274513877706604554>',
      '<a:d2rwhite:1277050866339414118>',
      '<a:d3rwhite:1277050904788471901>',
      '<a:d4rwhite:1277050916154904687>',
      '<a:d5rwhite:1277050927051964507>',
    ];

    const rollingDice = `# **|${rollingEmojis[0]}|${rollingEmojis[1]}|${rollingEmojis[2]}|${rollingEmojis[3]}|${rollingEmojis[4]}|**`;

    const availableScores = [
      { name: 'Aces', num: 'rollValueAces', value: 'aces' },
      { name: 'Deuces', num: 'rollValueDeuces', value: 'deuces' },
      { name: 'Threes', num: 'rollValueThrees', value: 'threes' },
      { name: 'Fours', num: 'rollValueFours', value: 'fours' },
      { name: 'Fives', num: 'rollValueFives', value: 'fives' },
      { name: 'Sixes', num: 'rollValueSixes', value: 'sixes' },
      { name: 'Choice', num: 'rollValueChoice', value: 'choice' },
      { name: 'Three of a kind', num: 'rollValueTOAK', value: 'toak' },
      { name: 'Four of a kind', num: 'rollValueFOAK', value: 'foak' },
      { name: 'Full House', num: 'rollValueFH', value: 'fh' },
      { name: 'Small Straight', num: 'rollValueSS', value: 'ss' },
      { name: 'Large Straight', num: 'rollValueLS', value: 'ls' },
      { name: 'Gyattzee', num: 'rollValueY', value: 'y' },
    ];
    const placedScores = [];

    function getDice() {
      return diceEmojis[Math.floor(Math.random() * 6)];
    }
    function clearDice(number) {
      return rollingEmojis[number];
    }

    // Solo Gyattzee:

    if (interaction.options.getSubcommand() === 'solo') {

      // * Scorecard
      const scores = {
        aces: null,
        deuces: null,
        threes: null,
        fours: null,
        fives:  null,
        sixes: null,
        bonus: null,

        choice: null,
        toak: null,
        foak: null,
        fh: null,
        ss: null,
        ls: null,
        y: null,
      };
      let totals = {};

      const generateScorecardDescription = () => {
        totals = {
          upper: scores.aces + scores.deuces + scores.threes + scores.fours + scores.fives + scores.sixes,
          lower: scores.choice + scores.toak + scores.foak + scores.fh + scores.ss + scores.ls + scores.y,
          final: scores.choice + scores.toak + scores.foak + scores.fh + scores.ss + scores.ls + scores.y + scores.aces + scores.deuces + scores.threes + scores.fours + scores.fives + scores.sixes + scores.bonus,
        };

        // Check bonus
        const bonusCheckArray = [ // template used to check which scores are still unplaced
          { name: 'Aces', num: 'rollValueAces', value: 'aces' },
          { name: 'Deuces', num: 'rollValueDeuces', value: 'deuces' },
          { name: 'Threes', num: 'rollValueThrees', value: 'threes' },
          { name: 'Fours', num: 'rollValueFours', value: 'fours' },
          { name: 'Fives', num: 'rollValueFives', value: 'fives' },
          { name: 'Sixes', num: 'rollValueSixes', value: 'sixes' },
        ];
        if (bonusCheckArray.every(score => placedScores.some(placedScore => placedScore.value === score.value))) {
          if (totals.upper >= 63) {
            scores.bonus = 35;
          }
          else {
            scores.bonus = 0;
          }
        }

        return '# __*Gyattzee!*__\n' +
               `\`           Aces:\` ${scores.aces !== null ? scores.aces : ''}\n` +
               `\`         Deuces:\` ${scores.deuces !== null ? scores.deuces : ''}\n` +
               `\`         Threes:\` ${scores.threes !== null ? scores.threes : ''}\n` +
               `\`          Fours:\` ${scores.fours !== null ? scores.fours : ''}\n` +
               `\`          Fives:\` ${scores.fives !== null ? scores.fives : ''}\n` +
               `\`          Sixes:\` ${scores.sixes !== null ? scores.sixes : ''}\n` +
               `\`(${totals.upper.toString().padStart(2, '0')}/63)   Bonus:\` ${scores.bonus !== null ? scores.bonus : ''}\n` +
               `**\`    UPPER TOTAL:\` ${totals.upper + scores.bonus}**\n\n` +

               `\`         Choice:\` ${scores.choice !== null ? scores.choice : ''}\n` +
               `\`Three of a kind:\` ${scores.toak !== null ? scores.toak : ''}\n` +
               `\` Four of a kind:\` ${scores.foak !== null ? scores.foak : ''}\n` +
               `\`     Full House:\` ${scores.fh !== null ? scores.fh : ''}\n` +
               `\` Small Straight:\` ${scores.ss !== null ? scores.ss : ''}\n` +
               `\` Large Straight:\` ${scores.ls !== null ? scores.ls : ''}\n` +
               `\`       Gyattzee:\` ${scores.y !== null ? scores.y : ''}\n` +
               `**\`    LOWER TOTAL:\` ${totals.lower}**\n\n` +

               `## \`FINAL SCORE:\` ${totals.final}`;
      };
      const guildMember = interaction.guild.members.cache.get(interaction.user.id);
      const scorecardEmbed = new EmbedBuilder()
        .setColor(interaction.client.embedColour)
        .setAuthor({
          name: `${guildMember.nickname || interaction.user.displayName}'s scorecard`,
          iconURL: guildMember.displayAvatarURL(),
        })
        // TODO: use image manpulation for scorecard instead
        .setDescription(generateScorecardDescription());

      await interaction.reply({ embeds: [scorecardEmbed] });

      // --------------------------------------------------------------------------------------- //

      // * Dice roll

      // Create buttons

      // 'Roll!' button => used in dice rolling animation message
      const createRollButton = (disabled = false) => {
        const button = new ButtonBuilder()
          .setCustomId('roll')
          .setLabel('Roll!')
          .setStyle(ButtonStyle.Primary);
        if (disabled) { // ! Unused
          button.setDisabled(true);
        }
        return new ActionRowBuilder().addComponents(button);
      };
      const rollRow = createRollButton();

      // Buttons 1 - 5 => used in dice selection message
      let selectedStates = [false, false, false, false, false];
      const createSelectionButtons = (disabled = false) => {
        const diceButtons = [];
        for (let i = 1; i <= 5; i++) {
          const button = new ButtonBuilder()
            .setCustomId(i.toString())
            .setLabel(i.toString())
            .setStyle(ButtonStyle.Primary);
          if (selectedStates[i - 1] === true) {
            button
              .setCustomId(i.toString() + 's')
              .setStyle(ButtonStyle.Success);
          }
          if (disabled) {
            button.setDisabled(true);
          }
          diceButtons.push(button);
        }
        return new ActionRowBuilder().addComponents(diceButtons);
      };
      let selectionRow = createSelectionButtons();

      // 'Reroll' button => used in dice selection message
      let rollCount = 0;
      const createRerollButton = (disabled = false) => {
        const button = new ButtonBuilder()
          .setCustomId('reroll')
          .setLabel(`Reroll (${rollCount === 1 ? '2 left' : '1 left'})`)
          .setStyle(ButtonStyle.Danger);
        if (disabled) {
          button
            .setDisabled(true)
            .setLabel('Deselect to reroll');
        }
        if (rollCount === 3) {
          button
            .setDisabled(true)
            .setLabel('No rerolls left');
        }
        return new ActionRowBuilder().addComponents(button);
      };
      let rerollRow = createRerollButton();

      // * Score Menu -- @MrCologne + @Zaappy

      // Scoring Conditions (checks for rolls that can be scored e.g. fh, aces, y, etc.)
      // eslint-disable-next-line no-unused-vars
      let rollValueAces = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueDeuces = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueThrees = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueFours = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueFives = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueSixes = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueChoice = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueTOAK = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueFOAK = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueFH = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueSS = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueLS = 0;
      // eslint-disable-next-line no-unused-vars
      let rollValueY = 0;

      const resetRollValues = () => {
        rollValueAces = 0;
        rollValueDeuces = 0;
        rollValueThrees = 0;
        rollValueFours = 0;
        rollValueFives = 0;
        rollValueSixes = 0;
        rollValueChoice = 0;
        rollValueTOAK = 0;
        rollValueFOAK = 0;
        rollValueFH = 0;
        rollValueSS = 0;
        rollValueLS = 0;
        rollValueY = 0;
      };

      let diceValues = [];
      const checkScore = () => {
        resetRollValues();

        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        diceValues.forEach(el => counts[el]++);

        const rollValues = {
          1: () => rollValueAces += counts[1],
          2: () => rollValueDeuces += counts[2] * 2,
          3: () => rollValueThrees += counts[3] * 3,
          4: () => rollValueFours += counts[4] * 4,
          5: () => rollValueFives += counts[5] * 5,
          6: () => rollValueSixes += counts[6] * 6,
        };

        Object.keys(rollValues).forEach(key => rollValues[key]());
        const countValues = Object.values(counts);
        rollValueChoice = diceValues.reduce((acc, num) => acc + num, 0);
        rollValueTOAK = countValues.some(count => count >= 3) ? diceValues.reduce((acc, num) => acc + num, 0) : 0;
        rollValueFOAK = countValues.some(count => count >= 4) ? diceValues.reduce((acc, num) => acc + num, 0) : 0;
        rollValueY = countValues.some(count => count === 5) ? 50 : 0;

        const checkFullHouse = () => {
          let check3 = false, check2 = false;
          for (const count of Object.values(counts)) {
            if (count === 3) check3 = true;
            if (count === 2) check2 = true;
          }
          if (check3 && check2) rollValueFH = 25;
        };
        checkFullHouse();

        const checkStraight = (cases) => {
          for (const straight of cases) {
            if (straight.every(el => diceValues.includes(el))) {
              // ? wait so is it like 4:30 or 4:40 like my clock says 5:26 so (angel moment)
              return straight.length === 4 ? 30 : 40;
            }
          }
          return 0;
        };
        rollValueSS = checkStraight([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]]);
        rollValueLS = checkStraight([[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]);
      };


      const scoringMenuOption = (label, score, value) => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(label)
          .setDescription(score)
          .setValue(value);
      };
      const availableOptions = () => {
        const options = [];
        if (availableScores.length !== 0) {
          availableScores.forEach(el => {
            options.push(scoringMenuOption(el.name, `${eval(el.num)} points`, el.value));
          });
        }
        else {
          options.push(scoringMenuOption('No more values', 'No more values', 'nmv'));
        }
        return options;
      };
      const createScoreMenu = () => {
        const menu = new StringSelectMenuBuilder()
          .setCustomId('sm')
          .setPlaceholder('⭐️ Select your scoring option! ⭐️')
          .addOptions(availableOptions());
        if (availableOptions()[0].data.value === 'nmv') {
          menu.setDisabled(true);
        }
        return new ActionRowBuilder().addComponents(menu);
      };
      let scoreMenu = createScoreMenu();

      // Send dice rolling animation message and create its button collector

      let turnCount = 0;
      const rollMsg = await interaction.channel.send({
        content: `${rollingDice}\n**Click to roll!**`,
        components: [rollRow],
      });
      const collectorFilter = i => i.user.id === interaction.user.id;
      const rollMsgRollButtonCollector = rollMsg.createMessageComponentCollector({ componentType: ComponentType.Button, filter: collectorFilter, time: 3_600_000 });

      let d1;
      let d2;
      let d3;
      let d4;
      let d5;
      let rolled;
      let saved = [];


      // * Collector for 'Roll!' and 'Reroll' buttons
      rollMsgRollButtonCollector.on('collect', async i => {
        if (i.customId === 'roll') {
          rollCount++;

          d1 = saved.includes('1') ? d1 : getDice();
          d2 = saved.includes('2') ? d2 : getDice();
          d3 = saved.includes('3') ? d3 : getDice();
          d4 = saved.includes('4') ? d4 : getDice();
          d5 = saved.includes('5') ? d5 : getDice();
          rolled = `# **|${d1}|${d2}|${d3}|${d4}|${d5}|**`;

          diceValues = [];
          for (let dice = 1; dice < 6; dice++) {
            diceValues.push(Number(eval(`d${dice}`).charAt(3)));
          }

          checkScore();
          scoreMenu = createScoreMenu();
          rerollRow = createRerollButton();
          if (rollCount === 3) {
            selectionRow = createSelectionButtons(true);
            await i.update({
              content: `${rolled}`,
              components: [selectionRow, scoreMenu, rerollRow],
            });
          }
          else {
            await i.update({
              content: `${rolled}\n**Select which dice to keep**`,
              components: [selectionRow, scoreMenu, rerollRow],
            });
          }
        }
        else if (i.customId === 'reroll') {
          d1 = saved.includes('1') ? d1 : clearDice(0);
          d2 = saved.includes('2') ? d2 : clearDice(1);
          d3 = saved.includes('3') ? d3 : clearDice(2);
          d4 = saved.includes('4') ? d4 : clearDice(3);
          d5 = saved.includes('5') ? d5 : clearDice(4);
          rolled = `# **|${d1}|${d2}|${d3}|${d4}|${d5}|**`;

          await i.update({
            content: `${rolled}\n**Click to roll!**`,
            components: [rollRow],
          });
        }
      });

      let endMsg;
      rollMsgRollButtonCollector.on('end', async () => {
        if (!endMsg) {
          await rollMsg.edit({
            content: '-# This game has expired',
            components: [],
          });
        }
      });

      // * Collector for Buttons 1 - 5
      const rollMsgSelectionButtonCollector = rollMsg.createMessageComponentCollector({ componentType: ComponentType.Button, filter: collectorFilter, time: 3_600_000 });
      rollMsgSelectionButtonCollector.on('collect', async i => {
        const updateRollMsg = async select => {
          if (select) {
            saved.push(i.customId);
            eval(`d${i.customId} = selectedEmojis[diceEmojis.indexOf(d${i.customId})];`);
            selectedStates[Number(i.customId) - 1] = select;
          }
          else {
            saved = saved.filter(item => item !== i.customId.substring(0, 1));
            eval(`d${i.customId.substring(0, 1)} = diceEmojis[selectedEmojis.indexOf(d${i.customId.substring(0, 1)})];`);
            selectedStates[Number(i.customId.substring(0, 1)) - 1] = select;
          }

          rolled = `# **|${d1}|${d2}|${d3}|${d4}|${d5}|**`;

          selectionRow = createSelectionButtons();
          rerollRow = createRerollButton();
          if (['1', '2', '3', '4', '5'].every(entry => saved.includes(entry))) {
            rerollRow = createRerollButton(true);
          }
          scoreMenu = createScoreMenu();

          await i.update({
            content: `${rolled}\n**Select which dice to keep**`,
            components: [selectionRow, scoreMenu, rerollRow],
          });
        };

        switch (i.customId) {
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            updateRollMsg(true);
            break;

          case '1s':
          case '2s':
          case '3s':
          case '4s':
          case '5s':
            updateRollMsg(false);
            break;
        }
      });
      // * Resets the previous round.
      const resetRound = () => {
        turnCount++;
        d1 = rollingEmojis[0],
        d2 = rollingEmojis[1],
        d3 = rollingEmojis[2],
        d4 = rollingEmojis[3],
        d5 = rollingEmojis[4];
        saved = [];
        rollCount = 0;
        selectedStates = [];
        selectionRow = createSelectionButtons();
      };

      // * Collector for Score Menu
      const rollMsgSelectCollector = rollMsg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: collectorFilter, time: 3_600_000 });

      rollMsgSelectCollector.on('collect', async i => {
        // Updates The Score Menu and removes options after they have been placed.
        const menuSelectionId = i.values[0];
        const menuSelectionArrIndex = availableScores.findIndex(score => score.value === menuSelectionId);
        const menuSelectionRollValue = eval(availableScores[menuSelectionArrIndex].num);
        const menuSelectionName = availableScores[menuSelectionArrIndex].name;
        const removedScore = availableScores.splice(menuSelectionArrIndex, 1);

        scores[menuSelectionId] = menuSelectionRollValue;
        placedScores.push(removedScore[0]);
        scoreMenu = createScoreMenu();
        resetRound();

        scorecardEmbed.setDescription(generateScorecardDescription());

        await interaction.editReply({ embeds: [scorecardEmbed] });

        if (turnCount === 13) {
          const [player] = await User.findOrCreate({ where: { id: await interaction.user.id } });
          await player.increment('yahtzeeTotalScore', { by: totals.final });
          if (player.yahtzeeHighScore < totals.final) {
            await player.update({ yahtzeeHighScore: totals.final });
          }

          endMsg = await i.update({
            content: `**You finished with __${totals.final}__ points!**`,
            components: [],
          });
        }
        else {
          await i.update({
            content: `${rollingDice}\n` +
            `-# Scored **${menuSelectionName}** for __${menuSelectionRollValue}__ points!\n\n` +
            '**Click to Roll!**',
            components: [rollRow],
          });
        }
      });
    }

    // * Multiplayer Gyattzee:

    // else if (interaction.options.getSubcommand() === 'multi') {

    //   // WIP & nae nae

    //   const opponent1 = interaction.options.getUser('opponent-1');
    //   const opponent2 = interaction.options.getUser('opponent-2') ?? null;
    //   const opponent3 = interaction.options.getUser('opponent-3') ?? null;
    //   const opponent4 = interaction.options.getUser('opponent-4') ?? null;
    //   const opponent5 = interaction.options.getUser('opponent-5') ?? null;

    //   const embed = new EmbedBuilder()
    //     .setColor(interaction.client.embedColour)
    //     .setAuthor({
    //       name: `${guildMember.nickname || interaction.user.displayName} initiated a game of Gyattzee!`,
    //       iconURL: guildMember.displayAvatarURL(),
    //     })
    //     .setDescription(`Opponent 1: ${opponent1}\nOpponent 2: ${opponent2}\nOpponent 3: ${opponent3}\nOpponent 4: ${opponent4}\nOpponent 5: ${opponent5}`);

    //   interaction.reply({ embeds: [embed] });
    // }
  },
};
