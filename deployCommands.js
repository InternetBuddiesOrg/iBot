const {
  REST,
  Routes,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const {
  token,
  clientId,
  guildId,
} = process.env;

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
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
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`[INFO] Successfully reloaded ${data.length} application commands`);
  }
  catch (error) {
    console.error(`[ERR!] ${error}`);
  }
})();
