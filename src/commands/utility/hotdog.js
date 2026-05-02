// * Imports
import {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionCallback,
} from 'discord.js';

// * Command Builder for name and parameters

export const data = new SlashCommandBuilder()
  .setName('hotdog')
  .setDescription('oh, HOT DOG!');


// * The Command Function

export async function execute(interaction) {
    await interaction.deferReply();
     await interaction.deleteReply();
    await interaction.channel.send(':hotdog:')
};