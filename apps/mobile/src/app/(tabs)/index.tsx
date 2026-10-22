import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CatalogueProduct = {
  id: string;
  name: string;
  variant: string | null;
  unit: string;
  unitPriceKobo: number;
  imageUrl: string | null;
};

const apiUrl = process.env.EXPO_PUBLIC_WEB_API_URL;
const colors = {
  background: "#F7F6F3",
  surface: "#FFFFFF",
  surfaceMuted: "#F0EEEA",
  border: "#E8E5DF",
  text: "#20201E",
  muted: "#85817A",
  accent: "#292825",
};

const categories = [
  { label: "Foodstuff", icon: "basket-outline" },
  { label: "Drinks", icon: "wine-outline" },
  { label: "Care", icon: "heart-outline" },
  { label: "Household", icon: "home-outline" },
  { label: "More", icon: "grid-outline" },
] as const;

export default function TabsIndex() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [query, setQuery] = useState("");
  const [catalogue, setCatalogue] = useState<CatalogueProduct[]>([]);
  const [isGrid, setIsGrid] = useState(false);
  const [priceAscending, setPriceAscending] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !apiUrl) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch(
          `${apiUrl.replace(/\/$/, "")}/api/mobile/catalogue`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok)
          throw new Error(`Catalogue request failed: ${response.status}`);
        const data = (await response.json()) as {
          products: CatalogueProduct[];
        };
        if (!cancelled) setCatalogue(data.products);
      } catch (error) {
        console.warn("Unable to load the product catalogue.", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn]);

  const filteredCatalogue = catalogue
    .filter((product) =>
      `${product.name} ${product.variant ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((left, right) =>
      priceAscending
        ? left.unitPriceKobo - right.unitPriceKobo
        : right.unitPriceKobo - left.unitPriceKobo,
    );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-8 pt-2"
        >
          <View className="flex-row items-center justify-between">
            <Pressable className="flex-1 active:opacity-70">
              <View className="flex-row items-center gap-2">
                <Text className="text-base" style={{ color: colors.muted }}>
                  Deliver to
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Your selected market
                </Text>
                <Ionicons name="chevron-down" size={15} color={colors.text} />
              </View>
            </Pressable>
            <Pressable
              accessibilityLabel="Your account"
              className="ml-4 h-10 w-10 items-center justify-center rounded-full border"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <Ionicons name="person-outline" size={19} color={colors.text} />
            </Pressable>
          </View>

          <View
            className="mt-5 h-12 flex-row items-center rounded-xl border px-3.5"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons name="search-outline" size={19} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search products and brands"
              placeholderTextColor={colors.muted}
              className="ml-2.5 flex-1 text-base"
              style={{ color: colors.text }}
              returnKeyType="search"
            />
          </View>

          <ScrollView
            className="mt-5 -mx-5"
            contentContainerClassName="gap-5 px-5"
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => (
              <Pressable
                key={category.label}
                className="w-[62px] items-center active:opacity-70"
              >
                <View
                  className="h-[54px] w-[54px] items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surfaceMuted }}
                >
                  <Ionicons
                    name={category.icon}
                    size={23}
                    color={colors.accent}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  className="mt-1.5 text-xs font-medium"
                  style={{ color: colors.text }}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className="mt-5 h-px" style={{ backgroundColor: colors.border }} />

          <View className="mt-5 flex-row items-center justify-between">
            <View className="flex-row items-baseline gap-2">
              <Text
                className="text-lg font-extrabold tracking-[-0.3px]"
                style={{ color: colors.text }}
              >
                Open near you
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {catalogue.length} products
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                accessibilityLabel={`Sort by price, currently ${priceAscending ? "lowest first" : "highest first"}`}
                onPress={() => setPriceAscending((value) => !value)}
                className="h-8 flex-row items-center gap-1 rounded-lg border px-2"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Ionicons name="swap-vertical-outline" size={15} color={colors.text} />
                <Text className="text-sm font-medium" style={{ color: colors.text }}>Price</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={isGrid ? "Show list" : "Show grid"}
                onPress={() => setIsGrid((value) => !value)}
                className="h-8 w-8 items-center justify-center rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Ionicons
                  name={isGrid ? "list-outline" : "grid-outline"}
                  size={15}
                  color={colors.text}
                />
              </Pressable>
            </View>
          </View>

          {filteredCatalogue.length ? (
            <View className={isGrid ? "mt-4 flex-row flex-wrap justify-between gap-y-3" : "mt-4 gap-4"}>
              {filteredCatalogue.map((product) => (
                <View
                  key={product.id}
                  className={isGrid ? "w-[48%] overflow-hidden rounded-2xl border" : "overflow-hidden rounded-2xl border"}
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      contentFit="cover"
                      transition={180}
                      style={{ height: isGrid ? 145 : 205, width: "100%" }}
                    />
                  ) : (
                    <View
                      className="items-center justify-center"
                      style={{
                        height: isGrid ? 145 : 205,
                        backgroundColor: colors.surfaceMuted,
                      }}
                    >
                      <Ionicons
                        name="image-outline"
                        size={29}
                        color={colors.muted}
                      />
                    </View>
                  )}
                  <View className="flex-row items-center justify-between px-3.5 py-3">
                    <View className="mr-3 flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {product.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-1 text-sm"
                        style={{ color: colors.muted }}
                      >
                        {product.variant ?? `Per ${product.unit}`}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        ₦
                        {(product.unitPriceKobo / 100).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="mt-4 items-center rounded-2xl border px-5 py-10" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
              <Ionicons name="search-outline" size={24} color={colors.muted} />
              <Text className="mt-2 text-sm" style={{ color: colors.muted }}>
                {catalogue.length && query
                  ? "No products match your search."
                  : "Products will appear here when your catalogue is ready."}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
