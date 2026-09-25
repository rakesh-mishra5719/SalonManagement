import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { AppIcon } from './AppIcon';
import { ProfileGoogleMapView } from './ProfileGoogleMapView';
import { EditSalonModal } from './EditSalonModal';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { colors, getCardStyle } = useTheme();
  const { user, logout } = useAuth();
  const { userLocation } = useApp();

  const [editSalonOpen, setEditSalonOpen] = useState(false);

  if (!user) return null;

  const targetLat = (user.role === 'OWNER' && user.salon?.latitude) ? user.salon.latitude : userLocation.lat;
  const targetLng = (user.role === 'OWNER' && user.salon?.longitude) ? user.salon.longitude : userLocation.lng;

  const handleLogout = () => {
    onClose();
    logout();
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, getCardStyle()]}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Account Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppIcon name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {/* User Avatar & Headline */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
                <Text style={[styles.avatarLetter, { color: colors.accentText }]}>{initial}</Text>
              </View>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.roleBadgeText, { color: colors.textPrimary }]}>
                  {user.role === 'OWNER' ? 'Salon Partner & Owner' : 'Verified Client'}
                </Text>
              </View>
            </View>

            {/* Profile Information List */}
            <View style={[styles.infoCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
              {user.phone && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>PHONE</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.phone}</Text>
                </View>
              )}

              {user.email && (
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>EMAIL</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.email}</Text>
                </View>
              )}

              <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ACCOUNT TYPE</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                  {user.role === 'OWNER' ? 'Salon Management Portal' : 'End User / Customer'}
                </Text>
              </View>
            </View>

            {/* Salon Shop Details (If Owner) */}
            {user.role === 'OWNER' && user.salon && (
              <View style={[styles.shopCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.cardBorder }]}>
                <View style={styles.shopCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppIcon name="storefront-outline" size={15} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[styles.shopCardTitle, { color: colors.textPrimary }]}>
                      Registered Shop Details
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setEditSalonOpen(true)}
                    style={[styles.editShopBtn, { backgroundColor: colors.accent }]}
                  >
                    <AppIcon name="create-outline" size={12} color={colors.accentText} style={{ marginRight: 3 }} />
                    <Text style={[styles.editShopBtnText, { color: colors.accentText }]}>Edit Details</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>SALON NAME</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {user.salon.name}
                  </Text>
                </View>

                {user.salon.category && (
                  <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                      {user.salon.category}
                    </Text>
                  </View>
                )}

                {user.salon.address && (
                  <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ADDRESS</Text>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                      {user.salon.address}
                    </Text>
                  </View>
                )}

                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CURRENT STATUS</Text>
                  <Text style={[styles.infoValue, { color: user.salon.isOpen ? colors.success : colors.danger }]}>
                    {user.salon.isOpen ? '● Open (Morning)' : '○ Closed (Evening)'}
                  </Text>
                </View>
              </View>
            )}

            {/* Real Google Map (No Radar) */}
            {/* <ProfileGoogleMapView
              targetLat={targetLat}
              targetLng={targetLng}
              title={user.role === 'OWNER' ? 'Shop Location (Google Maps)' : 'Your Live Location (Google Maps)'}
              subtitle={
                user.role === 'OWNER'
                  ? 'Real-time Google Maps pin for your registered salon'
                  : 'Real-time GPS pinned on Google Maps'
              }
              salonName={user.role === 'OWNER' ? user.salon?.name : undefined}
            /> */}

            {/* User prompt requirement: "make out icon there" -> Prominent Logout Option */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={[styles.logoutBtn, { borderColor: colors.dangerBg, backgroundColor: colors.dangerBg }]}
            >
              <AppIcon name="log-out-outline" size={17} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.logoutBtnText, { color: colors.danger }]}>
                Log Out of Account
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Owner Edit Salon Details Modal */}
          {user.role === 'OWNER' && user.salon && (
            <EditSalonModal
              visible={editSalonOpen}
              salon={user.salon}
              onClose={() => setEditSalonOpen(false)}
            />
          )}
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
    maxHeight: '92%',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    maxHeight: 520,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  shopCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  shopCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  shopCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'right',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editShopBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
