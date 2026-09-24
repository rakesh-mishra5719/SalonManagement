import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { AuthScreen } from './src/screens/AuthScreen';
import { CustomerScreen } from './src/screens/CustomerScreen';
import { OwnerScreen } from './src/screens/OwnerScreen';
import { SettingsModal } from './src/screens/SettingsModal';

const AppNavigator: React.FC = () => {
  const { colors, mode } = useTheme();
  const { user, loading } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <View style={[styles.appWrapper, { backgroundColor: colors.background }]}>
        {/* Minimalist Header with Very Small Mode Switch Button & User Info */}
        <Header onOpenSettings={() => setSettingsOpen(true)} />

        {/* Dynamic Role-Based View: Separate and Isolated */}
        <View style={styles.bodyContainer}>
          {!user ? (
            <AuthScreen />
          ) : user.role === 'CLIENT' ? (
            <CustomerScreen />
          ) : (
            <OwnerScreen />
          )}
        </View>

        {/* Glassmorphism & Theme Preferences Modal */}
        <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appWrapper: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
  },
});
