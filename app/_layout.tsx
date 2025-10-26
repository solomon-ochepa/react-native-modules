import { autoModuleRegistry } from '@/modules/core/AutoModuleRegistry';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // // Initialize database
      // await databaseService.initialize();

      console.log('🚀 Starting auto-module discovery...');
      await autoModuleRegistry.discoverAndInitialize();
      console.log('✅ App initialization complete');
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setInitializationError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading modules...</Text>

        {initializationError && (
          <Text style={styles.errorText}>
            Error: {initializationError}
          </Text>
        )}

        {/* Show module loading status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Modules:</Text>
          {autoModuleRegistry.getEnabledModules().map(moduleId => (
            <View key={moduleId} style={styles.moduleStatus}>
              <Text style={styles.moduleName}>{moduleId}</Text>
              <Text style={[
                styles.moduleState,
                { color: autoModuleRegistry.getModuleState(moduleId) === 'enabled' ? 'green' : 'orange' }
              ]}>
                {autoModuleRegistry.getModuleState(moduleId)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 8,
    color: 'red',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  moduleStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    width: 200,
  },
  moduleName: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  moduleState: {
    fontSize: 14,
    fontWeight: '500',
  },
});