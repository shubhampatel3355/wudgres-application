import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../theme";
import { Skeleton } from "./Skeleton";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - theme.spacing.md * 3) / 2;

interface ProductCardProps {
  image: any;
  name: string;
  onPress?: () => void;
  showSkeleton?: boolean;
  index?: number;
  textColor?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  onPress,
  showSkeleton = false,
  index = 0,
  textColor = "#FFFFFF",
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Entrance animations
  const translateY = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
        delay: index * 15, // Fast stagger
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
        delay: index * 15, // Fast stagger
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ opacity: opacityAnim, width: "100%" }}>
          <View style={styles.imageContainer}>
            {showSkeleton ? (
              <Skeleton width="100%" height="100%" borderRadius={0} />
            ) : (
              <Image 
                source={image} 
                style={styles.image} 
                contentFit="contain" 
                transition={200}
                cachePolicy="memory-disk"
              />
            )}
          </View>

          <View style={styles.textContainer}>
            {showSkeleton ? (
              <View style={styles.skeletonContainer}>
                <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="80%" height={8} borderRadius={4} />
              </View>
            ) : (
              <Text style={[styles.nameText, { color: textColor }]} numberOfLines={2}>
                {name}
              </Text>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: theme.spacing.xl,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 0.5, // Changed to 0.5 for better proportions
    backgroundColor: "transparent",
    borderRadius: 0,
    overflow: "hidden",
    padding: 8, // Add padding to prevent the image from touching the edges
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    paddingTop: theme.spacing.sm,
    alignItems: "center",
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.md,
    fontFamily: "Gilroy-Bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  skeletonContainer: {
    width: "100%",
    alignItems: "center",
  },
});
