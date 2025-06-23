const { chromium } = require('playwright');
const express = require('express');

(async () => {
  console.log('🔍 DEBUG HORIZONTAL SCROLL ISSUE');
  console.log('=================================\n');

  const app = express();
  app.use(express.static('.'));
  
  const server = app.listen(3002, () => {
    console.log('Debug server running...');
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002/index.html');
    await page.waitForLoadState('networkidle');

    // Find elements causing horizontal scroll
    const scrollCulprits = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const problems = [];
      const windowWidth = window.innerWidth;
      
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Check if element extends beyond viewport
        if (rect.right > windowWidth) {
          problems.push({
            index,
            tag: el.tagName,
            className: el.className,
            id: el.id,
            width: Math.round(rect.width),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            overflow: Math.round(rect.right - windowWidth),
            styles: {
              width: style.width,
              minWidth: style.minWidth,
              maxWidth: style.maxWidth,
              position: style.position,
              overflow: style.overflow,
              overflowX: style.overflowX
            }
          });
        }
      });
      
      // Sort by how much they overflow
      problems.sort((a, b) => b.overflow - a.overflow);
      
      return {
        windowWidth,
        bodyScrollWidth: document.body.scrollWidth,
        problems: problems.slice(0, 10) // Top 10 culprits
      };
    });

    console.log(`Window Width: ${scrollCulprits.windowWidth}px`);
    console.log(`Body Scroll Width: ${scrollCulprits.bodyScrollWidth}px`);
    console.log(`Horizontal Overflow: ${scrollCulprits.bodyScrollWidth - scrollCulprits.windowWidth}px\n`);

    console.log('🚨 TOP HORIZONTAL SCROLL CULPRITS:');
    console.log('==================================');
    
    scrollCulprits.problems.forEach((problem, i) => {
      console.log(`\n${i + 1}. ${problem.tag}${problem.className ? '.' + problem.className.split(' ')[0] : ''}${problem.id ? '#' + problem.id : ''}`);
      console.log(`   Width: ${problem.width}px | Right edge: ${problem.right}px | Overflow: +${problem.overflow}px`);
      console.log(`   CSS Width: ${problem.styles.width} | Min: ${problem.styles.minWidth} | Max: ${problem.styles.maxWidth}`);
      console.log(`   Position: ${problem.styles.position} | Overflow: ${problem.styles.overflowX}`);
    });

    // Check for common causes
    const commonIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for fixed widths
      const fixedWidthElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        const width = style.width;
        return width.includes('px') && parseInt(width) > 375;
      });
      
      if (fixedWidthElements.length > 0) {
        issues.push({
          type: 'Fixed Width Elements',
          count: fixedWidthElements.length,
          elements: fixedWidthElements.slice(0, 3).map(el => ({
            tag: el.tagName,
            className: el.className,
            width: window.getComputedStyle(el).width
          }))
        });
      }
      
      // Check for min-width issues
      const minWidthElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        const minWidth = style.minWidth;
        return minWidth.includes('px') && parseInt(minWidth) > 375;
      });
      
      if (minWidthElements.length > 0) {
        issues.push({
          type: 'Min-Width Elements',
          count: minWidthElements.length,
          elements: minWidthElements.slice(0, 3).map(el => ({
            tag: el.tagName,
            className: el.className,
            minWidth: window.getComputedStyle(el).minWidth
          }))
        });
      }
      
      // Check for overflow hidden missing
      const containers = Array.from(document.querySelectorAll('body, .container, section'));
      const overflowIssues = containers.filter(el => {
        const style = window.getComputedStyle(el);
        return style.overflowX !== 'hidden' && style.overflow !== 'hidden';
      });
      
      if (overflowIssues.length > 0) {
        issues.push({
          type: 'Missing Overflow Hidden',
          count: overflowIssues.length,
          elements: overflowIssues.map(el => ({
            tag: el.tagName,
            className: el.className,
            overflowX: window.getComputedStyle(el).overflowX
          }))
        });
      }
      
      return issues;
    });

    console.log('\n🔍 COMMON ISSUE ANALYSIS:');
    console.log('=========================');
    
    if (commonIssues.length === 0) {
      console.log('No common CSS issues detected.');
    } else {
      commonIssues.forEach(issue => {
        console.log(`\n📝 ${issue.type} (${issue.count} elements):`);
        issue.elements.forEach(el => {
          console.log(`   ${el.tag}.${el.className.split(' ')[0] || 'no-class'} - ${el.width || el.minWidth || el.overflowX}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
    server.close();
  }
})();