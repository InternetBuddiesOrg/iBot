import {
  Events,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const emojis = JSON.parse(readFileSync(join(__dirname, '../emojis.json'), 'utf8'));

export const name = Events.ClientReady;
export const once = true;

// Checks if process is already shutting down (cuz sometimes it wants to call the function twice for some reason so just. no.)
let shutdownRegistered = false;
let isShuttingDown = false;

export async function execute(client) {
  if (shutdownRegistered) return;
  shutdownRegistered = true;

  // Function to run when shutting down
  const shutdown = async reason => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`[${chalk.green('INFO')}] iBot has shut down. Killed via: ${reason}`);
    try {
      const devChannel = client.channels.cache.get('1099564476698726401');
      const embed = new EmbedBuilder()
        .setColor('#B52121')
        .setTitle('iBot is offline')
        .setTimestamp()
        .setDescription(
          `**Status:** ${emojis.offline}\n` +
          `**Killed via:** ${reason}`,
        );

      await devChannel.send({
        embeds: [embed],
        flags: [MessageFlags.SuppressNotifications],
      });
    }
    catch (e) {
      console.error(`[${chalk.red('ERR!')}] Unable to send shutdown message`, e);
    }
    finally {
      process.exit(0);
    }
  };

  // Begin shutdown and call function
  process.on('SIGINT', () => shutdown('Manual stop'));
  process.on('SIGTERM', () => shutdown('Scheduled stop'));
}
