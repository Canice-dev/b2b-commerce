import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  background: "#F7F6F3",
  surface: "#FFFFFF",
  border: "#E8E5DF",
  text: "#20201E",
  muted: "#85817A",
};

export default function Account() {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
          <Text
            className="text-2xl font-extrabold"
            style={{ color: colors.text }}
          >
            Your account
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
            Manage your profile and orders.
          </Text>

          <Link href="/account/orders" asChild>
            <Pressable
              className="mt-6 flex-row items-center rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: "#F0EEEA" }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color={colors.text}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  My orders
                </Text>
                <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                  View orders you’ve placed
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </Link>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
