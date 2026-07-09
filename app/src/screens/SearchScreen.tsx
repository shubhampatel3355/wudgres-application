import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { ProductCard } from "../components";
import { theme } from "../theme";
import { supabase } from "../lib/supabase";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;

const fluidSpringConfig = {
  duration: 400,
  create: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.opacity,
    springDamping: 0.8,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.8,
  },
  delete: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.opacity,
    springDamping: 0.8,
  },
};

const STATIC_CATEGORIES = [
  {
    id: "static-ven-decor",
    name: "Ven Decor",
    image_url: require("../assets/images/door/door-image/Ven-Decor.png"),
    route: "VenDecor",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-lamorous",
    name: "Lamorous",
    image_url: require("../assets/images/door/door-image/Lamorous.png"),
    route: "Lamorous",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-timbor",
    name: "Timbor",
    image_url: require("../assets/images/door/timbor/Timbor Bg.png"),
    route: "Timbor",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-lamina",
    name: "Lamina",
    image_url: require("../assets/images/door/lamina/Lamina 2.jpeg"),
    route: "Lamina",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-solid-white",
    name: "Solid White",
    image_url: require("../assets/images/door/door-image/Solid White.png"),
    route: "SolidWhite",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-teak-veneer",
    name: "Teak Veneer",
    image_url: require("../assets/images/door/teak/Teak Veneer Bg.png"),
    route: "TeakVeneer",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-metalem",
    name: "Metalem",
    image_url: require("../assets/images/door/metalem/Metalem Bg.png"),
    route: "Metalem",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-espial",
    name: "Espial",
    image_url: require("../assets/images/door/espial/Espial Bg.png"),
    route: "Espial",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-divine",
    name: "Divine",
    image_url: require("../assets/images/door/divine/Divine Bg.png"),
    route: "Divine",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-embozz",
    name: "Embozz",
    image_url: require("../assets/images/door/embozz/Embozz Bg.png"),
    route: "Embozz",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-window-shutters",
    name: "Window Shutters",
    image_url: require("../assets/images/home/WINDOWS Web BG.jpg"),
    route: "WindowShutterDetail",
    isStatic: true,
    inHomeStack: false,
  },
  {
    id: "static-eng-wood-frames",
    name: "Engineered Wood Frames",
    image_url: require("../assets/images/home/Frames Bg.jpg"),
    route: "EngineeredWoodFrameDetail",
    isStatic: true,
    inHomeStack: false,
  },
  {
    id: "static-plywood",
    name: "Plywood",
    image_url: require("../assets/images/home/Ply Wood Bg.jpg"),
    route: "PlywoodCategory",
    isStatic: true,
    inHomeStack: true,
  },
  {
    id: "static-block-boards",
    name: "Block Boards",
    image_url: require("../assets/images/products/BLOCK-MR.png"),
    route: "BlockBoardDetail",
    isStatic: true,
    inHomeStack: false,
  },
  {
    id: "static-flush-doors",
    name: "Flush Doors",
    image_url: require("../assets/images/door/door-image/Flush Doors.png"),
    route: "FlushDoorDetail",
    isStatic: true,
    inHomeStack: false,
  },
];

interface SearchScreenProps {
  navigation: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(true); // autoFocus is true

  const searchBarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(searchBarAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // colors can't use native driver
    }).start();
  }, [isFocused]);

  const borderColor = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.1)", theme.colors.primary],
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query.trim());
      } else {
        LayoutAnimation.configureNext(fluidSpringConfig);
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);

    // 1. Find matching static categories
    const lowerQuery = searchQuery.toLowerCase();
    const matchedStatic = STATIC_CATEGORIES.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery),
    );

    // 2. Fetch matching products from Supabase
    const { data, error } = await supabase
      .from("products")
      .select("*, series!inner(name)")
      .ilike("name", `%${searchQuery}%`)
      .limit(20);

    // 3. Combine results (static first)
    const combinedResults = [...matchedStatic];
    if (data) {
      combinedResults.push(...data);
    }

    LayoutAnimation.configureNext(fluidSpringConfig);
    setResults(combinedResults);
    setIsLoading(false);
  };

  const handleProductPress = (item: any) => {
    if (item.isStatic) {
      if (item.inHomeStack) {
        navigation.navigate("Main", { 
          screen: "HomeStack", 
          params: { screen: item.route } 
        });
      } else {
        navigation.navigate(item.route);
      }
    } else {
      navigation.navigate("ProductDetail", { productId: item.id });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Search Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Animated.View
            style={[styles.inputContainer, { borderColor, borderWidth: 1 }]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Search products & series"
              placeholderTextColor="#999"
              autoFocus={true}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              clearButtonMode="always"
            />
          </Animated.View>
        </View>

        {/* Results Area */}
        <View style={styles.resultsContainer}>
          {isLoading ? (
            <FlatList
              data={[1, 2, 3, 4]}
              keyExtractor={(item) => item.toString()}
              numColumns={COLUMN_COUNT}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              renderItem={({ index }) => (
                <View style={styles.cardWrapper}>
                  <ProductCard
                    image={null}
                    name=""
                    index={index}
                    showSkeleton={true}
                  />
                </View>
              )}
            />
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              numColumns={COLUMN_COUNT}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <View style={styles.cardWrapper}>
                  <ProductCard
                    image={
                      item.isStatic ? item.image_url : { uri: item.image_url }
                    }
                    name={item.name}
                    index={index}
                    onPress={() => handleProductPress(item)}
                  />
                </View>
              )}
            />
          ) : query.trim().length > 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>
                No results found for "{query}"
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.90)", // transparent background for BlurView
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Unbounded_400Regular",
    fontSize: 14,
    height: "100%",
  },
  resultsContainer: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16, // Instead of marginBottom on ProductCard
  },
  cardWrapper: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#999",
    fontFamily: "Unbounded_400Regular",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
