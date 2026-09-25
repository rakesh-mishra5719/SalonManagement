import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { mode, toggleMode, colors, getCardStyle } = useTheme();
  const { refreshSalons } = useApp();
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());

  const handleSaveServerUrl = () => {
    setApiBaseUrl(serverUrl);
    refreshSalons();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, getCardStyle()]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Preferences & Server Connection
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Fixed Design Style Notice */}
            <View
              style={[
                styles.styleBanner,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={[styles.styleIconBox, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="layers-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.styleBannerTitle, { color: colors.textPrimary }]}>
                  Soft Neumorphic Design
                </Text>
                <Text style={[styles.styleBannerSub, { color: colors.textSecondary }]}>
                  Fixed default tactile bevels & embossed ambient depth
                </Text>
              </View>
            </View>

            {/* Theme Mode Switch */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Theme Mode
            </Text>
            <View style={[styles.themeRow, { borderColor: colors.cardBorder, backgroundColor: colors.surfaceMuted }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>
                  {mode === 'light' ? 'Minimal Light Mode (Active)' : 'Night Onyx Mode (Active)'}
                </Text>
                <Text style={[styles.themeSub, { color: colors.textSecondary }]}>
                  Default is light mode with subtle high-contrast accents
                </Text>
              </View>

              <TouchableOpacity
                onPress={toggleMode}
                style={[styles.toggleBtn, { backgroundColor: colors.accent }]}
              >
                {/* Mode switch icon */}
                <Ionicons
                  name={mode === 'light' ? 'moon' : 'sunny'}
                  size={12}
                  color={colors.accentText}
                />
              </TouchableOpacity>
            </View>

            {/* High Concurrency Server API URL */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Spring Boot API Endpoint
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textTertiary }]}>
              Connect mobile devices to Spring Boot local backend
            </Text>

            <TextInput
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              style={[
                styles.urlInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleSaveServerUrl}
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.saveBtnText, { color: colors.accentText }]}>
                Apply & Save Preferences
              </Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  sectionDesc: {
    fontSize: 11,
    marginBottom: 10,
  },
  styleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 8,
    gap: 12,
  },
  styleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  styleBannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeSub: {
    fontSize: 10,
    marginTop: 2,
  },
  toggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    marginBottom: 14,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
