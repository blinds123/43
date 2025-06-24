// 🚀 ULTRA SPEED TEST - SUB-1 SECOND VERIFICATION
// AURALO PREMIUM PERFORMANCE TEST

const { chromium } = require('playwright');

async function ultraSpeedTest() {
    console.log('⚡ ULTRA SPEED TEST - SUB-1 SECOND VERIFICATION');
    console.log('==============================================\n');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
    });
    
    try {
        // Test multiple times for accuracy
        const testRuns = 5;
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            console.log(`🏃 Test Run ${i + 1}/${testRuns}`);
            
            const context = await browser.newContext({
                viewport: { width: 1920, height: 1080 }
            });
            
            const page = await context.newPage();
            
            // Start timing
            const startTime = Date.now();
            
            // Navigate and wait for network idle
            await page.goto('file:///Users/nelsonchan/vercel-deployment/index.html', {
                waitUntil: 'networkidle'
            });
            
            // Calculate load time
            const loadTime = Date.now() - startTime;
            
            // Get performance metrics
            const performanceMetrics = await page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                return {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    totalTime: navigation.loadEventEnd - navigation.fetchStart,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                    resources: performance.getEntriesByType('resource').length
                };
            });
            
            // Check if all critical images loaded
            const imageLoadStatus = await page.evaluate(() => {
                const images = Array.from(document.images);
                return {
                    total: images.length,
                    loaded: images.filter(img => img.complete && img.naturalHeight !== 0).length,
                    failed: images.filter(img => img.complete && img.naturalHeight === 0).map(img => img.src)
                };
            });
            
            results.push({
                run: i + 1,
                loadTime,
                metrics: performanceMetrics,
                images: imageLoadStatus
            });
            
            console.log(`   Load Time: ${loadTime}ms ${loadTime < 1000 ? '✅' : '❌'}`);
            console.log(`   First Paint: ${performanceMetrics.firstPaint.toFixed(0)}ms`);
            console.log(`   Images: ${imageLoadStatus.loaded}/${imageLoadStatus.total} loaded`);
            
            if (imageLoadStatus.failed.length > 0) {
                console.log(`   ⚠️ Failed images:`, imageLoadStatus.failed);
            }
            
            await context.close();
        }
        
        // Calculate averages
        console.log('\n📊 PERFORMANCE SUMMARY');
        console.log('======================');
        
        const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
        const avgFirstPaint = results.reduce((sum, r) => sum + r.metrics.firstPaint, 0) / results.length;
        const avgResources = results.reduce((sum, r) => sum + r.metrics.resources, 0) / results.length;
        
        console.log(`Average Load Time: ${avgLoadTime.toFixed(0)}ms ${avgLoadTime < 1000 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Average First Paint: ${avgFirstPaint.toFixed(0)}ms ${avgFirstPaint < 300 ? '✅ PASS' : '⚠️ SLOW'}`);
        console.log(`Average Resources: ${avgResources.toFixed(0)}`);
        
        // Image verification
        console.log('\n🖼️ IMAGE VERIFICATION');
        console.log('====================');
        
        const lastRun = results[results.length - 1];
        console.log(`Total Images: ${lastRun.images.total}`);
        console.log(`Successfully Loaded: ${lastRun.images.loaded}`);
        console.log(`Failed: ${lastRun.images.failed.length}`);
        
        if (lastRun.images.failed.length === 0) {
            console.log('✅ All images loaded successfully!');
        } else {
            console.log('❌ Some images failed to load:');
            lastRun.images.failed.forEach(img => console.log(`   - ${img}`));
        }
        
        // Specific element checks
        console.log('\n🔍 ELEMENT VERIFICATION');
        console.log('======================');
        
        const page = await browser.newPage();
        await page.goto('file:///Users/nelsonchan/vercel-deployment/index.html');
        
        // Check main hoodie image
        const mainHoodie = await page.$eval('.product-image', img => ({
            src: img.src,
            loaded: img.complete && img.naturalHeight > 0
        }));
        console.log(`Main Hoodie Image: ${mainHoodie.loaded ? '✅ Loaded' : '❌ Failed'}`);
        
        // Check storefront image
        const storefront = await page.$eval('.hamptons-store-photo', img => ({
            src: img.src,
            loaded: img.complete && img.naturalHeight > 0
        }));
        console.log(`Storefront Image: ${storefront.loaded ? '✅ Loaded' : '❌ Failed'}`);
        
        // Check scarcity timer
        const scarcityBar = await page.$('.ultra-scarcity-bar');
        console.log(`Scarcity Timer: ${scarcityBar ? '✅ Present' : '❌ Missing'}`);
        
        // Check for timer conflicts
        const charityTimer = await page.$('.donation-timer');
        console.log(`Charity Timer Removed: ${!charityTimer ? '✅ Yes' : '❌ Still Present'}`);
        
        // Final verdict
        console.log('\n🏆 FINAL VERDICT');
        console.log('================');
        
        if (avgLoadTime < 1000 && lastRun.images.failed.length === 0 && !charityTimer) {
            console.log('✅ WEBSITE PASSES ALL TESTS!');
            console.log('⚡ Sub-1 second load achieved');
            console.log('🖼️ All images loading correctly');
            console.log('🧠 Single unified conversion message');
            console.log('💎 Ready for maximum conversions!');
        } else {
            console.log('❌ ISSUES FOUND:');
            if (avgLoadTime >= 1000) console.log('   - Load time exceeds 1 second');
            if (lastRun.images.failed.length > 0) console.log('   - Some images not loading');
            if (charityTimer) console.log('   - Conflicting timers still present');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the speed test
ultraSpeedTest().catch(console.error);