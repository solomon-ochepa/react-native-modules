export interface AuthCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: any;
    token?: string;
    error?: string;
}

export interface AuthSession {
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
}