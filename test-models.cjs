const https = require('https');

const req = https.get('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCXSHbnX-WOQgeKWO4LxWJDYNY13xpvfWc', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    const data = JSON.parse(body);
    if (data.models) {
      console.log('Available Models:', data.models.map(m => m.name).join(', '));
    } else {
      console.log(body);
    }
  });
});

req.on('error', e => console.error(e));
