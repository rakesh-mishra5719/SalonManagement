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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SalonQueueDetails, QueueEntry } from '../types';
import { Ionicons } from '@expo/vector-icons';

export const OwnerScreen: React.FC = () => {
  const { colors, getCardStyle, designPattern } = useTheme();
  const { salons, ownerSalonId, setOwnerSalonId, refreshSalons } = useApp();
  const { user } = useAuth();

  const [queueDetails, setQueueDetails] = useState<SalonQueueDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    success: boolean;
    message: string;
    entry?: QueueEntry;
  } | null>(null);

  // Default to owner's registered salon
  useEffect(() => {
    if (user?.salonId) {
      setOwnerSalonId(user.salonId);
    }
  }, [user?.salonId]);

  const activeSalon = salons.find((s) => s.id === (user?.salonId || ownerSalonId)) || salons[0];

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
    fetchQueue();
  }, [ownerSalonId, activeSalon?.id]);

  const handleToggleOpen = async (value: boolean) => {
    if (!activeSalon) return;
    try {
      await api.updateSalonStatus(activeSalon.id, value);
      await fetchQueue();
      await refreshSalons();
    } catch (err: any) {
      Alert.alert('Status Error', err.message || 'Failed to update salon status');
    }
  };

  // User Requirement: "when a user comes to salon owner he give his code that verify and confirm slot"
  const handleVerifyCode = async () => {
    if (!codeInput.trim()) {
      Alert.alert('Required', 'Please enter customer verification code (e.g. SLN-1024)');
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 50 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchQueue} tintColor={colors.accent} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Salon Selection Bar */}
      <View style={styles.selectorContainer}>
        <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>MANAGING SALON</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.salonChipsRow}>
          {salons.map((s) => {
            const isSelected = s.id === ownerSalonId;
            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.7}
                onPress={() => setOwnerSalonId(s.id)}
                style={[
                  styles.salonChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surfaceMuted,
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.salonChipText,
                    {
                      color: isSelected ? colors.accentText : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
                    { backgroundColor: activeSalon.isOpen ? colors.success : colors.danger },
                  ]}
                />
                <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                  {activeSalon.isOpen ? 'Shop is Open (Morning Hours)' : 'Shop is Closed (Evening Hours)'}
                </Text>
              </View>
              <Text style={[styles.statusSub, { color: colors.textSecondary }]}>
                {activeSalon.isOpen
                  ? 'Open for walk-ins & appointments today. Tap switch to close this evening.'
                  : 'Closed for the night. Tap switch every morning to open your shop.'}
              </Text>
            </View>

            <Switch
              value={activeSalon.isOpen}
              onValueChange={handleToggleOpen}
              trackColor={{ false: '#D1D5DB', true: colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      )}

      {/* Code Verification Box */}
      <View style={[styles.verifyCard, getCardStyle()]}>
        <View style={styles.verifyHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>
            Verify Arriving Client (6-Digit Code)
          </Text>
        </View>
        <Text style={[styles.verifySub, { color: colors.textSecondary }]}>
          When a client arrives, enter their 6-digit verification code to confirm their slot and admit them to the styling chair.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Enter 6-Digit Code (e.g. 481923)"
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
              <Text style={[styles.verifyBtnText, { color: colors.accentText }]}>
                Verify & Admit
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Verification Alert Banner */}
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
            <Ionicons
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

      {/* Live Actual User Counter Dashboard */}
      <View style={styles.metricsContainer}>
        <Text style={[styles.metricsTitle, { color: colors.textPrimary }]}>
          Live Actual User Count
        </Text>
        <Text style={[styles.metricsSubtitle, { color: colors.textSecondary }]}>
          Real-time synchronized across all customer devices
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
                <Ionicons name="checkmark-done" size={14} color={colors.accentText} style={{ marginRight: 6 }} />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  salonChipsRow: {
    flexDirection: 'row',
  },
  salonChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  salonChipText: {
    fontSize: 11,
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
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
  },
  verifyCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  verifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: '700',
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
  },
  metricsSubtitle: {
    fontSize: 11,
    marginBottom: 10,
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
  },
  servingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  customerDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  completeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  codeBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  codeBadgeSmallText: {
    fontSize: 10,
  },
  emptyBox: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
