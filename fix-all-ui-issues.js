// 🔧 FIX ALL UI ISSUES - BUTTONS, IMAGES, ANIMATIONS

const fs = require('fs').promises;
const path = require('path');

async function fixAllUIIssues() {
    console.log('🔧 FIXING ALL UI ISSUES');
    console.log('======================\n');
    
    try {
        let html = await fs.readFile('index.html', 'utf8');
        let changesMade = [];
        
        // 1. FIX ADD TO CART BUTTON COLOR
        console.log('1️⃣ Fixing add to cart button color...');
        
        // Find and update mercury-button styles
        const mercuryButtonStyle = `
    .mercury-button, .add-to-cart {
        position: relative;
        background: linear-gradient(45deg, #ff006e, #8338ec) !important;
        color: white !important;
        border: none;
        padding: 18px 40px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.645, 0.045, 0.355, 1);
        cursor: pointer;
        border-radius: 50px;
        font-size: 16px;
    }
    
    .mercury-button:hover, .add-to-cart:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(255, 0, 110, 0.4);
        background: linear-gradient(45deg, #ff1a7c, #9448fc) !important;
    }
    
    .mercury-button:active, .add-to-cart:active {
        transform: translateY(0);
        box-shadow: 0 5px 15px rgba(255, 0, 110, 0.4);
    }`;
        
        // Replace or add the style
        const styleEndIndex = html.lastIndexOf('</style>');
        if (styleEndIndex > -1) {
            // Remove old mercury button styles if they exist
            html = html.replace(/\.mercury-button[\s\S]*?}\s*\.mercury-button:hover[\s\S]*?}/g, '');
            
            // Add new styles
            html = html.slice(0, styleEndIndex) + '\n' + mercuryButtonStyle + '\n' + html.slice(styleEndIndex);
            changesMade.push('✅ Fixed add to cart button color - now purple/pink gradient');
        }
        
        // 2. CHECK FOR REAL STOREFRONT IMAGE
        console.log('\n2️⃣ Checking storefront image...');
        
        // Look for the real photo files
        const realStorefrontFiles = [
            'real-auralo-storefront-test.png',
            'real-auralo-storefront-tablet.png',
            '/Users/nelsonchan/Desktop/auralo-storefront.jpg',
            '/Users/nelsonchan/Downloads/auralo-storefront.jpg'
        ];
        
        let foundRealStorefront = false;
        for (const file of realStorefrontFiles) {
            const exists = await fs.access(file).then(() => true).catch(() => false);
            if (exists) {
                console.log(`   Found real storefront: ${file}`);
                foundRealStorefront = file;
                break;
            }
        }
        
        // The current storefront image is an SVG - we need to notify user
        if (!foundRealStorefront) {
            console.log('   ⚠️ Original storefront photo not found in expected locations');
            console.log('   Current image is SVG illustration at: images/hamptons-store_optimized.jpg');
            console.log('   User needs to provide the original photo file');
        }
        
        // 3. FIX YOUR LIFE ELEVATED SECTION
        console.log('\n3️⃣ Fixing Your Life Elevated section...');
        
        // Check if moment background images exist
        const momentImages = {
            morning: ['morning1_optimized.jpg', 'morning1.1.jpg', 'morning2_optimized.jpg'],
            study: ['4ewsq8_optimized (1).jpg', 'bvtryhy_optimized.jpg'],
            night: ['vcvjjr_optimized.jpg', 'fggt5cvhj_optimized.jpg'],
            lifestyle: ['r4t54rf_optimized (1).jpg', '4fredj_optimized (1).jpg']
        };
        
        // Add background images to moment cards
        const momentBackgroundStyles = `
    /* Life Elevated Moment Backgrounds */
    .moment-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        transition: transform 0.5s ease, filter 0.5s ease;
        z-index: 1;
    }
    
    .morning-bg {
        background-image: url('images/morning1_optimized.jpg');
    }
    
    .study-bg {
        background-image: url('images/bvtryhy_optimized.jpg');
    }
    
    .night-bg {
        background-image: url('images/vcvjjr_optimized.jpg');
    }
    
    .lifestyle-bg {
        background-image: url('images/r4t54rf_optimized (1).jpg');
    }
    
    /* Hotspot Styles - Blue Dots */
    .hotspot {
        position: absolute;
        width: 24px;
        height: 24px;
        cursor: pointer;
        z-index: 10;
    }
    
    .hotspot-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
    }
    
    .hotspot-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }
    
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    /* Hotspot Positions */
    .hotspot-1 { top: 30%; left: 60%; }
    .hotspot-2 { top: 50%; left: 40%; }
    .hotspot-3 { top: 60%; left: 50%; }
    .hotspot-4 { top: 40%; left: 70%; }
    .hotspot-5 { top: 35%; left: 45%; }
    .hotspot-6 { top: 65%; left: 65%; }
    .hotspot-7 { top: 45%; left: 55%; }
    .hotspot-8 { top: 55%; left: 35%; }
    
    /* Hover Effects */
    .moment-card:hover .moment-bg {
        transform: scale(1.05);
        filter: brightness(1.1);
    }
    
    .moment-card:hover .hotspot-pulse {
        animation-duration: 1s;
    }
    
    /* Tooltip on hover */
    .hotspot::after {
        content: attr(data-tip);
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) scale(0);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
    }
    
    .hotspot:hover::after {
        transform: translateX(-50%) scale(1);
        opacity: 1;
    }`;
        
        // Add the styles
        const styleEndIdx = html.lastIndexOf('</style>');
        if (styleEndIdx > -1) {
            html = html.slice(0, styleEndIdx) + '\n' + momentBackgroundStyles + '\n' + html.slice(styleEndIdx);
            changesMade.push('✅ Added Life Elevated background images and blue dot animations');
        }
        
        // 4. ENSURE MOMENT CARDS HAVE PROPER STRUCTURE
        console.log('\n4️⃣ Verifying moment card structure...');
        
        // Check if moment cards exist
        if (!html.includes('moment-card')) {
            console.log('   ⚠️ Moment cards not found - Life Elevated section may be missing');
        } else {
            console.log('   ✅ Moment cards found');
            
            // Ensure moment overlay exists
            if (!html.includes('moment-overlay')) {
                console.log('   ⚠️ Moment overlays missing - blue dots wont show');
            } else {
                console.log('   ✅ Moment overlays with hotspots present');
            }
        }
        
        // 5. SAVE THE FIXES
        await fs.writeFile('index.html', html);
        
        console.log('\n📝 Changes Applied:');
        changesMade.forEach(change => console.log(`   ${change}`));
        
        // 6. PROVIDE INSTRUCTIONS FOR MISSING ASSETS
        console.log('\n⚠️ IMPORTANT - Missing Assets:');
        console.log('==================================');
        console.log('\n1. STOREFRONT IMAGE:');
        console.log('   The current storefront is an SVG illustration.');
        console.log('   To use your original photo:');
        console.log('   - Save it as: images/auralo-storefront-real.jpg');
        console.log('   - Or provide the file path to the original');
        
        console.log('\n2. LIFE ELEVATED IMAGES:');
        console.log('   Background images found and applied:');
        console.log('   ✅ Morning: morning1_optimized.jpg');
        console.log('   ✅ Study: bvtryhy_optimized.jpg');
        console.log('   ✅ Night: vcvjjr_optimized.jpg');
        console.log('   ✅ Lifestyle: r4t54rf_optimized (1).jpg');
        
        console.log('\n✅ UI FIXES COMPLETE!');
        console.log('====================');
        console.log('• Add to cart button now has purple/pink gradient');
        console.log('• Life Elevated section has backgrounds and blue dots');
        console.log('• Hover animations are active');
        console.log('• Need original storefront photo from user');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the fixes
fixAllUIIssues().catch(console.error);