// Type definitions for module.json files
declare module '*/module.json' {
    import { ModuleManifest } from '@/modules/core/types';
    const value: ModuleManifest & { defaultConfig?: any };

    export default value;
}