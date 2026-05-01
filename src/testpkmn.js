// ! THIS COMMAND IS DISABLED. 

// import axios from 'axios';
// import https from 'https';

// const url = 'https://www.pokemoncenter.com/category/new-releases';

// const agent = new https.Agent({ keepAlive: false });

// try {
//   // Use GET (some servers return malformed responses to HEAD) and disable keepAlive
//   const response = await axios.get(url, {
//     maxRedirects: 0,
//     validateStatus: () => true,
//     httpsAgent: agent,
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (compatible; iBot/1.0)',
//     },
//     // don't automatically decompress/parse large bodies if you only need headers:
//     responseType: 'stream',
//   });

//   // if you only care about headers, you can immediately destroy the stream
//   if (response.data && typeof response.data.destroy === 'function') {
//     response.data.destroy();
//   }

//   if (response.status === 302 && response.headers.location?.includes('_Incapsula_Resource')) {
//     console.log('Queue detected.');
//     console.log(response.status);
//     console.log(response.headers);
//   }
//   else {
//     console.log(response.status);
//     console.log(response.headers);
//   }
// }
// catch (e) {
//   console.error(e);
// }

// debugger;
