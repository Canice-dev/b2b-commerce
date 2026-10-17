import "../../../global.css";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
// import { Image as ExpoImage } from "expo-image";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "@/utils/constants";

export default function AuthScreen() {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const { isLoaded, isSignedIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark
    ? {
        background: "#090D0B",
        text: "#F5FAF6",
        mutedText: "#A8B5AC",
        googleButton: "#171C19",
        border: "#303A34",
      }
    : {
        background: "#FAFCFA",
        text: "#10261A",
        mutedText: "#6D8174",
        googleButton: "#FFFFFF",
        border: "#E7ECE8",
      };

  const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleClicked = loadingStrategy === OAUTH.APPLE_OAUTH;

  if (isLoaded && isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <SafeAreaView className="flex-1 justify-between px-6 pb-5">
        <View className="items-center pt-3">
          <View className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#07853C]">
              <Text className="text-sm font-black text-white">TL</Text>
            </View>
            <Text
              className="text-xl font-extrabold tracking-tight"
              style={{ color: colors.text }}
            >
              TradeLink
            </Text>
          </View>
        </View>

        <View className="items-center">
          <Image
            source={require("../../../assets/image-mark.png")}
            resizeMode="contain"
            className="h-[300px] w-full"
            accessibilityLabel="TradeLink commerce platform preview"
          />
          <Text
            className="mt-3 text-center text-[34px] font-extrabold leading-[40px] tracking-[-1px]"
            style={{ color: colors.text }}
          >
            Powering your business, together.
          </Text>
          <Text
            className="mt-3 max-w-[325px] text-center text-base leading-[23px]"
            style={{ color: colors.mutedText }}
          >
            Browse your distributor&apos;s catalogue and place orders with ease.
          </Text>
        </View>

        <View>
          <View className="gap-3">
            <Pressable
              onPress={() => handleSocialAuth("oauth_apple")}
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              className="h-[58px] flex-row items-center justify-center rounded-full bg-black active:opacity-80"
              disabled={loadingStrategy !== null}
            >
              {isAppleClicked ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="mr-2 text-[22px] leading-6 text-white">
                    
                  </Text>
                  <Text className="text-[17px] font-bold text-white">
                    Continue with Apple
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => handleSocialAuth("oauth_google")}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              className="h-[58px] flex-row items-center justify-center rounded-full active:opacity-80"
              style={{
                backgroundColor: colors.googleButton,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              disabled={loadingStrategy !== null}
            >
              {isGoogleClicked ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <View className="flex-row items-center">
                  <Image
                    source={require("../../../assets/images/google-g (1).svg")}
                    resizeMode="contain"
                    className="mr-3 h-5 w-5"
                    accessibilityLabel="Google"
                  />
                  <Text
                    className="text-[17px] font-bold"
                    style={{ color: colors.text }}
                  >
                    Continue with Google
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <Text
            className="mt-5 px-3 text-center text-xs leading-[17px]"
            style={{ color: colors.mutedText }}
          >
            By continuing, you agree to our{" "}
            <Text className="font-bold" style={{ color: colors.text }}>
              Terms
            </Text>{" "}
            &amp;{" "}
            <Text className="font-bold" style={{ color: colors.text }}>
              Privacy Policy
            </Text>{" "}
            and allow access to your location.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
