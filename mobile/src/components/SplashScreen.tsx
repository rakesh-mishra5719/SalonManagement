import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 2000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance animation: Fade in + slight zoom
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle pulse loop on the logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 3. Exit timeout
    const timer = setTimeout(() => {
      if (onFinish) {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          pulseLoop.stop();
          onFinish();
        });
      }
    }, minDurationMs);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [minDurationMs, onFinish, fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Decorative ambient background circle */}
      <View style={styles.ambientGlow} />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}
      >
        {/* Logo Card with Neumorphic Drop Shadow */}
        <View style={styles.logoCard}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Typography */}
        {/* <Text style={styles.brandTitle}>HAJAMM</Text> */}
        <Text style={styles.brandTagline}>Skip the Wait, Look Your Best</Text>

        {/* Emerald Loading Spinner */}
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator size="small" color="#10B981" />
        </View>
      </Animated.View>

      {/* Bottom Sub-brand Footer */}
      <Animated.View style={[styles.footerWrapper, { opacity: fadeAnim }]}>
        <View style={styles.footerPill}>
          <View style={styles.liveIndicator} />
          <Text style={styles.footerText}>SMART SALON & BARBER QUEUE</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    top: '20%',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoCard: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 4,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    letterSpacing: 0.3,
    fontWeight: '500',
    textAlign: 'center',
  },
  spinnerWrapper: {
    marginTop: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    left: 0,
    right: 0,
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
});
