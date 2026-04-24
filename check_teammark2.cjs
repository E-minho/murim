const puppeteer = require('puppeteer');

async function check(urlId) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
               let m = chunk.match(/\["([^"]+)"/);
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
  await new Promise(r => setTimeout(r, 2000));
  
  console.log(Object.keys(mapping));
  await browser.close();
}
check('1nJbTUh8PdkRUFC_8CZtcoUVV0RwbgMEj');
