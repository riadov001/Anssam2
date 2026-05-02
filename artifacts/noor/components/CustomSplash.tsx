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
          styles.spiRow,
          {
            opacity: spiAnim,
            transform: [
              {
                translateY: spiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.madeBy}>Made by</Text>
        <View style={styles.spiLogoWrap}>
          <Image
            source={require("../assets/images/spi-logo.jpg")}
            style={styles.spiLogo}
          />
        </View>
        <Text style={styles.spiName}>Straight Path Intelligence</Text>
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
  spiRow: {
    position: "absolute",
    bottom: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  madeBy: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.5,
  },
  spiLogoWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  spiLogo: {
    width: 22,
    height: 22,
  },
  spiName: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3,
  },
});
