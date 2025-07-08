/**
 * Trường Phát Computer - Dynamic Configuration Loader
 * Loads only the configurations needed based on user selection
 */

// Initialize config objects
window.intelConfigs = {};
window.amdConfigs = {};

// List of available games
const availableGames = [
    'valorant',
    'csgo',
    'pubg',
    'lol',
    'gta-v',
    'elden-ring',
    'naraka',
    'genshin',
    'fo4',
    'black-myth-wukong',
    'audition',
    'battle-teams-2',
    'crossfire',
    'delta-force',
    'mu-origin'
];

// Cache for loaded configurations
const loadedConfigs = new Set();

// Dynamic config loader with caching
async function loadConfig(cpu, game) {
    const cacheKey = `${cpu}-${game}`;
    
    // If already loaded, return immediately
    if (loadedConfigs.has(cacheKey)) {
        console.log(`✅ Using cached config: ${cacheKey}`);
        return;
    }
    
    console.log(`🔄 Loading config: ${cpu}/${game}.js`);
    
    try {
        // Create script element
        const script = document.createElement('script');
        script.src = `./js/configs/${cpu}/${game}.js`;
        script.async = true;
        
        // Create promise to wait for script to load
        const loadPromise = new Promise((resolve, reject) => {
            script.onload = () => {
                console.log(`✅ Loaded config: ${cpu}/${game}.js`);
                loadedConfigs.add(cacheKey);
                resolve();
            };
            script.onerror = () => {
                console.error(`❌ Failed to load config: ${cpu}/${game}.js`);
                reject(new Error(`Failed to load config: ${cpu}/${game}.js`));
            };
        });
        
        // Append script to document
        document.head.appendChild(script);
        
        // Wait for script to load
        await loadPromise;
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Preload common configurations on page load
async function preloadCommonConfigs() {
    // Only preload the most popular games to save bandwidth
    const popularGames = ['valorant', 'csgo', 'lol'];
    
    // Detect if on mobile to limit preloading
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // On mobile, only preload the very basic configs
    const gamesToPreload = isMobile ? ['valorant'] : popularGames;
    
    console.log(`🔄 Preloading ${gamesToPreload.length} common configs...`);
    
    // Preload in sequence to not overwhelm mobile connections
    for (const game of gamesToPreload) {
        await loadConfig('intel', game);
        await loadConfig('amd', game);
    }
}

// Load specific configs when needed
async function loadGameConfigs(game) {
    if (!game || !availableGames.includes(game)) {
        console.warn(`⚠️ Invalid game: ${game}`);
        return;
    }
    
    // Load both CPU variants
    await Promise.all([
        loadConfig('intel', game),
        loadConfig('amd', game)
    ]);
}

// Load specific CPU configs
async function loadCpuConfigs(cpu) {
    if (!cpu || (cpu !== 'intel' && cpu !== 'amd')) {
        console.warn(`⚠️ Invalid CPU: ${cpu}`);
        return;
    }
    
    // Detect if on mobile to limit loading
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // On mobile, only load popular games
    const gamesToLoad = isMobile ? 
        ['valorant', 'csgo', 'pubg', 'lol'] : 
        availableGames;
    
    // Load in sequence on mobile to reduce network load
    if (isMobile) {
        for (const game of gamesToLoad) {
            await loadConfig(cpu, game);
        }
    } else {
        // Load in parallel on desktop
        await Promise.all(
            gamesToLoad.map(game => loadConfig(cpu, game))
        );
    }
}

// Check if we should preload on initial page load
if (!('connection' in navigator) || 
    !(navigator.connection.saveData === true || 
      navigator.connection.effectiveType === 'slow-2g' || 
      navigator.connection.effectiveType === '2g')) {
    // Only preload if not on a slow connection or data-saving mode
    preloadCommonConfigs();
}

// Export functions for global use
window.loadGameConfigs = loadGameConfigs;
window.loadCpuConfigs = loadCpuConfigs;
window.loadConfig = loadConfig;

// Add event listeners for CPU and game selection to trigger config loading
document.addEventListener('DOMContentLoaded', () => {
    // Listen for CPU selection
    document.querySelectorAll('.cpu-option').forEach(option => {
        option.addEventListener('click', () => {
            const cpu = option.getAttribute('data-cpu');
            if (cpu) {
                loadCpuConfigs(cpu);
            }
        });
    });
    
    // Listen for game selection
    document.getElementById('game-grid')?.addEventListener('click', (e) => {
        // Find closest game option if clicked on child
        const gameOption = e.target.closest('.game-option');
        if (gameOption) {
            const game = gameOption.getAttribute('data-game');
            if (game) {
                loadGameConfigs(game);
            }
        }
    });
});