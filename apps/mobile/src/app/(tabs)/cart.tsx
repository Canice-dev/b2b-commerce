import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "@/components/cart-context";

const orange = "#F57C00";
const green = "#0B8F18";

function formatPrice(kobo: number) {
  return `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
}

function unitLabel(unit: string) {
  return ["carton", "ctn"].includes(unit.toLowerCase()) ? "ctn" : unit;
}

export default function CartScreen() {
  const { items, itemCount, isReady, changeQuantity, removeItem } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelected, setShowSelected] = useState(false);
  const [ascending, setAscending] = useState(false);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.product.id)),
    [items, selectedIds],
  );
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.unitPriceKobo * item.quantity,
    0,
  );
  const visibleItems = useMemo(() => {
    const list = showSelected ? selectedItems : items;
    return [...list].sort((a, b) =>
      ascending
        ? a.product.unitPriceKobo - b.product.unitPriceKobo
        : items.indexOf(a) - items.indexOf(b),
    );
  }, [ascending, items, selectedItems, showSelected]);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : items.map((item) => item.product.id));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={toggleAll}
          style={styles.headerSide}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allSelected }}
        >
          <View style={[styles.circle, allSelected && styles.circleChecked]}>
            {allSelected && (
              <Ionicons name="checkmark" size={19} color="#fff" />
            )}
          </View>
          <Text style={styles.headerAction}>All</Text>
        </Pressable>
        <Text style={styles.title}>Cart ({itemCount})</Text>
        <Pressable
          style={styles.headerSideEnd}
          onPress={() => setAscending((value) => !value)}
          accessibilityLabel="Sort products by price"
        >
          <Ionicons name="list" size={27} color="#171717" />
        </Pressable>
      </View>

      <View style={styles.promo}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.promoText}>
          Your cart is saved for your next visit
        </Text>
      </View>

      <View style={styles.filters}>
        <Pressable
          onPress={() => setShowSelected(false)}
          style={[styles.filter, !showSelected && styles.filterActive]}
        >
          <Text
            style={[
              styles.filterText,
              !showSelected && styles.filterTextActive,
            ]}
          >
            All ({items.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowSelected(true)}
          style={[styles.filter, showSelected && styles.filterActive]}
        >
          <Text
            style={[styles.filterText, showSelected && styles.filterTextActive]}
          >
            Selected ({selectedItems.length})
          </Text>
        </Pressable>
      </View>

      {!isReady ? (
        <View style={styles.center}>
          <ActivityIndicator color={orange} />
          <Text style={styles.emptySub}>Loading your saved cart…</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={38} color="#888" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Add products from the catalogue and they’ll show up here.
          </Text>
        </View>
      ) : visibleItems.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No selected items</Text>
          <Text style={styles.emptySub}>
            Select products to include them in checkout.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {visibleItems.map(({ product, quantity }) => {
            const selected = selectedIds.includes(product.id);
            return (
              <View key={product.id} style={styles.row}>
                <Pressable
                  onPress={() => toggleSelected(product.id)}
                  style={styles.selectTouch}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`Select ${product.name}`}
                >
                  <View
                    style={[styles.circle, selected && styles.circleChecked]}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={19} color="#fff" />
                    )}
                  </View>
                </Pressable>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={30} color="#aaa" />
                  </View>
                )}
                <View style={styles.details}>
                  <Text style={styles.name} numberOfLines={2}>
                    {product.variant ? `${product.variant} | ` : ""}
                    {product.name}
                  </Text>
                  <Text style={styles.unit}>
                    {unitLabel(product.unit)} ·{" "}
                    {formatPrice(product.unitPriceKobo)} / unit
                  </Text>
                  <View style={styles.bottomLine}>
                    <Text style={styles.price}>
                      {formatPrice(product.unitPriceKobo * quantity)}
                    </Text>
                    <View style={styles.quantity}>
                      <Pressable
                        onPress={() => changeQuantity(product.id, -1)}
                        style={styles.quantityButton}
                        accessibilityLabel={`Decrease ${product.name} quantity`}
                      >
                        <Ionicons name="remove" size={17} color="#333" />
                      </Pressable>
                      <Text style={styles.quantityText}>{quantity}</Text>
                      <Pressable
                        onPress={() => changeQuantity(product.id, 1)}
                        style={styles.quantityButton}
                        accessibilityLabel={`Increase ${product.name} quantity`}
                      >
                        <Ionicons name="add" size={17} color="#333" />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => removeItem(product.id)}
                  style={styles.remove}
                  accessibilityLabel={`Remove ${product.name}`}
                >
                  <Ionicons name="trash-outline" size={19} color="#818181" />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Selected total</Text>
          <Text style={styles.total}>{formatPrice(selectedSubtotal)}</Text>
          <Text style={styles.totalHint}>
            {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items
            selected
          </Text>
        </View>
        <Pressable
          disabled={!selectedItems.length}
          style={[
            styles.checkout,
            !selectedItems.length && styles.checkoutDisabled,
          ]}
          accessibilityLabel="Checkout is coming soon"
        >
          <Text style={styles.checkoutTitle}>
            Checkout (
            {selectedItems.reduce((sum, item) => sum + item.quantity, 0)})
          </Text>
          <Text style={styles.checkoutHint}>Coming soon</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  headerSide: {
    minWidth: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerSideEnd: { width: 82, alignItems: "flex-end" },
  title: { color: "#171717", fontSize: 22, fontWeight: "700" },
  headerAction: { color: "#252525", fontSize: 16 },
  circle: {
    width: 25,
    height: 25,
    borderWidth: 1.5,
    borderColor: "#aaa",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  circleChecked: { backgroundColor: "#111", borderColor: "#111" },
  promo: {
    marginHorizontal: 16,
    marginTop: 6,
    height: 34,
    paddingHorizontal: 9,
    backgroundColor: green,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  promoText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  filters: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  filter: {
    paddingHorizontal: 13,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bcbcbc",
    justifyContent: "center",
  },
  filterActive: { borderColor: "#111", borderWidth: 2 },
  filterText: { fontSize: 14, color: "#333" },
  filterTextActive: { color: "#111", fontWeight: "600" },
  list: { paddingHorizontal: 14, paddingBottom: 190 },
  row: {
    minHeight: 142,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d9d9d9",
    paddingVertical: 13,
  },
  selectTouch: {
    width: 42,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  productImage: {
    width: 100,
    height: 112,
    borderRadius: 2,
    backgroundColor: "#f0eeee",
  },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  details: {
    flex: 1,
    alignSelf: "stretch",
    paddingLeft: 10,
    paddingRight: 4,
    justifyContent: "space-between",
  },
  name: { color: "#626262", fontSize: 14, lineHeight: 19 },
  unit: { color: "#777", fontSize: 12, marginTop: 5 },
  bottomLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  price: { color: "#111", fontSize: 19, fontWeight: "800", flexShrink: 1 },
  quantity: {
    height: 31,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d2d2d2",
    borderRadius: 5,
  },
  quantityButton: {
    width: 27,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    minWidth: 19,
    textAlign: "center",
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
  },
  remove: {
    width: 25,
    height: 36,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    paddingBottom: 70,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f5f3f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#242424",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySub: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 99,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  totalBlock: { flex: 1 },
  totalLabel: { color: "#777", fontSize: 12 },
  total: { color: orange, fontSize: 22, fontWeight: "800", marginTop: 2 },
  totalHint: { color: "#888", fontSize: 11, marginTop: 1 },
  checkout: {
    minWidth: 165,
    minHeight: 57,
    borderRadius: 30,
    backgroundColor: orange,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  checkoutDisabled: { backgroundColor: "#bcbcbc" },
  checkoutTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  checkoutHint: { color: "#fff", fontSize: 12, marginTop: 1 },
});
