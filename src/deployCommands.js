import {
  REST,
  Routes,
} from 'discord.js';
import chalk from 'chalk';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import 'dotenv/config';
const {
  token,
  clientId,
  guildId,
} = process.env;

const commands = [];
const foldersPath = fileURLToPath(new URL('./commands', import.meta.url));
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
    else {
      console.warn(`[${chalk.yellow('WARN')}] The command at ${filePath} is missing a required 'data' or 'execute' property`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`[${chalk.green('INFO')}] Started reloading ${commands.length} application commands`);

    // ^ Deploys as Guild Commands for now until iBot maybe goes public someday
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`[${chalk.green('INFO')}] Successfully reloaded ${data.length} application commands`);
  }
  catch (e) {
    console.error(`[${chalk.red('ERR!')}] ${e}`);
  }
})();
