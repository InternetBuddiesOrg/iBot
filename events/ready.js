const {
  ActivityType,
  Events,
} = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`[INFO] Logged in as ${client.user.tag}`);
    client.user.setActivity('the Word of the Day', { type: ActivityType.Watching });
    const devChannel = client.channels.cache.get('1099564476698726401');
    devChannel.send('✅ iBot is now online');
  },
};
