import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";

export default function OnboardingLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return <Redirect href={"/(auth)"} />;
  }
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
