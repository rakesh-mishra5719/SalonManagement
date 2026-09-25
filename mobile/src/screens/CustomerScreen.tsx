import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { Salon } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { SalonCard } from '../components/SalonCard';
import { GoogleMapView } from '../components/GoogleMapView';
import { BookSlotModal } from '../components/BookSlotModal';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export const CustomerScreen: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const {
    salons,
    loading,
    refreshSalons,
    activeBooking,
    setActiveBooking,
    userLocation,
    gpsActive,
    requestAndFetchUserLocation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingSalon, setBookingSalon] = useState<Salon | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Automatically request GPS access every time user opens or enters screen
  React.useEffect(() => {
    requestAndFetchUserLocation();
  }, [requestAndFetchUserLocation]);

  const filteredSalons = salons.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenBookModal = (salon: Salon) => {
    setBookingSalon(salon);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* GPS Location Notification Pill */}
      {/* <View style={styles.locationHeaderRow}>
        <Ionicons name="location" size={12} color={colors.accent} style={{ marginRight: 5 }} />
        <Text style={[styles.locationHeaderText, { color: colors.textSecondary }]}>
          {gpsActive
            ? `📍 GPS Active (${userLocation.lat.toFixed(2)}°N, ${userLocation.lng.toFixed(2)}°E) · Closest First`
            : '📍 Locating nearby salons...'}
        </Text>
      </View> */}
      {/* Search & View Switcher */}
      <View style={styles.topControls}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons name="search" size={15} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search nearby salons, treatments..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* View Switcher: List vs Map */}
        <View style={[styles.switchContainer, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('list')}
            style={[
              styles.switchTab,
              activeTab === 'list' && [styles.switchTabActive, { backgroundColor: colors.accent }],
            ]}
          >
            <Ionicons
              name="list"
              size={13}
              color={activeTab === 'list' ? colors.accentText : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.switchText,
                { color: activeTab === 'list' ? colors.accentText : colors.textSecondary },
              ]}
            >
              List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('map')}
            style={[
              styles.switchTab,
              activeTab === 'map' && [styles.switchTabActive, { backgroundColor: colors.accent }],
            ]}
          >
            <Ionicons
              name="map"
              size={13}
              color={activeTab === 'map' ? colors.accentText : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.switchText,
                { color: activeTab === 'map' ? colors.accentText : colors.textSecondary },
              ]}
            >
              Google Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Booking Banner (if customer booked a slot) */}
      {activeBooking && (
        <View style={[styles.activeBanner, getCardStyle()]}>
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.bannerBadgeRow}>
                <View style={[styles.bannerLiveDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.bannerBadgeText, { color: colors.success }]}>
                  CONFIRMED WAITLIST PASS • #{activeBooking.queuePosition || 1} IN QUEUE
                </Text>
              </View>

              {/* Booked Salon Name & Address */}
              <Text style={[styles.bannerSalonName, { color: colors.textPrimary }]}>
                {activeBooking.salonName || activeBooking.salon?.name || salons.find(s => s.id === activeBooking.salonId)?.name || 'Booked Salon'}
              </Text>
              <Text style={[styles.bannerSalonAddress, { color: colors.textSecondary }]}>
                📍 {activeBooking.salonAddress || activeBooking.salon?.address || salons.find(s => s.id === activeBooking.salonId)?.address || 'Address provided at booking'}
              </Text>

              {/* Arrival Code & Slot Time Box */}
              <View style={[styles.bannerCodeWrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
                <View>
                  <Text style={[styles.bannerCodeLabel, { color: colors.textTertiary }]}>ARRIVAL CODE</Text>
                  <Text style={[styles.bannerCode, { color: colors.accent }]}>
                    {activeBooking.verificationCode}
                  </Text>
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={[styles.bannerCodeLabel, { color: colors.textTertiary }]}>SLOT & SERVICE</Text>
                  <Text style={[styles.bannerSub, { color: colors.textPrimary }]}>
                    {activeBooking.slotTime || 'Scheduled'} • {activeBooking.serviceName || 'Service'}
                  </Text>
                </View>
              </View>

              {/* Real Google Maps Navigation Button with Location Icon */}
              <TouchableOpacity
                onPress={() => {
                  const s = activeBooking.salon || salons.find(item => item.id === activeBooking.salonId);
                  const lat = activeBooking.latitude || s?.latitude || 12.9716;
                  const lng = activeBooking.longitude || s?.longitude || 77.5946;
                  const name = encodeURIComponent(activeBooking.salonName || s?.name || 'Salon');
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;
                  Linking.openURL(url).catch((err) => console.error('Failed to open Google Maps:', err));
                }}
                style={styles.bannerMapsBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate-circle" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.bannerMapsBtnText}>Navigate to Salon (Google Maps)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setActiveBooking(null)}
              style={[styles.dismissBtn, { borderColor: colors.cardBorder }]}
              accessibilityLabel="Dismiss Pass Banner"
            >
              <Ionicons name="close" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main View Area */}
      {activeTab === 'list' ? (
        <FlatList
          data={filteredSalons}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshSalons} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.listHeaderTitle, { color: colors.textPrimary }]}>
                Salons Near You
              </Text>
              {/* <Text style={[styles.listHeaderSub, { color: colors.textSecondary }]}>
                Live waiting times & instant code booking
              </Text> */}
            </View>
          }
          renderItem={({ item }) => (
            <SalonCard
              salon={item}
              onBook={handleOpenBookModal}
              onSelect={handleOpenBookModal}
            />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshSalons} tintColor={colors.accent} />
          }
        >
          <View style={styles.listHeader}>
            <Text style={[styles.listHeaderTitle, { color: colors.textPrimary }]}>
              Google Maps Radar
            </Text>
            <Text style={[styles.listHeaderSub, { color: colors.textSecondary }]}>
              Explore nearby salons and tap to navigate directly in Google Maps
            </Text>
          </View>
          <GoogleMapView salons={filteredSalons} onBookSlot={handleOpenBookModal} />
        </ScrollView>
      )}

      {/* Booking Modal */}
      <BookSlotModal
        visible={modalVisible}
        salon={bookingSalon}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  switchContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  switchTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  switchTabActive: {
    elevation: 1,
  },
  switchText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeBanner: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bannerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  bannerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bannerSalonName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  bannerSalonAddress: {
    fontSize: 11,
    marginBottom: 8,
  },
  bannerCodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  bannerCodeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  bannerCode: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  bannerMapsBtn: {
    backgroundColor: '#9A6B39',
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    shadowColor: '#9A6B39',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  listHeaderSub: {
    fontSize: 11,
    marginTop: 2,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  locationHeaderText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
