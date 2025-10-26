import * as SQLite from 'expo-sqlite';

export interface Account {
    id: string;
    name: string;
    type: 'cash' | 'bank' | 'credit' | 'investment';
    balance: number;
    currency: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    icon: string;
    active: boolean;
    parent_id?: string;
    created_at: string;
}

export interface Budget {
    id: string;
    name: string;
    category_id: string;
    planned_amount: number;
    actual_amount: number;
    period: 'monthly' | 'weekly' | 'yearly';
    start_date: string;
    end_date: string;
    active: boolean;
    created_at: string;
}

export interface Transaction {
    id: string;
    account_id: string;
    category_id: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    recurring: boolean;
    recurring_pattern?: string;
    created_at: string;
}

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;

    async initialize(): Promise<void> {
        this.db = await SQLite.openDatabaseAsync('accountant.db');

        await this.createTables();
    }

    private async createTables(): Promise<void> {
        await this.db?.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        currency VARCHAR NOT NULL DEFAULT 'USD',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFEAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        color VARCHAR NOT NULL,
        icon VARCHAR NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        parent_id VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFEAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR NOT NULL,
        category_id VARCHAR NOT NULL,
        planned_amount REAL NOT NULL,
        actual_amount REAL NOT NULL DEFAULT 0,
        period VARCHAR NOT NULL,
        start_date VARCHAR NOT NULL,
        end_date VARCHAR NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFEAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id CHAR(36) PRIMARY KEY,
        account_id VARCHAR NOT NULL,
        category_id VARCHAR NOT NULL,
        amount REAL NOT NULL,
        type VARCHAR NOT NULL,
        description VARCHAR NOT NULL,
        date VARCHAR NOT NULL,
        recurring INTEGER NOT NULL DEFAULT 0,
        recurring_pattern VARCHAR,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFEAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
    `);
    }

    // Generic CRUD operations
    async executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.getAllAsync(sql, params);
        return result as T[];
    }

    async executeUpdate(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.runAsync(sql, params);
    }
}

export const databaseService = new DatabaseService();