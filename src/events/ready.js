const {
  Events,
  EmbedBuilder,
  PresenceUpdateStatus,
  ActivityType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`[INFO] Logged in as ${client.user.tag}`);

    const statusData = JSON.parse(fs.readFileSync(path.join(__dirname, '../commands/utility/statusLatest.json'), 'utf8'));
    let icon;
    let message;

    switch (statusData.status) {
    case 'online':
      client.user.setStatus(PresenceUpdateStatus.Online);
      icon = '<:online:1266485857653620836>';
      break;
    case 'idle':
      client.user.setStatus(PresenceUpdateStatus.Idle);
      icon = '<:idle:1266485882261733506>';
      break;
    case 'dnd':
      client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);
      icon = '<:dnd:1266485896866172958>';
      break;
    }

    switch (statusData.activity) {
    case 'competing':
      client.user.setActivity(statusData.value, { type: ActivityType.Competing });
      message = 'Competing in ';
      break;
    case 'custom':
      client.user.setActivity(statusData.value, { type: ActivityType.Custom });
      message = '';
      break;
    case 'listening':
      client.user.setActivity(statusData.value, { type: ActivityType.Listening });
      message = 'Listening to ';
      break;
    case 'playing':
      client.user.setActivity(statusData.value, { type: ActivityType.Playing });
      message = 'Playing ';
      break;
    case 'streaming':
      client.user.setActivity(statusData.value, {
        type: ActivityType.Streaming,
        url: 'https://www.twitch.tv/protozappy',
      });
      icon = '<:streaming:1266485909688287303>';
      message = 'Streaming ';
      break;
    case 'watching':
      client.user.setActivity(statusData.value, { type: ActivityType.Watching });
      message = 'Watching ';
      break;
    }
    console.log(`[EVNT] Set the status to: (${statusData.status}) ${message}${statusData.value}`);

    const devChannel = client.channels.cache.get('1099564476698726401');
    const embed = new EmbedBuilder()
      .setColor('#68AB3F')
      .setTitle('Logged in')
      .setTimestamp()
      .setDescription(`-# **Status:** ${icon} ${message}${statusData.value}`);

    devChannel.send({ embeds: [embed], flags: [4096] }); // @silent message
  },
};
