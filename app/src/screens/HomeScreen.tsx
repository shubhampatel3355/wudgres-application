import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { CategoryCard, SeriesCard, BurgerMenu, GlassMenu } from "../components";
import { theme } from "../theme";
import { supabase } from "../lib/supabase";
import {
  backgroundImages,
  currentUser,
  categories,
  series,
} from "../data/mockData";

const { width } = Dimensions.get("window");

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [heroContent, setHeroContent] = useState<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          if (data?.name) {
            setUserName(data.name.split(' ')[0]); // Just use first name
          }
        }
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };

    const fetchHeroContent = async () => {
      try {
        const { data } = await supabase
          .from('app_hero_content')
          .select('*')
          .limit(1)
          .single();
        if (data) {
          setHeroContent(data);
        }
      } catch (err) {
        console.log('Error fetching hero content', err);
      }
    };

    fetchUser();
    fetchHeroContent();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === "doors") {
      navigation.navigate("DoorsCategory");
    } else if (categoryId === "nfc") {
      navigation.navigate("NFCCategory");
    } else if (categoryId === "window-shutters") {
      navigation.navigate("WindowShutterDetail", {
        productId: "shutter-static",
      });
    } else if (categoryId === "eng-wood-frames") {
      navigation.navigate("EngineeredWoodFrameDetail", {
        productId: "eng-wood-frame-static",
      });
    } else if (categoryId === "plywood") {
      navigation.navigate("PlywoodCategory");
    } else if (categoryId === "flush-doors") {
      navigation.navigate("FlushDoorDetail", {
        productId: "flush-door-static",
      });
    } else {
      navigation.navigate("ProductsStack", {
        screen: "AllProducts",
        params: { categoryId },
      });
    }
  };

  const handleSeriesPress = (seriesName: string) => {
    const lowerName = seriesName.toLowerCase();
    if (lowerName.includes("ven decor")) {
      navigation.navigate("VenDecor");
    } else if (lowerName.includes("lamorous")) {
      navigation.navigate("Lamorous");
    } else if (lowerName.includes("timbor")) {
      navigation.navigate("Timbor");
    } else if (lowerName.includes("lamina")) {
      navigation.navigate("Lamina");
    } else if (lowerName.includes("solid white")) {
      navigation.navigate("SolidWhite");
    } else if (lowerName.includes("teak veneer")) {
      navigation.navigate("TeakVeneer");
    } else if (lowerName.includes("metalem")) {
      navigation.navigate("Metalem");
    } else if (lowerName.includes("espial")) {
      navigation.navigate("Espial");
    } else if (lowerName.includes("divine")) {
      navigation.navigate("Divine");
    } else if (lowerName.includes("embozz")) {
      navigation.navigate("Embozz");
    } else if (
      lowerName.includes("flush door") ||
      lowerName.includes("flush-door") ||
      lowerName === "flushdoor"
    ) {
      navigation.navigate("FlushDoorDetail", {
        productId: "flush-door-static",
      });
    } else if (
      lowerName.includes("nfc door") ||
      lowerName.includes("nfc-door") ||
      lowerName === "nfcdoor" ||
      lowerName.includes("nfc doors")
    ) {
      navigation.navigate("NfcDoor");
    } else {
      navigation.navigate("ProductSeries", { seriesName });
    }
  };

  const handleViewAll = () => {
    navigation.navigate("ProductsStack");
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

            {/* Greeting */}
            <Text style={styles.greeting}>Hey, {userName}!</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Content Card */}
      <Animated.View
        style={[
          styles.contentCard,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={4}
          decelerationRate="normal"
        >
          {/* video Card */}
          {/* Hero Content */}
          <View style={styles.videoContainer}>
            {heroContent?.media_type === 'carousel' && heroContent?.carousel_images?.length > 0 ? (
              <View style={{ flex: 1, backgroundColor: '#000', borderRadius: 16, overflow: 'hidden' }}>
                <FlatList
                  data={heroContent.carousel_images}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                  renderItem={({ item }) => (
                    <Image 
                      source={{ uri: item }} 
                      style={{ width: width - 32, height: "100%", resizeMode: 'cover' }} 
                    />
                  )}
                />
                <View style={{ position: 'absolute', bottom: 10, width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
                  {heroContent.carousel_images.map((_: any, i: number) => {
                    const opacity = scrollX.interpolate({
                      inputRange: [(i - 1) * (width - 32), i * (width - 32), (i + 1) * (width - 32)],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp'
                    });
                    return <Animated.View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginHorizontal: 4, opacity }} />;
                  })}
                </View>
              </View>
            ) : (
              <Video
                source={heroContent?.video_url ? { uri: heroContent.video_url } : require("../assets/images/video/video.mp4")}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                usePoster={true}
                posterSource={heroContent?.poster_url ? { uri: heroContent.poster_url } : require("../assets/images/about.jpeg")}
                posterStyle={{ resizeMode: "cover" }}
                shouldPlay
                isLooping
                isMuted
              />
            )}
          </View>

          {/* Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <TouchableOpacity
                onPress={handleViewAll}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={4}
              decelerationRate="fast"
              snapToInterval={135} // card width + margin (120 + 15)
              snapToAlignment="start"
              removeClippedSubviews={true}
              renderItem={({ item }) => (
                <CategoryCard
                  image={item.image}
                  name={item.name}
                  onPress={() => handleCategoryPress(item.id)}
                />
              )}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Browse by Series Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse by series</Text>
              <TouchableOpacity
                onPress={handleViewAll}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>

            {series.map((item) => (
              <SeriesCard
                key={item.id}
                image={item.image}
                name={item.name}
                onPress={() => handleSeriesPress(item.name)}
              />
            ))}
          </View>

          {/* Bottom Padding for Tab Bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

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
  scrollView: {
    flex: 1,
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

  greeting: {
    fontSize: 32,
    fontFamily: "Unbounded_700Bold",
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginLeft: 0,
    paddingHorizontal: theme.spacing.md,
  },
  videoContainer: {
    // marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: 12,
    overflow: "hidden",
    height: 200,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: "Unbounded_600SemiBold",
    color: theme.colors.textDark,
  },
  viewAllButton: {
    backgroundColor: theme.colors.textDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  viewAllText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontFamily: "Unbounded_500Medium",
  },
  categoriesList: {
    paddingVertical: theme.spacing.xs,
  },
});
