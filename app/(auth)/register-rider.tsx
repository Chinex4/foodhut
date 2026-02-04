import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "expo-router";
import CountryCodePickerModal from "@/components/auth/CountryCodePickerModal";
import FoodhutButtonComponent from "@/components/ui/FoodhutButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRider } from "@/redux/rider/rider.thunk";
import {
  selectRiderError,
  selectRiderStatus,
} from "@/redux/rider/rider.selectors";

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

type FormValues = {
  full_name: string;
  email: string;
  phone_local: string;
};
const schema: yup.ObjectSchema<FormValues> = yup.object({
  full_name: yup.string().trim().required("Full name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  phone_local: yup
    .string()
    .matches(/^\d{7,15}$/, "Enter a valid phone")
    .required(),
});

export default function RiderRegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectRiderStatus);
  const error = useAppSelector(selectRiderError);
  const loading = status === "loading";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [country, setCountry] = useState({
    flag: "🇳🇬",
    code: "NG",
    dial: "+234",
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { full_name: "", email: "", phone_local: "" },
  });

  const onLocalChange = (t: string) =>
    setValue("phone_local", sanitizeLocal(country.dial, t), {
      shouldValidate: true,
    });

  const fullPhone = useMemo(
    () => (v: string) => `${country.dial}${v}`,
    [country.dial]
  );

  const onSubmit = handleSubmit(async (v) => {
    const local = sanitizeLocal(country.dial, v.phone_local);
    const res = await dispatch(
      createRider({
        full_name: v.full_name.trim(),
        email: v.email.trim(),
        phone_number: fullPhone(local),
      })
    );
    if (createRider.fulfilled.match(res)) {
      router.replace("/riders/(tabs)");
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      >
        <Text className="text-3xl font-satoshiBold text-black mt-2">
          Rider Sign Up
        </Text>
        <Text className="text-base text-gray-600 font-satoshi mt-1">
          Basic details to start delivering.
        </Text>

        <Text className="mt-6 mb-2 text-sm text-black font-satoshiMedium">
          Full Name
        </Text>
        <Controller
          control={control}
          name="full_name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter full name"
              className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
            />
          )}
        />
        {!!errors.full_name && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.full_name.message}
          </Text>
        )}

        <Text className="mt-4 mb-2 text-sm text-black font-satoshiMedium">
          Email
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter email"
              className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
            />
          )}
        />
        {!!errors.email && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </Text>
        )}

        <Text className="mt-4 mb-2 text-sm text-black font-satoshiMedium">
          Phone Number
        </Text>
        <View className="bg-gray-100 rounded-xl px-3 py-1 flex-row items-center">
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center px-2 py-2 mr-2 rounded-lg"
          >
            <Text className="text-lg mr-2">{country.flag}</Text>
            <Text className="text-base font-satoshiMedium">{country.dial}</Text>
            <Ionicons name="chevron-down" size={16} style={{ marginLeft: 4 }} />
          </Pressable>
          <Controller
            control={control}
            name="phone_local"
            render={({ field: { value, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onLocalChange}
                onBlur={onBlur}
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                placeholder="e.g. 7049938128"
                className="flex-1 text-base font-satoshi py-2"
              />
            )}
          />
        </View>
        {!!errors.phone_local && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.phone_local.message}
          </Text>
        )}

        {!!error && <Text className="text-red-600 text-xs mt-3">{error}</Text>}

        <View className="mt-8" />
        <FoodhutButtonComponent
          title="Create Rider Profile"
          loading={loading}
          onPress={onSubmit}
        />
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
