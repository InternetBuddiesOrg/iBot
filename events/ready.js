const {
  Events,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`[INFO] Logged in as ${client.user.tag}`);
    const devChannel = client.channels.cache.get('1099564476698726401');
    const embed = new EmbedBuilder()
      .setColor('#68AB3F')
      .setTitle(`Logged in as ${client.user.tag}`)
      .setTimestamp();
    devChannel.send({ embeds: [embed] });
  },
};
