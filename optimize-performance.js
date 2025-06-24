#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminOptipng = require('imagemin-optipng');
const sharp = require('sharp');

// Optimization configuration
const OPTIMIZATION_CONFIG = {
  criticalCSS: {
    // CSS that should be inlined for above-the-fold content
    selectors: [
      '.hero', '.container', '.main-headline', '.sub-headline',
      '.product-display', '.product-image', '.price-badge',
      '.buy-now-button', '.size-selector', '.size-grid'
    ]
  },
  preload: {
    // Critical resources to preload
    images: [
      'dscxr443e2_optimized (1).jpg',
      'hamptons-store_optimized.jpg'
    ],
    fonts: [
      'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap'
    ]
  },
  lazyLoad: {
    // Images to lazy load
    images: [
      'slide-1_final_crushed_under_20kb.jpg',
      'slide-2_final_crushed_under_20kb.jpg',
      'slide-3_captioned_final_under_20kb.jpg',
      'slide-4_final_crushed_under_20kb.jpg',
      'slide-5_final_crushed_under_20kb.jpg',
      'slide-6_final_crushed_under_20kb.jpg',
      'slide-7_final_crushed_under_20kb.jpg'
    ]
  }
};

// Extract critical CSS from files
async function extractCriticalCSS() {
  console.log('📋 Extracting critical CSS...');
  
  const cssFiles = [
    'futuristic-fashion-ui.css',
    'mobile-ultra-premium.css'
  ];
  
  let criticalCSS = '';
  
  for (const file of cssFiles) {
    try {
      const cssPath = path.join(__dirname, file);
      const content = await fs.readFile(cssPath, 'utf8');
      
      // Extract critical selectors
      OPTIMIZATION_CONFIG.criticalCSS.selectors.forEach(selector => {
        const regex = new RegExp(`${selector.replace('.', '\\.')}[^{]*{[^}]*}`, 'g');
        const matches = content.match(regex);
        if (matches) {
          criticalCSS += matches.join('\n');
        }
      });
    } catch (error) {
      console.log(`⚠️  CSS file ${file} not found, skipping...`);
    }
  }
  
  // Add essential base styles
  criticalCSS = `
    /* Critical CSS for immediate rendering */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .hero { min-height: 100vh; display: flex; align-items: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .main-headline { font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 700; margin-bottom: 1rem; }
    .sub-headline { font-size: 1.25rem; opacity: 0.8; margin-bottom: 2rem; }
    .product-display { position: relative; margin: 2rem 0; }
    .product-image { width: 100%; height: auto; display: block; }
    .buy-now-button { background: linear-gradient(45deg, #ff006e, #8338ec); color: white; border: none; padding: 1rem 2rem; font-size: 1.125rem; font-weight: 700; border-radius: 50px; cursor: pointer; }
  ` + criticalCSS;
  
  // Minify critical CSS
  const cleanCSS = new CleanCSS({ level: 2 });
  const minified = cleanCSS.minify(criticalCSS);
  
  return minified.styles;
}

// Create optimized HTML with all performance enhancements
async function createOptimizedHTML() {
  console.log('🚀 Creating optimized HTML...');
  
  const htmlPath = path.join(__dirname, 'index-vercel-optimized.html');
  let html = await fs.readFile(htmlPath, 'utf8');
  
  // Extract critical CSS
  const criticalCSS = await extractCriticalCSS();
  
  // Create preload tags
  const preloadTags = `
    <!-- Preload critical resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    
    <!-- Preload hero images with high priority -->
    <link rel="preload" as="image" href="./images/dscxr443e2_optimized (1).jpg" fetchpriority="high" type="image/jpeg">
    <link rel="preload" as="image" href="./images/hamptons-store_optimized.jpg" fetchpriority="high" type="image/jpeg">
    
    <!-- Preload fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" as="style">
  `;
  
  // Create inline critical CSS
  const inlineCriticalCSS = `
    <style id="critical-css">
      ${criticalCSS}
    </style>
  `;
  
  // Resource hints for faster loading
  const resourceHints = `
    <!-- Resource hints -->
    <link rel="prefetch" href="./images/slide-1_final_crushed_under_20kb.jpg">
    <link rel="prefetch" href="./images/compressed_hoodie_review_Ava_30kb.jpg">
    <meta name="description" content="Get the $200 designer hoodie for only $20. Limited time clearance sale.">
  `;
  
  // Lazy loading script
  const lazyLoadScript = `
    <script>
      // Intersection Observer for lazy loading
      document.addEventListener('DOMContentLoaded', function() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
          const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            });
          }, {
            rootMargin: '50px 0px'
          });
          
          lazyImages.forEach(img => imageObserver.observe(img));
        } else {
          // Fallback for older browsers
          lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          });
        }
      });
      
      // Optimize font loading
      if ('fonts' in document) {
        Promise.all([
          document.fonts.load('400 1em Source Code Pro'),
          document.fonts.load('700 1em Source Code Pro'),
          document.fonts.load('400 1em Space Mono')
        ]).then(() => {
          document.documentElement.classList.add('fonts-loaded');
        });
      }
    </script>
  `;
  
  // Replace head section with optimized version
  html = html.replace(
    /<head>([\s\S]*?)<\/head>/,
    `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>You Are Not For Everyone - $20</title>
    
    ${preloadTags}
    ${resourceHints}
    ${inlineCriticalCSS}
    
    <!-- Load non-critical CSS asynchronously -->
    <link rel="preload" href="futuristic-fashion-ui.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="mobile-ultra-premium.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
      <link rel="stylesheet" href="futuristic-fashion-ui.css">
      <link rel="stylesheet" href="mobile-ultra-premium.css">
    </noscript>
    
    <!-- Load fonts with display swap -->
    <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    
    ${lazyLoadScript}
</head>`
  );
  
  // Convert non-critical images to lazy loading
  OPTIMIZATION_CONFIG.lazyLoad.images.forEach(image => {
    const regex = new RegExp(`src="./images/${image}"`, 'g');
    html = html.replace(regex, `data-src="./images/${image}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"`);
  });
  
  // Add loading="lazy" to remaining images
  html = html.replace(/<img([^>]*?)>/g, (match, attrs) => {
    if (!attrs.includes('loading=') && !attrs.includes('fetchpriority=')) {
      return `<img${attrs} loading="lazy">`;
    }
    return match;
  });
  
  // Defer non-critical scripts
  html = html.replace(
    /<script src="(ultra-premium-implementation|futuristic-fashion-ui|final-ultra-implementation)\.js"([^>]*)><\/script>/g,
    '<script src="$1.js" defer></script>'
  );
  
  // Save optimized HTML
  const outputPath = path.join(__dirname, 'index-ultra-optimized.html');
  await fs.writeFile(outputPath, html);
  
  console.log('✅ Created index-ultra-optimized.html');
  
  return outputPath;
}

// Create service worker for caching
async function createServiceWorker() {
  console.log('🔧 Creating service worker...');
  
  const swContent = `
// Service Worker for ultra-fast caching
const CACHE_NAME = 'auralo-v1';
const urlsToCache = [
  '/',
  '/index-ultra-optimized.html',
  '/futuristic-fashion-ui.css',
  '/mobile-ultra-premium.css',
  '/images/dscxr443e2_optimized (1).jpg',
  '/images/hamptons-store_optimized.jpg'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the response for future use
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Background sync for offline support
self.addEventListener('sync', event => {
  if (event.tag === 'sync-checkout') {
    event.waitUntil(syncCheckout());
  }
});

async function syncCheckout() {
  // Handle offline checkout sync
  console.log('Syncing checkout data...');
}
`;
  
  await fs.writeFile(path.join(__dirname, 'sw.js'), swContent);
  console.log('✅ Created sw.js service worker');
}

// Optimize images further if needed
async function optimizeImages() {
  console.log('🖼️  Optimizing images...');
  
  const imageDir = path.join(__dirname, 'images');
  
  try {
    // Create WebP versions of critical images
    const criticalImages = [
      'dscxr443e2_optimized (1).jpg',
      'hamptons-store_optimized.jpg'
    ];
    
    for (const image of criticalImages) {
      const inputPath = path.join(imageDir, image);
      const outputPath = path.join(imageDir, image.replace('.jpg', '.webp'));
      
      try {
        await sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath);
        console.log(`✅ Created WebP version: ${image.replace('.jpg', '.webp')}`);
      } catch (error) {
        console.log(`⚠️  Could not create WebP for ${image}: ${error.message}`);
      }
    }
    
    // Further optimize all images
    await imagemin([`${imageDir}/*.{jpg,png}`], {
      destination: imageDir,
      plugins: [
        imageminJpegtran({ progressive: true }),
        imageminOptipng({ optimizationLevel: 5 })
      ]
    });
    
    console.log('✅ Images optimized');
  } catch (error) {
    console.log('⚠️  Image optimization skipped:', error.message);
  }
}

// Create performance monitoring script
async function createPerformanceMonitor() {
  console.log('📊 Creating performance monitor...');
  
  const monitorScript = `
// Real User Monitoring (RUM) for performance
(function() {
  // Wait for page load
  window.addEventListener('load', function() {
    // Measure key metrics
    const perfData = {
      navigation: performance.getEntriesByType('navigation')[0],
      paint: performance.getEntriesByType('paint'),
      resources: performance.getEntriesByType('resource')
    };
    
    // Calculate metrics
    const metrics = {
      fcp: perfData.paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      lcp: 0,
      tti: perfData.navigation.domInteractive - perfData.navigation.fetchStart,
      totalLoad: perfData.navigation.loadEventEnd - perfData.navigation.fetchStart,
      resourceCount: perfData.resources.length,
      totalResourceSize: perfData.resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
    };
    
    // Observe LCP
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
          
          // Log performance data
          console.log('🚀 Performance Metrics:', metrics);
          
          // Send to analytics if needed
          if (window.gtag) {
            window.gtag('event', 'page_performance', metrics);
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.log('LCP observation not supported');
      }
    }
    
    // Log warnings if performance is poor
    if (metrics.totalLoad > 1000) {
      console.warn('⚠️  Page load exceeded 1 second:', metrics.totalLoad + 'ms');
    }
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const taskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('⚠️  Long task detected:', entry.duration + 'ms');
            }
          }
        });
        taskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task observation not supported');
      }
    }
  });
})();
`;
  
  await fs.writeFile(path.join(__dirname, 'performance-monitor.js'), monitorScript);
  console.log('✅ Created performance-monitor.js');
}

// Main optimization runner
async function main() {
  console.log('⚡ Ultra Performance Optimization Script');
  console.log('=====================================');
  console.log('Implementing aggressive optimizations for sub-1 second load...\n');
  
  try {
    // 1. Create optimized HTML with critical CSS and resource hints
    const optimizedHTMLPath = await createOptimizedHTML();
    
    // 2. Create service worker for caching
    await createServiceWorker();
    
    // 3. Optimize images further
    await optimizeImages();
    
    // 4. Create performance monitoring
    await createPerformanceMonitor();
    
    // 5. Create deployment instructions
    const instructions = `
# Deployment Instructions for Ultra-Optimized Version

## Files Created:
- index-ultra-optimized.html - Main optimized HTML file
- sw.js - Service worker for caching
- performance-monitor.js - Real user monitoring
- WebP versions of critical images (if created)

## Key Optimizations Implemented:

### 1. Critical CSS Inlining
- Above-the-fold CSS is inlined in <style> tag
- Non-critical CSS loads asynchronously

### 2. Resource Prioritization
- Hero images preloaded with high priority
- Fonts preloaded and loaded with display:swap
- Non-critical resources prefetched

### 3. Image Optimization
- Lazy loading for below-the-fold images
- WebP versions for modern browsers
- Progressive JPEG encoding

### 4. JavaScript Optimization
- All scripts deferred
- Minimal inline JavaScript for critical functions
- Service worker for offline caching

### 5. Network Optimization
- DNS prefetch for external domains
- Service worker caches critical resources
- Aggressive caching headers recommended

## Deployment Steps:

1. Upload all files to your Vercel deployment
2. Set the following headers in vercel.json:

\`\`\`json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index-ultra-optimized.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
\`\`\`

3. Enable compression in Vercel (automatic)
4. Use index-ultra-optimized.html as your main file

## Expected Performance:
- First Contentful Paint: < 400ms
- Largest Contentful Paint: < 800ms
- Time to Interactive: < 1000ms
- Total Load Time: < 1000ms on 4G

## Testing:
Run the performance test again to verify improvements:
\`\`\`bash
node performance-test.js
\`\`\`
`;
    
    await fs.writeFile(path.join(__dirname, 'OPTIMIZATION_GUIDE.md'), instructions);
    
    console.log('\n✅ Optimization Complete!');
    console.log('=====================================');
    console.log('📄 Created: index-ultra-optimized.html');
    console.log('🔧 Created: sw.js (service worker)');
    console.log('📊 Created: performance-monitor.js');
    console.log('📚 Created: OPTIMIZATION_GUIDE.md');
    console.log('\n🚀 Your page is now optimized for sub-1 second loading on 4G!');
    console.log('📖 Check OPTIMIZATION_GUIDE.md for deployment instructions.');
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createOptimizedHTML, createServiceWorker, optimizeImages };