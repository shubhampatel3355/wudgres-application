import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { theme } from '../theme';
import { backgroundImages } from '../data/mockData';
import { BurgerMenu, GlassMenu } from '../components';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 24;

export const WishlistScreen = ({ navigation }: any) => {
  const { wishlistProducts, toggleWishlist, isLoading } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleWishlist(item)}
        >
          <Ionicons name="heart" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name || item.slug}</Text>
        <Text style={styles.seriesName}>{item.series?.name || 'Product'}</Text>
      </View>
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
            {/* Header Row */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
              </TouchableOpacity>

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
            <Text style={styles.title}>My Wishlist</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : wishlistProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#666" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptyText}>Save your favorite products here to easily find them later.</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => navigation.navigate('ProductsStack', { screen: 'AllProducts' })}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={wishlistProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
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
  backButton: {
    marginTop: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
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
    paddingTop: theme.spacing.lg,
    overflow: "hidden",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    
    color: '#F0EBE1',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Gilroy-Regular',
    color: '#8F8877',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  browseButtonText: {
    fontFamily: 'Gilroy-Regular',
    
    color: '#000000',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#24221D',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  imageContainer: {
    width: '100%',
    height: COLUMN_WIDTH * 1.5,
    backgroundColor: '#1A1815',
    position: 'relative',
    padding: 8, // add slight padding so contain doesn't touch edges
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(28, 26, 23, 0.6)',
    borderRadius: 20,
    padding: 6,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Gilroy-Bold',
    
    color: '#F0EBE1',
    marginBottom: 4,
  },
  seriesName: {
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
    color: '#8F8877',
  }
});
