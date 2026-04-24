const https = require('https');
const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
     const matches = data.match(/\["1([a-zA-Z0-9_-]{32})",\[.*?baekho\.jpg\.png/g) || data.match(/1[a-zA-Z0-9_-]{32}/g);
     if (matches) {
         console.log([...new Set(matches)]);
     } else {
         console.log("no match");
     }
  });
});
