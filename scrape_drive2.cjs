const https = require('https');
const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Match anything ending in .png, .jpg, .jpeg, .mp3, with CJK characters too
    const matches = data.match(/\\x22([^\\]+?\.(png|mp3|jpg|jpeg))\\x22/g);
    if(matches) {
        let unique = [...new Set(matches.map(m => m.replace(/\\x22/g, '')))];
        // Filter out obviously wrong ones
        unique = unique.filter(u => u.length < 50 && !u.includes('!'));
        console.dir(unique, { maxArrayLength: null });
    } else {
        console.log("No file names matched.");
    }
  });
});
