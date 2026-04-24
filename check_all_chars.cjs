const https = require('https');
const fs = require('fs');

async function fetchDriveFolder(urlId) {
  const url = `https://drive.google.com/drive/folders/${urlId}?usp=sharing`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
         const ids = data.match(/1[a-zA-Z0-9_-]{32}/g) || [];
         const uniqueIds = [...new Set(ids)];
         const mapping = {};
         for(const id of uniqueIds) {
             const idx = data.indexOf(id);
             if(idx !== -1) {
                 const chunk = data.substring(Math.max(0, idx - 400), idx + 400);
                 
                 // Broad search for anything resembling "filename.png"
                 let m = chunk.match(/([^"&\\]+\.(?:png|jpg|jpeg|mp3))/);
                 if (m) {
                     let name = m[1].replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
                     name = name.split('/').pop().replace(/&quot;/g, '').replace(/\[/g, '').replace(/\\/g, '');
                     if (name && !name.includes('icon.png') && !name.includes('broken_image') && !name.includes('al-icon.png')) {
                         mapping[name] = id;
                     }
                 }
             }
         }
         console.log(urlId, "found", Object.keys(mapping).length);
         resolve(mapping);
      });
      res.on('error', reject);
    });
  });
}

(async () => {
  const chars = await fetchDriveFolder('1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-');
  console.log(chars);
})();
