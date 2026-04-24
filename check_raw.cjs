const https = require('https');
https.get('https://drive.google.com/drive/folders/1nJbTUh8PdkRUFC_8CZtcoUVV0RwbgMEj?usp=sharing', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
     console.log("주작 found:", data.includes('주작'));
     console.log("염응 found:", data.includes('염응'));
  });
});
