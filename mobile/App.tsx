import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Platform, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { CustomerScreen } from './src/screens/CustomerScreen';
import { OwnerScreen } from './src/screens/OwnerScreen';
import { SettingsModal } from './src/screens/SettingsModal';

const MainScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const { role } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <View style={[styles.appWrapper, { backgroundColor: colors.background }]}>
        {/* Minimalist Header with Very Small Mode Switch Button */}
        <Header onOpenSettings={() => setSettingsOpen(true)} />

        {/* Dynamic Dual-Role Screen: Customer Explore vs Salon Owner Portal */}
        <View style={styles.bodyContainer}>
          {role === 'customer' ? <CustomerScreen /> : <OwnerScreen />}
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
      <AppProvider>
        <MainScreen />
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
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
