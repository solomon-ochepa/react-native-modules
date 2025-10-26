export * from './AuthModule';
export * from './components/LoginForm';
export * from './types';

// Auto-register with the module system
import { ModuleConstructor } from '../core/types';
import { AuthModule } from './AuthModule';

export function getModuleConstructors(): ModuleConstructor[] {
    return [AuthModule];
}