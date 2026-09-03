import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '100%',
  borderRadius = 4,
  color = '#E1E9EE', // Base neutral color
  style,
}) => {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1500, // 1.5s duration as per skill instructions
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    
    return () => shimmerAnimation.stop();
  }, [translateX]);

  // Interpolating the percentage width
  const translateXInterpolated = translateX.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-100%', '100%'],
  });

  return (
    <View
      accessible={true}
      accessibilityState={{ busy: true }}
      accessibilityElementsHidden={true} // Ignore for screen readers
      style={[
        {
          width,
          height,
          backgroundColor: color,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: '100%',
            height: '100%',
            transform: [{ translateX: translateXInterpolated as any }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};
