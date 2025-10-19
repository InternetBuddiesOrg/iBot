import {
  REST,
  Routes,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import 'dotenv/config';
const {
  token,
  clientId,
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
