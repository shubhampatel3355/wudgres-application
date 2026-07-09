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

const frameSpecifications = [
  { id: "1", description: "FRAME SECTION 60x30", density: "0.350 KG / RFT" },
  { id: "2", description: "FRAME SECTION 75X50", density: "0.950 KG / RFT" },
  { id: "3", description: "FRAME SECTION 100X63", density: "1.750 KG / RFT" },
  { id: "4", description: "FRAME SECTION 125x63", density: "2.250 KG / RFT" },
];

const frameTestSpecifications = [
  { id: "1", test: "Density", unit: "Kg/m3", result: "0.9" },
  { id: "2", test: "Hardness - Shore 'D'", unit: "-", result: "0.9" },
  {
    id: "3",
    test: "Water Absorption, 24 hours, 4 hours",
    unit: "%",
    result: "0.15, 0.32",
  },
  {
    id: "4a",
    test: "Tensile Strength at break b. Elongation",
    unit: "Kg/cm2, %",
    result: "275, 12",
  },
  {
    id: "5",
    test: "Screw Withdrawal Strength",
    unit: "kg.",
    result: "face 249",
  },
  {
    id: "6",
    test: "Nail Withdrawal Strength",
    unit: "kg.",
    result: "face 63.2",
  },
  { id: "7", test: "Izod Impact", unit: "J/M", result: "20.1" },
  { id: "8", test: "Charpy Impact", unit: "KJ/m2", result: "50.0" },
  { id: "9", test: "Flexural Strength", unit: "Mpa", result: "13.1" },
  { id: "10", test: "Flexural Modulus", unit: "Mpa", result: "686" },
  { id: "11", test: "Flammability", unit: "-", result: "Match with V0" },
  { id: "12", test: "Compressive Strength", unit: "Kg/cm2", result: "100" },
];


export const NfcFrameDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    if (productId === "frame-static") {
      setProduct({
        id: "frame-static",
        slug: "NFC Frame",
        width: "60mm, 75mm, 100mm, 125mm",
        height: "30mm, 50mm, 63mm",
        thickness: "32",
        dimensions:
          "FRAME SECTION 75X50, FRAME SECTION 100X63, FRAME SECTION 125x63",
        rate: "165 / RFT, 320 / RFT, 385 / RFT",
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
    const dims = product?.dimensions
      ? product.dimensions.split(",").map((s: string) => s.trim())
      : [];
    const rates = product?.rate
      ? product.rate.split(",").map((s: string) => s.trim())
      : [];

    return dims.map((dim: string, i: number) => ({
      id: String.fromCharCode(65 + i), // A, B, C...
      description: dim,
      density:
        frameSpecifications.find(
          (f) => f.description.toLowerCase() === dim.toLowerCase(),
        )?.density || "-",
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
            <Image
              source={require("../assets/images/wpc/wpc-frame/wpc-frame1.png")}
              style={{
                width: width - 40,
                height: 200,
                resizeMode: "contain",
                marginBottom: 20,
              }}
            />
            <Image
              source={require("../assets/images/wpc/wpc-frame/wpc-frame2.png")}
              style={{ width: width - 40, height: 200, resizeMode: "contain" }}
            />
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </Animated.View>

        {/* Product Information */}
        <View style={styles.infoSection}>
          <Text style={styles.productTitle}>{product.slug}</Text>
          {/* <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Category: </Text>
                        <Text style={styles.infoValue}>{product.series?.name}</Text>
                    </View> */}
          {/* <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Brand: </Text>
                        <Text style={styles.infoValue}>WudGres</Text>
                    </View> */}
          {/* <View style={styles.infoRow}>
                         <Text style={styles.infoLabel}>Code: </Text>
                       <Text style={styles.infoValue}>{product.slug}</Text>
                    </View> */}
        </View>

        {/* Customization Card */}
        <Animated.View
          style={[
            styles.customizationCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* <Text style={styles.customizeTitle}>Customize to preview the price</Text> */}

          {/* Specifications Table */}
          {/* Specifications / Images */}
          <View style={styles.specificationsContainer}>
            <Text style={styles.disclaimerTitle}>FRAME DIMENSIONS</Text>
            {/* <Text style={styles.disclaimerText}>Available cross-sections for NFC Frames.</Text> */}

            <View style={[styles.table, { marginTop: 12, marginBottom: 24 }]}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                {/* <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 0.8 }]}>SL. NO.</Text> */}
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 2.5 },
                  ]}
                >
                  DESCRIPTION
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.5 },
                  ]}
                >
                  AVERAGE DENSITY
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.5 },
                  ]}
                >
                  RATE
                </Text>
              </View>

              {/* Table Body */}
              {framePricing.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                >
                  {/* <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>{item.id}</Text> */}
                  <Text style={[styles.tableCell, { flex: 2.5 }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {item.density}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {item.rate}
                  </Text>
                </View>
              ))}
            </View>

            {/* Disclaimer Table */}
            <Text style={[styles.disclaimerTitle, { marginTop: 24 }]}>
              DISCLAIMER
            </Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 0.8 },
                  ]}
                >
                  SL NO
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 3 },
                  ]}
                >
                  TEST
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.5 },
                  ]}
                >
                  UNIT
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.5 },
                  ]}
                >
                  RESULT
                </Text>
              </View>

              {/* Table Body */}
              {frameTestSpecifications.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                >
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>
                    {item.id}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {item.test}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {item.unit}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {item.result}
                  </Text>
                </View>
              ))}
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
              <Text style={{ fontSize: 18, fontFamily: "Unbounded_700Bold" }}>
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
                          ? "Unbounded_700Bold"
                          : "Unbounded_400Regular",
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
  infoSection: {
    padding: theme.spacing.md,
  },
  productTitle: {
    fontSize: 22,
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
    paddingHorizontal: 8,
    fontSize: 10,
    fontFamily: "Unbounded_400Regular",
    color: "#333333",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
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
