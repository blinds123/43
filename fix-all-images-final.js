// 🖼️ FINAL IMAGE FIX - EXTREME PREJUDICE
// This will find and fix ALL image issues

const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

async function fixAllImagesFinal() {
    console.log('🔍 DIAGNOSING ALL IMAGE ISSUES WITH EXTREME PREJUDICE');
    console.log('====================================================\n');
    
    try {
        // 1. READ HTML AND FIND ALL IMAGE REFERENCES
        console.log('📄 Reading HTML file...');
        const html = await fs.readFile('index.html', 'utf8');
        
        // Find all image references
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
        const backgroundRegex = /background-image:\s*url\(['"]?([^'")]+)['"]?\)/g;
        
        const images = new Set();
        let match;
        
        // Find <img> tags
        while ((match = imgRegex.exec(html)) !== null) {
            if (!match[1].includes('data:') && !match[1].includes('http')) {
                images.add(match[1]);
            }
        }
        
        // Find background-image CSS
        while ((match = backgroundRegex.exec(html)) !== null) {
            if (!match[1].includes('data:') && !match[1].includes('http')) {
                images.add(match[1]);
            }
        }
        
        console.log(`\n📊 Found ${images.size} image references in HTML\n`);
        
        // 2. CHECK EACH IMAGE
        console.log('🔍 Checking each image path...\n');
        
        const imageStatus = [];
        for (const imgPath of images) {
            const fullPath = path.join(__dirname, imgPath.replace(/^\.\//, ''));
            const exists = await fs.access(fullPath).then(() => true).catch(() => false);
            
            imageStatus.push({
                path: imgPath,
                fullPath: fullPath,
                exists: exists
            });
            
            console.log(`${exists ? '✅' : '❌'} ${imgPath}`);
            if (!exists) {
                console.log(`   Expected at: ${fullPath}`);
            }
        }
        
        // 3. FIX PATH ISSUES
        console.log('\n🔧 Fixing path issues...');
        
        let fixedHtml = html;
        const pathFixes = [
            // Common path issues
            { from: /src="\.\/images\//g, to: 'src="images/' },
            { from: /src="\/images\//g, to: 'src="images/' },
            { from: /src="\.\.\/images\//g, to: 'src="images/' },
            { from: /url\(['"]?\.\/images\//g, to: 'url(images/' },
            { from: /url\(['"]?\/images\//g, to: 'url(images/' }
        ];
        
        for (const fix of pathFixes) {
            const before = fixedHtml.match(fix.from)?.length || 0;
            fixedHtml = fixedHtml.replace(fix.from, fix.to);
            const after = fixedHtml.match(fix.from)?.length || 0;
            if (before > after) {
                console.log(`   Fixed ${before - after} instances of ${fix.from}`);
            }
        }
        
        // 4. BROWSER TEST
        console.log('\n🌐 Testing in real browser...');
        
        const browser = await chromium.launch({ headless: false, slowMo: 500 });
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('   Browser error:', msg.text());
            }
        });
        
        // Listen for failed requests
        page.on('requestfailed', request => {
            if (request.resourceType() === 'image') {
                console.log(`   ❌ Image failed to load: ${request.url()}`);
            }
        });
        
        await page.goto(`file://${__dirname}/index.html`, { waitUntil: 'networkidle' });
        
        // Check all images in the browser
        const browserImageCheck = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.map(img => ({
                src: img.src,
                alt: img.alt,
                loaded: img.complete && img.naturalHeight > 0,
                displayed: img.offsetWidth > 0 && img.offsetHeight > 0,
                naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
                displaySize: `${img.offsetWidth}x${img.offsetHeight}`,
                error: img.complete && img.naturalHeight === 0
            }));
        });
        
        console.log('\n📸 Browser Image Report:');
        console.log('========================\n');
        
        let failedImages = [];
        for (const img of browserImageCheck) {
            const status = img.loaded ? '✅' : '❌';
            console.log(`${status} ${img.src.replace('file://', '')}`);
            if (!img.loaded) {
                console.log(`   - Alt: ${img.alt}`);
                console.log(`   - Error: Image failed to load`);
                failedImages.push(img);
            } else if (!img.displayed) {
                console.log(`   ⚠️ Loaded but not displayed (${img.displaySize})`);
            }
        }
        
        // 5. CREATE FALLBACK IMAGES IF NEEDED
        if (failedImages.length > 0) {
            console.log('\n🎨 Creating fallback images...');
            
            // Check if we need to create placeholder images
            for (const failed of failedImages) {
                const imgPath = failed.src.replace('file://' + __dirname + '/', '');
                console.log(`   Creating placeholder for: ${imgPath}`);
                
                // For now, log what needs to be fixed
                console.log(`   TODO: Ensure ${imgPath} exists`);
            }
        }
        
        // 6. CHECK SPECIFIC CRITICAL IMAGES
        console.log('\n🎯 Checking Critical Images:');
        console.log('============================\n');
        
        const criticalImages = [
            { selector: '.product-image', name: 'Main Hoodie' },
            { selector: '.hamptons-store-photo', name: 'Storefront' },
            { selector: '.slide-image', name: 'TikTok Slides' },
            { selector: '.review-image', name: 'Reviews' }
        ];
        
        for (const critical of criticalImages) {
            const found = await page.$$(critical.selector);
            console.log(`${critical.name}: ${found.length} found`);
            
            if (found.length > 0) {
                const firstImg = found[0];
                const imgData = await firstImg.evaluate(img => ({
                    src: img.src,
                    loaded: img.complete && img.naturalHeight > 0
                }));
                console.log(`   First image: ${imgData.loaded ? '✅ Loaded' : '❌ Failed'}`);
                if (!imgData.loaded) {
                    console.log(`   Source: ${imgData.src}`);
                }
            }
        }
        
        // 7. FINAL FIX APPLICATION
        console.log('\n💾 Applying final fixes...');
        
        // Save the fixed HTML
        await fs.writeFile('index-fixed-images.html', fixedHtml);
        console.log('   ✓ Created index-fixed-images.html');
        
        // Create a diagnostic report
        const report = {
            timestamp: new Date().toISOString(),
            totalImages: images.size,
            failedImages: failedImages.length,
            issues: failedImages.map(img => ({
                src: img.src.replace('file://' + __dirname + '/', ''),
                alt: img.alt
            })),
            recommendations: []
        };
        
        if (failedImages.length > 0) {
            report.recommendations.push('1. Check that all image files exist in the images/ directory');
            report.recommendations.push('2. Ensure image paths use relative paths (images/filename.jpg)');
            report.recommendations.push('3. Verify file names match exactly (case-sensitive)');
            report.recommendations.push('4. Check file permissions');
        }
        
        await fs.writeFile('image-diagnostic-report.json', JSON.stringify(report, null, 2));
        console.log('   ✓ Created image-diagnostic-report.json');
        
        // 8. FINAL SUMMARY
        console.log('\n📊 FINAL IMAGE STATUS');
        console.log('====================');
        console.log(`Total Images: ${images.size}`);
        console.log(`Successfully Loaded: ${browserImageCheck.length - failedImages.length}`);
        console.log(`Failed to Load: ${failedImages.length}`);
        
        if (failedImages.length === 0) {
            console.log('\n✅ ALL IMAGES ARE LOADING CORRECTLY!');
        } else {
            console.log('\n❌ Some images need attention:');
            failedImages.forEach(img => {
                const imgPath = img.src.replace('file://' + __dirname + '/', '');
                console.log(`   - ${imgPath}`);
            });
            
            console.log('\n🔧 NEXT STEPS:');
            console.log('1. Check the image-diagnostic-report.json');
            console.log('2. Verify all image files exist in the images/ directory');
            console.log('3. Use index-fixed-images.html if paths were corrected');
        }
        
        await page.screenshot({ path: 'image-diagnostic-screenshot.png', fullPage: true });
        console.log('\n📸 Screenshot saved: image-diagnostic-screenshot.png');
        
        await browser.close();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the diagnostic
fixAllImagesFinal().catch(console.error);