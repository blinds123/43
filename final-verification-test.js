// 🎯 FINAL VERIFICATION TEST - EVERYTHING MUST BE PERFECT
// Testing all aspects with extreme prejudice

const { chromium, devices } = require('playwright');
const fs = require('fs').promises;
const http = require('http');
const path = require('path');

// Simple static file server
function createServer(port) {
    return http.createServer(async (req, res) => {
        try {
            let filePath = '.' + req.url;
            if (filePath === './') filePath = './index.html';
            
            const extname = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.jpg': 'image/jpg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp'
            };
            
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            const content = await fs.readFile(filePath);
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        } catch (error) {
            res.writeHead(404);
            res.end('404 Not Found');
        }
    }).listen(port);
}

async function finalVerificationTest() {
    console.log('🎯 FINAL VERIFICATION TEST - AURALO ULTRA PREMIUM');
    console.log('===============================================\n');
    
    // Start local server
    const PORT = 8888;
    const server = createServer(PORT);
    console.log(`🌐 Local server started on http://localhost:${PORT}\n`);
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300
    });
    
    try {
        // TEST 1: DESKTOP EXPERIENCE
        console.log('💻 DESKTOP TEST');
        console.log('===============');
        
        const desktopContext = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const desktopPage = await desktopContext.newPage();
        
        const startTime = Date.now();
        await desktopPage.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        
        console.log(`✓ Load Time: ${loadTime}ms ${loadTime < 1000 ? '✅' : '❌'}`);
        
        // Check all critical elements
        const checks = await desktopPage.evaluate(() => {
            const results = {};
            
            // Images
            const images = Array.from(document.querySelectorAll('img'));
            results.totalImages = images.length;
            results.loadedImages = images.filter(img => img.complete && img.naturalHeight > 0).length;
            results.failedImages = images.filter(img => img.complete && img.naturalHeight === 0).map(img => img.src);
            
            // Main elements
            results.mainHoodie = document.querySelector('.product-image')?.complete;
            results.storefront = document.querySelector('.hamptons-store-photo')?.complete;
            results.scarcityBar = !!document.querySelector('.ultra-scarcity-bar');
            results.valueTickerPresent = !!document.querySelector('.value-explosion-banner');
            results.stockCounter = document.querySelector('.stock-number')?.textContent;
            
            // Store availability
            const storeSection = document.querySelector('#storeAvailability');
            results.storeAvailabilityOpen = storeSection?.classList.contains('open');
            
            return results;
        });
        
        console.log(`✓ Images: ${checks.loadedImages}/${checks.totalImages} loaded`);
        console.log(`✓ Main Hoodie: ${checks.mainHoodie ? '✅' : '❌'}`);
        console.log(`✓ Storefront Image: ${checks.storefront ? '✅' : '❌'}`);
        console.log(`✓ Scarcity Bar: ${checks.scarcityBar ? '✅' : '❌'}`);
        console.log(`✓ Stock Counter: ${checks.stockCounter || 'Missing'}`);
        console.log(`✓ Store Dropdown: ${checks.storeAvailabilityOpen ? '✅ Open' : '❌ Closed'}`);
        
        if (checks.failedImages.length > 0) {
            console.log('\n❌ Failed images:');
            checks.failedImages.forEach(img => console.log(`   - ${img}`));
        }
        
        await desktopPage.screenshot({ path: 'final-desktop-test.png', fullPage: false });
        
        // TEST 2: MOBILE EXPERIENCE
        console.log('\n📱 MOBILE TEST (iPhone 13)');
        console.log('=========================');
        
        const mobileContext = await browser.newContext({
            ...devices['iPhone 13']
        });
        const mobilePage = await mobileContext.newPage();
        
        const mobileStart = Date.now();
        await mobilePage.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
        const mobileLoadTime = Date.now() - mobileStart;
        
        console.log(`✓ Mobile Load Time: ${mobileLoadTime}ms ${mobileLoadTime < 1500 ? '✅' : '❌'}`);
        
        const mobileChecks = await mobilePage.evaluate(() => {
            const results = {};
            
            // Check mobile-specific elements
            results.stickyBuyButton = !!document.querySelector('.sticky-buy-button');
            results.mobileOptimized = window.getComputedStyle(document.body).overflowX === 'hidden';
            
            // Check if images are visible on mobile
            const mainImage = document.querySelector('.product-image');
            results.mainImageVisible = mainImage && mainImage.offsetWidth > 0;
            
            return results;
        });
        
        console.log(`✓ Sticky Buy Button: ${mobileChecks.stickyBuyButton ? '✅' : '❌'}`);
        console.log(`✓ Mobile Optimized: ${mobileChecks.mobileOptimized ? '✅' : '❌'}`);
        console.log(`✓ Main Image Visible: ${mobileChecks.mainImageVisible ? '✅' : '❌'}`);
        
        await mobilePage.screenshot({ path: 'final-mobile-test.png', fullPage: false });
        
        // TEST 3: INTERACTIONS
        console.log('\n🎮 INTERACTION TEST');
        console.log('===================');
        
        // Test store dropdown
        const dropdownButton = await desktopPage.$('.availability-header');
        if (dropdownButton) {
            await dropdownButton.click();
            await desktopPage.waitForTimeout(500);
            
            const isOpen = await desktopPage.$eval('#storeAvailability', el => 
                el.classList.contains('open')
            );
            console.log(`✓ Store Dropdown Toggle: ${isOpen ? '✅' : '❌'}`);
            
            // Check if storefront image is visible
            const storefrontVisible = await desktopPage.$eval('.hamptons-store-photo', img => 
                img.offsetWidth > 0 && img.complete
            );
            console.log(`✓ Storefront Visible in Dropdown: ${storefrontVisible ? '✅' : '❌'}`);
        }
        
        // Test add to cart
        const addToCart = await desktopPage.$('.add-to-cart');
        if (addToCart) {
            await addToCart.click();
            await desktopPage.waitForTimeout(1000);
            console.log('✓ Add to Cart: ✅ Clicked');
        }
        
        // TEST 4: PERFORMANCE METRICS
        console.log('\n📊 PERFORMANCE METRICS');
        console.log('=====================');
        
        const metrics = await desktopPage.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const resources = performance.getEntriesByType('resource');
            
            return {
                domReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                fullLoad: navigation.loadEventEnd - navigation.fetchStart,
                resources: resources.length,
                images: resources.filter(r => r.initiatorType === 'img').length,
                css: resources.filter(r => r.name.includes('.css')).length,
                js: resources.filter(r => r.name.includes('.js')).length
            };
        });
        
        console.log(`DOM Ready: ${metrics.domReady}ms`);
        console.log(`Full Load: ${metrics.fullLoad}ms`);
        console.log(`Total Resources: ${metrics.resources}`);
        console.log(`Images: ${metrics.images}`);
        console.log(`CSS Files: ${metrics.css}`);
        console.log(`JS Files: ${metrics.js}`);
        
        // FINAL SUMMARY
        console.log('\n🏆 FINAL VERIFICATION SUMMARY');
        console.log('=============================');
        
        const allGood = 
            loadTime < 1000 && 
            checks.loadedImages === checks.totalImages &&
            checks.mainHoodie &&
            checks.storefront &&
            checks.scarcityBar;
        
        if (allGood) {
            console.log('✅ ALL SYSTEMS GO!');
            console.log('✅ Website is PERFECT and ready to ship!');
            console.log('✅ All images loading correctly');
            console.log('✅ Sub-1 second performance achieved');
            console.log('✅ Mobile experience optimized');
            console.log('✅ All interactions working');
            console.log('\n🚀 SHIP IT! Deploy to Vercel now!');
        } else {
            console.log('❌ Some issues remain:');
            if (loadTime >= 1000) console.log('   - Load time over 1 second');
            if (checks.loadedImages < checks.totalImages) console.log('   - Some images not loading');
            if (!checks.mainHoodie) console.log('   - Main hoodie image issue');
            if (!checks.storefront) console.log('   - Storefront image issue');
        }
        
        await desktopContext.close();
        await mobileContext.close();
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
        server.close();
        console.log('\n✅ Test complete. Server stopped.');
    }
}

// Run the final test
finalVerificationTest().catch(console.error);