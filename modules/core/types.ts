// Module manifest - defines the module's identity and properties
export interface ModuleManifest {
    id: string;
    name: string;
    description: string;
    version: string;
    author?: string;
    repository?: string;
    dependencies?: string[];
    priority?: number;
    requires?: string[]; // System requirements
    permissions?: string[]; // Required permissions
    tags?: string[]; // Module categories/tags
}

// Module configuration - runtime configurable settings
export interface ModuleConfig {
    enabled: boolean;
    settings?: {
        [key: string]: any;
    };
    features?: {
        [key: string]: boolean;
    };
}

// Combined module definition
export interface ModuleDefinition {
    manifest: ModuleManifest;
    config: ModuleConfig;
}

// Module instance interface
export interface Module {
    definition: ModuleDefinition;
    initialize: () => Promise<void>;
    isAvailable: () => boolean;
    getState: () => 'enabled' | 'disabled' | 'loading' | 'error';
    cleanup?: () => Promise<void>;
    getConfig?: <T = any>(key?: string) => T;
    updateConfig?: (config: Partial<ModuleConfig>) => Promise<void>;
}

export interface ModuleConstructor {
    new(definition: ModuleDefinition): Module;
}