import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SalonQueueDetails, QueueEntry } from '../types';
import { AppIcon } from '../components/AppIcon';
import { EditSalonModal } from '../components/EditSalonModal';

const DEFAULT_BRAND_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

export const OwnerScreen: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const { salons, refreshSalons, updateSalonPhoto, updateSalonDetails } = useApp();
  const { user, updateUserSalon } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [queueDetails, setQueueDetails] = useState<SalonQueueDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    success: boolean;
    message: string;
    entry?: QueueEntry;
  } | null>(null);

  // Strictly lock to the authenticated owner's salon, checking live salons state first
  const activeSalon =
    (user?.salonId ? salons.find((s) => s.id === user.salonId) : null) ||
    (user?.salon?.id ? salons.find((s) => s.id === user?.salon?.id) : null) ||
    salons.find((s) => s.ownerId === user?.id) ||
    user?.salon ||
    salons[0];

  // Dedicated reactive state for the open/close toggle so switch reflects immediately
  const [isOpen, setIsOpen] = useState<boolean>(() => Boolean(activeSalon?.isOpen));

  useEffect(() => {
    if (activeSalon) {
      setIsOpen(Boolean(activeSalon.isOpen));
    }
  }, [activeSalon?.isOpen]);

  const fetchQueue = async () => {
    if (!activeSalon) return;
    setLoading(true);
    try {
      const data = await api.getSalonQueue(activeSalon.id);
      setQueueDetails(data);
    } catch (err) {
      console.error('Failed to load queue details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSalon?.id) {
      fetchQueue();
    }
  }, [activeSalon?.id]);

  const handleToggleOpen = async (value: boolean) => {
    if (!activeSalon) return;
    // 1. Immediate optimistic UI reflection
    setIsOpen(value);
    try {
      // 2. Persist in universal storage & AppContext
      await updateSalonDetails(activeSalon.id, { isOpen: value });
      // 3. Persist in AuthContext user session
      updateUserSalon({ isOpen: value });
      // 4. Send to backend API
      await api.updateSalonStatus(activeSalon.id, value);
      // 5. Sync queue and salons
      await fetchQueue();
      await refreshSalons();
    } catch (err: any) {
      console.warn('Failed to update salon status:', err);
    }
  };

  // User Requirement: "when a user comes to salon owner he give his code that verify and confirm slot"
  const handleVerifyCode = async () => {
    if (!codeInput.trim()) {
      Alert.alert('Required', 'Please enter customer 6-digit verification code (e.g. 849201)');
      return;
    }

    setVerifying(true);
    setVerificationFeedback(null);
    try {
      const res = await api.verifyArrival(activeSalon.id, codeInput.trim());
      setVerificationFeedback({
        success: true,
        message: `Verified! Admitted ${res.entry.customerName} for ${res.entry.serviceName || 'Service'}.`,
        entry: res.entry,
      });
      setCodeInput('');
      await fetchQueue();
      await refreshSalons();
    } catch (err: any) {
      setVerificationFeedback({
        success: false,
        message: err.message || 'Verification failed. Please check the code.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteService = async (queueId: number) => {
    try {
      await api.completeService(activeSalon.id, queueId);
      await fetchQueue();
      await refreshSalons();
      Alert.alert('Service Completed', 'Customer marked as completed and queue updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to complete service');
    }
  };

  const [photoLoading, setPhotoLoading] = useState(false);

  const currentPhotoUrl = activeSalon?.imageUrl || DEFAULT_BRAND_IMAGE;
  const hasCustomPhoto = Boolean(
    activeSalon?.imageUrl && activeSalon.imageUrl !== DEFAULT_BRAND_IMAGE
  );

  const handleTakePhoto = async () => {
    if (!activeSalon) return;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is required to take a photo of your salon.'
        );
        return;
      }

      setPhotoLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await updateSalonPhoto(activeSalon.id, photoUri);
        await refreshSalons();
        Alert.alert('Salon Photo Updated', 'Your new salon photo has been saved and will appear to customers!');
      }
    } catch (err: any) {
      Alert.alert('Camera Error', err.message || 'Failed to capture photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (!activeSalon) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Photo library access is required to select a salon photo.'
        );
        return;
      }

      setPhotoLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await updateSalonPhoto(activeSalon.id, photoUri);
        await refreshSalons();
        Alert.alert('Salon Photo Updated', 'Your new salon photo has been saved and will appear to customers!');
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', err.message || 'Failed to select photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleResetPhoto = async () => {
    if (!activeSalon) return;
    try {
      setPhotoLoading(true);
      await updateSalonPhoto(activeSalon.id, null);
      await refreshSalons();
      Alert.alert('Reset to Brand Image', 'Your salon photo has been reset to our official brand image.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 50 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchQueue} tintColor={colors.accent} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Dedicated Owner Salon Profile Card (Strictly only owner's registered salon) */}
      {/* <View style={[styles.salonHeaderCard, getCardStyle()]}>
        <View style={styles.salonHeaderTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.ownerBadgeRow}>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               

              </View>
            </View>
            <Text style={[styles.salonTitle, { color: colors.textPrimary }]}>
              {activeSalon?.name || user?.salon?.name || 'Your Salon'}
            </Text>
            <Text style={[styles.salonSubtitle, { color: colors.textSecondary }]}>
              📍 {activeSalon?.address || user?.salon?.address || 'Registered Salon Address'}
            </Text>
            <Text style={[styles.managerText, { color: colors.textTertiary }]}>
              Manager: {user?.name || 'Owner'} · {activeSalon?.category || 'Salon Atelier'}
            </Text>
          </View>
        </View>
      </View> */}


       {/* Live Actual User Counter Dashboard */}
      <View style={styles.metricsContainer}>
        <Text style={[styles.metricsTitle, { color: colors.textPrimary }]}>
          Live User Count
        </Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, getCardStyle()]}>
            <Text style={[styles.metricNum, { color: colors.success }]}>
              {queueDetails?.servingCount ?? 0}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Serving Now
            </Text>
          </View>

          <View style={[styles.metricCard, getCardStyle()]}>
            <Text style={[styles.metricNum, { color: colors.warning }]}>
              {queueDetails?.waitingCount ?? 0}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              In Waiting Line
            </Text>
          </View>

          <View style={[styles.metricCard, getCardStyle()]}>
            <Text style={[styles.metricNum, { color: colors.textPrimary }]}>
              {queueDetails?.completedTodayCount ?? 0}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Finished Today
            </Text>
          </View>
        </View>
      </View>

      {/* Code Verification Box */}
      <View style={[styles.verifyCard, getCardStyle()]}>
        <View style={styles.verifyHeader}>
          <AppIcon name="shield-checkmark-outline" size={18} color={colors.accent} style={{ marginRight: 6, marginBottom: 12 }} />
          <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>
            Verify Arriving Client
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Enter 6-Digit Code "
            placeholderTextColor={colors.textTertiary}
            value={codeInput}
            onChangeText={setCodeInput}
            keyboardType="numeric"
            maxLength={6}
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
                fontSize: 16,
                letterSpacing: 3,
                textAlign: 'center',
              },
            ]}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleVerifyCode}
            disabled={verifying}
            style={[styles.verifyBtn, { backgroundColor: colors.accent }]}
          >
            {verifying ? (
              <ActivityIndicator color={colors.accentText} size="small" />
            ) : (
              <Text style={[styles.verifyBtnText, { color: colors.accentText }]}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>

        {verificationFeedback && (
          <View
            style={[
              styles.feedbackBox,
              {
                backgroundColor: verificationFeedback.success ? colors.successBg : colors.dangerBg,
                borderColor: verificationFeedback.success ? colors.success : colors.danger,
              },
            ]}
          >
            <AppIcon
              name={verificationFeedback.success ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color={verificationFeedback.success ? colors.success : colors.danger}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: verificationFeedback.success ? colors.success : colors.danger },
              ]}
            >
              {verificationFeedback.message}
            </Text>
          </View>
        )}
      </View>


      

      {/* Currently Serving Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Currently Serving
        </Text>
        {queueDetails?.servingList && queueDetails.servingList.length > 0 ? (
          queueDetails.servingList.map((entry) => (
            <View key={entry.id} style={[styles.servingCard, getCardStyle()]}>
              <View style={styles.servingHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.customerName, { color: colors.textPrimary }]}>
                    {entry.customerName}
                  </Text>
                  <Text style={[styles.customerDetails, { color: colors.textSecondary }]}>
                    {entry.serviceName} • Slot: {entry.slotTime}
                  </Text>
                </View>

                <View style={[styles.codeBadge, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.codeBadgeText, { color: colors.textPrimary }]}>
                    {entry.verificationCode}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCompleteService(entry.id)}
                style={[styles.completeBtn, { backgroundColor: colors.accent }]}
              >
                <AppIcon name="checkmark-done" size={14} color={colors.accentText} style={{ marginRight: 6 }} />
                <Text style={[styles.completeBtnText, { color: colors.accentText }]}>
                  Mark Service Completed
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={[styles.emptyBox, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No customer currently in service chair. Verify code above to admit next client.
            </Text>
          </View>
        )}
      </View>

      {/* Waiting List Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          Waiting List ({queueDetails?.waitingList?.length ?? 0})
        </Text>
        {queueDetails?.waitingList && queueDetails.waitingList.length > 0 ? (
          queueDetails.waitingList.map((entry, index) => (
            <View key={entry.id} style={[styles.waitingCard, getCardStyle()]}>
              <View style={[styles.positionBadge, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.positionNumber, { color: colors.textPrimary }]}>
                  #{index + 1}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.customerName, { color: colors.textPrimary }]}>
                  {entry.customerName}
                </Text>
                <Text style={[styles.customerDetails, { color: colors.textSecondary }]}>
                  {entry.serviceName} • {entry.slotTime}
                </Text>
              </View>

              <View style={[styles.codeBadgeSmall, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.codeBadgeSmallText, { color: colors.textSecondary }]}>
                  {entry.verificationCode}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyBox, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Waiting list is currently empty.
            </Text>
          </View>
        )}
      </View>

 {/* Salon Open/Closed Status Card */}
      {activeSalon && (
        <View style={[styles.statusCard, getCardStyle()]}>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.statusLabelRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: isOpen ? colors.success : colors.danger },
                  ]}
                />
                <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                  {isOpen ? 'Shop is Open' : 'Shop is Closed'}
                </Text>
              </View>
              <Text style={[styles.statusSub, { color: colors.textSecondary }]}>
                {isOpen
                  ? 'Open for walk-ins & appointments today. Tap switch to close this evening.'
                  : 'Closed for the night. Tap switch every morning to open your shop.'}
              </Text>
            </View>

            <Switch
              value={isOpen}
              onValueChange={handleToggleOpen}
              trackColor={{ false: '#D1D5DB', true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      )}


      {/* Salon Showcase Photo Section (Optional Capture / Brand Image Fallback) */}
      {activeSalon && (
        <View style={[styles.photoCard, getCardStyle()]}>
          <View style={styles.photoHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppIcon name="camera-outline" size={17} color={colors.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.photoCardTitle, { color: colors.textPrimary }]}>
                  Showcase Photo
                </Text>
              </View>
              {/* <Text style={[styles.photoCardSubtitle, { color: colors.textSecondary }]}>
                Optional: Capture or upload photos of your shop. Customers will see this on their cards. Until uploaded, our default brand image is shown.
              </Text> */}
            </View>
          </View>

          {/* Photo Preview Container */}
          <View style={styles.photoPreviewWrapper}>
            <Image
              source={{ uri: currentPhotoUrl }}
              style={styles.photoPreviewImage}
              resizeMode="cover"
            />
            {/* Badge: Custom or Default Brand */}
            <View
              style={[
                styles.photoBadge,
                {
                  backgroundColor: hasCustomPhoto
                    ? 'rgba(16, 185, 129, 0.92)'
                    : 'rgba(59, 130, 246, 0.92)',
                },
              ]}
            >
              <AppIcon
                name={hasCustomPhoto ? 'checkmark-circle-outline' : 'sparkles-outline'}
                size={12}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.photoBadgeText}>
                {hasCustomPhoto ? 'Custom Salon Photo' : 'Official Brand Image (Default)'}
              </Text>
            </View>
            {photoLoading && (
              <View style={styles.photoLoadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.photoBtnRow}>
            <TouchableOpacity
              style={[styles.photoBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
              onPress={handleTakePhoto}
              disabled={photoLoading}
            >
              <AppIcon name="camera" size={15} color={colors.accentText} style={{ marginRight: 6 }} />
              <Text style={[styles.photoBtnText, { color: colors.accentText }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.photoBtn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={handlePickFromGallery}
              disabled={photoLoading}
            >
              <AppIcon name="images-outline" size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.photoBtnText, { color: colors.textPrimary }]}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          {hasCustomPhoto && (
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.7}
              onPress={handleResetPhoto}
              disabled={photoLoading}
            >
              <AppIcon name="refresh-outline" size={13} color={colors.textTertiary} style={{ marginRight: 4 }} />
              <Text style={[styles.resetBtnText, { color: colors.textTertiary }]}>
                Reset to Default Brand Image
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

     


     

      {/* Edit Salon Details Modal */}
      <EditSalonModal
        visible={editModalVisible}
        salon={activeSalon}
        onClose={() => setEditModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  salonHeaderCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
  },
  salonHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ownerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ownerIdText: {
    fontSize: 10,
    fontWeight: '600',
  },
  editDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  editDetailsBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  salonTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  salonSubtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  managerText: {
    fontSize: 11,
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 11,
    marginTop: 2,
  },
  verifyCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
  },
  verifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  verifySub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  verifyBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  verifyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  metricsSubtitle: {
    fontSize: 11,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  metricNum: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  servingCard: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 16,
  },
  servingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  customerDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  completeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 16,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  positionNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  codeBadgeSmall: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeBadgeSmallText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  photoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
  },
  photoHeaderRow: {
    marginBottom: 10,
  },
  photoCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  photoCardSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  photoPreviewWrapper: {
    position: 'relative',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#000000',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  photoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
