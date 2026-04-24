const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  const mapping = {};
  
  page.on('response', async (response) => {
    try {
      const text = await response.text();
      const ids = text.match(/1[a-zA-Z0-9_-]{32}/g) || [];
      const uniqueIds = [...new Set(ids)];
      if (uniqueIds.length > 0) {
        for(const id of uniqueIds) {
           const idx = text.indexOf(id);
           if(idx !== -1) {
               const chunk = text.substring(Math.max(0, idx - 400), idx + 400);
               let m = chunk.match(/\["([^"]+\.(?:png|jpg|jpeg|mp3))"/);
               if (!m) m = chunk.match(/&quot;([^&"]+\.(?:png|jpg|jpeg|mp3))&quot;/);
               if (!m) m = chunk.match(/"([^"]+\.png)"/);
               if (m) {
                   let name = m[1].replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
                   name = name.split('/').pop().replace(/&quot;/g, '').replace(/\[/g, '').replace(/\\/g, '');
                   if (name && !name.includes('icon.png') && !name.includes('broken_image')) {
                       mapping[name] = id;
                   }
               }
           }
        }
      }
    } catch(e) {}
  });
  
  await page.goto('https://drive.google.com/drive/folders/1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-?usp=sharing', { waitUntil: 'networkidle2' });
  
  // press PageDown many times
  for(let i=0; i<50; i++) {
     await page.keyboard.press('PageDown');
     await new Promise(r => setTimeout(r, 200));
  }
  
  console.log("Found:", Object.keys(mapping).length);
  fs.writeFileSync('raw_chars.json', JSON.stringify(mapping, null, 2));
  await browser.close();
})();
