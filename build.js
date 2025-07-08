/**
 * Trường Phát Computer - Production Build Script
 * 
 * This script:
 * 1. Creates a clean 'dist' folder
 * 2. Minifies CSS and JavaScript
 * 3. Copies and optimizes HTML files
 * 4. Copies optimized images (if available)
 * 5. Sets up proper caching headers
 * 
 * To use:
 * 1. Install required packages: npm install fs-extra glob terser html-minifier-terser clean-css
 * 2. Run: node build.js
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { minify: minifyJS } = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

// Configuration
const config = {
  sourceDir: './',
  outputDir: './dist',
  
  // Files/directories to include
  include: [
    '*.html',
    '*.css',
    '*.js',
    'js/**/*',
    'images/**/*',
    'images-optimized/**/*',
    'manifest.json',
    'service-worker.js',
    'favicon.ico'
  ],
  
  // Files/directories to exclude
  exclude: [
    'node_modules/**',
    'package.json',
    'package-lock.json',
    'compress-images.js',
    'build.js',
    'server.js',
    '*.md',
    '.git/**'
  ],
  
  // Optimization options
  optimization: {
    js: {
      compress: true,
      mangle: true,
      ecma: 2018,
      safari10: true
    },
    css: {
      level: 2
    },
    html: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    }
  }
};

/**
 * Get all files to process
 */
function getFiles() {
  const includePatterns = config.include.map(pattern => path.join(config.sourceDir, pattern));
  const excludePatterns = config.exclude.map(pattern => path.join(config.sourceDir, pattern));
  
  let files = [];
  
  // Get all files that match include patterns
  includePatterns.forEach(pattern => {
    const found = glob.sync(pattern);
    files = files.concat(found);
  });
  
  // Filter out excluded files
  return files.filter(file => {
    return !excludePatterns.some(pattern => {
      // Convert glob pattern to regex pattern
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
      
      return new RegExp(`^${regexPattern}$`).test(file);
    });
  });
}

/**
 * Process a single file
 */
async function processFile(file) {
  console.log(`Processing: ${file}`);
  
  const relativePath = path.relative(config.sourceDir, file);
  const outputPath = path.join(config.outputDir, relativePath);
  const extension = path.extname(file).toLowerCase();
  
  // Create directory structure
  fs.ensureDirSync(path.dirname(outputPath));
  
  try {
    // Process based on file type
    switch (extension) {
      case '.js':
        // Only minify .js files that are not already minified
        if (!file.includes('.min.js')) {
          const code = fs.readFileSync(file, 'utf8');
          const result = await minifyJS(code, config.optimization.js);
          fs.writeFileSync(outputPath, result.code);
          console.log(`  Minified JS: ${relativePath}`);
        } else {
          // Copy already minified JS files as-is
          fs.copyFileSync(file, outputPath);
          console.log(`  Copied minified JS: ${relativePath}`);
        }
        break;
        
      case '.css':
        // Only minify .css files that are not already minified
        if (!file.includes('.min.css')) {
          const css = fs.readFileSync(file, 'utf8');
          const result = new CleanCSS(config.optimization.css).minify(css);
          fs.writeFileSync(outputPath, result.styles);
          console.log(`  Minified CSS: ${relativePath}`);
        } else {
          // Copy already minified CSS files as-is
          fs.copyFileSync(file, outputPath);
          console.log(`  Copied minified CSS: ${relativePath}`);
        }
        break;
        
      case '.html':
        const html = fs.readFileSync(file, 'utf8');
        const minified = await minifyHTML(html, config.optimization.html);
        fs.writeFileSync(outputPath, minified);
        console.log(`  Minified HTML: ${relativePath}`);
        break;
        
      default:
        // Copy other files as-is
        fs.copyFileSync(file, outputPath);
        console.log(`  Copied: ${relativePath}`);
    }
    
    return true;
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
    return false;
  }
}

/**
 * Create a cache-control configuration file for the server
 */
function createCacheControlConfig() {
  // Create .htaccess for Apache servers
  const htaccess = `
# Cache-Control Headers
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Default - 1 day
  ExpiresDefault "access plus 1 day"
  
  # Images - 1 month
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/gif "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  
  # Web fonts - 1 month
  ExpiresByType font/ttf "access plus 1 month"
  ExpiresByType font/otf "access plus 1 month"
  ExpiresByType font/woff "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 month"
  
  # CSS and JavaScript - 1 week
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType text/javascript "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  
  # HTML - no cache (always fresh)
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# GZIP Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE application/javascript application/json application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Enable CORS for web fonts
<IfModule mod_headers.c>
  <FilesMatch "\\.(ttf|otf|woff|woff2)$">
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
</IfModule>
  `;
  
  fs.writeFileSync(path.join(config.outputDir, '.htaccess'), htaccess.trim());
  console.log('Created .htaccess file with caching rules');
  
  // Create a web.config for IIS servers
  const webConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="1.00:00:00" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
</configuration>`;

  fs.writeFileSync(path.join(config.outputDir, 'web.config'), webConfig);
  console.log('Created web.config file with caching rules');
}

/**
 * Main function to build the production version
 */
async function build() {
  console.log('🏗️ Building production version...');
  console.time('Build time');
  
  // Clear and recreate output directory
  fs.removeSync(config.outputDir);
  fs.ensureDirSync(config.outputDir);
  
  // Get all files to process
  const files = getFiles();
  console.log(`Found ${files.length} files to process`);
  
  // Process each file
  let successful = 0;
  for (const file of files) {
    if (await processFile(file)) {
      successful++;
    }
  }
  
  // Create cache control configuration
  createCacheControlConfig();
  
  console.timeEnd('Build time');
  console.log(`✅ Build completed: ${successful}/${files.length} files processed`);
  console.log(`📁 Production build saved to: ${config.outputDir}`);
}

// Run the build
build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
}); 