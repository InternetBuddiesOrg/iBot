// @ts-check

import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import { load } from 'cheerio';

export const data = new SlashCommandBuilder()
  .setName('wotd')
  .setDescription('wort of the ay');

/**
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 *
 */

export async function execute(interaction) {
  try {
    const axiosConfig = {
      responseType: 'text',
      headers: {
        'User-Agent':
          'iBot/1.0 (https://github.com/InternetBuddiesOrg/iBot; contact: stella@ibo.lol',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://en.wiktionary.org',
      },
    };

    // Fetch the main page to find the word of the day
    const mainPageResponse = await axios.get(
      'https://en.wiktionary.org/wiki/Wiktionary:Main_Page',
      axiosConfig,
    );

    const $main = load(mainPageResponse.data);

    // Find an h3 whose next sibling is p and contains a .headword-line
    let wotdUrl = null;
    $main('h3').each((i, el) => {
      const nextSibling = $main(el).next();
      if (nextSibling.is('p') && nextSibling.find('.headword-line').length > 0) {
        const wordLink = nextSibling.find('.headword-line a').first().attr('href');
        if (wordLink) {
          wotdUrl = `https://en.wiktionary.org${wordLink}`;
        }
        return false; // break the loop
      }
    });

    if (!wotdUrl) {
      throw new Error('Could not find word of the day on the main page');
    }

    // Fetch the word page with Axios
    const response = await axios.get(wotdUrl, axiosConfig);

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

    await interaction.reply(`The word of the day is:\n# ${wotd}\n${hyphenation.join(', ')}   ${ipa.join(', ')}\n\n### to be continued (also make it title case ty)`);
  }
  catch (e) {
    console.error(e);
    await interaction.reply({
      content: `An error occured while using this command:\n\`\`\`${e}\`\`\``,
      ephemeral: true,
    });
  }
}
