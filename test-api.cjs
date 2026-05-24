const fetch = require('node-fetch'); // wait, fetch is built-in in node 18+. I'll just use https module to be safe since it's node 14.

const https = require('https');

const data = JSON.stringify({
  contents: [{
    parts: [{ text: "Hello" }]
  }]
});

const req = https.request('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCXSHbnX-WOQgeKWO4LxWJDYNY13xpvfWc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${body}`);
  });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
