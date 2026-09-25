import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AppIcon } from './AppIcon';
import { Salon } from '../types';

interface EditSalonModalProps {
  visible: boolean;
  salon: Salon | null;
  onClose: () => void;
  onSaved?: (updated: Partial<Salon>) => void;
}

const CATEGORY_PRESETS = [
  'Luxury Grooming & Spa',
  'Craft Barber Studio',
  'Unisex Hair Atelier',
  'Organic Hair & Skincare',
  'Premium Beauty Lounge',
];

export const EditSalonModal: React.FC<EditSalonModalProps> = ({
  visible,
  salon,
  onClose,
  onSaved,
}) => {
  const { colors, getCardStyle } = useTheme();
  const { updateSalonDetails, refreshSalons } = useApp();
  const { updateUserSalon } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('09:00 PM');

  const [saving, setSaving] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (salon) {
      setName(salon.name || '');
      setCategory(salon.category || '');
      setAddress(salon.address || '');
      setPhone(salon.phone || '');
      setLatitude(salon.latitude ? salon.latitude.toString() : '12.9716');
      setLongitude(salon.longitude ? salon.longitude.toString() : '77.5946');
      setGpsFeedback(null);
    }
  }, [salon, visible]);

  const handlePinCurrentGps = async () => {
    setLocatingGps(true);
    setGpsFeedback(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to automatically pin your shop coordinates.'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));

      // Attempt reverse geocoding to resolve street address
      try {
        const reverseResults = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (reverseResults && reverseResults.length > 0) {
          const item = reverseResults[0];
          const parts = [item.name, item.street, item.subregion, item.city, item.postalCode].filter(
            Boolean
          );
          if (parts.length > 0 && !address.trim()) {
            setAddress(parts.join(', '));
          }
        }
      } catch (_) {}

      setGpsFeedback(`📍 GPS Pinned: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
    } catch (err: any) {
      Alert.alert('GPS Error', err.message || 'Could not retrieve device location.');
    } finally {
      setLocatingGps(false);
    }
  };

  const handleSave = async () => {
    if (!salon) return;
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your salon / shop name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Required Field', 'Please enter your physical salon address.');
      return;
    }

    const latNum = parseFloat(latitude) || salon.latitude || 12.9716;
    const lngNum = parseFloat(longitude) || salon.longitude || 77.5946;

    const updatedData: Partial<Salon> = {
      name: name.trim(),
      category: category.trim() || 'Hair & Grooming Salon',
      address: address.trim(),
      phone: phone.trim(),
      latitude: latNum,
      longitude: lngNum,
    };

    setSaving(true);
    try {
      await updateSalonDetails(salon.id, updatedData);
      updateUserSalon(updatedData);
      await refreshSalons();

      Alert.alert('Success', 'Salon details updated successfully!');
      if (onSaved) onSaved(updatedData);
      onClose();
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Failed to update salon details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, getCardStyle()]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppIcon name="create-outline" size={18} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Salon Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Update shop profile, contact info, and device GPS pinpoint for client discovery.
          </Text>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Salon Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>SALON / SHOP NAME *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. HAJAMM Luxury Studio"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </View>

            {/* Category / Specialty */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>SPECIALTY / CATEGORY</Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Luxury Grooming & Spa"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
              />
              {/* Category Quick Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {CATEGORY_PRESETS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: category === cat ? colors.accent : colors.surfaceMuted,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: category === cat ? colors.accentText : colors.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Phone / Contact */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CONTACT PHONE</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98450 11223"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </View>

            {/* Physical Address */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>PHYSICAL ADDRESS *</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="104 Indiranagar 100ft Rd, Bengaluru"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={2}
                style={[
                  styles.inputMultiline,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </View>

            {/* GPS Coordinates & Pinpoint Button */}
            <View style={[styles.gpsBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
              <View style={styles.gpsHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppIcon name="location-outline" size={15} color={colors.accent} style={{ marginRight: 5 }} />
                  <Text style={[styles.gpsTitle, { color: colors.textPrimary }]}>GPS Pinpoint</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePinCurrentGps}
                  disabled={locatingGps}
                  style={[styles.pinGpsBtn, { backgroundColor: colors.accent }]}
                >
                  {locatingGps ? (
                    <ActivityIndicator size="small" color={colors.accentText} />
                  ) : (
                    <>
                      <AppIcon name="locate" size={13} color={colors.accentText} style={{ marginRight: 4 }} />
                      <Text style={[styles.pinGpsBtnText, { color: colors.accentText }]}>
                        Pin Device GPS
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {gpsFeedback && (
                <Text style={[styles.gpsFeedbackText, { color: colors.accent }]}>
                  {gpsFeedback}
                </Text>
              )}

              <View style={styles.coordsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.subLabel, { color: colors.textTertiary }]}>LATITUDE</Text>
                  <TextInput
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="12.9716"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    style={[
                      styles.coordInput,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.textPrimary,
                      },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subLabel, { color: colors.textTertiary }]}>LONGITUDE</Text>
                  <TextInput
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="77.5946"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    style={[
                      styles.coordInput,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.textPrimary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Operating Hours */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>OPERATING HOURS</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subLabel, { color: colors.textTertiary }]}>OPENS AT</Text>
                  <TextInput
                    value={openingTime}
                    onChangeText={setOpeningTime}
                    placeholder="09:00 AM"
                    placeholderTextColor={colors.textTertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.textPrimary,
                      },
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subLabel, { color: colors.textTertiary }]}>CLOSES AT</Text>
                  <TextInput
                    value={closingTime}
                    onChangeText={setClosingTime}
                    placeholder="09:00 PM"
                    placeholderTextColor={colors.textTertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.textPrimary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              disabled={saving}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.accentText} />
              ) : (
                <>
                  <AppIcon name="checkmark" size={15} color={colors.accentText} style={{ marginRight: 6 }} />
                  <Text style={[styles.saveBtnText, { color: colors.accentText }]}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    padding: 20,
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  formScroll: {
    maxHeight: 450,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  inputMultiline: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    minHeight: 55,
    textAlignVertical: 'top',
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  gpsBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  gpsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gpsTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pinGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pinGpsBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gpsFeedbackText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  coordsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  coordInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
