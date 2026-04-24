const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
         const ids = data.match(/1[a-zA-Z0-9_-]{32}/g) || [];
         
         const unique = [...new Set(ids)];
         for(const id of unique) {
             const idx = data.indexOf(id);
             if(idx !== -1) {
                 const chunk = data.substring(idx, idx + 600);
                 const fnMatch = chunk.match(/&quot;([^&]+\.(?:png|jpg|jpeg|mp3))&quot;/);
                 let name = null;
                 if (fnMatch) name = fnMatch[1];
                 
                 if (name === 'worldbanners.png') {
                     console.log("Found worldbanners!");
                     execSync(`curl -sL "https://drive.google.com/uc?export=download&id=${id}" -o "public/worldbanners.png"`);
                     console.log("Downloaded.");
                 }
             }
         }
  });
});
