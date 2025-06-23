const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 468, height: 800 });
  await page.goto(`file://${process.cwd()}/index.html`);
  await page.waitForLoadState('networkidle');

  console.log('🔍 VERIFYING ALL IMAGES LOAD PROPERLY\n');

  // Check all images on the page
  const imageCheck = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    const backgroundImages = document.querySelectorAll('[style*="background"]');
    const cssBackgrounds = [];
    
    // Get CSS background images
    const elements = document.querySelectorAll('.morning-bg, .study-bg, .night-bg');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        cssBackgrounds.push({
          element: el.className,
          backgroundImage: bgImage
        });
      }
    });
    
    const results = [];
    
    // Check regular images
    images.forEach((img, index) => {
      results.push({
        type: 'img',
        index: index + 1,
        src: img.src,
        alt: img.alt || 'No alt text',
        loaded: img.complete && img.naturalHeight !== 0,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0,
        error: img.src.includes('file://') ? 'Uses local file:// URL' : null
      });
    });
    
    // Check CSS background images
    cssBackgrounds.forEach((bg, index) => {
      const hasFileUrl = bg.backgroundImage.includes('file://');
      results.push({
        type: 'css-background',
        index: index + 1,
        element: bg.element,
        backgroundImage: bg.backgroundImage,
        error: hasFileUrl ? 'Uses local file:// URL' : null
      });
    });
    
    return results;
  });

  console.log('=== IMAGE VERIFICATION RESULTS ===\n');
  
  let totalImages = 0;
  let loadedImages = 0;
  let errorImages = 0;
  
  imageCheck.forEach(item => {
    totalImages++;
    
    console.log(`${totalImages}. ${item.type.toUpperCase()} - ${item.alt || item.element}`);
    
    if (item.type === 'img') {
      console.log(`   Source: ${item.src}`);
      console.log(`   Loaded: ${item.loaded ? '✅ YES' : '❌ NO'}`);
      console.log(`   Visible: ${item.visible ? '✅ YES' : '❌ NO'}`);
      
      if (item.loaded && item.visible) {
        loadedImages++;
      }
    } else {
      console.log(`   Element: ${item.element}`);
      console.log(`   Background: ${item.backgroundImage.substring(0, 100)}...`);
    }
    
    if (item.error) {
      console.log(`   ❌ ERROR: ${item.error}`);
      errorImages++;
    } else {
      console.log(`   ✅ STATUS: OK`);
    }
    
    console.log('');
  });

  // Mobile responsiveness test
  console.log('📱 TESTING MOBILE RESPONSIVENESS\n');
  
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
  await page.waitForTimeout(1000);
  
  const mobileCheck = await page.evaluate(() => {
    const sizeGrid = document.querySelector('.size-grid');
    const sizeOptions = document.querySelectorAll('.size-option');
    const inventoryGrid = document.querySelector('.inventory-grid');
    
    if (!sizeGrid) return { error: 'Size grid not found' };
    
    const gridStyle = window.getComputedStyle(sizeGrid);
    const gridColumns = gridStyle.gridTemplateColumns;
    
    return {
      sizeGridColumns: gridColumns,
      sizeOptionsCount: sizeOptions.length,
      sizeGridVisible: sizeGrid.offsetWidth > 0,
      inventoryGridVisible: inventoryGrid ? inventoryGrid.offsetWidth > 0 : false,
      containerWidth: sizeGrid.offsetWidth
    };
  });
  
  console.log('MOBILE LAYOUT CHECK:');
  console.log(`Size Grid Columns: ${mobileCheck.sizeGridColumns}`);
  console.log(`Size Options Count: ${mobileCheck.sizeOptionsCount}`);
  console.log(`Size Grid Visible: ${mobileCheck.sizeGridVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`Inventory Grid Visible: ${mobileCheck.inventoryGridVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`Container Width: ${mobileCheck.containerWidth}px`);
  
  // Final summary
  console.log('\n🏆 FINAL SUMMARY');
  console.log('================');
  console.log(`Total Images: ${totalImages}`);
  console.log(`Loaded Successfully: ${loadedImages}`);
  console.log(`Errors Found: ${errorImages}`);
  console.log(`Success Rate: ${Math.round((loadedImages / totalImages) * 100)}%`);
  
  if (errorImages === 0 && loadedImages > 0) {
    console.log('\n🎉 ALL IMAGES VERIFIED!');
    console.log('✨ Ready for Vercel deployment!');
  } else if (errorImages > 0) {
    console.log('\n⚠️ ERRORS FOUND');
    console.log('Some images may not display properly on Vercel');
  } else {
    console.log('\n❓ VERIFICATION INCOMPLETE');
    console.log('Please check image loading manually');
  }

  await browser.close();
})();