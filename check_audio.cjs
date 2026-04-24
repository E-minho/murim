const https = require('https');
https.get("https://drive.usercontent.google.com/download?id=1oPQ1kqKnGaiumWE2LJCg9FbRb4FK1AJ8&export=download", (res) => {
  console.log(res.statusCode, res.headers);
});
