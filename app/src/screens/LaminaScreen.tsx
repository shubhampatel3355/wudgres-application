import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ProductCard, GlassMenu, BurgerMenu } from "../components";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";

const COLUMN_COUNT = 2;

const getSubSeriesImage = (name: string) => {
  if (!name) return { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamina-2.png" };
  const lowerName = name.toLowerCase();
  if (lowerName.includes("rich"))
    return { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamina.png" };
  if (lowerName.includes("eco"))
    return { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamina-2.png" };
  return { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/lamina-2.png" };
};

const SeriesTabCard = ({ series, onPress, isSelected }: { series: any, onPress: () => void, isSelected: boolean }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const seriesThumbnail = series.thumbnail_url
    ? { uri: series.thumbnail_url }
    : getSubSeriesImage(series.name);

  const tabLabel = series.name.replace(/^Lamina\s+/i, "");

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.seriesTab, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.seriesThumbnailContainer, isSelected && styles.seriesThumbnailSelected]}>
          <Image source={seriesThumbnail} style={styles.seriesThumbnailImage} resizeMode="cover" />
        </View>
        <Text style={styles.seriesTabText}>{tabLabel}</Text>
      </Animated.View>
    </Pressable>
  );
};

interface LaminaScreenProps {
  navigation: any;
}

export const LaminaScreen: React.FC<LaminaScreenProps> = ({ navigation }) => {
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [specificSeriesTabs, setSpecificSeriesTabs] = useState<any[]>([]);
  const [displayProducts, setDisplayProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchSeriesTabs();
  }, []);

  const fetchSeriesTabs = async () => {
    setIsLoading(true);
    try {
      const { data: parent } = await supabase
        .from("series")
        .select("id")
        .eq("name", "Lamina")
        .single();
        
      let subSeriesData = null;
      if (parent) {
        const { data } = await supabase
          .from("series")
          .select("*")
          .eq("parent_id", parent.id)
          .order("order_index");
        subSeriesData = data;
      }
      
      if (!subSeriesData || subSeriesData.length === 0) {
        const { data } = await supabase
          .from("series")
          .select("*")
          .ilike("name", "Lamina %")
          .order("order_index");
        subSeriesData = data;
      }

      if (subSeriesData && subSeriesData.length > 0) {
        setSpecificSeriesTabs(subSeriesData);
        setSelectedSeries(subSeriesData[0].name);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.log("Error fetching series, using fallback:", e);
    }
    
    // Fallback if no sub-series exist in DB
    const fallbackData = [
      { id: "lamina-rich", name: "Lamina Rich" },
      { id: "lamina-eco", name: "Lamina Eco" },
    ];
    setSpecificSeriesTabs(fallbackData);
    setSelectedSeries(fallbackData[0].name);
    setIsLoading(false);
  };

  const handleSeriesPress = (seriesName: string) => {
    navigation.navigate("ProductSeries", { seriesName });
  };

  const renderSeriesTab = (series: any) => {
    const isSelected = selectedSeries === series.name;
    return (
      <SeriesTabCard
        key={series.id}
        series={series}
        isSelected={isSelected}
        onPress={() => handleSeriesPress(series.name)}
      />
    );
  };

  const renderSkeleton = (key: number) => (
    <View key={key} style={styles.seriesTab}>
      <View style={[styles.seriesThumbnailContainer, { backgroundColor: '#e0e0e0', elevation: 0, borderWidth: 0 }]} />
      <View style={{ width: 120, height: 16, backgroundColor: '#e0e0e0', marginTop: 12, borderRadius: 4 }} />
    </View>
  );

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
            <Text style={styles.title}>Lamina Series</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* White Content Card */}
      <View style={styles.contentCard}>
        {/* Series Filter */}
        <ScrollView
          style={styles.filterContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.seriesTabsContainer}>
            {isLoading 
              ? [1, 2].map(renderSkeleton)
              : specificSeriesTabs.map((s) => renderSeriesTab(s))}
          </View>
        </ScrollView>
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
    flexDirection: "column",
    paddingVertical: theme.spacing.xs,
  },
  seriesTab: {
    marginBottom: theme.spacing.md,
    alignItems: "center",
    width: Dimensions.get("window").width - 32,
  },
  seriesThumbnailContainer: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "transparent",
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
