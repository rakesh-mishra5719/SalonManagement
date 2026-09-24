import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppIcon } from '../AppIcon';

export const OwnerServicesView: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const { user } = useAuth();

  const services = [
    { id: '1', name: 'Signature Haircut', duration: '30 mins', price: '$35', active: true },
    { id: '2', name: 'Beard Trim & Sculpt', duration: '20 mins', price: '$25', active: true },
    { id: '3', name: 'Royal Hot Towel Shave', duration: '25 mins', price: '$30', active: true },
    { id: '4', name: 'Keratin Hair Spa & Wash', duration: '45 mins', price: '$65', active: true },
    { id: '5', name: 'Charcoal Detox Facial', duration: '40 mins', price: '$50', active: true },
    { id: '6', name: 'Hair Color & Highlights', duration: '60 mins', price: '$80', active: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {user?.salon?.name || 'My Salon'} • Services & Menu
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your offered salon services, durations, and pricing
        </Text>
      </View>

      {/* Chairs Capacity Overview */}
      <View
        style={[
          styles.capacityBox,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.capacityRow}>
          <AppIcon name="storefront-outline" size={16} color={colors.accent} />
          <Text style={[styles.capacityTitle, { color: colors.textPrimary }]}>
            Capacity: {user?.salon?.chairsCount || 4} Styling Chairs
          </Text>
        </View>
        <Text style={[styles.capacitySubtitle, { color: colors.textSecondary }]}>
          Supports up to {user?.salon?.chairsCount || 4} simultaneous clients at peak capacity
        </Text>
      </View>

      {services.map((item) => (
        <View key={item.id} style={[styles.serviceCard, getCardStyle()]}>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceNameRow}>
              <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{item.name}</Text>
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: item.active ? colors.accentLight : colors.surfaceMuted },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    { color: item.active ? colors.textPrimary : colors.textTertiary },
                  ]}
                >
                  {item.active ? 'Active' : 'Paused'}
                </Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.timeTag}>
                <AppIcon name="time-outline" size={12} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  {item.duration}
                </Text>
              </View>
              <Text style={[styles.priceText, { color: colors.accent }]}>{item.price}</Text>
            </View>
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
  capacityBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  capacityTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  capacitySubtitle: {
    fontSize: 11,
  },
  serviceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  serviceInfo: {
    gap: 8,
  },
  serviceNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
