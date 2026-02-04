import Ionicons from "@expo/vector-icons/Ionicons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

import CountryCodePickerModal from "@/components/auth/CountryCodePickerModal";
import FoodhutButtonComponent from "@/components/ui/FoodhutButton";
import { selectAuthError, selectAuthStatus } from "@/redux/auth/auth.selectors";
import { sendSignInOtp } from "@/redux/auth/auth.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";

type FormValues = { phone_local: string };

const flagFromCode = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

const digitsOnly = (s: string) => s.replace(/\D+/g, "");

function sanitizeLocal(dial: string, raw: string, iso: string) {
  const d = digitsOnly(dial);
  let v = digitsOnly(raw);

  if (v.startsWith(d)) v = v.slice(d.length);

  return v;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  phone_local: yup
    .string()
    .matches(/^\d+$/, "Enter a valid phone number")
    .required("Phone is required"),
});

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const loading = status === "loading";
  const themeMode = useAppSelector((state) => state.theme.mode);
  const isDark = themeMode === "dark";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [country, setCountry] = useState<{
    flag: string;
    code: string;
    dial: string;
  }>({
    flag: "🇳🇬",
    code: "NG",
    dial: "+234",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { phone_local: "" },
  });

  const onLocalChange = (txt: string) => {
    const sanitized = sanitizeLocal(country.dial, txt, country.code);
    setValue("phone_local", sanitized, { shouldValidate: true });
  };

  const fullPhone = useMemo(
    () => (val: string) => `${country.dial}${val}`,
    [country.dial],
  );

  const onSubmit = handleSubmit(async (values) => {
    let local = sanitizeLocal(country.dial, values.phone_local, country.code);
    if (local.startsWith("0")) local = local.slice(1);
    const res = await dispatch(
      sendSignInOtp({ phone_number: fullPhone(local) }),
    );
    if (sendSignInOtp.fulfilled.match(res)) {
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: fullPhone(local), intent: "login" },
      });
    }
  });

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 28,
          paddingTop: 36,
          marginTop: 100,
        }}
      >
        <View>
          <Image
            className="w-44 h-44"
            source={require("@/assets/images/logo-transparent.png")}
          />
        </View>
        <Text
          className={`text-3xl font-satoshiBold mt-2 ${isDark ? "text-neutral-100" : "text-black"}`}
        >
          Welcome back
        </Text>
        <Text
          className={`text-base font-satoshi mt-1 ${isDark ? "text-neutral-300" : "text-gray-600"}`}
        >
          Enter your phone number to continue.
        </Text>

        <Text
          className={`mt-6 mb-2 text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}
        >
          Phone Number
        </Text>
        <View
          className={`${isDark ? "bg-neutral-900" : "bg-gray-100"} rounded-xl px-3 py-1 flex-row items-center`}
        >
          <Pressable
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center px-2 py-2 mr-2 rounded-lg"
          >
            <Text className="text-lg mr-2">{country.flag}</Text>
            <Text
              className={`text-base font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}
            >
              {country.dial}
            </Text>
            <Ionicons name="chevron-down" size={16} style={{ marginLeft: 4 }} />
          </Pressable>

          <Controller
            control={control}
            name="phone_local"
            render={({ field: { value, onBlur } }) => (
              <TextInput
                placeholder={
                  country.code === "NG"
                    ? "e.g. 7049938128"
                    : "Enter phone (no leading 0)"
                }
                placeholderTextColor={isDark ? "#888" : undefined}
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                value={value}
                onChangeText={onLocalChange}
                onBlur={onBlur}
                className={`flex-1 text-base font-satoshi py-2 ${isDark ? "text-neutral-100" : "text-black"}`}
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
          title="Continue"
          loading={loading}
          onPress={onSubmit}
        />
        <Pressable
          onPress={() => router.replace("/users/(tabs)")}
          className="mt-3 rounded-2xl border border-primary px-4 py-4 items-center justify-center"
        >
          <Text className="text-primary font-satoshiMedium">
            Continue as guest
          </Text>
        </Pressable>
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
          setValue("phone_local", sanitizeLocal(c.dial_code, current, c.code), {
            shouldValidate: true,
          });
        }}
      />
    </SafeAreaView>
  );
}
