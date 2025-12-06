import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showError, showSuccess } from "@/components/ui/toast";
import {
    selectCities,
    selectCitiesStatus,
    selectCreateKitchenStatus,
    selectTypes,
    selectTypesStatus,
} from "@/redux/kitchen/kitchen.selectors";
import {
    createKitchen,
    fetchKitchenCities,
    fetchKitchenTypes,
} from "@/redux/kitchen/kitchen.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type TimeType = "opening" | "closing";

export default function CreateKitchenScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const createStatus = useAppSelector(selectCreateKitchenStatus);
  const types = useAppSelector(selectTypes);
  const cities = useAppSelector(selectCities);
  const typesStatus = useAppSelector(selectTypesStatus);
  const citiesStatus = useAppSelector(selectCitiesStatus);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [openingTime, setOpeningTime] = useState<Date>(
    new Date("2024-01-01T08:00:00")
  );
  const [closingTime, setClosingTime] = useState<Date>(
    new Date("2024-01-01T22:00:00")
  );
  const [deliveryTime, setDeliveryTime] = useState("30");
  const [preparationTime, setPreparationTime] = useState("15");

  // UI state
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeType, setCurrentTimeType] = useState<TimeType | null>(null);

  // Fetch types and cities on mount
  useEffect(() => {
    if (typesStatus === "idle") {
      dispatch(fetchKitchenTypes());
    }
    if (citiesStatus === "idle") {
      dispatch(fetchKitchenCities());
    }
  }, [dispatch, typesStatus, citiesStatus]);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (selectedDate && currentTimeType) {
      if (currentTimeType === "opening") {
        setOpeningTime(selectedDate);
      } else {
        setClosingTime(selectedDate);
      }
    }
  };

  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatTimeForAPI = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const canSubmit =
    name.trim() &&
    address.trim() &&
    phoneNumber.trim() &&
    selectedType &&
    selectedCityId &&
    createStatus !== "loading";

  const handleCreateKitchen = async () => {
    if (!canSubmit) {
      return showError("Please fill all fields");
    }

    try {
      await dispatch(
        createKitchen({
          name: name.trim(),
          address: address.trim(),
          phone_number: phoneNumber.trim(),
          type: selectedType,
          opening_time: formatTimeForAPI(openingTime),
          closing_time: formatTimeForAPI(closingTime),
          delivery_time: deliveryTime,
          preparation_time: preparationTime,
        })
      ).unwrap();

      showSuccess("Kitchen created successfully!");
      router.replace("/users/kitchenDashboard");
    } catch (err: any) {
      console.log("Create kitchen UI error:", err);
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Failed to create kitchen";
      showError(message);
    }
  };

  const selectedTypeName =
    types.find((t) => t === selectedType) || selectedType;
  const selectedCityName =
    cities.find((c) => c.id === selectedCityId)?.name || selectedCityId;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#0F172A" />
        </Pressable>
        <Text className="font-satoshiBold text-[18px] text-neutral-900">
          Create Kitchen
        </Text>
        <View className="w-7" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <Text className="text-neutral-500 font-satoshi text-[12px] uppercase mb-4">
            Kitchen Information
          </Text>

          {/* Kitchen Name */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Kitchen Name
            </Text>
            <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center">
              <Ionicons name="storefront-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Mama's Kitchen"
                placeholderTextColor="#D1D5DB"
                className="flex-1 ml-3 font-satoshi text-neutral-900"
              />
            </View>
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Address
            </Text>
            <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-start">
              <Ionicons
                name="location-outline"
                size={18}
                color="#9CA3AF"
                style={{ marginTop: 8 }}
              />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="e.g. 123 Lekki Phase 1"
                placeholderTextColor="#D1D5DB"
                multiline
                numberOfLines={2}
                className="flex-1 ml-3 font-satoshi text-neutral-900"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Phone Number
            </Text>
            <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center">
              <Ionicons name="call-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="e.g. +234 123 456 7890"
                placeholderTextColor="#D1D5DB"
                keyboardType="phone-pad"
                className="flex-1 ml-3 font-satoshi text-neutral-900"
              />
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-neutral-100 my-4" />

          {/* Section Title */}
          <Text className="text-neutral-500 font-satoshi text-[12px] uppercase mb-4">
            Kitchen Details
          </Text>

          {/* Kitchen Type */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Kitchen Type
            </Text>
            <Pressable
              onPress={() => setShowTypeModal(true)}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="list-outline" size={18} color="#9CA3AF" />
                <Text
                  className={`ml-3 font-satoshi flex-1 ${
                    selectedType ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {selectedTypeName || "Select type"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* City */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              City
            </Text>
            <Pressable
              onPress={() => setShowCityModal(true)}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="map-outline" size={18} color="#9CA3AF" />
                <Text
                  className={`ml-3 font-satoshi flex-1 ${
                    selectedCityId ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {selectedCityName || "Select city"}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-neutral-100 my-4" />

          {/* Section Title */}
          <Text className="text-neutral-500 font-satoshi text-[12px] uppercase mb-4">
            Operating Hours
          </Text>

          {/* Opening Time */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Opening Time
            </Text>
            <Pressable
              onPress={() => {
                setCurrentTimeType("opening");
                setShowTimePicker(true);
              }}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={18} color="#FFA800" />
                <Text className="ml-3 font-satoshi text-neutral-900">
                  {formatTimeForDisplay(openingTime)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Closing Time */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Closing Time
            </Text>
            <Pressable
              onPress={() => {
                setCurrentTimeType("closing");
                setShowTimePicker(true);
              }}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={18} color="#FFA800" />
                <Text className="ml-3 font-satoshi text-neutral-900">
                  {formatTimeForDisplay(closingTime)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-neutral-100 my-4" />

          {/* Section Title */}
          <Text className="text-neutral-500 font-satoshi text-[12px] uppercase mb-4">
            Delivery Settings
          </Text>

          {/* Delivery Time */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Delivery Time (minutes)
            </Text>
            <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center">
              <Ionicons name="bicycle-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={deliveryTime}
                onChangeText={setDeliveryTime}
                placeholder="e.g. 30"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                className="flex-1 ml-3 font-satoshi text-neutral-900"
              />
            </View>
          </View>

          {/* Preparation Time */}
          <View className="mb-4">
            <Text className="text-neutral-700 font-satoshiMedium mb-2">
              Preparation Time (minutes)
            </Text>
            <View className="bg-white rounded-2xl border border-neutral-200 px-4 py-3 flex-row items-center">
              <Ionicons name="restaurant-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={preparationTime}
                onChangeText={setPreparationTime}
                placeholder="e.g. 15"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                className="flex-1 ml-3 font-satoshi text-neutral-900"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View className="absolute left-0 right-0 bottom-0 px-5 pb-6 pt-4 bg-[#FFFDF8] border-t border-neutral-100">
        <Pressable
          onPress={handleCreateKitchen}
          disabled={!canSubmit}
          className={`rounded-2xl py-4 items-center justify-center ${
            canSubmit ? "bg-primary" : "bg-neutral-300"
          }`}
        >
          {createStatus === "loading" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text className="ml-2 text-white font-satoshiBold">
                Create Kitchen
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Type Picker Modal */}
      <Modal
        visible={showTypeModal}
        onRequestClose={() => setShowTypeModal(false)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl pt-4 pb-6">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="font-satoshiBold text-[16px]">
                Select Kitchen Type
              </Text>
              <Pressable onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <FlatList
              data={types}
              keyExtractor={(item) => item}
              scrollEnabled={types.length > 8}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedType(item);
                    setShowTypeModal(false);
                  }}
                  className={`py-4 px-4 rounded-2xl mb-2 flex-row items-center justify-between border ${
                    selectedType === item
                      ? "bg-primary-50 border-primary"
                      : "bg-neutral-50 border-neutral-200"
                  }`}
                >
                  <Text
                    className={`font-satoshi ${
                      selectedType === item
                        ? "text-primary font-satoshiBold"
                        : "text-neutral-700"
                    }`}
                  >
                    {item}
                  </Text>
                  {selectedType === item && (
                    <Ionicons name="checkmark" size={20} color="#FFA800" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        visible={showCityModal}
        onRequestClose={() => setShowCityModal(false)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl pt-4 pb-6 max-h-[80%]">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="font-satoshiBold text-[16px]">Select City</Text>
              <Pressable onPress={() => setShowCityModal(false)}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <FlatList
              data={cities}
              keyExtractor={(item) => item.id}
              scrollEnabled
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCityId(item.id);
                    setShowCityModal(false);
                  }}
                  className={`py-4 px-4 rounded-2xl mb-2 flex-row items-center justify-between border ${
                    selectedCityId === item.id
                      ? "bg-primary-50 border-primary"
                      : "bg-neutral-50 border-neutral-200"
                  }`}
                >
                  <View>
                    <Text
                      className={`font-satoshi ${
                        selectedCityId === item.id
                          ? "text-primary font-satoshiBold"
                          : "text-neutral-700"
                      }`}
                    >
                      {item.name}
                    </Text>
                    <Text className="text-[12px] text-neutral-500">
                      {item.state}
                    </Text>
                  </View>
                  {selectedCityId === item.id && (
                    <Ionicons name="checkmark" size={20} color="#FFA800" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={currentTimeType === "opening" ? openingTime : closingTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
          themeVariant="light"
        />
      )}

      {Platform.OS === "ios" && showTimePicker && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
          <View className="flex-row items-center justify-between px-5 py-3">
            <Pressable onPress={() => setShowTimePicker(false)}>
              <Text className="text-neutral-600 font-satoshiMedium">Cancel</Text>
            </Pressable>
            <Pressable onPress={() => setShowTimePicker(false)}>
              <Text className="text-primary font-satoshiBold">Done</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
