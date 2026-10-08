import { useRouter } from "expo-router";
import "../../global.css";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const router = useRouter();
  return (
    <View className="flex-1 overflow-hidden bg-black">
      <Image
        className="absolute inset-0 h-full w-full"
        source={require("../../assets/bg-image-1.png")}
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black/25" />
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 justify-between px-[26px]">
        <View className="pt-[74px]">
          <Text className="mb-10 text-2xl font-bold tracking-tight text-white">
            B2B SaaS
          </Text>
        </View>

        <View className="flex-1" />

        <View className="pb-3">
          <Text className="max-w-[345px] text-[40px] font-bold leading-[48px] tracking-[-1.45px] text-white">
            Order stock. Grow your business.
          </Text>
          <Text className="mb-8 mt-4 max-w-[350px] text-lg font-medium leading-[25px] tracking-[-0.28px] text-white/90">
            Shop your assigned distributor&apos;s catalogue and place orders in
            minutes.
          </Text>
          <View className="gap-[15px]">
            <Pressable
              onPress={() => router.push("/(auth)")}
              className="h-[61px] items-center justify-center rounded-full bg-white active:opacity-80"
            >
              <Text className="text-xl font-bold tracking-[-0.45px] text-[#111114]">
                Create Account
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(auth)")}
              className="h-[61px] items-center justify-center rounded-full border border-white/10 bg-[#0E0E13]/70 active:opacity-80"
            >
              <Text className="text-xl font-bold tracking-[-0.45px] text-white">
                Log In
              </Text>
            </Pressable>
          </View>
          <Text className="mt-5 px-3 text-center text-xs leading-[17px] text-white/75">
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
