const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

async function downloadFolder(urlId, destDir) {
  const url = `https://drive.google.com/drive/folders/${urlId}?usp=sharing`;
  console.log(`Fetching ${destDir}...`);
  return new Promise((resolve) => {
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
                 const fnMatch = chunk.match(/&quot;([^&]+\.(?:png|jpg|jpeg|mp3))&quot;/);
                 let name = null;
                 if (fnMatch) name = fnMatch[1];
                 
                 if (name) {
                     pairs.push({ id, name });
                 }
             }
         }
         
         if(!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
         
         console.log(`Found ${pairs.length} files in ${destDir}`);
         for(const f of pairs) {
             console.log(`Downloading ${f.name} into ${destDir} ...`);
             try {
                 execSync(`curl -sL "https://drive.google.com/uc?export=download&id=${f.id}" -o "${destDir}/${f.name}"`);
             } catch(e) {
                 console.log("Failed " + f.name);
             }
         }
         resolve();
      });
    });
  });
}

(async () => {
  await downloadFolder('1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-', 'public/characters');
  await downloadFolder('1QbN7-uPR0GTc6zskdt7ZW8h04nS874jw', 'public/teams');
  await downloadFolder('1nJbTUh8PdkRUFC_8CZtcoUVV0RwbgMEj', 'public/teammark');
  console.log("All done!");
})();
