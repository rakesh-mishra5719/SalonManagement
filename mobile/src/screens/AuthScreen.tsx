import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const AuthScreen: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const { login, sendOtp, registerClient, registerOwner } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'client_signup' | 'owner_signup'>('signin');
  const [submitting, setSubmitting] = useState(false);

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Client Sign Up State (Name & Phone for OTP)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientOtp, setClientOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Salon Owner Sign Up State (Owner + Shop Details)
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Hair Atelier & Spa');
  const [shopAddress, setShopAddress] = useState('');
  const [shopLat, setShopLat] = useState('12.9716');
  const [shopLng, setShopLng] = useState('77.5946');
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('09:00 PM');
  const [chairsCount, setChairsCount] = useState('4');
  const [locating, setLocating] = useState(false);

  const handleLogin = async () => {
    if (!loginIdentifier.trim() || !loginPassword) {
      Alert.alert('Required', 'Please enter your phone/email and password');
      return;
    }
    setSubmitting(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!clientPhone.trim() || clientPhone.length < 8) {
      Alert.alert('Required', 'Please enter a valid mobile phone number for OTP');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await sendOtp(clientPhone.trim());
      setOtpSent(true);
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
        setClientOtp(res.demoOtp); // Auto-fill demo OTP for effortless instant testing
      }
      Alert.alert('OTP Sent', `Verification code sent to ${clientPhone}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleClientSignUp = async () => {
    if (!clientName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    if (!clientPhone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }
    if (!clientOtp.trim()) {
      Alert.alert('Required', 'Please enter the 6-digit OTP code');
      return;
    }
    if (!clientPassword || clientPassword.length < 4) {
      Alert.alert('Required', 'Password must be at least 4 characters');
      return;
    }

    setSubmitting(true);
    try {
      await registerClient({
        name: clientName.trim(),
        phone: clientPhone.trim(),
        password: clientPassword,
        otpCode: clientOtp.trim(),
      });
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Unable to register account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetectLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setShopLat(pos.coords.latitude.toFixed(4));
          setShopLng(pos.coords.longitude.toFixed(4));
          setLocating(false);
          Alert.alert('Location Detected', `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          setLocating(false);
          Alert.alert('Location Notice', 'Could not fetch GPS automatically. Using default metropolitan coordinates.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      Alert.alert('Location Notice', 'Geolocation is not supported on this device. Coordinates set manually.');
    }
  };

  const handleOwnerSignUp = async () => {
    if (!ownerName.trim() || !ownerPassword) {
      Alert.alert('Required', 'Please provide owner name and password');
      return;
    }
    if (!shopName.trim() || !shopAddress.trim()) {
      Alert.alert('Required', 'Please enter your Salon Shop Name and Address');
      return;
    }

    setSubmitting(true);
    try {
      await registerOwner({
        name: ownerName.trim(),
        email: ownerEmail.trim() || undefined,
        phone: ownerPhone.trim() || undefined,
        password: ownerPassword,
        shopName: shopName.trim(),
        category: shopCategory,
        address: shopAddress.trim(),
        latitude: parseFloat(shopLat) || 12.9716,
        longitude: parseFloat(shopLng) || 77.5946,
        openingTime,
        closingTime,
        chairsCount: parseInt(chairsCount, 10) || 4,
      });
    } catch (err: any) {
      Alert.alert('Salon Registration Error', err.message || 'Could not register salon');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo fill buttons
  const fillDemoClient = () => {
    setLoginIdentifier('9876543210');
    setLoginPassword('password123');
  };

  const fillDemoOwner = () => {
    setLoginIdentifier('owner@aura.com');
    setLoginPassword('password123');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Identity Header */}
      <View style={styles.brandHero}>
        <View style={styles.brandTitleRow}>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>AURA</Text>
          <View style={[styles.brandDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>SALON ATELIER</Text>
        </View>
        <Text style={[styles.heroDescription, { color: colors.textTertiary }]}>
          Exclusive salon appointments, real-time queues & verified slot arrival
        </Text>
      </View>

      {/* Navigation Tabs */}
      <View style={[styles.tabsWrapper, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('signin')}
          style={[
            styles.tabButton,
            activeTab === 'signin' && [styles.tabButtonActive, { backgroundColor: colors.accent }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'signin' ? colors.accentText : colors.textSecondary, fontWeight: activeTab === 'signin' ? '700' : '500' },
            ]}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('client_signup')}
          style={[
            styles.tabButton,
            activeTab === 'client_signup' && [styles.tabButtonActive, { backgroundColor: colors.accent }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'client_signup' ? colors.accentText : colors.textSecondary, fontWeight: activeTab === 'client_signup' ? '700' : '500' },
            ]}
          >
            Client (OTP)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('owner_signup')}
          style={[
            styles.tabButton,
            activeTab === 'owner_signup' && [styles.tabButtonActive, { backgroundColor: colors.accent }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'owner_signup' ? colors.accentText : colors.textSecondary, fontWeight: activeTab === 'owner_signup' ? '700' : '500' },
            ]}
          >
            Salon Owner
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Glassmorphic Auth Card */}
      <View style={[styles.card, getCardStyle()]}>
        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <View>
            <Text style={[styles.formHeading, { color: colors.textPrimary }]}>Welcome Back</Text>
            <Text style={[styles.formSub, { color: colors.textSecondary }]}>
              Enter your mobile number or email to access your personal portal
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PHONE NUMBER OR EMAIL</Text>
            <TextInput
              placeholder="e.g. 9876543210 or name@example.com"
              placeholderTextColor={colors.textTertiary}
              value={loginIdentifier}
              onChangeText={setLoginIdentifier}
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
            <TextInput
              placeholder="Your secure password"
              placeholderTextColor={colors.textTertiary}
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={submitting}
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.accentText} size="small" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.accentText }]}>
                  Sign In to Portal
                </Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Fillers for testing */}
            <View style={[styles.demoBox, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.demoTitle, { color: colors.textTertiary }]}>1-Tap Demo Logins:</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity onPress={fillDemoClient} style={[styles.demoChip, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.demoChipText, { color: colors.textPrimary }]}>👤 Demo Client (Priya)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={fillDemoOwner} style={[styles.demoChip, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.demoChipText, { color: colors.textPrimary }]}>✂️ Demo Owner (Aura)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: CLIENT SIGN UP (NAME + PHONE NUMBER FOR OTP) */}
        {activeTab === 'client_signup' && (
          <View>
            <Text style={[styles.formHeading, { color: colors.textPrimary }]}>Client Registration</Text>
            <Text style={[styles.formSub, { color: colors.textSecondary }]}>
              Register with your phone number and verify via instant 6-digit OTP
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
            <TextInput
              placeholder="e.g. Priya Nair"
              placeholderTextColor={colors.textTertiary}
              value={clientName}
              onChangeText={setClientName}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>MOBILE PHONE NUMBER</Text>
            <View style={styles.otpRow}>
              <TextInput
                placeholder="e.g. 9876543210"
                placeholderTextColor={colors.textTertiary}
                value={clientPhone}
                onChangeText={setClientPhone}
                keyboardType="phone-pad"
                style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
              />
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={sendingOtp}
                style={[styles.otpBtn, { backgroundColor: colors.accent }]}
              >
                {sendingOtp ? (
                  <ActivityIndicator color={colors.accentText} size="small" />
                ) : (
                  <Text style={[styles.otpBtnText, { color: colors.accentText }]}>
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* OTP Verification Box */}
            {otpSent && (
              <View style={[styles.otpSection, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
                {demoOtpHint && (
                  <View style={[styles.hintPill, { backgroundColor: colors.successBg }]}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={[styles.hintText, { color: colors.success }]}>
                      Demo 6-Digit OTP: <Text style={{ fontWeight: '800' }}>{demoOtpHint}</Text> (Auto-filled)
                    </Text>
                  </View>
                )}

                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>ENTER 6-DIGIT OTP CODE</Text>
                <TextInput
                  placeholder="e.g. 482915"
                  placeholderTextColor={colors.textTertiary}
                  value={clientOtp}
                  onChangeText={setClientOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  style={[styles.input, styles.otpCodeInput, { backgroundColor: colors.inputBg, borderColor: colors.accent, color: colors.textPrimary }]}
                />
              </View>
            )}

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>SET PASSWORD</Text>
            <TextInput
              placeholder="Create a password"
              placeholderTextColor={colors.textTertiary}
              value={clientPassword}
              onChangeText={setClientPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleClientSignUp}
              disabled={submitting || !otpSent}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: otpSent ? colors.accent : colors.surfaceMuted,
                  opacity: otpSent ? 1 : 0.6,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.accentText} size="small" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: otpSent ? colors.accentText : colors.textSecondary }]}>
                  {otpSent ? 'Verify OTP & Create Account' : 'Send OTP to Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: SALON OWNER SIGN UP (WITH SHOP DETAILS & GPS ACCESS) */}
        {activeTab === 'owner_signup' && (
          <View>
            <Text style={[styles.formHeading, { color: colors.textPrimary }]}>Salon Owner Registration</Text>
            <Text style={[styles.formSub, { color: colors.textSecondary }]}>
              Register your salon atelier and manage daily morning opening and evening closing
            </Text>

            {/* Owner Section */}
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>1. Owner Account</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>OWNER NAME</Text>
            <TextInput
              placeholder="e.g. Alexandre Durand"
              placeholderTextColor={colors.textTertiary}
              value={ownerName}
              onChangeText={setOwnerName}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL</Text>
                <TextInput
                  placeholder="owner@salon.com"
                  placeholderTextColor={colors.textTertiary}
                  value={ownerEmail}
                  onChangeText={setOwnerEmail}
                  autoCapitalize="none"
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PHONE</Text>
                <TextInput
                  placeholder="9845011223"
                  placeholderTextColor={colors.textTertiary}
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                  keyboardType="phone-pad"
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
            <TextInput
              placeholder="Create owner password"
              placeholderTextColor={colors.textTertiary}
              value={ownerPassword}
              onChangeText={setOwnerPassword}
              secureTextEntry
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            {/* Shop Details Section */}
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 14 }]}>
              2. Salon Shop Details
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>SALON / SHOP NAME</Text>
            <TextInput
              placeholder="e.g. Velvet & Blade Atelier"
              placeholderTextColor={colors.textTertiary}
              value={shopName}
              onChangeText={setShopName}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CATEGORY / TYPE</Text>
            <TextInput
              placeholder="e.g. Hair Atelier & Spa, Barber Studio"
              placeholderTextColor={colors.textTertiary}
              value={shopCategory}
              onChangeText={setShopCategory}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>SHOP PHYSICAL ADDRESS</Text>
            <TextInput
              placeholder="e.g. 58 Koramangala 4th Block, Bengaluru"
              placeholderTextColor={colors.textTertiary}
              value={shopAddress}
              onChangeText={setShopAddress}
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
            />

            {/* GPS Location Button */}
            <View style={styles.locationRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>GPS COORDINATES</Text>
                <Text style={[styles.coordText, { color: colors.textPrimary }]}>
                  Lat: {shopLat} • Lng: {shopLng}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={locating}
                style={[styles.detectBtn, { borderColor: colors.cardBorder, backgroundColor: colors.surfaceMuted }]}
              >
                {locating ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="location-outline" size={13} color={colors.textPrimary} style={{ marginRight: 4 }} />
                    <Text style={[styles.detectBtnText, { color: colors.textPrimary }]}>Current GPS</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Capacity & Opening Hours */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CHAIRS CAPACITY</Text>
                <TextInput
                  placeholder="4"
                  placeholderTextColor={colors.textTertiary}
                  value={chairsCount}
                  onChangeText={setChairsCount}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>HOURS</Text>
                <TextInput
                  placeholder="09:00 AM - 09:00 PM"
                  placeholderTextColor={colors.textTertiary}
                  value={`${openingTime} - ${closingTime}`}
                  editable={false}
                  style={[styles.input, { backgroundColor: colors.surfaceMuted, borderColor: colors.inputBorder, color: colors.textSecondary }]}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOwnerSignUp}
              disabled={submitting}
              style={[styles.primaryBtn, { backgroundColor: colors.accent, marginTop: 12 }]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.accentText} size="small" />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.accentText }]}>
                  Register Salon & Open Owner Portal
                </Text>
              )}
            </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 8,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  heroDescription: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 4,
    lineHeight: 16,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    width: '100%',
    maxWidth: 420,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabButtonActive: {
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 11,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  formSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  primaryBtn: {
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  otpBtn: {
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  otpSection: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 11,
  },
  otpCodeInput: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 0,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 6,
  },
  coordText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  detectBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  demoBox: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  demoChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
