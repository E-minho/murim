const https = require('https');
const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
     // match the file name, then print 100 characters before and after to see structure
     const idx = data.indexOf("baekho.jpg.png");
     if(idx > -1) {
         console.log(data.substring(idx - 150, idx + 100));
     }
  });
});
