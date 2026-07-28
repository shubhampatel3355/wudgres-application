import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Animated,
  Dimensions,
  Share,
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


export const FlushDoorDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    if (productId === "flush-door-static") {
      let fetchedImageUrl = null;

      try {
        // Try to get image from categories table first
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("image_url")
          .ilike("name", "%Flush%")
          .maybeSingle();

        if (catData?.image_url) {
          fetchedImageUrl = catData.image_url;
        } else {
          // Fallback to products table in the Flush Doors series
          const { data: prodData, error: prodError } = await supabase
            .from("products")
            .select("image_url, series!inner(name)")
            .eq("series.name", "Flush Doors")
            .limit(1)
            .maybeSingle();
          
          if (prodData?.image_url) {
            fetchedImageUrl = prodData.image_url;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch flush door image dynamically:", err);
      }

      setProduct({
        id: "flush-door-static",
        slug: "Flush Doors",
        category: "Flush Doors",
        width: "60mm, 75mm, 100mm, 125mm",
        height: "30mm, 50mm, 63mm",
        thickness: "32",
        dimensions:
          "67MM X 32MM Height Upto 48 Inches, 67MM X 32MM Height above 48 Inches, 92MM X 32MM Height Upto 48 Inches, 92MM X 32MM Height above 48 Inches",
        rate: "295.00, 320.00, 395.00, 420.00",
        image_url: fetchedImageUrl,
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

  const framePricing = useMemo(() => {
    const dims = product?.dimensions
      ? product.dimensions.split(",").map((s: string) => s.trim())
      : [];
    const rates = product?.rate
      ? product.rate.split(",").map((s: string) => s.trim())
      : [];

    return dims.map((dim: string, i: number) => ({
      id: String.fromCharCode(65 + i), // A, B, C...
      description: dim,
      rate: rates[i] || "-",
    }));
  }, [product]);

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

          {/* Customization Card Skeleton */}
          <View
            style={[
              styles.customizationCard,
              {
                borderColor: "rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            ]}
          >
            <View style={{ padding: 16 }}>
              <SkeletonItem
                width="50%"
                height={20}
                style={{ marginBottom: 20 }}
                color={glassColor}
              />
              <SkeletonItem
                width="100%"
                height={40}
                style={{ marginBottom: 12 }}
                color={glassColor}
              />
              <SkeletonItem
                width="100%"
                height={40}
                style={{ marginBottom: 12 }}
                color={glassColor}
              />
              <SkeletonItem
                width="100%"
                height={40}
                style={{ marginBottom: 24 }}
                color={glassColor}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <SkeletonItem width="31%" height={50} color={glassColor} />
                <SkeletonItem width="31%" height={50} color={glassColor} />
                <SkeletonItem width="31%" height={50} color={glassColor} />
              </View>
            </View>
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
            style={{ alignItems: "center", width: "100%", paddingVertical: 20 }}
          >
            {product?.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={{
                  width: width - 40,
                  height: 350,
                  resizeMode: "contain",
                  marginBottom: 10,
                }}
              />
            ) : null}
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                const pName = product?.slug || product?.name || "Flush Door";
                const pImg = product?.image_url ? `\n🖼️ Product Image:\n${product.image_url}\n` : "";
                await Share.share({
                  title: `${pName} - WudGres`,
                  message: `🌟 Discover WudGres Premium Architectural Products 🌟\n\nI found this stunning design on the WudGres app and thought you'd love it!\n\n🪵 Product: ${pName}\n✨ Category: Flush Doors Collection\n${pImg}\nExplore premium doors, window shutters, and wood frames crafted for modern interiors.\n\n📲 View product & download app:\nhttps://wudgres.com`,
                  url: product?.image_url || "https://wudgres.com",
                });
              } catch (error) {
                console.log("Error sharing:", error);
              }
            }}
          >
            <Ionicons name="share-social-outline" size={24} color="#000" />
          </TouchableOpacity> */}
        </Animated.View>

        {/* Product Information */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>{product.slug}</Text>
        </View>

        {/* Customization Card */}
        <Animated.View
          style={[
            styles.customizationCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Specifications Table */}
          {/* Specifications / Images */}
          <View style={styles.specificationsContainer}>
            {/* Engineered Wood Frame Dimensions */}
            <Text style={styles.disclaimerTitle}>FLUSH DOOR DIMENSIONS</Text>

            <View style={[styles.table, { marginTop: 12, marginBottom: 24 }]}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  THICKNESS
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  RATE / SQFT
                </Text>
              </View>
              {framePricing.length > 0 ? (
                framePricing.map((item: any, index: number) => (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                      {
                        alignItems: "center",
                        borderBottomWidth:
                          index === framePricing.length - 1 ? 0 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.tableCell, { flex: 1, textAlign: "center" }]}
                    >
                      {item.description}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        { flex: 1, textAlign: "center", borderRightWidth: 0 },
                      ]}
                    >
                      {item.rate}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={[styles.tableRow, styles.tableRowEven, { alignItems: "center", borderBottomWidth: 0 }]}>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "center", borderRightWidth: 0 }]}>
                    No pricing available
                  </Text>
                </View>
              )}
            </View>

            {/* Available Sizes Table */}
            <Text style={[styles.disclaimerTitle, { marginTop: 8 }]}>
              AVAILABLE SIZES
            </Text>
            <View style={[styles.table, { marginTop: 12, marginBottom: 24 }]}>
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
                    {
                      flex: 1,
                      fontFamily: "Gilroy-Regular",
                      textAlign: "center",
                    },
                  ]}
                >
                  HEIGHT
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3, borderRightWidth: 0, paddingLeft: 8 },
                  ]}
                >
                  72", 75", 78", 81", 84", 90", 96"
                </Text>
              </View>
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
                    {
                      flex: 1,
                      fontFamily: "Gilroy-Regular",
                      textAlign: "center",
                    },
                  ]}
                >
                  WIDTH
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3, borderRightWidth: 0, paddingLeft: 8 },
                  ]}
                >
                  27", 30", 32", 33", 36", 38", 42", 48"
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
    minHeight: 350,
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
  shareButton: {
    position: "absolute",
    top: 56,
    right: 16,
  },
  infoSection: {
    padding: theme.spacing.md,
  },
  productTitle: {
    fontSize: 22,
    fontFamily: "Gilroy-Bold",
    color: "#000000",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Gilroy-Regular",
    color: "#000000",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Gilroy-Regular",
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
    fontFamily: "Gilroy-Bold",
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
    fontFamily: "Gilroy-Bold",
    color: "#000000",
    // marginBottom: 8,
    paddingTop: 10,
    paddingBottom: 10,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: "Gilroy-Regular",
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
    fontFamily: "Gilroy-Regular",
    color: "#333333",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
    justifyContent: "center",
  },
  tableHeaderText: {
    fontFamily: "Gilroy-Regular",
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
    fontFamily: "Gilroy-Regular",
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
    fontFamily: "Gilroy-Regular",
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
    fontFamily: "Gilroy-Regular",
    marginBottom: 4,
  },
  estimatePriceBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  estimateSubtitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Gilroy-Bold",
    marginBottom: 2,
  },
  estimatePrice: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Gilroy-Bold",
  },
});
