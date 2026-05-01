import axios from 'axios';
import { load } from 'cheerio';

// Fetch with Axios
const response = await axios.get(
  'https://en.wiktionary.org/wiki/sidequest', // TODO: get actual wotd link ty
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

// Find Parts of Speech and definition sections
const sections = [];
$('#English')
  .parent('div')
  .siblings('.mw-heading3')
  .each((i, el) => {
    let heading;
    let defs;
    if (
      $(el)
        .next('p')
        .children()
        .hasClass('headword-line')
    ) {
      heading = $(el).text();
      defs = $(el)
        .next('p')
        .next('ol')
        .children('li')
        .text();

      /** This is what needs to happen:
       *  - Get the content of all li's that come after a .headword-line
       *  - Apply attributes to elements inside the li's, depending on what they are, as well as remove things that aren't needed.
       *    e.g. remove anchors;
       *         remove quotation and synonym sections;
       *         mark child ol's as such, so they can be numbered correctly in the final message;
       *         mark usage labels as such so they can be formatted correctly in the final message;
       *        remove basically any text that is not needed.
       *  - Probably something else that I'm forgetting
      */



      // .children(':not(.defdate)');
      sections.push({
        heading: heading,
        defs: defs,
      });
    }
  });

console.log(
  'The word of the day is:\n' +
  '# ' + wotd + '\n' +
  hyphenation.join(', ') + '   ' + ipa.join(', ') + '\n\n' +

  '### ' + sections[0].heading + '\n' +
  sections[0].defs,
);

debugger;
