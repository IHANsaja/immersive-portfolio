const SITE_URL = 'https://ihanhansaja.dev';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = '4c7500eda38e4f7580da3d6235182161';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

async function submitToSearchEngines() {
  console.log(`🚀 Submitting sitemap and URLs for ${SITE_URL}...`);

  try {
    // 1. Submit Sitemap to Bing
    console.log('\n📡 Pinging Bing...');
    const bingResponse = await fetch(`https://www.bing.com/ping?sitemap=${SITEMAP_URL}`);
    console.log(`Bing Response: ${bingResponse.status} ${bingResponse.statusText}`);

    // 2. Submit Sitemap to Google (Note: Google deprecated the ping endpoint in late 2023, 
    // but we can still attempt it. The primary way for Google is via Search Console UI or robots.txt)
    console.log('\n📡 Pinging Google...');
    const googleResponse = await fetch(`https://www.google.com/ping?sitemap=${SITEMAP_URL}`);
    console.log(`Google Response: ${googleResponse.status} ${googleResponse.statusText}`);

    // 3. Submit to IndexNow (Bing, Yandex, Seznam, etc.)
    console.log('\n⚡ Submitting to IndexNow API...');
    const indexNowResponse = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: 'ihanhansaja.dev',
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: [
          SITE_URL,
          `${SITE_URL}/#about`,
          `${SITE_URL}/#projects`,
          `${SITE_URL}/#skills`,
          `${SITE_URL}/#contact`
        ]
      })
    });
    
    console.log(`IndexNow Response: ${indexNowResponse.status} ${indexNowResponse.statusText}`);
    
    if (indexNowResponse.status === 200) {
      console.log('✅ IndexNow submission successful!');
    } else {
      console.log('⚠️ IndexNow submission might have issues (Ensure your site is deployed and the key file is accessible).');
    }

    console.log('\n🎉 Search engine submission complete!');
  } catch (error) {
    console.error('❌ Error submitting to search engines:', error);
  }
}

submitToSearchEngines();
