import { Module, ModuleConfig, ModuleDefinition } from './types';

export abstract class BaseModule implements Module {
    definition: ModuleDefinition;

    constructor(definition: ModuleDefinition) {
        this.definition = definition;
    }

    async initialize(): Promise<void> {
        console.log(`🔄 Initializing module: ${this.definition.manifest.name}`);
    }

    isAvailable(): boolean {
        return this.definition.config.enabled;
    }

    getState(): 'enabled' | 'disabled' | 'loading' | 'error' {
        return this.definition.config.enabled ? 'enabled' : 'disabled';
    }

    async cleanup(): Promise<void> {
        console.log(`🧹 Cleaning up module: ${this.definition.manifest.name}`);
    }

    // Configuration management
    getConfig<T = any>(key?: string): T {
        if (!key) {
            return this.definition.config as T;
        }

        const keys = key.split('.');
        let value: any = this.definition.config;

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        return value as T;
    }

    async updateConfig(config: Partial<ModuleConfig>): Promise<void> {
        this.definition.config = {
            ...this.definition.config,
            ...config
        };
        console.log(`⚙️  Updated config for: ${this.definition.manifest.name}`);
    }

    // Helper methods
    protected getManifest() {
        return this.definition.manifest;
    }

    protected getModuleId(): string {
        return this.definition.manifest.id;
    }

    protected getVersion(): string {
        return this.definition.manifest.version;
    }
}