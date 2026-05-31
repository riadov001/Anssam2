import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

interface SplashProps {
  onFinish: () => void;
}

export function CustomSplash({ onFinish }: SplashProps) {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const spiAnim = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoAnim, { toValue: 1, duration: 620, useNativeDriver: true }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.timing(spiAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(screenFade, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, [logoAnim, spiAnim, screenFade, logoScale, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      {/* Anssam Logo */}
      <Animated.View
        style={[
          styles.appSection,
          { opacity: logoAnim, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.appIconWrap}>
          <Image source={require("../assets/images/icon.png")} style={styles.appIcon} />
        </View>
        <Text style={styles.appName}>Anssam</Text>
        <Text style={styles.appArabic}>أنسام</Text>
        <Text style={styles.appTagline}>Islamic Companion</Text>
      </Animated.View>

      {/* SPI Attribution */}
      <Animated.View
        style={[
          styles.spiSection,
          {
            opacity: spiAnim,
            transform: [
              {
                translateY: spiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.spiDivider} />
        <Text style={styles.madeBy}>Conçu par</Text>
        <View style={styles.spiRow}>
          <View style={styles.spiLogoWrap}>
            <Image
              source={require("../assets/images/spi-logo.jpg")}
              style={styles.spiLogo}
              resizeMode="cover"
            />
          </View>
          <View style={styles.spiTextCol}>
            <Text style={styles.spiName}>Straight Path</Text>
            <Text style={styles.spiNameAccent}>Intelligence</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0D1B14",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  appSection: {
    alignItems: "center",
    gap: 10,
    marginBottom: 60,
  },
  appIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#2D8B6F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    marginBottom: 4,
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    color: "#ffffff",
    letterSpacing: 2,
  },
  appArabic: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#C9A065",
    marginTop: -6,
  },
  appTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#2D8B6F",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 2,
  },
  spiSection: {
    position: "absolute",
    bottom: 48,
    alignItems: "center",
    gap: 10,
  },
  spiDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 2,
  },
  madeBy: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  spiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  spiLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.4)",
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  spiLogo: {
    width: 36,
    height: 36,
  },
  spiTextCol: {
    gap: 0,
  },
  spiName: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  spiNameAccent: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#2D8B6F",
    letterSpacing: 0.4,
    lineHeight: 18,
  },
});
