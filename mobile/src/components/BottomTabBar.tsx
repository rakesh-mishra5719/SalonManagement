import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppIcon } from './AppIcon';
import { UserRole } from '../types';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
}

interface BottomTabBarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ role, activeTab, onSelectTab }) => {
  const { colors, getCardStyle } = useTheme();

  const clientTabs: TabItem[] = [
    { id: 'explore', label: 'Explore', icon: 'search', activeIcon: 'search' },
    { id: 'passes', label: 'My Passes', icon: 'ticket-outline', activeIcon: 'ticket-outline' },
    { id: 'trends', label: 'Trends', icon: 'sparkles-outline', activeIcon: 'sparkles-outline' },
    { id: 'saved', label: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark-outline' },
  ];

  const ownerTabs: TabItem[] = [
    { id: 'queue', label: 'Live Queue', icon: 'list', activeIcon: 'list' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar-outline' },
    { id: 'services', label: 'Services', icon: 'cut', activeIcon: 'cut' },
    { id: 'analytics', label: 'Analytics', icon: 'stats-chart-outline', activeIcon: 'stats-chart-outline' },
  ];

  const tabs = role === 'OWNER' ? ownerTabs : clientTabs;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => onSelectTab(tab.id)}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconWrap,
                isActive && [styles.iconWrapActive, { backgroundColor: colors.accentLight }],
              ]}
            >
              <AppIcon
                name={isActive ? tab.activeIcon : tab.icon}
                size={18}
                color={isActive ? colors.accent : colors.textTertiary}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.textPrimary : colors.textTertiary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
