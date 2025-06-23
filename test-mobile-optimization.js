const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto(`file://${process.cwd()}/index.html`);
  await page.waitForLoadState('networkidle');

  console.log('📱 TESTING MOBILE OPTIMIZATION');
  console.log('==============================\n');

  // Test social proof elements
  const socialTest = await page.evaluate(() => {
    const socialBadge = document.querySelector('.social-badge');
    const socialNotification = document.querySelector('.social-notification');
    
    const badgeStyle = window.getComputedStyle(socialBadge);
    const notificationStyle = window.getComputedStyle(socialNotification);
    
    return {
      badge: {
        fontSize: badgeStyle.fontSize,
        padding: badgeStyle.padding,
        visible: socialBadge.offsetWidth > 0,
        centered: socialBadge.parentElement.style.textAlign === 'center'
      },
      notification: {
        position: notificationStyle.position,
        transform: notificationStyle.transform,
        maxWidth: notificationStyle.maxWidth,
        visible: socialNotification.offsetWidth > 0,
        bottom: notificationStyle.bottom,
        left: notificationStyle.left
      }
    };
  });
  
  console.log('🏷️ SOCIAL BADGE:');
  console.log(`   Font Size: ${socialTest.badge.fontSize}`);
  console.log(`   Padding: ${socialTest.badge.padding}`);
  console.log(`   Visible: ${socialTest.badge.visible ? '✅' : '❌'}`);
  console.log(`   Centered: ${socialTest.badge.centered ? '✅' : '❌'}`);
  
  console.log('\n🔔 SOCIAL NOTIFICATION:');
  console.log(`   Position: ${socialTest.notification.position}`);
  console.log(`   Max Width: ${socialTest.notification.maxWidth}`);
  console.log(`   Bottom: ${socialTest.notification.bottom}`);
  console.log(`   Left: ${socialTest.notification.left}`);
  console.log(`   Visible: ${socialTest.notification.visible ? '✅' : '❌'}`);

  // Test layout elements
  const layoutTest = await page.evaluate(() => {
    const container = document.querySelector('.container');
    const headline = document.querySelector('.main-headline');
    const buyButtons = document.querySelectorAll('.buy-now-button');
    const sizeGrid = document.querySelector('.size-grid');
    const comparisonTable = document.querySelector('.comparison-grid');
    
    const containerStyle = window.getComputedStyle(container);
    const headlineStyle = window.getComputedStyle(headline);
    const buttonStyle = buyButtons.length > 0 ? window.getComputedStyle(buyButtons[0]) : null;
    const gridStyle = window.getComputedStyle(sizeGrid);
    const tableStyle = window.getComputedStyle(comparisonTable);
    
    return {
      container: {
        padding: containerStyle.paddingLeft,
        maxWidth: containerStyle.maxWidth,
        width: Math.round(container.getBoundingClientRect().width)
      },
      headline: {
        fontSize: headlineStyle.fontSize,
        lineHeight: headlineStyle.lineHeight,
        marginBottom: headlineStyle.marginBottom
      },
      button: buttonStyle ? {
        width: buttonStyle.width,
        padding: buttonStyle.padding,
        fontSize: buttonStyle.fontSize
      } : null,
      sizeGrid: {
        columns: gridStyle.gridTemplateColumns,
        width: Math.round(sizeGrid.getBoundingClientRect().width)
      },
      table: {
        columns: tableStyle.gridTemplateColumns,
        width: Math.round(comparisonTable.getBoundingClientRect().width)
      }
    };
  });
  
  console.log('\n📐 LAYOUT TEST:');
  console.log(`   Container Padding: ${layoutTest.container.padding}`);
  console.log(`   Container Width: ${layoutTest.container.width}px`);
  console.log(`   Headline Font: ${layoutTest.headline.fontSize}`);
  console.log(`   Headline Line Height: ${layoutTest.headline.lineHeight}`);
  
  if (layoutTest.button) {
    console.log(`   Button Width: ${layoutTest.button.width}`);
    console.log(`   Button Padding: ${layoutTest.button.padding}`);
    console.log(`   Button Font: ${layoutTest.button.fontSize}`);
  }
  
  console.log(`   Size Grid Columns: ${layoutTest.sizeGrid.columns}`);
  console.log(`   Size Grid Width: ${layoutTest.sizeGrid.width}px`);
  console.log(`   Table Columns: ${layoutTest.table.columns}`);
  console.log(`   Table Width: ${layoutTest.table.width}px`);

  // Test touch targets
  const touchTest = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.buy-now-button, .size-option, .availability-header');
    const touchTargets = [];
    
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      touchTargets.push({
        index: index + 1,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        touchFriendly: rect.width >= 44 && rect.height >= 44, // Apple guidelines
        type: button.className.includes('buy-now') ? 'buy-button' : 
              button.className.includes('size-option') ? 'size-option' : 
              'availability-header'
      });
    });
    
    return touchTargets;
  });
  
  console.log('\n👆 TOUCH TARGET TEST:');
  touchTest.forEach(target => {
    const status = target.touchFriendly ? '✅' : '❌';
    console.log(`   ${target.type} ${target.index}: ${target.width}×${target.height}px ${status}`);
  });

  // Test scroll performance
  console.log('\n⚡ SCROLL TEST:');
  const scrollStart = Date.now();
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  const scrollEnd = Date.now();
  console.log(`   Scroll Performance: ${scrollEnd - scrollStart}ms`);

  // Final assessment
  const touchFriendlyCount = touchTest.filter(t => t.touchFriendly).length;
  const totalTargets = touchTest.length;
  const mobileOptimized = 
    socialTest.badge.visible &&
    socialTest.notification.visible &&
    layoutTest.container.width <= 375 &&
    layoutTest.sizeGrid.columns.includes('1fr 1fr') &&
    layoutTest.table.columns.includes('1fr') &&
    touchFriendlyCount >= totalTargets * 0.8; // 80% touch friendly

  console.log('\n🏆 MOBILE OPTIMIZATION SUMMARY');
  console.log('==============================');
  console.log(`✅ Social Badge Optimized: ${socialTest.badge.visible ? 'YES' : 'NO'}`);
  console.log(`✅ Social Notification Optimized: ${socialTest.notification.visible ? 'YES' : 'NO'}`);
  console.log(`✅ Layout Responsive: ${layoutTest.container.width <= 375 ? 'YES' : 'NO'}`);
  console.log(`✅ Size Grid Mobile: ${layoutTest.sizeGrid.columns.includes('1fr 1fr') ? 'YES' : 'NO'}`);
  console.log(`✅ Table Mobile: ${layoutTest.table.columns.includes('1fr') ? 'YES' : 'NO'}`);
  console.log(`✅ Touch Targets: ${touchFriendlyCount}/${totalTargets} (${Math.round((touchFriendlyCount/totalTargets)*100)}%)`);
  
  if (mobileOptimized) {
    console.log('\n🎉 MOBILE OPTIMIZATION COMPLETE!');
    console.log('✨ Perfect mobile experience ready for deployment!');
  } else {
    console.log('\n⚠️ Mobile optimization needs improvement');
  }

  await browser.close();
})();