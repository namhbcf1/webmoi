// CSS Optimization Script
// This script helps optimize CSS for mobile performance

const fs = require('fs');
const path = require('path');

function extractInlineCSS(htmlFile) {
    const content = fs.readFileSync(htmlFile, 'utf8');
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
    
    if (styleMatch) {
        return styleMatch[1];
    }
    return null;
}

function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove whitespace around certain characters
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')
        // Remove trailing semicolons
        .replace(/;}/g, '}')
        // Remove leading/trailing whitespace
        .trim();
}

function optimizeCSSForMobile(css) {
    // Remove desktop-only properties that don't work well on mobile
    let optimized = css
        // Simplify complex gradients on mobile
        .replace(/backdrop-filter:\s*blur\([^)]+\)/g, 'backdrop-filter: none')
        // Reduce animation complexity
        .replace(/animation:\s*[^;]+ease-in-out[^;]*/g, 'animation: none')
        // Simplify box-shadows
        .replace(/box-shadow:\s*[^;]+rgba\([^)]+\)[^;]*/g, 'box-shadow: 0 2px 4px rgba(0,0,0,0.1)');
    
    return optimized;
}

function generateOptimizedCSS() {
    const htmlFile = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(htmlFile)) {
        console.log('❌ index.html not found!');
        return;
    }
    
    console.log('🎨 Extracting and optimizing CSS...');
    
    const css = extractInlineCSS(htmlFile);
    if (!css) {
        console.log('❌ No inline CSS found!');
        return;
    }
    
    console.log(`📊 Original CSS size: ${Math.round(css.length / 1024)} KB`);
    
    // Create minified version
    const minified = minifyCSS(css);
    console.log(`📊 Minified CSS size: ${Math.round(minified.length / 1024)} KB`);
    
    // Create mobile-optimized version
    const mobileOptimized = optimizeCSSForMobile(minified);
    console.log(`📊 Mobile-optimized CSS size: ${Math.round(mobileOptimized.length / 1024)} KB`);
    
    // Save optimized versions
    fs.writeFileSync('styles-minified.css', minified);
    fs.writeFileSync('styles-mobile.css', mobileOptimized);
    
    console.log('✅ CSS optimization complete!');
    console.log('📁 Generated files:');
    console.log('  - styles-minified.css (general minification)');
    console.log('  - styles-mobile.css (mobile-optimized)');
    
    // Calculate savings
    const savings = Math.round(((css.length - minified.length) / css.length) * 100);
    const mobileSavings = Math.round(((css.length - mobileOptimized.length) / css.length) * 100);
    
    console.log(`\n💾 Size reduction:`);
    console.log(`  - Minified: ${savings}% smaller`);
    console.log(`  - Mobile-optimized: ${mobileSavings}% smaller`);
    
    return {
        original: css,
        minified: minified,
        mobileOptimized: mobileOptimized
    };
}

// Critical CSS extraction for above-the-fold content
function generateCriticalCSS(css) {
    // Extract only the most critical styles for initial render
    const criticalSelectors = [
        'body', 'html', '*',
        '.container', '.header', '.logo',
        '.btn', '.card', '.title', '.subtitle',
        '.step-indicator', '.step', '.step-number',
        '.mobile-menu-btn', '.contact-links',
        '@media (max-width: 768px)',
        '@media (max-width: 480px)'
    ];
    
    const lines = css.split('\n');
    const criticalLines = [];
    let inCriticalBlock = false;
    let braceCount = 0;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Check if this line starts a critical selector
        const isCritical = criticalSelectors.some(selector => 
            trimmed.includes(selector) && (trimmed.includes('{') || trimmed.includes(','))
        );
        
        if (isCritical) {
            inCriticalBlock = true;
            braceCount = 0;
        }
        
        if (inCriticalBlock) {
            criticalLines.push(line);
            
            // Count braces to know when the block ends
            braceCount += (trimmed.match(/{/g) || []).length;
            braceCount -= (trimmed.match(/}/g) || []).length;
            
            if (braceCount <= 0 && trimmed.includes('}')) {
                inCriticalBlock = false;
            }
        }
    }
    
    return criticalLines.join('\n');
}

if (require.main === module) {
    const result = generateOptimizedCSS();
    
    if (result) {
        // Generate critical CSS
        const critical = generateCriticalCSS(result.original);
        const criticalMinified = minifyCSS(critical);
        
        fs.writeFileSync('styles-critical.css', criticalMinified);
        console.log(`📁 Critical CSS: ${Math.round(criticalMinified.length / 1024)} KB`);
        
        console.log('\n💡 Usage recommendations:');
        console.log('1. Inline styles-critical.css in <head> for fastest loading');
        console.log('2. Load styles-mobile.css asynchronously for mobile devices');
        console.log('3. Use styles-minified.css for desktop');
    }
}

module.exports = { generateOptimizedCSS, minifyCSS, optimizeCSSForMobile };
