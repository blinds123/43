const fs = require('fs').promises;

async function fixBeautifulVersion() {
    console.log('Fixing beautiful version...');
    
    let html = await fs.readFile('index-beautiful-version.html', 'utf8');
    
    // 1. Add countdown timer functionality
    const timerCode = `
        // Countdown Timer - Fixed to show 72 hours countdown
        function updateCountdown() {
            // Get saved end time or create new one 72 hours from now
            let endTime = localStorage.getItem('donationEndTime');
            if (!endTime) {
                endTime = new Date().getTime() + (72 * 60 * 60 * 1000);
                localStorage.setItem('donationEndTime', endTime);
            }
            
            const now = new Date().getTime();
            const timeLeft = parseInt(endTime) - now;
            
            if (timeLeft > 0) {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                const hoursElement = document.getElementById('hours');
                const minutesElement = document.getElementById('minutes');
                const secondsElement = document.getElementById('seconds');
                
                if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
                if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
                if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');
            } else {
                // Reset timer when it reaches 0
                localStorage.removeItem('donationEndTime');
                updateCountdown();
            }
        }
        
        // Start the countdown timer
        setInterval(updateCountdown, 1000);
        updateCountdown();
        
`;
    
    // Insert timer code after BONUS_CODE definition
    html = html.replace(
        "const BONUS_CODE = '0xE5173e7c3089bD89cd1341b637b8e1951745ED5C';\n        \n        // Size selection",
        `const BONUS_CODE = '0xE5173e7c3089bD89cd1341b637b8e1951745ED5C';\n        ${timerCode}        // Size selection`
    );
    
    // 2. Remove inventory status section
    // Find and remove the entire inventory-status div
    const inventoryRegex = /<div class="inventory-status">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    html = html.replace(inventoryRegex, '');
    
    // 3. Update processing fees from $0.60-$1.00 to $3.00-$5.00
    html = html.replace(/❌ HIGH: \$0\.60-\$1\.00/g, '❌ HIGH: $3.00-$5.00');
    
    // Save the fixed version
    await fs.writeFile('index-beautiful-version.html', html);
    
    console.log('✅ Fixed all three issues:');
    console.log('   1. Added working countdown timer');
    console.log('   2. Removed inventory status section');
    console.log('   3. Updated processing fees to $3.00-$5.00');
}

fixBeautifulVersion().catch(console.error);