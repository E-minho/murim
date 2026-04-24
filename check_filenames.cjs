const https = require('https');
const url = "https://drive.google.com/drive/folders/1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const fnMatch = data.match(/[^"&,]+?\.(?:png|jpg|jpeg)[^"&]*/g) || [];
    const unique = [...new Set(fnMatch)];
    console.log(unique);
  });
});
