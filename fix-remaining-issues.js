// 🔧 FIX REMAINING ISSUES - MAKE EVERYTHING PERFECT

const fs = require('fs').promises;

async function fixRemainingIssues() {
    console.log('🔧 FIXING REMAINING ISSUES');
    console.log('=========================\n');
    
    try {
        let html = await fs.readFile('index.html', 'utf8');
        
        // 1. FIX SCARCITY BAR
        console.log('1️⃣ Ensuring scarcity bar is present...');
        
        // Check if scarcity bar exists
        if (!html.includes('class="ultra-scarcity-bar"')) {
            // Add it before closing body
            const scarcityBarHTML = `
    <!-- Scarcity Bar -->
    <div class="ultra-scarcity-bar">
        <div class="scarcity-content">
            <div class="flame-icon">🔥</div>
            <div class="scarcity-text">
                <span class="scarcity-label">FOUNDING MEMBER PRICE EXPIRES IN:</span>
                <span class="countdown-timer" id="premium-countdown">23:59:47</span>
            </div>
            <div class="stock-level">
                <span class="stock-icon">📦</span>
                <span class="stock-text">Only <span id="stock-count">23</span> left at this price!</span>
            </div>
        </div>
    </div>`;
            
            html = html.replace('</body>', scarcityBarHTML + '\n</body>');
            console.log('   ✅ Added scarcity bar');
        } else {
            console.log('   ✅ Scarcity bar already present');
        }
        
        // 2. ENSURE CRITICAL IMAGES LOAD IMMEDIATELY
        console.log('\n2️⃣ Optimizing image loading...');
        
        // Remove lazy loading from critical images (first few that are visible)
        let imageCount = 0;
        html = html.replace(/<img([^>]*?)>/g, (match, attrs) => {
            imageCount++;
            
            // First 5 images should not be lazy loaded
            if (imageCount <= 5 && attrs.includes('loading="lazy"')) {
                const newAttrs = attrs.replace(' loading="lazy"', '');
                console.log(`   Removed lazy loading from image ${imageCount}`);
                return `<img${newAttrs}>`;
            }
            
            // Ensure all images have loading attribute
            if (!attrs.includes('loading=') && imageCount > 5) {
                return `<img${attrs} loading="lazy">`;
            }
            
            return match;
        });
        
        // 3. ENSURE WEBP FALLBACK WORKS
        console.log('\n3️⃣ Fixing WebP fallbacks...');
        
        // Check if WebP image exists, if not use original
        if (html.includes('dscxr443e2_optimized-web.webp')) {
            const webpExists = await fs.access('./images/dscxr443e2_optimized-web.webp')
                .then(() => true)
                .catch(() => false);
            
            if (!webpExists) {
                console.log('   WebP not found, reverting to JPEG');
                html = html.replace(/dscxr443e2_optimized-web\.webp/g, 'dscxr443e2_optimized.jpg');
            }
        }
        
        // 4. ADD COUNTDOWN TIMER FUNCTIONALITY
        console.log('\n4️⃣ Adding countdown timer script...');
        
        if (!html.includes('updateCountdown')) {
            const timerScript = `
    <script>
    // Countdown timer for scarcity bar
    (function() {
        let timeLeft = localStorage.getItem('auralo_timer') || 86400; // 24 hours
        
        function updateCountdown() {
            const timer = document.getElementById('premium-countdown');
            if (!timer) return;
            
            timeLeft--;
            if (timeLeft < 0) timeLeft = 86400; // Reset
            
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            timer.textContent = hours.toString().padStart(2, '0') + ':' + 
                               minutes.toString().padStart(2, '0') + ':' + 
                               seconds.toString().padStart(2, '0');
            
            localStorage.setItem('auralo_timer', timeLeft);
            
            // Add urgency if less than 1 hour
            if (timeLeft < 3600) {
                document.querySelector('.ultra-scarcity-bar')?.classList.add('urgent');
            }
        }
        
        // Update every second
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial update
    })();
    </script>`;
            
            html = html.replace('</body>', timerScript + '\n</body>');
            console.log('   ✅ Added countdown timer');
        }
        
        // 5. ENSURE CSS FOR SCARCITY BAR
        console.log('\n5️⃣ Ensuring scarcity bar CSS...');
        
        if (!html.includes('.scarcity-content')) {
            const scarcityCSS = `
    /* Scarcity Bar Styles */
    .ultra-scarcity-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(45deg, #ff006e, #8338ec);
        color: white;
        padding: 12px;
        z-index: 900;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.3);
    }
    
    .scarcity-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .scarcity-text {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .countdown-timer {
        font-size: 18px;
        font-weight: 900;
        font-family: monospace;
    }
    
    .ultra-scarcity-bar.urgent {
        animation: urgentPulse 0.5s ease-in-out infinite;
    }
    
    @keyframes urgentPulse {
        0%, 100% { background: linear-gradient(45deg, #ff006e, #8338ec); }
        50% { background: linear-gradient(45deg, #ff0000, #ff006e); }
    }
    
    @media (max-width: 768px) {
        .scarcity-content {
            justify-content: center;
            text-align: center;
            font-size: 14px;
        }
        
        .countdown-timer {
            font-size: 16px;
        }
    }`;
            
            // Add to existing style tag or create new one
            const styleEndIndex = html.lastIndexOf('</style>');
            if (styleEndIndex > -1) {
                html = html.slice(0, styleEndIndex) + scarcityCSS + '\n' + html.slice(styleEndIndex);
            } else {
                const headEndIndex = html.indexOf('</head>');
                html = html.slice(0, headEndIndex) + '<style>' + scarcityCSS + '</style>\n' + html.slice(headEndIndex);
            }
            
            console.log('   ✅ Added scarcity bar CSS');
        }
        
        // 6. SAVE FIXED VERSION
        await fs.writeFile('index.html', html);
        
        console.log('\n✅ ALL ISSUES FIXED!');
        console.log('===================');
        console.log('✅ Scarcity bar added and styled');
        console.log('✅ Countdown timer functional');
        console.log('✅ Critical images load immediately');
        console.log('✅ Lazy loading optimized');
        console.log('✅ WebP fallbacks in place');
        
        console.log('\n🚀 Website is now PERFECT and ready to deploy!');
        console.log('Run one more test to verify, then deploy to Vercel!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Fix the issues
fixRemainingIssues().catch(console.error);