// This command is to be run when iBot is officially updated.
// It will send a changelog to #general in iBo of new features
// Changelog message MUST be inputed in the changelogMessage variable
// ! RIGHT NOW, IT WILL ONLY SEND TO THE DEVELOPMENT CHANNEL.
// ! YOU MUST ENABLE THIS SCRIPT IN ready.js 

import { channelLink } from "discord.js"
import { Events } from "discord.js"


const channelID = '1099564476698726401'; // #development channel
export const iBotVersion = 0.1
const changelogMessage = `**Hello! I am iBot. This is a test message!** 
iBot is running version ${iBotVersion} `;


export async function pushBotChangelog(client) {
    
    try {
        const channel = await client.channels.fetch(channelID);

        if (!channel) {
            console.log('[WARN] Channel not found! Check channelID to ensure it is the correct ID number.')
            return;
        }

        await channel.send(`${changelogMessage}`);
        console.log(`iBot Version ${iBotVersion} changelog has been posted!`);
    } catch (err) {
        console.error('[ERROR] An error occured while sending message: ', err);   
     }
};

