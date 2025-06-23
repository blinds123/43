const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 468, height: 800 });
  await page.goto(`file://${process.cwd()}/index.html`);
  await page.waitForLoadState('networkidle');

  console.log('🔍 TESTING FINAL FIXES\n');

  // Test comparison table mobile view
  console.log('📱 TESTING COMPARISON TABLE');
  console.log('==========================');
  
  const tableTest = await page.evaluate(() => {
    const table = document.querySelector('.comparison-grid');
    const cells = document.querySelectorAll('.comparison-cell');
    
    if (!table) return { error: 'Table not found' };
    
    const tableRect = table.getBoundingClientRect();
    const gridStyle = window.getComputedStyle(table);
    
    return {
      tableVisible: tableRect.width > 0 && tableRect.height > 0,
      cellCount: cells.length,
      gridColumns: gridStyle.gridTemplateColumns,
      tableWidth: Math.round(tableRect.width),
      tableHeight: Math.round(tableRect.height)
    };
  });
  
  console.log(`Table Visible: ${tableTest.tableVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`Grid Columns: ${tableTest.gridColumns}`);
  console.log(`Cell Count: ${tableTest.cellCount}`);
  console.log(`Table Size: ${tableTest.tableWidth}×${tableTest.tableHeight}px`);
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  const mobileTableTest = await page.evaluate(() => {
    const table = document.querySelector('.comparison-grid');
    const mobileLabels = document.querySelectorAll('.comparison-mobile-label');
    const headerCells = document.querySelectorAll('.comparison-header-cell');
    
    const gridStyle = window.getComputedStyle(table);
    
    return {
      mobileColumns: gridStyle.gridTemplateColumns,
      mobileLabelsVisible: Array.from(mobileLabels).some(label => {
        const style = window.getComputedStyle(label);
        return style.display !== 'none';
      }),
      headersHidden: Array.from(headerCells).every(header => {
        const style = window.getComputedStyle(header);
        return style.display === 'none';
      }),
      labelCount: mobileLabels.length
    };
  });
  
  console.log(`\n📱 MOBILE VIEW:`);
  console.log(`Mobile Columns: ${mobileTableTest.mobileColumns}`);
  console.log(`Mobile Labels Visible: ${mobileTableTest.mobileLabelsVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`Headers Hidden: ${mobileTableTest.headersHidden ? '✅ YES' : '❌ NO'}`);
  console.log(`Label Count: ${mobileTableTest.labelCount}`);

  // Test store availability section
  console.log('\n🏪 TESTING STORE AVAILABILITY');
  console.log('=============================');
  
  const storeTest = await page.evaluate(() => {
    const availability = document.querySelector('.store-availability');
    const hamptonImage = document.querySelector('.hamptons-store-image');
    const inventoryGrid = document.querySelector('.inventory-grid');
    
    if (!availability) return { error: 'Store availability not found' };
    
    const availRect = availability.getBoundingClientRect();
    
    return {
      sectionVisible: availRect.width > 0 && availRect.height > 0,
      hamptonImageExists: !!hamptonImage,
      hamptonImageVisible: hamptonImage ? hamptonImage.offsetWidth > 0 : false,
      inventoryGridExists: !!inventoryGrid,
      sectionHeight: Math.round(availRect.height),
      sectionWidth: Math.round(availRect.width)
    };
  });
  
  console.log(`Availability Section: ${storeTest.sectionVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
  console.log(`Hamptons Image: ${storeTest.hamptonImageExists && storeTest.hamptonImageVisible ? '✅ VISIBLE' : '❌ MISSING'}`);
  console.log(`Inventory Grid: ${storeTest.inventoryGridExists ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`Section Size: ${storeTest.sectionWidth}×${storeTest.sectionHeight}px`);

  // Test image loading
  console.log('\n🖼️ TESTING IMAGE LOADING');
  console.log('========================');
  
  const imageTest = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    const results = {
      total: images.length,
      loaded: 0,
      errors: 0,
      localImages: 0
    };
    
    images.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        results.loaded++;
      } else if (img.complete && img.naturalHeight === 0) {
        results.errors++;
      }
      
      if (img.src.includes('./images/')) {
        results.localImages++;
      }
    });
    
    return results;
  });
  
  console.log(`Total Images: ${imageTest.total}`);
  console.log(`Local Images: ${imageTest.localImages}`);
  console.log(`Loaded Successfully: ${imageTest.loaded}`);
  console.log(`Failed to Load: ${imageTest.errors}`);
  console.log(`Success Rate: ${Math.round((imageTest.loaded / imageTest.total) * 100)}%`);

  // Final summary
  console.log('\n🏆 FINAL SUMMARY');
  console.log('================');
  
  const allGood = tableTest.tableVisible && 
                  mobileTableTest.mobileLabelsVisible && 
                  storeTest.hamptonImageVisible &&
                  imageTest.loaded > 20;
  
  if (allGood) {
    console.log('🎉 ALL FIXES WORKING PERFECTLY!');
    console.log('✅ Comparison table responsive');
    console.log('✅ Hamptons store image added');
    console.log('✅ Original images loaded');
    console.log('✅ Mobile layout optimized');
    console.log('\n🚀 READY FOR VERCEL DEPLOYMENT!');
  } else {
    console.log('⚠️ Some issues found:');
    if (!tableTest.tableVisible) console.log('❌ Table not visible');
    if (!mobileTableTest.mobileLabelsVisible) console.log('❌ Mobile labels not working');
    if (!storeTest.hamptonImageVisible) console.log('❌ Hamptons image missing');
    if (imageTest.loaded < 20) console.log('❌ Images not loading properly');
  }

  await browser.close();
})();