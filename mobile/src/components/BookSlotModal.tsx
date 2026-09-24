import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Salon, QueueEntry } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface BookSlotModalProps {
  visible: boolean;
  salon: Salon | null;
  onClose: () => void;
}

const availableSlots = [
  '10:00 AM',
  '10:30 AM',
  '11:15 AM',
  '12:00 PM',
  '01:30 PM',
  '02:45 PM',
  '04:00 PM',
  '05:30 PM',
];

const availableServices = [
  { name: 'Signature Haircut & Wash', duration: '25 min' },
  { name: 'Beard Sculpt & Hot Towel', duration: '20 min' },
  { name: 'Botanical Scalp Therapy', duration: '35 min' },
  { name: 'Complete Executive Package', duration: '50 min' },
];

export const BookSlotModal: React.FC<BookSlotModalProps> = ({ visible, salon, onClose }) => {
  const { colors, getCardStyle, designPattern } = useTheme();
  const { setActiveBooking, refreshSalons } = useApp();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0]);
  const [selectedService, setSelectedService] = useState(availableServices[0].name);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<QueueEntry | null>(null);

  React.useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (!salon) return null;

  const handleBook = async () => {
    if (!customerName.trim()) {
      Alert.alert('Required', 'Please enter your name for the appointment');
      return;
    }

    setSubmitting(true);
    try {
      const entry = await api.joinQueue(salon.id, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceName: selectedService,
        slotTime: selectedSlot,
        userId: user?.id,
      });

      setConfirmedBooking(entry);
      setActiveBooking(entry);
      refreshSalons();
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Unable to join queue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setConfirmedBooking(null);
    setCustomerName('');
    setCustomerPhone('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, getCardStyle()]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {confirmedBooking ? 'Booking Confirmed' : 'Select Slot & Waitlist'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {salon.name}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDone} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {confirmedBooking ? (
              /* Verification Pass Screen */
              <View style={styles.confirmedContainer}>
                {/* Visual Glass Pass */}
                <View
                  style={[
                    styles.passCard,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.passHeader}>
                    <Text style={[styles.passSalonName, { color: colors.textPrimary }]}>
                      {salon.name}
                    </Text>
                    <View style={[styles.passVerifiedBadge, { backgroundColor: colors.successBg }]}>
                      <Text style={[styles.passVerifiedText, { color: colors.success }]}>
                        ACTIVE PASS
                      </Text>
                    </View>
                  </View>

                    {/* Customer Arrival Verification Code */}
                    <View style={styles.codeContainer}>
                      <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>
                        YOUR 6-DIGIT ARRIVAL CODE
                      </Text>
                      <View style={[styles.codeBox, { borderColor: colors.accent }]}>
                        <Text style={[styles.codeText, { color: colors.textPrimary }]}>
                          {confirmedBooking.verificationCode}
                        </Text>
                      </View>
                      <Text style={[styles.codeInstruction, { color: colors.textTertiary }]}>
                        Give this 6-digit code to the salon owner upon arrival to verify & begin your service.
                      </Text>
                    </View>

                  {/* Slot Details */}
                  <View style={[styles.passDetailsRow, { borderTopColor: colors.divider }]}>
                    <View style={styles.passDetailCol}>
                      <Text style={[styles.passDetailLabel, { color: colors.textTertiary }]}>Slot</Text>
                      <Text style={[styles.passDetailValue, { color: colors.textPrimary }]}>
                        {confirmedBooking.slotTime}
                      </Text>
                    </View>
                    <View style={styles.passDetailCol}>
                      <Text style={[styles.passDetailLabel, { color: colors.textTertiary }]}>Position</Text>
                      <Text style={[styles.passDetailValue, { color: colors.textPrimary }]}>
                        #{confirmedBooking.queuePosition || 1} in Line
                      </Text>
                    </View>
                    <View style={styles.passDetailCol}>
                      <Text style={[styles.passDetailLabel, { color: colors.textTertiary }]}>Guest</Text>
                      <Text style={[styles.passDetailValue, { color: colors.textPrimary }]}>
                        {confirmedBooking.customerName}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleDone}
                  style={[styles.primaryButton, { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>
                    Done & View Live Queue
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Booking Form Screen */
              <View>
                {/* Available Slots */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Choose Preferred Slot
                </Text>
                <View style={styles.slotsGrid}>
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        activeOpacity={0.7}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          {
                            backgroundColor: isSelected ? colors.accent : colors.surfaceMuted,
                            borderColor: isSelected ? colors.accent : colors.cardBorder,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotChipText,
                            {
                              color: isSelected ? colors.accentText : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Service Selection */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Select Service
                </Text>
                {availableServices.map((svc) => {
                  const isSelected = selectedService === svc.name;
                  return (
                    <TouchableOpacity
                      key={svc.name}
                      activeOpacity={0.7}
                      onPress={() => setSelectedService(svc.name)}
                      style={[
                        styles.serviceRow,
                        {
                          backgroundColor: isSelected ? colors.accentLight : colors.surfaceMuted,
                          borderColor: isSelected ? colors.accent : colors.cardBorder,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
                          {svc.name}
                        </Text>
                        <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                          Duration: {svc.duration}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: isSelected ? colors.accent : colors.textTertiary },
                        ]}
                      >
                        {isSelected && (
                          <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Guest Details */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Your Details
                </Text>
                <TextInput
                  placeholder="Your Full Name *"
                  placeholderTextColor={colors.textTertiary}
                  value={customerName}
                  onChangeText={setCustomerName}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                />
                <TextInput
                  placeholder="Phone Number (for SMS notifications)"
                  placeholderTextColor={colors.textTertiary}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
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

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleBook}
                  disabled={submitting}
                  style={[styles.primaryButton, { backgroundColor: colors.accent }]}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.accentText} size="small" />
                  ) : (
                    <Text style={[styles.primaryButtonText, { color: colors.accentText }]}>
                      Confirm Booking & Get Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    maxHeight: 520,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  slotChipText: {
    fontSize: 11,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceDuration: {
    fontSize: 10,
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  primaryButton: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  confirmedContainer: {
    paddingVertical: 8,
  },
  passCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passSalonName: {
    fontSize: 15,
    fontWeight: '700',
  },
  passVerifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  passVerifiedText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  codeInstruction: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  passDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 10,
  },
  passDetailCol: {
    alignItems: 'center',
  },
  passDetailLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  passDetailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
