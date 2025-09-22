/**
 * Datastar Plugin Loader
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
interface PluginLoadOptions {
    version?: string;
    cdn?: string;
    timeout?: number;
    fallback?: string;
    cache?: boolean;
}
interface PluginInfo {
    name: string;
    version: string;
    url: string;
    loaded: boolean;
    plugin?: any;
}
interface PluginRegistry {
    [key: string]: {
        latest: string;
        versions: {
            [version: string]: {
                url: string;
                dependencies?: string[];
                size?: number;
            };
        };
    };
}
declare class DatastarPluginLoader {
    private loadedPlugins;
    private loadingPromises;
    private registry;
    private defaultCDN;
    private localCDN;
    private baseURL;
    constructor();
    /**
     * Sets the base URL for loading plugins.
     * @param url The base URL to use.
     */
    setBaseURL(url: string): void;
    /**
     * Gets the current base URL.
     */
    getBaseURL(): string | null;
    /**
     * Initialize the plugin registry with known plugins
     */
    private initializeRegistry;
    /**
     * Load a single plugin by name
     */
    loadPlugin(name: string, options?: PluginLoadOptions): Promise<any>;
    /**
     * Load multiple plugins
     */
    loadPlugins(names: string[], options?: PluginLoadOptions): Promise<any[]>;
    /**
     * Auto-discover and load plugins based on DOM attributes
     */
    autoLoadPlugins(options?: PluginLoadOptions): Promise<void>;
    /**
     * Scan DOM for plugin-specific attributes
     */
    private scanForRequiredPlugins;
    /**
     * Determine plugin name from attribute
     */
    private getPluginFromAttribute;
    /**
     * Actually load a plugin
     */
    private doLoadPlugin;
    /**
     * Detect appropriate CDN based on environment
     */
    private detectCDN;
    /**
     * Fetch and evaluate plugin from URL
     */
    private fetchPlugin;
    /**
     * Load plugin script via different methods
     */
    private loadPluginScript;
    /**
     * Extract plugin name from URL
     */
    private extractPluginNameFromUrl;
    /**
     * Capitalize first letter
     */
    private capitalize;
    /**
     * Find recently added global variables (fallback)
     */
    private findRecentlyAddedGlobal;
    /**
     * Get information about loaded plugins
     */
    getLoadedPlugins(): PluginInfo[];
    /**
     * Check if a plugin is loaded
     */
    isPluginLoaded(name: string): boolean;
    /**
     * Unload a plugin (for testing/cleanup)
     */
    unloadPlugin(name: string): void;
    /**
     * Update registry (for dynamic registry updates)
     */
    updateRegistry(newRegistry: Partial<PluginRegistry>): void;
}
declare const pluginLoader: DatastarPluginLoader;
export default pluginLoader;
export { DatastarPluginLoader };
//# sourceMappingURL=plugin-loader.d.ts.map