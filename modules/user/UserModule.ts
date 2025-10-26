import { BaseModule } from '../core/BaseModule';
import { ModuleDefinition } from '../core/types';
import { CreateUserData, UpdateUserData, User, UserStats } from './types';

export class UserModule extends BaseModule {
    private currentUser: User | null = null;
    private users: Map<string, User> = new Map();

    constructor(definition: ModuleDefinition) {
        super(definition);
    }

    async initialize(): Promise<void> {
        await super.initialize();

        const { autoCreateDemoUser } = this.getConfig('settings');

        if (autoCreateDemoUser) {
            await this.initializeDefaultUser();
        }

        console.log(`👤 ${this.getManifest().name} ready!`);
    }

    private async initializeDefaultUser(): Promise<void> {
        const { defaultCurrency, defaultLanguage } = this.getConfig('settings');

        // const defaultUserPreferences: UserPreferences = {
        //     currency: defaultCurrency,
        //     language: defaultLanguage,
        //     dateFormat: 'MM/DD/YYYY',
        //     budgetAlertThreshold: 0.8,
        //     theme: 'auto',
        //     notifications: {
        //         email: true,
        //         push: true,
        //         budgetAlerts: true
        //     }
        // };

        const defaultUser: User = {
            id: 'user_1',
            first_name: 'Demo',
            last_name: 'User',
            email: 'demo@accountant.app',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.users.set(defaultUser.id, defaultUser);
        this.currentUser = defaultUser;

        console.log('🎭 Demo user created');
    }

    // Public API
    async createUser(userData: CreateUserData): Promise<User> {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const { defaultCurrency, defaultLanguage } = this.getConfig('settings');

        // const defaultPreferences: UserPreferences = {
        //     currency: defaultCurrency,
        //     language: defaultLanguage,
        //     dateFormat: 'MM/DD/YYYY',
        //     budgetAlertThreshold: 0.8,
        //     theme: 'auto',
        //     notifications: {
        //         email: true,
        //         push: true,
        //         budgetAlerts: true
        //     },
        //     ...userData.preferences
        // };

        const user: User = {
            id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            created_at: now,
            updated_at: now
        };

        this.users.set(id, user);

        if (!this.currentUser) {
            this.currentUser = user;
        }

        return user;
    }

    async getUser(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async getCurrentUser(): Promise<User | null> {
        return this.currentUser;
    }

    async updateUser(id: string, updates: UpdateUserData): Promise<User | null> {
        const user = this.users.get(id);
        if (!user) return null;

        const updatedUser: User = {
            ...user,
            ...updates,
            updated_at: new Date().toISOString()
        };

        this.users.set(id, updatedUser);

        if (this.currentUser?.id === id) {
            this.currentUser = updatedUser;
        }

        return updatedUser;
    }

    async deleteUser(id: string): Promise<boolean> {
        if (this.currentUser?.id === id) {
            this.currentUser = null;
        }
        return this.users.delete(id);
    }

    async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
        const user = await this.getUser(userId);
        if (!user) return null;

        const updatedPreferences: UserPreferences = {
            ...user.preferences,
            ...preferences
        };

        await this.updateUser(userId, { preferences: updatedPreferences });
        return updatedPreferences;
    }

    async getUserStats(userId: string): Promise<UserStats | null> {
        const user = await this.getUser(userId);
        if (!user) return null;

        return {
            totalAccounts: 3,
            totalTransactions: 47,
            monthlyBudget: 500000,
            netWorth: 1500000,
            // activeSince: user.created_at
        };
    }

    // Feature flags
    isBiometricAuthEnabled(): boolean {
        return this.getConfig('features.biometricAuth');
    }

    isSocialLoginEnabled(): boolean {
        return this.getConfig('features.socialLogin');
    }

    isTwoFactorAuthEnabled(): boolean {
        return this.getConfig('features.twoFactorAuth');
    }

    validatePassword(password: string): string | null {
        const policy = this.getConfig('settings.passwordPolicy');

        if (password.length < policy.minLength) {
            return `Password must be at least ${policy.minLength} characters`;
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            return 'Password must contain uppercase letters';
        }

        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            return 'Password must contain lowercase letters';
        }

        if (policy.requireNumbers && !/\d/.test(password)) {
            return 'Password must contain numbers';
        }

        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'Password must contain special characters';
        }

        return null;
    }

    isAvailable(): boolean {
        return this.definition.config.enabled && this.users.size >= 0;
    }
}