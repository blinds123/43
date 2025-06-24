const sharp = require('sharp');
const fs = require('fs');

async function createOptimizedStorefront() {
    console.log('🏪 CREATING SMALL OPTIMIZED STOREFRONT IMAGE');
    console.log('===========================================\n');
    
    try {
        // Create a smaller, optimized storefront image for web display
        const width = 280;
        const height = 180;
        
        const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#87CEEB"/>
                    <stop offset="100%" style="stop-color:#E0F6FF"/>
                </linearGradient>
                <linearGradient id="building" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#FFFFFF"/>
                    <stop offset="100%" style="stop-color:#F5F5F5"/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.2"/>
                </filter>
            </defs>
            
            <!-- Sky background -->
            <rect width="100%" height="60%" fill="url(#sky)"/>
            
            <!-- Ground -->
            <rect y="60%" width="100%" height="40%" fill="#D3D3D3"/>
            
            <!-- Main building -->
            <rect x="20" y="70" width="240" height="90" fill="url(#building)" stroke="#DDD" stroke-width="1" filter="url(#shadow)"/>
            
            <!-- Roof -->
            <polygon points="15,70 140,50 265,70" fill="#8B4513"/>
            
            <!-- Windows -->
            <rect x="35" y="85" width="60" height="50" fill="#E6F3FF" stroke="#C0C0C0" stroke-width="1" rx="3"/>
            <rect x="185" y="85" width="60" height="50" fill="#E6F3FF" stroke="#C0C0C0" stroke-width="1" rx="3"/>
            
            <!-- Window frames -->
            <line x1="65" y1="85" x2="65" y2="135" stroke="#B0B0B0" stroke-width="1"/>
            <line x1="35" y1="110" x2="95" y2="110" stroke="#B0B0B0" stroke-width="1"/>
            <line x1="215" y1="85" x2="215" y2="135" stroke="#B0B0B0" stroke-width="1"/>
            <line x1="185" y1="110" x2="245" y2="110" stroke="#B0B0B0" stroke-width="1"/>
            
            <!-- Door -->
            <rect x="125" y="115" width="30" height="45" fill="#8B4513" stroke="#654321" stroke-width="1" rx="2"/>
            <circle cx="148" cy="137" r="1.5" fill="#FFD700"/>
            
            <!-- AURALO sign -->
            <rect x="105" y="55" width="70" height="20" fill="#FFFFFF" stroke="#2196F3" stroke-width="2" rx="4" filter="url(#shadow)"/>
            <text x="140" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#2196F3">AURALO</text>
            
            <!-- Awning -->
            <rect x="30" y="75" width="220" height="12" fill="#2E8B57" stroke="#1F5F3F" stroke-width="1" rx="6"/>
            
            <!-- Window displays -->
            <ellipse cx="65" cy="105" rx="12" ry="15" fill="#DEB887" opacity="0.7"/>
            <ellipse cx="65" cy="120" rx="10" ry="12" fill="#F5DEB3" opacity="0.7"/>
            <ellipse cx="215" cy="105" rx="12" ry="15" fill="#DEB887" opacity="0.7"/>
            <ellipse cx="215" cy="120" rx="10" ry="12" fill="#F5DEB3" opacity="0.7"/>
            
            <!-- Plants -->
            <rect x="10" y="145" width="15" height="10" fill="#8B4513" rx="2"/>
            <ellipse cx="17.5" cy="145" rx="8" ry="5" fill="#228B22"/>
            <rect x="255" y="145" width="15" height="10" fill="#8B4513" rx="2"/>
            <ellipse cx="262.5" cy="145" rx="8" ry="5" fill="#228B22"/>
            
            <!-- Location text -->
            <text x="140" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="600" fill="#666">East Hampton • The Hamptons, NY</text>
            
            <!-- Open sign -->
            <rect x="130" y="95" width="20" height="6" fill="#FF6B6B" opacity="0.8" rx="3"/>
            <text x="140" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="4" fill="#FFF">OPEN</text>
            
            <!-- Window reflections -->
            <rect x="38" y="88" width="15" height="20" fill="#FFFFFF" opacity="0.3" rx="2"/>
            <rect x="188" y="88" width="15" height="20" fill="#FFFFFF" opacity="0.3" rx="2"/>
        </svg>`;
        
        // Convert to optimized JPEG
        const buffer = await sharp(Buffer.from(svg))
            .jpeg({ quality: 90, progressive: true })
            .resize(280, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .toBuffer();
        
        // Save as optimized version
        fs.writeFileSync('/Users/nelsonchan/vercel-deployment/images/hamptons-store_optimized.jpg', buffer);
        
        console.log('✅ Small optimized storefront created!');
        console.log(`📊 Size: ${buffer.length} bytes`);
        console.log('📁 Saved: images/hamptons-store_optimized.jpg');
        
        // Also create a backup with .jpeg extension in case there's an extension issue
        fs.writeFileSync('/Users/nelsonchan/vercel-deployment/images/hamptons-store-small.jpg', buffer);
        console.log('📁 Backup saved: images/hamptons-store-small.jpg');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error creating storefront image:', error);
        return false;
    }
}

createOptimizedStorefront().catch(console.error);