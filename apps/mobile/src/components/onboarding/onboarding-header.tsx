import { Text, View } from "react-native";

export function OnboardingHeader({
  colors,
  step,
}: {
  colors: { border: string; muted: string; text: string };
  step: 1 | 2;
}) {
  return (
    <>
      <View className="flex-row items-center justify-between">
        <Text
          className="text-xl font-extrabold tracking-tight"
          style={{ color: colors.text }}
        >
          B2B SaaS
        </Text>
        <Text className="text-sm font-semibold" style={{ color: colors.muted }}>
          {step} of 2
        </Text>
      </View>
      <View className="mt-5 flex-row gap-2">
        {[1, 2].map((segment) => (
          <View
            key={segment}
            className="h-1.5 flex-1 rounded-full"
            style={{
              backgroundColor: segment <= step ? colors.text : colors.border,
            }}
          />
        ))}
      </View>
    </>
  );
}
