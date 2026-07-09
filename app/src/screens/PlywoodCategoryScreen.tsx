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
import { plywoodCategories, PlywoodCategory } from "../data/plywoodCategory";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = width - CARD_MARGIN * 2;

interface PlywoodCategoryScreenProps {
  navigation: any;
  route: any;
}

export const PlywoodCategoryScreen: React.FC<PlywoodCategoryScreenProps> = ({
  navigation,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    if (categoryId === "plywood") {
      navigation.navigate("PlywoodDetail", { productId: "plywood-static" });
    } else if (categoryId === "block-boards") {
      navigation.navigate("BlockBoardDetail", {
        productId: "block-board-static",
      });
    }
  };

  const renderPlywoodCategory = ({ item }: { item: PlywoodCategory }) => (
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
      {/* Header */}
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

            <Text style={styles.title}>Plywood & Block Boards</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Content */}
      <View style={styles.contentCard}>
        <FlatList
          data={plywoodCategories}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderPlywoodCategory}
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
    backgroundColor: "#1a1a1a",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    fontFamily: "Unbounded_600SemiBold",
    color: theme.colors.textDark,
    textAlign: "center",
  },
});
