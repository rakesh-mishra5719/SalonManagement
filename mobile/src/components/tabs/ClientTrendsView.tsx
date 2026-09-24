import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppIcon } from '../AppIcon';

interface ClientTrendsViewProps {
  onSelectService?: (serviceName: string) => void;
}

export const ClientTrendsView: React.FC<ClientTrendsViewProps> = ({ onSelectService }) => {
  const { colors, getCardStyle } = useTheme();

  const trends = [
    {
      id: '1',
      title: 'Textured French Crop',
      category: 'Men Hair',
      time: '30 mins',
      popular: 'Top Trending',
      desc: 'Clean mid-fade with textured fringe on top. Low maintenance and sharp modern look.',
    },
    {
      id: '2',
      title: 'Sculpted Royal Beard',
      category: 'Beard & Care',
      time: '25 mins',
      popular: 'Most Requested',
      desc: 'Hot towel steam prep, precision straight-razor cheek line, and nourishing argan oil finish.',
    },
    {
      id: '3',
      title: 'Korean Glass Hair Spa',
      category: 'Hair Treatment',
      time: '45 mins',
      popular: 'Luxury Pick',
      desc: 'Deep conditioning keratin protein infusion for mirror shine and heat damage repair.',
    },
    {
      id: '4',
      title: 'Charcoal Detox Facial',
      category: 'Skin Wellness',
      time: '40 mins',
      popular: 'Seasonal',
      desc: 'Activated bamboo charcoal scrub, ultrasonic pore cleansing, and organic cooling aloe mask.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Style & Grooming Trends</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Curated aesthetics and treatments trending at luxury partner salons
        </Text>
      </View>

      {trends.map((item) => (
        <View key={item.id} style={[styles.trendCard, getCardStyle()]}>
          <View style={styles.topRow}>
            <View style={[styles.categoryTag, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                {item.category}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>
                ✨ {item.popular}
              </Text>
            </View>
          </View>

          <Text style={[styles.trendTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.trendDesc, { color: colors.textSecondary }]}>{item.desc}</Text>

          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            <View style={styles.timeWrap}>
              <AppIcon name="time-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.timeText, { color: colors.textTertiary }]}>~{item.time}</Text>
            </View>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.accent }]}
              onPress={() => onSelectService && onSelectService(item.title)}
              activeOpacity={0.8}
            >
              <Text style={[styles.bookBtnText, { color: colors.accentText }]}>
                Book Style
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  trendCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  trendDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
