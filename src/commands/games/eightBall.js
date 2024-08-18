// Eight Ball Project by Mr. Cologne!
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8-ball')
    .setDescription('Ask the Magic 8 ball a question')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('Ask your question')
        .setRequired(true),
    ),

  async execute(interaction) {
    const user = interaction.user.id;
    let question = interaction.options.getString('question');
    const channel = interaction.channel;
    if (!question.endsWith('?')) {
      question = `${question}?`;
    }
    await interaction.reply(`<@${user}> asked: "${question}"`);
    const response = () => {
      switch (Math.floor(Math.random() * 30)) {
        case 0:
          return 'It is certain!';
        case 1:
          return 'ermm... ask again maybe?';
        case 2:
          return 'Don\'t count on it lol';
        case 3:
          return 'It is apparently so.';
        case 4:
          return 'Unfortunately, yes.';
        case 5:
          return 'oooh... :grimacing: I.. uh.. don\'t think so';
        case 6:
          return 'I AM BUSY GO AWAY';
        case 7:
          return 'No yeah.';
        case 8:
          return 'Yeah no.';
        case 9:
          return 'Ok yeah so basically like yeah no so yeah but also no yeah so yeah no no yeah yeah no. yeah.  i think.';
        case 10:
          return 'FUCK YEAH';
        case 11:
          return 'probably not';
        case 12:
          return 'hmm.. Try asking The 7 ball?';
        case 13:
          return 'LMFAOOOOOOOOOOO yeah ;)';
        case 14:
          return 'Figure it out yourself.';
        case 15:
          return 'Microsoft Outlook not so good.';
        case 16:
          return 'Fortunately, no';
        case 17:
          return 'probs';
        case 18:
          return ':smiley: :smiley: :smiley: no :smiley: :smiley: :smiley: ';
        case 19:
          return 'maybe ;) ';
        case 20:
          return 'maybe.. :/';
        case 21:
          return 'yar! ^w^';
        case 22:
          return 'YARRGGHHHH!!! (no) ';
        case 23:
          return 'when pigs fly LOL';
        case 24:
          return 'shut up!';
        case 25:
          return 'yeah';
        case 26:
          return 'nah';
        case 27:
          return 'i guess';
        case 28:
          return 'nay! -horse';
        case 29:
          return 'YOU SHOULD NOT BE ASKING THIS.';
      }
    };
    setTimeout(async () => {
      await channel.send(`**The Magic :8ball: Ball replies with:** "${response()}"`);
    }, 1000);
  },
};

// Command complete! :)
// THIS IS A TEST LINE. 