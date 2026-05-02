import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { CustomSplash } from "@/components/CustomSplash";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="surah/[id]"
        options={{ title: "", headerBackTitle: "Quran", headerTintColor: "#2D8B6F" }}
      />
      <Stack.Screen
        name="names"
        options={{ title: "99 Names of Allah", headerBackTitle: "More", headerTintColor: "#2D8B6F" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Settings", headerBackTitle: "More", headerTintColor: "#2D8B6F" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [splashDone, setSplashDone] = useState(Platform.OS === "web");
  const nativeHidden = useRef(false);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !nativeHidden.current) {
      nativeHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
                {!splashDone && (
                  <CustomSplash onFinish={handleSplashFinish} />
                )}
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </AppProvider>
  );
}
