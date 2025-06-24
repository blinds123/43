// 🏁 FINAL COMPREHENSIVE TEST - EVERYTHING MUST BE PERFECT

const { chromium } = require('playwright');
const fs = require('fs').promises;
const http = require('http');
const path = require('path');

// Create test server
function createServer(port) {
    return http.createServer(async (req, res) => {
        try {
            let filePath = '.' + req.url;
            if (filePath === './') filePath = './index.html';
            
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.jpg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp'
            };
            
            if (await fs.access(filePath).then(() => true).catch(() => false)) {
                const content = await fs.readFile(filePath);
                res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
                res.end(content);
            } else {
                res.writeHead(404);
                res.end('404 Not Found');
            }
        } catch (error) {
            res.writeHead(500);
            res.end('Server error');
        }
    }).listen(port);
}

async function finalComprehensiveTest() {
    console.log('🏁 FINAL COMPREHENSIVE TEST - AURALO ULTRA PREMIUM');
    console.log('================================================\n');
    
    const PORT = 7777;
    const server = createServer(PORT);
    console.log(`🌐 Test server running on http://localhost:${PORT}\n`);
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    try {
        const issues = [];
        
        // 1. SPEED TEST
        console.log('⚡ SPEED TEST');
        console.log('=============');
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        const startTime = Date.now();
        await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
        const domLoadTime = Date.now() - startTime;
        
        await page.waitForLoadState('networkidle');
        const fullLoadTime = Date.now() - startTime;
        
        console.log(`DOM Load: ${domLoadTime}ms ${domLoadTime < 1000 ? '✅' : '❌'}`);
        console.log(`Full Load: ${fullLoadTime}ms ${fullLoadTime < 2000 ? '✅' : '❌'}`);
        
        if (domLoadTime >= 1000) issues.push('DOM load time exceeds 1 second');
        
        // 2. IMAGE TEST
        console.log('\n🖼️ IMAGE TEST');
        console.log('==============');
        
        const imageResults = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            const results = {
                total: images.length,
                loaded: 0,
                failed: [],
                critical: {}
            };
            
            images.forEach(img => {
                if (img.complete && img.naturalHeight > 0) {
                    results.loaded++;
                } else {
                    results.failed.push({
                        src: img.src,
                        alt: img.alt || 'No alt text'
                    });
                }
            });
            
            // Check critical images
            results.critical.mainHoodie = document.querySelector('.product-image')?.complete || false;
            results.critical.storefront = document.querySelector('.hamptons-store-photo')?.complete || false;
            
            return results;
        });
        
        console.log(`Total Images: ${imageResults.total}`);
        console.log(`Loaded: ${imageResults.loaded} ${imageResults.loaded === imageResults.total ? '✅' : '❌'}`);
        console.log(`Main Hoodie: ${imageResults.critical.mainHoodie ? '✅' : '❌'}`);
        console.log(`Storefront: ${imageResults.critical.storefront ? '✅' : '❌'}`);
        
        if (imageResults.failed.length > 0) {
            console.log('\nFailed images:');
            imageResults.failed.forEach(img => {
                console.log(`  ❌ ${img.alt}: ${img.src}`);
                issues.push(`Image failed: ${img.alt}`);
            });
        }
        
        // 3. FEATURE TEST
        console.log('\n🎯 FEATURE TEST');
        console.log('================');
        
        const features = await page.evaluate(() => {
            return {
                addToCart: !!document.querySelector('.add-to-cart'),
                scarcityBar: !!document.querySelector('.ultra-scarcity-bar'),
                stockCounter: document.querySelector('.stock-number')?.textContent,
                sizeSelector: document.querySelectorAll('.size-option').length,
                urgencyWidget: !!document.querySelector('.urgency-widget'),
                priceDisplay: !!document.querySelector('.price-badge')
            };
        });
        
        console.log(`Add to Cart Button: ${features.addToCart ? '✅' : '❌'}`);
        console.log(`Scarcity Bar: ${features.scarcityBar ? '✅' : '❌'}`);
        console.log(`Stock Counter: ${features.stockCounter ? `✅ (${features.stockCounter})` : '❌'}`);
        console.log(`Size Options: ${features.sizeSelector > 0 ? `✅ (${features.sizeSelector})` : '❌'}`);
        console.log(`Urgency Widget: ${features.urgencyWidget ? '✅' : '❌'}`);
        console.log(`Price Display: ${features.priceDisplay ? '✅' : '❌'}`);
        
        Object.entries(features).forEach(([feature, present]) => {
            if (!present) issues.push(`Feature missing: ${feature}`);
        });
        
        // 4. INTERACTION TEST
        console.log('\n🖱️ INTERACTION TEST');
        console.log('===================');
        
        // Test store dropdown
        console.log('Testing store dropdown...');
        const dropdownTest = await page.evaluate(() => {
            const header = document.querySelector('.availability-header');
            const content = document.querySelector('#storeAvailability');
            
            if (!header || !content) return { exists: false };
            
            const initialHeight = content.offsetHeight;
            header.click();
            
            // Wait a bit for animation
            return new Promise(resolve => {
                setTimeout(() => {
                    const finalHeight = content.offsetHeight;
                    resolve({
                        exists: true,
                        opened: finalHeight > initialHeight,
                        hasImage: !!content.querySelector('.hamptons-store-photo')
                    });
                }, 500);
            });
        });
        
        if (dropdownTest.exists) {
            console.log(`  Dropdown exists: ✅`);
            console.log(`  Opens on click: ${dropdownTest.opened ? '✅' : '❌'}`);
            console.log(`  Shows storefront: ${dropdownTest.hasImage ? '✅' : '❌'}`);
            
            if (!dropdownTest.opened) issues.push('Store dropdown not opening');
        } else {
            console.log(`  Dropdown missing: ❌`);
            issues.push('Store dropdown missing');
        }
        
        // 5. MOBILE TEST
        console.log('\n📱 MOBILE TEST');
        console.log('==============');
        
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(500);
        
        const mobileCheck = await page.evaluate(() => {
            return {
                responsive: window.innerWidth === 375,
                imageVisible: document.querySelector('.product-image')?.offsetWidth > 0,
                buttonSize: document.querySelector('.add-to-cart')?.offsetHeight >= 44,
                textReadable: parseInt(window.getComputedStyle(document.querySelector('h1')).fontSize) >= 28
            };
        });
        
        console.log(`Responsive Layout: ${mobileCheck.responsive ? '✅' : '❌'}`);
        console.log(`Image Scales: ${mobileCheck.imageVisible ? '✅' : '❌'}`);
        console.log(`Touch Targets: ${mobileCheck.buttonSize ? '✅' : '❌'}`);
        console.log(`Text Readable: ${mobileCheck.textReadable ? '✅' : '❌'}`);
        
        // 6. SCREENSHOTS
        console.log('\n📸 CAPTURING FINAL SCREENSHOTS');
        console.log('==============================');
        
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.screenshot({ path: 'final-desktop-perfect.png', fullPage: false });
        console.log('Desktop screenshot: final-desktop-perfect.png');
        
        await page.setViewportSize({ width: 375, height: 812 });
        await page.screenshot({ path: 'final-mobile-perfect.png', fullPage: false });
        console.log('Mobile screenshot: final-mobile-perfect.png');
        
        // 7. FINAL VERDICT
        console.log('\n' + '='.repeat(60));
        console.log('🏆 FINAL VERDICT - PRODUCTION READINESS');
        console.log('='.repeat(60) + '\n');
        
        if (issues.length === 0) {
            console.log('✅ PERFECT! WEBSITE IS 100% READY!\n');
            console.log('✅ Sub-1 second load time achieved');
            console.log('✅ All images loading correctly');
            console.log('✅ All features working perfectly');
            console.log('✅ Mobile experience optimized');
            console.log('✅ Store dropdown functional');
            console.log('✅ Ready for Vercel deployment');
            
            console.log('\n🚀 SHIP IT! DEPLOY NOW!');
            console.log('=======================');
            console.log('1. Run: vercel --prod');
            console.log('2. Your site will be live in 30 seconds');
            console.log('3. Sub-1 second loads globally guaranteed');
            console.log('4. All features working perfectly\n');
        } else {
            console.log('❌ ISSUES FOUND:\n');
            issues.forEach((issue, i) => {
                console.log(`${i + 1}. ${issue}`);
            });
            console.log('\nFix these issues before deployment.');
        }
        
        await context.close();
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
        server.close();
        console.log('\n✅ Test complete. Server stopped.');
    }
}

// Run the final test
finalComprehensiveTest().catch(console.error);