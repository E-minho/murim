const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeDrive(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // scroll down multiple times to load all items
  for(let i=0; i<10; i++) {
     await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
     await new Promise(r => setTimeout(r, 1000));
  }
  
  // Now get the html
  const html = await page.content();
  await browser.close();
  
  return html;
}

(async () => {
   const html = await scrapeDrive('https://drive.google.com/drive/folders/1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-?usp=sharing');
   
   // match IDs
   const ids = html.match(/1[a-zA-Z0-9_-]{32}/g) || [];
   const uniqueIds = [...new Set(ids)];
   const mapping = {};
   for(const id of uniqueIds) {
       const idx = html.indexOf(id);
       if(idx !== -1) {
           const chunk = html.substring(Math.max(0, idx - 400), idx + 400);
           
           let m = chunk.match(/\["([^"]+\.(?:png|jpg|jpeg|mp3))"/);
           if (!m) m = chunk.match(/&quot;([^&"]+\.(?:png|jpg|jpeg|mp3))&quot;/);
           
           if (m) {
               let name = m[1].replace(/\\u([0-9a-fA-F]{4})/g, (m, c) => String.fromCharCode(parseInt(c, 16)));
               name = name.split('/').pop().replace(/&quot;/g, '').replace(/\[/g, '').replace(/\\/g, '');
               if (name && !name.includes('icon.png') && !name.includes('broken_image') && !name.includes('al-icon.png')) {
                   mapping[name] = id;
               }
           }
       }
   }
   console.log("Found:", Object.keys(mapping).length);
   fs.writeFileSync('raw_chars.json', JSON.stringify(mapping, null, 2));
})();
