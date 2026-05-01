import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import Pokemon from '../../sql/models/pokemon.js';


export const data = new SlashCommandBuilder()
  // /pokémon
  .setName('pokémon')
  .setDescription('Pokémon TCG commands')
  .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
    // /pokémon collection
    .setName('collection')
    .setDescription('Manage your Pokémon TCG collection')
    .addSubcommand(new SlashCommandSubcommandBuilder()
      // /pokémon collection add <card>
      .setName('add')
      .setDescription('Add a card to your Pokémon TCG collection'),
    )
    .addSubcommand(new SlashCommandSubcommandBuilder()
      // /pokémon collection remove
      .setName('remove')
      .setDescription('Remove a card from your Pokémon TCG collection'),
    ));
export async function execute(interaction) {
  await interaction.reply((await Pokemon.findOne({ where: { id: 'POR003' } })).toJSON().rarity);
}
