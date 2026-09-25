import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { ProfileModal } from './src/components/ProfileModal';
import { SettingsModal } from './src/screens/SettingsModal';
import { BottomTabBar } from './src/components/BottomTabBar';

import { SplashScreen } from './src/components/SplashScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { CustomerScreen } from './src/screens/CustomerScreen';
import { OwnerScreen } from './src/screens/OwnerScreen';

import { ClientPassesView } from './src/components/tabs/ClientPassesView';
import { ClientTrendsView } from './src/components/tabs/ClientTrendsView';
import { ClientSavedView } from './src/components/tabs/ClientSavedView';

import { OwnerScheduleView } from './src/components/tabs/OwnerScheduleView';
import { OwnerServicesView } from './src/components/tabs/OwnerServicesView';
import { OwnerAnalyticsView } from './src/components/tabs/OwnerAnalyticsView';

// Ensure Ionicons web font is injected dynamically so vector icons render cleanly on Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const fontStyleId = 'expo-vector-icons-ionicons';
  if (!document.getElementById(fontStyleId)) {
    const style = document.createElement('style');
    style.id = fontStyleId;
    style.type = 'text/css';
    style.appendChild(
      document.createTextNode(`
        @font-face {
          font-family: 'Ionicons';
          src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
        }
      `)
    );
    document.head.appendChild(style);
  }
}

const AppNavigator: React.FC = () => {
  const { colors, mode } = useTheme();
  const { user, loading } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Splash screen state: show HAJAMM logo while opening app
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashDone, setIsSplashDone] = useState(false);

  // Active tab state: 4 tabs tailored to role
  const [currentTab, setCurrentTab] = useState<string>(() => (user?.role === 'OWNER' ? 'queue' : 'explore'));

  // Reset tab when user role changes
  useEffect(() => {
    if (user?.role === 'OWNER') {
      setCurrentTab('queue');
    } else {
      setCurrentTab('explore');
    }
  }, [user?.role]);

  // When splash duration finishes and auth is done loading, dismiss splash
  useEffect(() => {
    if (isSplashDone && !loading) {
      setShowSplash(false);
    }
  }, [isSplashDone, loading]);

  // Show official HAJAMM logo splash screen while app is opening or restoring auth
  if (showSplash || loading) {
    return (
      <SplashScreen
        minDurationMs={2000}
        onFinish={() => setIsSplashDone(true)}
      />
    );
  }

  const renderClientTabContent = () => {
    switch (currentTab) {
      case 'passes':
        return <ClientPassesView onGoToExplore={() => setCurrentTab('explore')} />;
      case 'trends':
        return <ClientTrendsView onSelectService={() => setCurrentTab('explore')} />;
      case 'saved':
        return <ClientSavedView onSelectSalon={() => setCurrentTab('explore')} />;
      case 'explore':
      default:
        return <CustomerScreen />;
    }
  };

  const renderOwnerTabContent = () => {
    switch (currentTab) {
      case 'schedule':
        return <OwnerScheduleView />;
      case 'services':
        return <OwnerServicesView />;
      case 'analytics':
        return <OwnerAnalyticsView />;
      case 'queue':
      default:
        return <OwnerScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <View style={[styles.appWrapper, { backgroundColor: colors.background }]}>
        {/* Minimalist Header with Very Small Mode Switch Button, Settings & Top-Right Profile Icon */}
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* Dynamic Role-Based View: Separate and Isolated with 4 Menu Tabs */}
        <View style={styles.bodyContainer}>
          {!user ? (
            <AuthScreen />
          ) : user.role === 'CLIENT' ? (
            renderClientTabContent()
          ) : (
            renderOwnerTabContent()
          )}
        </View>

        {/* 4 Menus Bottom Navigation Bar (Visible when user is authenticated) */}
        {user && (
          <BottomTabBar
            role={user.role}
            activeTab={currentTab}
            onSelectTab={(tabId) => setCurrentTab(tabId)}
          />
        )}

        {/* Profile Details & Prominent Logout Modal */}
        <ProfileModal visible={profileOpen} onClose={() => setProfileOpen(false)} />

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
