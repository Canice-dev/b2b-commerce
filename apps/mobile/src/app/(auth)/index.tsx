import "../../../global.css";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "../../../utils/constants";

export default function AuthScreen() {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleClicked = loadingStrategy === OAUTH.APPLE_OAUTH;

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
            Create an account to browse your distributor's catalogue and place
            orders.
          </Text>

          <View className="mt-8 gap-3">
            <Pressable
              onPress={() => handleSocialAuth("oauth_google")}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              className="h-[60px] flex-row items-center justify-center rounded-full bg-white active:opacity-80"
              disabled={loadingStrategy !== null}
            >
              {isGoogleClicked ? (
                <ActivityIndicator size="small" color="#161616" />
              ) : (
                <Text className="text-[17px] font-bold text-[#161616]">
                  Continue with Google
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => handleSocialAuth("oauth_apple")}
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              className="h-[60px] flex-row items-center justify-center rounded-full bg-black/80 active:opacity-80"
              disabled={loadingStrategy !== null}
            >
              {isAppleClicked ? (
                <ActivityIndicator size="small" color="#161616" />
              ) : (
                <Text className="text-[17px] font-bold text-[#161616]">
                  Continue with Apple
                </Text>
              )}
            </Pressable>
          </View>

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
