import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppIcon } from '../AppIcon';

export const OwnerScheduleView: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const { user } = useAuth();

  const slots = [
    { time: '10:00 AM', client: 'Arjun Mehta', service: 'Signature Haircut', chair: 'Chair 1', status: 'Completed' },
    { time: '11:15 AM', client: 'Rohit Verma', service: 'Beard Trim & Sculpt', chair: 'Chair 2', status: 'In Progress' },
    { time: '12:00 PM', client: 'Sameer Joshi', service: 'Hair Spa & Scalp Detox', chair: 'Chair 1', status: 'Reserved' },
    { time: '01:30 PM', client: 'Vikram Malhotra', service: 'Executive Styling', chair: 'Chair 3', status: 'Reserved' },
    { time: '03:00 PM', client: 'Kunal Singhania', service: 'Hair Color & Wash', chair: 'Chair 2', status: 'Available' },
    { time: '04:15 PM', client: 'Deepak Sharma', service: 'Classic Cut', chair: 'Chair 1', status: 'Available' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {user?.salon?.name || 'My Salon'} • Schedule
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage time slots, chair allocations, and expected client arrivals
        </Text>
      </View>

      {slots.map((item, idx) => (
        <View key={idx} style={[styles.slotCard, getCardStyle()]}>
          <View style={styles.timeCol}>
            <Text style={[styles.timeText, { color: colors.accent }]}>{item.time}</Text>
            <View style={[styles.chairTag, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.chairText, { color: colors.textSecondary }]}>{item.chair}</Text>
            </View>
          </View>

          <View style={styles.detailCol}>
            <Text style={[styles.clientName, { color: colors.textPrimary }]}>{item.client}</Text>
            <Text style={[styles.serviceName, { color: colors.textSecondary }]}>{item.service}</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  item.status === 'Completed'
                    ? colors.surfaceMuted
                    : item.status === 'In Progress'
                    ? colors.accentLight
                    : colors.surfaceMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color:
                    item.status === 'Completed'
                      ? colors.success
                      : item.status === 'In Progress'
                      ? colors.accent
                      : colors.textTertiary,
                },
              ]}
            >
              {item.status}
            </Text>
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
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  timeCol: {
    width: 80,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  chairTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  chairText: {
    fontSize: 9,
    fontWeight: '700',
  },
  detailCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
