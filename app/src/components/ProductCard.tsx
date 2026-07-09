import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
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
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  onPress,
  showSkeleton = false,
  index = 0,
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
        tension: 50,
        delay: index * 30, // Faster stagger
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
        delay: index * 30, // Faster stagger
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
        <Animated.View style={[styles.cardInner, { opacity: opacityAnim }]}>
          <Image source={image} style={styles.image} resizeMode="contain" />

          {showSkeleton ? (
            <View style={styles.skeletonContainer}>
              <Skeleton width="100%" height={8} borderRadius={4} style={{ marginBottom: 6 }} color="rgba(200, 200, 200, 0.4)" />
              <Skeleton width="80%" height={8} borderRadius={4} style={{ marginBottom: 6 }} color="rgba(200, 200, 200, 0.4)" />
              <Skeleton width="90%" height={8} borderRadius={4} color="rgba(200, 200, 200, 0.4)" />
            </View>
          ) : (
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.gradientOverlay}
            >
              <Text style={styles.nameText} numberOfLines={2}>
                {name}
              </Text>
            </LinearGradient>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardInner: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#EAEAEA",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: theme.spacing.sm,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.md,
    fontFamily: "Unbounded_700Bold",
    letterSpacing: 0.5,
  },
  skeletonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 8,
    gap: 6,
  },
  skeletonLine: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
});
