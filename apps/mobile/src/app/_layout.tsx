import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

import { AppRouteGate } from "@/components/app-route-gate";
import { CustomerProfileProvider } from "@/components/customer-profile";
import { UserSync } from "@/components/user-sync";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be set to use authentication.",
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <UserSync />
      <CustomerProfileProvider>
        <AppRouteGate />
      </CustomerProfileProvider>
    </ClerkProvider>
  );
}
