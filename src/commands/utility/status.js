import {
  ActivityType,
  PresenceUpdateStatus,
  SlashCommandBuilder,
  MessageFlags,
} from 'discord.js';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import {
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const emojis = JSON.parse(readFileSync(join(__dirname, '../../emojis.json'), 'utf8'));

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Sets the bot\'s status to whatever your heart desires')
  .addStringOption(option => option
    .setName('status')
    .setDescription('The bot\'s online status')
    .setRequired(true)
    .addChoices(
      { name: 'Online', value: 'online' },
      { name: 'Idle', value: 'idle' },
      { name: 'Do Not Disturb', value: 'dnd' },
    ),
  )
  .addStringOption(option => option
    .setName('activity')
    .setDescription('The bot\'s activity type')
    .setRequired(true)
    .addChoices(
      { name: 'Competing in', value: 'competing' },
      { name: 'Custom', value: 'custom' },
      { name: 'Listening to', value: 'listening' },
      { name: 'Playing', value: 'playing' },
      { name: 'Streaming', value: 'streaming' },
      { name: 'Watching', value: 'watching' },
    ),
  )
  .addStringOption(option => option
    .setName('value')
    .setDescription('The bot\'s activity status')
    .setRequired(true),
  );
export async function execute(interaction) {
  await interaction.deferReply({
    flags: [MessageFlags.Ephemeral],
  });
  const status = interaction.options.getString('status');
  const activity = interaction.options.getString('activity');
  const value = interaction.options.getString('value');
  const dir = dirname(fileURLToPath(import.meta.url));
  writeFileSync(join(dir, './statusLatest.json'), JSON.stringify({
    botStatus: { status, activity, value },
  }, null, 2));
  let icon;
  let message;

  switch (status) {
    case 'online':
      interaction.client.user.setStatus(PresenceUpdateStatus.Online);
      icon = emojis.online;
      break;
    case 'idle':
      interaction.client.user.setStatus(PresenceUpdateStatus.Idle);
      icon = emojis.idle;
      break;
    case 'dnd':
      interaction.client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);
      icon = emojis.dnd;
      break;
  }

  switch (activity) {
    case 'competing':
      interaction.client.user.setActivity(value, { type: ActivityType.Competing });
      message = 'Competing in ';
      break;
    case 'custom':
      interaction.client.user.setActivity(value, { type: ActivityType.Custom });
      message = '';
      break;
    case 'listening':
      interaction.client.user.setActivity(value, { type: ActivityType.Listening });
      message = 'Listening to ';
      break;
    case 'playing':
      interaction.client.user.setActivity(value, { type: ActivityType.Playing });
      message = 'Playing ';
      break;
    case 'streaming':
      interaction.client.user.setActivity(value, {
        type: ActivityType.Streaming,
        url: 'https://www.twitch.tv/vyxtella',
      });
      icon = emojis.streaming;
      message = 'Streaming ';
      break;
    case 'watching':
      interaction.client.user.setActivity(value, { type: ActivityType.Watching });
      message = 'Watching ';
      break;
  }

  const devChannel = interaction.client.channels.cache.get('1099564476698726401');
  await devChannel.send({
    content: `**@${interaction.user.username} set the status to:**\n${icon} ${message}${value}`,
    flags: [MessageFlags.SuppressNotifications],
  });
  await interaction.editReply({
    content: `**Successfully set status to:**\n${icon} ${message}${value}`,
    flags: [MessageFlags.Ephemeral],
  });
  console.log(`[${chalk.green('INFO')}]  @${interaction.user.username} set the status to: (${status}) ${message}${value}`);
}
