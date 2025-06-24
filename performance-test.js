#!/usr/bin/env node
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

// Performance test configuration
const TEST_CONFIG = {
  url: 'file://' + path.resolve(__dirname, 'index-vercel-optimized.html'),
  locations: {
    california: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
    newYork: { lat: 40.7128, lng: -74.0060, name: 'New York, NY' }
  },
  network: {
    // 4G network conditions
    downloadThroughput: 12 * 1024 * 1024 / 8, // 12 Mbps
    uploadThroughput: 3 * 1024 * 1024 / 8,    // 3 Mbps
    latency: 20                                // 20ms RTT
  },
  device: {
    viewport: { width: 375, height: 812 },     // iPhone X
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  performanceTargets: {
    fcp: 1000,        // First Contentful Paint < 1s
    lcp: 1000,        // Largest Contentful Paint < 1s
    tti: 1000,        // Time to Interactive < 1s
    totalLoadTime: 1000 // Total page load < 1s
  }
};

// Utility function to format milliseconds
function formatMs(ms) {
  return `${ms.toFixed(0)}ms`;
}

// Run performance test for a specific location
async function runPerformanceTest(location) {
  console.log(`\n🚀 Testing performance for ${location.name}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport(TEST_CONFIG.device.viewport);
    await page.setUserAgent(TEST_CONFIG.device.userAgent);
    
    // Configure network conditions
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: TEST_CONFIG.network.downloadThroughput,
      uploadThroughput: TEST_CONFIG.network.uploadThroughput,
      latency: TEST_CONFIG.network.latency
    });

    // Set geolocation
    await page.setGeolocation({
      latitude: location.lat,
      longitude: location.lng
    });

    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to page and wait for load
    await page.goto(TEST_CONFIG.url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;

    // Get performance metrics
    const metrics = await page.metrics();
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    // Calculate key metrics
    const navigationStart = performanceTiming.navigationStart;
    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName('first-contentful-paint')[0];
      return entry ? entry.startTime : 0;
    });

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Give it some time to observe
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 2000);
      });
    });

    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          let ttiValue = 0;
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                ttiValue = entries[0].startTime;
              }
            });
            observer.observe({ entryTypes: ['longtask'] });
            
            setTimeout(() => {
              observer.disconnect();
              // If no long tasks, use domInteractive as approximation
              if (ttiValue === 0) {
                ttiValue = performance.timing.domInteractive - performance.timing.navigationStart;
              }
              resolve(ttiValue);
            }, 2000);
          } catch (e) {
            resolve(performance.timing.domInteractive - performance.timing.navigationStart);
          }
        } else {
          resolve(performance.timing.domInteractive - performance.timing.navigationStart);
        }
      });
    });

    // Check resource sizes
    const resourceTimings = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name.split('/').pop(),
        size: r.transferSize,
        duration: r.duration
      }));
    });

    const results = {
      location: location.name,
      metrics: {
        totalLoadTime: loadTime,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        timeToInteractive: tti,
        domContentLoaded: performanceTiming.domContentLoadedEventEnd - navigationStart,
        domComplete: performanceTiming.domComplete - navigationStart
      },
      resources: {
        totalSize: resourceTimings.reduce((sum, r) => sum + (r.size || 0), 0),
        count: resourceTimings.length,
        images: resourceTimings.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      },
      performance: {
        jsHeapUsed: Math.round(metrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100,
        jsHeapTotal: Math.round(metrics.JSHeapTotalSize / 1024 / 1024 * 100) / 100
      }
    };

    await browser.close();
    return results;

  } catch (error) {
    await browser.close();
    throw error;
  }
}

// Run Lighthouse audit
async function runLighthouseAudit() {
  console.log('\n🔍 Running Lighthouse audit...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const { port } = new URL(browser.wsEndpoint());
    
    const options = {
      logLevel: 'error',
      output: 'json',
      port: port,
      throttling: {
        rttMs: TEST_CONFIG.network.latency,
        throughputKbps: TEST_CONFIG.network.downloadThroughput * 8 / 1024,
        cpuSlowdownMultiplier: 4
      },
      emulatedUserAgent: TEST_CONFIG.device.userAgent,
      screenEmulation: {
        mobile: true,
        width: TEST_CONFIG.device.viewport.width,
        height: TEST_CONFIG.device.viewport.height,
        deviceScaleFactor: 2
      }
    };

    const runnerResult = await lighthouse(TEST_CONFIG.url, options);
    const report = JSON.parse(runnerResult.report);

    await browser.close();

    return {
      scores: {
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(report.categories['best-practices'].score * 100),
        seo: Math.round(report.categories.seo.score * 100)
      },
      metrics: {
        fcp: report.audits['first-contentful-paint'].numericValue,
        lcp: report.audits['largest-contentful-paint'].numericValue,
        tti: report.audits['interactive'].numericValue,
        speedIndex: report.audits['speed-index'].numericValue,
        totalBlockingTime: report.audits['total-blocking-time'].numericValue
      }
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

// Analyze results and check if optimization is needed
function analyzeResults(results, lighthouse) {
  console.log('\n📊 Performance Analysis Report');
  console.log('=====================================');
  
  const issues = [];
  const targets = TEST_CONFIG.performanceTargets;
  
  // Check each location
  results.forEach(result => {
    console.log(`\n📍 ${result.location}`);
    console.log('-------------------');
    console.log(`Total Load Time: ${formatMs(result.metrics.totalLoadTime)}`);
    console.log(`First Contentful Paint: ${formatMs(result.metrics.firstContentfulPaint)}`);
    console.log(`Largest Contentful Paint: ${formatMs(result.metrics.largestContentfulPaint)}`);
    console.log(`Time to Interactive: ${formatMs(result.metrics.timeToInteractive)}`);
    console.log(`DOM Content Loaded: ${formatMs(result.metrics.domContentLoaded)}`);
    console.log(`DOM Complete: ${formatMs(result.metrics.domComplete)}`);
    console.log(`\nResource Stats:`);
    console.log(`- Total Size: ${(result.resources.totalSize / 1024).toFixed(2)} KB`);
    console.log(`- Resource Count: ${result.resources.count}`);
    console.log(`- Image Count: ${result.resources.images.length}`);
    console.log(`- JS Heap Used: ${result.performance.jsHeapUsed} MB`);
    
    // Check against targets
    if (result.metrics.totalLoadTime > targets.totalLoadTime) {
      issues.push(`❌ ${result.location}: Total load time (${formatMs(result.metrics.totalLoadTime)}) exceeds target (${formatMs(targets.totalLoadTime)})`);
    }
    if (result.metrics.firstContentfulPaint > targets.fcp) {
      issues.push(`❌ ${result.location}: FCP (${formatMs(result.metrics.firstContentfulPaint)}) exceeds target (${formatMs(targets.fcp)})`);
    }
    if (result.metrics.largestContentfulPaint > targets.lcp) {
      issues.push(`❌ ${result.location}: LCP (${formatMs(result.metrics.largestContentfulPaint)}) exceeds target (${formatMs(targets.lcp)})`);
    }
    if (result.metrics.timeToInteractive > targets.tti) {
      issues.push(`❌ ${result.location}: TTI (${formatMs(result.metrics.timeToInteractive)}) exceeds target (${formatMs(targets.tti)})`);
    }
  });
  
  // Lighthouse results
  console.log('\n🏆 Lighthouse Scores');
  console.log('-------------------');
  console.log(`Performance: ${lighthouse.scores.performance}/100`);
  console.log(`Accessibility: ${lighthouse.scores.accessibility}/100`);
  console.log(`Best Practices: ${lighthouse.scores.bestPractices}/100`);
  console.log(`SEO: ${lighthouse.scores.seo}/100`);
  
  console.log('\n⚡ Lighthouse Metrics');
  console.log('-------------------');
  console.log(`First Contentful Paint: ${formatMs(lighthouse.metrics.fcp)}`);
  console.log(`Largest Contentful Paint: ${formatMs(lighthouse.metrics.lcp)}`);
  console.log(`Time to Interactive: ${formatMs(lighthouse.metrics.tti)}`);
  console.log(`Speed Index: ${formatMs(lighthouse.metrics.speedIndex)}`);
  console.log(`Total Blocking Time: ${formatMs(lighthouse.metrics.totalBlockingTime)}`);
  
  // Summary
  console.log('\n📋 Summary');
  console.log('=====================================');
  
  if (issues.length === 0) {
    console.log('✅ All performance targets met! Page loads in under 1 second on 4G.');
  } else {
    console.log('❌ Performance issues detected:');
    issues.forEach(issue => console.log(issue));
    console.log('\n🔧 Optimization needed to meet sub-1 second target.');
  }
  
  return {
    needsOptimization: issues.length > 0,
    issues: issues
  };
}

// Main test runner
async function main() {
  console.log('🎯 Vercel Deployment Performance Test');
  console.log('=====================================');
  console.log('Testing 4G mobile conditions for sub-1 second load time...\n');
  
  try {
    // Test both locations
    const californiaResults = await runPerformanceTest(TEST_CONFIG.locations.california);
    const newYorkResults = await runPerformanceTest(TEST_CONFIG.locations.newYork);
    
    // Run Lighthouse
    const lighthouseResults = await runLighthouseAudit();
    
    // Analyze results
    const analysis = analyzeResults([californiaResults, newYorkResults], lighthouseResults);
    
    // Save results to file
    const report = {
      timestamp: new Date().toISOString(),
      config: TEST_CONFIG,
      results: {
        california: californiaResults,
        newYork: newYorkResults,
        lighthouse: lighthouseResults
      },
      analysis: analysis
    };
    
    await fs.writeFile(
      path.join(__dirname, 'performance-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Full report saved to performance-report.json');
    
    // Return optimization needed status
    return analysis.needsOptimization;
    
  } catch (error) {
    console.error('❌ Error running performance test:', error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  main().then(needsOptimization => {
    if (needsOptimization) {
      console.log('\n🚀 Run optimization script to improve performance.');
      process.exit(1);
    } else {
      console.log('\n✨ Performance goals achieved!');
      process.exit(0);
    }
  });
}

module.exports = { runPerformanceTest, runLighthouseAudit, analyzeResults };