const https = require('https');
const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const matches = data.match(/\\x22([a-zA-Z0-9_\-\.]+?\.(png|mp3|jpg|jpeg))\\x22/g);
    if(matches) {
        console.log("Found some files:");
        const unique = [...new Set(matches.map(m => m.replace(/\\x22/g, '')))];
        console.dir(unique);
    } else {
        console.log("No file names matched.");
    }
  });
});
