const { chromium } = require('playwright');

(async () => {
  console.log('📱 COMPREHENSIVE MOBILE/TABLET FORMATTING AUDIT');
  console.log('==============================================\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 }
  ];

  try {
    await page.goto('http://localhost:3000/index.html');
    await page.waitForLoadState('networkidle');

    for (const viewport of viewports) {
      console.log(`\n🔍 TESTING ${viewport.name.toUpperCase()} (${viewport.width}×${viewport.height})`);
      console.log('='.repeat(50));
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // Test specific sections mentioned by user
      const sectionTests = await page.evaluate(() => {
        const results = {};

        // 1. LIFE ELEVATED SECTION
        const lifeElevated = document.querySelector('*[class*="life"], *[class*="elevated"]') || 
                            Array.from(document.querySelectorAll('h1, h2, h3, h4')).find(h => 
                              h.textContent.toLowerCase().includes('life') && h.textContent.toLowerCase().includes('elevated'));
        
        if (lifeElevated) {
          const section = lifeElevated.closest('section') || lifeElevated.closest('div');
          const rect = section.getBoundingClientRect();
          const style = window.getComputedStyle(section);
          
          results.lifeElevated = {
            found: true,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            padding: style.padding,
            margin: style.margin,
            overflow: style.overflow,
            textAlign: style.textAlign
          };
        } else {
          results.lifeElevated = { found: false };
        }

        // 2. FITS INTO EVERY MOMENT SECTION  
        const fitsEveryMoment = Array.from(document.querySelectorAll('h1, h2, h3, h4')).find(h => 
          h.textContent.toLowerCase().includes('fits') && h.textContent.toLowerCase().includes('moment'));
        
        if (fitsEveryMoment) {
          const section = fitsEveryMoment.closest('section') || fitsEveryMoment.closest('div');
          const icons = section.querySelectorAll('*[class*="icon"], svg, img[src*="icon"]');
          
          const iconData = Array.from(icons).map(icon => {
            const rect = icon.getBoundingClientRect();
            const style = window.getComputedStyle(icon);
            return {
              tag: icon.tagName,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              fontSize: style.fontSize,
              display: style.display,
              float: style.float
            };
          });

          results.fitsEveryMoment = {
            found: true,
            iconsCount: icons.length,
            iconData: iconData,
            sectionWidth: Math.round(section.getBoundingClientRect().width)
          };
        } else {
          results.fitsEveryMoment = { found: false };
        }

        // 3. SUSTAINABLE CHECKOUT SECTION
        const sustainableCheckout = Array.from(document.querySelectorAll('h1, h2, h3, h4')).find(h => 
          h.textContent.toLowerCase().includes('sustainable') && h.textContent.toLowerCase().includes('checkout'));
        
        if (sustainableCheckout) {
          const section = sustainableCheckout.closest('section') || sustainableCheckout.closest('div');
          const table = section.querySelector('table') || section.querySelector('[class*="grid"]') || 
                       section.querySelector('[class*="comparison"]');
          
          if (table) {
            const rect = table.getBoundingClientRect();
            const style = window.getComputedStyle(table);
            
            results.sustainableCheckout = {
              found: true,
              tableWidth: Math.round(rect.width),
              tableDisplay: style.display,
              gridColumns: style.gridTemplateColumns,
              overflow: style.overflow,
              overflowX: style.overflowX
            };
          } else {
            results.sustainableCheckout = { found: true, hasTable: false };
          }
        } else {
          results.sustainableCheckout = { found: false };
        }

        // 4. GENERAL LAYOUT ISSUES
        const container = document.querySelector('.container');
        const body = document.body;
        
        results.general = {
          containerWidth: container ? Math.round(container.getBoundingClientRect().width) : 0,
          bodyWidth: Math.round(body.getBoundingClientRect().width),
          hasHorizontalScroll: body.scrollWidth > window.innerWidth,
          scrollWidth: body.scrollWidth,
          windowWidth: window.innerWidth
        };

        return results;
      });

      // Report results for this viewport
      console.log(`\n📊 ${viewport.name} Results:`);
      
      // Life Elevated
      if (sectionTests.lifeElevated.found) {
        console.log(`✅ Life Elevated: ${sectionTests.lifeElevated.width}×${sectionTests.lifeElevated.height}px`);
        console.log(`   Padding: ${sectionTests.lifeElevated.padding}`);
      } else {
        console.log('❌ Life Elevated section not found');
      }

      // Fits Every Moment Icons
      if (sectionTests.fitsEveryMoment.found) {
        console.log(`✅ Fits Every Moment: ${sectionTests.fitsEveryMoment.iconsCount} icons found`);
        sectionTests.fitsEveryMoment.iconData.forEach((icon, i) => {
          const status = icon.width > 0 && icon.height > 0 ? '✅' : '❌';
          console.log(`   ${status} Icon ${i+1}: ${icon.width}×${icon.height}px (${icon.fontSize})`);
        });
      } else {
        console.log('❌ Fits Every Moment section not found');
      }

      // Sustainable Checkout
      if (sectionTests.sustainableCheckout.found) {
        if (sectionTests.sustainableCheckout.hasTable !== false) {
          const status = sectionTests.sustainableCheckout.tableWidth <= viewport.width ? '✅' : '❌';
          console.log(`${status} Sustainable Checkout: ${sectionTests.sustainableCheckout.tableWidth}px wide`);
          console.log(`   Display: ${sectionTests.sustainableCheckout.tableDisplay}`);
          console.log(`   Grid: ${sectionTests.sustainableCheckout.gridColumns || 'none'}`);
        } else {
          console.log('❌ Sustainable Checkout: No table/grid found');
        }
      } else {
        console.log('❌ Sustainable Checkout section not found');
      }

      // General Layout
      const scrollIssue = sectionTests.general.hasHorizontalScroll ? '❌' : '✅';
      console.log(`${scrollIssue} Layout: Container ${sectionTests.general.containerWidth}px, No H-scroll: ${!sectionTests.general.hasHorizontalScroll}`);
      
      if (sectionTests.general.hasHorizontalScroll) {
        console.log(`   ⚠️ Horizontal scroll detected: ${sectionTests.general.scrollWidth}px > ${sectionTests.general.windowWidth}px`);
      }
    }

    // Take screenshots for visual verification
    console.log('\n📸 TAKING VISUAL VERIFICATION SCREENSHOTS');
    console.log('=========================================');
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      const filename = `mobile-audit-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`📱 ${viewport.name}: ${filename}`);
    }

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    await browser.close();
  }
})();