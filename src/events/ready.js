const {
  Events,
  EmbedBuilder,
  PresenceUpdateStatus,
  ActivityType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const User = require('../sql/models/user');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`[INFO] Logged in as ${client.user.tag}`);

    // Status data
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../commands/utility/statusLatest.json'), 'utf8'));
    let icon;
    let message;

    // Syncs user db
    User.sync().then(() => {
      return User.findAll();
    }).then(users => {
      console.log('[INFO] User table:');
      users.forEach(async user => {
        const userObj = await client.users.fetch(user.id);
        console.log(`[INFO] @${userObj.username} (${user.id})`);
        console.log(`     |-c4Wins: ${user.c4Wins}`);
        console.log(`     |-c4Losses: ${user.c4Losses}`);
        console.log(`     |-yahtzeeMultiWins: ${user.yahtzeeMultiWins}`);
        console.log(`     |-yahtzeeHighScore: ${user.yahtzeeHighScore}`);
        console.log(`     |-yahtzeeTotalScore: ${user.yahtzeeTotalScore}`);
        console.log(`     |-diceColour: ${user.diceColour}`);
      });
    }).catch(e => {
      console.error(`[ERR!] ${e}`);
    });

    switch (data.botStatus.status) {
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

    switch (data.botStatus.activity) {
      case 'competing':
        client.user.setActivity(data.botStatus.value, { type: ActivityType.Competing });
        message = 'Competing in ';
        break;
      case 'custom':
        client.user.setActivity(data.botStatus.value, { type: ActivityType.Custom });
        message = '';
        break;
      case 'listening':
        client.user.setActivity(data.botStatus.value, { type: ActivityType.Listening });
        message = 'Listening to ';
        break;
      case 'playing':
        client.user.setActivity(data.botStatus.value, { type: ActivityType.Playing });
        message = 'Playing ';
        break;
      case 'streaming':
        client.user.setActivity(data.botStatus.value, {
          type: ActivityType.Streaming,
          url: 'https://www.twitch.tv/protozappy',
        });
        icon = '<:streaming:1266485909688287303>';
        message = 'Streaming ';
        break;
      case 'watching':
        client.user.setActivity(data.botStatus.value, { type: ActivityType.Watching });
        message = 'Watching ';
        break;
    }
    console.log(`[EVNT] Set the status to: (${data.botStatus.status}) ${message}${data.botStatus.value}`);

    const devChannel = client.channels.cache.get('1099564476698726401');
    const embed = new EmbedBuilder()
      .setColor('#68AB3F')
      .setTitle('Logged in')
      .setTimestamp()
      .setDescription(`-# **Status:** ${icon} ${message}${data.botStatus.value}`);

    devChannel.send({ embeds: [embed], flags: [4096] }); // @silent message
  },
};
