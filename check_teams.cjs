const fs = require('fs');

const files = fs.readdirSync('public/teams');
console.log(files);
