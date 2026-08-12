import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
  Dimensions,
  Animated,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
// Map import removed to avoid API key crash
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export interface Store {
  "Store Name": string;
  Pincode: string;
  Address: string;
  "Name Of Owner": string;
  Contact: string;
  "Google maps": string;
  lat: number;
  lon: number;
}
import { haversineDistanceKm } from '../utils/dealerLocator';
import { Skeleton } from '../components';
import { theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
const MAP_EXPANDED = SCREEN_HEIGHT * 0.80;
const MAP_COLLAPSED = SCREEN_HEIGHT * 0.35;

// ─── Silver/Warm-Grey Map Theme (#F4F1EE) ───────────────────────────
const SILVER_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F4F1EE' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B6B6B' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#F4F1EE' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D4D0CC' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A8A8A8' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#EBE8E4' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#E2DFDB' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8A8A8A' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#DDD9D4' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9E9E9E' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8A8A8A' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#E0DCD8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7A7A7A' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9E9E9E' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#DDD9D4' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#E2DFDB' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#D4D0CC' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9E9E9E' }],
  },
];

interface StoreWithDistance extends Store {
  distanceKm: number;
}

// ─── Skeleton Card Component ────────────────────────────────────────
const SkeletonCard = ({ index }: { index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton width={50} height={20} borderRadius={4} />
      </View>
      <Skeleton width="70%" height={20} borderRadius={4} style={{ marginBottom: 10 }} />
      <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
      <Skeleton width="30%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />
      <View style={styles.buttonRow}>
        <Skeleton width="47%" height={40} borderRadius={8} />
        <Skeleton width="47%" height={40} borderRadius={8} />
      </View>
    </Animated.View>
  );
};

// ─── Dealer Card Component ──────────────────────────────────────────
const DealerCard = ({
  item,
  index,
  onPress,
  isExpanded,
}: {
  item: StoreWithDistance;
  index: number;
  onPress: () => void;
  isExpanded: boolean;
}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 60,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: index * 60,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const buttonRowHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 48],
  });
  const buttonRowOpacity = expandAnim;

  const distanceText =
    item.distanceKm < 1
      ? `${(item.distanceKm * 1000).toFixed(0)} m`
      : item.distanceKm < 100
      ? `${item.distanceKm.toFixed(1)} km`
      : `${item.distanceKm.toFixed(0)} km`;

  const currentHour = new Date().getHours();
  const isOpen = currentHour >= 9 && currentHour < 20;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
            borderColor: isExpanded ? theme.colors.primary + '40' : 'transparent',
            borderWidth: 1,
          },
        ]}
      >
        {/* Compact top row: name + distance + status */}
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName} numberOfLines={1}>{item['Store Name']}</Text>
            <View style={styles.compactInfoRow}>
              <Ionicons name="location-outline" size={12} color="#999" />
              <Text style={styles.storeAddress} numberOfLines={1}>
                {item.Address}, {item.Pincode}
              </Text>
            </View>
          </View>
          <View style={styles.cardRightCol}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOpen ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)' },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: isOpen ? '#4CAF50' : '#F44336' }]} />
              <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
            <Text style={styles.distanceText}>{distanceText}</Text>
          </View>
        </View>

        {/* Expandable button row */}
        <Animated.View style={{ height: buttonRowHeight, opacity: buttonRowOpacity, overflow: 'hidden' }}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.callButton}
              activeOpacity={0.7}
              onPress={(e) => { e.stopPropagation(); Linking.openURL(`tel:${item.Contact}`); }}
            >
              <Ionicons name="call-outline" size={14} color="#333" />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapButton}
              activeOpacity={0.7}
              onPress={(e) => { e.stopPropagation(); Linking.openURL(item['Google maps']); }}
            >
              <Ionicons name="navigate-outline" size={14} color="#FFF" />
              <Text style={styles.mapText}>View on Maps</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────
export const StoreLocatorScreen = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<any>(null);
  const searchInputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  // ── State ──
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState<StoreWithDistance[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCards, setShowCards] = useState(true);
  const [showAllDealers, setShowAllDealers] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  // ── Derived: nearby (≤15 km) vs all ──
  const NEARBY_RADIUS_KM = 15;
  const isSearching = searchQuery.trim().length > 0;
  const nearbyStores = filteredStores.filter((s) => s.distanceKm <= NEARBY_RADIUS_KM);
  const displayedStores = (showAllDealers || isSearching) ? filteredStores : nearbyStores;
  const hasMoreDealers = !showAllDealers && !isSearching && filteredStores.length > nearbyStores.length;

  // ── Animations ──
  const mapHeight = useRef(new Animated.Value(MAP_EXPANDED)).current;
  const searchBarTranslate = useRef(new Animated.Value(0)).current;

  // ── Debounce timer ref ──
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Request location on focus ──
  useEffect(() => {
    // Run on initial mount
    requestLocation();

    // Run on every subsequent focus
    const unsubscribe = navigation.addListener('focus', () => {
      requestLocation();
    });

    return unsubscribe;
  }, [navigation]);

  const requestLocation = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const response = await Location.requestForegroundPermissionsAsync();
        status = response.status;
      }

      if (status !== 'granted') {
        setHasLocationPermission(false);
        setIsLoading(false);
        return;
      }

      setHasLocationPermission(true);

      // Always get a fresh GPS fix — high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserCoords(coords);

      // Only fetch store list from DB if not already loaded
      let stores = allStores;
      if (stores.length === 0) {
        const { data: dealers } = await supabase.from('dealers').select('*').eq('is_active', true);
        stores = (dealers || []).map((d: any) => ({
          "Store Name": d.store_name,
          Pincode: d.pincode || '',
          Address: d.address || '',
          "Name Of Owner": d.owner_name || '',
          Contact: d.contact || '',
          "Google maps": d.google_maps_url || '',
          lat: d.lat || 0,
          lon: d.lon || 0,
        }));
        setAllStores(stores);
      }

      // Always recompute distances from the fresh GPS fix
      const sorted = computeDistances(coords.latitude, coords.longitude, stores);
      setFilteredStores(sorted);
      setIsLoading(false);

      // Zoom map to tightly fit user and nearby stores
      if (mapRef.current) {
        const nearby = sorted.filter((s) => s.distanceKm <= NEARBY_RADIUS_KM);
        if (nearby.length > 0) {
          mapRef.current.fitToCoordinates(
            [
              ...nearby.map((s) => ({ latitude: s.lat, longitude: s.lon })),
              { latitude: coords.latitude, longitude: coords.longitude },
            ],
            {
              edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
              animated: true,
            }
          );
        } else {
          mapRef.current.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            },
            800
          );
        }
      }
    } catch (err) {
      setHasLocationPermission(false);
      setIsLoading(false);
    }
  };

  const computeDistances = (lat: number, lon: number, stores = allStores): StoreWithDistance[] => {
    return stores.map((s) => ({
      ...s,
      distanceKm: haversineDistanceKm(lat, lon, s.lat, s.lon),
    })).sort((a, b) => a.distanceKm - b.distanceKm);
  };

  // ── Map collapse / expand animation ──
  const animateMap = (collapsed: boolean) => {
    Animated.parallel([
      Animated.timing(mapHeight, {
        toValue: collapsed ? MAP_COLLAPSED : MAP_EXPANDED,
        duration: 350,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // ── Search focus handlers ──
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    animateMap(true);
    setShowCards(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchFocused(false);
      animateMap(false);
      setShowCards(false);
    }
  };

  // ── Search with debounce ──
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!text.trim()) {
        // Reset to full sorted list
        const lat = userCoords?.latitude || 12.9716;
        const lon = userCoords?.longitude || 77.5946;
        setFilteredStores(computeDistances(lat, lon, allStores));
        setIsLoading(false);
        return;
      }

      // Show skeleton while debouncing
      setIsLoading(true);
      setShowCards(true);

      debounceRef.current = setTimeout(() => {
        const lat = userCoords?.latitude || 12.9716;
        const lon = userCoords?.longitude || 77.5946;
        const query = text.trim().toLowerCase();
        let filtered = computeDistances(lat, lon, allStores).filter(
          (s) => {
            const pincode = String(s.Pincode || '').toLowerCase();
            const address = String(s.Address || '').toLowerCase();
            const storeName = String(s['Store Name'] || '').toLowerCase();
            const owner = String(s['Name Of Owner'] || '').toLowerCase();
            const contact = String(s.Contact || '').toLowerCase();

            // City name synonyms
            const citySynonyms: [string, string][] = [
              ['bangalore', 'bengaluru'],
              ['mumbai', 'bombay'],
              ['chennai', 'madras'],
              ['kolkata', 'calcutta'],
              ['gurugram', 'gurgaon'],
              ['vadodara', 'baroda'],
              ['kochi', 'cochin'],
              ['trivandrum', 'thiruvananthapuram'],
              ['mysore', 'mysuru'],
              ['pondicherry', 'puducherry'],
              ['banaras', 'varanasi'],
              ['calicut', 'kozhikode'],
              ['trichy', 'tiruchirappalli'],
              ['vizag', 'visakhapatnam'],
            ];

            let isAliasMatch = false;
            for (const [a, b] of citySynonyms) {
              if (query.includes(a) && (address.includes(b) || storeName.includes(b))) isAliasMatch = true;
              if (query.includes(b) && (address.includes(a) || storeName.includes(a))) isAliasMatch = true;
              if (a.includes(query) && (address.includes(b) || storeName.includes(b))) isAliasMatch = true;
              if (b.includes(query) && (address.includes(a) || storeName.includes(a))) isAliasMatch = true;
            }

            return (
              pincode.includes(query) ||
              address.includes(query) ||
              storeName.includes(query) ||
              owner.includes(query) ||
              contact.includes(query) ||
              isAliasMatch
            );
          }
        );

        // ── Smart Pincode & Nearby Fallback ──
        // When searching a pincode or location with 0 exact string matches (e.g. 560078),
        // match by pincode region prefix (e.g. 560 for Bangalore urban), or fall back to closest nearby dealers!
        if (filtered.length === 0 && query.length > 0) {
          const allWithDist = computeDistances(lat, lon, allStores);

          if (/^\d{2,}/.test(query)) {
            const prefix3 = query.slice(0, 3);
            let prefixMatches = allWithDist.filter((s) => String(s.Pincode || '').startsWith(prefix3));
            if (prefixMatches.length === 0 && query.length >= 2) {
              const prefix2 = query.slice(0, 2);
              prefixMatches = allWithDist.filter((s) => String(s.Pincode || '').startsWith(prefix2));
            }
            if (prefixMatches.length > 0) {
              filtered = prefixMatches;
            }
          }

          // If still no matches, show closest dealers within 100 km (or top 3 closest overall)
          if (filtered.length === 0) {
            const within100 = allWithDist.filter((s) => s.distanceKm <= 100);
            filtered = within100.length > 0 ? within100 : allWithDist.slice(0, 3);
          }
        }

        setFilteredStores(filtered);
        setIsLoading(false);

        // Fit map tightly to filtered results
        if (filtered.length > 0 && mapRef.current) {
          const nearby = filtered.filter((s) => s.distanceKm <= NEARBY_RADIUS_KM);
          const toFit = (nearby.length > 0 && !text.trim()) ? nearby : filtered;
          mapRef.current.fitToCoordinates(
            toFit.map((f) => ({ latitude: f.lat, longitude: f.lon })),
            {
              edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
              animated: true,
            }
          );
        }
      }, 300);
    },
    [userCoords, allStores]
  );

  // ── Find Near Me button ──
  const handleFindNearMe = async () => {
    setShowCards(true);
    animateMap(true);
    setIsLoading(true);

    try {
      // Always get a fresh high-accuracy GPS fix
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserCoords(coords);
      setSearchQuery('');

      // Recompute distances from exact current position
      const sorted = computeDistances(coords.latitude, coords.longitude, allStores);
      setFilteredStores(sorted);
      setIsLoading(false);

      // Fit map to user + nearby stores
      if (mapRef.current) {
        const nearby = sorted.filter((s) => s.distanceKm <= NEARBY_RADIUS_KM);
        if (nearby.length > 0) {
          mapRef.current.fitToCoordinates(
            [
              ...nearby.map((s) => ({ latitude: s.lat, longitude: s.lon })),
              { latitude: coords.latitude, longitude: coords.longitude },
            ],
            {
              edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
              animated: true,
            }
          );
        } else {
          mapRef.current.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            },
            800
          );
        }
      }
    } catch {
      setIsLoading(false);
    }
  };

  // ── Render helpers ──
  const handleMarkerPress = (store: StoreWithDistance) => {
    // 1. Shrink map so list is visible
    animateMap(false);

    // 2. Expand list if necessary
    const isNearby = store.distanceKm <= NEARBY_RADIUS_KM;
    let targetList = displayedStores;
    if (!isNearby && !showAllDealers && !isSearching) {
      setShowAllDealers(true);
      targetList = filteredStores;
    }

    // 3. Find index and scroll
    const index = targetList.findIndex((s) => s.lat === store.lat && s.lon === store.lon);
    if (index !== -1) {
      setExpandedCardIndex(index);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }, 300);
    }
  };
  const handleCardPress = (store: StoreWithDistance, index: number) => {
    // Toggle expand/collapse
    setExpandedCardIndex((prev) => (prev === index ? null : index));
    // Animate map to location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: store.lat,
          longitude: store.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        800
      );
    }
  };

  const renderDealerCard = ({ item, index }: { item: StoreWithDistance; index: number }) => (
    <DealerCard
      item={item}
      index={index}
      isExpanded={expandedCardIndex === index}
      onPress={() => handleCardPress(item, index)}
    />
  );

  const renderSkeletons = () => (
    <View style={styles.listContent}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color="#999" />
      <Text style={styles.emptyTitle}>{isSearching ? 'No dealers found' : 'No dealers nearby'}</Text>
      <Text style={styles.emptySubtitle}>
        {isSearching ? `No dealers matching "${searchQuery}"` : `No dealers found within ${NEARBY_RADIUS_KM} km`}
      </Text>
      {!isSearching && filteredStores.length > 0 && (
        <TouchableOpacity
          style={styles.viewAllButtonInline}
          activeOpacity={0.7}
          onPress={() => setShowAllDealers(true)}
        >
          <Text style={styles.viewAllButtonInlineText}>View All {filteredStores.length} Dealers</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderViewAllFooter = () => {
    if (!hasMoreDealers) return null;
    const remainingCount = filteredStores.length - nearbyStores.length;
    return (
      <TouchableOpacity
        style={styles.viewAllCard}
        activeOpacity={0.8}
        onPress={() => setShowAllDealers(true)}
      >
        <View style={styles.viewAllIconContainer}>
          <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.viewAllTextContainer}>
          <Text style={styles.viewAllTitle}>View All Dealers</Text>
          <Text style={styles.viewAllSubtitle}>
            +{remainingCount} more dealer{remainingCount !== 1 ? 's' : ''} across all locations
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#CCC" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: STATUS_BAR_HEIGHT + 10 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {hasLocationPermission === false ? (
        <View style={styles.permissionContainer}>
          <Ionicons name="location" size={80} color="#E0DCD8" />
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionSubtitle}>
            We need your location to find the nearest dealers and stores for you.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Enable Location in Settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ── Search Section (pinned) ── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={isSearchFocused ? theme.colors.primary : '#999'}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Enter Pincode or City"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                if (userCoords) {
                  setFilteredStores(
                    computeDistances(userCoords.latitude, userCoords.longitude)
                  );
                }
                setIsLoading(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.nearMeButton}
          activeOpacity={0.8}
          onPress={handleFindNearMe}
        >
          <Ionicons name="navigate" size={18} color="#FFF" />
          <Text style={styles.nearMeText}>FIND NEAR ME</Text>
        </TouchableOpacity>
      </View>

      {/* ── Results Area ── */}
      {showCards && (
        <Animated.View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {isSearching ? 'Search Results' : showAllDealers ? 'All Dealers' : 'Nearby Dealers'}
            </Text>
            {!isLoading && (
              <Text style={styles.resultsCount}>
                Found {displayedStores.length} dealers
              </Text>
            )}
          </View>

          {isLoading ? (
            renderSkeletons()
          ) : displayedStores.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={displayedStores}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              renderItem={renderDealerCard}
              ListFooterComponent={renderViewAllFooter}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              maxToRenderPerBatch={8}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise((resolve) => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />
          )}
        </Animated.View>
      )}
        </>
      )}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  // Map
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'transparent',
  },

  // Search
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#F2F2F2',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    
  },
  nearMeButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
  },
  nearMeText: {
    color: '#FFF',
    fontSize: 12,
    
    letterSpacing: 1,
  },

  // Results
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsTitle: {
    fontSize: 14,
    color: '#222',
    
  },
  resultsCount: {
    fontSize: 11,
    color: '#888',
    
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Card (compact)
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  cardRightCol: {
    alignItems: 'flex-end',
    marginLeft: 10,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  storeType: {
    fontSize: 11,
    color: '#AAA',
    
    letterSpacing: 0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    
    letterSpacing: 0.4,
  },
  storeName: {
    fontSize: 14,
    color: '#1A1A1A',
    
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  distanceText: {
    fontSize: 12,
    color: theme.colors.primary,
    
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    height: 38,
    borderRadius: 9,
    gap: 5,
  },
  callText: {
    fontSize: 13,
    color: '#333',
    
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    height: 38,
    borderRadius: 9,
    gap: 5,
  },
  mapText: {
    fontSize: 13,
    color: '#FFF',
    
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    
    color: '#555',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
  },
  viewAllButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  viewAllButtonInlineText: {
    fontSize: 14,
    
    color: theme.colors.primary,
  },

  // View All Dealers footer card
  viewAllCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "transparent" + '30',
    borderStyle: 'dashed',
  },
  viewAllIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  viewAllTextContainer: {
    flex: 1,
  },
  viewAllTitle: {
    fontSize: 15,
    
    color: '#333',
    marginBottom: 2,
  },
  viewAllSubtitle: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Gilroy-Regular',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -50,
  },
  permissionTitle: {
    fontSize: 22,
    fontFamily: 'Gilroy-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 15,
    fontFamily: 'Gilroy-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
  },
});
