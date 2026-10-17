import "../../../global.css";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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

export default function MarketLocationScreen() {
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
    acceptedLegalTerms,
    completeOnboarding,
    isComplete,
    isLoadingMarkets,
    isSubmitting,
    marketError,
    markets,
    selectedMarket,
    setAcceptedLegalTerms,
    setSelectedMarket,
  } = useOnboarding();
  const [marketQuery, setMarketQuery] = useState("");
  const matchingMarkets = useMemo(() => {
    const query = marketQuery.trim().toLowerCase();
    return query
      ? markets.filter((market) =>
          `${market.name} ${market.localGovernmentArea} ${market.state}`
            .toLowerCase()
            .includes(query),
        )
      : markets;
  }, [marketQuery, markets]);

  async function submit() {
    const error = await completeOnboarding();
    if (error) Alert.alert("Couldn’t complete setup", error);
  }

  if (isComplete)
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#07853C]">
          <Text className="text-3xl font-bold text-white">✓</Text>
        </View>
        <Text
          className="mt-6 text-center text-3xl font-extrabold"
          style={{ color: colors.text }}
        >
          You&apos;re all set
        </Text>
        <Text
          className="mt-3 text-center text-base leading-6"
          style={{ color: colors.muted }}
        >
          Your account is ready. Your assigned catalogue will be available
          shortly.
        </Text>
      </View>
    );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 pb-7 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingHeader colors={colors} step={2} />
          <View className="flex-1 pt-10">
            <Text
              className="text-[32px] font-extrabold leading-[38px] tracking-[-0.8px]"
              style={{ color: colors.text }}
            >
              Choose your market
            </Text>
            <Text
              className="mt-3 text-base leading-6"
              style={{ color: colors.muted }}
            >
              Select an approved market location to connect with the right
              distributor.
            </Text>
            <View
              className="mt-7 overflow-hidden rounded-2xl border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <TextInput
                value={marketQuery}
                onChangeText={setMarketQuery}
                placeholder="Search market, LGA, or state"
                placeholderTextColor={colors.muted}
                className="h-14 px-4 text-base"
                style={{ color: colors.text }}
              />
            </View>
            <View className="mt-3 gap-2">
              {isLoadingMarkets ? (
                <ActivityIndicator color="#07853C" className="mt-6" />
              ) : null}
              {marketError ? (
                <Text className="mt-4 text-sm text-red-500">{marketError}</Text>
              ) : null}
              {!isLoadingMarkets &&
                !marketError &&
                matchingMarkets.map((market) => {
                  const selected = selectedMarket?.id === market.id;
                  return (
                    <Pressable
                      key={market.id}
                      onPress={() => setSelectedMarket(market)}
                      className="rounded-2xl border px-4 py-4 active:opacity-80"
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
                        className="text-base font-bold"
                        style={{ color: colors.text }}
                      >
                        {market.name}
                      </Text>
                      <Text
                        className="mt-1 text-sm"
                        style={{ color: colors.muted }}
                      >
                        {market.localGovernmentArea}, {market.state}
                      </Text>
                    </Pressable>
                  );
                })}
              {!isLoadingMarkets &&
              !marketError &&
              marketQuery.trim().length > 0 &&
              matchingMarkets.length === 0 ? (
                <View
                  className="mt-4 rounded-2xl p-4"
                  style={{ backgroundColor: isDark ? "#252118" : "#FFF8E7" }}
                >
                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.text }}
                  >
                    This market is not yet served
                  </Text>
                  <Text
                    className="mt-1 text-sm leading-5"
                    style={{ color: colors.muted }}
                  >
                    Try another approved market location from the pilot network.
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={() => setAcceptedLegalTerms(!acceptedLegalTerms)}
              className="mt-6 flex-row gap-3"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedLegalTerms }}
            >
              <View
                className="mt-0.5 h-5 w-5 items-center justify-center rounded border"
                style={{
                  borderColor: acceptedLegalTerms ? "#07853C" : colors.border,
                  backgroundColor: acceptedLegalTerms
                    ? "#07853C"
                    : "transparent",
                }}
              >
                <Text className="text-xs font-bold text-white">
                  {acceptedLegalTerms ? "✓" : ""}
                </Text>
              </View>
              <Text
                className="flex-1 text-xs leading-5"
                style={{ color: colors.muted }}
              >
                I agree to the{" "}
                <Text className="font-bold" style={{ color: colors.text }}>
                  Terms
                </Text>{" "}
                and{" "}
                <Text className="font-bold" style={{ color: colors.text }}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </Pressable>
            <View className="mt-auto gap-3 pt-7">
              <Pressable
                onPress={submit}
                disabled={
                  !selectedMarket || !acceptedLegalTerms || isSubmitting
                }
                className="h-14 items-center justify-center rounded-full active:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: colors.text }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.background }}
                  >
                    Complete setup
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                className="h-11 items-center justify-center"
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  Back
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
