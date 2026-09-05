import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ProductCard, GlassMenu, BurgerMenu } from "../components";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { getCached, setCached } from "../lib/queryCache";

const COLUMN_COUNT = 2;

interface TimborScreenProps {
  navigation: any;
}

export const TimborScreen: React.FC<TimborScreenProps> = ({ navigation }) => {
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [specificSeriesTabs, setSpecificSeriesTabs] = useState<any[]>([]);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchSeriesTabs();
  }, []);

  React.useEffect(() => {
    if (selectedSeries) {
      fetchProducts();
    }
  }, [selectedSeries]);

  const fetchSeriesTabs = async () => {
    const CACHE_KEY = 'legacyWoodSeries';
    const cached = getCached(CACHE_KEY);
    if (cached) {
      setSpecificSeriesTabs(cached);
      setSelectedSeries(cached[0].id);
      return;
    }

    setIsLoading(true);
    try {
      // Try new name first, fallback to old name
      const { data } = await supabase
        .from("series")
        .select("*")
        .or("name.ilike.Legacy Wood%,name.ilike.Timbor%")
        .order("order_index");
      if (data && data.length > 0) {
        setCached(CACHE_KEY, data);
        setSpecificSeriesTabs(data);
        setSelectedSeries(data[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.warn('fetchSeriesTabs (Timbor) error:', e);
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!selectedSeries) return;
    const CACHE_KEY = `legacyWoodProducts:${selectedSeries}`;
    const cached = getCached(CACHE_KEY);
    if (cached) {
      setDisplayProducts(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, series!inner(name)")
        .eq("series_id", selectedSeries)
        .order("name", { ascending: true });
      if (error) throw error;
      const result = data || [];
      setCached(CACHE_KEY, result);
      setDisplayProducts(result);
    } catch (e) {
      console.warn('fetchProducts (Timbor) error:', e);
      setDisplayProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const renderSeriesTab = (series: any) => {
    const isSelected = selectedSeries === series.name;
    const seriesThumbnail = series.thumbnail_url
      ? { uri: series.thumbnail_url }
      : backgroundImages.woodTexture;

    // Strip out series prefix for cleaner tab labels
    const tabLabel = series.name
      .replace(/^Legacy Wood\s*/i, "")
      .replace(/^Timbor\s*/i, "") || "Legacy Wood";

    return (
      <TouchableOpacity
        key={series.id || series.name}
        style={styles.seriesTab}
        onPress={() => setSelectedSeries(series.id)}
      >
        <View
          style={[
            styles.seriesThumbnailContainer,
            isSelected && styles.seriesThumbnailSelected,
          ]}
        >
          <Image
            source={seriesThumbnail}
            style={styles.seriesThumbnailImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.seriesTabText}>{tabLabel}</Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = useCallback(({ item }: { item: any }) => (
    <ProductCard textColor="#333333"
      image={
        item.image_url ? { uri: item.image_url } : backgroundImages.woodTexture
      }
      name={item.name}
      onPress={() => handleProductPress(item.id)}
      showSkeleton={false}
    />
  ), []);

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Header with Wood Texture Background */}
      <ImageBackground
        source={backgroundImages.woodTexture}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            {/* Logo Row */}
            <View style={styles.headerRow}>
              <View style={styles.logoContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("HomeStack", { screen: "Home" })
                  }
                >
                  <Image
                    source={backgroundImages.logo}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.headerIcons}>
                <View style={styles.iconButton}>
                  <BurgerMenu
                    size={24}
                    color={theme.colors.textPrimary}
                    isOpen={isMenuOpen}
                    onPress={() => setIsMenuOpen(!isMenuOpen)}
                  />
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Legacy Wood Series</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* White Content Card */}
      <View style={styles.contentCard}>
        {isLoading ? (
          <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            keyExtractor={(item) => item.toString()}
            numColumns={COLUMN_COUNT}
            showsVerticalScrollIndicator={false}
            renderItem={({ index }) => (
              <ProductCard textColor="#333333" image={null} name="" index={index} showSkeleton={true} />
            )}
            contentContainerStyle={styles.productList}
            columnWrapperStyle={styles.row}
          />
        ) : (
          <FlatList
          data={displayProducts}
          keyExtractor={keyExtractor}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          renderItem={renderProduct}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.row}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={true}
        />
        )}
      </View>

      {/* Glass Menu Overlay */}
      <GlassMenu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => {
          setIsMenuOpen(false);
          if (screen === "Products") {
            navigation.navigate("ProductsStack", { screen: "AllProducts" });
          } else if (screen === "Home") {
            navigation.navigate("HomeStack", { screen: "Home" });
          } else if (screen === "Category") {
            navigation.navigate("HomeStack", { screen: "DoorsCategory" });
          } else {
            navigation.navigate(screen);
          }
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
  },
  headerContent: {
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  logoContainer: {
    height: 48,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginLeft: 0,
  },
  logo: {
    height: 44,
    width: 85,
    alignSelf: "flex-start",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconButton: {
    marginTop: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.textPrimary,
    marginTop: 0,
    marginLeft: 0,
    paddingHorizontal: theme.spacing.md,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: theme.spacing.md,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  filterLabel: {
    fontSize: theme.fontSize.md,
    fontFamily: "Gilroy-Regular",
    color: "#000000",
    marginBottom: theme.spacing.sm,
  },
  seriesTabsContainer: {
    flexDirection: "row",
    paddingVertical: theme.spacing.xs,
  },
  seriesTab: {
    marginRight: theme.spacing.md,
    alignItems: "center",
    width: 86,
  },
  seriesThumbnailContainer: {
    width: 80,
    height: 85,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#111111",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  seriesThumbnailSelected: {
    borderColor: "transparent",
  },
  seriesThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  seriesTabText: {
    fontSize: theme.fontSize.sm,
    fontFamily: "Gilroy-Regular",
    color: "#000000",
    marginTop: 6,
    textAlign: "center",
  },
  productList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  row: {
    justifyContent: "space-between",
  },
});

