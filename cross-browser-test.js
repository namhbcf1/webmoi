// Cross-Browser Compatibility Test Suite
// =====================================

class CrossBrowserTester {
    constructor() {
        this.results = {
            deviceDetection: {},
            browserSupport: {},
            performance: {},
            functionality: {},
            errors: []
        };
        this.startTime = performance.now ? performance.now() : Date.now();
    }

    // Test device detection accuracy
    testDeviceDetection() {
        console.log('🔍 Testing device detection...');
        
        try {
            const tests = {
                isMobile: DeviceDetector.isMobile(),
                isIOS: DeviceDetector.isIOS(),
                isAndroid: DeviceDetector.isAndroid(),
                isSafari: DeviceDetector.isSafari(),
                isChrome: DeviceDetector.isChrome(),
                isFirefox: DeviceDetector.isFirefox(),
                isEdge: DeviceDetector.isEdge(),
                isLowPerformance: DeviceDetector.isLowPerformance()
            };

            this.results.deviceDetection = {
                ...tests,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                touchSupport: 'ontouchstart' in window,
                orientation: window.orientation || 'unknown'
            };

            console.log('✅ Device detection tests completed:', tests);
            return true;
        } catch (error) {
            this.results.errors.push({ test: 'deviceDetection', error: error.message });
            console.error('❌ Device detection test failed:', error);
            return false;
        }
    }

    // Test browser feature support
    testBrowserSupport() {
        console.log('🔍 Testing browser feature support...');
        
        try {
            const features = {
                flexbox: this.testCSS('display', 'flex'),
                grid: this.testCSS('display', 'grid'),
                intersectionObserver: 'IntersectionObserver' in window,
                requestAnimationFrame: 'requestAnimationFrame' in window,
                localStorage: this.testLocalStorage(),
                touchEvents: 'ontouchstart' in window,
                passiveListeners: this.testPassiveListeners(),
                smoothScroll: 'scrollBehavior' in document.documentElement.style,
                webGL: this.testWebGL(),
                serviceWorker: 'serviceWorker' in navigator
            };

            this.results.browserSupport = features;
            console.log('✅ Browser support tests completed:', features);
            return true;
        } catch (error) {
            this.results.errors.push({ test: 'browserSupport', error: error.message });
            console.error('❌ Browser support test failed:', error);
            return false;
        }
    }

    // Test CSS property support
    testCSS(property, value) {
        const element = document.createElement('div');
        try {
            element.style[property] = value;
            return element.style[property] === value;
        } catch (e) {
            return false;
        }
    }

    // Test localStorage support
    testLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Test passive event listeners
    testPassiveListeners() {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassive = true;
                }
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
        } catch (e) {}
        return supportsPassive;
    }

    // Test WebGL support
    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // Test performance metrics
    testPerformance() {
        console.log('🔍 Testing performance...');
        
        try {
            const startTime = performance.now ? performance.now() : Date.now();
            
            // Test animation frame rate
            let frameCount = 0;
            const testDuration = 1000; // 1 second
            const frameTest = () => {
                frameCount++;
                if (performance.now() - startTime < testDuration) {
                    requestAnimationFrame(frameTest);
                }
            };
            requestAnimationFrame(frameTest);

            setTimeout(() => {
                const fps = frameCount;
                const endTime = performance.now ? performance.now() : Date.now();
                
                this.results.performance = {
                    fps: fps,
                    loadTime: endTime - this.startTime,
                    memoryUsage: performance.memory ? {
                        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                    } : 'Not available',
                    connection: navigator.connection ? {
                        effectiveType: navigator.connection.effectiveType,
                        downlink: navigator.connection.downlink,
                        rtt: navigator.connection.rtt
                    } : 'Not available'
                };

                console.log('✅ Performance tests completed:', this.results.performance);
            }, testDuration + 100);

            return true;
        } catch (error) {
            this.results.errors.push({ test: 'performance', error: error.message });
            console.error('❌ Performance test failed:', error);
            return false;
        }
    }

    // Test core functionality
    testFunctionality() {
        console.log('🔍 Testing core functionality...');
        
        try {
            const tests = {
                budgetSlider: this.testBudgetSlider(),
                gameSelection: this.testGameSelection(),
                cpuSelection: this.testCPUSelection(),
                lazyLoading: this.testLazyLoading(),
                mobileOptimizations: this.testMobileOptimizations(),
                crossBrowserUtils: this.testCrossBrowserUtils()
            };

            this.results.functionality = tests;
            console.log('✅ Functionality tests completed:', tests);
            return true;
        } catch (error) {
            this.results.errors.push({ test: 'functionality', error: error.message });
            console.error('❌ Functionality test failed:', error);
            return false;
        }
    }

    testBudgetSlider() {
        const slider = document.getElementById('budget-slider');
        if (!slider) return false;
        
        try {
            slider.value = 20;
            slider.dispatchEvent(new Event('input'));
            return selectedBudget === 20;
        } catch (e) {
            return false;
        }
    }

    testGameSelection() {
        try {
            return typeof selectGame === 'function' && typeof loadGames === 'function';
        } catch (e) {
            return false;
        }
    }

    testCPUSelection() {
        try {
            return typeof selectCPU === 'function';
        } catch (e) {
            return false;
        }
    }

    testLazyLoading() {
        try {
            return typeof setupLazyLoading === 'function' && 'IntersectionObserver' in window;
        } catch (e) {
            return false;
        }
    }

    testMobileOptimizations() {
        try {
            return typeof showMobileLoading === 'function' && 
                   typeof hideMobileLoading === 'function' &&
                   typeof PerformanceOptimizer !== 'undefined';
        } catch (e) {
            return false;
        }
    }

    testCrossBrowserUtils() {
        try {
            return typeof BrowserCompat !== 'undefined' &&
                   typeof BrowserCompat.addEventListener === 'function' &&
                   typeof BrowserCompat.smoothScrollTo === 'function';
        } catch (e) {
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting cross-browser compatibility tests...');
        
        const testResults = {
            deviceDetection: this.testDeviceDetection(),
            browserSupport: this.testBrowserSupport(),
            functionality: this.testFunctionality()
        };

        // Performance test runs asynchronously
        this.testPerformance();

        // Wait a bit for performance test to complete
        setTimeout(() => {
            this.generateReport();
        }, 2000);

        return testResults;
    }

    // Generate comprehensive test report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            results: this.results,
            summary: {
                totalTests: Object.keys(this.results.functionality || {}).length + 
                           Object.keys(this.results.browserSupport || {}).length,
                passed: this.countPassedTests(),
                failed: this.results.errors.length,
                score: this.calculateScore()
            }
        };

        console.log('📊 Cross-Browser Test Report:', report);
        
        // Display results in a user-friendly way
        this.displayResults(report);
        
        return report;
    }

    countPassedTests() {
        let passed = 0;
        
        if (this.results.functionality) {
            passed += Object.values(this.results.functionality).filter(Boolean).length;
        }
        
        if (this.results.browserSupport) {
            passed += Object.values(this.results.browserSupport).filter(Boolean).length;
        }
        
        return passed;
    }

    calculateScore() {
        const total = this.countPassedTests() + this.results.errors.length;
        const passed = this.countPassedTests();
        return total > 0 ? Math.round((passed / total) * 100) : 0;
    }

    displayResults(report) {
        // Create a visual report
        const resultDiv = document.createElement('div');
        resultDiv.id = 'test-results';
        resultDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e293b;
            color: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #4facfe;
            max-width: 400px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        `;

        resultDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #4facfe;">🧪 Test Results</h3>
            <div><strong>Score:</strong> ${report.summary.score}%</div>
            <div><strong>Passed:</strong> ${report.summary.passed}</div>
            <div><strong>Failed:</strong> ${report.summary.failed}</div>
            <div><strong>Device:</strong> ${DeviceDetector.isMobile() ? 'Mobile' : 'Desktop'}</div>
            <div><strong>Browser:</strong> ${this.getBrowserName()}</div>
            <div style="margin-top: 10px;">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #4facfe; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(resultDiv);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (resultDiv.parentElement) {
                resultDiv.remove();
            }
        }, 10000);
    }

    getBrowserName() {
        if (DeviceDetector.isChrome()) return 'Chrome';
        if (DeviceDetector.isFirefox()) return 'Firefox';
        if (DeviceDetector.isSafari()) return 'Safari';
        if (DeviceDetector.isEdge()) return 'Edge';
        return 'Unknown';
    }
}

// Auto-run tests when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const tester = new CrossBrowserTester();
            tester.runAllTests();
        }, 2000); // Wait for page to fully load
    });
}

// Export for manual testing
window.CrossBrowserTester = CrossBrowserTester;
