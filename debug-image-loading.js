const { chromium } = require('playwright');

(async () => {
  console.log('🐛 COMPREHENSIVE IMAGE LOADING DEBUG');
  console.log('=====================================\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Enable request/response logging
  const failedRequests = [];
  const successfulRequests = [];
  
  page.on('response', response => {
    if (response.url().includes('/images/')) {
      if (response.status() !== 200) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      } else {
        successfulRequests.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type']
        });
      }
    }
  });

  try {
    console.log('🌐 Loading live Vercel site...');
    await page.goto('https://auralo-hoodie-landing.vercel.app/', { waitUntil: 'networkidle' });
    
    console.log('\n📊 NETWORK REQUESTS ANALYSIS:');
    console.log('=============================');
    console.log(`✅ Successful image requests: ${successfulRequests.length}`);
    console.log(`❌ Failed image requests: ${failedRequests.length}`);
    
    if (failedRequests.length > 0) {
      console.log('\n💥 FAILED REQUESTS:');
      failedRequests.forEach(req => {
        console.log(`   ${req.status} ${req.statusText}: ${req.url}`);
      });
    }
    
    if (successfulRequests.length > 0) {
      console.log('\n✅ SUCCESSFUL REQUESTS:');
      successfulRequests.slice(0, 5).forEach(req => {
        console.log(`   ${req.status} (${req.contentType}): ${req.url}`);
      });
      if (successfulRequests.length > 5) {
        console.log(`   ... and ${successfulRequests.length - 5} more`);
      }
    }

    // Check specific image elements
    console.log('\n🖼️ IMAGE ELEMENT ANALYSIS:');
    console.log('==========================');
    
    const imageAnalysis = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const results = [];
      
      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        results.push({
          index: index + 1,
          src: img.src,
          alt: img.alt,
          loaded: img.complete && img.naturalHeight !== 0,
          visible: rect.width > 0 && rect.height > 0,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: Math.round(rect.width),
          displayHeight: Math.round(rect.height)
        });
      });
      
      return results;
    });

    console.log(`Total IMG elements found: ${imageAnalysis.length}`);
    
    const loadedImages = imageAnalysis.filter(img => img.loaded);
    const failedImages = imageAnalysis.filter(img => !img.loaded && img.src.includes('/images/'));
    
    console.log(`✅ Successfully loaded: ${loadedImages.length}`);
    console.log(`❌ Failed to load: ${failedImages.length}`);
    
    if (failedImages.length > 0) {
      console.log('\n💥 FAILED IMAGE DETAILS:');
      failedImages.forEach(img => {
        console.log(`   ${img.index}. ${img.alt}`);
        console.log(`      Source: ${img.src}`);
        console.log(`      Size: ${img.naturalWidth}×${img.naturalHeight} (${img.displayWidth}×${img.displayHeight} displayed)`);
        console.log('');
      });
    }

    // Test background images
    console.log('\n🎨 CSS BACKGROUND IMAGE ANALYSIS:');
    console.log('=================================');
    
    const bgAnalysis = await page.evaluate(() => {
      const elements = document.querySelectorAll('.morning-bg, .study-bg, .night-bg, .lifestyle-bg');
      const results = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        const rect = el.getBoundingClientRect();
        
        results.push({
          className: el.className,
          backgroundImage: bgImage,
          hasBackground: bgImage !== 'none',
          visible: rect.width > 0 && rect.height > 0,
          size: `${Math.round(rect.width)}×${Math.round(rect.height)}`
        });
      });
      
      return results;
    });

    bgAnalysis.forEach(bg => {
      const status = bg.hasBackground && bg.visible ? '✅' : '❌';
      console.log(`   ${status} ${bg.className} (${bg.size}px)`);
      if (bg.backgroundImage !== 'none') {
        const urls = bg.backgroundImage.match(/url\([^)]+\)/g) || [];
        urls.forEach(url => {
          console.log(`      ${url}`);
        });
      }
    });

    // Test direct image URLs
    console.log('\n🔗 DIRECT URL TESTING:');
    console.log('======================');
    
    const testUrls = [
      'https://auralo-hoodie-landing.vercel.app/images/morning1_optimized.jpg',
      'https://auralo-hoodie-landing.vercel.app/images/compressed_trustpilot_review_Addison_30kb.jpg',
      'https://auralo-hoodie-landing.vercel.app/images/dscxr443e2_optimized%20(1).jpg'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await page.goto(url);
        const contentType = response.headers()['content-type'];
        console.log(`   ✅ ${response.status()} - ${contentType}: ${url}`);
      } catch (error) {
        console.log(`   ❌ FAILED: ${url} - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('====================');
    
    if (failedRequests.length > 0) {
      console.log('1. Fix failed HTTP requests for images');
      console.log('2. Check vercel.json routing configuration');
      console.log('3. Verify image files are committed to git');
    }
    
    if (failedImages.length > 0) {
      console.log('4. Update image src paths to working URLs');
      console.log('5. Check for special characters in filenames');
    }
    
    console.log('\n🚀 Running next phase: Direct file verification...');
  }
})();