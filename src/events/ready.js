import {
  Events,
  EmbedBuilder,
  PresenceUpdateStatus,
  ActivityType,
  MessageFlags,
  // eslint-disable-next-line no-unused-vars
  Client,
} from 'discord.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import User from '../sql/models/user.js';
import Pokemon from '../sql/models/pokemon.js';
import seedPOR from '../sql/seeders/ptcgPOR.js';
import { pushBotChangelog } from '../botChangelog.js';
import { iBotVersion } from '../botChangelog.js';

const dir = dirname(fileURLToPath(import.meta.url));

export const name = Events.ClientReady;
export const once = true;
/**
 * @param {Client} client The discord.js client instance
 */
export function execute(client) {
  // * Database
  // Syncs User table
  User.sync().then(() => {
    return User.findAll();
  }).catch(e => {
    console.error(`[ERR!] ${e}`);
  });

  // Syncs Pokémon table
  Pokemon.sync()
    .catch(e => {
      console.error(`[ERR!] ${e}`);
    });

  // Seeds all Pokémon sets
  // ! Set seedPokemon to true when needed (e.g. add new set to table, or edit a set)
  // ! Be sure to DROP the table, then SYNC the table before re-seeding
  const seedPokemon = false;
  if (seedPokemon) {
    seedPOR();
    // add seeder functions here when finished
  }

  // Drops Pokémon table
  // ! Set dropPokemon to true if table needs to be reset (e.g. for duplicates, or adding a new set)
  const dropPokemon = false;
  if (dropPokemon) Pokemon.drop();


  // * Status
  // Get previous status and set it
  const data = JSON.parse(readFileSync(join(dir, '../commands/utility/statusLatest.json'), 'utf8'));
  let icon;
  let message;

  switch (data.botStatus.status) {
    case 'online':
      client.user.setStatus(PresenceUpdateStatus.Online);
      icon = '<:online:1266485857653620836>';
      break;
    case 'idle':
      client.user.setStatus(PresenceUpdateStatus.Idle);
      icon = '<:idle:1266485882261733506>';
      break;
    case 'dnd':
      client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);
      icon = '<:dnd:1266485896866172958>';
      break;
  }

  switch (data.botStatus.activity) {
    case 'competing':
      client.user.setActivity(data.botStatus.value, { type: ActivityType.Competing });
      message = 'Competing in ';
      break;
    case 'custom':
      client.user.setActivity(data.botStatus.value, { type: ActivityType.Custom });
      message = '';
      break;
    case 'listening':
      client.user.setActivity(data.botStatus.value, { type: ActivityType.Listening });
      message = 'Listening to ';
      break;
    case 'playing':
      client.user.setActivity(data.botStatus.value, { type: ActivityType.Playing });
      message = 'Playing ';
      break;
    case 'streaming':
      client.user.setActivity(data.botStatus.value, {
        type: ActivityType.Streaming,
        url: 'https://www.twitch.tv/protozappy',
      });
      icon = '<:streaming:1266485909688287303>';
      message = 'Streaming ';
      break;
    case 'watching':
      client.user.setActivity(data.botStatus.value, { type: ActivityType.Watching });
      message = 'Watching ';
      break;
  }
  // console.log(`[EVNT] Set the status to: (${data.botStatus.status}) ${message}${data.botStatus.value}`);


  // * Confirm bot's status...
  // * ...in dev channel...
  const devChannel = client.channels.cache.get('1099564476698726401');
  const embed = new EmbedBuilder()
    .setColor('#68AB3F')
    .setTitle('Bot Started!')
    .setTimestamp()
    .setDescription(
      `**Status:** ${icon} ${message}${data.botStatus.value}\n` +
      `**Version:** ${iBotVersion}`,
    );

  devChannel.send({ embeds: [embed], flags: [MessageFlags.SuppressNotifications] });

  // * ... and in console
  console.log(`
 ██                                ██  ██    ██████  ██  ██  ██    ██████  ██████  ██████
     ██                ██            ██  ██    ██████  ██  ██  ██    ██████  ██████  ██████
 ██  ██████  ██████  ██████            ██  ██    ██████  ██  ██  ██    ██████  ██████  ██████      
 ██  ██  ██  ██  ██   ██                 ██  ██    ██████  ██  ██  ██    ██████  ██████  ██████ 
 ██  ██████  ██████    ████    v 0.1       ██  ██    ██████  ██  ██  ██    ██████  ██████  ██████
 `);
   console.log(`[INFO] iBot is online and ready to go! Use 'CTRL + C' to STOP current instance.`);
   console.log(`[INFO] Enter 'pm2 <start/stop> iBot' to start/stop an ongoing instance!`);


  // * Changelog
  // ! If new iBot Version is ready to be released,
  // ! This will post a changelog if enabled.
  // ! Set sendChangelog to true when ready to release version.

  const sendChangelog = false;
  if (sendChangelog) pushBotChangelog(client);
}
