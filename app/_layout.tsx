import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePushNotifications, clearBadgeCount } from "@/hooks/usePushNotifications";
import { useEffect, useRef } from "react";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  environment: __DEV__ ? "development" : "production",
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 24h stale time — competitions list is readable offline (PRD §6)
      staleTime: 1000 * 60 * 60 * 24,
      retry: 2,
    },
  },
});

/**
 * Component that connects push notifications to AuthContext and handles navigation.
 *
 * T5.1 — Foreground notifications show banner/alert automatically
 * T5.2 — Badge count updated automatically, cleared when app becomes active
 * T5.3 — Notification taps handled with deep linking
 * T5.4 — Competition notifications navigate to competition detail
 * T5.5 — Payment notifications navigate to My Registrations
 *
 * T5.6 — Testing checklist (requires physical devices):
 * iOS:
 * - [ ] Foreground notification shows banner
 * - [ ] Background notification updates badge
 * - [ ] Tapping notification navigates to correct screen
 * - [ ] Badge clears when app becomes active
 * Android:
 * - [ ] Foreground notification shows alert
 * - [ ] Background notification appears in notification tray
 * - [ ] Tapping notification navigates to correct screen
 * - [ ] Notification channel configured correctly
 */
function PushNotificationHandler() {
  const router = useRouter();
  const { setPushToken } = useAuth();
  const appState = useRef(AppState.currentState);

  // T5.3-T5.5 — Handle notification taps and deep linking
  const handleNotificationTap = (data: Record<string, any>) => {
    const notificationType = data.type as string;
    const compId = data.compId as string;
    const registrationId = data.registrationId as string;

    console.log("Handling notification tap:", { notificationType, compId, registrationId });

    switch (notificationType) {
      case "registration_created":
      case "deadline_reminder":
      case "competition_reminder":
        // T5.4 — Navigate to competition detail
        if (compId) {
          router.push(`/(tabs)/competitions/${compId}`);
        }
        break;

      case "payment_success":
        // T5.5 — Navigate to My Registrations → Ongoing tab (paid competitions)
        router.push("/(tabs)/my-competitions?tab=Ongoing");
        break;

      case "payment_pending":
      case "payment_failed":
        // T5.5 — Navigate to My Registrations → Upcoming tab (unpaid/pending competitions)
        router.push("/(tabs)/my-competitions?tab=Upcoming");
        break;

      default:
        console.warn("Unknown notification type:", notificationType);
        break;
    }

    // T5.2 — Clear badge when user taps notification
    clearBadgeCount().catch((err) => console.warn("Failed to clear badge:", err));
  };

  const { expoPushToken, error } = usePushNotifications({
    onNotificationTap: handleNotificationTap,
  });

  useEffect(() => {
    if (expoPushToken) {
      console.log("Expo Push Token received:", expoPushToken);
      setPushToken(expoPushToken);
    }
  }, [expoPushToken, setPushToken]);

  useEffect(() => {
    if (error) {
      console.warn("Push notification error:", error);
    }
  }, [error]);

  // T5.2 — Clear badge count when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground
        clearBadgeCount().catch((err) => console.warn("Failed to clear badge:", err));
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PushNotificationHandler />
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)/index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/register" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(payment)" options={{ presentation: "modal" }} />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
