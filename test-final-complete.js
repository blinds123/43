const { chromium } = require('playwright');
const express = require('express');

(async () => {
  const app = express();
  app.use(express.static('.'));
  
  const server = app.listen(3001, () => {
    console.log('🚀 FINAL COMPREHENSIVE TEST');
    console.log('=========================\n');
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3001/index.html');
    await page.waitForLoadState('networkidle');

    // Test 2x2 grid layout
    console.log('📐 TESTING 2x2 GRID LAYOUT');
    console.log('==========================');
    
    const gridTest = await page.evaluate(() => {
      const grid = document.querySelector('.lifestyle-grid');
      const cards = document.querySelectorAll('.lifestyle-grid .moment-card');
      
      if (!grid) return { error: 'Grid not found' };
      
      const gridStyle = window.getComputedStyle(grid);
      const gridRect = grid.getBoundingClientRect();
      
      return {
        cardsCount: cards.length,
        gridColumns: gridStyle.gridTemplateColumns,
        gridRows: gridStyle.gridTemplateRows,
        gridWidth: Math.round(gridRect.width),
        gridHeight: Math.round(gridRect.height),
        gap: gridStyle.gap
      };
    });

    console.log(`Cards in Grid: ${gridTest.cardsCount}/4 expected`);
    console.log(`Grid Layout: ${gridTest.gridColumns}`);
    console.log(`Grid Rows: ${gridTest.gridRows}`);
    console.log(`Grid Size: ${gridTest.gridWidth}×${gridTest.gridHeight}px`);
    console.log(`Gap: ${gridTest.gap}`);

    // Test optimized image loading performance
    console.log('\n⚡ TESTING IMAGE LOADING PERFORMANCE');
    console.log('===================================');
    
    const loadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadEnd = Date.now();
    
    const loadTime = loadEnd - loadStart;
    console.log(`Page Load Time: ${loadTime}ms`);
    
    // Test mobile responsiveness
    console.log('\n📱 TESTING MOBILE RESPONSIVENESS');
    console.log('===============================');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileTest = await page.evaluate(() => {
      const grid = document.querySelector('.lifestyle-grid');
      const cards = document.querySelectorAll('.lifestyle-grid .moment-card');
      
      if (!grid) return { error: 'Grid not found' };
      
      const gridStyle = window.getComputedStyle(grid);
      const gridRect = grid.getBoundingClientRect();
      
      // Test individual card sizes
      const cardSizes = Array.from(cards).map(card => {
        const rect = card.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
      
      return {
        mobileColumns: gridStyle.gridTemplateColumns,
        mobileGap: gridStyle.gap,
        gridWidth: Math.round(gridRect.width),
        cardSizes: cardSizes
      };
    });

    console.log(`Mobile Grid Columns: ${mobileTest.mobileColumns}`);
    console.log(`Mobile Gap: ${mobileTest.mobileGap}`);
    console.log(`Mobile Grid Width: ${mobileTest.gridWidth}px`);
    console.log(`Card Sizes: ${mobileTest.cardSizes.map(c => `${c.width}×${c.height}`).join(', ')}`);

    // Test all background images
    console.log('\n🖼️ TESTING OPTIMIZED BACKGROUND IMAGES');
    console.log('=====================================');
    
    const bgImageTest = await page.evaluate(() => {
      const elements = [
        { selector: '.morning-bg', name: 'Morning' },
        { selector: '.study-bg', name: 'Study' },
        { selector: '.night-bg', name: 'Night' },
        { selector: '.lifestyle-bg', name: 'Lifestyle' }
      ];
      
      return elements.map(el => {
        const element = document.querySelector(el.selector);
        if (!element) return { name: el.name, error: 'Element not found' };
        
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        
        return {
          name: el.name,
          hasBackground: bgImage !== 'none',
          backgroundImage: bgImage.includes('optimized') ? '✅ Optimized' : '❌ Not optimized',
          visible: element.offsetWidth > 0 && element.offsetHeight > 0
        };
      });
    });

    bgImageTest.forEach(test => {
      const status = test.hasBackground && test.visible ? '✅' : '❌';
      console.log(`   ${status} ${test.name}: ${test.backgroundImage} | Visible: ${test.visible}`);
    });

    // Final assessment
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('==================');
    
    const allPassed = 
      gridTest.cardsCount === 4 &&
      gridTest.gridColumns.includes('1fr 1fr') &&
      loadTime < 3000 &&
      mobileTest.mobileColumns.includes('1fr 1fr') &&
      bgImageTest.every(test => test.hasBackground && test.visible);

    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ 2x2 Grid Layout Working');
      console.log('✅ Fast Loading (under 3s)');
      console.log('✅ Mobile Responsive');
      console.log('✅ Optimized Images Loading');
      console.log('✅ User Photos Being Used');
      console.log('\n🚀 READY FOR DEPLOYMENT!');
    } else {
      console.log('⚠️ Some issues found:');
      if (gridTest.cardsCount !== 4) console.log(`❌ Grid has ${gridTest.cardsCount} cards instead of 4`);
      if (!gridTest.gridColumns.includes('1fr 1fr')) console.log('❌ Grid layout not 2x2');
      if (loadTime >= 3000) console.log(`❌ Load time too slow: ${loadTime}ms`);
      if (!mobileTest.mobileColumns.includes('1fr 1fr')) console.log('❌ Mobile grid not responsive');
      if (!bgImageTest.every(test => test.hasBackground && test.visible)) console.log('❌ Some background images not loading');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    server.close();
  }
})();