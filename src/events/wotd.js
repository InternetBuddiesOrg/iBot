// & Word of the Day! - iBot edition
// & - A daily term from Wiktionary's Word of the Day, parsed and formatted for Discord.
// & - by @vyxtella

import axios from 'axios';
import {
  // eslint-disable-next-line no-unused-vars
  Client,
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  Events,
} from 'discord.js';
import { load } from 'cheerio';
import { schedule } from 'node-cron';

export const name = Events.ClientReady;
/**
 * @param {Client} client The Client instance
 */
export async function execute(client) {
  const runWotd = async () => {
    try {
      // Main Page parser. Used for getting the Word of the Day...
      // ...as well as getting the WotD Footer for the final Discord message.
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
      const mainPage = await axios.get(
        'https://en.wiktionary.org/wiki/Wiktionary:Main_Page',
        axiosConfig,
      );
      const $$ = load(mainPage.data);

      // Get the user-input word and convert it to URL-safe
      const wotdEncoded = encodeURIComponent($$('#WOTD-rss-title').text().replace(/ /g, '_'));

      // Word Entry parser. Used for everything else basically.
      const response = await axios.get(
        `https://en.wiktionary.org/wiki/${wotdEncoded}`,
        axiosConfig,
      );

      const $ = load(response.data);

      // Get the word of the day itself
      const wotd = $('h1').first().text();

      // Find the English Pronunciation section
      const pronunciationHeading = $('#English')
        .parent('div')
        .siblings('div')
        .children('#Pronunciation');

      // Find the ul in the Pronunciation section
      const pronunciationUl = $(pronunciationHeading).parent('div').next('ul');

      // Parse the Pronunciation li's
      let ipa = [];
      let hyphenation = [];
      $(pronunciationUl)
        .children('li')
        .each((i, li) => {
          const liText = $(li).text();

          // Make the IPA and hyphenation Strings pretty if they exist
          if (liText.includes('IPA')) {
            ipa = ipa.concat(
              liText
                .match(/\/[^/]*\//g),
            );
          }

          else if (liText.includes('Hyphenation')) {
            hyphenation = hyphenation.concat(
              liText
                .replace(/‧/g, ' • ')
                .match(/(?<=Hyphenation:\s).*/),
            );
          }
        });

      // Remove any duplicates from the ipa and hyphenation Arrays. (Convert Array to Set, then spread back to Array)
      ipa = [...new Set(ipa)];
      hyphenation = [...new Set(hyphenation)];

      // * Find Parts of Speech and Definitions, put them in an Object, then push that to the sections Array
      const sections = [];

      // Check if there are multiple Etymologies, and filter the DOM accordingly
      const filter = {};
      if (
        $('#English')
          .parent('div')
          .nextUntil('.mw-heading2')
          .filter('.mw-heading3')
          .text()
          .match(/Etymology \d/g)
      ) {
        filter.class = '.mw-heading4';
        filter.tag = 'h4';
      }
      else {
        filter.class = '.mw-heading3';
        filter.tag = 'h3';
      }

      $('#English')
        .parent('div')
        .nextUntil('.mw-heading2')
        .filter(filter.class)
        .each((i, el) => {
          if (
            // Match sections after a .headword-line
            $(el)
              .nextUntil('.mw-heading2, .mw-heading3, .mw-heading4')
              .filter('p')
              .first()
              .children()
              .first('span')
              .hasClass('headword-line')
          ) {
            const sectionObj = {};


            // Find Part of Speech heading and put it in da Object
            sectionObj.pos = $(el)
              .children(filter.tag)
              .text()
              .toLowerCase();


            // Parse this section's definitions, accounting for sub-senses
            class Definition {
              constructor(defLi, number, indentLevel) {
                // Clone the DOM so we can remove Elements freely without it affecting the recursion
                const domCloneLi = $(defLi).clone();
                domCloneLi // Italicise sense usage labels, and other italic elements
                  .find('.ib-content, i, em, .form-of-definition, .use-with-mention')
                  .each((ii, ele) => $(ele).text(`*${$(ele).text()}*`));

                domCloneLi // Remove extraneous elements that we do not want to send
                  .find('ol, ul, dl, .defdate, .reference, .maintenance-line, style')
                  .remove();

                this.content = domCloneLi.text().trim();
                this.number = number;
                this.indentLevel = indentLevel;
              }
            }

            // Push the text content of each li to the defs array
            sectionObj.defs = [];
            const findDefs = (ol, indentLevel = 0) => { // (Recursive function that checks for Definitions with sub-senses)
              // Skip empty li's,,, which exist on Wiktionary for some reason <3
              const domCloneOl = $(ol).clone();
              domCloneOl.find('li:empty').remove();

              domCloneOl
                .children('li')
                .each((ii, li) => {
                  sectionObj.defs.push(new Definition(li, ii + 1, indentLevel));

                  // Check if there are any ol children. If there are, call this function on them.
                  if ($(li).children('ol').length) findDefs($(li).children('ol'), indentLevel + 1);
                });
            };

            findDefs(
              $(el)
                .nextUntil('.mw-heading2, .mw-heading3, .mw-heading4')
                .filter('ol')
                .first(),
            );

            // Finally, push this section to the Array
            sections.push(sectionObj);
          }
        });


      // * Build and format everything for Discord
      // Format sections
      let msgBody = '';
      sections.forEach(section => {

        // Add Part of Speech heading
        msgBody = msgBody.concat(
          '\n' +
          `### ${section.pos}\n`,
        );

        // Add Definitions
        section.defs.forEach(def => {
          // Convert indentLevel to actual indent spaces. (indentLevel 1 equals two spaces, all indentLevels thereafter equal three each)
          let indent = '';
          while (def.indentLevel > 0) {
            if (def.indentLevel === 1) indent = indent.concat('  '); // Add two spaces at indentLevel 1...
            else indent = indent.concat('   '); // ... and three at indentLevel > 1.

            def.indentLevel--;
          }

          msgBody = msgBody.concat(
            `${indent}${def.number}. ${def.content}\n`,
          );
        });
      });

      // Put the whole WotD content into one big String...
      const fullText =
        'The word of the day is:\n' +
        `# ${wotd}\n` +
        `${hyphenation.join(', ')}${hyphenation.length ? '   ' : ''}${ipa.join(', ')}\n` +
        msgBody;

      // ...then split the String up if it is over the 4000-character message limit:
      const accumulatedArray = [];

      if (fullText.length > 4000) {
        // Split by line so that messages dont get cut off in the middle of words or sentences
        const fullTextSplit = fullText.split('\n');
        let accumulatedString = '';

        // While there are still lines in the fullTextSplit Array, add those lines to the accumulatedString...
        // ...unless that would put accumulatedString.length over 4000, in which case...
        // ...push the current accumulatedString into accumulatedArray. Then finally...
        // ...push whatever is left in accumulatedString into accumulatedArray.
        while (fullTextSplit.length) {
          const line = fullTextSplit.shift() + '\n';

          if ((accumulatedString + line).length < 4000) {
            accumulatedString += line;
          }
          else {
            accumulatedArray.push(accumulatedString);
            accumulatedString = line;
          }
        }

        if (accumulatedString) accumulatedArray.push(accumulatedString);
      }
      // If the fullText ISN'T over 4000 characters in length, then just. dont worry about all that other logic. just push the thing into the thing
      else {
        accumulatedArray.push(fullText);
      }


      // Search the Main Page for the WotD Footer
      const wotdFooter =
        $$('.wotd-container')
          .first()
          .find('span')
          .filter((i, el) => {
            // The Footer should be the only span in the .wotd-container that has a style attribute of 'font-size:80%;'.
            // If one isn't found, then there isn't a Footer, and wotdFooter will be an empty String.
            return $$(el).attr('style') === 'font-size:80%;';
          })
          .text();

      // Build the Footer Message's components:
      const footerComponents = [];
      // The Footer Message will always have a Separator Component...
      const sepComponent = new SeparatorBuilder()
        .setDivider(true);
      footerComponents.push(sepComponent);

      // ...but if there *is* a wotdFooter, make a Section Component...
      // ...containing the Footer and a Button linking to the WotD's page...
      if (wotdFooter) {
        const secComponent = new SectionBuilder()
          .addTextDisplayComponents(text => text
            .setContent(`-# ${wotdFooter}`),
          )
          .setButtonAccessory(button => button
            .setStyle(ButtonStyle.Link)
            .setURL(`https://en.wiktionary.org/wiki/${wotdEncoded}#English`)
            .setLabel(`${wotd} on Wiktionary`),
          );

        footerComponents.push(secComponent);
      }
      // ...or if there *isn't* a wotdFooter, just make a...
      // ...regular Action Row Component containing the same Button.
      else {
        const buttonComponent = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(`https://en.wiktionary.org/wiki/${wotdEncoded}#English`)
          .setLabel(`${wotd} on Wiktionary`);
        const arComponent = new ActionRowBuilder()
          .addComponents(buttonComponent);

        footerComponents.push(arComponent);
      }


      // * Send Discord messages
      // Channel IDs
      // & #development:
      // const sendChannel = client.channels.cache.get('1099564476698726401');

      // ^ #trending:
      const sendChannel = client.channels.cache.get('1149549485928747120');

      // Main WotD Message(s)
      for (const accStr of accumulatedArray) { // Use a for...of loop instead of forEach() to maintain asynchronicity
        const i = accumulatedArray.indexOf(accStr);

        // Use a Text Display Component for a 4000-character limit...
        // ...rather than the 2000-char limit on regular message contents.
        const textDisplayComponent = new TextDisplayBuilder()
          .setContent(accStr);


        if (i === 0) {
          await sendChannel.send({
            flags: [
              MessageFlags.IsComponentsV2,
            ],
            components: [textDisplayComponent],
          });
        }
        // Silence Main Message follow-ups, so notifications don't get spammed
        else {
          await sendChannel.send({
            flags: [
              MessageFlags.IsComponentsV2,
              MessageFlags.SuppressNotifications,
            ],
            components: [textDisplayComponent],
          });
        }
      }

      // WotD Footer Message
      await sendChannel.send({
        flags: [
          MessageFlags.IsComponentsV2,
          // Silence Footer Message follow-up, so notifications don't get spammed
          MessageFlags.SuppressNotifications,
        ],
        components: footerComponents,
      });
    }
    catch (e) {
      console.error(e);
    }
  };

  // * Schedule for 07:00 with Cron
  schedule('00 07 * * *', runWotd);
}
