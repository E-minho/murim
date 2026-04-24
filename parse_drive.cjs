const { execSync } = require('child_process');
const fs = require('fs');

async function downloadExtraGdriveFiles() {
  const url = "https://drive.google.com/drive/folders/1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-?usp=sharing";
  
  // We cannot easily do recursive scrape without gdown or API.
  // BUT we *know* the names the user wants. So we can't get their IDs unless we guess.
  // Wait, if we can't get IDs, we can't download.
  
  // Can we parse the full JSON state from Drive? 
  // Let's use curl to get the full HTML, then search for ALL lines containing 'png'
  const html = execSync(`curl -sL "${url}"`).toString();
  
  const idRegex = /1[a-zA-Z0-9_-]{32}/g;
  const ids = [...new Set(html.match(idRegex) || [])];
  console.log("Total unique IDs found in HTML:", ids.length);
  
  // Google Drive HTML includes a huge array like `window._DRIVE_check` or `<script>AF_initDataCallback...`
  // The filename usually appears near its ID.
  const pairs = [];
  for(const id of ids) {
      const idx = html.indexOf(id);
      if(idx !== -1) {
          const chunk = html.substring(idx - 200, idx + 400);
          const fnMatch = chunk.match(/([^"]+\.(?:png|jpg|jpeg|mp3))/);
          if (fnMatch) {
              const name = fnMatch[1].replace(/\\u0026/g, '&').replace(/\\u003d/g, '=').split('/').pop();
              if (name && !name.includes('icon.png') && !name.includes('broken_image')) {
                 pairs.push({ id, name });
              }
          }
      }
  }
  
  console.log("Found pairs:", pairs);
}

downloadExtraGdriveFiles();
