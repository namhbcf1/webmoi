// Mobile Performance Optimization Script
// This script adds various mobile performance optimizations

(function() {
    'use strict';
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    // Performance optimizations for mobile
    if (isMobile) {
        console.log('📱 Mobile device detected - applying optimizations');
        
        // Reduce animation complexity on mobile
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        
        // Disable expensive CSS effects on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                * {
                    -webkit-transform: translateZ(0);
                    transform: translateZ(0);
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
                
                .glass {
                    backdrop-filter: none !important;
                    background: rgba(30, 41, 59, 0.95) !important;
                }
                
                /* Disable complex animations on mobile */
                .glow, .cpu-option, .game-option {
                    transition: background-color 0.2s ease !important;
                }
                
                /* Optimize scrolling */
                body {
                    -webkit-overflow-scrolling: touch;
                    overflow-scrolling: touch;
                }
                
                /* Reduce image quality on very small screens */
                @media (max-width: 480px) {
                    img {
                        image-rendering: -webkit-optimize-contrast;
                    }
                }
            }
        `;
        document.head.appendChild(style);
        
        // Preload critical images only
        const criticalImages = [
            'images/valorant.jpg',
            'images/csgo.jpg',
            'images/pubg.jpg',
            'images/lol.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
        
        // Optimize touch events
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
        
        // Reduce memory usage by limiting concurrent image loads
        let imageLoadQueue = [];
        let loadingImages = 0;
        const maxConcurrentLoads = 3;
        
        function processImageQueue() {
            while (imageLoadQueue.length > 0 && loadingImages < maxConcurrentLoads) {
                const img = imageLoadQueue.shift();
                loadingImages++;
                
                img.onload = img.onerror = function() {
                    loadingImages--;
                    processImageQueue();
                };
                
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            }
        }
        
        // Override the lazy loading to use queue
        window.queueImageLoad = function(img) {
            imageLoadQueue.push(img);
            processImageQueue();
        };
    }
    
    // Network-aware loading
    if ('connection' in navigator) {
        const connection = navigator.connection;
        const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                                connection.effectiveType === '2g' || 
                                connection.saveData;
        
        if (isSlowConnection) {
            console.log('🐌 Slow connection detected - reducing image quality');
            
            // Reduce image quality for slow connections
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.src && !img.src.includes('data:image/svg')) {
                    // Add compression parameter if possible
                    const url = new URL(img.src, window.location.origin);
                    url.searchParams.set('quality', '60');
                    url.searchParams.set('format', 'webp');
                    // Note: This would work with a server that supports query parameters
                }
            });
        }
    }
    
    // Memory management
    function cleanupUnusedImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight + 1000 && 
                            rect.bottom > -1000;
            
            if (!isVisible && img.src && !img.src.includes('data:image/svg')) {
                // Store original src and replace with placeholder for off-screen images
                if (!img.dataset.originalSrc) {
                    img.dataset.originalSrc = img.src;
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                }
            } else if (isVisible && img.dataset.originalSrc) {
                // Restore image when it comes back into view
                img.src = img.dataset.originalSrc;
                delete img.dataset.originalSrc;
            }
        });
    }
    
    // Run cleanup periodically on mobile
    if (isMobile) {
        setInterval(cleanupUnusedImages, 5000);
    }
    
    // Optimize font loading
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            console.log('✅ Fonts loaded');
        });
    }
    
    // Service Worker registration for caching (if available)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, continue without caching
        });
    }
    
})();

// Export for use in other scripts
window.MobilePerformance = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768,
    isSlowConnection: 'connection' in navigator && 
                     (navigator.connection.effectiveType === 'slow-2g' || 
                      navigator.connection.effectiveType === '2g' || 
                      navigator.connection.saveData)
};
