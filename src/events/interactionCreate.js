import {
  Events,
  MessageFlags,
} from 'discord.js';
import chalk from 'chalk';

export const name = Events.InteractionCreate;
export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`[${chalk.red('ERR!')}] No application command found matching ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  }
  catch (e) {
    console.error(`[${chalk.red('ERR!')}] ${e}`);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: `An error occured while executing this command.\n\`\`\`diff\n- [${chalk.red('ERR!')}] ${e}\n\`\`\``, flags: [MessageFlags.Ephemeral] });
    }
    else {
      await interaction.reply({ content: `An error occured while executing this command.\n\`\`\`diff\n- [${chalk.red('ERR!')}] ${e}\n\`\`\``, flags: [MessageFlags.Ephemeral] });
    }
  }

  console.log(`[${chalk.green('INFO')}]  Recieved interaction from @${interaction.user.username}: ${interaction}`);
}
