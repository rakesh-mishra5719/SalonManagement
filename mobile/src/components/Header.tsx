import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { mode, toggleMode, colors, getCardStyle } = useTheme();
  const { role, setRole } = useApp();

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      <View style={styles.topRow}>
        {/* Brand identity */}
        <View style={styles.brandContainer}>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>AURA</Text>
          <View style={[styles.microDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>SALON ATELIER</Text>
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
            <Ionicons
              name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
              size={12} // Explicitly very small icon
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Settings button */}
          <TouchableOpacity
            onPress={onOpenSettings}
            activeOpacity={0.7}
            style={[
              styles.settingsButton,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.surfaceMuted,
              },
            ]}
            accessibilityLabel="Settings & Design Pattern"
          >
            <Ionicons name="options-outline" size={15} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switcher Pill Bar (User / Customer vs Salon Owner) */}
      <View style={styles.roleBarContainer}>
        <View style={[styles.roleSwitchBackground, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRole('customer')}
            style={[
              styles.roleTab,
              role === 'customer' && [
                styles.roleTabActive,
                { backgroundColor: colors.accent, shadowColor: colors.accent },
              ],
            ]}
          >
            <Ionicons
              name="person-outline"
              size={12}
              color={role === 'customer' ? colors.accentText : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.roleTabText,
                {
                  color: role === 'customer' ? colors.accentText : colors.textSecondary,
                  fontWeight: role === 'customer' ? '600' : '400',
                },
              ]}
            >
              Customer / Explore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRole('owner')}
            style={[
              styles.roleTab,
              role === 'owner' && [
                styles.roleTabActive,
                { backgroundColor: colors.accent, shadowColor: colors.accent },
              ],
            ]}
          >
            <Ionicons
              name="storefront-outline"
              size={12}
              color={role === 'owner' ? colors.accentText : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.roleTabText,
                {
                  color: role === 'owner' ? colors.accentText : colors.textSecondary,
                  fontWeight: role === 'owner' ? '600' : '400',
                },
              ]}
            >
              Salon Owner Portal
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  roleBarContainer: {
    alignItems: 'center',
  },
  roleSwitchBackground: {
    flexDirection: 'row',
    borderRadius: 100,
    padding: 3,
    borderWidth: 1,
    width: '100%',
    maxWidth: 360,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 100,
  },
  roleTabActive: {
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  roleTabText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
