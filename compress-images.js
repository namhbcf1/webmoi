/**
 * Trường Phát Computer - Image Compression Utility
 * 
 * This script compresses and resizes images for better mobile performance.
 * 
 * To use this script:
 * 1. Install required packages: npm install sharp glob fs-extra
 * 2. Run the script: node compress-images.js
 */

const sharp = require('sharp');
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const config = {
  // Source directory with original images
  sourceDir: './images',
  
  // Output directory for optimized images
  outputDir: './images-optimized',
  
  // Thumbnail sizes
  sizes: {
    thumbnail: 150,  // Small thumbnails for lists
    medium: 320,     // Medium size for mobile devices
    large: 640       // Large size for tablets/desktop
  },
  
  // Quality settings (0-100)
  quality: {
    jpg: 80,
    webp: 75
  },
  
  // Generate WebP versions (modern format with better compression)
  generateWebP: true,
  
  // Process these file extensions
  extensions: ['jpg', 'jpeg', 'png'],
  
  // Skip directories that match these patterns
  skipDirs: [
    'node_modules',
    '.git',
    'images-optimized'
  ]
};

// Ensure output directory exists
fs.ensureDirSync(config.outputDir);

/**
 * Get all images recursively
 */
function findImages() {
  const patterns = config.extensions.map(ext => `${config.sourceDir}/**/*.${ext}`);
  let files = [];
  
  patterns.forEach(pattern => {
    const found = glob.sync(pattern, { nocase: true });
    files = files.concat(found);
  });
  
  // Filter out files from skipped directories
  return files.filter(file => {
    return !config.skipDirs.some(skipDir => file.includes(skipDir));
  });
}

/**
 * Process a single image
 */
async function processImage(imagePath) {
  console.log(`Processing: ${imagePath}`);
  
  const filename = path.basename(imagePath);
  const relativePath = path.relative(config.sourceDir, path.dirname(imagePath));
  const outputPath = path.join(config.outputDir, relativePath);
  
  // Create directory structure
  fs.ensureDirSync(outputPath);
  
  try {
    // Load image
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Process original image (keep proportions but optimize)
    await image
      .jpeg({ quality: config.quality.jpg, progressive: true })
      .toFile(path.join(outputPath, filename));
      
    // Generate WebP version of original
    if (config.generateWebP) {
      await image
        .webp({ quality: config.quality.webp })
        .toFile(path.join(outputPath, `${path.parse(filename).name}.webp`));
    }
    
    // Generate thumbnails
    for (const [size, width] of Object.entries(config.sizes)) {
      // Skip if the original is smaller than this size
      if (metadata.width <= width) continue;
      
      // Create resized JPG
      const resizedName = `${path.parse(filename).name}-${size}.jpg`;
      await image
        .resize(width)
        .jpeg({ quality: config.quality.jpg, progressive: true })
        .toFile(path.join(outputPath, resizedName));
        
      // Create resized WebP if enabled
      if (config.generateWebP) {
        const webpName = `${path.parse(filename).name}-${size}.webp`;
        await image
          .resize(width)
          .webp({ quality: config.quality.webp })
          .toFile(path.join(outputPath, webpName));
      }
    }
    
    console.log(`✅ Successfully processed: ${imagePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Error processing ${imagePath}:`, err.message);
    return false;
  }
}

/**
 * Copy non-image files to maintain directory structure
 */
async function copyNonImageFiles() {
  const images = new Set(findImages().map(f => f.toLowerCase()));
  
  // Find all files in source directory
  const allFiles = glob.sync(`${config.sourceDir}/**/*.*`);
  
  // Filter for non-image files
  const nonImageFiles = allFiles.filter(file => {
    const isImage = config.extensions.some(ext => 
      file.toLowerCase().endsWith(`.${ext}`)
    );
    return !isImage && !config.skipDirs.some(dir => file.includes(dir));
  });
  
  // Copy each non-image file preserving directory structure
  for (const file of nonImageFiles) {
    const relativePath = path.relative(config.sourceDir, file);
    const destPath = path.join(config.outputDir, relativePath);
    
    try {
      fs.ensureDirSync(path.dirname(destPath));
      fs.copyFileSync(file, destPath);
      console.log(`Copied: ${relativePath}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err.message);
    }
  }
}

/**
 * Create htaccess for Apache servers to enable WebP serving
 */
function createHtaccess() {
  const htaccessPath = path.join(config.outputDir, '.htaccess');
  const content = `
# Enable WebP image serving if browser supports it
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Check if browser supports WebP
  RewriteCond %{HTTP_ACCEPT} image/webp
  
  # Check if WebP version exists
  RewriteCond %{REQUEST_FILENAME}.webp -f
  
  # Serve WebP instead of JPG or PNG
  RewriteRule ^(.+)\.(jpe?g|png)$ $1.$2.webp [T=image/webp,L]
</IfModule>

# Set correct content type for WebP files
<IfModule mod_mime.c>
  AddType image/webp .webp
</IfModule>
  `;
  
  fs.writeFileSync(htaccessPath, content.trim());
  console.log('Created .htaccess file for WebP support');
}

/**
 * Create HTML snippet for responsive images
 */
function createResponsiveImgSnippet() {
  const snippetPath = path.join(config.outputDir, '_responsive-image-example.html');
  const content = `
<!-- Example of responsive image usage -->
<!-- Copy this pattern for optimal image loading -->

<picture>
  <!-- WebP versions for browsers that support it -->
  <source
    srcset="
      images-optimized/example-thumbnail.webp 150w,
      images-optimized/example-medium.webp 320w,
      images-optimized/example-large.webp 640w,
      images-optimized/example.webp 1200w
    "
    sizes="(max-width: 768px) 100vw, 50vw"
    type="image/webp"
  />
  
  <!-- JPG fallback for browsers without WebP support -->
  <source
    srcset="
      images-optimized/example-thumbnail.jpg 150w,
      images-optimized/example-medium.jpg 320w,
      images-optimized/example-large.jpg 640w,
      images-optimized/example.jpg 1200w
    "
    sizes="(max-width: 768px) 100vw, 50vw"
    type="image/jpeg"
  />
  
  <!-- Fallback image for very old browsers -->
  <img
    src="images-optimized/example-medium.jpg"
    alt="Example responsive image"
    loading="lazy"
    width="320"
    height="240"
  />
</picture>

<!-- 
  Note:
  - The 'sizes' attribute tells the browser how much of the viewport width the image will take up
  - The 'loading="lazy"' attribute enables native lazy loading
  - Including width/height prevents layout shifts
-->
  `;
  
  fs.writeFileSync(snippetPath, content.trim());
  console.log('Created responsive image example snippet');
}

/**
 * Main function to process all images
 */
async function main() {
  console.log('🖼️ Starting image optimization...');
  console.time('Processing time');
  
  // Find all images
  const images = findImages();
  console.log(`Found ${images.length} images to process`);
  
  // Process each image
  let successful = 0;
  for (const image of images) {
    if (await processImage(image)) {
      successful++;
    }
  }
  
  // Copy non-image files
  await copyNonImageFiles();
  
  // Create helper files
  createHtaccess();
  createResponsiveImgSnippet();
  
  console.timeEnd('Processing time');
  console.log(`✅ Completed processing ${successful}/${images.length} images`);
  console.log(`📁 Optimized images saved to: ${config.outputDir}`);
}

// Run the script
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 