import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AppIcon } from '../AppIcon';
import { Ionicons } from '@expo/vector-icons';

interface ClientPassesViewProps {
  onGoToExplore: () => void;
}

export const ClientPassesView: React.FC<ClientPassesViewProps> = ({ onGoToExplore }) => {
  const { colors, getCardStyle } = useTheme();
  const { user } = useAuth();
  const { activeBooking, setActiveBooking, salons } = useApp();

  const bookedSalon = activeBooking
    ? salons.find((s) => s.id === activeBooking.salonId)
    : null;

  const handleOpenGoogleMaps = () => {
    if (!activeBooking) return;
    const s = activeBooking.salon || salons.find((item) => item.id === activeBooking.salonId);
    const lat = activeBooking.latitude || s?.latitude || 12.9716;
    const lng = activeBooking.longitude || s?.longitude || 77.5946;
    const label = encodeURIComponent(activeBooking.salonName || s?.name || 'Salon');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open Google Maps:', err);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Booking Passes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Show your 6-digit arrival code at the salon reception
        </Text>
      </View>

      {/* Active Pass Card */}
      {activeBooking ? (
        <View style={[styles.passCard, getCardStyle()]}>
          <View style={styles.passHeader}>
            <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.statusText, { color: colors.textPrimary }]}>ACTIVE PASS</Text>
            </View>
            <Text style={[styles.salonCategory, { color: colors.textTertiary }]}>
              {activeBooking.salon?.category || bookedSalon?.category || 'HAIR & GROOMING'}
            </Text>
          </View>

          {/* Booked Salon Name */}
          <Text style={[styles.passSalonName, { color: colors.textPrimary }]}>
            {activeBooking.salonName || activeBooking.salon?.name || bookedSalon?.name || 'HAJAMM Partner Salon'}
          </Text>

          {/* Booked Salon Address */}
          <Text style={[styles.passSalonAddress, { color: colors.textSecondary }]}>
            📍 {activeBooking.salonAddress || activeBooking.salon?.address || bookedSalon?.address || 'Address provided at booking'}
          </Text>

          {/* 6-Digit Code Highlight */}
          <View
            style={[
              styles.codeBox,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>
              YOUR 6-DIGIT ARRIVAL CODE
            </Text>
            <Text style={[styles.codeValue, { color: colors.accent }]}>
              {activeBooking.verificationCode || '849201'}
            </Text>
            <Text style={[styles.codeHint, { color: colors.textTertiary }]}>
              Share this code with the salon owner upon arrival
            </Text>
          </View>

          {/* Pass Meta */}
          <View style={[styles.metaRow, { borderTopColor: colors.divider }]}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>SERVICE</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {activeBooking.serviceName || 'Signature Styling'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>QUEUE POSITION</Text>
              <Text style={[styles.metaValue, { color: colors.accent }]}>
                #{activeBooking.queuePosition || 1}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>SLOT TIME</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {activeBooking.slotTime || 'Scheduled'}
              </Text>
            </View>
          </View>

          {/* Real Google Maps Navigation Button */}
          <TouchableOpacity
            onPress={handleOpenGoogleMaps}
            style={styles.directionsBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.directionsBtnText}>Navigate to Salon (Google Maps)</Text>
          </TouchableOpacity>

          {/* Dismiss Pass Button */}
          <TouchableOpacity
            onPress={() => setActiveBooking(null)}
            style={[styles.dismissPassBtn, { borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.dismissPassText, { color: colors.textSecondary }]}>
              Dismiss / Complete Pass
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder },
          ]}
        >
          <AppIcon name="ticket-outline" size={40} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Active Pass</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You haven't reserved a slot yet today. Explore nearby salons to book your slot instantly.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: colors.accent }]}
            onPress={onGoToExplore}
            activeOpacity={0.8}
          >
            <Text style={[styles.exploreBtnText, { color: colors.accentText }]}>
              Explore Salons Nearby
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Past Visit History */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Past Visits</Text>

        {[
          {
            salon: 'The Crown Luxury Salon',
            service: 'Hair Styling & Beard Sculpt',
            date: 'Yesterday, 4:30 PM',
            code: '719302',
            status: 'Completed',
          },
          {
            salon: 'En Vogue Hair Studio',
            service: 'Signature Haircut',
            date: 'Last Saturday, 11:00 AM',
            code: '582910',
            status: 'Completed',
          },
        ].map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.historyItem,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.historyTop}>
              <Text style={[styles.historySalon, { color: colors.textPrimary }]}>{item.salon}</Text>
              <View style={[styles.historyBadge, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.historyBadgeText, { color: colors.success }]}>
                  ✓ {item.status}
                </Text>
              </View>
            </View>
            <Text style={[styles.historyService, { color: colors.textSecondary }]}>
              {item.service}
            </Text>
            <View style={styles.historyBottom}>
              <Text style={[styles.historyDate, { color: colors.textTertiary }]}>{item.date}</Text>
              <Text style={[styles.historyCode, { color: colors.textTertiary }]}>
                Code: {item.code}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
  passCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  salonCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  passSalonName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  passSalonAddress: {
    fontSize: 12,
    marginBottom: 16,
  },
  codeBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    marginVertical: 4,
  },
  codeHint: {
    fontSize: 11,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  directionsBtn: {
    backgroundColor: '#9A6B39',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
    shadowColor: '#9A6B39',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dismissPassBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dismissPassText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  historySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  historyItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historySalon: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyService: {
    fontSize: 11,
    marginBottom: 8,
  },
  historyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 10,
  },
  historyCode: {
    fontSize: 10,
    fontWeight: '600',
  },
});
