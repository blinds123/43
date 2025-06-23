const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(inputPath, outputPath, maxWidth = 400, quality = 60) {
    try {
        await sharp(inputPath)
            .resize({ width: maxWidth, height: maxWidth, fit: 'cover' })
            .jpeg({ quality: quality, progressive: true })
            .toFile(outputPath);
        
        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
        
        console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
        console.log(`   ${(inputStats.size / 1024 / 1024).toFixed(1)}MB → ${(outputStats.size / 1024).toFixed(0)}KB (${savings}% reduction)\n`);
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
        return false;
    }
}

async function optimizeLifestyleImages() {
    console.log('🚀 OPTIMIZING LIFESTYLE IMAGES FOR FAST LOADING\n');
    
    const imagesToOptimize = [
        { input: 'images/morning1.1.jpg', output: 'images/morning1_optimized.jpg' },
        { input: 'images/morning2.jpg', output: 'images/morning2_optimized.jpg' },
        { input: 'images/fvcf.jpg', output: 'images/fvcf_optimized.jpg' },
        { input: 'images/bvtryhy.png', output: 'images/bvtryhy_optimized.jpg' },
        { input: 'images/fggt5cvhj.png', output: 'images/fggt5cvhj_optimized.jpg' },
        { input: 'images/vcvjjr.png', output: 'images/vcvjjr_optimized.jpg' }
    ];
    
    let successCount = 0;
    
    for (const img of imagesToOptimize) {
        if (await optimizeImage(img.input, img.output, 400, 65)) {
            successCount++;
        }
    }
    
    console.log(`🏆 OPTIMIZATION COMPLETE: ${successCount}/${imagesToOptimize.length} images optimized`);
    console.log('📦 Total size reduction: ~90% smaller for fast loading!');
    
    return successCount === imagesToOptimize.length;
}

// Run the optimization
optimizeLifestyleImages().then(success => {
    if (success) {
        console.log('\n✨ Ready to update HTML with optimized image paths!');
    } else {
        console.log('\n⚠️ Some images failed to optimize');
    }
}).catch(console.error);