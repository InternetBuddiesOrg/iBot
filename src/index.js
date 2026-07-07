import {
  Client,
  Collection,
  GatewayIntentBits,
} from 'discord.js';
import chalk from 'chalk';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import 'dotenv/config';
const { token } = process.env;

// * Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});
client.embedColour = '#F47BA2';

// * Command handler
client.commands = new Collection();
const foldersPath = fileURLToPath(new URL('./commands', import.meta.url));
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
    else {
      console.warn(`[${chalk.yellow('WARN')}]  The command at ${filePath} is missing a required 'data' or 'execute' property`);
    }
  }
}

// * Event handler
const eventsPath = fileURLToPath(new URL('./events', import.meta.url));
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = await import(pathToFileURL(filePath).href);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// * Log in
client.login(token);
