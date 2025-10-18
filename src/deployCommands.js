import {
  REST,
  Routes,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
require('dotenv').config();
const {
  token,
  clientId,
} = process.env;

const commands = [];
const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
    else {
      console.warn(`[WARN] The command at ${filePath} is missing a required 'data' or 'execute' property`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`[INFO] Started reloading ${commands.length} application commands`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log(`[INFO] Successfully reloaded ${data.length} application commands`);
  }
  catch (error) {
    console.error(`[ERR!] ${error}`);
  }
})();
