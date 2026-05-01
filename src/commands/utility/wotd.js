// @ts-check

import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import { load } from 'cheerio';

export const data = new SlashCommandBuilder()
  .setName('wotd')
  .setDescription('wort of the ay');

/**
 *
 * @param { import('discord.js').ChatInputCommandInteraction } interaction
 *
 */

export async function execute(interaction) {
  try {
    // Fetch with Axios
    const response = await axios.get(
      'https://en.wiktionary.org/wiki/compersion', // TODO: get actual wotd link ty
      {
        responseType: 'text',
        headers: {
          'User-Agent':
            'iBot/1.0 (https://github.com/InternetBuddiesOrg/iBot; contact: stella@ibo.lol',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://en.wiktionary.org',
        },
      },
    );

    // Parse with Cheerio
    const $ = load(response.data);

    // Get the word of the day itself
    const wotd = $('.mw-page-title-main').first().text();

    // Find the English Pronunciation section
    const pronunciationHeading = $('#English')
      .parent('div')
      .siblings('div')
      .children('#Pronunciation');

    // Find the ul in the Proninciation section
    const pronunciationUl = $(pronunciationHeading).parent('div').next('ul');

    // Parse the Pronunciation li's
    let ipa = [];
    let hyphenation = [];
    $(pronunciationUl)
      .children('li')
      .each((i, el) => {
        const liText = $(el).text();

        // Make the IPA and hyphenation strings pretty if they exist
        if (liText.includes('American') && liText.includes('IPA')) {
          ipa = liText.match(/\/[^/]*\//g);
        }
        else if (liText.includes('Hyphenation')) {
          hyphenation = liText
            .replace(/‧/g, ' • ')
            .match(/(?<=Hyphenation:\s).*/);
        }
      });

    await interaction.reply(
      `The word of the day is:\n# ${wotd}\n${hyphenation.join(', ')}   ${ipa.join(', ')}\n\n### to be continued (also make it title case ty)`,
    );
  }
  catch (e) {
    console.error(e);
    await interaction.reply({
      content: `An error occured while using this command:\n\`\`\`${e}\`\`\``,
      ephemeral: true,
    });
  }
}
