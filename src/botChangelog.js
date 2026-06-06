// This command is to be run when iBot is officially updated.
// It will send a changelog to #general in iBo of new features
// Changelog message MUST be inputed in the changelogMessage variable
// ! RIGHT NOW, IT WILL ONLY SEND TO THE DEVELOPMENT CHANNEL.
// ! YOU MUST ENABLE THIS SCRIPT IN ready.js 

import { channelLink } from "discord.js"
import { Events } from "discord.js"


const channelID = '1099515790383906838'; // #general channel
export const iBotVersion = 0.1;
const changelogMessage = `**HELLO GOOBERS!**
iBot has been updated with a :fire: HAWT new FEATURE FOR yOU!
(version 0.1)

Here's what we got in store for you:

**NEW** /hotdog command!
- Just for when you need it! 

That's all! Have a wonderful! `;


export async function pushBotChangelog(client) {

  try {
    const channel = await client.channels.fetch(channelID);

    if (!channel) {
      console.log('[WARN] Channel not found! Check channelID to ensure it is the correct ID number.')
      return;
    }

    await channel.send(`${changelogMessage}`);
    console.log(`iBot Version ${iBotVersion} changelog has been posted!`);
  }
  catch (err) {
    console.error('[ERR!] An error occured while sending message: ', err);
  }
};

