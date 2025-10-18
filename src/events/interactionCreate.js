import {
  Events,
  MessageFlags,
} from 'discord.js';

export const name = Events.InteractionCreate;
export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`[ERR!] No application command found matching ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  }
  catch (error) {
    console.error(`[ERR!] ${error}`);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: `An error occured while executing this command.\n\`\`\`diff\n- [ERR!] ${error}\n\`\`\``, flags: [MessageFlags.Ephemeral] });
    }
    else {
      await interaction.reply({ content: `An error occured while executing this command.\n\`\`\`diff\n- [ERR!] ${error}\n\`\`\``, flags: [MessageFlags.Ephemeral] });
    }
  }

  console.log(`[INFO] Recieved interaction from @${interaction.user.username}: ${interaction}`);
}
