import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CustomerOrder = {
  id: string;
  createdAt: string;
  fulfilmentStatus: string;
  paymentStatus: string;
  orderedTotalKobo: number;
};

const apiUrl = process.env.EXPO_PUBLIC_WEB_API_URL?.replace(/\/$/, "");
const colors = {
  background: "#F7F6F3",
  surface: "#FFFFFF",
  border: "#E8E5DF",
  text: "#20201E",
  muted: "#85817A",
  accent: "#292825",
};

function formatPrice(priceKobo: number) {
  return `${String.fromCharCode(8358)}${(priceKobo / 100).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CustomerOrders() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !apiUrl) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your session has expired. Sign in again.");
        const response = await fetch(`${apiUrl}/api/mobile/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unable to load your orders.");
        const data = (await response.json()) as { orders: CustomerOrder[] };
        if (!cancelled) setOrders(data.orders);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load your orders.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
          <View className="flex-row items-center">
            <Pressable
              accessibilityLabel="Back to account"
              onPress={() => router.back()}
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="arrow-back" size={19} color={colors.text} />
            </Pressable>
            <Text
              className="text-2xl font-extrabold"
              style={{ color: colors.text }}
            >
              My orders
            </Text>
          </View>
          <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
            Your previous orders and their status.
          </Text>

          {isLoading ? (
            <View
              className="mt-5 items-center rounded-2xl border px-5 py-12"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text className="text-sm" style={{ color: colors.muted }}>
                Loading your orders…
              </Text>
            </View>
          ) : error ? (
            <View
              className="mt-5 rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text className="text-sm" style={{ color: colors.text }}>
                {error}
              </Text>
            </View>
          ) : orders.length === 0 ? (
            <View
              className="mt-5 items-center rounded-2xl border px-6 py-12"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Ionicons name="receipt-outline" size={32} color={colors.muted} />
              <Text
                className="mt-3 text-base font-semibold"
                style={{ color: colors.text }}
              >
                No orders yet
              </Text>
              <Text
                className="mt-1 text-center text-sm"
                style={{ color: colors.muted }}
              >
                Orders you place will show up here.
              </Text>
              <Link href="/(tabs)" asChild>
                <Pressable
                  className="mt-5 rounded-full px-5 py-3"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Text className="text-sm font-semibold text-white">
                    Browse products
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : (
            <View className="mt-5 gap-3">
              {orders.map((order) => (
                <View
                  key={order.id}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      Order {order.id.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {new Date(order.createdAt).toLocaleDateString("en-NG")}
                    </Text>
                  </View>
                  <Text
                    className="mt-3 text-lg font-extrabold"
                    style={{ color: colors.text }}
                  >
                    {formatPrice(order.orderedTotalKobo)}
                  </Text>
                  <View className="mt-3 flex-row gap-2">
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: "#F0EEEA" }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: colors.text }}
                      >
                        {formatStatus(order.fulfilmentStatus)}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: "#F0EEEA" }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: colors.text }}
                      >
                        Payment {formatStatus(order.paymentStatus)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
