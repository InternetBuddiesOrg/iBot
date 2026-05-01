import {
  Events,
  EmbedBuilder,
  PresenceUpdateStatus,
  ActivityType,
  MessageFlags,
} from 'discord.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import User from '../sql/models/user.js';
import Pokemon from '../sql/models/pokemon.js';
// eslint-disable-next-line no-unused-vars
import seedPokemon from '../sql/seeders/pokemonSeeder.js';
import { pushBotChangelog } from '../botChangelog.js';
import { iBotVersion } from '../botChangelog.js';

const dir = dirname(fileURLToPath(import.meta.url));

export const name = Events.ClientReady;
export const once = true;
export function execute(client) {
  console.log(`[INFO] Logged in as ${client.user.tag}`);

  // Status data
  const data = JSON.parse(readFileSync(join(dir, '../commands/utility/statusLatest.json'), 'utf8'));
  let icon;
  let message;

  // Syncs user db
  
  User.sync().then(() => {
    return User.findAll();
  }).then(async (users) => {
    console.log('[INFO] User table:');
    for (const user of users) {
      const userId = user.getDataValue('id');
      const userObj = await client.users.fetch(userId);

      console.log(`[INFO] @${userObj.username} (${userId})`);
      console.log(`     |-c4Wins: ${user.getDataValue('c4Wins')}`);
      console.log(`     |-c4Losses: ${user.getDataValue('c4Losses')}`);
      console.log(`     |-yahtzeeMultiWins: ${user.getDataValue('yahtzeeMultiWins')}`);
      console.log(`     |-yahtzeeHighScore: ${user.getDataValue('yahtzeeHighScore')}`);
      console.log(`     |-yahtzeeTotalScore: ${user.getDataValue('yahtzeeTotalScore')}`);
      console.log(`     |-diceColour: ${user.getDataValue('diceColour')}`);
      console.log(`     |-currency: ${user.getDataValue('currency')}`);
    }
  }).catch(e => {
    console.error(`[ERR!] ${e}`);
  });
  
  // If new iBot Version is ready to be released,
  // This will post a changelog if enabled. 

  // ! Uncomment the function when ready to release version.
  // pushBotChangelog(client);


  // Syncs pokemon db
  Pokemon.sync().then(() => {
    console.log('[INFO] Pokemon TCG Database synced!');
  }).catch(e => {
    console.error(`[ERR!] ${e}`);
  });


  // Seeds Pokemon DB
  // ! Uncomment the seed command when needed
  // seedPokemon();
  // ! Uncomment if table needs to be reset (i.e. for duplicates)
  // Pokemon.drop();


  // TEST LOG FOR POKEMON DB
  // console.log('[COMMAND TEST] ' + Pokemon.findOne({ where: { id: 'POR003' } }));

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
  console.log(`[EVNT] Set the status to: (${data.botStatus.status}) ${message}${data.botStatus.value}`);

  const devChannel = client.channels.cache.get('1099564476698726401');
  const embed = new EmbedBuilder()
    .setColor('#68AB3F')
    .setTitle('Logged in')
    .setTimestamp()
    .setDescription(`-# **Status:** ${icon} ${message}${data.botStatus.value}
      -# **Version:** ${iBotVersion}`);

  devChannel.send({ embeds: [embed], flags: [MessageFlags.SuppressNotifications] });
}
