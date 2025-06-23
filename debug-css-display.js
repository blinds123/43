const { chromium } = require('playwright');

(async () => {
  console.log('🎨 CSS DISPLAY ISSUE DEBUG');
  console.log('===========================\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://auralo-hoodie-landing.vercel.app/');
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual verification
    await page.screenshot({ path: 'current-state.png', fullPage: true });
    console.log('📸 Screenshot saved as current-state.png');

    // Check specific problem areas from the user's screenshot
    console.log('\n🔍 ANALYZING TRUSTPILOT SECTION:');
    console.log('================================');
    
    const trustpilotAnalysis = await page.evaluate(() => {
      const trustpilotSection = document.querySelector('.trustpilot-reviews') || 
                                document.querySelector('[data-section="trustpilot"]') ||
                                document.querySelector('*[class*="trustpilot"]');
      
      if (!trustpilotSection) {
        // Find by heading
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const trustpilotHeading = headings.find(h => h.textContent.toLowerCase().includes('trustpilot'));
        if (trustpilotHeading) {
          const parent = trustpilotHeading.closest('div') || trustpilotHeading.parentElement;
          return analyzeSection(parent, 'Trustpilot (found by heading)');
        }
        return { error: 'Trustpilot section not found' };
      }
      
      function analyzeSection(section, name) {
        const images = section.querySelectorAll('img');
        const imageData = [];
        
        images.forEach((img, index) => {
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          
          imageData.push({
            index: index + 1,
            src: img.src,
            alt: img.alt,
            loaded: img.complete && img.naturalHeight !== 0,
            naturalSize: `${img.naturalWidth}×${img.naturalHeight}`,
            displaySize: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
            visible: rect.width > 0 && rect.height > 0,
            opacity: style.opacity,
            display: style.display,
            visibility: style.visibility,
            zIndex: style.zIndex,
            position: style.position
          });
        });
        
        return {
          sectionName: name,
          imageCount: images.length,
          images: imageData
        };
      }
      
      return analyzeSection(trustpilotSection, 'Trustpilot');
    });

    if (trustpilotAnalysis.error) {
      console.log(`❌ ${trustpilotAnalysis.error}`);
    } else {
      console.log(`📍 Found ${trustpilotAnalysis.sectionName} with ${trustpilotAnalysis.imageCount} images:`);
      
      trustpilotAnalysis.images.forEach(img => {
        const loadStatus = img.loaded ? '✅' : '❌';
        const visibleStatus = img.visible ? '👁️' : '🙈';
        
        console.log(`\n   ${loadStatus}${visibleStatus} Image ${img.index}: ${img.alt}`);
        console.log(`      Source: ${img.src.split('/').pop()}`);
        console.log(`      Natural: ${img.naturalSize} | Display: ${img.displaySize}`);
        console.log(`      CSS: opacity:${img.opacity} display:${img.display} visibility:${img.visibility}`);
        
        if (!img.loaded) {
          console.log(`      ⚠️ NOT LOADED`);
        }
        if (!img.visible) {
          console.log(`      ⚠️ NOT VISIBLE (width/height = 0)`);
        }
      });
    }

    // Check all images for common CSS issues
    console.log('\n🔍 GLOBAL IMAGE CSS ANALYSIS:');
    console.log('=============================');
    
    const globalAnalysis = await page.evaluate(() => {
      const allImages = document.querySelectorAll('img');
      const issues = [];
      let hiddenCount = 0;
      let loadedButInvisible = 0;
      
      allImages.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        const loaded = img.complete && img.naturalHeight !== 0;
        const visible = rect.width > 0 && rect.height > 0;
        
        if (!visible) hiddenCount++;
        if (loaded && !visible) {
          loadedButInvisible++;
          issues.push({
            index: index + 1,
            problem: 'Loaded but not visible',
            alt: img.alt,
            src: img.src.split('/').pop(),
            css: {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              width: style.width,
              height: style.height
            }
          });
        }
        
        // Check for common CSS issues
        if (style.display === 'none') {
          issues.push({
            index: index + 1,
            problem: 'display: none',
            alt: img.alt,
            src: img.src.split('/').pop()
          });
        }
        
        if (style.visibility === 'hidden') {
          issues.push({
            index: index + 1,
            problem: 'visibility: hidden',
            alt: img.alt,
            src: img.src.split('/').pop()
          });
        }
        
        if (parseFloat(style.opacity) === 0) {
          issues.push({
            index: index + 1,
            problem: 'opacity: 0',
            alt: img.alt,
            src: img.src.split('/').pop()
          });
        }
      });
      
      return {
        totalImages: allImages.length,
        hiddenCount,
        loadedButInvisible,
        issues
      };
    });

    console.log(`📊 Total images: ${globalAnalysis.totalImages}`);
    console.log(`🙈 Hidden images: ${globalAnalysis.hiddenCount}`);
    console.log(`⚠️ Loaded but invisible: ${globalAnalysis.loadedButInvisible}`);
    
    if (globalAnalysis.issues.length > 0) {
      console.log('\n💥 CSS ISSUES FOUND:');
      globalAnalysis.issues.forEach(issue => {
        console.log(`   ${issue.index}. ${issue.problem}: ${issue.alt}`);
        console.log(`      File: ${issue.src}`);
        if (issue.css) {
          console.log(`      CSS: ${JSON.stringify(issue.css)}`);
        }
      });
    } else {
      console.log('\n✅ No CSS display issues found');
    }

    // Check for cache issues
    console.log('\n🗄️ CACHE CHECK:');
    console.log('===============');
    
    const cacheTest = await page.evaluate(() => {
      // Force reload a sample image
      const testImg = document.querySelector('img[src*="trustpilot"]');
      if (testImg) {
        const originalSrc = testImg.src;
        testImg.src = originalSrc + '?t=' + Date.now();
        return {
          tested: true,
          originalSrc: originalSrc,
          newSrc: testImg.src
        };
      }
      return { tested: false };
    });
    
    if (cacheTest.tested) {
      console.log(`🔄 Cache-busted test image`);
      await page.waitForTimeout(2000);
      
      const afterCache = await page.evaluate(() => {
        const testImg = document.querySelector('img[src*="?t="]');
        return testImg ? {
          loaded: testImg.complete && testImg.naturalHeight !== 0,
          visible: testImg.getBoundingClientRect().width > 0
        } : null;
      });
      
      if (afterCache) {
        console.log(`✅ After cache-bust: loaded:${afterCache.loaded} visible:${afterCache.visible}`);
      }
    }

  } catch (error) {
    console.error('❌ CSS debug failed:', error.message);
  } finally {
    await browser.close();
  }
})();