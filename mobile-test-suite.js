// Mobile Testing & Validation Suite
// This script validates mobile optimizations and performance improvements

const fs = require('fs');
const path = require('path');

class MobileTestSuite {
    constructor() {
        this.results = {
            viewport: { passed: false, issues: [] },
            performance: { passed: false, issues: [] },
            accessibility: { passed: false, issues: [] },
            responsive: { passed: false, issues: [] },
            images: { passed: false, issues: [] },
            javascript: { passed: false, issues: [] }
        };
    }

    // Test 1: Viewport Configuration
    testViewport() {
        console.log('🔍 Testing viewport configuration...');
        
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for proper viewport meta tag
        const viewportMatch = htmlContent.match(/<meta name="viewport" content="([^"]+)"/);
        
        if (!viewportMatch) {
            this.results.viewport.issues.push('Missing viewport meta tag');
            return;
        }
        
        const viewport = viewportMatch[1];
        
        // Check for mobile-friendly viewport settings
        if (viewport.includes('width=device-width')) {
            this.results.viewport.passed = true;
            console.log('✅ Viewport: width=device-width found');
        } else {
            this.results.viewport.issues.push('Viewport should include width=device-width');
        }
        
        if (viewport.includes('initial-scale=1.0')) {
            console.log('✅ Viewport: initial-scale=1.0 found');
        } else {
            this.results.viewport.issues.push('Viewport should include initial-scale=1.0');
        }
        
        if (viewport.includes('user-scalable=yes')) {
            console.log('✅ Viewport: user-scalable=yes found');
        } else {
            this.results.viewport.issues.push('Consider allowing user scaling');
        }
    }

    // Test 2: Performance Optimizations
    testPerformance() {
        console.log('🔍 Testing performance optimizations...');
        
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for async/defer on scripts
        const scriptTags = htmlContent.match(/<script[^>]*src[^>]*>/g) || [];
        let asyncScripts = 0;
        
        scriptTags.forEach(script => {
            if (script.includes('defer') || script.includes('async')) {
                asyncScripts++;
            }
        });
        
        if (asyncScripts > 0) {
            console.log(`✅ Performance: ${asyncScripts} scripts use async/defer`);
            this.results.performance.passed = true;
        } else {
            this.results.performance.issues.push('No scripts use async/defer loading');
        }
        
        // Check for font preconnect
        if (htmlContent.includes('rel="preconnect"')) {
            console.log('✅ Performance: Font preconnect found');
        } else {
            this.results.performance.issues.push('Missing font preconnect for better performance');
        }
        
        // Check for lazy loading implementation
        if (htmlContent.includes('data-src') || htmlContent.includes('lazy')) {
            console.log('✅ Performance: Lazy loading implemented');
        } else {
            this.results.performance.issues.push('No lazy loading found');
        }
    }

    // Test 3: Mobile Accessibility
    testAccessibility() {
        console.log('🔍 Testing mobile accessibility...');
        
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for touch target sizes in CSS
        const touchTargetRegex = /min-height:\s*(\d+)px/g;
        const touchTargets = [];
        let match;
        
        while ((match = touchTargetRegex.exec(htmlContent)) !== null) {
            touchTargets.push(parseInt(match[1]));
        }
        
        const adequateTouchTargets = touchTargets.filter(size => size >= 44);
        
        if (adequateTouchTargets.length > 0) {
            console.log(`✅ Accessibility: ${adequateTouchTargets.length} adequate touch targets found`);
            this.results.accessibility.passed = true;
        } else {
            this.results.accessibility.issues.push('No adequate touch targets (44px+) found');
        }
        
        // Check for aria labels
        if (htmlContent.includes('aria-label')) {
            console.log('✅ Accessibility: ARIA labels found');
        } else {
            this.results.accessibility.issues.push('Consider adding ARIA labels for better accessibility');
        }
        
        // Check for focus states
        if (htmlContent.includes(':focus')) {
            console.log('✅ Accessibility: Focus states defined');
        } else {
            this.results.accessibility.issues.push('Missing focus states for keyboard navigation');
        }
    }

    // Test 4: Responsive Design
    testResponsiveDesign() {
        console.log('🔍 Testing responsive design...');
        
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // Check for mobile media queries
        const mobileQueries = htmlContent.match(/@media[^{]*\(max-width:\s*768px\)/g);
        const smallMobileQueries = htmlContent.match(/@media[^{]*\(max-width:\s*480px\)/g);
        
        if (mobileQueries && mobileQueries.length > 0) {
            console.log(`✅ Responsive: ${mobileQueries.length} mobile media queries found`);
            this.results.responsive.passed = true;
        } else {
            this.results.responsive.issues.push('No mobile media queries found');
        }
        
        if (smallMobileQueries && smallMobileQueries.length > 0) {
            console.log(`✅ Responsive: ${smallMobileQueries.length} small mobile media queries found`);
        }
        
        // Check for flexible layouts
        if (htmlContent.includes('grid-template-columns') && htmlContent.includes('minmax')) {
            console.log('✅ Responsive: Flexible grid layouts found');
        } else {
            this.results.responsive.issues.push('Consider using flexible grid layouts');
        }
    }

    // Test 5: Image Optimization
    testImageOptimization() {
        console.log('🔍 Testing image optimization...');

        const htmlContent = fs.readFileSync('index.html', 'utf8');
        let jsContent = '';

        try {
            jsContent = fs.readFileSync('complete-pc-builder.js', 'utf8');
        } catch (error) {
            console.log('⚠️  Could not read JavaScript file for image optimization check');
        }

        // Check for lazy loading on images (in HTML or JS)
        if (htmlContent.includes('data-src') || jsContent.includes('data-src')) {
            console.log('✅ Images: Lazy loading implemented');
            this.results.images.passed = true;
        } else {
            this.results.images.issues.push('Images should use lazy loading');
        }

        // Check for error handling (in HTML or JS)
        if (htmlContent.includes('onerror') || jsContent.includes('onerror')) {
            console.log('✅ Images: Error handling found');
        } else {
            this.results.images.issues.push('Consider adding image error handling');
        }

        // Check for WebP support (would need server-side implementation)
        console.log('ℹ️  Images: Consider implementing WebP format support');
    }

    // Test 6: JavaScript Optimization
    testJavaScriptOptimization() {
        console.log('🔍 Testing JavaScript optimization...');
        
        try {
            const jsContent = fs.readFileSync('complete-pc-builder.js', 'utf8');
            
            // Check for mobile detection
            if (jsContent.includes('isMobile')) {
                console.log('✅ JavaScript: Mobile detection implemented');
                this.results.javascript.passed = true;
            } else {
                this.results.javascript.issues.push('No mobile detection found');
            }
            
            // Check for performance optimizations
            if (jsContent.includes('showMobileLoading')) {
                console.log('✅ JavaScript: Mobile loading indicators implemented');
            } else {
                this.results.javascript.issues.push('Consider adding mobile loading indicators');
            }
            
            // Check for touch event optimization
            if (jsContent.includes('passive: true')) {
                console.log('✅ JavaScript: Passive touch events found');
            } else {
                this.results.javascript.issues.push('Consider using passive touch events');
            }
            
        } catch (error) {
            this.results.javascript.issues.push('Could not analyze JavaScript file');
        }
    }

    // Run all tests
    runAllTests() {
        console.log('🚀 Starting Mobile Optimization Test Suite\n');
        
        this.testViewport();
        console.log('');
        
        this.testPerformance();
        console.log('');
        
        this.testAccessibility();
        console.log('');
        
        this.testResponsiveDesign();
        console.log('');
        
        this.testImageOptimization();
        console.log('');
        
        this.testJavaScriptOptimization();
        console.log('');
        
        this.generateReport();
    }

    // Generate final report
    generateReport() {
        console.log('📊 MOBILE OPTIMIZATION TEST REPORT');
        console.log('=====================================\n');
        
        const categories = Object.keys(this.results);
        const passedTests = categories.filter(cat => this.results[cat].passed).length;
        const totalTests = categories.length;
        
        console.log(`Overall Score: ${passedTests}/${totalTests} tests passed\n`);
        
        categories.forEach(category => {
            const result = this.results[category];
            const status = result.passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT';
            
            console.log(`${category.toUpperCase()}: ${status}`);
            
            if (result.issues.length > 0) {
                result.issues.forEach(issue => {
                    console.log(`  - ${issue}`);
                });
            }
            console.log('');
        });
        
        // Performance recommendations
        console.log('💡 RECOMMENDATIONS FOR FURTHER OPTIMIZATION:');
        console.log('1. Implement image compression for files > 100KB');
        console.log('2. Consider using WebP format with fallbacks');
        console.log('3. Implement service worker for offline caching');
        console.log('4. Use critical CSS inlining for faster initial render');
        console.log('5. Consider implementing virtual scrolling for large lists');
        console.log('6. Add performance monitoring and analytics');
        
        return {
            score: `${passedTests}/${totalTests}`,
            passed: passedTests === totalTests,
            results: this.results
        };
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new MobileTestSuite();
    testSuite.runAllTests();
}

module.exports = MobileTestSuite;
