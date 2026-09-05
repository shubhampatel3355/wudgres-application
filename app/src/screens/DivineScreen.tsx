import React, { useState } from "react";
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

const COLUMN_COUNT = 2;

const getSubSeriesImage = (name: string) => {
  return { uri: "https://iglmngvjazarthujdofo.supabase.co/storage/v1/object/public/category-images/doors/divine.png" };
};

interface DivineScreenProps {
  navigation: any;
}

export const DivineScreen: React.FC<DivineScreenProps> = ({ navigation }) => {
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
    setIsLoading(true);
    let matchedSeries = false;
    try {
      const { data } = await supabase
        .from("series")
        .select("*")
        .ilike("name", "Divine%")
        .order("order_index");
      if (data && data.length > 0) {
        setSpecificSeriesTabs(data);
        setSelectedSeries(data[0].name);
        matchedSeries = true;
      } else {
        // Check if there's just a root category without sub-series
        const { data: parent } = await supabase
          .from("series")
          .select("id, name")
          .eq("name", "Divine")
          .single();
        if (parent) {
          setSpecificSeriesTabs([{ id: parent.id, name: parent.name }]);
          setSelectedSeries(parent.name);
          matchedSeries = true;
        }
      }
    } catch (e) {
      console.warn('fetchSeriesTabs error:', e);
    } finally {
      if (!matchedSeries) setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, series!inner(name)")
        .eq("series.name", selectedSeries)
        .order("name", { ascending: true });
      if (error) throw error;
      setDisplayProducts(data || []);
    } catch (e) {
      console.warn('fetchProducts error:', e);
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
      : getSubSeriesImage(series.name);

    // Strip out "Divine" for cleaner tab labels
    let tabLabel = series.name.replace(/^Divine\s+/i, "");
    if (!tabLabel || tabLabel.toLowerCase() === "divine") {
      tabLabel = "All";
    }

    return (
      <TouchableOpacity
        key={series.id || series.name}
        style={styles.seriesTab}
        onPress={() => setSelectedSeries(series.name)}
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

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard textColor="#333333"
      image={
        item.image_url ? { uri: item.image_url } : backgroundImages.woodTexture
      }
      name={item.name}
      onPress={() => handleProductPress(item.id)}
      showSkeleton={false}
    />
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
            <Text style={styles.title}>Divine Series</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* White Content Card */}
      <View style={styles.contentCard}>
        {specificSeriesTabs.length > 0 &&
        specificSeriesTabs[0].name !== "Divine" ? (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Series</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seriesTabsContainer}
            >
              {specificSeriesTabs.map((s) => renderSeriesTab(s))}
            </ScrollView>
          </View>
        ) : null}

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
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          renderItem={renderProduct}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.row}
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

