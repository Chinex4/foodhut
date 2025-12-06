import {
    selectCities,
    selectCitiesStatus,
} from "@/redux/kitchen/kitchen.selectors";
import { fetchKitchenCities } from "@/redux/kitchen/kitchen.thunks";
import type { KitchenCity } from "@/redux/kitchen/kitchen.types";
import { saveSelectedCity } from "@/storage/city";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
      >
        {/* Header */}
        <View className="pt-6 px-6 pb-4 border-b border-neutral-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-satoshiBold text-neutral-900">
              Select Your City
            </Text>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color="#1F2937"
              />
            </Pressable>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3 border-2 border-neutral-100 active:border-primary">
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#D1D5DB"
            />
            <TextInput
              placeholder="Search cities or states..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 font-satoshi text-neutral-900"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#D1D5DB"
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
              <Text className="text-neutral-500 font-satoshiMedium mt-3">
                Loading cities...
              </Text>
            </View>
          ) : filteredCities.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <MaterialCommunityIcons
                name="map-search-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text className="text-neutral-500 font-satoshiMedium mt-3">
                No cities found
              </Text>
              <Text className="text-neutral-400 font-satoshi text-sm mt-1">
                Try different keywords
              </Text>
            </View>
          ) : (
            filteredCities.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => handleCitySelect(city)}
                className="flex-row items-center justify-between py-4 px-4 mb-2 rounded-2xl border-2 border-neutral-100 active:bg-primary-50"
              >
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color={
                        selectedCity?.id === city.id ? "#ffa800" : "#9CA3AF"
                      }
                    />
                    <Text
                      className={`ml-3 text-lg font-satoshiMedium ${
                        selectedCity?.id === city.id
                          ? "text-primary"
                          : "text-neutral-900"
                      }`}
                    >
                      {city.name}
                    </Text>
                  </View>
                  <Text className="text-sm text-neutral-500 font-satoshi ml-7 mt-1">
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
          <View className="px-6 py-4 border-t border-neutral-200 bg-primary-50 flex-row items-center">
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#ffa800"
            />
            <Text className="ml-2 text-sm text-neutral-700 font-satoshi">
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
