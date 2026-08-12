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

const frameSpecifications = [
  {
    description: 'FRAME SECTION 3.5"x2.5"',
    length: "3' / 6' / 7' / 8'",
    elite: "--",
    rich: "300 / RFT",
    eco: "205 / RFT",
  },
  {
    description: 'FRAME SECTION 4"x3"',
    length: "3' / 6' / 7' / 8'",
    elite: "480 / RFT",
    rich: "360 / RFT",
    eco: "252 / RFT",
  },
  {
    description: 'FRAME SECTION 5"x3"',
    length: "3' / 6' / 7' / 8'",
    elite: "600 / RFT",
    rich: "450 / RFT",
    eco: "315 / RFT",
  },
  {
    description: 'FRAME SECTION 6"x3"',
    length: "3' / 6' / 7' / 8'",
    elite: "740 / RFT",
    rich: "555 / RFT",
    eco: "--",
  },
  {
    description: 'FRAME SECTION 6"x4"',
    length: "3' / 6' / 7' / 8'",
    elite: "985 / RFT",
    rich: "740 / RFT",
    eco: "--",
  },
  {
    description: 'FRAME SECTION 9"x3"',
    length: "3' / 6' / 7' / 8'",
    elite: "1110 / RFT",
    rich: "833 / RFT",
    eco: "--",
  },
  {
    description: 'FRAME SECTION 9"x4"',
    length: "3' / 6' / 7' / 8'",
    elite: "1480 / RFT",
    rich: "--",
    eco: "--",
  },
  {
    description: 'FRAME SECTION 12"x4"',
    length: "3' / 6' / 7' / 8'",
    elite: "2030 / RFT",
    rich: "--",
    eco: "--",
  },
];


export const EngineeredWoodFrameDetailScreen: React.FC<
  ProductDetailScreenProps
> = ({ navigation, route }) => {
  const productId = route.params?.productId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [frameDimensions, setFrameDimensions] = useState<any[]>([]);

  // Customization state
  const [selectedWidth, setSelectedWidth] = useState<string>("36");
  const [selectedHeight, setSelectedHeight] = useState<string>("84");
  const [selectedThickness, setSelectedThickness] = useState<string>("32");
  const [modalConfig, setModalConfig] = useState<{
    label: string;
    value: string;
    options: string[];
    onSelect: (val: string) => void;
  } | null>(null);

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

    // Fetch frame dimensions from dashboard
    const { data: dimRows } = await supabase
      .from("frame_dimensions")
      .select("*")
      .eq("series_slug", "eng-wood-frames")
      .order("sort_order");
    setFrameDimensions(dimRows || []);

    if (productId === "eng-wood-frame-static") {
      setProduct({
        id: "eng-wood-frame-static",
        slug: "Eng. Wood Frames",
        category: "Eng. Wood Frames",
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

  const framePricing = useMemo(() => {
    // If DB has rows, use them (5-column: description, length, elite, rich, eco)
    if (frameDimensions && frameDimensions.length > 0) {
      return frameDimensions.map(r => ({
        description: r.description,
        length: r.col2 || "-",
        elite: r.col3 || "-",
        rich: r.col4 || "-",
        eco: r.col5 || "-",
      }));
    }
    // Static fallback
    return frameSpecifications.map(r => ({
      description: r.description,
      length: r.length,
      elite: r.elite,
      rich: r.rich,
      eco: r.eco,
    }));
  }, [frameDimensions]);

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
            <Image
              source={{ uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/eng-wood-frames/engg1.webp" }}
              style={{
                width: width - 40,
                height: 200,
                resizeMode: "contain",
                marginBottom: 10,
              }}
            />
            <Image
              source={{ uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/eng-wood-frames/engg2.webp" }}
              style={{
                width: width - 40,
                height: 100,
                resizeMode: "contain",
                marginBottom: 10,
              }}
            />
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                const pName = product?.slug || product?.name || "Engineered Wood Frame";
                const pImg = product?.image_url ? `\n🖼️ Product Image:\n${product.image_url}\n` : "";
                await Share.share({
                  title: `${pName} - WudGres`,
                  message: `🌟 Discover WudGres Premium Architectural Products 🌟\n\nI found this stunning design on the WudGres app and thought you'd love it!\n\n🪵 Product: ${pName}\n✨ Category: Engineered Wood Frames\n${pImg}\nExplore premium doors, window shutters, and wood frames crafted for modern interiors.\n\n📲 View product & download app:\nhttps://wudgres.com`,
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
            <Text style={styles.disclaimerTitle}>
              ENGINEERED WOOD FRAME DIMENSIONS
            </Text>

            <View style={[styles.table, { marginTop: 12, marginBottom: 24 }]}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.6, textAlign: "center" },
                  ]}
                >
                  DESCRIPTION
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.1, textAlign: "center" },
                  ]}
                >
                  LENGTH{"\n"}(FT)
                </Text>
                <View style={{ flex: 3.3 }}>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableHeaderText,
                      { textAlign: "center", paddingBottom: 4 },
                    ]}
                  >
                    RATE
                  </Text>
                  <View style={{ flexDirection: "row", paddingTop: 4 }}>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tableHeaderText,
                        { flex: 1, textAlign: "center" },
                      ]}
                    >
                      ELITE
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tableHeaderText,
                        { flex: 1, textAlign: "center" },
                      ]}
                    >
                      RICH
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tableHeaderText,
                        { flex: 1, textAlign: "center" },
                      ]}
                    >
                      ECO
                    </Text>
                  </View>
                </View>
              </View>

              {/* Table Body */}
              {framePricing.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    { alignItems: "center" },
                  ]}
                >
                  <Text
                    style={[styles.tableCell, { flex: 1.6, paddingLeft: 6 }]}
                  >
                    {item.description}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1.1, textAlign: "center" },
                    ]}
                  >
                    {item.length}
                  </Text>
                  <View style={{ flex: 3.3, flexDirection: "row" }}>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.priceHighlight,
                        { flex: 1, textAlign: "center" },
                      ]}
                    >
                      {item.elite}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.priceHighlight,
                        { flex: 1, textAlign: "center" },
                      ]}
                    >
                      {item.rich}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.priceHighlight,
                        { flex: 1, textAlign: "center" },
                      ]}
                    >
                      {item.eco}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Rate Legend Table */}
            <View style={[styles.table, { marginTop: 8, marginBottom: 16 }]}>
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
                      color: "#000",
                      textAlign: "center",
                    },
                  ]}
                >
                  ELITE
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3, borderRightWidth: 0, paddingLeft: 8 },
                  ]}
                >
                  Finger joined with Top Solid
                </Text>
              </View>
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
                    {
                      flex: 1,
                      fontFamily: "Gilroy-Regular",
                      color: "#000",
                      textAlign: "center",
                    },
                  ]}
                >
                  RICH
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3, borderRightWidth: 0, paddingLeft: 8 },
                  ]}
                >
                  Full finger joined
                </Text>
              </View>
              <View
                style={[
                  styles.tableRow,
                  styles.tableRowEven,
                  { alignItems: "center", borderBottomWidth: 0 },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    {
                      flex: 1,
                      fontFamily: "Gilroy-Regular",
                      color: "#000",
                      textAlign: "center",
                    },
                  ]}
                >
                  ECO
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3, borderRightWidth: 0, paddingLeft: 8 },
                  ]}
                >
                  Full finger joined - Hardwood
                </Text>
              </View>
            </View>

            {/* Disclaimer Box */}
            <Text
              style={[
                styles.disclaimerTitle,
                { marginTop: 24, marginBottom: 8 },
              ]}
            >
              DISCLAIMER
            </Text>
            <View
              style={{
                backgroundColor: "#D4B872",
                padding: 16,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#C4A862",
              }}
            >
              <Text
                style={{
                  fontFamily: "Gilroy-Regular",
                  fontSize: 12,
                  color: "#000",
                  lineHeight: 22,
                }}
              >
                <Text style={{ fontFamily: "Gilroy-Regular", fontSize: 16 }}>
                  Note : {"\n"}
                </Text>
                {"\n"}
                Wood of any kind being a Natural Material, Shrinkage and
                Expansion is part of its life cycle & beyond human control. So
                guarantee doesn't apply to this changes happening Naturally.
              </Text>
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

      {/* Glassmorphism Popup Modal for Dropdown */}
      <Modal
        visible={!!modalConfig}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalConfig(null)}
      >
        <BlurView
          intensity={80}
          tint="dark"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            activeOpacity={1}
            onPress={() => setModalConfig(null)}
          />

          <View
            style={{
              width: "80%",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#EEEEEE",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, fontFamily: "Gilroy-Bold" }}>
                Select{" "}
                {modalConfig?.label.replace(" (In)", "").replace(" (mm)", "")}
              </Text>
              <TouchableOpacity onPress={() => setModalConfig(null)}>
                <Ionicons name="close-circle-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {modalConfig?.options.map((opt, i) => (
                <TouchableOpacity
                  key={opt}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderBottomWidth:
                      i === modalConfig.options.length - 1 ? 0 : 1,
                    borderBottomColor: "#EEEEEE",
                    backgroundColor:
                      modalConfig.value === opt ? "#F0F0F0" : "transparent",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    modalConfig.onSelect(opt);
                    setModalConfig(null);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily:
                        modalConfig.value === opt
                          ? "Gilroy-Regular"
                          : "Gilroy-Regular",
                      color: "#000",
                    }}
                  >
                    {opt}
                  </Text>
                  {modalConfig.value === opt && (
                    <Ionicons name="checkmark" size={20} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
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
    fontFamily: "Gilroy-Medium",
    fontSize: 10,
    color: "#333333",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  priceHighlight: {
    fontFamily: "Gilroy-Bold",
    fontSize: 10,
    color: theme.colors.primary,
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
