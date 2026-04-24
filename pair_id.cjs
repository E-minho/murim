const https = require('https');
const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
     const pairs = [];
     const ids = data.match(/1[a-zA-Z0-9_-]{32}/g) || [];
     
     // For each unique ID, we search in the string. Shortly after the ID, the filename should appear.
     const unique = [...new Set(ids)];
     for(const id of unique) {
         const idx = data.indexOf(id);
         if(idx !== -1) {
             const chunk = data.substring(idx, idx + 600);
             const fnMatch = chunk.match(/&quot;([^\\]+?\.(?:png|jpg|jpeg|mp3))&quot;/);
             const fnMatch2 = chunk.match(/"([^"]+?\.(?:png|jpg|jpeg|mp3))"/);
             let name = null;
             if (fnMatch) name = fnMatch[1];
             else if (fnMatch2) name = fnMatch2[1];
             
             if (name) {
                 pairs.push({ id, name });
             }
         }
     }
     console.dir(pairs);
  });
});
