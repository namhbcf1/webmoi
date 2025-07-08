/**
 * Trường Phát Computer - Image Optimizer
 * Handles lazy loading and optimizing images for better mobile performance
 */

class ImageOptimizer {
  constructor() {
    this.observerOptions = {
      root: null, // viewport
      rootMargin: '100px', // load images 100px before they come into view
      threshold: 0.1 // trigger when at least 10% of the element is visible
    };
    
    this.imageObserver = null;
    this.initialized = false;
    this.placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23334155"/%3E%3C/svg%3E';
  }
  
  init() {
    if (this.initialized) return;
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(this.onIntersection.bind(this), this.observerOptions);
      this.observeImages();
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadAllImages();
    }
    
    // Listen for DOM changes to catch dynamically added images
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                this.findAndObserveImagesInElement(node);
              }
            });
          }
        });
      });
      
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    this.initialized = true;
    console.log('🖼️ Image Optimizer initialized');
  }
  
  observeImages() {
    this.findAndObserveImagesInElement(document.body);
  }
  
  findAndObserveImagesInElement(element) {
    // Find all images in the element
    const images = element.querySelectorAll('img:not([data-lazy-loaded])');
    
    images.forEach(img => {
      // Skip already processed images
      if (img.hasAttribute('data-lazy-loaded')) return;
      
      // Store original attributes
      const originalSrc = img.getAttribute('src');
      const originalSrcset = img.getAttribute('srcset');
      
      // Skip if image is already loading from data URI
      if (originalSrc && originalSrc.startsWith('data:')) return;
      
      // Mark as being processed
      img.setAttribute('data-lazy-loaded', 'false');
      img.setAttribute('data-original-src', originalSrc || '');
      
      if (originalSrcset) {
        img.setAttribute('data-original-srcset', originalSrcset);
        img.removeAttribute('srcset');
      }
      
      // Set placeholder
      img.src = this.placeholderSrc;
      
      // Add loading class for animation
      img.classList.add('lazy-image');
      
      // Add to observer
      this.imageObserver.observe(img);
    });
  }
  
  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.imageObserver.unobserve(entry.target);
      }
    });
  }
  
  loadImage(img) {
    const originalSrc = img.getAttribute('data-original-src');
    const originalSrcset = img.getAttribute('data-original-srcset');
    
    if (!originalSrc) return;
    
    // Create a new image element to preload
    const tempImage = new Image();
    
    // Set up load event
    tempImage.onload = () => {
      // Apply the original source
      img.src = originalSrc;
      
      if (originalSrcset) {
        img.srcset = originalSrcset;
      }
      
      // Mark as loaded
      img.setAttribute('data-lazy-loaded', 'true');
      img.classList.add('lazy-loaded');
      img.classList.remove('lazy-image');
    };
    
    tempImage.onerror = () => {
      // Load fallback image on error
      if (img.src.includes('images/components/')) {
        img.src = './images/components/default.jpg';
      } else {
        img.src = this.placeholderSrc;
      }
      img.classList.add('lazy-error');
      img.setAttribute('data-lazy-loaded', 'error');
    };
    
    // Start loading the image
    tempImage.src = originalSrc;
    
    if (originalSrcset) {
      tempImage.srcset = originalSrcset;
    }
  }
  
  loadAllImages() {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-original-src]:not([data-lazy-loaded="true"])').forEach(img => {
      this.loadImage(img);
    });
  }
  
  // Utility method to optimize image size based on device
  getOptimizedImageUrl(originalUrl, width) {
    // Check if image is from the same origin
    if (!originalUrl || originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
      return originalUrl;
    }
    
    // For external images, return as is
    if (originalUrl.startsWith('http') && !originalUrl.includes(window.location.hostname)) {
      return originalUrl;
    }
    
    // For now just return the original URL
    // In a production environment, you might want to use a real image optimization service
    return originalUrl;
  }
}

// Initialize and export
const imageOptimizer = new ImageOptimizer();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => imageOptimizer.init());
} else {
  imageOptimizer.init();
}

window.imageOptimizer = imageOptimizer; 