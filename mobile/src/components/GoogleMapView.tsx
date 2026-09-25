import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Salon } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { AppIcon } from './AppIcon';

interface GoogleMapViewProps {
  salons: Salon[];
  onBookSlot: (salon: Salon) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({ salons, onBookSlot }) => {
  const { colors, getCardStyle } = useTheme();
  const { userLocation } = useApp();

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(salons[0] || null);
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Streets, 'k' = Satellite

  const handleOpenGoogleMapsDirections = (salon: Salon) => {
    const lat = salon.latitude;
    const lng = salon.longitude;
    const label = encodeURIComponent(salon.name);
    // Universal Google Maps directions URL
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}&travelmode=driving`;
    Linking.openURL(url).catch((err) => {
      console.error('Cannot open Google Maps:', err);
    });
  };

  const centerLat = selectedSalon ? selectedSalon.latitude : userLocation.lat;
  const centerLng = selectedSalon ? selectedSalon.longitude : userLocation.lng;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${centerLat},${centerLng}&hl=en&z=15&t=${mapType}&output=embed`;

  return (
    <View style={styles.container}>
      {/* Top Controls: Google Maps Brand & Map Type Switcher */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.googleColorRow}>
            <View style={[styles.googleColorBar, { backgroundColor: '#4285F4' }]} />
            <View style={[styles.googleColorBar, { backgroundColor: '#EA4335' }]} />
            <View style={[styles.googleColorBar, { backgroundColor: '#FBBC05' }]} />
            <View style={[styles.googleColorBar, { backgroundColor: '#34A853' }]} />
          </View>
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>
            Real Google Maps · Live
          </Text>
        </View>

        {/* Map Type: Streets vs Satellite */}
        <View style={[styles.mapTypeToggle, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMapType('m')}
            style={[
              styles.mapTypeBtn,
              mapType === 'm' && [styles.mapTypeBtnActive, { backgroundColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.mapTypeBtnText,
                { color: mapType === 'm' ? colors.accentText : colors.textSecondary },
              ]}
            >
              🗺️ Streets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMapType('k')}
            style={[
              styles.mapTypeBtn,
              mapType === 'k' && [styles.mapTypeBtnActive, { backgroundColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.mapTypeBtnText,
                { color: mapType === 'k' ? colors.accentText : colors.textSecondary },
              ]}
            >
              🛰️ Satellite
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* REAL GOOGLE MAP CONTAINER */}
      <View style={[styles.mapWrapper, { borderColor: colors.cardBorder }]}>
        {Platform.OS === 'web' ? (
          React.createElement('iframe', {
            title: 'Real Google Map Explorer',
            src: mapEmbedUrl,
            style: {
              width: '100%',
              height: 290,
              border: 0,
              borderRadius: 16,
            },
          })
        ) : (
          <View style={styles.nativeMapCanvas}>
            <View style={styles.gridLineH1} />
            <View style={styles.gridLineH2} />
            <View style={styles.gridLineV1} />
            <View style={styles.gridLineV2} />
            <View style={styles.nativePinCenter}>
              <View style={styles.pinOuterPulse} />
              <View style={[styles.pinInnerDot, { backgroundColor: colors.accent }]} />
              <View style={[styles.pinCallout, { backgroundColor: colors.cardBg }]}>
                <Text style={[styles.pinCalloutText, { color: colors.textPrimary }]}>
                  📍 {selectedSalon?.name || 'Selected Salon'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Live Coordinates Floating Pill on Map */}
        <View style={styles.coordsFloatPill}>
          <View style={styles.coordsPulseDot} />
          <Text style={styles.coordsFloatText}>
            {centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E
          </Text>
        </View>
      </View>

      {/* Quick Salon Selector Chips */}
      <View style={styles.carouselSection}>
        <Text style={[styles.carouselTitle, { color: colors.textSecondary }]}>
          TAP TO VIEW SALON ON REAL GOOGLE MAP ({salons.length} NEARBY):
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScroll}
        >
          {salons.map((salon) => {
            const isSelected = selectedSalon?.id === salon.id;
            return (
              <TouchableOpacity
                key={salon.id}
                activeOpacity={0.8}
                onPress={() => setSelectedSalon(salon)}
                style={[
                  styles.salonChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceMuted,
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.chipTopRow}>
                  <Text
                    style={[
                      styles.chipName,
                      { color: isSelected ? colors.accentText : colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {salon.name}
                  </Text>
                  <View
                    style={[
                      styles.chipStatusDot,
                      { backgroundColor: salon.isOpen ? '#10B981' : '#EF4444' },
                    ]}
                  />
                </View>
                <View style={styles.chipMetaRow}>
                  <Text
                    style={[
                      styles.chipDistance,
                      { color: isSelected ? colors.accentText : colors.textSecondary },
                    ]}
                  >
                    📍 {salon.distanceKm ?? 0.8} km
                  </Text>
                  <Text
                    style={[
                      styles.chipWait,
                      { color: isSelected ? colors.accentText : colors.textTertiary },
                    ]}
                  >
                    · {salon.waitingCount ?? 0} in line
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Salon Floating Detail Card */}
      {selectedSalon && (
        <View style={[styles.selectedCard, getCardStyle()]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.selectedName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {selectedSalon.name}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: selectedSalon.isOpen
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    },
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
                {selectedSalon.distanceKm || 0.8} km away
              </Text>
            </View>
          </View>

          {/* Action Buttons: Google Maps Turn-by-Turn Navigation + Book Slot */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleOpenGoogleMapsDirections(selectedSalon)}
              style={[styles.mapsNavButton, { backgroundColor: '#4285F4' }]}
            >
              <Ionicons name="navigate" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.mapsNavButtonText}>Google Maps Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onBookSlot(selectedSalon)}
              style={[styles.bookButton, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="time" size={14} color={colors.accentText} style={{ marginRight: 5 }} />
              <Text style={[styles.bookButtonText, { color: colors.accentText }]}>Book Slot</Text>
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleColorRow: {
    flexDirection: 'row',
    marginRight: 6,
    gap: 1.5,
  },
  googleColorBar: {
    width: 3.5,
    height: 10,
    borderRadius: 1,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapTypeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  mapTypeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  mapTypeBtnActive: {
    elevation: 1,
  },
  mapTypeBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    height: 290,
  },
  coordsFloatPill: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  coordsPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  coordsFloatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  carouselSection: {
    marginTop: 10,
  },
  carouselTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  carouselScroll: {
    paddingRight: 16,
    gap: 8,
  },
  salonChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
  },
  chipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  chipName: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  chipStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDistance: {
    fontSize: 10,
    fontWeight: '600',
  },
  chipWait: {
    fontSize: 10,
  },
  selectedCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  selectedAddress: {
    fontSize: 11,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    marginBottom: 10,
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
    fontWeight: '700',
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
  },
  mapsNavButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  nativeMapCanvas: {
    height: 290,
    backgroundColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineH1: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridLineH2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridLineV1: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridLineV2: {
    position: 'absolute',
    left: '65%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  nativePinCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOuterPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  pinInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinCallout: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pinCalloutText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
