import * as FileSystem from 'expo-file-system';
import { Module, ModuleDefinition } from './types';

interface File {
    readonly name: string;
}

interface ModuleRegistry {
    [key: string]: boolean;
}

export class AutoModuleRegistry {
    private modules: Map<string, Module> = new Map();
    private moduleDefinitions: Map<string, ModuleDefinition> = new Map();
    private globalConfig: any = {};
    private moduleRegistry: ModuleRegistry = {};
    private readonly dynamicImport: (path: string) => Promise<any> = new Function('path', 'return require(path);') as (path: string) => Promise<any>;

    async discoverAndInitialize(): Promise<void> {
        console.log('🚀 Starting auto-module discovery...');

        // Load module registry first
        await this.loadModuleRegistry();

        // Load global configuration
        await this.loadGlobalConfig();

        const enabledModules = Object.keys(this.moduleRegistry).filter(id => this.moduleRegistry[id]);
        console.log(`📋 Found ${enabledModules.length} enabled modules:`, enabledModules);

        // Load all enabled modules
        for (const moduleId of enabledModules) {
            try {
                await this.loadModule(moduleId);
            } catch (error) {
                console.warn(`Failed to load module ${moduleId}:`, error);
            }
        }

        // Initialize all loaded modules
        await this.initializeModules();
    }

    private async loadModuleRegistry(): Promise<void> {
        try {
            const registry = require('@/modules/modules.json');
            this.moduleRegistry = registry;
            console.log('📋 Loaded module registry:', this.moduleRegistry);
        } catch (error) {
            console.warn('❌ Could not load module registry:', error);
            // Fallback to hardcoded registry
            this.moduleRegistry = {
                user: false,
                auth: false
            };
        }
    }

    private async loadGlobalConfig(): Promise<void> {
        try {
            const config = require('@/modules/config/modules.json');
            this.globalConfig = config;
            console.log('📋 Loaded global modules configuration');
        } catch (error) {
            console.warn('❌ Could not load global modules configuration:', error);
            this.globalConfig = {
                moduleDefaults: { enabled: true }
            };
        }
    }

    private async loadModule(moduleId: string): Promise<void> {
        try {
            console.log(`📦 Loading module: ${moduleId}`);

            // Check if module files exist before importing
            const moduleExists = await this.moduleHas(moduleId);

            if (!moduleExists) {
                console.warn(`⚠️ Module ${moduleId} not found, skipping`);
                return;
            }

            // Use static imports with known paths
            const [manifest, config, moduleIndex] = await Promise.all([
                this.safeStaticImport(moduleId, 'manifest'),
                this.safeStaticImport(moduleId, 'config'),
                this.safeStaticImport(moduleId, 'index')
            ]);

            if (moduleIndex?.getModuleConstructors) {
                const constructors = moduleIndex.getModuleConstructors();

                for (const ModuleConstructor of constructors) {
                    const definition = this.buildModuleDefinition(
                        moduleId,
                        manifest,
                        config
                    );

                    const moduleInstance = new ModuleConstructor(definition);
                    this.modules.set(moduleId, moduleInstance);
                    this.moduleDefinitions.set(moduleId, definition);

                    console.log(`✅ Successfully loaded module: ${moduleId}`);
                }
            } else {
                console.warn(`⚠️ Module ${moduleId} has no constructors`);
            }
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleId}:`, error);
        }
    }

    /**
     * Checks if a specified directory and its files (if provided) exist.
     * This is a static method and does not require an instance of the class.
     * @param {string} module - The directory path relative to the app's document directory.
     * @param {string[]} [paths] - An optional array of file paths to check for within the directory.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the directory
     * and all specified files exist, otherwise `false`.
    */
    public async moduleHas(module: string, paths?: string[]): Promise<boolean> {
        const exists = await this.moduleExists(module);
        if (!exists) {
            console.log('Module not found: ' + module);

            return false;
        }

        if (!paths || paths.length === 0) {
            return true;
        }

        try {
            for (const fileName of paths) {
                const filePath = this.modulePath(module, fileName);
                if (!filePath) {
                    console.log('Document directory unavailable.');
                    console.log('paths: ' + paths);
                    return false;
                }
                const fileInfo = await new FileSystem.File(filePath);
                if (!fileInfo.exists) {
                    console.log(`File "${filePath}" does not exist or is a directory.`);
                    return false;
                }
            }

            // All checks passed
            return true;

        } catch (error) {
            console.error('Error checking file system:', error);
            return false;
        }
    }

    private async moduleExists(module: string): Promise<boolean> {
        const directoryPath = this.modulePath(module);
        if (!directoryPath) {
            console.log('Module doesn\'t exists: ' + module);
            return false;
        }

        console.log('Module path: ' + directoryPath);

        try {
            const directoryInfo = await new FileSystem.Directory(directoryPath);
            if (!directoryInfo.exists) {
                console.log(`Module "${directoryPath}" does not exist.`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking file system:', error);
            return false;
        }
    }

    private modulePath(module: string): string;
    private modulePath(module: string, path: File): string;
    private modulePath(module: string, path: string): string;
    private modulePath(module: string, path: File | string = ''): string {
        const baseDirectory = FileSystem.documentDirectory;
        if (!baseDirectory) {
            return '';
        }

        const modulesPath = '@/modules/';
        const fileName = typeof path === 'string' ? path : path?.name;
        const suffix = fileName ? `/${fileName}` : '';
        return `${baseDirectory}${modulesPath}${module}${suffix}`;
    }

    private async safeStaticImport(moduleId: string, fileType: 'manifest' | 'config' | 'index'): Promise<any> {
        let path: string;
        let requiredFiles: string[];

        switch (fileType) {
            case 'manifest':
                path = `../${moduleId}/module.json`;
                requiredFiles = ['module.json'];
                break;
            case 'config':
                path = `../${moduleId}/config/${moduleId}.json`;
                requiredFiles = [`config/${moduleId}.json`];
                break;
            case 'index':
                path = `../${moduleId}/index`;
                requiredFiles = ['index.js', 'index.ts']; // Check for common index file extensions
                break;
        }

        try {
            // Check for existence of module directory and files before attempting to require
            const modulePathExists = await this.moduleHas(moduleId, requiredFiles);
            if (modulePathExists) {
                const module = await this.dynamicImport(path);
                return module.default || module;
            } else {
                console.log(`📄 ${fileType} for module ${moduleId} not found, using defaults`);
                return {};
            }
        } catch (error) {
            console.log(`📄 ${fileType} not found for module ${moduleId}, using defaults`);
            console.error(error);
            return {};
        }
    }

    private buildModuleDefinition(
        moduleId: string,
        manifest: any,
        config: any
    ): ModuleDefinition {
        const globalModuleConfig = this.globalConfig.modules?.[moduleId] || {};
        const moduleDefaults = this.globalConfig.moduleDefaults || {};

        return {
            manifest: {
                id: moduleId,
                name: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
                description: `Auto-discovered ${moduleId} module`,
                version: '1.0.0',
                ...manifest // Override with actual manifest if available
            },
            config: {
                enabled: this.moduleRegistry[moduleId] === true,
                settings: {
                    ...moduleDefaults.settings,
                    ...globalModuleConfig.settings,
                    ...config?.settings
                },
                features: {
                    ...moduleDefaults.features,
                    ...globalModuleConfig.features,
                    ...config?.features
                }
            }
        };
    }

    private async initializeModules(): Promise<void> {
        console.log('🔄 Initializing modules...');

        // Sort modules by priority
        const sortedModules = Array.from(this.modules.entries())
            .sort(([aName, aModule], [bName, bModule]) => {
                const aPriority = aModule.definition.manifest.priority || 100;
                const bPriority = bModule.definition.manifest.priority || 100;
                return aPriority - bPriority;
            });

        for (const [name, module] of sortedModules) {
            if (module.definition.config.enabled && module.isAvailable()) {
                try {
                    console.log(`🔄 Initializing: ${name}`);
                    await module.initialize();
                    console.log(`✅ Initialized: ${name}`);
                } catch (error) {
                    console.error(`❌ Failed to initialize ${name}:`, error);
                    module.definition.config.enabled = false;
                }
            } else {
                console.log(`⏸️  Skipping disabled module: ${name}`);
            }
        }

        console.log('🎉 All modules initialized');
    }

    getModule<T extends Module>(name: string): T | undefined {
        return this.modules.get(name) as T;
    }

    isModuleAvailable(name: string): boolean {
        const module = this.modules.get(name);
        return !!module && module.definition.config.enabled && module.isAvailable();
    }

    getAllModules(): Module[] {
        return Array.from(this.modules.values());
    }

    getAllModuleDefinitions(): ModuleDefinition[] {
        return Array.from(this.moduleDefinitions.values());
    }

    getModuleState(name: string): string {
        const module = this.modules.get(name);
        return module ? module.getState() : this.moduleRegistry[name] ? 'not-loaded' : 'disabled';
    }

    getModuleRegistry(): ModuleRegistry {
        return this.moduleRegistry;
    }

    getEnabledModules(): string[] {
        return Object.keys(this.moduleRegistry).filter(id => this.moduleRegistry[id]);
    }

    async cleanupAll(): Promise<void> {
        console.log('🧹 Cleaning up all modules...');

        for (const [name, module] of this.modules) {
            if (module.cleanup) {
                try {
                    await module.cleanup();
                    console.log(`🧹 Cleaned up: ${name}`);
                } catch (error) {
                    console.error(`❌ Failed to cleanup ${name}:`, error);
                }
            }
        }

        this.modules.clear();
        this.moduleDefinitions.clear();
    }
}

export const autoModuleRegistry = new AutoModuleRegistry();