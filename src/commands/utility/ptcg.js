import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import Pokemon from '../../sql/models/pokemon.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * @type {Object<string, string>}
 */
const emojis = JSON.parse(readFileSync(join(__dirname, '../../emojis.json'), 'utf8'));


export const data = new SlashCommandBuilder()
  // /pokémon
  .setName('pokémon')
  .setDescription('Pokémon TCG commands')
  // .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
  //   // /pokémon collection
  //   .setName('collection')
  //   .setDescription('Manage your Pokémon TCG collection')
  //   .addSubcommand(new SlashCommandSubcommandBuilder()
  //     // /pokémon collection add <card>
  //     .setName('add')
  //     .setDescription('Add a card to your Pokémon TCG collection'),
  //   )
  //   .addSubcommand(new SlashCommandSubcommandBuilder()
  //     // /pokémon collection remove <card>
  //     .setName('remove')
  //     .setDescription('Remove a card from your Pokémon TCG collection'),
  //   ),
  // )
  .addSubcommand(new SlashCommandSubcommandBuilder()
    // /pokémon view <expansion>
    .setName('view')
    .setDescription('View a Pokémon TCG expansion set')
    .addStringOption(option => option
      .setName('expansion')
      .setDescription('The expansion set to view')
      .addChoices(
        { name: 'Perfect Order', value: 'POR' },
      )
      .setRequired(true),
    ),
  );

/**
 * @param {CommandInteraction} interaction The command interaction from Discord
 */
export async function execute(interaction) {

  // * START /pokémon view
  if (interaction.options.getSubcommand() === 'view') {
    await interaction.deferReply();

    const expansion = await interaction.options.getString('expansion');
    let currentCardNum = 1;
    // let cardEmbed;
    let selectorRow;
    let container;

    /**
     * @returns {Array<{
     *   name: string,
     *   id: string,
     *   expansion: string,
     *   number: string,
     *   rarity: string,
     *   hp: number | null,
     *   type: string,
     *   stage: string | null,
     *   evolvesFrom: string | null,
     *   blurb: string | null,
     *   regulation: string,
     *   weakness: string | null,
     *   resistance: string | null,
     *   illustrators: string | null,
     *   pokedex: string | null,
     *   retreat: number | null,
     * }>} Pokémon card data
     */
    const readTable = async () => {
      return await Pokemon.findAll({
        where: {
          id: { [Op.like]: `${expansion}%` },
        },
      });
    };

    /**
     * @param {Boolean<Boolean>} timeout Whether to disable buttons due to timeout
     */
    const buildResponse = async timeout => {

      const table = await readTable();
      const currentCard = table[currentCardNum - 1];
      if (currentCard.name.startsWith('Mega ')) currentCard.name = currentCard.name.replace(/ ex$/, ` ${emojis.mega}`);
      else if (currentCard.name.endsWith(' ex')) currentCard.name = currentCard.name.replace(/ ex$/, ` ${emojis.ex}`);

      const getRetreatCost = () => {
        if (typeof currentCard.retreat !== 'number') return null;
        return `${emojis.colorless} `.repeat(currentCard.retreat);
      };

      // Button Builders
      const leftTenButton = new ButtonBuilder()
        .setCustomId('leftTen')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      if (currentCardNum < 11) leftTenButton.setDisabled(true);

      const leftButton = new ButtonBuilder()
        .setCustomId('left')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      if (currentCardNum === 1) leftButton.setDisabled(true);

      const centreButton = new ButtonBuilder()
        .setCustomId('blank')
        .setLabel(currentCard.id)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const rightButton = new ButtonBuilder()
        .setCustomId('right')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      if (currentCardNum === table.length) rightButton.setDisabled(true);

      const rightTenButton = new ButtonBuilder()
        .setCustomId('rightTen')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      if (currentCardNum > table.length - 10) rightTenButton.setDisabled(true);

      if (timeout) {
        leftTenButton.setDisabled(true);
        leftButton.setDisabled(true);
        rightButton.setDisabled(true);
        rightTenButton.setDisabled(true);
      }

      selectorRow = new ActionRowBuilder()
        .addComponents([
          leftTenButton,
          leftButton,
          centreButton,
          rightButton,
          rightTenButton,
        ]);


      // Container Builder
      container = new ContainerBuilder()
        .addTextDisplayComponents(text => text
          .setContent(
            `# ${currentCard.name}\n` +
            (currentCard.stage ? `-# ${currentCard.stage} Pokémon` : '') + (currentCard.evolvesFrom ? `; evolves from ${currentCard.evolvesFrom}` : '') + (currentCard.pokedex ? ` | #${currentCard.pokedex}` : '') + '\n' +
            '### ' + (currentCard.hp ? `HP ${currentCard.hp} ` : '') + `${currentCard.type}\n` +
            (currentCard.blurb ? `${currentCard.blurb}` : ''),
          ),
        )
        .addSeparatorComponents(sep => sep)
        .addMediaGalleryComponents(gallery => gallery
          .addItems(galleryItem => galleryItem
            .setURL(`https://cdn.vyxx.dev/ptcg/${expansion}/${expansion}${currentCardNum.toString().padStart(3, '0')}.jpg`),
          ),
        )
        .addSeparatorComponents(sep => sep)
        .addActionRowComponents([selectorRow])
        .addSeparatorComponents(sep => sep)
        .addTextDisplayComponents(text => text
          .setContent(
            (currentCard.weakness ? `**Weakness:** ${currentCard.weakness}\n\n` : '') +
            (currentCard.resistance ? `**Resistance:** ${currentCard.resistance}\n\n` : '') +
            (getRetreatCost() ? `**Retreat cost:** ${getRetreatCost()}\n\n` : '') +
            `**Rarity:** ${currentCard.rarity}`,
          ),
        )
        .addSeparatorComponents(sep => sep)
        .addTextDisplayComponents(text => text
          .setContent(
            '-# ' + (currentCard.illustrators ? `Illustrated by ${currentCard.illustrators} | ` : '') + `${currentCard.expansion} ${currentCard.number} ` + (currentCard.regulation ? `| Regulation ${currentCard.regulation}` : ''),
          ),
        );

      switch (currentCard.type) {
        case emojis.grass:
          container.setAccentColor(0x4FA155);
          break;
        case emojis.fire:
          container.setAccentColor(0xDB5338);
          break;
        case emojis.water:
          container.setAccentColor(0x468AC7);
          break;
        case emojis.fighting:
          container.setAccentColor(0xD16338);
          break;
        case emojis.psychic:
          container.setAccentColor(0x89569C);
          break;
        case emojis.lightning:
          container.setAccentColor(0xF1E54E);
          break;
        case emojis.darkness:
          container.setAccentColor(0x3A4755);
          break;
        case emojis.metal:
          container.setAccentColor(0x9BA1A7);
          break;
        case emojis.dragon:
          container.setAccentColor(0xB29C46);
          break;
        case emojis.fairy:
          container.setAccentColor(0xC05D9C);
          break;
        case emojis.colorless:
          container.setAccentColor(0xEFEDE3);
          break;
        case 'Item':
          container.setAccentColor(0x3672B6);
          break;
        case 'Pokémon Tool':
          container.setAccentColor(0x6E589F);
          break;
        case 'Supporter':
          container.setAccentColor(0xDD6032);
          break;
        case 'Stadium':
          container.setAccentColor(0x74B654);
          break;
        case 'Special Energy':
          container.setAccentColor(0x666566);
          break;
      }

    };

    await buildResponse();
    const response = await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
      withResponse: true,
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const buttonInteraction = await response.awaitMessageComponent({
          componentType: ComponentType.Button,
          filter: i => i.user.id === interaction.user.id,
          time: 3_600_000,
        });

        if (buttonInteraction.customId === 'leftTen') {
          await buttonInteraction.deferUpdate();
          currentCardNum -= 10;
          await buildResponse();
          await interaction.editReply({
            components: [container],
            withResponse: true,
          });
        }
        else if (buttonInteraction.customId === 'left') {
          await buttonInteraction.deferUpdate();
          currentCardNum--;
          await buildResponse();
          await interaction.editReply({
            components: [container],
            withResponse: true,
          });
        }
        else if (buttonInteraction.customId === 'right') {
          await buttonInteraction.deferUpdate();
          currentCardNum++;
          await buildResponse();
          await interaction.editReply({
            components: [container],
            withResponse: true,
          });
        }
        else if (buttonInteraction.customId === 'rightTen') {
          await buttonInteraction.deferUpdate();
          currentCardNum += 10;
          await buildResponse();
          await interaction.editReply({
            components: [container],
            withResponse: true,
          });
        }
      }
      catch (e) {
        buildResponse(true);
        await response.edit({
          content: '-# This message is now inactive.',
        });
      }
    }
  }
  // * END /pokémon view
}
