// export * from './components/UserProfile';
export * from './types';
export * from './UserModule';

// Auto-register with the module system
import { ModuleConstructor } from '../core/types';
import { UserModule } from './UserModule';

// This function will be called by the module loader
export function getModuleConstructors(): ModuleConstructor[] {
    return [UserModule];
}