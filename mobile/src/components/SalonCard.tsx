import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { Salon } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SalonCardProps {
  salon: Salon;
  onBook: (salon: Salon) => void;
  onSelect: (salon: Salon) => void;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon, onBook, onSelect }) => {
  const { colors, getCardStyle } = useTheme();

  const handleOpenGoogleMaps = () => {
    const lat = salon.latitude;
    const lng = salon.longitude;
    const label = encodeURIComponent(salon.name);
    // Universal Google Maps navigation URL
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open Google Maps:', err);
    });
  };

  const waitDots = Array.from({ length: Math.min(salon.waitingCount || 0, 5) });

  return (
    <View style={[styles.cardContainer, getCardStyle()]}>
      {/* Image Banner */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              salon.imageUrl ||
              'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
          }}
          style={styles.image}
        />
        {/* Rating Pill */}
        <View style={[styles.badgeRating, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]}>
          <Ionicons name="star" size={11} color="#FBBF24" style={{ marginRight: 3 }} />
          <Text style={styles.badgeRatingText}>{salon.rating ? salon.rating.toFixed(1) : '4.8'}</Text>
        </View>

        {/* Nearest & Quickest Highlight Badge */}
        {salon.distanceKm !== undefined && salon.distanceKm <= 2.0 && (salon.waitingCount || 0) <= 1 && (
          <View style={styles.badgeFastest}>
            <Ionicons name="flash" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.badgeFastestText}>Nearest & Fastest</Text>
          </View>
        )}

        {/* Status Pill */}
        <View
          style={[
            styles.badgeStatus,
            { backgroundColor: salon.isOpen ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)' },
          ]}
        >
          <View style={styles.statusPulse} />
          <Text style={styles.badgeStatusText}>{salon.isOpen ? 'Open Now' : 'Closed'}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
              {salon.name}
            </Text>
            <Text style={[styles.category, { color: colors.textSecondary }]}>
              {salon.category || 'Luxury Grooming'}
            </Text>
          </View>
          {salon.distanceKm !== undefined && (
            <View style={[styles.distancePill, { backgroundColor: colors.accentLight, borderColor: colors.cardBorder, borderWidth: 1 }]}>
              <Ionicons name="navigate" size={11} color={colors.accent} style={{ marginRight: 3 }} />
              <Text style={[styles.distanceText, { color: colors.textPrimary, fontWeight: '700' }]}>
                {salon.distanceKm} km away
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.address, { color: colors.textTertiary }]} numberOfLines={1}>
          {salon.address}
        </Text>

        {/* Live Waiting List & Queue Meter */}
        <View
          style={[
            styles.queueSection,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.queueHeader}>
            <View style={styles.queueLeft}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.queueTitle, { color: colors.textSecondary }]}>
                Waitlist:
              </Text>
              <Text style={[styles.queueHighlight, { color: colors.textPrimary }]}>
                {salon.waitingCount === 0 ? ' No wait' : ` ${salon.waitingCount}`}
              </Text>
            </View>
            <Text style={[styles.queueEstimate, { color: colors.textSecondary }]}>
              ~{salon.totalWaitTimeMinutes || (salon.waitingCount || 0) * 20} min
            </Text>
          </View>

          {/* Visual Queue Indicator Dots */}
          <View style={styles.dotsRow}>
            {waitDots.length > 0 &&
              waitDots.map((_, idx) => (
                <View key={idx} style={[styles.queueDot, { backgroundColor: colors.accent }]} />
              ))
            }
          </View>
        </View>

        {/* Buttons Row */}
        <View style={styles.actionsRow}>
          {/* User Request: One button which navigates to Google Maps for directions */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenGoogleMaps}
            style={[
              styles.navButton,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.buttonSecondaryBg,
              },
            ]}
          >
            <Ionicons name="map-outline" size={14} color={colors.buttonSecondaryText} style={{ marginRight: 5 }} />
            <Text style={[styles.navButtonText, { color: colors.buttonSecondaryText }]}>
              Directions
            </Text>
          </TouchableOpacity>

          {/* Book Slot */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onBook(salon)}
            disabled={!salon.isOpen}
            style={[
              styles.bookButton,
              {
                backgroundColor: salon.isOpen ? colors.accent : colors.surfaceMuted,
                opacity: salon.isOpen ? 1 : 0.6,
              },
            ]}
          >
            <Text
              style={[
                styles.bookButtonText,
                { color: salon.isOpen ? colors.accentText : colors.textSecondary },
              ]}
            >
              {salon.isOpen ? 'Book Slot & Code' : 'Currently Closed'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 18,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeRatingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  badgeStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badgeFastest: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeFastestText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  category: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  address: {
    fontSize: 11,
    marginBottom: 12,
  },
  queueSection: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueTitle: {
    fontSize: 11,
  },
  queueHighlight: {
    fontSize: 11,
    fontWeight: '600',
  },
  queueEstimate: {
    fontSize: 11,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  queueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  queueDotAvailable: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
