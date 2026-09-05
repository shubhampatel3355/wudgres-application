import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, GlassMenu, Skeleton } from "../components";
import { theme } from "../theme";
import { backgroundImages } from "../data/mockData";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - theme.spacing.md * 4) / COLUMN_COUNT;

interface GalleryScreenProps {
  navigation: any;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true });
        if (error) throw error;
        setProducts(data || []);
      } catch (e) {
        console.warn('fetchProducts (Gallery) error:', e);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const renderGalleryItem = ({ item }: { item: any }) => (
    <View style={styles.galleryItem}>
      <Image
        source={
          item.image_url
            ? { uri: item.image_url }
            : backgroundImages.woodTexture
        }
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <LinearGradient
      colors={["#2B2B2B", "#1A1A1A", "#0D0D0D"]}
      style={styles.background}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          onMenuPress={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
        />

        <Text style={styles.title}>Gallery</Text>

        {isLoading ? (
          <FlatList
            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            keyExtractor={(item) => item.toString()}
            numColumns={COLUMN_COUNT}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
              <View style={styles.galleryItem}>
                <Skeleton width="100%" height="100%" />
              </View>
            )}
            contentContainerStyle={styles.galleryList}
          />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            numColumns={COLUMN_COUNT}
            showsVerticalScrollIndicator={false}
            renderItem={renderGalleryItem}
            contentContainerStyle={styles.galleryList}
          />
        )}
      </SafeAreaView>

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: "Gilroy-Bold",
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  galleryList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  galleryItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
});
