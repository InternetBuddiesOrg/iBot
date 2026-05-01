/* eslint-disable quotes */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Pokemon from '../models/pokemon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const emojis = JSON.parse(readFileSync(join(__dirname, '../../emojis.json'), 'utf8'));


async function seedPokemon() {
  await Pokemon.bulkCreate([
    {
      name: 'Spinarak #001',
      id: 'POR001',
      set: 'Perfect Order',
      number: '001/088',
      rarity: `'Common' ${emojis.CC}`,
      hp: 60,
      type: 'Grass',
      stage: 'Basic',
      evolvesFrom: null,
      blurb: `It spins a web using fine yet durable thread. 
            It then waits patiently for prey to be trapped.`,
      regulation: 'J',
      weakness: `{emojis.fire} x 2`,
      resistance: null,
      illustrators: 'Katsunori Sato',
      pokedex: '0167',
      retreat: `{emojis.colorless}`,

    },
    {
      name: 'Ariados #002',
      id: 'POR002',
      set: 'Perfect Order',
      number: '002/088',
      rarity: `'Common' ${emojis.CC}`,
      hp: 110,
      type: 'Grass',
      stage: 'Stage 1',
      evolvesFrom: 'Evolves from Spinarak',
      blurb: `It spins string not only from its rear but also from
            its mouth. It's hard to tell which end is which.`,
      regulation: 'J',
      weakness: `{emojis.fire} x 2`,
      resistance: null,
      illustrators: 'svlt',
      pokedex: '0168',
      retreat: `{emojis.colorless}`,

    },
    {
      name: 'Shaymin #003',
      id: 'POR003',
      set: 'Perfect Order',
      number: '003/088',
      rarity: `'Uncommon' ${emojis.UC}`,
      hp: 70,
      type: 'Grass',
      stage: 'Basic',
      evolvesFrom: null,
      blurb: `It can dissolve toxins in the air to instantly transform
            ruined land into a lush field of flowers.`,
      regulation: 'J',
      weakness: `{emojis.fire} x 2`,
      resistance: null,
      illustrators: 'saino misaki',
      pokedex: '0492',
      retreat: null,

    },
  ], {
    ignoreDuplicates: true,
  });
  console.log('[INFO] Pokemon seeded.');
}

export default seedPokemon;