// 🏪 USE REAL STOREFRONT IMAGE

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

async function useRealStorefront() {
    console.log('🏪 IMPLEMENTING REAL AURALO STOREFRONT');
    console.log('=====================================\n');
    
    try {
        // 1. FIND THE REAL STOREFRONT IMAGE
        console.log('🔍 Searching for real storefront image...');
        
        const possibleStorefronts = [
            'real-auralo-storefront-test.png',
            'real-auralo-storefront-tablet.png',
            '/Users/nelsonchan/Desktop/auralo-storefront.jpg',
            '/Users/nelsonchan/Downloads/auralo-storefront.jpg',
            '/var/folders/*/T/*/auralo*.jpg',
            '/var/folders/*/T/*/storefront*.jpg'
        ];
        
        let realStorefrontPath = null;
        
        // Check each possible location
        for (const storefront of possibleStorefronts) {
            if (storefront.includes('*')) continue; // Skip glob patterns for now
            
            const exists = await fs.access(storefront).then(() => true).catch(() => false);
            if (exists) {
                realStorefrontPath = storefront;
                console.log(`   ✅ Found: ${storefront}`);
                break;
            }
        }
        
        if (realStorefrontPath) {
            // 2. COPY AND OPTIMIZE THE REAL IMAGE
            console.log('\n📸 Processing real storefront image...');
            
            const targetPath = './images/hamptons-store_optimized.jpg';
            
            // Check if it's a PNG that needs conversion
            if (realStorefrontPath.endsWith('.png')) {
                // Convert PNG to optimized JPG
                await sharp(realStorefrontPath)
                    .jpeg({ 
                        quality: 90,
                        progressive: true,
                        mozjpeg: true
                    })
                    .resize(600, 450, { 
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toFile(targetPath);
                
                console.log('   ✅ Converted PNG to optimized JPG');
            } else {
                // Copy and optimize JPG
                await sharp(realStorefrontPath)
                    .jpeg({ 
                        quality: 90,
                        progressive: true,
                        mozjpeg: true
                    })
                    .resize(600, 450, { 
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toFile(targetPath);
                
                console.log('   ✅ Optimized and saved');
            }
            
            // Create mobile version
            await sharp(realStorefrontPath)
                .jpeg({ quality: 85, progressive: true })
                .resize(400, 300, { fit: 'inside' })
                .toFile('./images/hamptons-store-mobile.jpg');
            
            console.log('   ✅ Created mobile version');
            
            // Get file sizes
            const mainSize = (await fs.stat(targetPath)).size;
            const mobileSize = (await fs.stat('./images/hamptons-store-mobile.jpg')).size;
            
            console.log(`   📊 Main: ${(mainSize / 1024).toFixed(1)}KB`);
            console.log(`   📊 Mobile: ${(mobileSize / 1024).toFixed(1)}KB`);
            
            // 3. UPDATE HTML TO ENSURE CORRECT PATH
            console.log('\n📝 Updating HTML...');
            
            let html = await fs.readFile('index.html', 'utf8');
            
            // Ensure the storefront image uses the correct path
            html = html.replace(
                /src="[^"]*hamptons-store[^"]*"/g,
                'src="images/hamptons-store_optimized.jpg"'
            );
            
            await fs.writeFile('index.html', html);
            console.log('   ✅ Updated image paths');
            
            console.log('\n🎉 SUCCESS!');
            console.log('===========');
            console.log('✅ Real AURALO storefront image implemented');
            console.log('✅ Image optimized for web');
            console.log('✅ Mobile version created');
            console.log('✅ HTML updated');
            console.log('\nThe real storefront photo is now displayed in the store availability section!');
            
        } else {
            console.log('\n❌ Real storefront image not found in expected locations');
            console.log('\n📋 To fix this:');
            console.log('1. Locate your original AURALO storefront photo');
            console.log('2. Save it as one of these:');
            console.log('   - /Users/nelsonchan/vercel-deployment/images/auralo-storefront-real.jpg');
            console.log('   - /Users/nelsonchan/Desktop/auralo-storefront.jpg');
            console.log('   - /Users/nelsonchan/Downloads/auralo-storefront.jpg');
            console.log('3. Run this script again');
            
            console.log('\n📸 The image should show:');
            console.log('   - Cream/beige colored building');
            console.log('   - Black AURALO lettering');
            console.log('   - Large windows with hoodies displayed');
            console.log('   - Hamptons/luxury aesthetic');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run it
useRealStorefront().catch(console.error);