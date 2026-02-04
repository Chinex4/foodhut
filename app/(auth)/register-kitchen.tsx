import CountryCodePickerModal from "@/components/auth/CountryCodePickerModal";
import FoodhutButtonComponent from "@/components/ui/FoodhutButton";
import {
    createKitchen,
    fetchKitchenCities,
    fetchKitchenTypes,
} from "@/redux/kitchen/kitchen.thunks";
import { useAppDispatch } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type FormValues = {
  name: string;
  type: string;
  address: string;
  cityId?: string; // if your API needs mapping city name->id, adjust
  phone_local: string;
  opening_time: string; // "09:00"
  closing_time: string; // "18:00"
  delivery_time: string; // "30-45 mins" or "45"
  preparation_time: string; // "15-30 mins" or "30"
};

const digitsOnly = (s: string) => s.replace(/\D+/g, "");
function sanitizeLocal(dial: string, raw: string) {
  const d = digitsOnly(dial);
  let v = digitsOnly(raw);
  if (v.startsWith(d)) v = v.slice(d.length);
  if (v.startsWith("0")) v = v.slice(1);
  return v.slice(0, 15);
}
const flagFromCode = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export default function KitchenRegisterScreen() {
  const dispatch = useAppDispatch();
  const [types, setTypes] = useState<string[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [country, setCountry] = useState({
    flag: "🇳🇬",
    code: "NG",
    dial: "+234",
  });

  const { control, handleSubmit, setValue, getValues, watch } =
    useForm<FormValues>({
      defaultValues: {
        name: "",
        type: "",
        address: "",
        cityId: undefined,
        phone_local: "",
        opening_time: "",
        closing_time: "",
        delivery_time: "",
        preparation_time: "",
      },
    });

  useEffect(() => {
    (async () => {
      const t = await dispatch(fetchKitchenTypes())
        .unwrap()
        .catch(() => []);
      const c = await dispatch(fetchKitchenCities())
        .unwrap()
        .catch(() => []);
      setTypes(Array.isArray(t) ? t : []);
      setCities(
        Array.isArray(c)
          ? c.map((x: any) => ({ id: String(x.id), name: x.name }))
          : []
      );
    })();
  }, [dispatch]);

  const fullPhone = useMemo(
    () => (v: string) => `${country.dial}${v}`,
    [country.dial]
  );

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      name: v.name.trim(),
      address: `${v.address.trim()}${v.cityId ? `, ${cities.find((c) => c.id === v.cityId)?.name ?? ""}` : ""}`,
      phone_number: fullPhone(sanitizeLocal(country.dial, v.phone_local)),
      type: v.type,
      opening_time: v.opening_time,
      closing_time: v.closing_time,
      delivery_time: v.delivery_time,
      preparation_time: v.preparation_time,
      city_id: v.cityId,
    };
    await dispatch(createKitchen(body)).unwrap();
    // go to tabs (or a success screen)
    // router.replace("/users/(tabs)");
  });

  const isDark = useAppSelector(selectThemeMode) === "dark";
  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      >
        <Text className="text-3xl font-satoshiBold text-black mt-2">
          Create your kitchen
        </Text>
        <Text className="text-base text-gray-600 font-satoshi mt-1">
          Please enter your details to create a kitchen with FOODHUT
        </Text>

        {/* Name */}
        <View className="mt-6">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            Kitchen Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                placeholder="Enter Kitchen Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
              />
            )}
          />
        </View>

        {/* Type */}
        <View className="mt-4">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            Type of Kitchen
          </Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Pressable
                onPress={() => {
                  /* you can show ActionSheet / modal */
                }}
                className="bg-gray-100 rounded-xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text
                  className={`text-base font-satoshi ${value ? "text-black" : "text-gray-400"}`}
                >
                  {value || "Select Type of Kitchen"}
                </Text>
                <Ionicons name="chevron-down" size={18} />
              </Pressable>
            )}
          />
          {/* quick inline chooser for now */}
          {types.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {types.slice(0, 6).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setValue("type", t)}
                  className={`px-3 py-2 rounded-xl border ${watch("type") === t ? "bg-primary border-primary" : "border-gray-200 bg-white"}`}
                >
                  <Text
                    className={`${watch("type") === t ? "text-white" : "text-black"} font-satoshi`}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Address */}
        <View className="mt-4">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            Address
          </Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                placeholder="Enter Address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
              />
            )}
          />
        </View>

        {/* City */}
        <View className="mt-4">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            City
          </Text>
          <Controller
            control={control}
            name="cityId"
            render={({ field: { value, onChange } }) => (
              <Pressable className="bg-gray-100 rounded-xl px-4 py-3 flex-row justify-between items-center">
                <Text
                  className={`text-base font-satoshi ${value ? "text-black" : "text-gray-400"}`}
                >
                  {value
                    ? (cities.find((c) => c.id === value)?.name ?? "")
                    : "Select City"}
                </Text>
                <Ionicons name="chevron-down" size={18} />
              </Pressable>
            )}
          />
          {cities.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {cities.slice(0, 8).map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setValue("cityId", c.id)}
                  className={`px-3 py-2 rounded-xl border ${watch("cityId") === c.id ? "bg-primary border-primary" : "border-gray-200 bg-white"}`}
                >
                  <Text
                    className={`${watch("cityId") === c.id ? "text-white" : "text-black"} font-satoshi`}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Phone */}
        <View className="mt-4">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            Phone Number
          </Text>
          <View className="bg-gray-100 rounded-xl px-3 py-1 flex-row items-center">
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="flex-row items-center px-2 py-2 mr-2 rounded-lg"
            >
              <Text className="text-lg mr-2">{country.flag}</Text>
              <Text className="text-base font-satoshiMedium">
                {country.dial}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
            <Controller
              control={control}
              name="phone_local"
              render={({ field: { value, onBlur } }) => (
                <TextInput
                  placeholder="Enter Phone Number"
                  keyboardType={
                    Platform.OS === "ios" ? "number-pad" : "numeric"
                  }
                  value={value}
                  onChangeText={(t) =>
                    setValue("phone_local", sanitizeLocal(country.dial, t), {
                      shouldValidate: true,
                    })
                  }
                  onBlur={onBlur}
                  className="flex-1 text-base font-satoshi py-2"
                />
              )}
            />
          </View>
        </View>

        {/* Times */}
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm text-black font-satoshiMedium">
              Opening Time
            </Text>
            <Controller
              control={control}
              name="opening_time"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  placeholder="09:00"
                  value={value}
                  onChangeText={onChange}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Text className="mb-2 text-sm text-black font-satoshiMedium">
              Closing Time
            </Text>
            <Controller
              control={control}
              name="closing_time"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  placeholder="18:00"
                  value={value}
                  onChangeText={onChange}
                  className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
                />
              )}
            />
          </View>
        </View>

        {/* Prep / Delivery */}
        <View className="mt-4">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            Preparation Time
          </Text>
          <Controller
            control={control}
            name="preparation_time"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="e.g. 20-30 mins"
                value={value}
                onChangeText={onChange}
                className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
              />
            )}
          />
        </View>
        <View className="mt-4">
          <Text className="mb-2 text-sm text-black font-satoshiMedium">
            Delivery Time
          </Text>
          <Controller
            control={control}
            name="delivery_time"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="e.g. 30-45 mins"
                value={value}
                onChangeText={onChange}
                className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
              />
            )}
          />
        </View>

        <Text className="text-center mt-6 text-gray-700 font-satoshi">
          By proceeding, you agree to our{" "}
          <Text className="text-primary">Terms Of Use</Text> and{" "}
          <Text className="text-primary">Privacy Policy</Text>
        </Text>

        <View className="mt-4" />
        <FoodhutButtonComponent title="Create Kitchen" onPress={onSubmit} />
      </KeyboardAwareScrollView>

      <CountryCodePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(c) => {
          setCountry({
            flag: flagFromCode(c.code),
            code: c.code,
            dial: c.dial_code,
          });
          const current = getValues("phone_local");
          setValue("phone_local", sanitizeLocal(c.dial_code, current), {
            shouldValidate: true,
          });
        }}
      />
    </SafeAreaView>
  );
}
