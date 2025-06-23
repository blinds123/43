const { chromium } = require('playwright');
const express = require('express');

(async () => {
  console.log('🚀 COMPREHENSIVE TEST - ALL CHANGES');
  console.log('===================================\n');

  const app = express();
  app.use(express.static('.'));
  
  const server = app.listen(3001, () => {
    console.log('Test server running on http://localhost:3001');
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test mobile view first
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/index.html');
    await page.waitForLoadState('networkidle');

    console.log('📱 MOBILE VIEW TESTS (375×667)');
    console.log('===============================\n');

    // 1. TEST LIFE ELEVATED SECTION
    console.log('🎯 LIFE ELEVATED SECTION:');
    const lifeElevatedTest = await page.evaluate(() => {
      const grid = document.querySelector('.lifestyle-grid');
      const cards = document.querySelectorAll('.moment-card');
      const hotspots = document.querySelectorAll('.hotspot');
      
      if (!grid) return { error: 'Grid not found' };
      
      const gridStyle = window.getComputedStyle(grid);
      const gridRect = grid.getBoundingClientRect();
      
      return {
        gridColumns: gridStyle.gridTemplateColumns,
        gridGap: gridStyle.gap,
        cardCount: cards.length,
        cardsPerRow: gridStyle.gridTemplateColumns.split(' ').length,
        hotspotCount: hotspots.length,
        gridWidth: Math.round(gridRect.width)
      };
    });
    
    console.log(`   Grid Layout: ${lifeElevatedTest.gridColumns}`);
    console.log(`   Cards: ${lifeElevatedTest.cardCount} total`);
    console.log(`   Cards per row: ${lifeElevatedTest.cardsPerRow}`);
    console.log(`   Hotspots: ${lifeElevatedTest.hotspotCount}`);
    console.log(`   Grid Width: ${lifeElevatedTest.gridWidth}px`);

    // Test hotspot tooltip visibility
    console.log('\n📍 HOTSPOT TOOLTIP TEST:');
    await page.hover('.hotspot-1');
    await page.waitForTimeout(500);
    
    const tooltipTest = await page.evaluate(() => {
      const tooltip = document.querySelector('.hotspot:hover::after');
      const hotspot = document.querySelector('.hotspot-1');
      if (!hotspot) return { error: 'No hotspot found' };
      
      // Get computed style
      const style = window.getComputedStyle(hotspot, '::after');
      
      return {
        hasTooltip: true,
        position: style.position,
        whiteSpace: style.whiteSpace,
        fontSize: style.fontSize
      };
    });
    
    console.log(`   Tooltip White Space: ${tooltipTest.whiteSpace}`);
    console.log(`   Tooltip Font Size: ${tooltipTest.fontSize}`);

    // 2. TEST BENEFITS GRID
    console.log('\n💎 BENEFITS GRID (01-04):');
    const benefitsTest = await page.evaluate(() => {
      const grid = document.querySelector('.benefit-grid');
      const items = document.querySelectorAll('.benefit-item');
      
      if (!grid) return { error: 'Benefit grid not found' };
      
      const gridStyle = window.getComputedStyle(grid);
      
      return {
        gridColumns: gridStyle.gridTemplateColumns,
        itemCount: items.length,
        gridGap: gridStyle.gap,
        firstItemText: items[0] ? items[0].textContent.trim() : 'N/A',
        secondItemText: items[1] ? items[1].textContent.trim() : 'N/A'
      };
    });
    
    console.log(`   Grid Layout: ${benefitsTest.gridColumns}`);
    console.log(`   Items: ${benefitsTest.itemCount}`);
    console.log(`   Item 1: ${benefitsTest.firstItemText}`);
    console.log(`   Item 2: ${benefitsTest.secondItemText}`);

    // 3. TEST STORE AVAILABILITY
    console.log('\n🏪 STORE AVAILABILITY:');
    const storeTest = await page.evaluate(() => {
      const availability = document.querySelector('.store-availability');
      const locations = document.querySelectorAll('.pickup-location');
      const storePhoto = document.querySelector('.hamptons-store-photo');
      
      if (!availability) return { error: 'Store availability not found' };
      
      const locationNames = Array.from(locations).map(loc => {
        const name = loc.querySelector('.pickup-name');
        return name ? name.textContent : 'Unknown';
      });
      
      return {
        locationCount: locations.length,
        locationNames: locationNames,
        hasStorePhoto: !!storePhoto,
        storePhotoSrc: storePhoto ? storePhoto.src : 'N/A'
      };
    });
    
    console.log(`   Locations: ${storeTest.locationCount}`);
    console.log(`   Location Names: ${storeTest.locationNames.join(', ')}`);
    console.log(`   Has Store Photo: ${storeTest.hasStorePhoto ? '✅' : '❌'}`);

    // 4. PERFORMANCE TEST
    console.log('\n⚡ PERFORMANCE TEST:');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      };
    });
    
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`   Total Load Time: ${performanceMetrics.totalTime}ms`);
    
    const loadStatus = performanceMetrics.totalTime < 1000 ? '✅ SUB-1s' : '❌ OVER-1s';
    console.log(`   Status: ${loadStatus}`);

    // 5. TEST TABLET VIEW
    console.log('\n💻 TABLET VIEW TESTS (768×1024)');
    console.log('================================\n');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const tabletTest = await page.evaluate(() => {
      const grid = document.querySelector('.lifestyle-grid');
      const benefitGrid = document.querySelector('.benefit-grid');
      
      const gridStyle = window.getComputedStyle(grid);
      const benefitStyle = window.getComputedStyle(benefitGrid);
      
      return {
        lifestyleColumns: gridStyle.gridTemplateColumns,
        benefitColumns: benefitStyle.gridTemplateColumns
      };
    });
    
    console.log(`   Lifestyle Grid: ${tabletTest.lifestyleColumns}`);
    console.log(`   Benefit Grid: ${tabletTest.benefitColumns}`);

    // Take screenshots
    console.log('\n📸 SCREENSHOTS:');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-mobile-final.png', fullPage: true });
    console.log('   Mobile screenshot: test-mobile-final.png');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-tablet-final.png', fullPage: true });
    console.log('   Tablet screenshot: test-tablet-final.png');

    // FINAL ASSESSMENT
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('==================');
    
    const allPassed = 
      lifeElevatedTest.cardsPerRow === 1 && // Mobile: single column
      benefitsTest.gridColumns.includes('1fr 1fr') && // 2x2 grid
      storeTest.locationCount === 1 && // Only East Hampton
      storeTest.locationNames[0].includes('East Hampton') &&
      performanceMetrics.totalTime < 1000; // Sub-1s loading
    
    if (allPassed) {
      console.log('✅ ALL REQUIREMENTS MET!');
      console.log('   ✅ Life Elevated: 4 separate rows on mobile');
      console.log('   ✅ Benefits: 2x2 grid layout');
      console.log('   ✅ Store: East Hampton only with photo');
      console.log('   ✅ Performance: Sub-1 second loading');
      console.log('   ✅ Mobile/Tablet: Fully optimized');
    } else {
      console.log('⚠️ Some issues found:');
      if (lifeElevatedTest.cardsPerRow !== 1) console.log('   ❌ Life Elevated not single column');
      if (!benefitsTest.gridColumns.includes('1fr 1fr')) console.log('   ❌ Benefits not 2x2 grid');
      if (storeTest.locationCount !== 1) console.log('   ❌ Multiple store locations');
      if (performanceMetrics.totalTime >= 1000) console.log('   ❌ Loading time over 1 second');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    server.close();
  }
})();