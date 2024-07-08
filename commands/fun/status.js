const {
  ActivityType,
  PresenceUpdateStatus,
  SlashCommandBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Sets the bot\'s status to whatever your heart desires')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('The bot\'s online status')
        .setRequired(true)
        .addChoices(
          { name: 'Online', value: 'online' },
          { name: 'Idle', value: 'idle' },
          { name: 'Do Not Disturb', value: 'dnd' },
        ),
    )
    .addStringOption(option =>
      option.setName('activity')
        .setDescription('The bot\'s activity type')
        .setRequired(true)
        .addChoices(
          { name: 'Competing in', value: 'competing' },
          { name: 'Custom', value: 'custom' },
          { name: 'Listening to', value: 'listening' },
          { name: 'Playing', value: 'playing' },
          { name: 'Streaming', value: 'streaming' },
          { name: 'Watching', value: 'watching' },
        ),
    )
    .addStringOption(option =>
      option.setName('value')
        .setDescription('The bot\'s activity status')
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const status = interaction.options.getString('status');
    const activity = interaction.options.getString('activity') ?? null;
    const value = interaction.options.getString('value');
    let icon;
    let message;

    switch (status) {
    case 'online':
      interaction.client.user.setStatus(PresenceUpdateStatus.Online);
      icon = '<:online:1259666387455184927>';
      break;
    case 'idle':
      interaction.client.user.setStatus(PresenceUpdateStatus.Idle);
      icon = '<:idle:1259666385093529700>';
      break;
    case 'dnd':
      interaction.client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);
      icon = '<:dnd:1259666382350585907>';
      break;
    }

    switch (activity) {
    case 'competing':
      interaction.client.user.setActivity(value, { type: ActivityType.Competing });
      message = 'Competing in ';
      break;
    case 'custom':
      interaction.client.user.setActivity(value, { type: ActivityType.Custom });
      message = '';
      break;
    case 'listening':
      interaction.client.user.setActivity(value, { type: ActivityType.Listening });
      message = 'Listening to ';
      break;
    case 'playing':
      interaction.client.user.setActivity(value, { type: ActivityType.Playing });
      message = 'Playing ';
      break;
    case 'streaming':
      interaction.client.user.setActivity(value, {
        type: ActivityType.Streaming,
        url: 'https://www.twitch.tv/protozappy',
      });
      icon = '<:streaming:1259666381771640842>';
      message = 'Streaming ';
      break;
    case 'watching':
      interaction.client.user.setActivity(value, { type: ActivityType.Watching });
      message = 'Watching ';
      break;
    }

    const devChannel = interaction.client.channels.cache.get('1099564476698726401');
    await devChannel.send({
      content: `**@${interaction.user.username} set the status to:**\n${icon} ${message}${value}`,
      flags: [4096],
    });
    await interaction.editReply({
      content: `**Successfully set status to:**\n${icon} ${message}${value}`,
      ephemeral: true,
    });
  },
};
