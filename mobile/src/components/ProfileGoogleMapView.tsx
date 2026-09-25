import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { AppIcon } from './AppIcon';

interface ProfileGoogleMapViewProps {
  targetLat: number;
  targetLng: number;
  title?: string;
  subtitle?: string;
  salonName?: string;
}

export const ProfileGoogleMapView: React.FC<ProfileGoogleMapViewProps> = ({
  targetLat,
  targetLng,
  title = 'Live Location (Google Maps)',
  subtitle = 'Real-time GPS pinned on Google Maps',
  salonName,
}) => {
  const { colors, getCardStyle } = useTheme();
  const { requestAndFetchUserLocation } = useApp();

  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Streets, 'k' = Satellite
  const [recalibrating, setRecalibrating] = useState(false);

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${targetLat},${targetLng}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Failed to launch Google Maps:', err);
    });
  };

  const handleRecalibrateGps = async () => {
    setRecalibrating(true);
    try {
      await requestAndFetchUserLocation();
    } finally {
      setTimeout(() => setRecalibrating(false), 600);
    }
  };

  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&hl=en&z=15&t=${mapType}&output=embed`;

  return (
    <View style={[styles.card, getCardStyle()]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <AppIcon name="map-outline" size={17} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>

        {/* Map Type Toggle: Streets vs Satellite */}
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
              Streets
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
              Satellite
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GPS Coordinates Bar */}
      <View style={[styles.coordsBar, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
        <View style={styles.coordsLeft}>
          <View style={styles.livePulseDot} />
          <Text style={[styles.coordsText, { color: colors.textPrimary }]}>
            GPS Lock: {targetLat.toFixed(4)}°N, {targetLng.toFixed(4)}°E
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRecalibrateGps}
          disabled={recalibrating}
          style={styles.refreshGpsBtn}
        >
          {recalibrating ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <>
              <AppIcon name="refresh-outline" size={13} color={colors.accent} style={{ marginRight: 3 }} />
              <Text style={[styles.refreshGpsText, { color: colors.accent }]}>Sync GPS</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* REAL GOOGLE MAP CONTAINER */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          React.createElement('iframe', {
            title: 'Profile Real Google Map',
            src: googleMapEmbedUrl,
            style: {
              width: '100%',
              height: 230,
              border: 0,
              borderRadius: 14,
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
                  📍 {salonName || 'Your Location'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Launch Google Maps App Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenGoogleMaps}
          style={[styles.launchMapBtn, { backgroundColor: colors.accent }]}
        >
          <AppIcon name="navigate-outline" size={15} color={colors.accentText} style={{ marginRight: 6 }} />
          <Text style={[styles.launchMapBtnText, { color: colors.accentText }]}>
            Open in Google Maps App
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    padding: 16,
    borderRadius: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  mapTypeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  mapTypeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapTypeBtnActive: {
    elevation: 1,
  },
  mapTypeBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  coordsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  coordsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 7,
  },
  coordsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refreshGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  refreshGpsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mapContainer: {
    marginTop: 2,
  },
  nativeMapCanvas: {
    height: 220,
    borderRadius: 14,
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
  launchMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 12,
    width: '100%',
  },
  launchMapBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
