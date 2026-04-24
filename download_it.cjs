const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
     const pairs = [];
     const ids = data.match(/1[a-zA-Z0-9_-]{32}/g) || [];
     
     const unique = [...new Set(ids)];
     for(const id of unique) {
         const idx = data.indexOf(id);
         if(idx !== -1) {
             const chunk = data.substring(idx, idx + 600);
             // We just want the filename part
             const fnMatch = chunk.match(/&quot;([^&]+\.(?:png|jpg|jpeg|mp3))&quot;/);
             let name = null;
             if (fnMatch) name = fnMatch[1];
             
             if (name) {
                 pairs.push({ id, name });
             }
         }
     }
     
     console.log(`Found ${pairs.length} files. Downloading...`);
     
     if(!fs.existsSync('public')) fs.mkdirSync('public');
     
     for(const f of pairs) {
         console.log(`Downloading ${f.name} ...`);
         try {
             // For large files, curl might timeout or get a virus warning interstitial.
             // We will try standard curl, keeping it simple. For Google Drive, this works for small files.
             execSync(`curl -sL "https://drive.google.com/uc?export=download&id=${f.id}" -o "public/${f.name}"`);
         } catch(e) {
             console.log("Failed " + f.name);
         }
     }
     
     console.log("Done downloads.");
  });
});
