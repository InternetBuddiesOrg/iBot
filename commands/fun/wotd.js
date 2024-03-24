const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const { iBotDir } = process.env;
const fs = require('fs');
const Parser = require('rss-parser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wotd-test')
    .setDescription('words of day'),

  async execute(interaction) {
    // Parse RSS function
    (async function main() {
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
    const contentSnippet = wotdJson[9].contentSnippet.split('\n');

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
    const reply = new EmbedBuilder()
      .setColor('#F0CD40')
      .setAuthor({ name: 'The word of the day is:' })
      .setTitle(word)
      .setDescription('hy • phe • na • tion   /pro.nun.ci.a.tion/')
      .addFields(fields)
      .setFooter({ text: 'footer text from wiktionary' })
      .setTimestamp();
    await interaction.reply({ embeds: [reply] });
  },
};
