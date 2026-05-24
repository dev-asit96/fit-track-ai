const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let hasErrors = false;

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
    hasErrors = true;
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text(), msg.location().url);
      hasErrors = true;
    }
  });

  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  const routes = [
    '/dashboard',
    '/workouts',
    '/nutrition',
    '/progress',
    '/ai-coach',
    '/settings'
  ];

  for (const route of routes) {
    console.log(`Navigating to http://localhost:5173${route}`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });
  }

  const hasApiKey = await page.evaluate(() => {
    return window.__VITE_GEMINI_API_KEY_TEST;
  });
  console.log("VITE_GEMINI_API_KEY evaluated in browser:", hasApiKey);

  // Type something into AI Coach if it's there
  try {
    await page.goto('http://localhost:5173/ai-coach', { waitUntil: 'networkidle2' });
    const input = await page.$('input[type="text"]');
    if (input) {
      await input.type('Hello AI Coach!');
      const btn = await page.$('button[type="submit"]');
      if (btn) await btn.click();
      await page.waitForTimeout(3000); // Wait for response
    }
  } catch(e) {
    console.log("Error testing AI coach UI:", e.message);
  }

  await browser.close();

  if (hasErrors) {
    console.error("FLOW TEST FAILED: Errors were detected.");
    process.exit(1);
  } else {
    console.log("FLOW TEST PASSED: No errors detected.");
  }
})();
