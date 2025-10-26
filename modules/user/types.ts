export interface User {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface CreateUserData {
    first_name: string;
    last_name: string;
    username?: string;
    email: string;
    password: string;
}

export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    username?: string;
}

export interface UserStats {
    totalAccounts: number;
    totalTransactions: number;
    monthlyBudget: number;
    netWorth: number;
}