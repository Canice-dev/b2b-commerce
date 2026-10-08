import "../../../global.css";
import { useState } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";

export default function AuthScreen() {
  const [provider, setProvider] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function continueWith(providerName: "google" | "apple") {
    setError(null);
    setProvider(providerName);

    const { error: signInError } = await authClient.signIn.social({
      provider: providerName,
      callbackURL: "/onboarding",
    });

    setProvider(null);

    if (signInError) {
      setError(signInError.message ?? "Unable to sign in. Please try again.");
      // console.log("Error:", signInError);

      return;
    }

    router.replace("/onboarding");
  }

  return (
    <View className="flex-1 overflow-hidden bg-[#201305]">
      <Image
        className="absolute inset-0 h-full w-full"
        source={require("../../../assets/bg-image-1.png")}
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/30" />
      <StatusBar style="light" />

      <SafeAreaView className="flex-1 justify-between px-6 pb-4">
        <View className="pt-7">
          <Text className="text-2xl font-bold tracking-tight text-white">
            B2B SaaS
          </Text>
        </View>

        <View>
          <Text className="max-w-[330px] text-[40px] font-bold leading-[47px] tracking-[-1.4px] text-white">
            Let&apos;s get your business moving.
          </Text>
          <Text className="mt-4 max-w-[320px] text-lg font-medium leading-[25px] text-white/85">
            Sign in to browse your distributor&apos;s catalogue and place
            orders.
          </Text>

          <View className="mt-8 gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: provider !== null }}
              disabled={provider !== null}
              onPress={() => continueWith("google")}
              className="h-[60px] flex-row items-center justify-center rounded-full bg-white active:opacity-80"
            >
              <Text className="mr-3 text-xl font-bold text-[#4285F4]">G</Text>
              <Text className="text-[17px] font-bold text-[#161616]">
                {provider === "google"
                  ? "Connecting..."
                  : "Continue with Google"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: provider !== null }}
              disabled={provider !== null}
              onPress={() => continueWith("apple")}
              className="h-[60px] flex-row items-center justify-center rounded-full bg-black/80 active:opacity-80"
            >
              <Text className="mr-3 text-[23px] text-white">●</Text>
              <Text className="text-[17px] font-bold text-white">
                {provider === "apple" ? "Connecting..." : "Continue with Apple"}
              </Text>
            </Pressable>
          </View>

          {error ? (
            <Text
              accessibilityRole="alert"
              className="mt-4 text-center text-sm text-red-200"
            >
              {error}
            </Text>
          ) : null}

          <Text className="mt-5 px-2 text-center text-xs leading-[17px] text-white/70">
            By continuing, you agree to our{" "}
            <Text className="font-bold text-white">Terms</Text> &amp;{" "}
            <Text className="font-bold text-white">Privacy Policy</Text> and
            allow access to your location.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
