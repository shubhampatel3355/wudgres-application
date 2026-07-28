import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import { BurgerMenu, GlassMenu } from "../components";
import { backgroundImages } from "../data/mockData";
import { doorCategories, DoorCategory } from "../data/doorsCategory";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = width - CARD_MARGIN * 2;

interface DoorsCategoryScreenProps {
  navigation: any;
  route: any;
}

export const DoorsCategoryScreen: React.FC<DoorsCategoryScreenProps> = ({
  navigation,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // Navigate to VenDecorScreen specifically if it is a Ven Decor category
    if (categoryId === "ven-decor" || categoryName.includes("Ven Decor")) {
      navigation.navigate("VenDecor");
    } else if (categoryId === "lamorous" || categoryName.includes("Lamorous")) {
      navigation.navigate("Lamorous");
    } else if (
      categoryId === "timbor-acacia" ||
      categoryName.includes("Legacy Wood")
    ) {
      navigation.navigate("Timbor");
    } else if (categoryId === "lamina" || categoryName.includes("Lamina")) {
      navigation.navigate("Lamina");
    } else if (
      categoryId === "solid-white" ||
      categoryName.includes("Solid White")
    ) {
      navigation.navigate("SolidWhite");
    } else if (
      categoryId === "teak-veneer" ||
      categoryName.includes("Teak Veneer")
    ) {
      navigation.navigate("TeakVeneer");
    } else if (categoryId === "metalem" || categoryName.includes("Metalem")) {
      navigation.navigate("Metalem");
    } else if (categoryId === "espial" || categoryName.includes("Espial")) {
      navigation.navigate("Espial");
    } else if (categoryId === "divine" || categoryName.includes("Divine")) {
      navigation.navigate("Divine");
    } else if (categoryId === "embozz" || categoryName.includes("Embozz")) {
      navigation.navigate("Embozz");
    } else if (
      categoryId === "flush-door" ||
      categoryName.includes("Flush Door")
    ) {
      navigation.navigate("FlushDoorDetail", {
        productId: "flush-door-static",
      });
    } else if (
      categoryId === "nfc-door" ||
      categoryName.includes("NFC Door") ||
      categoryName.includes("NFC DOORS")
    ) {
      navigation.navigate("NfcDoor");
    } else {
      // Navigate to ProductSeries with the selected door category
      navigation.navigate("ProductSeries", { seriesName: categoryName });
    }
  };

  const renderDoorCategory = ({ item }: { item: DoorCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.id, item.name)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.categoryImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
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
            <Text style={styles.title}>Doors </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* White Content Card */}
      <View style={styles.contentCard}>
        <FlatList
          data={doorCategories}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderDoorCategory}
          contentContainerStyle={styles.categoryList}
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
    fontSize: 32,
    fontFamily: "Gilroy-Bold",
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
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 100,
  },
  categoryCard: {
    width: CARD_WIDTH,
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1.1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontFamily: "Gilroy-Medium",
    color: theme.colors.textDark,
    textAlign: "center",
  },
});
