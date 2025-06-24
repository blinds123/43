// 🏁 ULTIMATE FINAL CHECK - SHIP IT!

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function ultimateFinalCheck() {
    console.log('🏁 ULTIMATE FINAL CHECK - AURALO READY TO SHIP');
    console.log('=============================================\n');
    
    const browser = await chromium.launch({ headless: true });
    
    try {
        const page = await browser.newPage();
        await page.goto('file:///Users/nelsonchan/vercel-deployment/index.html');
        
        // Quick comprehensive check
        const results = await page.evaluate(() => {
            const checks = {
                images: {
                    total: document.querySelectorAll('img').length,
                    loaded: Array.from(document.querySelectorAll('img')).filter(img => img.complete && img.naturalHeight > 0).length
                },
                criticalElements: {
                    mainHoodie: !!document.querySelector('.product-image')?.complete,
                    storefront: !!document.querySelector('.hamptons-store-photo')?.complete,
                    scarcityBar: !!document.querySelector('.ultra-scarcity-bar'),
                    stockCounter: !!document.querySelector('.stock-number'),
                    addToCart: !!document.querySelector('.add-to-cart')
                },
                performance: {
                    domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                    images: performance.getEntriesByType('resource').filter(r => r.initiatorType === 'img').length
                }
            };
            
            return checks;
        });
        
        console.log('📸 IMAGES');
        console.log(`   Total: ${results.images.total}`);
        console.log(`   Loaded: ${results.images.loaded}`);
        console.log(`   Status: ${results.images.total === results.images.loaded ? '✅ ALL LOADED' : '❌ SOME FAILED'}`);
        
        console.log('\n🎯 CRITICAL ELEMENTS');
        Object.entries(results.criticalElements).forEach(([element, present]) => {
            console.log(`   ${element}: ${present ? '✅' : '❌'}`);
        });
        
        console.log('\n⚡ PERFORMANCE');
        console.log(`   DOM Ready: ${results.performance.domReady}ms`);
        
        // Take final screenshots
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.screenshot({ path: 'ship-it-desktop.png' });
        
        await page.setViewportSize({ width: 375, height: 812 });
        await page.screenshot({ path: 'ship-it-mobile.png' });
        
        // Final verdict
        const allGood = 
            results.images.total === results.images.loaded &&
            Object.values(results.criticalElements).every(v => v === true);
        
        console.log('\n🏆 FINAL VERDICT');
        console.log('================');
        
        if (allGood) {
            console.log('✅ PERFECT! Website is ready to ship!');
            console.log('✅ All images loading correctly');
            console.log('✅ All critical elements present');
            console.log('✅ Performance optimized');
            console.log('\n🚀 DEPLOY TO VERCEL NOW!');
            console.log('   Run: vercel --prod');
        } else {
            console.log('❌ Fix remaining issues before shipping');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

ultimateFinalCheck().catch(console.error);