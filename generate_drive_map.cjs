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
                 const chunk = data.substring(idx, idx + 400);
                 
                 // Look for [ "filename", ... ] adjacent to ID
                 let m = chunk.match(/\["([^"]+\.(?:png|jpg|jpeg|mp3))"/);
                 if (!m) {
                     m = chunk.match(/&quot;([^&"]+\.(?:png|jpg|jpeg|mp3))&quot;/);
                 }
                 
                 if (m) {
                     mapping[m[1]] = id;
                 } else {
                     // try looking back
                     const backChunk = data.substring(Math.max(0, idx - 400), idx + 200);
                     m = backChunk.match(/\["([^"]+\.(?:png|jpg|jpeg|mp3))"/);
                     if (!m) m = backChunk.match(/&quot;([^&"]+\.(?:png|jpg|jpeg|mp3))&quot;/);
                     if (m) {
                         mapping[m[1]] = id;
                     }
                 }
             }
         }
         console.log(urlId, "found", Object.keys(mapping).length);
         resolve(mapping);
      });
    });
  });
}

(async () => {
  const chars = await fetchDriveFolder('1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-');
  const teams = await fetchDriveFolder('1QbN7-uPR0GTc6zskdt7ZW8h04nS874jw');
  const teammark = await fetchDriveFolder('1nJbTUh8PdkRUFC_8CZtcoUVV0RwbgMEj');
  const main = await fetchDriveFolder('18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP'); 
  
  const allMap = { chars, teams, teammark, main };
  fs.writeFileSync('src/data/driveMap.ts', "export const DRIVE_MAP = " + JSON.stringify(allMap, null, 2) + ";\n");
})();
