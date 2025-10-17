import CountryCodePickerModal from "@/components/auth/CountryCodePickerModal";
import FoodhutButton from "@/components/ui/FoodhutButton";
import { selectAuthError, selectAuthStatus } from "@/redux/auth/auth.selectors";
import { signUp } from "@/redux/auth/auth.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

// --- utils ---
const flagFromCode = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
const digitsOnly = (s: string) => s.replace(/\D+/g, "");
function sanitizeLocal(dial: string, raw: string, iso: string) {
  const d = digitsOnly(dial);
  let v = digitsOnly(raw);
  if (v.startsWith(d)) v = v.slice(d.length);
  if (v.startsWith("0")) v = v.slice(1);
  const cap = iso === "NG" ? 10 : 15;
  return v.length > cap ? v.slice(0, cap) : v;
}
const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_local: string;
  referral_code?: string | null;
  birthday: string;
};

const schema: yup.ObjectSchema<FormValues> = yup.object({
  first_name: yup.string().trim().required("First name is required"),
  last_name: yup.string().trim().required("Last name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  phone_local: yup
    .string()
    .matches(/^\d{7,15}$/, "Enter a valid phone number")
    .required(),
  referral_code: yup.string().nullable().optional(),
  birthday: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use format YYYY-MM-DD")
    .required("Birthday is required"),
});

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const loading = status === "loading";

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

  const [showDate, setShowDate] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_local: "",
      referral_code: "",
      birthday: "",
    },
    mode: "onSubmit",
  });

  const onLocalChange = (txt: string) =>
    setValue("phone_local", sanitizeLocal(country.dial, txt, country.code), {
      shouldValidate: true,
    });

  const fullPhone = useMemo(
    () => (val: string) => `${country.dial}${val}`,
    [country.dial]
  );

  const onChangeBirthday = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowDate(false);
    if (selected) setValue("birthday", fmt(selected), { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const local = sanitizeLocal(country.dial, values.phone_local, country.code);
    const res = await dispatch(
      signUp({
        email: values.email.trim(),
        phone_number: fullPhone(local),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        birthday: values.birthday.trim(),
        referral_code: values.referral_code?.trim() || undefined,
      })
    );

    if (signUp.fulfilled.match(res)) {
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: fullPhone(local) },
      });
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
          Create an Account
        </Text>
        <Text className="text-base text-gray-600 font-satoshi mt-1">
          Please enter your details to create an account with FOODHUT
        </Text>

        {/* First Name */}
        <Text className="mt-6 mb-2 text-sm text-black font-satoshiMedium">
          First Name
        </Text>
        <Controller
          control={control}
          name="first_name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              placeholder="Enter First Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
            />
          )}
        />
        {!!errors.first_name && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.first_name.message}
          </Text>
        )}

        {/* Last Name */}
        <Text className="mt-4 mb-2 text-sm text-black font-satoshiMedium">
          Last Name
        </Text>
        <Controller
          control={control}
          name="last_name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              placeholder="Enter Username"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
            />
          )}
        />
        {!!errors.last_name && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.last_name.message}
          </Text>
        )}

        {/* Email */}
        <Text className="mt-4 mb-2 text-sm text-black font-satoshiMedium">
          Email Address
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              placeholder="Enter Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
            />
          )}
        />
        {!!errors.email && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </Text>
        )}

        {/* Phone */}
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
                placeholder={
                  country.code === "NG"
                    ? "e.g. 7049938128"
                    : "Enter phone (no leading 0)"
                }
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                value={value}
                onChangeText={onLocalChange}
                onBlur={onBlur}
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

        {/* Referral */}
        <Text className="mt-4 mb-2 text-sm text-black font-satoshiMedium">
          Referral Code <Text className="text-gray-500">(Optional)</Text>
        </Text>
        <Controller
          control={control}
          name="referral_code"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              placeholder="Enter Code"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              className="bg-gray-100 rounded-xl px-4 py-3 text-base font-satoshi"
            />
          )}
        />

        {/* Birthday */}
        <Text className="mt-4 mb-2 text-sm text-black font-satoshiMedium">
          Birthday
        </Text>
        <Controller
          control={control}
          name="birthday"
          render={({ field: { value } }) => (
            <>
              <Pressable
                onPress={() => setShowDate(true)}
                className="bg-gray-100 rounded-xl px-4 py-3"
              >
                <Text
                  className={`text-base ${value ? "text-black" : "text-gray-400"} font-satoshi`}
                >
                  {value || "YYYY-MM-DD"}
                </Text>
              </Pressable>

              {showDate && (
                <DateTimePicker
                  value={value ? new Date(value) : new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeBirthday}
                  maximumDate={new Date()} // optional: cannot pick future dates
                />
              )}
              {Platform.OS === "ios" && showDate && (
                <View className="flex-row justify-end mt-2">
                  <Pressable
                    onPress={() => setShowDate(false)}
                    className="px-3 py-2 rounded-lg bg-primary"
                  >
                    <Text className="text-white font-satoshiMedium">Done</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        />
        {!!errors.birthday && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.birthday.message}
          </Text>
        )}

        {!!error && <Text className="text-red-600 text-xs mt-3">{error}</Text>}

        <View className="mt-8" />
        <FoodhutButton title="Continue" loading={loading} onPress={onSubmit} />

        <Text
          className="text-center mt-4 font-satoshi"
          onPress={() => router.replace("/(auth)/login")}
        >
          Already have an account?{" "}
          <Text className="text-primary font-satoshiMedium">Login</Text>
        </Text>
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
