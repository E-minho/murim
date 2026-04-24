const https = require('https');
https.get("https://drive.google.com/thumbnail?id=1-byU_XMQPzKI_YQQGYQ_66888Qe7KLJC&sz=w200", (res) => {
  console.log(res.statusCode);
});
