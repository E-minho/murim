const http = require('http');

http.get('http://127.0.0.1:3000/api/audio/1oPQ1kqKnGaiumWE2LJCg9FbRb4FK1AJ8', { headers: { Range: 'bytes=0-100' } }, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers);
}).on('error', err => console.log("Error:", err));
