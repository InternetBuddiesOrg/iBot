// & /define <word>
// & - A modified version of the Word of the Day event, for use as a command.
// & - by @vyxtella

import axios from 'axios';
import {
  SlashCommandBuilder,
  // eslint-disable-next-line no-unused-vars
  CommandInteraction,
  MessageFlags,
  TextDisplayBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} from 'discord.js';
import { load } from 'cheerio';

export const data = new SlashCommandBuilder()
  .setName('define')
  .setDescription('Get the definition of any word (capitalization matters!)')
  .addStringOption(option => option
    .setName('word')
    .setDescription('The word to look up (capitalization matters!')
    .setRequired(true),
  );

/**
 * @param {CommandInteraction} interaction The command interaction from Discord
 */
export async function execute(interaction) {
  try {
    // & /define command only
    // Get the user-input word and convert it to URL-safe
    const selectedWord = encodeURIComponent(interaction.options.getString('word').replace(/ /g, '_'));

    // Fetch with Axios
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
    const response = await axios.get(
      `https://en.wiktionary.org/wiki/${selectedWord}`,
      axiosConfig,
    );

    // Parse with Cheerio
    const $ = load(response.data);

    // Get the Word itself
    const wordHeading = $('h1').first().text();

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

    // Put the whole Definition content into one big String...
    const fullText =
      `# ${wordHeading}\n` +
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

    // Build Button and Action Row Components
    const buttonComponent = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(`https://en.wiktionary.org/wiki/${selectedWord}#English`)
      .setLabel(`${wordHeading} on Wiktionary`);
    const arComponent = new ActionRowBuilder()
      .addComponents(buttonComponent);


    // * Send Discord messages

    for (const accStr of accumulatedArray) { // Use a for...of loop instead of forEach() to maintain asynchronicity
      const i = accumulatedArray.indexOf(accStr);

      // Use a Text Display Component for a 4000-character limit...
      // ...rather than the 2000-char limit on regular message contents.
      const textDisplayComponent = new TextDisplayBuilder()
        .setContent(accStr);

      // Make sure first element completes the interaction by replying...
      if (i === 0) {
        await interaction.reply({
          flags: [MessageFlags.IsComponentsV2],
          components: [textDisplayComponent],
        });
      }
      // ...and make sure the last message contains the Action Row...
      else if (i === accumulatedArray.length - 1) {
        await interaction.channel.send({
          flags: [MessageFlags.IsComponentsV2],
          components: [
            textDisplayComponent,
            arComponent,
          ],
        });
      }
      // ...then any other elements can just be sent to the channel as normal
      else {
        await interaction.channel.send({
          flags: [MessageFlags.IsComponentsV2],
          components: [textDisplayComponent],
        });
      }
    }

    // Action Row Message
    // (yes i know it does not have to be its own message but i dont wanna figure that out rn)
    // await interaction.channel.send({
    //   flags: [MessageFlags.IsComponentsV2],
    //   components: [arComponent],
    // });
  }
  catch (e) {
    if (e.status === 404) {
      await interaction.reply({
        content: `Entry '**${interaction.options.getString('word')}**' was not found.\nPlease check the spelling and try again.`,
        flags: MessageFlags.Ephemeral,
      });
    }
    else {
      console.error(e);
      await interaction.reply({
        content: `An error occured while using this command:\n\`\`\`diff\n- ${e}\`\`\``,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
