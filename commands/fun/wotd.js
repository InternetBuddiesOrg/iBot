const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const { iBotDir } = process.env;
const fs = require('fs');
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wotd-test')
    .setDescription('words of day'),

  async execute(interaction) {
    // Parse RSS function
    (async function parse() {
      const parser = new Parser();
      const feed = await parser.parseURL('https://en.wiktionary.org/w/api.php?action=featuredfeed&feed=wotd');

      const items = [];
      const fileName = 'wotdLatest.json';
      if (fs.existsSync(fileName)) {
        fs.rmSync(fileName);
      }
      await Promise.all(feed.items.map(async currentItem => {
        if (items.filter(item => item === currentItem).length <= 1) {
          items.push(currentItem);
        }
      }));
      fs.writeFileSync(`${iBotDir}/commands/fun/${fileName}`, JSON.stringify(items));
    })();
    const wotdJson = require('./wotdLatest.json');

    // Fetch HTML elements
    async function fetchHTML(url) {
      const { data } = await axios.get(url);
      return cheerio.load(data);
    }

    function toTitleCase(str) {
      return str.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }

    // WoTD variables
    const wotd = wotdJson[9].content.split('"')[17]; // word of the day
    const word = toTitleCase(wotd); // Word Of The Day
    let rss = wotdJson[9].content.split(/<i>(n|v|adj|adv|pron|prep|conj|interj|det|art|num|part|phrase|prepositional phrase|idiom|proverb|abbr|symbol|letter)<\/i>/g);
    rss = rss.map(str => str.replace(/<[^>]+>/gim, '').trim());
    const full = rss.map(str => str.replace(/\n/g, ''));
    const snippet = [];
    const definitions = [];
    let footer = '';
    const contentSnippet = wotdJson[9].contentSnippet.split('\n');
    let footerSnippet = wotdJson[9].contentSnippet.split('.\n\n ');

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
    let foundWotd = false;
    for (let i = 0; i < snippet.length; i++) {
      if (snippet[i].startsWith(wotd)) {
        const match = snippet[i].match(/\(([^)]+)\)/);
        if (match) {
          definitions.push([`(*${match[1]}*)`]);
        }
        else {
          definitions.push(['']);
        }
        foundWotd = true;
      }
      else if (foundWotd) {
        definitions[definitions.length - 1].push(snippet[i]);
      }
    }

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

    // Set pronunciation
    async function pro() {
      const $ = await fetchHTML(`https://en.wiktionary.org/wiki/${wotd.replace(/ /g, '_')}`);
      const pronuns = [];
      $('div[lang="en"] ul li ul li span.IPA').filter(function() {
        // eslint-disable-next-line quotes
        return $(this).siblings().find(":contains('General American')").length > 0;
      }).each((_, elem) => {
        pronuns.push($(elem).text());
      });
      return pronuns;
    }

    (async function() {
      const pronuns = await pro();
      console.log(pronuns);
    })();

    // Create fields
    let defNum = 0;
    const defGroups = {};
    rss.map((pos, ind) => {
      if (ind % 2 !== 0) {
        if (pos === 'n') {
          full[ind] = 'noun';
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

        const defArr = definitions[defNum];
        defArr.forEach((sense, senseInd) => {
          if (sense.startsWith('(') && senseInd !== 0) {
            sense = sense.replace('(', '(*').replace(')', '*)');
          }
          const partOfSpeech = full[ind];
          if (!defGroups[partOfSpeech]) {
            defGroups[partOfSpeech] = [];
          }

          if (sense !== '' && senseInd !== 0) {
            defGroups[partOfSpeech].push(`${senseInd}. ${sense}`);
          }
          else if (sense !== '' && senseInd === 0) {
            defGroups[partOfSpeech].push(sense);
          }
          else if (sense === '') {
            return;
          }
          else {
            defGroups[partOfSpeech].push(`${senseInd + 1}. ${sense}`);
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

    // Complete interaction
    console.log(full);
    console.log(snippet);
    console.log(definitions);
    console.log(fields);
    console.log(footerSnippet);
    console.log(footer);
    const reply = new EmbedBuilder()
      .setColor('#F0CD40')
      .setAuthor({ name: 'The word of the day is:' })
      .setTitle(word)
      .setDescription('hy • phe • na • tion   /pro.nun.ci.a.tion/')
      .addFields(fields)
      .setFooter({ text: footer })
      .setTimestamp();
    await interaction.reply({ embeds: [reply] });
  },
};
