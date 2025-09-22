/**
 * Datastar Plugin Loader - Browser IIFE Version
 * 
 * Dynamic plugin loading system for Datastar that allows:
 * - CDN-style remote plugin loading
 * - Version management and caching
 * - Auto-discovery of required plugins
 * - Fallback mechanisms for offline scenarios
 * 
 * Usage Examples:
 * await datastar.loadPlugin('anchor')
 * await datastar.loadPlugin('anchor', { version: '1.0.0' })
 * await datastar.loadPlugins(['anchor', 'tooltip'])
 * await datastar.autoLoadPlugins() // Auto-detects from DOM
 */
(function(window) {
  'use strict';

  class DatastarPluginLoader {
    constructor() {
      this.loadedPlugins = new Map();
      this.loadingPromises = new Map();
      this.registry = {};
      this.defaultCDN = 'https://cdn.jsdelivr.net/gh/starfederation/datastar-plugins@latest';
      this.localCDN = 'http://localhost:8080'; // For development/testing
      this.baseURL = null;
      this.initializeRegistry();
    }

    /**
     * Sets the base URL for loading plugins.
     * @param url The base URL to use.
     */
    setBaseURL(url) {
      this.baseURL = url;
      console.log(`[PluginLoader] Base URL set to: ${this.baseURL}`);
    }

    /**
     * Gets the current base URL.
     */
    getBaseURL() {
      return this.baseURL;
    }

    /**
     * Initialize the plugin registry with known plugins
     */
    initializeRegistry() {
      this.registry = {
        anchor: {
          latest: '1.0.0',
          versions: {
            '1.0.0': {
              url: '/dist/anchor-browser.js',
              dependencies: [],
              size: 15000
            }
          }
        },
        // Future plugins would be added here
        tooltip: {
          latest: '1.0.0',
          versions: {
            '1.0.0': {
              url: '/dist/tooltip-browser.js',
              dependencies: ['anchor'],
              size: 12000
            }
          }
        }
      };
    }

    /**
     * Load a single plugin by name
     */
    async loadPlugin(name, options = {}) {
      // Check if already loaded
      const existing = this.loadedPlugins.get(name);
      if (existing && existing.loaded) {
        console.log(`[PluginLoader] Plugin '${name}' already loaded`);
        return existing.plugin;
      }

      // Check if currently loading
      const loadingPromise = this.loadingPromises.get(name);
      if (loadingPromise) {
        console.log(`[PluginLoader] Plugin '${name}' is currently loading, waiting...`);
        return loadingPromise;
      }

      // Start loading
      const promise = this.doLoadPlugin(name, options);
      this.loadingPromises.set(name, promise);

      try {
        const plugin = await promise;
        this.loadingPromises.delete(name);
        return plugin;
      } catch (error) {
        this.loadingPromises.delete(name);
        throw error;
      }
    }

    /**
     * Load multiple plugins
     */
    async loadPlugins(names, options = {}) {
      const promises = names.map(name => this.loadPlugin(name, options));
      return Promise.all(promises);
    }

    /**
     * Auto-discover and load plugins based on DOM attributes
     */
    async autoLoadPlugins(options = {}) {
      const requiredPlugins = this.scanForRequiredPlugins();
      
      if (requiredPlugins.length > 0) {
        console.log(`[PluginLoader] Auto-discovered plugins: ${requiredPlugins.join(', ')}`);
        await this.loadPlugins(requiredPlugins, options);
      } else {
        console.log('[PluginLoader] No plugins required by current DOM');
      }
    }

    /**
     * Scan DOM for plugin-specific attributes
     */
    scanForRequiredPlugins() {
      const plugins = new Set();
      
      // Scan all elements for plugin attributes
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        Array.from(element.attributes).forEach(attr => {
          const pluginName = this.getPluginFromAttribute(attr.name);
          if (pluginName) {
            plugins.add(pluginName);
          }
        });
      });

      return Array.from(plugins);
    }

    /**
     * Determine plugin name from attribute
     */
    getPluginFromAttribute(attrName) {
      // Check for exact matches first
      const exactMatches = {
        'data-tooltip': 'tooltip',
        'data-modal': 'modal',
        'data-dropdown': 'dropdown'
      };

      if (exactMatches[attrName]) {
        return exactMatches[attrName];
      }

      // Check for pattern matches
      if (attrName.startsWith('data-anchor')) {
        return 'anchor';
      }
      if (attrName.startsWith('data-tooltip')) {
        return 'tooltip';
      }
      if (attrName.startsWith('data-modal')) {
        return 'modal';
      }

      return null;
    }

    /**
     * Actually load a plugin
     */
    async doLoadPlugin(name, options) {
      console.log(`[PluginLoader] Loading plugin: ${name}`);

      // Get plugin info from registry
      const pluginInfo = this.registry[name];
      if (!pluginInfo) {
        throw new Error(`Plugin '${name}' not found in registry`);
      }

      // Determine version
      const version = options.version || pluginInfo.latest;
      const versionInfo = pluginInfo.versions[version];
      if (!versionInfo) {
        throw new Error(`Version '${version}' not found for plugin '${name}'`);
      }

      // Load dependencies first
      if (versionInfo.dependencies && versionInfo.dependencies.length > 0) {
        console.log(`[PluginLoader] Loading dependencies for ${name}: ${versionInfo.dependencies.join(', ')}`);
        await this.loadPlugins(versionInfo.dependencies, options);
      }

      // Determine CDN URL
      const cdn = options.cdn || this.detectCDN();
      const url = cdn.endsWith('/') ? `${cdn}${versionInfo.url.substring(1)}` : `${cdn}${versionInfo.url}`;

      try {
        // Load the plugin script
        const plugin = await this.fetchPlugin(url, options);
        
        // Register with Datastar if available
        if (typeof window !== 'undefined' && window.datastar) {
          const datastar = window.datastar;
          if (datastar.load && typeof datastar.load === 'function') {
            console.log(`[PluginLoader] Registering plugin '${name}' with Datastar`);
            datastar.load(plugin);
          }
          if (datastar.apply && typeof datastar.apply === 'function') {
            console.log(`[PluginLoader] Applying plugin '${name}' to DOM`);
            datastar.apply(document.body);
          }
        }

        // Store in loaded plugins
        this.loadedPlugins.set(name, {
          name,
          version,
          url,
          loaded: true,
          plugin
        });

        console.log(`[PluginLoader] Successfully loaded plugin: ${name}@${version}`);
        return plugin;

      } catch (error) {
        console.error(`[PluginLoader] Failed to load plugin '${name}':`, error);
        
        // Try fallback if provided
        if (options.fallback) {
          console.log(`[PluginLoader] Trying fallback for ${name}: ${options.fallback}`);
          return this.fetchPlugin(options.fallback, options);
        }
        
        throw error;
      }
    }

    /**
     * Detect appropriate CDN based on environment
     */
    detectCDN() {
      // Respect explicitly configured base URL first
      if (this.baseURL) {
        return this.baseURL;
      }
      // Use local CDN for development
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return this.localCDN;
      }
      
      // Use production CDN
      return this.defaultCDN;
    }

    /**
     * Fetch and evaluate plugin from URL
     */
    async fetchPlugin(url, options) {
      const timeout = options.timeout || 10000;
      
      console.log(`[PluginLoader] Fetching plugin from: ${url}`);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Plugin load timeout after ${timeout}ms`)), timeout);
      });

      // Create fetch promise
      const fetchPromise = this.loadPluginScript(url);

      // Race between fetch and timeout
      try {
        return await Promise.race([fetchPromise, timeoutPromise]);
      } catch (error) {
        console.error(`[PluginLoader] Error fetching plugin from ${url}:`, error);
        throw error;
      }
    }

    /**
     * Load plugin script via different methods
     */
    async loadPluginScript(url) {
      // For browser IIFE version, use script tag injection
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        
        script.onload = () => {
          // Look for plugin in global scope
          const pluginName = this.extractPluginNameFromUrl(url);
          const pascalName = this.normalizeToPascalCase(pluginName);
          const globalName = `Datastar${pascalName}Plugin`;
          
          if (window[globalName]) {
            const plugin = window[globalName];
            console.log(`[PluginLoader] Found plugin in global scope: ${globalName}`);
            resolve(plugin);
          } else {
            console.warn(`[PluginLoader] Plugin not found in global scope: ${globalName}`);
            // Try to find any recently added globals
            resolve(this.findRecentlyAddedGlobal());
          }
          
          // Clean up script tag
          document.head.removeChild(script);
        };
        
        script.onerror = () => {
          document.head.removeChild(script);
          reject(new Error(`Failed to load script: ${url}`));
        };
        
        document.head.appendChild(script);
      });
    }

    /**
     * Extract plugin name from URL
     */
    extractPluginNameFromUrl(url) {
      try {
        const clean = url.split('#')[0].split('?')[0];
        const file = clean.substring(clean.lastIndexOf('/') + 1);
        const withoutExt = file.replace(/\.js$/, '');
        const base = withoutExt.replace(/-browser$/, '');
        return base || 'unknown';
      } catch (e) {
        return 'unknown';
      }
    }

    /**
     * Capitalize first letter
     */
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert a name with separators to PascalCase (e.g., "anchor-plugin" -> "AnchorPlugin")
     */
    normalizeToPascalCase(name) {
      if (!name) return '';
      return name
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(part => this.capitalize(part))
        .join('');
    }

    /**
     * Find recently added global variables (fallback)
     */
    findRecentlyAddedGlobal() {
      // This is a fallback - look for common plugin patterns
      const candidates = [
        'DatastarAnchorPlugin',
        'DatastarTooltipPlugin',
        'DatastarModalPlugin',
        'DatastarDropdownPlugin'
      ];

      for (const candidate of candidates) {
        if (window[candidate]) {
          console.log(`[PluginLoader] Found fallback plugin: ${candidate}`);
          return window[candidate];
        }
      }

      console.warn('[PluginLoader] No plugin found in global scope');
      return null;
    }

    /**
     * Get information about loaded plugins
     */
    getLoadedPlugins() {
      return Array.from(this.loadedPlugins.values());
    }

    /**
     * Check if a plugin is loaded
     */
    isPluginLoaded(name) {
      const plugin = this.loadedPlugins.get(name);
      return plugin ? plugin.loaded : false;
    }

    /**
     * Unload a plugin (for testing/cleanup)
     */
    unloadPlugin(name) {
      this.loadedPlugins.delete(name);
      this.loadingPromises.delete(name);
      console.log(`[PluginLoader] Unloaded plugin: ${name}`);
    }

    /**
     * Update registry (for dynamic registry updates)
     */
    updateRegistry(newRegistry) {
      Object.keys(newRegistry).forEach(key => {
        if (newRegistry[key]) {
          this.registry[key] = newRegistry[key];
        }
      });
      console.log('[PluginLoader] Registry updated');
    }
  }

  // Create global instance
  const pluginLoader = new DatastarPluginLoader();

  // Extend Datastar if available
  const extendDatastar = () => {
    if (window.datastar) {
      // Add plugin loading methods to Datastar
      window.datastar.loadPlugin = pluginLoader.loadPlugin.bind(pluginLoader);
      window.datastar.loadPlugins = pluginLoader.loadPlugins.bind(pluginLoader);
      window.datastar.autoLoadPlugins = pluginLoader.autoLoadPlugins.bind(pluginLoader);
      window.datastar.getLoadedPlugins = pluginLoader.getLoadedPlugins.bind(pluginLoader);
      window.datastar.isPluginLoaded = pluginLoader.isPluginLoaded.bind(pluginLoader);
      
      console.log('[PluginLoader] Extended Datastar with plugin loading capabilities');
    }
  };

  // Try to extend immediately
  if (window.datastar) {
    extendDatastar();
  } else {
    // Wait for Datastar to load
    const checkDatastar = setInterval(() => {
      if (window.datastar) {
        clearInterval(checkDatastar);
        extendDatastar();
      }
    }, 100);
    
    // Give up after 5 seconds
    setTimeout(() => {
      clearInterval(checkDatastar);
      if (!window.datastar) {
        console.warn('[PluginLoader] Datastar not found after 5 seconds');
      }
    }, 5000);
  }

  // Make loader available globally as well
  window.DatastarPluginLoader = pluginLoader;

})(window);