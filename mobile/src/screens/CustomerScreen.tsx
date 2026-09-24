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
} from 'react-native';
import { Salon } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { SalonCard } from '../components/SalonCard';
import { GoogleMapView } from '../components/GoogleMapView';
import { BookSlotModal } from '../components/BookSlotModal';
import { Ionicons } from '@expo/vector-icons';

export const CustomerScreen: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const { salons, loading, refreshSalons, activeBooking, setActiveBooking } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingSalon, setBookingSalon] = useState<Salon | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string>('Detecting nearby salons...');

  // User Requirement: App asks access current location
  React.useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation(`GPS Active: ${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`);
        },
        () => {
          setGpsLocation('Bengaluru Metropolitan Hub (Default Location)');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsLocation('Location Active');
    }
  }, []);

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
      <View style={styles.locationHeaderRow}>
        <Ionicons name="location" size={12} color={colors.accent} style={{ marginRight: 5 }} />
        <Text style={[styles.locationHeaderText, { color: colors.textSecondary }]}>
          {gpsLocation}
        </Text>
      </View>
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
                  CONFIRMED WAITLIST PASS
                </Text>
              </View>
              <Text style={[styles.bannerCode, { color: colors.textPrimary }]}>
                {activeBooking.verificationCode}
              </Text>
              <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                Slot: {activeBooking.slotTime} • Position #{activeBooking.queuePosition || 1} in queue
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setActiveBooking(null)}
              style={[styles.dismissBtn, { borderColor: colors.cardBorder }]}
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
              <Text style={[styles.listHeaderSub, { color: colors.textSecondary }]}>
                Live waiting times & instant code booking
              </Text>
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
  bannerCode: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginVertical: 2,
  },
  bannerSub: {
    fontSize: 11,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
