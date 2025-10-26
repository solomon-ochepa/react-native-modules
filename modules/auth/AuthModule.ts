import { BaseModule } from '../core/BaseModule';
import { ModuleDefinition } from '../core/types';
import {
    AuthCredentials,
    AuthResponse,
    AuthSession
} from './types';

export class AuthModule extends BaseModule {
    private sessions: Map<string, AuthSession> = new Map();
    private currentSession: AuthSession | null = null;
    private loginAttempts: Map<string, number> = new Map();
    private lockouts: Map<string, number> = new Map();

    constructor(definition: ModuleDefinition) {
        super(definition);
    }

    async initialize(): Promise<void> {
        await super.initialize();

        if (!this.isAvailable()) {
            throw new Error('User module dependency not available');
        }

        console.log(`🔐 ${this.getManifest().name} ready!`);
    }

    async login(credentials: AuthCredentials): Promise<AuthResponse> {
        // Check if user is locked out
        if (this.isUserLockedOut(credentials.email)) {
            return {
                success: false,
                error: 'Account temporarily locked. Please try again later.'
            };
        }

        // Check login attempts
        const attempts = this.loginAttempts.get(credentials.email) || 0;
        const maxAttempts = this.getConfig('settings.maxLoginAttempts');

        if (attempts >= maxAttempts) {
            this.lockoutUser(credentials.email);
            return {
                success: false,
                error: 'Account locked due to too many failed attempts'
            };
        }

        if (!credentials.email || !credentials.password) {
            return {
                success: false,
                error: 'Email and password are required'
            };
        }

        // Simulate authentication
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock authentication - in real app, validate against stored credentials
        if (credentials.password.length < 6) {
            this.loginAttempts.set(credentials.email, attempts + 1);
            return {
                success: false,
                error: 'Invalid credentials'
            };
        }

        // Reset attempts on success
        this.loginAttempts.delete(credentials.email);
        this.lockouts.delete(credentials.email);

        // Create session
        const sessionTimeout = this.getConfig('settings.sessionTimeout');
        const session: AuthSession = {
            userId: `user_${Date.now()}`,
            token: this.generateToken(),
            expiresAt: new Date(Date.now() + (sessionTimeout * 1000)).toISOString(),
            createdAt: new Date().toISOString(),
            deviceInfo: this.getDeviceInfo()
        };

        this.sessions.set(session.userId, session);
        this.currentSession = session;

        return {
            success: true,
            user: { id: session.userId, email: credentials.email },
            token: session.token,
            session
        };
    }

    async logout(): Promise<boolean> {
        if (this.currentSession) {
            this.sessions.delete(this.currentSession.userId);
            this.currentSession = null;
        }
        return true;
    }

    async register(credentials: AuthCredentials & {
        firstName: string;
        lastName: string;
    }): Promise<AuthResponse> {
        const userModule = this.getUserModule();
        if (!userModule) {
            return {
                success: false,
                error: 'User module not available'
            };
        }

        // Validate password
        const passwordError = userModule.validatePassword(credentials.password);
        if (passwordError) {
            return {
                success: false,
                error: passwordError
            };
        }

        try {
            // Create user
            const user = await userModule.createUser({
                email: credentials.email,
                firstName: credentials.firstName,
                lastName: credentials.lastName,
                password: credentials.password
            });

            // Auto-login
            const loginResponse = await this.login(credentials);

            return loginResponse;
        } catch (error) {
            return {
                success: false,
                error: 'Registration failed'
            };
        }
    }

    async getCurrentSession(): Promise<AuthSession | null> {
        return this.currentSession;
    }

    async isAuthenticated(): Promise<boolean> {
        if (!this.currentSession) return false;

        const now = new Date();
        const expiresAt = new Date(this.currentSession.expiresAt);

        // Auto-logout if enabled and expired
        if (this.getConfig('features.autoLogout') && now >= expiresAt) {
            await this.logout();
            return false;
        }

        return now < expiresAt;
    }

    async refreshToken(): Promise<string | null> {
        if (!this.currentSession) return null;

        const tokenRefreshInterval = this.getConfig('settings.tokenRefreshInterval');
        if (!tokenRefreshInterval) {
            return this.currentSession.token;
        }

        const newToken = this.generateToken();

        this.currentSession.token = newToken;
        this.currentSession.expiresAt = new Date(
            Date.now() + (this.getConfig('settings.sessionTimeout') * 1000)
        ).toISOString();

        return newToken;
    }

    // Security features
    isBiometricAuthAvailable(): boolean {
        return this.getConfig('features.biometricAuth');
    }

    isTwoFactorAuthEnabled(): boolean {
        return this.getConfig('features.twoFactorAuth');
    }

    isSocialLoginEnabled(): boolean {
        return this.getConfig('features.socialLogin');
    }

    // Private helpers
    private generateToken(): string {
        return `token_${Math.random().toString(36).substr(2)}_${Date.now()}`;
    }

    private isUserLockedOut(email: string): boolean {
        const lockoutTime = this.lockouts.get(email);
        if (!lockoutTime) return false;

        const lockoutDuration = this.getConfig('settings.lockoutDuration');
        return Date.now() - lockoutTime < (lockoutDuration * 1000);
    }

    private lockoutUser(email: string): void {
        this.lockouts.set(email, Date.now());
    }

    private getDeviceInfo(): any {
        // In real app, collect device information
        return {
            userAgent: 'mobile-app',
            platform: 'react-native',
            timestamp: new Date().toISOString()
        };
    }

    private getUserModule() {
        const { moduleRegistry } = require('../core/ModuleRegistry');
        return moduleRegistry.getModule<any>('user');
    }

    isAvailable(): boolean {
        const { moduleRegistry } = require('../core/ModuleRegistry');
        return moduleRegistry.isModuleAvailable('user');
    }
}