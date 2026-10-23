import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart, type CartProduct } from "@/components/cart-context";

type CatalogueProduct = CartProduct;

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
  const { addItem, isReady: isCartReady } = useCart();
  const [query, setQuery] = useState("");
  const [catalogue, setCatalogue] = useState<CatalogueProduct[]>([]);
  const [isGrid, setIsGrid] = useState(false);
  const [priceAscending, setPriceAscending] = useState(true);
  const [selectedProduct, setSelectedProduct] =
    useState<CatalogueProduct | null>(null);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (priceKobo: number) =>
    `${String.fromCharCode(8358)}${(priceKobo / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const openProduct = (product: CatalogueProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedProduct || !isCartReady) return;
    addItem(selectedProduct, quantity);
    setSelectedProduct(null);
  };

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
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
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
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Ionicons
                  name="swap-vertical-outline"
                  size={15}
                  color={colors.text}
                />
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Price
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={isGrid ? "Show list" : "Show grid"}
                onPress={() => setIsGrid((value) => !value)}
                className="h-8 w-8 items-center justify-center rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
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
            <View
              className={
                isGrid
                  ? "mt-4 flex-row flex-wrap justify-between gap-y-3"
                  : "mt-4 gap-4"
              }
            >
              {filteredCatalogue.map((product) => (
                <View
                  key={product.id}
                  className={
                    isGrid
                      ? "w-[48%] overflow-hidden rounded-2xl border"
                      : "overflow-hidden rounded-2xl border"
                  }
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
                  <View className="px-3.5 pb-3 pt-2.5">
                    <Text
                      numberOfLines={1}
                      className="text-[16px] font-medium"
                      style={{ color: colors.text }}
                    >
                      {`1 ${["carton", "ctn"].includes(product.unit.toLowerCase()) ? "ctn" : product.unit} ${product.name}${product.variant ? ` ${product.variant}` : ""}`}
                    </Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text
                        numberOfLines={1}
                        className="mr-2 flex-1 text-[20px] font-extrabold"
                        style={{ color: colors.text }}
                      >
                        {formatPrice(product.unitPriceKobo)}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Add ${product.name} to cart`}
                        onPress={() => openProduct(product)}
                        className="h-11 w-14 items-center justify-center rounded-full border-2"
                        style={{
                          borderColor: "#111111",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        <Ionicons
                          name="cart-outline"
                          size={24}
                          color="#111111"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View
              className="mt-4 items-center rounded-2xl border px-5 py-10"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
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
      <Modal
        visible={selectedProduct !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.52)" }}
        >
          <Pressable
            onPress={() => setSelectedProduct(null)}
            className="flex-1"
            accessibilityLabel="Close product details"
          />
          {selectedProduct && (
            <View
              className="max-h-[88%] overflow-hidden rounded-t-[28px]"
              style={{ backgroundColor: colors.surface }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-5 pb-5 pt-4"
              >
                <View className="flex-row items-start">
                  {selectedProduct.imageUrl ? (
                    <Image
                      source={{ uri: selectedProduct.imageUrl }}
                      contentFit="cover"
                      style={{ height: 76, width: 76, borderRadius: 12 }}
                    />
                  ) : (
                    <View
                      className="h-[76px] w-[76px] items-center justify-center rounded-xl"
                      style={{ backgroundColor: colors.surfaceMuted }}
                    >
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={colors.muted}
                      />
                    </View>
                  )}
                  <View className="ml-4 flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-sm font-semibold"
                      style={{ color: colors.muted }}
                    >
                      {selectedProduct.name}
                    </Text>
                    <Text
                      className="mt-1 text-2xl font-extrabold"
                      style={{ color: colors.text }}
                    >
                      {formatPrice(selectedProduct.unitPriceKobo)}
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.muted }}
                    >
                      Per {selectedProduct.unit}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Close product details"
                    onPress={() => setSelectedProduct(null)}
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.surfaceMuted }}
                  >
                    <Ionicons name="close" size={21} color={colors.text} />
                  </Pressable>
                </View>
                <Text
                  className="mb-3 mt-7 text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Product details
                </Text>
                <View
                  className="rounded-2xl border p-4"
                  style={{ borderColor: colors.border }}
                >
                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.text }}
                  >
                    {selectedProduct.name}
                  </Text>
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: colors.muted }}
                  >
                    {selectedProduct.variant ??
                      `Sold per ${selectedProduct.unit}`}
                  </Text>
                  <Text
                    className="mt-3 text-sm leading-5"
                    style={{ color: colors.muted }}
                  >
                    Quality wholesale supply, ready for your next order.
                  </Text>
                </View>
                <Text
                  className="mb-3 mt-6 text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  Service & benefits
                </Text>
                <View
                  className="self-start rounded-full border px-4 py-2"
                  style={{ borderColor: colors.accent }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.accent }}
                  >
                    Reliable delivery
                  </Text>
                </View>
                <View className="mt-6 flex-row items-center justify-between">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    Quantity
                  </Text>
                  <View
                    className="h-11 flex-row items-center overflow-hidden rounded-xl border"
                    style={{ borderColor: colors.border }}
                  >
                    <Pressable
                      accessibilityLabel="Decrease quantity"
                      disabled={quantity <= 1}
                      onPress={() =>
                        setQuantity((value) => Math.max(1, value - 1))
                      }
                      className="h-11 w-11 items-center justify-center"
                      style={{ backgroundColor: colors.surfaceMuted }}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={quantity <= 1 ? colors.muted : colors.text}
                      />
                    </Pressable>
                    <Text
                      className="w-12 text-center text-base font-bold"
                      style={{ color: colors.text }}
                    >
                      {quantity}
                    </Text>
                    <Pressable
                      accessibilityLabel="Increase quantity"
                      onPress={() => setQuantity((value) => value + 1)}
                      className="h-11 w-11 items-center justify-center"
                      style={{ backgroundColor: colors.surfaceMuted }}
                    >
                      <Ionicons name="add" size={20} color={colors.text} />
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
              <View
                className="border-t px-5 pb-7 pt-4"
                style={{ borderColor: colors.border }}
              >
                <Pressable
                  disabled={!isCartReady}
                  onPress={addToCart}
                  className="h-14 flex-row items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isCartReady ? "#F57C00" : colors.muted,
                  }}
                >
                  <Text className="text-base font-bold text-white">
                    {isCartReady
                      ? `Add to cart · ${formatPrice(selectedProduct.unitPriceKobo * quantity)}`
                      : "Loading cart…"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
