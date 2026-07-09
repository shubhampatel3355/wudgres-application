import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SeriesCard, BurgerMenu, GlassMenu } from "../components";
import { theme } from "../theme";
import { backgroundImages, categories } from "../data/mockData";

const { width } = Dimensions.get("window");

interface AllProductsScreenProps {
  navigation: any;
  route: any;
}

export const AllProductsScreen: React.FC<AllProductsScreenProps> = ({
  navigation,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Using static data from mockData instead of Supabase
  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === "doors") {
      navigation.navigate("HomeStack", { screen: "DoorsCategory" });
    } else if (categoryId === "nfc") {
      navigation.navigate("HomeStack", { screen: "NFCCategory" });
    } else if (categoryId === "window-shutters") {
      navigation.navigate("WindowShutterDetail", {
        productId: "shutter-static",
      });
    } else if (categoryId === "eng-wood-frames") {
      navigation.navigate("EngineeredWoodFrameDetail", {
        productId: "eng-wood-frame-static",
      });
    } else if (categoryId === "plywood") {
      navigation.navigate("HomeStack", { screen: "PlywoodCategory" });
    } else {
      navigation.navigate("ProductSeries", { seriesName: categoryId });
    }
  };

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
                  onPress={() => {
                    navigation.navigate("HomeStack", { screen: "Home" });
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={backgroundImages.logo}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("Search")}
                >
                  <Ionicons
                    name="search-outline"
                    size={26}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>

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
            <Text style={styles.title}>All Products</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={4}
          decelerationRate="fast"
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <SeriesCard
              image={item.image}
              name={item.name}
              height={width * 0.45}
              imageResizeMode="cover"
              onPress={() => handleCategoryPress(item.id)}
            />
          )}
        />
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
    backgroundColor: theme.colors.background,
  },

  headerBackground: {
    width: "100%",
  },

  headerContent: {
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xl + 10,
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
    alignSelf: "flex-start", // ⬅️ locks logo to left
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
    fontSize: 32,
    fontFamily: "Unbounded_700Bold",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginLeft: 0,
    paddingHorizontal: theme.spacing.md,
  },

  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: theme.spacing.md,
  },

  categoryList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 100,
  },
});
