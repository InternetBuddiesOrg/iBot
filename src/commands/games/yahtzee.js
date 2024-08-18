const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yahtzee')
    .setDescription('Gyattzee')
    .addSubcommand(sub =>
      sub
        .setName('solo')
        .setDescription('Singleplayer Gyattzee'),
    )
    .addSubcommand(sub =>
      sub
        .setName('multi')
        .setDescription('Multiplayer Gyattzee')
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
    const guildMember = interaction.guild.members.cache.get(interaction.user.id);
    const diceEmojis = [
      '<:d1:1273785081860980747>',
      '<:d2:1273785008292630570>',
      '<:d3:1273786004972638238>',
      '<:d4:1273785100143689799>',
      '<:d5:1273785115406766110>',
      '<:d6:1273785062441226331>',
    ];
    const selectedEmojis = [
      '<:d1s:1274162501013082225>',
      '<:d2s:1274162513566498877>',
      '<:d3s:1274162525788700762>',
      '<:d4s:1274162537289617489>',
      '<:d5s:1274162548270170162>',
      '<:d6s:1274162559536336917>',
    ];
    const rollingEmojis = [
      '<a:d1r:1274513877706604554>',
      '<a:d2r:1274513892000923729>',
      '<a:d3r:1274513903120023643>',
      '<a:d4r:1274513911110041695>',
      '<a:d5r:1274513923143499779>',
    ];
    function getDice() {
      return diceEmojis[Math.floor(Math.random() * 6)];
    }

    if (interaction.options.getSubcommand() === 'solo') {

      // Scorecard
      // ! Temporary eslint overrides
      // eslint-disable-next-line prefer-const
      let aces = 0;
      // eslint-disable-next-line prefer-const
      let deuces = 0;
      // eslint-disable-next-line prefer-const
      let threes = 0;
      // eslint-disable-next-line prefer-const
      let fours = 0;
      // eslint-disable-next-line prefer-const
      let fives = 0;
      // eslint-disable-next-line prefer-const
      let sixes = 0;
      // eslint-disable-next-line prefer-const
      let chance = 0;
      // eslint-disable-next-line prefer-const
      let toak = 0;
      // eslint-disable-next-line prefer-const
      let foak = 0;
      // eslint-disable-next-line prefer-const
      let fh = 0;
      // eslint-disable-next-line prefer-const
      let ss = 0;
      // eslint-disable-next-line prefer-const
      let ls = 0;
      // eslint-disable-next-line prefer-const
      let y = 0;
      const scorecard = `\`Aces:\` ${aces}\n\`Deuces:\` ${deuces}\n\`Threes:\` ${threes}\n\`Fours:\` ${fours}\n\`Fives:\` ${fives}\n\`Sixes:\` ${sixes}\n\`Bonus:\`\n\`UPPER TOTAL:\`\n\n\`Chance:\` ${chance}\n\`3 of a kind:\` ${toak}\n\`4 of a kind:\` ${foak}\n\`Full House:\` ${fh}\n\`Small Straight:\` ${ss}\n\`Large Straight:\` ${ls}\n\`Gyatt:\` ${y}\n\`Gyatt Bonus:\`\n\`LOWER TOTAL:\`\n\n\`FINAL SCORE:\``;
      const embed = new EmbedBuilder()
        .setColor(interaction.client.embedColour)
        .setAuthor({
          name: `${guildMember.nickname || interaction.user.displayName}'s Gyattzee scorecard`,
          iconURL: guildMember.displayAvatarURL(),
        })
        .setDescription(scorecard);

      // ! Temporary eslint override
      // eslint-disable-next-line no-unused-vars
      const scoreMsg = await interaction.reply({ embeds: [embed] });


      // Dice roll
      const rollButton = new ButtonBuilder()
        .setCustomId('roll')
        .setLabel('Roll!')
        .setStyle(ButtonStyle.Primary);
      const rollRow = new ActionRowBuilder().addComponents(rollButton);

      const createButtons = selectedStates => {
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

          diceButtons.push(button);
        }
        return new ActionRowBuilder().addComponents(diceButtons);
      };

      const selectedStates = [false, false, false, false, false];
      let diceRow = createButtons(selectedStates);

      const rerollButton = new ButtonBuilder()
        .setCustomId('reroll')
        .setLabel('Reroll')
        .setStyle(ButtonStyle.Danger);
      const doneButton = new ButtonBuilder()
        .setCustomId('done')
        .setLabel('Done')
        .setStyle(ButtonStyle.Success);

      let confirmRow = new ActionRowBuilder().addComponents(doneButton, rerollButton);
      // const createConfirmRow = (skipState, doneState) => {
      //   if (skipState) {
      //   }
      // return new ActionRowBuilder().addComponents(skipButton);
      // };
      // TODO: make a function that creates an action row with 'reroll' and 'done' buttons => https://discord.com/channels/1099515789192740985/1099564476698726401/1274548185553174660

      const collectorFilter = i => i.user.id === interaction.user.id;
      const rollMsg = await interaction.channel.send({ content: `## __*Gyattzee!*__\n# ${rollingEmojis[0]} ${rollingEmojis[1]} ${rollingEmojis[2]} ${rollingEmojis[3]} ${rollingEmojis[4]}\n-# Click to roll!`, components: [rollRow] });

      let d1;
      let d2;
      let d3;
      let d4;
      let d5;
      let rolled;
      let saved = [];

      const rollMsgCollector = rollMsg.createMessageComponentCollector({ filter: collectorFilter, time: 3_600_000 });

      const diceRoll = async savedArr => {
        try {
          rollMsgCollector.on('collect', async i => {
            if (i.customId === 'roll') {
              d1 = savedArr.includes('1') ? d1 : getDice();
              d2 = savedArr.includes('2') ? d2 : getDice();
              d3 = savedArr.includes('3') ? d3 : getDice();
              d4 = savedArr.includes('4') ? d4 : getDice();
              d5 = savedArr.includes('5') ? d5 : getDice();
              rolled = `# ${d1} ${d2} ${d3} ${d4} ${d5}`;

              await i.update({
                content:`## __*Gyattzee!*__\n${rolled}\n-# Select which dice to keep`,
                components: [diceRow, confirmRow],
              });
            }
          });
        }
        catch (e) {
          console.error(e);
        }
      };

      diceRoll(saved);

      try {
        rollMsgCollector.on('collect', async i => {
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


            // TODO: replace confirmRow with a function to change setDisabled
            rolled = `# ${d1} ${d2} ${d3} ${d4} ${d5}`;
            diceRow = createButtons(selectedStates);
            confirmRow = new ActionRowBuilder().addComponents(doneButton, rerollButton);

            await i.update({ content: `## __*Gyattzee!*__\n${rolled}\n-# Select which dice to keep`, components: [diceRow, confirmRow] });
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

        // @MrCologne
        // Scoring Menu
        // TODO: Scoring Menu Outline
        const scoringSelectionMenu = new StringSelectMenuBuilder()
          .setCustomId('sm')
          .setPlaceholder('⭐️ Select your scoring option! ⭐️')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Aces')
              .setDescription('[placeholder value]')
              .setValue('aces'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Deuces')
              .setDescription('[placeholder value]')
              .setValue('deuces'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Threes')
              .setDescription('[placeholder value]')
              .setValue('threes'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Fours')
              .setDescription('[placeholder value]')
              .setValue('fours'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Fives')
              .setDescription('[placeholder value]')
              .setValue('fives'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Sixes')
              .setDescription('[placeholder value]')
              .setValue('sixes'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Choice')
              .setDescription('[placeholder value]')
              .setValue('choice'),
            new StringSelectMenuOptionBuilder()
              .setLabel('3 of a kind')
              .setDescription('[placeholder value]')
              .setValue('toak'),
            new StringSelectMenuOptionBuilder()
              .setLabel('4 of a kind')
              .setDescription('[placeholder value]')
              .setValue('foak'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Full House')
              .setDescription('[placeholder value]')
              .setValue('fh'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Small Straight')
              .setDescription('[placeholder value]')
              .setValue('ss'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Large Straight')
              .setDescription('[placeholder value]')
              .setValue('ls'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Gyatt')
              .setDescription('[placeholder value]')
              .setValue('y'),
          );
        let scoringMenu = new ActionRowBuilder()
          .addComponents(scoringSelectionMenu);
        rollMsgCollector.on('collect', async i => {
          if (i.customId === 'done') {
            await i.update({ content: `## __*Gyattzee!*__\nYour roll: ${rolled.substring(2, rolled.length)}`,
              components: [scoringMenu] });
          }
        });

      }
      catch (e) {
        console.error(e);
      }
    }
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
