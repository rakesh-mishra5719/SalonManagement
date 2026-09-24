import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { AppIcon } from '../AppIcon';

interface ClientSavedViewProps {
  onSelectSalon: (salonId: number) => void;
}

export const ClientSavedView: React.FC<ClientSavedViewProps> = ({ onSelectSalon }) => {
  const { colors, getCardStyle } = useTheme();
  const { salons } = useApp();

  // Favorite / saved salons (e.g. first 2 salons as demo saved)
  const savedSalons = salons.slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Saved Salons</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your preferred salons for instant priority slot booking
        </Text>
      </View>

      {savedSalons.map((salon) => (
        <View key={salon.id} style={[styles.card, getCardStyle()]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.salonName, { color: colors.textPrimary }]}>{salon.name}</Text>
              <Text style={[styles.category, { color: colors.textSecondary }]}>
                {salon.category || 'Luxury Hair Studio'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: salon.isOpen ? colors.success : colors.danger },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.textPrimary }]}>
                {salon.isOpen ? 'Open Now' : 'Closed'}
              </Text>
            </View>
          </View>

          <Text style={[styles.address, { color: colors.textSecondary }]}>
            📍 {salon.address}
          </Text>

          <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
            <View style={styles.ratingWrap}>
              <AppIcon name="star" size={13} color="#FBBF24" />
              <Text style={[styles.ratingText, { color: colors.textPrimary }]}>
                {salon.rating || 4.9}
              </Text>
              <Text style={[styles.waitingText, { color: colors.textTertiary }]}>
                · {salon.waitingCount || 0} in line
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.accent }]}
              onPress={() => onSelectSalon(salon.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.bookBtnText, { color: colors.accentText }]}>
                Book Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '800',
  },
  category: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  address: {
    fontSize: 12,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  waitingText: {
    fontSize: 11,
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
