import "../../../global.css";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";

export default function BusinessDetailsScreen() {
  const isDark = useColorScheme() === "dark";
  const colors = isDark
    ? {
        background: "#090D0B",
        surface: "#151B17",
        border: "#344239",
        text: "#F5FAF6",
        muted: "#A5B4A9",
      }
    : {
        background: "#FAFCFA",
        surface: "#FFFFFF",
        border: "#DDE6DF",
        text: "#10261A",
        muted: "#6D8174",
      };
  const {
    address,
    businessName,
    businessType,
    phone,
    setAddress,
    setBusinessName,
    setBusinessType,
    setPhone,
  } = useOnboarding();

  function continueToMarket() {
    if (
      !businessName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !businessType
    ) {
      Alert.alert(
        "Complete your business details",
        "Enter your business name, phone number, shop address, and business type.",
      );
      return;
    }
    router.push("/onboarding/step-2");
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 pb-7 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingHeader colors={colors} step={1} />
          <View className="flex-1 pt-10">
            <Text
              className="text-[32px] font-extrabold leading-[38px] tracking-[-0.8px]"
              style={{ color: colors.text }}
            >
              Tell us about your business
            </Text>
            <Text
              className="mt-3 text-base leading-6"
              style={{ color: colors.muted }}
            >
              We&apos;ll use these details to prepare your ordering account.
            </Text>
            <Field colors={colors} label="Business name">
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Ada's Provision Store"
                placeholderTextColor={colors.muted}
                className="h-14 px-4 text-base"
                style={{ color: colors.text }}
              />
            </Field>
            <Field colors={colors} label="Phone number">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="0800 000 0000"
                placeholderTextColor={colors.muted}
                className="h-14 px-4 text-base"
                style={{ color: colors.text }}
              />
            </Field>
            <Field colors={colors} label="Shop address">
              <TextInput
                value={address}
                onChangeText={setAddress}
                multiline
                textAlignVertical="top"
                placeholder="Street, building or nearby landmark"
                placeholderTextColor={colors.muted}
                className="min-h-[94px] px-4 py-4 text-base"
                style={{ color: colors.text }}
              />
            </Field>
            <Text
              className="mt-6 text-sm font-bold"
              style={{ color: colors.text }}
            >
              Business type
            </Text>
            <View className="mt-3 flex-row gap-3">
              {(["retailer", "wholesaler"] as const).map((type) => {
                const selected = businessType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setBusinessType(type)}
                    className="flex-1 rounded-2xl border px-4 py-4 active:opacity-80"
                    style={{
                      borderColor: selected ? "#07853C" : colors.border,
                      backgroundColor: selected
                        ? isDark
                          ? "#123620"
                          : "#EAF7EE"
                        : colors.surface,
                    }}
                  >
                    <Text
                      className="text-base font-bold capitalize"
                      style={{ color: selected ? "#07853C" : colors.text }}
                    >
                      {type}
                    </Text>
                    <Text
                      className="mt-1 text-xs leading-4"
                      style={{ color: colors.muted }}
                    >
                      {type === "retailer"
                        ? "Sell directly to customers"
                        : "Buy stock for resale"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={continueToMarket}
              className="mt-auto h-14 items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: colors.text }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: colors.background }}
              >
                Continue
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function Field({
  children,
  colors,
  label,
}: {
  children: React.ReactNode;
  colors: { border: string; surface: string; text: string };
  label: string;
}) {
  return (
    <View className="mt-5">
      <Text className="mb-2 text-sm font-bold" style={{ color: colors.text }}>
        {label}
      </Text>
      <View
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        {children}
      </View>
    </View>
  );
}
