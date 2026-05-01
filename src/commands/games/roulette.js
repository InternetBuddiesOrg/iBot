// Roulette Game by Mr. Cologne
// This is a gambling game project for the creation and testing of an iBot currency system for educational and fun purposes.
// This project will include notes for readability, since I forget how code works lol -Mr. Cologne 

// NOTE: The following code builds the command for iBot

import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} from 'discord.js';
import User from '../../sql/models/user.js';

export const data = new SlashCommandBuilder()
  .setName('roulette')
  .setDescription('High Risk, High Reward')
  .addSubcommand(sub => sub
    .setName('help')
    .setDescription('How to play Roulette!')
  );

  export async function execute(interaction) {
  const guildMember = interaction.guild.members.cache.get(interaction.user.id);

  await interaction.reply(`[TEST] Command has triggered.`);
  };
