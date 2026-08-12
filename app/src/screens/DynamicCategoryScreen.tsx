import React, { useState, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { BurgerMenu, Skeleton as SkeletonItem } from "../components";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

interface DynamicCategoryScreenProps {
  navigation: any;
  route: any;
}

export const DynamicCategoryScreen: React.FC<DynamicCategoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { categoryId } = route.params;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [frameDimensions, setFrameDimensions] = useState<any[]>([]);

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
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch category content
      const { data } = await supabase
        .from("app_category_images")
        .select("*")
        .eq("id", categoryId)
        .single();
        
      if (data) {
        setCategoryData(data);
        
        // 2. Fetch external pricing if needed
        if (data.pricing_source === 'frame_dimensions') {
          const { data: dimRows } = await supabase
            .from("frame_dimensions")
            .select("*")
            .eq("series_slug", categoryId)
            .order("sort_order");
          setFrameDimensions(dimRows || []);
        }
      } else {
        // Fallback for empty
        setCategoryData({
          name: categoryId,
          hero_title: "Coming Soon",
          description: "Content for this category is currently being updated.",
          features: [],
          specifications: [],
          pricing_source: 'none'
        });
      }
    } catch (err) {
      console.log("Error fetching dynamic category:", err);
    }
    setLoading(false);
  };

  const pricingTable = useMemo(() => {
    if (!categoryData) return [];
    if (categoryData.pricing_source === 'custom') {
      return categoryData.pricing_data || [];
    }
    if (categoryData.pricing_source === 'frame_dimensions' && frameDimensions.length > 0) {
      return frameDimensions.map((r, i) => ({
        id: String.fromCharCode(65 + i),
        description: r.description,
        rate: r.col2 || "-",
      }));
    }
    return [];
  }, [categoryData, frameDimensions]);

  if (loading || !categoryData) {
    const glassColor = "rgba(255,255,255,0.15)";
    return (
      <ImageBackground source={backgroundImages.woodTexture} style={styles.container}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <SkeletonItem width={40} height={40} borderRadius={20} color={glassColor} />
            <SkeletonItem width={30} height={30} borderRadius={15} color={glassColor} />
          </View>
        </SafeAreaView>
        <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageSection}>
            <SkeletonItem width={width - 32} height={280} borderRadius={8} color={glassColor} />
          </View>
          <View style={styles.detailsContainer}>
            <SkeletonItem width={200} height={24} borderRadius={4} color={glassColor} style={{ marginBottom: 16 }} />
            <SkeletonItem width="100%" height={100} borderRadius={8} color={glassColor} style={{ marginBottom: 24 }} />
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={backgroundImages.woodTexture} style={styles.container}>
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView edges={["top"]} style={{ zIndex: 10 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <BurgerMenu
            size={24}
            color={theme.colors.textPrimary}
            isOpen={isMenuOpen}
            onPress={() => setIsMenuOpen(!isMenuOpen)}
          />
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Hero Image */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            {categoryData.hero_image_url ? (
               <Image source={{ uri: categoryData.hero_image_url }} style={styles.mainImage} resizeMode="contain" />
            ) : (
               <View style={[styles.mainImage, { backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                 <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.5)" />
               </View>
            )}
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{categoryData.hero_title || categoryData.name}</Text>
          </View>
          
          {categoryData.description ? (
            <Text style={styles.description}>{categoryData.description}</Text>
          ) : null}

          {/* Features */}
          {categoryData.features && categoryData.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <View style={styles.featuresGrid}>
                {categoryData.features.map((feature: any, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Specifications */}
          {categoryData.specifications && categoryData.specifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technical Specifications</Text>
              <View style={styles.specsTable}>
                {categoryData.specifications.map((spec: any, index: number) => (
                  <View key={index} style={styles.specRow}>
                    <View style={styles.specTestCell}>
                      <Text style={styles.specLabel}>{spec.test}</Text>
                      {spec.method ? <Text style={styles.specMethod}>{spec.method}</Text> : null}
                    </View>
                    <View style={styles.specValueCell}>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pricing Table */}
          {pricingTable.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dimensions & Pricing</Text>
              <View style={styles.pricingTable}>
                {pricingTable.map((row: any, index: number) => (
                  <View key={index} style={styles.pricingRow}>
                    <View style={styles.pricingIdBadge}>
                      <Text style={styles.pricingIdText}>{row.id || String.fromCharCode(65 + index)}</Text>
                    </View>
                    <Text style={styles.pricingDesc}>{row.description}</Text>
                    <Text style={styles.pricingRate}>₹ {row.rate}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>
      </Animated.ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  mainImageContainer: {
    width: width - 32,
    height: (width - 32) * 1.2, // slightly taller than square
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  titleRow: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 28,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: 16,
    fontFamily: "Gilroy-Medium",
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Gilroy-Medium",
    color: theme.colors.textPrimary,
    flex: 1,
  },
  specsTable: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  specTestCell: {
    flex: 1.5,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.05)",
  },
  specValueCell: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  specLabel: {
    fontSize: 14,
    fontFamily: "Gilroy-SemiBold",
    color: theme.colors.textPrimary,
  },
  specMethod: {
    fontSize: 12,
    fontFamily: "Gilroy-Medium",
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  specValue: {
    fontSize: 14,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.primary,
  },
  pricingTable: {
    gap: 8,
  },
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pricingIdBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pricingIdText: {
    color: theme.colors.primary,
    fontFamily: "Gilroy-Bold",
    fontSize: 14,
  },
  pricingDesc: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: "Gilroy-Medium",
    fontSize: 14,
  },
  pricingRate: {
    color: theme.colors.primary,
    fontFamily: "Gilroy-Bold",
    fontSize: 16,
    marginLeft: 12,
  },
});
