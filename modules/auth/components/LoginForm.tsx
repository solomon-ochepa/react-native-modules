import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moduleRegistry } from '../../core/ModuleRegistry';
import { AuthModule } from '../AuthModule';
import { AuthCredentials } from '../types';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState<AuthCredentials>({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!credentials.email || !credentials.password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            const authModule = moduleRegistry.getModule<AuthModule>('auth');
            if (!authModule) {
                Alert.alert('Error', 'Authentication module not available');
                return;
            }

            const result = await authModule.login(credentials);

            if (result.success) {
                Alert.alert('Success', 'Logged in successfully');
                onSuccess?.();
            } else {
                Alert.alert('Error', result.error || 'Login failed');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={credentials.email}
                    onChangeText={(text) => setCredentials(prev => ({ ...prev, email: text }))}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={credentials.password}
                    onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchButton} onPress={onSwitchToRegister}>
                    <Text style={styles.switchButtonText}>
                        Don't have an account? Sign up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: '#6b7280',
    },
    form: {
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        padding: 16,
        alignItems: 'center',
    },
    switchButtonText: {
        color: '#3b82f6',
        fontSize: 14,
    },
});