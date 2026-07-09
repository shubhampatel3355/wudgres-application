import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Modal,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { BurgerMenu, GlassMenu, Skeleton as SkeletonItem } from "../components";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}


export const BlockBoardDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    if (productId === "block-board-static") {
      setProduct({
        id: "block-board-static",
        slug: "Block Boards",
        category: "Block Boards",
        width: "60mm, 75mm, 100mm, 125mm",
        height: "30mm, 50mm, 63mm",
        thickness: "32",
        dimensions:
          "67MM X 32MM Height Upto 48 Inches, 67MM X 32MM Height above 48 Inches, 92MM X 32MM Height Upto 48 Inches, 92MM X 32MM Height above 48 Inches",
        rate: "295.00, 320.00, 395.00, 420.00",
        image_url: null,
      });
    } else {
      const { data } = await supabase
        .from("products")
        .select("*, series(name)")
        .eq("id", productId)
        .single();
      if (data) setProduct(data);
    }
    setLoading(false);
  };

  if (loading || !product) {
    const glassColor = "rgba(255,255,255,0.15)";
    return (
      <ImageBackground
        source={backgroundImages.woodTexture}
        style={styles.container}
      >
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Header Skeleton */}
        <SafeAreaView edges={["top"]}>
          <View
            style={{
              height: 60,
              paddingHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SkeletonItem
              width={40}
              height={40}
              borderRadius={20}
              color={glassColor}
            />
            <View style={{ flexDirection: "row" }}>
              <SkeletonItem
                width={30}
                height={30}
                borderRadius={15}
                style={{ marginRight: 20 }}
                color={glassColor}
              />
              <SkeletonItem
                width={30}
                height={30}
                borderRadius={15}
                color={glassColor}
              />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Skeleton */}
          <View
            style={[
              styles.imageSection,
              {
                backgroundColor: "transparent",
                borderBottomColor: "rgba(255,255,255,0.1)",
              },
            ]}
          >
            <SkeletonItem
              width={140}
              height={280}
              borderRadius={8}
              color={glassColor}
            />
          </View>

          {/* Info Skeleton */}
          <View style={styles.infoSection}>
            <SkeletonItem
              width="70%"
              height={28}
              style={{ marginBottom: 16 }}
              color={glassColor}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Wood Texture Background */}
      <ImageBackground
        source={backgroundImages.woodTexture}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerIcons}>
              <View style={styles.iconButton}>
                <BurgerMenu
                  size={24}
                  color="#FFFFFF"
                  isOpen={isMenuOpen}
                  onPress={() => setIsMenuOpen(!isMenuOpen)}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image Section */}
        <Animated.View style={[styles.imageSection, { opacity: fadeAnim }]}>
          <View
            style={{ alignItems: "center", width: "100%", paddingVertical: 50 }}
          >
            <Image
              source={require("../assets/images/products/BLOCK-MR.png")}
              style={{
                width: width - 40,
                height: 200,
                resizeMode: "contain",
                marginBottom: 10,
              }}
            />
          </View>
          {/* <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity> */}
        </Animated.View>

        {/* Product Information */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>
            BWR (MR UREA FORMALDYHIDE BONDED)
          </Text>
        </View>

        {/* Customization Card */}
        <Animated.View
          style={[
            styles.customizationCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.specificationsContainer}>
            <View style={[styles.table, { marginTop: 12, marginBottom: 24 }]}>
              {/* PLY CORE */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowEven,
                  { alignItems: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  PLY CORE :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  NEEM WOOD / EUCALYPTUS WOOD / POPLAR WOOD IN BLOCK BOARDS
                </Text>
              </View>
              {/* PLY FACE */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowOdd,
                  { alignItems: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  PLY FACE :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  GURJAN
                </Text>
              </View>
              {/* SIZE */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowEven,
                  { alignItems: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  SIZE (FT) :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  8X4, 7X4
                </Text>
              </View>
              {/* THICKNESS */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowOdd,
                  { alignItems: "center", borderBottomWidth: 0 },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  THICKNESS :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  6MM, 12MM, 18MM
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Product Image Section111111111111 */}
        <Animated.View style={[styles.imageSection, { opacity: fadeAnim }]}>
          <View
            style={{ alignItems: "center", width: "100%", paddingVertical: 50 }}
          >
            <Image
              source={require("../assets/images/products/BLOCK-BWP.png")}
              style={{
                width: width - 40,
                height: 200,
                resizeMode: "contain",
                marginBottom: 10,
              }}
            />
          </View>
        </Animated.View>

        {/* Product Information */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>BWP (PHENOL BONDED)</Text>
        </View>

        {/* Customization Card */}
        <Animated.View
          style={[
            styles.customizationCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.specificationsContainer}>
            <View style={[styles.table, { marginTop: 12, marginBottom: 24 }]}>
              {/* PLY CORE */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowEven,
                  { alignItems: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  PLY CORE :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  NEEM WOOD / EUCALYPTUS WOOD / POPLAR WOOD IN BLOCK BOARDS
                </Text>
              </View>
              {/* PLY FACE */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowOdd,
                  { alignItems: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  PLY FACE :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  GURJAN
                </Text>
              </View>
              {/* SIZE */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowEven,
                  { alignItems: "center" },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  SIZE (FT) :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  8X4, 7X4
                </Text>
              </View>
              {/* THICKNESS */}
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowOdd,
                  { alignItems: "center", borderBottomWidth: 0 },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, fontFamily: "Unbounded_700Bold", color: "#000" },
                  ]}
                >
                  THICKNESS :
                </Text>
                <Text
                  style={[styles.tableCell, { flex: 2, borderRightWidth: 0 }]}
                >
                  6MM, 12MM, 18MM
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <GlassMenu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => {
          setIsMenuOpen(false);
          navigation.navigate("HomeStack", { screen });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBackground: {
    width: "100%",
    paddingBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    padding: 4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: theme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  imageSection: {
    width: "100%",
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  productImage: {
    width: 140,
    height: 280,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  infoSection: {
    padding: theme.spacing.md,
  },
  productTitle: {
    fontSize: 20,
    fontFamily: "Unbounded_700Bold",
    color: "#000000",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Unbounded_700Bold",
    color: "#000000",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Unbounded_400Regular",
    color: "#333333",
  },
  customizationCard: {
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    overflow: "hidden",
  },
  customizeTitle: {
    fontSize: 14,
    fontFamily: "Unbounded_400Regular",
    color: "#666666",
    padding: 16,
    paddingBottom: 12,
  },
  specificationsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontFamily: "Unbounded_700Bold",
    color: "#000000",
    // marginBottom: 8,
    paddingTop: 10,
    paddingBottom: 10,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: "Unbounded_400Regular",
    color: "#666666",
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tableHeader: {
    backgroundColor: "#F9F9F9",
  },
  tableRowEven: {
    backgroundColor: "#FFFFFF",
  },
  tableRowOdd: {
    backgroundColor: "#FAFAFA",
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    fontSize: 9,
    fontFamily: "Unbounded_400Regular",
    color: "#333333",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
    justifyContent: "center",
  },
  tableHeaderText: {
    fontFamily: "Unbounded_700Bold",
    color: "#000000",
  },
  dimensionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 10,
  },
  dropdownLabel: {
    fontSize: 10,
    fontFamily: "Unbounded_400Regular",
    color: "#666666",
    marginBottom: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dropdownValue: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "Unbounded_700Bold",
  },
  estimateBanner: {
    backgroundColor: "#333333",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  estimateDetails: {
    flex: 1,
  },
  estimateDetailText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Unbounded_400Regular",
    marginBottom: 4,
  },
  estimatePriceBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  estimateSubtitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Unbounded_400Regular",
    marginBottom: 2,
  },
  estimatePrice: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Unbounded_700Bold",
  },
});
