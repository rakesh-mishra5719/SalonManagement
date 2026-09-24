import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Dimensions, Platform, DimensionValue } from 'react-native';
import { Salon } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface GoogleMapViewProps {
  salons: Salon[];
  onBookSlot: (salon: Salon) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({ salons, onBookSlot }) => {
  const { colors, getCardStyle } = useTheme();
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(salons[0] || null);

  const handleOpenGoogleMapsDirections = (salon: Salon) => {
    const lat = salon.latitude;
    const lng = salon.longitude;
    const label = encodeURIComponent(salon.name);
    // Standard Google Maps directions URI format
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}&travelmode=driving`;
    Linking.openURL(url).catch((err) => {
      console.error('Cannot open Google Maps:', err);
    });
  };

  const topOffsets: DimensionValue[] = ['25%', '68%', '28%', '75%', '52%'];
  const leftOffsets: DimensionValue[] = ['65%', '22%', '32%', '72%', '80%'];

  return (
    <View style={styles.container}>
      {/* Map Canvas Visual Area */}
      <View style={[styles.mapCanvas, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
        {/* Stylized Google Maps Grid Background */}
        <View style={styles.gridLines}>
          <View style={[styles.roadHorizontal, { top: '35%' }]} />
          <View style={[styles.roadHorizontal, { top: '65%' }]} />
          <View style={[styles.roadVertical, { left: '30%' }]} />
          <View style={[styles.roadVertical, { left: '70%' }]} />
          <View style={styles.metroParkArea} />
        </View>

        {/* User Location Pulse Marker */}
        <View style={[styles.userMarkerContainer, { top: '48%', left: '46%' }]}>
          <View style={styles.userPulseRing} />
          <View style={styles.userCoreDot} />
          <View style={[styles.userBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.userBadgeText, { color: colors.accentText }]}>You are here</Text>
          </View>
        </View>

        {/* Salon Location Pins */}
        {salons.map((salon, index) => {
          const isSelected = selectedSalon?.id === salon.id;
          // Offset coordinates visually for schematic display
          const top = topOffsets[index % topOffsets.length];
          const left = leftOffsets[index % leftOffsets.length];

          return (
            <TouchableOpacity
              key={salon.id}
              activeOpacity={0.8}
              onPress={() => setSelectedSalon(salon)}
              style={[
                styles.pinWrapper,
                { top, left },
                isSelected && styles.pinWrapperSelected,
              ]}
            >
              <View
                style={[
                  styles.pinMarker,
                  {
                    backgroundColor: isSelected ? colors.accent : (salon.isOpen ? '#10B981' : '#9CA3AF'),
                    borderColor: '#FFFFFF',
                  },
                ]}
              >
                <Ionicons
                  name={salon.isOpen ? 'cut' : 'pause'}
                  size={12}
                  color="#FFFFFF"
                />
              </View>

              {/* Pin Callout */}
              <View
                style={[
                  styles.pinLabelBox,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  },
                  isSelected && { borderColor: colors.accent, borderWidth: 1.5 },
                ]}
              >
                <Text
                  style={[
                    styles.pinLabelText,
                    { color: colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                  numberOfLines={1}
                >
                  {salon.name.split(' ')[0]}
                </Text>
                <Text style={[styles.pinWaitText, { color: colors.textSecondary }]}>
                  {salon.waitingCount} in line
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Google Maps Brand Stamp */}
        <View style={styles.mapAttribution}>
          <Ionicons name="map" size={12} color={colors.textTertiary} style={{ marginRight: 4 }} />
          <Text style={[styles.mapAttributionText, { color: colors.textTertiary }]}>Google Maps Radar</Text>
        </View>
      </View>

      {/* Selected Salon Floating Detail Card */}
      {selectedSalon && (
        <View style={[styles.selectedCard, getCardStyle()]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.selectedName, { color: colors.textPrimary }]}>
                  {selectedSalon.name}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: selectedSalon.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: selectedSalon.isOpen ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {selectedSalon.isOpen ? 'Open Now' : 'Closed'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.selectedAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                {selectedSalon.address}
              </Text>
            </View>

            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color="#FBBF24" style={{ marginRight: 2 }} />
              <Text style={[styles.ratingNumber, { color: colors.textPrimary }]}>
                {selectedSalon.rating || 4.8}
              </Text>
            </View>
          </View>

          {/* Quick Queue Stats */}
          <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Queue Line</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {selectedSalon.waitingCount || 0} clients
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Estimated Wait</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                ~{selectedSalon.totalWaitTimeMinutes || (selectedSalon.waitingCount || 0) * 20} min
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Proximity</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {selectedSalon.distanceKm || 0.8} km
              </Text>
            </View>
          </View>

          {/* User Request: One button which navigates to Google Maps for directions */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenGoogleMapsDirections(selectedSalon)}
              style={[
                styles.mapsNavButton,
                {
                  backgroundColor: '#4285F4', // Google Maps Iconic Blue
                },
              ]}
            >
              <Ionicons name="navigate" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.mapsNavButtonText}>Navigate via Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onBookSlot(selectedSalon)}
              disabled={!selectedSalon.isOpen}
              style={[
                styles.bookSlotButton,
                {
                  backgroundColor: selectedSalon.isOpen ? colors.accent : colors.surfaceMuted,
                  opacity: selectedSalon.isOpen ? 1 : 0.6,
                },
              ]}
            >
              <Text
                style={[
                  styles.bookSlotButtonText,
                  { color: selectedSalon.isOpen ? colors.accentText : colors.textSecondary },
                ]}
              >
                Join Waitlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mapCanvas: {
    height: 320,
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F8',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#E5E7EB',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#E5E7EB',
  },
  metroParkArea: {
    position: 'absolute',
    top: '15%',
    left: '8%',
    width: 70,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
  },
  userMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  userPulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },
  userCoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -30 }],
  },
  pinWrapperSelected: {
    zIndex: 10,
    transform: [{ translateX: -20 }, { translateY: -34 }],
  },
  pinMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pinLabelBox: {
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pinLabelText: {
    fontSize: 10,
  },
  pinWaitText: {
    fontSize: 8,
  },
  mapAttribution: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapAttributionText: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  selectedCard: {
    padding: 16,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  selectedAddress: {
    fontSize: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mapsNavButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    elevation: 2,
  },
  mapsNavButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bookSlotButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  bookSlotButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
