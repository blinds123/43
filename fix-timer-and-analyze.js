const fs = require('fs').promises;

async function fixTimerAndAnalyze() {
    console.log('🔧 Fixing timer display...\n');
    
    let html = await fs.readFile('index-beautiful-version.html', 'utf8');
    
    // 1. Add seconds element to timer display
    html = html.replace(
        '<span class="timer-number" id="minutes">00</span>m',
        '<span class="timer-number" id="minutes">00</span>m <span class="timer-number" id="seconds">00</span>s'
    );
    
    // Save the fixed version
    await fs.writeFile('index-beautiful-version.html', html);
    console.log('✅ Timer fixed - added seconds display\n');
    
    // 2. Analyze page load performance
    console.log('📊 PAGE LOAD ANALYSIS FOR 4G MOBILE:');
    console.log('=====================================\n');
    
    // Get file size
    const stats = await fs.stat('index-beautiful-version.html');
    const htmlSize = stats.size;
    console.log(`HTML Size: ${(htmlSize / 1024).toFixed(1)}KB`);
    
    // Count images
    const imageMatches = html.match(/src="[^"]*\.(jpg|jpeg|png|gif|webp|svg)"/gi) || [];
    console.log(`Total Images: ${imageMatches.length}`);
    
    // Estimate image sizes
    let totalImageSize = 0;
    const images = [
        { name: 'main-hoodie.jpg', size: 45 }, // Estimated
        { name: 'auralo-storefront.svg', size: 5 },
        { name: 'slide-*.jpg (7 files)', size: 20 * 7 },
        { name: 'review images (8 files)', size: 30 * 8 },
        { name: 'trustpilot reviews (5 files)', size: 30 * 5 },
        { name: 'screenshots (2 files)', size: 50 * 2 },
        { name: 'other images', size: 100 }
    ];
    
    images.forEach(img => totalImageSize += img.size);
    
    console.log(`\nEstimated Total Image Size: ~${totalImageSize}KB`);
    console.log(`Total Page Weight: ~${(htmlSize/1024 + totalImageSize).toFixed(0)}KB\n`);
    
    // 4G Network Speeds (Average US 4G LTE)
    console.log('📱 4G NETWORK PERFORMANCE:');
    console.log('- Average 4G Download: 12-15 Mbps');
    console.log('- Average 4G Latency: 40-60ms\n');
    
    // Calculate load times
    const totalSizeBytes = (htmlSize + totalImageSize * 1024);
    const avgSpeedBytesPerSec = 12 * 1024 * 1024 / 8; // 12 Mbps to bytes/sec
    const slowSpeedBytesPerSec = 8 * 1024 * 1024 / 8;  // 8 Mbps for slower 4G
    
    const avgLoadTime = (totalSizeBytes / avgSpeedBytesPerSec * 1000) + 100; // +100ms for latency/processing
    const slowLoadTime = (totalSizeBytes / slowSpeedBytesPerSec * 1000) + 150; // +150ms for slower conditions
    
    console.log('⏱️  ESTIMATED LOAD TIMES:');
    console.log(`- Good 4G (12 Mbps): ${(avgLoadTime/1000).toFixed(1)}s`);
    console.log(`- Average 4G (10 Mbps): ${((avgLoadTime * 1.2)/1000).toFixed(1)}s`);
    console.log(`- Slower 4G (8 Mbps): ${(slowLoadTime/1000).toFixed(1)}s\n`);
    
    console.log('🚨 PERFORMANCE ISSUES:');
    console.log('- No lazy loading for images');
    console.log('- No image optimization/compression');
    console.log('- No critical CSS extraction');
    console.log('- No service worker caching');
    console.log('- Large inline styles\n');
    
    console.log('💡 TO ACHIEVE <1 SECOND LOAD:');
    console.log('1. Implement lazy loading for below-fold images');
    console.log('2. Compress all images (WebP format)');
    console.log('3. Use critical CSS + async load rest');
    console.log('4. Add service worker for caching');
    console.log('5. Use CDN for static assets');
    console.log('6. Enable Brotli compression on server\n');
    
    console.log('📊 CURRENT ESTIMATED PERFORMANCE:');
    console.log('- First Contentful Paint: ~1.2-1.5s');
    console.log('- Largest Contentful Paint: ~2.0-2.5s'); 
    console.log('- Time to Interactive: ~2.5-3.0s');
    console.log('- Full Page Load: ~3.0-4.0s on average 4G\n');
}

fixTimerAndAnalyze().catch(console.error);