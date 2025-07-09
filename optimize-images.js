// Image optimization utility for mobile performance
// This script helps identify large images that need compression

const fs = require('fs');
const path = require('path');

function getFileSizeInKB(filePath) {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
}

function scanImagesDirectory(dirPath, results = []) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            scanImagesDirectory(fullPath, results);
        } else if (item.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const sizeKB = getFileSizeInKB(fullPath);
            results.push({
                path: fullPath,
                name: item,
                sizeKB: sizeKB,
                needsOptimization: sizeKB > 100 // Flag images larger than 100KB
            });
        }
    }
    
    return results;
}

function generateOptimizationReport() {
    console.log('🔍 Scanning images directory for optimization opportunities...\n');
    
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
        console.log('❌ Images directory not found!');
        return;
    }
    
    const images = scanImagesDirectory(imagesDir);
    const largeImages = images.filter(img => img.needsOptimization);
    
    console.log(`📊 Image Analysis Report:`);
    console.log(`Total images: ${images.length}`);
    console.log(`Images needing optimization: ${largeImages.length}`);
    
    const totalSize = images.reduce((sum, img) => sum + img.sizeKB, 0);
    console.log(`Total size: ${Math.round(totalSize / 1024)} MB\n`);
    
    if (largeImages.length > 0) {
        console.log('🚨 Large images that should be compressed:');
        largeImages
            .sort((a, b) => b.sizeKB - a.sizeKB)
            .slice(0, 20) // Show top 20 largest
            .forEach(img => {
                console.log(`  ${img.name}: ${img.sizeKB} KB`);
            });
        
        console.log('\n💡 Recommendations:');
        console.log('1. Compress images to under 100KB each');
        console.log('2. Convert to WebP format for better compression');
        console.log('3. Use responsive images with different sizes');
        console.log('4. Consider lazy loading (already implemented)');
        
        // Generate compression commands
        console.log('\n🛠️  Sample compression commands (using imagemagick):');
        largeImages.slice(0, 5).forEach(img => {
            const outputPath = img.path.replace(/\.(jpg|jpeg|png)$/i, '_optimized.$1');
            console.log(`magick "${img.path}" -quality 80 -resize 800x600> "${outputPath}"`);
        });
    } else {
        console.log('✅ All images are already optimized!');
    }
}

// Run the analysis
if (require.main === module) {
    generateOptimizationReport();
}

module.exports = { scanImagesDirectory, generateOptimizationReport };
