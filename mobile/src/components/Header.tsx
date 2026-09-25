import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from './AppIcon';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenProfile }) => {
  const { mode, toggleMode, colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <View style={styles.topRow}>
        {/* Brand identity */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandHeaderLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>HAJAMM</Text>
          {/* <View style={[styles.microDot, { backgroundColor: colors.success }]} /> */}
        </View>

        {/* Action Controls */}
        <View style={styles.actionsGroup}>
          {/* USER REQUIREMENT: mode switch button icon will be very small */}
          <TouchableOpacity
            onPress={toggleMode}
            activeOpacity={0.7}
            style={[
              styles.microThemeButton,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.surfaceMuted,
              },
            ]}
            accessibilityLabel="Toggle Theme Mode"
          >
            <AppIcon
              name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
              size={12} // Explicitly very small icon
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Settings button */}
          {/* <TouchableOpacity
            onPress={onOpenSettings}
            activeOpacity={0.7}
            style={[
              styles.settingsButton,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.surfaceMuted,
              },
            ]}
            accessibilityLabel="Settings & Preferences"
          >
            <AppIcon name="options-outline" size={15} color={colors.textPrimary} />
          </TouchableOpacity> */}

          {/* USER REQUIREMENT: Top Right Corner User Icon (Click to open profile details) */}
          {user && (
            <TouchableOpacity
              onPress={onOpenProfile}
              activeOpacity={0.7}
              style={[
                styles.profileButton,
                {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentLight,
                },
              ]}
              accessibilityLabel="View Profile and Account Details"
            >
              <AppIcon name="person-circle-outline" size={18} color={colors.accent} />
            </TouchableOpacity>
          )}

          {/* Direct Logout Button */}
          {/* {user && (
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={[
                styles.logoutButton,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.surfaceMuted,
                },
              ]}
              accessibilityLabel="Sign Out"
            >
              <AppIcon name="log-out-outline" size={15} color={colors.danger} />
            </TouchableOpacity>
          )} */}
        </View>
      </View>

      {/* Authenticated User Status Bar */}
      {/* {user && (
        <View style={styles.userInfoRow}>
          <TouchableOpacity
            onPress={onOpenProfile}
            activeOpacity={0.8}
            style={[
              styles.userPill,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <AppIcon
              name={user.role === 'OWNER' ? 'storefront-outline' : 'person-outline'}
              size={12}
              color={user.role === 'OWNER' ? colors.accent : colors.success}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
              {user.name}
            </Text>
            <View style={[styles.roleTag, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.roleTagText, { color: colors.textPrimary }]}>
                {user.role === 'OWNER' ? 'Owner' : 'Client'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandHeaderLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  microDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // User prompt: "mode switch button icon will be very small"
  microThemeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    maxWidth: '100%',
  },
  userNameText: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
    maxWidth: 180,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
