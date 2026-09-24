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
import { DesignPattern } from '../types';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { mode, toggleMode, designPattern, setDesignPattern, colors, getCardStyle } = useTheme();
  const { refreshSalons } = useApp();
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());

  const handleSaveServerUrl = () => {
    setApiBaseUrl(serverUrl);
    refreshSalons();
    onClose();
  };

  const patternOptions: { id: DesignPattern; label: string; desc: string; icon: any }[] = [
    {
      id: 'glassmorphism',
      label: 'Glassmorphism',
      desc: 'Translucent frosted glass with blurred backdrops & luminous borders',
      icon: 'sparkles-outline',
    },
    {
      id: 'flat-minimal',
      label: 'Minimal Flat',
      desc: 'Clean stark surfaces, sharp borders & ultra-airy typography',
      icon: 'square-outline',
    },
    {
      id: 'neumorphic',
      label: 'Soft Neumorphic',
      desc: 'Soft tactile bevels, gentle diffused shadows & embossed depth',
      icon: 'layers-outline',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, getCardStyle()]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Design Patterns & Core Preferences
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Design Pattern Selection (User Request) */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Design Pattern Style
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textTertiary }]}>
              Customize the surface styling and reflection depth
            </Text>

            {patternOptions.map((opt) => {
              const isSelected = designPattern === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={() => setDesignPattern(opt.id)}
                  style={[
                    styles.patternCard,
                    {
                      backgroundColor: isSelected ? colors.accentLight : colors.surfaceMuted,
                      borderColor: isSelected ? colors.accent : colors.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.patternIconBox}>
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={isSelected ? colors.accent : colors.textSecondary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.patternTitle,
                        {
                          color: colors.textPrimary,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={[styles.patternDesc, { color: colors.textSecondary }]}>
                      {opt.desc}
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
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  patternIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  patternDesc: {
    fontSize: 10,
    lineHeight: 14,
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
