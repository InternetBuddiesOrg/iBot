const {
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} = require('discord.js');
const fs = require('fs');
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const { iBotDir } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('totd')
    .setDescription('Sends the term of the day message'),

  async execute(interaction) {
    // Parse RSS function
    async function parse() {
      const parser = new Parser();
      const feed = await parser.parseURL('https://en.wiktionary.org/w/api.php?action=featuredfeed&feed=wotd');

      const items = [];
      const fileName = 'totdLatest.json';
      if (fs.existsSync(fileName)) {
        fs.rmSync(fileName);
      }
      await Promise.all(feed.items.map(async currentItem => {
        if (items.filter(item => item === currentItem).length <= 1) {
          items.push(currentItem);
        }
      }));
      fs.writeFileSync(`${iBotDir}/src/commands/utility/${fileName}`, JSON.stringify(items));
    }
    await parse();
    const totdJson = require('./totdLatest.json');

    async function fetchHTML(url) {
      const { data } = await axios.get(url);
      return cheerio.load(data);
    }

    function toTitleCase(str) {
      return str.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }

    // ToTD variables
    const totd = totdJson[9].content.split('"')[17]; // term of the day
    const term = toTitleCase(totd); // Term Of The Day
    let rss = totdJson[9].content.split(/<i>(n|proper n|plural n|v|adj|adv|pron|prep|conj|interj|det|art|num|part|phrase|prepositional phrase|idiom|proverb|abbr|contraction|symbol|letter)<\/i>/g);
    rss = rss.map(str => str.replace(/<[^>]+>/gim, '').trim());
    const full = rss.map(str => str.replace(/\n/g, ''));
    const snippet = [];
    const definitions = [];
    let footer = '';
    const contentSnippet = totdJson[9].contentSnippet.split('\n');
    let footerSnippet;
    if (totdJson[9].contentSnippet.split('\n\n ').length === 1) {
      footerSnippet = '';
    }
    else {
      footerSnippet = totdJson[9].contentSnippet.split('\n\n ');
    }

    contentSnippet.forEach(el => {
      if (el.startsWith('edit')) {
        return;
      }
      else if (el.startsWith('←')) {
        return;
      }
      else if (el.length === 0) {
        return;
      }
      else {
        snippet.push(el);
      }
    });
    let foundTotd = false;
    for (let i = 0; i < snippet.length; i++) {
      if (snippet[i].startsWith(totd)) {
        const match = snippet[i].match(/\(([^)]+)\)/);
        if (match) {
          definitions.push([`(*${match[1]}*)`]);
        }
        else {
          definitions.push(['']);
        }
        foundTotd = true;
      }
      else if (foundTotd) {
        definitions[definitions.length - 1].push(snippet[i]);
      }
    }

    if (Array.isArray(footerSnippet)) {
      footerSnippet.shift();
      footerSnippet = footerSnippet[0].split('\n');
      footerSnippet.forEach(el => {
        if (el === '' || el.startsWith('←')) {
          return;
        }
        else {
          footer = footer.concat(`${el} `);
          definitions[definitions.length - 1].pop();
        }
      });
    }
    else {
      footer = footerSnippet;
    }

    // Set pronunciation
    // IPA
    async function ipaMulti1() {
      const $ = await fetchHTML(`https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}`);
      let ipaString = '';
      $('div[lang="en"] ul li ul li span.IPA').filter(function() {
        // eslint-disable-next-line quotes
        return $(this).siblings().find(":contains('General American')").length > 0;
      }).each((_, el) => {
        const pronunciation = $(el).text();
        const posLabel = $(el).closest('ul').siblings('a').text();
        ipaString = ipaString.concat(`(*${posLabel.toLowerCase()}*) ${pronunciation}\n`);
      });
      return ipaString.trimEnd();
    }
    async function ipaMulti2() {
      const $ = await fetchHTML(`https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}`);
      let ipaString = '';
      $('div[lang="en"] ul li span.IPA').filter(function() {
        // eslint-disable-next-line quotes
        return $(this).siblings().find(":contains('General American')").length > 0;
      }).each((_, el) => {
        const pronunciation = $(el).text();
        ipaString = ipaString.concat(`${pronunciation}, `);
      });
      return ipaString.trimEnd().replace(/,$/, '');
    }
    async function ipaSingle() {
      const $ = await fetchHTML(`https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}`);
      let ipaString = '';
      $('div[lang="en"] ul li span.IPA').filter(function() {
        // eslint-disable-next-line quotes
        return $(this).siblings().find(":contains('General American')").length > 0;
      }).each((_, el) => {
        ipaString = $(el).text();
      });
      return ipaString;
    }
    let ipa = '';
    const ipaM1 = await ipaMulti1();
    const ipaM2 = await ipaMulti2();
    const ipaS = await ipaSingle();
    if (!ipaM1) {
      if (!ipaM2) {
        ipa = ipaS;
      }
      else {
        ipa = ipaM2;
      }
    }
    else {
      ipa = ipaM1;
    }

    // Hyphenation
    async function hyp() {
      const $ = await fetchHTML(`https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}`);
      let hyphenString = '';
      $('div[lang="en"] ul li span.Latn').filter(function() {
        return $(this).parent('li').text().includes('Hyphenation: ');
      }).each((_, el) => {
        hyphenString = $(el).text();
      });
      return hyphenString.replace(/‧/g, ' • ');
    }
    const hyphen = await hyp();

    // Create fields
    let defNum = 0;
    const defGroups = {};

    rss.map((pos, ind) => {
      if (ind % 2 !== 0) {
        if (pos === 'n') {
          full[ind] = 'noun';
        }
        else if (pos === 'proper n') {
          full[ind] = 'proper noun';
        }
        else if (pos === 'plural n') {
          full[ind] = 'plural noun';
        }
        else if (pos === 'v') {
          full[ind] = 'verb';
        }
        else if (pos === 'adj') {
          full[ind] = 'adjective';
        }
        else if (pos === 'adv') {
          full[ind] = 'adverb';
        }
        else if (pos === 'pron') {
          full[ind] = 'pronoun';
        }
        else if (pos === 'prep') {
          full[ind] = 'preposition';
        }
        else if (pos === 'conj') {
          full[ind] = 'conjunction';
        }
        else if (pos === 'interj') {
          full[ind] = 'interjection';
        }
        else if (pos === 'det') {
          full[ind] = 'determiner';
        }
        else if (pos === 'art') {
          full[ind] = 'article';
        }
        else if (pos === 'num') {
          full[ind] = 'numeral';
        }
        else if (pos === 'part') {
          full[ind] = 'particle';
        }
        else if (pos === 'abbr') {
          full[ind] = 'abbreviation';
        }
        else if (pos === 'contraction') {
          full[ind] = 'contraction';
        }

        const defArr = definitions[defNum];
        let senseNum = 0;
        defArr.forEach((sense, senseInd) => {
          if (sense.startsWith('(') && senseInd !== 0) {
            sense = sense.replace('(', '(*').replace(')', '*)');
          }
          if (sense.endsWith('[...]')) {
            sense = sense.replace('[...]', `[[...]](https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}#English)`);
          }

          const partOfSpeech = full[ind];
          if (!defGroups[partOfSpeech]) {
            defGroups[partOfSpeech] = [];
          }

          if (sense.startsWith('(*') && sense.endsWith('*)')) {
            defGroups[partOfSpeech].push(sense);
          }
          else if (sense.startsWith('[[...]]')) {
            senseNum = 0;
            defGroups[partOfSpeech].push(sense);
          }
          else if (sense === '') {
            return;
          }
          else {
            senseNum++;
            defGroups[partOfSpeech].push(`${senseNum}. ${sense}`);
          }
        });
        defNum++;
      }
      else {
        return null;
      }
    }).filter(item => item !== null);
    let fields = Object.entries(defGroups).map(([name, defs]) => ({
      name,
      value: defs.join('\n'),
    }));
    fields = [].concat(...fields);
    // If fields are over character limit, truncate them
    fields.forEach(obj => {
      if (obj.value.length > 1024) {
        const truncStr = obj.value.substring(0, 1024);
        const lastNewlineInd = truncStr.lastIndexOf('\n');
        obj.value = `${obj.value.substring(0, lastNewlineInd)} [[...]](https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}#English)`;
      }
    });

    // Complete interaction
    const reply = new EmbedBuilder()
      .setColor(interaction.client.embedColour)
      .setAuthor({ name: 'The term of the day is:' })
      .setTitle(term)
      .setURL(`https://en.wiktionary.org/wiki/${totd.replace(/ /g, '_')}#English`)
      .setDescription(`${hyphen}\n${ipa}`)
      .addFields(fields)
      .setTimestamp();
    if (Array.isArray(footerSnippet)) {
      reply.setFooter({ text: footer });
    }

    if (interaction.user.id === '547975777291862057') {
      const channel = new StringSelectMenuBuilder()
        .setCustomId('channel')
        .setPlaceholder('Select a channel')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('#🔺trending')
            .setValue('trending'),
          new StringSelectMenuOptionBuilder()
            .setLabel('#🖥️development')
            .setValue('development'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Don\'t send')
            .setValue('cancel'),
        );
      const row = new ActionRowBuilder()
        .addComponents(channel);

      const response = await interaction.reply({
        content: 'Send this embed?',
        embeds: [reply],
        components: [row],
        ephemeral: true,
      });

      const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
      collector.on('collect', async i => {
        const selection = i.values[0];
        if (selection === 'trending') {
          const replyChannel = interaction.client.channels.cache.get('1149549485928747120');
          await replyChannel.send({ embeds: [reply] });
          await response.delete();
          console.log('[INFO] Completed term of the day interaction');
        }
        else if (selection === 'development') {
          const replyChannel = interaction.client.channels.cache.get('1099564476698726401');
          await replyChannel.send({ embeds: [reply] });
          await response.delete();
          console.log('[INFO] Completed term of the day interaction');
        }
        else if (selection === 'cancel') {
          await response.delete();
          console.log('[INFO] Completed term of the day interaction');
        }
      });
    }
    else {
      await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true });
    }
  },
};
