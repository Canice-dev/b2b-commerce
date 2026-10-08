import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_MOBILE_API_URL;

if (!baseURL) {
  throw new Error(
    "EXPO_PUBLIC_MOBILE_API_URL must point to the mobile API server.",
  );
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "mobile",
      storage: SecureStore,
      storagePrefix: "b2b-commerce",
    }),
  ],
});
