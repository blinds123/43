const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

(async () => {
  // Create a simple HTTP server
  const app = express();
  app.use(express.static('.'));
  
  const server = app.listen(3000, () => {
    console.log('Test server running on http://localhost:3000');
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/index.html');
    await page.waitForLoadState('networkidle');

    console.log('🌐 TESTING WITH HTTP SERVER\n');

    // Test image loading
    const imageTest = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const results = {
        total: images.length,
        loaded: 0,
        errors: 0,
        details: []
      };
      
      images.forEach((img, index) => {
        const status = img.complete && img.naturalHeight !== 0 ? 'LOADED' : 'ERROR';
        if (status === 'LOADED') results.loaded++;
        else results.errors++;
        
        results.details.push({
          index: index + 1,
          src: img.src,
          status: status,
          alt: img.alt || 'No alt text'
        });
      });
      
      return results;
    });

    console.log(`📊 IMAGE LOADING RESULTS:`);
    console.log(`Total Images: ${imageTest.total}`);
    console.log(`Successfully Loaded: ${imageTest.loaded}`);
    console.log(`Failed to Load: ${imageTest.errors}`);
    console.log(`Success Rate: ${Math.round((imageTest.loaded / imageTest.total) * 100)}%\n`);

    if (imageTest.errors > 0) {
      console.log('❌ FAILED IMAGES:');
      imageTest.details.filter(img => img.status === 'ERROR').forEach(img => {
        console.log(`   ${img.index}. ${img.alt} - ${img.src}`);
      });
    } else {
      console.log('✅ ALL IMAGES LOADED SUCCESSFULLY!');
    }

    // Test CSS background images
    const bgTest = await page.evaluate(() => {
      const elements = document.querySelectorAll('.morning-bg, .study-bg, .night-bg');
      const results = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        results.push({
          className: el.className,
          backgroundImage: bgImage,
          hasBackground: bgImage !== 'none'
        });
      });
      
      return results;
    });

    console.log('\n🎨 CSS BACKGROUND IMAGES:');
    bgTest.forEach(bg => {
      const status = bg.hasBackground ? '✅' : '❌';
      console.log(`   ${status} ${bg.className}`);
    });

    if (imageTest.loaded === imageTest.total && bgTest.every(bg => bg.hasBackground)) {
      console.log('\n🎉 PERFECT! ALL IMAGES WORKING WITH HTTP SERVER');
      console.log('🚀 Ready for Vercel deployment!');
    } else {
      console.log('\n⚠️ Some issues found - needs fixing');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    server.close();
  }
})();