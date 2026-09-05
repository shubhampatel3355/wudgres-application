import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
  Animated,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { BurgerMenu, GlassMenu, Skeleton as SkeletonItem } from "../components";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { useWishlist } from "../context/WishlistContext";

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

// We will derive design options from the database pricing rules dynamically.


export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const productId = route.params?.productId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [brassSettings, setBrassSettings] = useState<any>(null);

  // Customization state
  const [selectedDesign, setSelectedDesign] = useState<string>("");
  type BrassSelection = 'NONE' | 'BRASS_DOME' | 'HRZTL_PCS_BRASS_DOMES';
  const [selectedBrassOption, setSelectedBrassOption] = useState<BrassSelection>('NONE');
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
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, series(*)")
        .eq("id", productId)
        .single();
      if (error) throw error;
      if (data) {
        setProduct(data);
        const ids = [data.series_id, data.series?.parent_id].filter(Boolean);
        if (ids.length > 0) {
          const { data: rules } = await supabase
            .from("pricing_rules")
            .select("*")
            .in("series_id", ids);
          if (rules) setPricingRules(rules);
        }

        if (data.brass_dome_enabled || data.hrztl_pcs_enabled) {
          const { data: bSettings } = await supabase
            .from("brass_settings")
            .select("*")
            .limit(1)
            .maybeSingle();
          if (bSettings) setBrassSettings(bSettings);
        }
      }
    } catch (e) {
      console.warn('fetchProduct error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to sort alphanumeric dimensions — does NOT mutate the input array
  const sortDimensions = (arr: string[]) => {
    return [...arr].sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  };

  // Parse options from product string lists, fallback, and sort by minimum value
  const widths = useMemo(
    () =>
      product?.width
        ? sortDimensions(
            product.width
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
          )
        : ["36"],
    [product],
  );
  const heights = useMemo(
    () =>
      product?.height
        ? sortDimensions(
            product.height
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
          )
        : ["84"],
    [product],
  );
  const thicknesses = useMemo(
    () =>
      product?.thickness
        ? sortDimensions(
            product.thickness
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
          )
        : ["32"],
    [product],
  );

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

  // Derive available designs (finishes or shades) from pricing rules
  const designOptions = useMemo(() => {
    if (!pricingRules || pricingRules.length === 0) return ["Standard Design"];
    
    const allowedFinishes = product?.finish 
      ? product.finish.split(',').map((s: string) => s.trim()).filter(Boolean) 
      : null;
      
    const options = new Set<string>();
    
    pricingRules.forEach(rule => {
      // Prioritize shade if available, else finish
      const opt = rule.shade || rule.finish;
      if (opt) {
        if (allowedFinishes && allowedFinishes.length > 0) {
          if (allowedFinishes.includes(opt)) {
            options.add(opt);
          }
        } else {
          options.add(opt);
        }
      }
    });
    
    const optsArray = Array.from(options);
    
    // Sort options to exactly match the order defined by the admin in allowedFinishes
    if (allowedFinishes && allowedFinishes.length > 0) {
      optsArray.sort((a, b) => {
        const indexA = allowedFinishes.indexOf(a);
        const indexB = allowedFinishes.indexOf(b);
        // If an option is somehow not in allowedFinishes, push it to the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    
    return optsArray.length > 0 ? optsArray : ["Standard Design"];
  }, [pricingRules, product]);

  React.useEffect(() => {
    if (designOptions.length > 0 && !designOptions.includes(selectedDesign)) {
      setSelectedDesign(designOptions[0]);
    }
  }, [designOptions]);

  // Actual price calculator based on selections and rules
  // Formula: Total Price = (Height ÷ 12) × (Width ÷ 12) × Rate (₹/SQFT)
  const estimate = useMemo(() => {
    if (pricingRules.length === 0) return "₹0.00";

    // Find the most specific matching rule (thickness + design/shade match)
    const matchingRule =
      pricingRules.find(
        (r) =>
          r.thickness === `${selectedThickness}mm` &&
          (r.finish === selectedDesign || r.shade === selectedDesign),
      ) ||
      pricingRules.find(
        (r) =>
          r.thickness === `${selectedThickness}mm`,
      ) ||
      pricingRules.find(
        (r) => r.finish === selectedDesign || r.shade === selectedDesign,
      ) ||
      pricingRules[0]; // last-resort fallback

    const rate = matchingRule?.rate || 0;

    // Convert inches → feet → SQFT
    const widthFt  = (parseFloat(selectedWidth)  || 36) / 12;
    const heightFt = (parseFloat(selectedHeight) || 84) / 12;
    const sqft = widthFt * heightFt;

    let totalPrice = rate * sqft;

    if (brassSettings && selectedBrassOption !== 'NONE') {
      if (selectedBrassOption === 'BRASS_DOME') {
        totalPrice += Number(brassSettings.brass_dome_price || 0);
      } else if (selectedBrassOption === 'HRZTL_PCS_BRASS_DOMES') {
        totalPrice += Number(brassSettings.hrztl_pcs_brass_domes_price || 0);
      }
    }

    // Format as Indian currency (e.g. ₹12,345)
    return `₹${Math.round(totalPrice).toLocaleString("en-IN")}`;
  }, [selectedDesign, selectedWidth, selectedHeight, selectedThickness, pricingRules, brassSettings, selectedBrassOption]);

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
          <Image
            source={
              product.image_url
                ? { uri: product.image_url }
                : backgroundImages.woodTexture
            }
            style={styles.productImage}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons 
              name={isInWishlist(product.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isInWishlist(product.id) ? theme.colors.primary : "#000"} 
            />
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                const pName = product.slug || product.name || "Premium Wood Product";
                const pSeries = product.series?.name ? product.series.name.replace(/Timbor/gi, "Legacy Wood").trim() : "Doors & Architectural Solutions";
                const pImg = product.image_url ? `\n🖼️ Product Image:\n${product.image_url}\n` : "";
                await Share.share({
                  title: `${pName} - WudGres`,
                  message: `🌟 Discover WudGres Premium Architectural Products 🌟\n\nI found this stunning design on the WudGres app and thought you'd love it!\n\n🪵 Product: ${pName}\n✨ Category: ${pSeries}\n${pImg}\nExplore premium doors, window shutters, and wood frames crafted for modern interiors.\n\n📲 View product & download app:\nhttps://wudgres.com`,
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
            {product.slug} - {product.series?.name ? product.series.name.replace(/Timbor/gi, "Legacy Wood").trim() : ""}
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
          <Text style={styles.customizeTitle}>
            Customize to preview the price
          </Text>

          {/* Design Options */}
          <View style={styles.optionsContainer}>
            {designOptions.map((opt, index) => {
              const isSelected = selectedDesign === opt;
              const isFull = designOptions.length === 1 || (designOptions.length % 2 !== 0 && index === designOptions.length - 1);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonActive,
                    { width: isFull ? '100%' : '48%' }
                  ]}
                  onPress={() => setSelectedDesign(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Brass Options */}
          {brassSettings && (
            <View style={{ marginTop: 10 }}>
              {product?.brass_dome_enabled && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.customizeTitle, { marginBottom: 12 }]}>
                    Brass dome
                  </Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedBrassOption === 'BRASS_DOME' && styles.optionButtonActive,
                        { width: '48%' }
                      ]}
                      onPress={() => setSelectedBrassOption('BRASS_DOME')}
                    >
                      <Text style={[styles.optionText, selectedBrassOption === 'BRASS_DOME' && styles.optionTextActive]}>
                        Include
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedBrassOption !== 'BRASS_DOME' && styles.optionButtonActive,
                        { width: '48%' }
                      ]}
                      onPress={() => {
                        if (selectedBrassOption === 'BRASS_DOME') setSelectedBrassOption('NONE');
                      }}
                    >
                      <Text style={[styles.optionText, selectedBrassOption !== 'BRASS_DOME' && styles.optionTextActive]}>
                        Exclude
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {product?.hrztl_pcs_enabled && (
                <View style={{ marginBottom: 24 }}>
                  <Text style={[styles.customizeTitle, { marginBottom: 12 }]}>
                    Hrztl Pcs & Brass Domes
                  </Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedBrassOption === 'HRZTL_PCS_BRASS_DOMES' && styles.optionButtonActive,
                        { width: '48%' }
                      ]}
                      onPress={() => setSelectedBrassOption('HRZTL_PCS_BRASS_DOMES')}
                    >
                      <Text style={[styles.optionText, selectedBrassOption === 'HRZTL_PCS_BRASS_DOMES' && styles.optionTextActive]}>
                        Include
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedBrassOption !== 'HRZTL_PCS_BRASS_DOMES' && styles.optionButtonActive,
                        { width: '48%' }
                      ]}
                      onPress={() => {
                        if (selectedBrassOption === 'HRZTL_PCS_BRASS_DOMES') setSelectedBrassOption('NONE');
                      }}
                    >
                      <Text style={[styles.optionText, selectedBrassOption !== 'HRZTL_PCS_BRASS_DOMES' && styles.optionTextActive]}>
                        Exclude
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

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
              <Text style={styles.estimateDetailText}>{selectedDesign}</Text>
              {selectedBrassOption !== 'NONE' && brassSettings && (
                <Text style={styles.estimateDetailText}>
                  + {selectedBrassOption === 'BRASS_DOME' ? 'Brass Dome' : 'Hrztl Pcs & Brass Domes'}
                </Text>
              )}
              <Text style={styles.estimateDetailText}>
                {selectedWidth}" × {selectedHeight}" ({((parseFloat(selectedWidth)||36)/12).toFixed(2)}ft × {((parseFloat(selectedHeight)||84)/12).toFixed(2)}ft)
              </Text>
              <Text style={styles.estimateDetailText}>
                {selectedThickness}mm | {((parseFloat(selectedWidth)||36) * (parseFloat(selectedHeight)||84) / 144).toFixed(2)} SQFT
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
  optionsContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonActive: {
    borderColor: "#000000",
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "Gilroy-Regular",
  },
  optionTextActive: {
    fontFamily: "Gilroy-Regular",
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
