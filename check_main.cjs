const https = require('https');
const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
     const fnMatches = data.match(/&quot;([^&]+\.(?:png|jpg|jpeg|mp3))&quot;/g);
     if (fnMatches) console.log([...new Set(fnMatches)]);
  });
});
