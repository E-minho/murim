const fs = require('fs');

const files = fs.readdirSync('public/characters');
console.log(files.length + " files:");
console.log(files.join(', '));
