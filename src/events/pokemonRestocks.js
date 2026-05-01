// ! THIS COMMAND IS DISABLED. 

// import { Events } from 'discord.js';
// import { schedule } from 'node-cron';
// import axios from 'axios';

// // const channelID = '1423397091434299474'; // #pokemon
// const channelID = '1099564476698726401'; // #dev

// // # Read-a-bil-i-ty just for u pookie bear <3 *kiss* owo
// // ty love ily uw uwu

// // * WEBSITES TO MONITOR

// const watchList = ['https://www.pokemoncenter.com/category/new-releases'];

// export const name = Events.ClientReady;
// export async function execute(client) {

//   let queueTrue = false;
//   let status;

//   schedule('*/10 * * * * *', async () => {
//     const channel = client.channels.cache.get(channelID);
//     if (!channel) return;

//     try {
//       // const response = await axios.get(watchList[0]);
//       // const html = response.data;
//       // // TEST PURPOSES: const testHtml = ('<html style="height:100%"><head><META NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW"><meta name="format-detection" content="telephone=no"><meta name="viewport" content="initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><script src="/vice-come-Soldenyson-it-non-Banquoh-Chare-Hart-C" async></script></head><body style="margin:0px;height:100%"><iframe id="main-iframe" src="/_Incapsula_Resource?CWUDNSAI=43&xinfo=6-36846186-0%20NNNN%20RT%281763582964028%2048%29%20q%280%20-1%20-1%20-1%29%20r%281%20-1%29%20U24%20WR%28P%20-1%20-1%200%2060%29&incident_id=1330000510234134195-204198477804211398&edet=47&cinfo=0b0000009e82&rpinfo=0&wrid=868&wrcid=868&cip=76.140.11.61&mth=GET" frameborder=0 width="100%" height="100%" marginheight="0px" marginwidth="0px">Request unsuccessful. Incapsula incident ID: 1330000510234134195-204198477804211398</iframe></body></html>');
//       // const queueDetection = html.includes('Request unsuccessful. Incapsula incident ID'); // false unless incapsula found in dom

//       // if (!queueTrue && queueDetection) {
//       //   queueTrue = true;
//       //   await channel.send('@{role id redacted for test purposes\n# :rotating_light: Pokemon Center may have a queue! \nCheck: https://www.pokemoncenter.com/category/new-releases ');
//       //   console.log('[INFO] Pokemon Center Queue Detected! Sent Alert.');
//       //   status = 'Live';
//       // }
//       // else {
//       //   console.log('[INFO] No Pokemon Center Queue Status Change Detected. Current Status is ' + status);
//       //   if (!queueDetection) {
//       //     queueTrue = false;
//       //     status = 'Not Live';
//       //     await channel.send('# Pokemon Center queue has ended. :(');
//       //     console.log('[INFO] Pokemon Center Queue has ended');
//       //   }
//       // }

//       const response = await axios.head(watchList[0], { maxRedirects: 0, validateStatus: () => true });
//       if (response.status === 302 && response.headers.location?.includes('_Incapsula_Resource')) {
//         console.log('Queue detected.');
//         console.log(response.status);
//         console.log(response.headers.location);
//       }
//       else {
//         console.log(response.status);
//         console.log(response.headers.location);
//       }
//     }
//     catch (e) {
//       console.error(e);
//     }
//   });
// }
