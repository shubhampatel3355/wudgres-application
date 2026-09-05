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
  Share,
} from "react-native";
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

const nfcSpecifications = [
  { id: "1", test: "Density, Kg/m3", method: "IS: 1734", value: "500-700" },
  {
    id: "2",
    test: "Water Absorption, 2 hours, %",
    method: "IS: 2380",
    value: "< 0.2",
  },
  {
    id: "3",
    test: "Water Absorption, 24 hours, %",
    method: "IS: 2380",
    value: "< 1",
  },
  { id: "4", test: "Hardness, Shore D", method: "ASTM D 2240", value: "> 55" },
  {
    id: "5",
    test: "Tensile Strength, N/mm2",
    method: "IS: 1734",
    value: "> 11",
  },
  {
    id: "6",
    test: "Elongation at Break, %",
    method: "IS: 1734",
    value: "> 10",
  },
  {
    id: "7",
    test: "Modulus of Rupture N/mm2",
    method: "IS: 1734",
    value: "> 20",
  },
  {
    id: "8",
    test: "Modulus of Elasticity N/mm2",
    method: "IS: 1734",
    value: "> 1500",
  },
  {
    id: "9",
    test: "Screw Withdrawal Strength, N",
    method: "IS: 1734",
    value: "> 1500",
  },
  {
    id: "10",
    test: "Nail Withdrawal Strength, N",
    method: "IS: 1734",
    value: "> 150",
  },
];


export const NfcDoorDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { productId, seriesName } = route.params || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricingRules, setPricingRules] = useState<any[]>([]);

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
  }, [productId, seriesName]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const isLegend =
        (seriesName &&
          (seriesName.toLowerCase().includes("legend") ||
            seriesName.toLowerCase().includes("eco"))) ||
        (productId &&
          (productId.includes("265a86c2") ||
            productId.includes("legend") ||
            productId.includes("eco")));
      const isRich =
        (seriesName && seriesName.toLowerCase().includes("rich")) ||
        (productId &&
          (productId.includes("92c1cd07") || productId.includes("rich")));

      let data: any[] | null = null;

      const fetchPricingRules = async (productSeriesId?: string) => {
        let allRules: any[] = [];
        if (productSeriesId) {
          const { data: specificRules } = await supabase.from("pricing_rules").select("*").eq("series_id", productSeriesId);
          if (specificRules) allRules = [...specificRules];
        }
        setPricingRules(allRules);
      };

      if (isLegend) {
        try {
          let res = await supabase
            .from("products")
            .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
            .or("name.ilike.%legend%,name.ilike.%eco%,slug.ilike.%legend%,slug.ilike.%eco%")
            .limit(1);
          if (!res.data || res.data.length === 0) {
            res = await supabase
              .from("products")
              .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
              .ilike("series.name", "%legend%")
              .limit(1);
          }
          if (!res.data || res.data.length === 0) {
            res = await supabase
              .from("products")
              .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
              .ilike("series.name", "%eco%")
              .limit(1);
          }
          if (!res.data || res.data.length === 0) {
            const resId = await supabase
              .from("products")
              .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
              .eq("id", productId)
              .maybeSingle();
            if (resId.data) res.data = [resId.data];
          }
          data = res.data;
        } catch (err) {
          console.log("Error fetching NFC Legend product:", err);
        }

        if (data && data.length > 0) {
          setProduct(data[0]);
          await fetchPricingRules(data[0].series_id);
        } else {
          setProduct({
            id: "nfc-legend-static",
            slug: "NFC Legend",
            name: "NFC Legend",
            category: "NFC Doors",
            width: "36, 38, 40, 42",
            height: "84, 96",
            thickness: "32, 35",
            dimensions:
              "36 x 84 x 32, 38 x 84 x 32, 40 x 84 x 32, 42 x 84 x 32, 36 x 96 x 35, 38 x 96 x 35, 40 x 96 x 35, 42 x 96 x 35",
            rate:
              "12000.00, 12500.00, 13000.00, 13500.00, 14000.00, 14500.00, 15000.00, 15500.00",
            image_url: null,
            series: { name: "NFC Legend" },
          });
        }
      } else if (isRich) {
        try {
          let res = await supabase
            .from("products")
            .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
            .or("name.ilike.%rich%,slug.ilike.%rich%")
            .limit(1);
          if (!res.data || res.data.length === 0) {
            res = await supabase
              .from("products")
              .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
              .ilike("series.name", "%rich%")
              .limit(1);
          }
          if (!res.data || res.data.length === 0) {
            const resId = await supabase
              .from("products")
              .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
              .eq("id", productId)
              .maybeSingle();
            if (resId.data) res.data = [resId.data];
          }
          data = res.data;
        } catch (err) {
          console.log("Error fetching NFC Rich product:", err);
        }

        if (data && data.length > 0) {
          setProduct(data[0]);
          await fetchPricingRules(data[0].series_id);
        } else {
          setProduct({
            id: "nfc-rich-static",
            slug: "NFC DOORS - Rich",
            name: "NFC DOORS - Rich",
            category: "NFC Doors",
            width: "36, 38, 40, 42",
            height: "84, 96",
            thickness: "32, 35",
            dimensions:
              "36 x 84 x 32, 38 x 84 x 32, 40 x 84 x 32, 42 x 84 x 32, 36 x 96 x 35, 38 x 96 x 35, 40 x 96 x 35, 42 x 96 x 35",
            rate:
              "14000.00, 14500.00, 15000.00, 15500.00, 16000.00, 16500.00, 17000.00, 17500.00",
            image_url: null,
            series: { name: "NFC DOORS - Rich" },
          });
        }
      } else {
        let fetched = false;
        if (seriesName) {
          const { data: sData } = await supabase
            .from("products")
            .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
            .ilike("series.name", `%${seriesName}%`)
            .limit(1);
          if (sData && sData.length > 0) {
            setProduct(sData[0]);
            await fetchPricingRules(sData[0].series_id);
            fetched = true;
          }
        }
        if (!fetched && productId) {
          const { data: pData } = await supabase
            .from("products")
            .select("*, series(id, name, allowed_thicknesses, allowed_heights, allowed_widths)")
            .eq("id", productId)
            .maybeSingle();
          if (pData) {
            setProduct(pData);
            await fetchPricingRules(pData.series_id);
            fetched = true;
          }
        }
        if (!fetched) {
          setProduct({
            id: "nfc-legend-static",
            slug: "NFC Legend",
            name: "NFC Legend",
            category: "NFC Doors",
            width: "36, 38, 40, 42",
            height: "84, 96",
            thickness: "32, 35",
            dimensions:
              "36 x 84 x 32, 38 x 84 x 32, 40 x 84 x 32, 42 x 84 x 32, 36 x 96 x 35, 38 x 96 x 35, 40 x 96 x 35, 42 x 96 x 35",
            rate:
              "12000.00, 12500.00, 13000.00, 13500.00, 14000.00, 14500.00, 15000.00, 15500.00",
            image_url: null,
            series: { name: "NFC Legend" },
          });
        }
      }
    } catch (err) {
      console.warn('fetchProduct (NFC) error:', err);
    } finally {
      setLoading(false);
    }
  };


  // Helper to sort alphanumeric dimensions like "30mm" or "36" — does NOT mutate the input
  const sortDimensions = (arr: string[]) => {
    return [...arr].sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  };

  // Parse options from product string lists.
  // Priority: series-level constraints > product-level data.
  // If the series has defined allowed values, ONLY show those (ignoring stale product data).
  const widths = useMemo(() => {
    if (product?.series?.allowed_widths) {
      return sortDimensions(
        product.series.allowed_widths.split(",").map((s: string) => s.trim()).filter(Boolean)
      );
    }
    return sortDimensions(
      product?.width ? product.width.split(",").map((s: string) => s.trim()).filter(Boolean) : ["36"]
    );
  }, [product]);

  const heights = useMemo(() => {
    if (product?.series?.allowed_heights) {
      return sortDimensions(
        product.series.allowed_heights.split(",").map((s: string) => s.trim()).filter(Boolean)
      );
    }
    return sortDimensions(
      product?.height ? product.height.split(",").map((s: string) => s.trim()).filter(Boolean) : ["84"]
    );
  }, [product]);

  const thicknesses = useMemo(() => {
    // If series has defined allowed thicknesses, use ONLY those
    if (product?.series?.allowed_thicknesses) {
      return sortDimensions(
        product.series.allowed_thicknesses.split(",").map((s: string) => s.trim()).filter(Boolean)
      );
    }
    // Otherwise fall back to product data (stale) with any pricing rule thicknesses merged in
    let tList = product?.thickness
      ? product.thickness.split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["32"];
    if (pricingRules && pricingRules.length > 0) {
      pricingRules.forEach((r: any) => {
        if (r.thickness && !tList.includes(r.thickness)) {
          tList.push(r.thickness);
        }
      });
    }
    return sortDimensions(tList);
  }, [product, pricingRules]);

  // Force the selection to the lowest value whenever the product loads or options change
  React.useEffect(() => {
    if (widths.length > 0) setSelectedWidth(widths[0]);
  }, [widths]);

  React.useEffect(() => {
    if (heights.length > 0) setSelectedHeight(heights[0]);
  }, [heights]);

  React.useEffect(() => {
    if (thicknesses.length > 0) setSelectedThickness(thicknesses[0]);
  }, [thicknesses]);

  // Dynamic price calculator based on selections
  const estimate = useMemo(() => {
    if (pricingRules && pricingRules.length > 0) {
      const rule = pricingRules.find(r => r.thickness === selectedThickness) || pricingRules[0];
      const rate = rule?.rate || 0;
      const h = parseFloat(selectedHeight) || 84;
      const w = parseFloat(selectedWidth) || 36;
      const sqft = (h / 12) * (w / 12);
      const total = rate * sqft;
      return `₹${Math.round(total).toLocaleString("en-IN")}.00`;
    }

    let basePrice = 12000;

    // Add dimension modifiers
    basePrice += (parseInt(selectedWidth) - 36) * 50;
    basePrice += (parseInt(selectedHeight) - 84) * 80;
    basePrice += (parseInt(selectedThickness) - 32) * 100;

    return `₹${basePrice}.00`;
  }, [selectedWidth, selectedHeight, selectedThickness, pricingRules]);

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onSelect: (val: string) => void,
  ) => {
    return (
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text
          style={{
            fontSize: 10,
            color: "#666666",
            marginBottom: 6,
            fontFamily: "Gilroy-Regular",
          }}
        >
          {label}
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#CCCCCC",
            borderRadius: 6,
            paddingVertical: 8,
            paddingHorizontal: 10,
            backgroundColor: "#FFFFFF",
          }}
          onPress={() => setModalConfig({ label, value, options, onSelect })}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Gilroy-Regular",
              color: "#000",
            }}
          >
            {value}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading || !product) {
    const skeletonColor = "#E2E8F0";
    const skeletonColorLight = "#F1F5F9";
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

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Skeleton */}
          <View style={[styles.imageSection, { padding: 16 }]}>
            <SkeletonItem
              width="100%"
              height={260}
              borderRadius={12}
              color={skeletonColor}
            />
          </View>

          {/* Info Skeleton */}
          <View style={styles.infoSection}>
            <SkeletonItem
              width="60%"
              height={28}
              borderRadius={6}
              style={{ marginBottom: 12 }}
              color={skeletonColor}
            />
            <SkeletonItem
              width="40%"
              height={16}
              borderRadius={4}
              color={skeletonColorLight}
            />
          </View>

          {/* Customization Card Skeleton */}
          <View style={styles.customizationCard}>
            <View style={{ padding: 16 }}>
              <SkeletonItem
                width="50%"
                height={20}
                borderRadius={4}
                style={{ marginBottom: 16 }}
                color={skeletonColor}
              />

              {/* Specifications Table Skeleton */}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#EEEEEE",
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 24,
                }}
              >
                <SkeletonItem
                  width="100%"
                  height={24}
                  borderRadius={4}
                  style={{ marginBottom: 10 }}
                  color={skeletonColor}
                />
                <SkeletonItem
                  width="100%"
                  height={20}
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                  color={skeletonColorLight}
                />
                <SkeletonItem
                  width="100%"
                  height={20}
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                  color={skeletonColorLight}
                />
                <SkeletonItem
                  width="100%"
                  height={20}
                  borderRadius={4}
                  color={skeletonColorLight}
                />
              </View>

              {/* Dimension Selectors Skeleton */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <SkeletonItem width="31%" height={45} borderRadius={8} color={skeletonColor} />
                <SkeletonItem width="31%" height={45} borderRadius={8} color={skeletonColor} />
                <SkeletonItem width="31%" height={45} borderRadius={8} color={skeletonColor} />
              </View>

              {/* Estimate Banner Skeleton */}
              <SkeletonItem
                width="100%"
                height={64}
                borderRadius={10}
                color={skeletonColor}
              />
            </View>
          </View>
        </ScrollView>
      </View>
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
          <Image
            source={
              product.image_url
                ? { uri: product.image_url }
                : (product.slug || product.name || seriesName || "").toLowerCase().includes("rich")
                ? { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/nfc/nfc-rich.png" }
                : { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/nfc/nfc-legend.png" }
            }
            style={styles.productImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                const pName = product.slug || product.name || "NFC Wood Door";
                const pImg = product.image_url ? `\n🖼️ Product Image:\n${product.image_url}\n` : "";
                await Share.share({
                  title: `${pName} - WudGres`,
                  message: `🌟 Discover WudGres Premium Architectural Products 🌟\n\nI found this stunning design on the WudGres app and thought you'd love it!\n\n🪵 Product: ${pName}\n✨ Category: NFC Doors Collection\n${pImg}\nExplore premium doors, window shutters, and wood frames crafted for modern interiors.\n\n📲 View product & download app:\nhttps://wudgres.com`,
                  url: product.image_url || "https://wudgres.com",
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
          <Text style={styles.productTitle}>
            {(product.slug || product.name || "").toLowerCase().includes("eco") || (product.slug || product.name || "").toLowerCase().includes("legend")
              ? "NFC Legend"
              : product.slug || product.name}
          </Text>
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
          <View style={styles.specificationsContainer}>
            <Text style={styles.disclaimerTitle}>DISCLAIMER</Text>
            <Text style={styles.disclaimerText}>
              Colors of the products shown in Website are only for indication
              purpose, actual product may vary.
            </Text>

            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 0.5 },
                  ]}
                >
                  SL NO
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 2 },
                  ]}
                >
                  TEST
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1.2 },
                  ]}
                >
                  TEST METHOD
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 1 },
                  ]}
                >
                  VALUE
                </Text>
              </View>

              {/* Table Body */}
              {nfcSpecifications.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                >
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {item.id}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {item.test}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>
                    {item.method}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Dimension Selectors */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            {renderDropdown(
              "Thickness (mm)",
              selectedThickness,
              thicknesses,
              setSelectedThickness,
            )}
            {renderDropdown(
              "Height (In)",
              selectedHeight,
              heights,
              setSelectedHeight,
            )}
            {renderDropdown(
              "Width (In)",
              selectedWidth,
              widths,
              setSelectedWidth,
            )}
          </View>

          {/* Estimate Banner */}
          <View style={styles.estimateBanner}>
            <View style={styles.estimateDetails}>
              <Text style={styles.estimateDetailText}>
                {selectedWidth} × {selectedHeight} in
              </Text>
              <Text style={styles.estimateDetailText}>
                {selectedThickness}mm thickness
              </Text>
            </View>
            <View style={styles.estimatePriceBox}>
              <Text style={styles.estimateSubtitle}>Your Estimate</Text>
              <Text style={styles.estimatePrice}>{estimate}</Text>
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
    height: 350,
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
    paddingHorizontal: 8,
    fontSize: 10,
    fontFamily: "Gilroy-Regular",
    color: "#333333",
    borderRightWidth: 1,
    borderRightColor: "#EEEEEE",
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
