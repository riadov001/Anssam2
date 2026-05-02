import { useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function DhikrPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/dhikr" as any);
  }, [router]);
  return null;
}
