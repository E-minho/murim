const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const url = "https://drive.google.com/drive/folders/18hKvgFkNMOxyFxUz363XJdU7BiO9FWMP?usp=sharing";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // The HTML contains a giant script tag with file data, like:
    // ["FILE_ID", "FILENAME", ...]
    // Let's try to extract FILE_ID and FILENAME pairs.
    // Usually it looks like: ["12345ABCDE...", "baekho.png.png",
    
    // An easier regex: we match the filename, and a few characters before it there is the ID.
    // Actually, let's try to just use curl on a known good tool, or parse the chunk.
    const fileIdRegex = /\["([^"]+)"\s*,\s*"([^"]+\.(?:png|jpg|jpeg|mp3))"/g;
    
    let match;
    const files = [];
    while ((match = fileIdRegex.exec(data)) !== null) {
       // match[1] is ID, match[2] is filename
       if(match[1].length > 15 && match[1].length < 40) {
           files.push({ id: match[1], name: match[2] });
       }
    }
    
    // dedup
    const uniqueFiles = [];
    const seen = new Set();
    for(const f of files) {
        if(!seen.has(f.name)) {
            seen.add(f.name);
            uniqueFiles.push(f);
        }
    }
    
    console.log(`Found ${uniqueFiles.length} files.`);
    
    // Create public dir if not exists
    if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
    }

    uniqueFiles.forEach(f => {
        console.log(`Downloading ${f.name}...`);
        try {
            execSync(`curl -s -L "https://drive.google.com/uc?export=download&id=${f.id}" -o "public/${f.name}"`);
        } catch(e) {
            console.error(`Failed to download ${f.name}`);
        }
    });
    
    console.log("Done.");
  });
});
