const fs = require('fs');
let content = fs.readFileSync('src/data/characters.ts', 'utf8');
content = content.replace(/img: '\/assets\/([^c\/][^\/]*\.png)'/g, "img: '/assets/teams/$1'");
fs.writeFileSync('src/data/characters.ts', content);
