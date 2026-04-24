const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeFolder(browser, urlId) {
  const page = await browser.newPage();
  const mapping = {};
  
  page.on('response', async (response) => {
    try {
      const text = await response.text();
      const ids = text.match(/1[a-zA-Z0-9_-]{32}/g) || [];
      const uniqueIds = [...new Set(ids)].filter(id => id !== urlId); // Exclude the folder ID itself!
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
  
  await page.goto(`https://drive.google.com/drive/folders/${urlId}?usp=sharing`, { waitUntil: 'networkidle2' });
  
  // press PageDown many times
  for(let i=0; i<30; i++) {
     await page.keyboard.press('PageDown');
     await new Promise(r => setTimeout(r, 200));
  }
  
  await page.close();
  return mapping;
}

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  const chars = await scrapeFolder(browser, '1C0CEqih1krK7RHJ5V9O7BPPWpc93OhO-');
  console.log("Chars:", Object.keys(chars).length);
  const teams = await scrapeFolder(browser, '1QbN7-uPR0GTc6zskdt7ZW8h04nS874jw');
  console.log("Teams:", Object.keys(teams).length);
  const teammark = await scrapeFolder(browser, '1nJbTUh8PdkRUFC_8CZtcoUVV0RwbgMEj');
  console.log("Teammark:", Object.keys(teammark).length);
  const main = await scrapeFolder(browser, '18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP'); 
  console.log("Main:", Object.keys(main).length);
  
  const allMap = { chars, teams, teammark, main };
  // Check specifically for problematic ones
  console.log("Chars 갈향:", chars['갈향.png']);
  console.log("Chars 하묘:", chars['하묘.png']);
  console.log("Chars 상돈:", chars['상돈.png']);
  console.log("Team 광음사제:", teams['광음사제.png']);
  console.log("Teammark 광음사제:", teammark['광음사제.png']);
  
  fs.writeFileSync('src/data/driveMap.ts', "export const DRIVE_MAP: Record<string, any> = " + JSON.stringify(allMap, null, 2) + ";\n");
  await browser.close();
})();
