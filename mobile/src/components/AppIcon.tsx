import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Fallback visual glyphs in case web fonts are loading or blocked
const glyphFallbacks: Record<string, string> = {
  'moon': '🌙',
  'moon-outline': '🌙',
  'sunny': '☀️',
  'sunny-outline': '☀️',
  'star': '★',
  'options-outline': '⚙',
  'person': '👤',
  'person-outline': '👤',
  'person-circle-outline': '👤',
  'storefront-outline': '🏪',
  'log-out-outline': '⎋',
  'location': '📍',
  'location-outline': '📍',
  'navigate': '➤',
  'navigate-outline': '➤',
  'map': '🗺',
  'map-outline': '🗺',
  'list': '☰',
  'time-outline': '⏱',
  'cut': '✂',
  'pause': '⏸',
  'shield-checkmark-outline': '🛡',
  'checkmark-done': '✓',
  'checkmark-circle': '✓',
  'checkmark-circle-outline': '✓',
  'alert-circle': '!',
  'close': '✕',
  'close-circle': '✕',
  'search': '🔍',
  'calendar-outline': '📅',
  'bookmark-outline': '🔖',
  'pricetag-outline': '🏷',
  'stats-chart-outline': '📊',
  'sparkles-outline': '✨',
  'square-outline': '◻',
  'layers-outline': '≡',
  'ticket-outline': '🎟',
  'heart-outline': '♡',
  'heart': '♥',
};

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 18, color = '#000000', style }) => {
  try {
    return <Ionicons name={name as any} size={size} color={color} style={style} />;
  } catch (_) {
    const fallback = glyphFallbacks[name] || '•';
    return (
      <Text style={[{ fontSize: size * 0.85, color, lineHeight: size }, style]}>
        {fallback}
      </Text>
    );
  }
};
