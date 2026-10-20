import { useAuth } from "@clerk/expo";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useCustomerProfile } from "@/components/customer-profile";

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#FAFCFA]">
      <ActivityIndicator color="#07853C" />
    </View>
  );
}

export function AppRouteGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading, isOnboardingComplete } = useCustomerProfile();

  if (!isLoaded || (isSignedIn && isLoading)) return <LoadingScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn && !isOnboardingComplete}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn && isOnboardingComplete}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Screen name="oauth-callback" />
      <Stack.Screen name="sso-callback" />
    </Stack>
  );
}
