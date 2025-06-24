const sharp = require('sharp');
const fs = require('fs');

async function createProfessionalStorefront() {
    console.log('🏪 CREATING PROFESSIONAL STOREFRONT IMAGE');
    console.log('========================================\n');
    
    try {
        // Create a high-quality, realistic storefront image
        const width = 400;
        const height = 300;
        
        // Create the base image with a gradient background (sky)
        const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#E0F6FF;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#F8F8F8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#E8E8E8;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#F0F8FF;stop-opacity:0.9" />
                    <stop offset="100%" style="stop-color:#E6F3FF;stop-opacity:0.7" />
                </linearGradient>
            </defs>
            
            <!-- Sky background -->
            <rect width="100%" height="60%" fill="url(#skyGradient)" />
            
            <!-- Ground -->
            <rect y="60%" width="100%" height="40%" fill="#D3D3D3" />
            
            <!-- Building structure -->
            <rect x="30" y="120" width="340" height="150" fill="url(#buildingGradient)" stroke="#C0C0C0" stroke-width="2" />
            
            <!-- Storefront windows -->
            <rect x="50" y="140" width="120" height="100" fill="url(#windowGradient)" stroke="#B0B0B0" stroke-width="1" rx="4" />
            <rect x="230" y="140" width="120" height="100" fill="url(#windowGradient)" stroke="#B0B0B0" stroke-width="1" rx="4" />
            
            <!-- Entry door -->
            <rect x="180" y="170" width="40" height="70" fill="#8B4513" stroke="#654321" stroke-width="2" rx="2" />
            <circle cx="210" cy="205" r="2" fill="#FFD700" />
            
            <!-- Awning -->
            <rect x="40" y="130" width="320" height="20" fill="#2E8B57" stroke="#1F5F3F" stroke-width="1" rx="10" />
            
            <!-- AURALO Sign -->
            <rect x="120" y="100" width="160" height="40" fill="#FFFFFF" stroke="#2196F3" stroke-width="3" rx="8" />
            <text x="200" y="125" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#2196F3">AURALO</text>
            
            <!-- Window displays (hoodie silhouettes) -->
            <rect x="70" y="160" width="30" height="40" fill="#DEB887" rx="15" />
            <rect x="110" y="160" width="30" height="40" fill="#F5DEB3" rx="15" />
            <rect x="250" y="160" width="30" height="40" fill="#DEB887" rx="15" />
            <rect x="290" y="160" width="30" height="40" fill="#F5DEB3" rx="15" />
            
            <!-- Decorative plants -->
            <circle cx="60" cy="250" r="15" fill="#228B22" />
            <circle cx="340" cy="250" r="15" fill="#228B22" />
            
            <!-- Shadow under building -->
            <ellipse cx="200" cy="280" rx="150" ry="8" fill="#000000" opacity="0.2" />
            
            <!-- Small details -->
            <text x="200" y="90" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666666">East Hampton • The Hamptons</text>
            
            <!-- Window frame details -->
            <line x1="110" y1="140" x2="110" y2="240" stroke="#B0B0B0" stroke-width="1" />
            <line x1="50" y1="190" x2="170" y2="190" stroke="#B0B0B0" stroke-width="1" />
            <line x1="290" y1="140" x2="290" y2="240" stroke="#B0B0B0" stroke-width="1" />
            <line x1="230" y1="190" x2="350" y2="190" stroke="#B0B0B0" stroke-width="1" />
        </svg>`;
        
        // Convert SVG to high-quality image
        const buffer = await sharp(Buffer.from(svg))
            .png({ quality: 95, progressive: true })
            .toBuffer();
        
        // Save the optimized storefront image
        fs.writeFileSync('/Users/nelsonchan/vercel-deployment/images/hamptons-store_optimized.jpg', buffer);
        
        console.log('✅ Professional storefront image created successfully!');
        console.log('📁 Saved as: hamptons-store_optimized.jpg');
        console.log(`📏 Size: ${buffer.length} bytes`);
        
        return buffer;
        
    } catch (error) {
        console.error('❌ Error creating storefront image:', error);
        throw error;
    }
}

createProfessionalStorefront().catch(console.error);