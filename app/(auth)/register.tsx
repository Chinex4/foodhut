import CountryCodePickerModal from "@/components/auth/CountryCodePickerModal";
import FoodhutButtonComponent from "@/components/ui/FoodhutButton";
import { selectAuthError, selectAuthStatus } from "@/redux/auth/auth.selectors";
import { signUp } from "@/redux/auth/auth.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { yupResolver } from "@hookform/resolvers/yup";
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
  return v;
}

const steps = [
  {
    key: "full_name",
    title: "What should we call you?",
    hint: "Real name, nickname, anything you love.",
  },
  {
    key: "email",
    title: "Where should we send receipts?",
    hint: "We will keep your inbox clean.",
  },
  {
    key: "phone_local",
    title: "What number should we verify?",
    hint: "We will send a quick 4-digit code.",
  },
  {
    key: "referral_code",
    title: "Got a referral code?",
    hint: "Optional, but it helps your friend too.",
  },
] as const;

type FormValues = {
  full_name: string;
  email: string;
  phone_local: string;
  referral_code?: string | null;
};

const schema: yup.ObjectSchema<FormValues> = yup.object({
  full_name: yup.string().trim().min(2, "Please enter your full name").required("Full name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  phone_local: yup
    .string()
    .matches(/^\d+$/, "Enter a valid phone number")
    .required("Phone number is required"),
  referral_code: yup.string().nullable().optional(),
});

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const loading = status === "loading";
  const themeMode = useAppSelector((state) => state.theme.mode);
  const isDark = themeMode === "dark";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [step, setStep] = useState(0);
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
    trigger,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_local: "",
      referral_code: "",
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

  const onSubmit = handleSubmit(async (values) => {
    let local = sanitizeLocal(country.dial, values.phone_local, country.code);
    if (local.startsWith("0")) local = local.slice(1);

    const parts = values.full_name.trim().split(/\s+/).filter(Boolean);
    const first_name = parts[0] ?? "";
    const last_name = parts.slice(1).join(" ") || parts[0] || "";

    const res = await dispatch(
      signUp({
        email: values.email.trim(),
        phone_number: fullPhone(local),
        first_name,
        last_name,
        referral_code: values.referral_code?.trim() || undefined,
      })
    );

    if (signUp.fulfilled.match(res)) {
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: fullPhone(local), intent: "register" },
      });
    }
  });

  const totalSteps = steps.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const handleNext = async () => {
    const current = steps[step]?.key;
    if (current) {
      const valid = await trigger(current as keyof FormValues);
      if (!valid) return;
    }
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    onSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      >
        <Text className={`text-3xl font-satoshiBold mt-2 ${isDark ? "text-neutral-100" : "text-black"}`}>
          Create an Account
        </Text>
        <Text className={`text-base font-satoshi mt-1 ${isDark ? "text-neutral-300" : "text-gray-600"}`}>
          {steps[step].title}
        </Text>

        <View className="mt-4">
          <View className={`h-2 rounded-full ${isDark ? "bg-neutral-800" : "bg-primary-100"}`}>
            <View
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"} text-xs font-satoshi`}>
              Step {step + 1} of {totalSteps}
            </Text>
            <Text className={`${isDark ? "text-neutral-400" : "text-neutral-500"} text-xs font-satoshi`}>
              {steps[step].hint}
            </Text>
          </View>
        </View>

        {/* Step 1: Full name */}
        {step === 0 && (
          <View className="mt-6">
            <Text className={`mb-2 text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>
              Full name
            </Text>
            <Controller
              control={control}
              name="full_name"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  placeholder="e.g. Ada Lovelace"
                  placeholderTextColor={isDark ? "#888" : undefined}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={`rounded-xl px-4 py-3 text-base font-satoshi ${isDark ? "bg-neutral-900 text-neutral-100" : "bg-gray-100 text-black"}`}
                />
              )}
            />
            {!!errors.full_name && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.full_name.message}
              </Text>
            )}
          </View>
        )}

        {/* Step 2: Email */}
        {step === 1 && (
          <View className="mt-6">
            <Text className={`mb-2 text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>
              Email address
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  placeholder="Enter email address"
                  placeholderTextColor={isDark ? "#888" : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={`rounded-xl px-4 py-3 text-base font-satoshi ${isDark ? "bg-neutral-900 text-neutral-100" : "bg-gray-100 text-black"}`}
                />
              )}
            />
            {!!errors.email && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>
        )}

        {/* Step 3: Phone */}
        {step === 2 && (
          <View className="mt-6">
            <Text className={`mb-2 text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>
              Phone number
            </Text>
            <View className={`${isDark ? "bg-neutral-900" : "bg-gray-100"} rounded-xl px-3 py-1 flex-row items-center`}>
              <Pressable
                onPress={() => setPickerOpen(true)}
                className="flex-row items-center px-2 py-2 mr-2 rounded-lg"
              >
                <Text className="text-lg mr-2">{country.flag}</Text>
                <Text className={`text-base font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>{country.dial}</Text>
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
          </View>
        )}

        {/* Step 4: Referral */}
        {step === 3 && (
          <View className="mt-6">
            <Text className={`mb-2 text-sm font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>
              Referral code <Text className="text-gray-500">(Optional)</Text>
            </Text>
            <Controller
              control={control}
              name="referral_code"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  placeholder="Enter code"
                  placeholderTextColor={isDark ? "#888" : undefined}
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={`rounded-xl px-4 py-3 text-base font-satoshi ${isDark ? "bg-neutral-900 text-neutral-100" : "bg-gray-100 text-black"}`}
                />
              )}
            />
          </View>
        )}

        {!!error && <Text className="text-red-600 text-xs mt-3">{error}</Text>}

        <View className="mt-8" />
        <FoodhutButtonComponent
          title={step === totalSteps - 1 ? "Create account" : "Next"}
          loading={loading}
          onPress={handleNext}
        />

        {step > 0 && (
          <Pressable
            onPress={handleBack}
            className="mt-3 rounded-2xl border border-primary px-4 py-4 items-center justify-center"
          >
            <Text className="text-primary font-satoshiMedium">Back</Text>
          </Pressable>
        )}

        <Text
          className={`text-center mt-4 font-satoshi ${isDark ? "text-neutral-200" : "text-black"}`}
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
