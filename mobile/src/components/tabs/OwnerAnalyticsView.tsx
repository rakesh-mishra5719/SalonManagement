import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AppIcon } from '../AppIcon';

export const OwnerAnalyticsView: React.FC = () => {
  const { colors, getCardStyle } = useTheme();
  const { ownerQueueDetails } = useApp();

  const completedCount = ownerQueueDetails?.completedTodayCount ?? 14;
  const inQueueCount = ownerQueueDetails?.waitingCount ?? 3;
  const avgWait = '18 mins';
  const estRevenue = '$560';

  const metrics = [
    { label: 'SERVED TODAY', value: completedCount.toString(), icon: 'checkmark-circle-outline' },
    { label: 'WAITING NOW', value: inQueueCount.toString(), icon: 'time-outline' },
    { label: 'AVG DURATION', value: avgWait, icon: 'stats-chart-outline' },
    { label: 'EST. REVENUE', value: estRevenue, icon: 'pricetag-outline' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Salon Performance Analytics</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Live footfall tracking and operational metrics
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.grid}>
        {metrics.map((item, idx) => (
          <View key={idx} style={[styles.metricCard, getCardStyle()]}>
            <View style={styles.metricTop}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <AppIcon name={item.icon} size={15} color={colors.accent} />
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Peak Hour Activity Breakdown */}
      <View style={[styles.chartCard, getCardStyle()]}>
        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>Peak Hours Activity</Text>
        <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
          Client arrivals across the day
        </Text>

        <View style={styles.barsContainer}>
          {[
            { hour: '10 AM', count: 4, height: 40 },
            { hour: '12 PM', count: 7, height: 70 },
            { hour: '02 PM', count: 5, height: 50 },
            { hour: '04 PM', count: 9, height: 90 },
            { hour: '06 PM', count: 8, height: 80 },
            { hour: '08 PM', count: 3, height: 30 },
          ].map((bar, idx) => (
            <View key={idx} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: bar.height, backgroundColor: colors.accent },
                  ]}
                />
              </View>
              <Text style={[styles.barHour, { color: colors.textTertiary }]}>{bar.hour}</Text>
            </View>
          ))}
        </View>
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  chartCard: {
    borderRadius: 18,
    padding: 18,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  chartSubtitle: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 10,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 95,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 20,
  },
  barFill: {
    width: 12,
    borderRadius: 6,
  },
  barHour: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 6,
  },
});
