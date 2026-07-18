// This command is to be run when iBot is officially updated.
// It will send a changelog to #general in iBo of new features
// Changelog message MUST be inputed in the changelogMessage variable
// ! YOU MUST ENABLE THIS SCRIPT IN ready.js

import chalk from 'chalk';

const channelID = '1099515790383906838'; // #general channel
// const channelID = '1099564476698726401'; // #dev channel
export const iBotVersion = 0.2;
const changelogMessage =
`**HEYYYY EVERYPONYYYYYY**
iBot just got #UPDATED!!!!!!!
(version 0.2)

🎶 Let Me Give You the Lowwwwdown: 🎵

**NEW** \`/define\` command!
- Look up the definition of any word or phrase! Wow!!

**IT'S BACK!!!** Word of the Day!
- Love it or hate it, iBot will be posting daily informative terms in <#1149549485928747120> to widen your vocabulary!! Yay!!
-# - *not guaranteed to not just randomly break sometimes. im just a girl with a dream let me have this please god just let it work please plesae

Thanks for reading~ have an iBo-tacular day !! <3`;


export async function pushBotChangelog(client) {

  try {
    const channel = await client.channels.fetch(channelID);

    if (!channel) {
      console.log(`[${chalk.yellow('WARN')}] Channel not found! Check channelID to ensure it is the correct ID number.`);
      return;
    }

    await channel.send(`${changelogMessage}`);
    console.log(`[${chalk.green('INFO')}] iBot Version ${iBotVersion} changelog has been posted!`);
  }
  catch (e) {
    console.error(`[${chalk.red('ERR!')}] An error occured while sending message: `, e);
  }
}

