import {
    selectCities,
    selectCitiesStatus,
} from "@/redux/kitchen/kitchen.selectors";
import { fetchKitchenCities } from "@/redux/kitchen/kitchen.thunks";
import type { KitchenCity } from "@/redux/kitchen/kitchen.types";
import { saveSelectedCity } from "@/storage/city";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCitySelect: (city: KitchenCity) => void;
  selectedCity: KitchenCity | null;
}

export default function LocationPickerModal({
  visible,
  onClose,
  onCitySelect,
  selectedCity,
}: LocationPickerModalProps) {
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const citiesStatus = useAppSelector(selectCitiesStatus);
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      if (citiesStatus === "idle") {
        dispatch(fetchKitchenCities());
      }
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      setSearchQuery("");
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities;
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery]);

  const handleCitySelect = async (city: KitchenCity) => {
    await saveSelectedCity(city);
    onCitySelect(city);
    onClose();
  };

  const screenHeight = Dimensions.get("window").height;
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <Animated.View
        className="flex-1 bg-black/40"
        style={{ opacity: fadeAnim }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateY }],
        }}
        className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-lg ${
          isDark ? "bg-neutral-900 border-t border-neutral-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <View
          className={`pt-6 px-6 pb-4 border-b ${
            isDark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className={`text-2xl font-satoshiBold ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Select Your City
            </Text>
            <Pressable
              onPress={onClose}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              }`}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={isDark ? "#E5E7EB" : "#1F2937"}
              />
            </Pressable>
          </View>

          {/* Search Input */}
          <View
            className={`flex-row items-center rounded-xl px-4 py-3 border-2 ${
              isDark
                ? "bg-neutral-800 border-neutral-700"
                : "bg-neutral-100 border-neutral-100"
            }`}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={isDark ? "#9CA3AF" : "#D1D5DB"}
            />
            <TextInput
              placeholder="Search cities or states..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`flex-1 ml-3 font-satoshi ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={isDark ? "#9CA3AF" : "#D1D5DB"}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Cities List */}
        <ScrollView
          className="max-h-96"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12 }}
        >
          {citiesStatus === "loading" ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#ffa800" />
              <Text
                className={`font-satoshiMedium mt-3 ${
                  isDark ? "text-neutral-300" : "text-neutral-500"
                }`}
              >
                Loading cities...
              </Text>
            </View>
          ) : filteredCities.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <MaterialCommunityIcons
                name="map-search-outline"
                size={48}
                color={isDark ? "#6B7280" : "#D1D5DB"}
              />
              <Text
                className={`font-satoshiMedium mt-3 ${
                  isDark ? "text-neutral-300" : "text-neutral-500"
                }`}
              >
                No cities found
              </Text>
              <Text
                className={`font-satoshi text-sm mt-1 ${
                  isDark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                Try different keywords
              </Text>
            </View>
          ) : (
            filteredCities.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => handleCitySelect(city)}
                className={`flex-row items-center justify-between py-4 px-4 mb-2 rounded-2xl border-2 ${
                  isDark
                    ? "border-neutral-800 bg-neutral-900"
                    : "border-neutral-100 bg-white"
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color={
                        selectedCity?.id === city.id
                          ? "#ffa800"
                          : isDark
                            ? "#9CA3AF"
                            : "#9CA3AF"
                      }
                    />
                    <Text
                      className={`ml-3 text-lg font-satoshiMedium ${
                        selectedCity?.id === city.id
                          ? "text-primary"
                          : isDark
                            ? "text-neutral-100"
                            : "text-neutral-900"
                      }`}
                    >
                      {city.name}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-satoshi ml-7 mt-1 ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {city.state}
                  </Text>
                </View>

                {selectedCity?.id === city.id && (
                  <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color="white"
                    />
                  </View>
                )}
              </Pressable>
            ))
          )}
        </ScrollView>

        {/* Footer Info */}
        {filteredCities.length > 0 && citiesStatus !== "loading" && (
          <View
            className={`px-6 py-4 border-t flex-row items-center ${
              isDark ? "border-neutral-800 bg-neutral-900" : "bg-primary-50 border-neutral-200"
            }`}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={isDark ? "#FBBF24" : "#ffa800"}
            />
            <Text
              className={`ml-2 text-sm font-satoshi ${
                isDark ? "text-neutral-200" : "text-neutral-700"
              }`}
            >
              {selectedCity
                ? `Currently in ${selectedCity.name}`
                : "Select a city to see available restaurants"}
            </Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}
