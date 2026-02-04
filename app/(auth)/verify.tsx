import FoodhutButtonComponent from "@/components/ui/FoodhutButton";
import { selectAuthError, selectAuthStatus } from "@/redux/auth/auth.selectors";
import { resendVerificationOtp, verifyOtp } from "@/redux/auth/auth.thunks";
import { fetchMyProfile } from "@/redux/users/users.thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    NativeSyntheticEvent,
    Platform,
    Pressable,
    Text,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

type FormValues = { d1: string; d2: string; d3: string; d4: string };

const schema: yup.ObjectSchema<FormValues> = yup.object({
  d1: yup.string().matches(/^\d?$/, " ").required(" "),
  d2: yup.string().matches(/^\d?$/, " ").required(" "),
  d3: yup.string().matches(/^\d?$/, " ").required(" "),
  d4: yup.string().matches(/^\d?$/, " ").required(" "),
});

const digitsOnly = (s: string) => s.replace(/\D+/g, "");

export default function VerifyScreen() {
  const router = useRouter();
  const { phone = "", intent = "login" } = useLocalSearchParams<{
    phone?: string;
    intent?: "login" | "register";
  }>(); // full E.164 passed from login/register
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const loading = status === "loading";
  const themeMode = useAppSelector((state) => state.theme.mode);
  const isDark = themeMode === "dark";

  const { control, handleSubmit, setValue, watch } =
    useForm<FormValues>({
      resolver: yupResolver(schema),
      defaultValues: { d1: "", d2: "", d3: "", d4: "" },
    });
  const [lastAutoOtp, setLastAutoOtp] = useState("");

  // inputs refs for focus mgmt
  const r1 = useRef<TextInput>(null);
  const r2 = useRef<TextInput>(null);
  const r3 = useRef<TextInput>(null);
  const r4 = useRef<TextInput>(null);

  const inputs = [r1, r2, r3, r4];

  // resend cooldown
  const [cooldown, setCooldown] = useState(60);
  const canResend = cooldown <= 0;

  useEffect(() => {
    setCooldown(60); // when you arrive on screen
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // When user types across fields, submit automatically on 4 digits
  const [d1, d2, d3, d4] = watch(["d1", "d2", "d3", "d4"]);
  const otpValue = `${d1}${d2}${d3}${d4}`;

  useEffect(() => {
    if (otpValue.length === 4 && !loading && otpValue !== lastAutoOtp) {
      setLastAutoOtp(otpValue);
      const t = setTimeout(() => onSubmit(), 50);
      return () => clearTimeout(t);
    }
  }, [otpValue, loading, lastAutoOtp, onSubmit]);

  const onSubmit = handleSubmit(async (vals) => {
    const otp = `${vals.d1}${vals.d2}${vals.d3}${vals.d4}`;
    if (otp.length !== 4) return;
    const res = await dispatch(verifyOtp({ phone_number: String(phone), otp }));
    if (verifyOtp.fulfilled.match(res)) {
      if (intent === "register") {
        router.replace("/(auth)/choose-role");
        return;
      }

      try {
        const me = await dispatch(fetchMyProfile()).unwrap();
        if (me?.has_kitchen) {
          router.replace("/kitchen/(tabs)");
        } else {
          router.replace("/users/(tabs)");
        }
      } catch {
        router.replace("/users/(tabs)");
      }
    }
  });

  const handlePaste = (txt: string) => {
    const clean = digitsOnly(txt).slice(0, 4);
    setValue("d1", clean[0] ?? "");
    setValue("d2", clean[1] ?? "");
    setValue("d3", clean[2] ?? "");
    setValue("d4", clean[3] ?? "");
  };

  const handleDigitChange = (i: number, txt: string) => {
    const clean = digitsOnly(txt).slice(-1); // keep last typed digit only
    const name = ["d1", "d2", "d3", "d4"][i] as keyof FormValues;

    // If user pasted multiple digits in a single box
    if (digitsOnly(txt).length > 1) {
      handlePaste(txt);
      // focus next empty input
      const vals = getValues();
      const firstEmpty = ["d1", "d2", "d3", "d4"].findIndex(
        (k) => !(vals as any)[k]
      );
      if (firstEmpty >= 0) inputs[firstEmpty].current?.focus();
      else inputs[3].current?.blur();
      return;
    }

    setValue(name, clean, { shouldValidate: true });

    if (clean && i < 3) {
      inputs[i + 1].current?.focus();
    } else if (clean && i === 3) {
      inputs[3].current?.blur();
    }
  };

  const handleKeyPress = (
    i: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const name = ["d1", "d2", "d3", "d4"][i] as keyof FormValues;
      const curr = (getValues() as any)[name] as string;
      if (!curr && i > 0) {
        // move back and clear previous
        const prev = ["d1", "d2", "d3", "d4"][i - 1] as keyof FormValues;
        setValue(prev, "");
        inputs[i - 1].current?.focus();
      }
    }
  };

  const onResend = async () => {
    if (!canResend) return;
    setCooldown(60);
    await dispatch(resendVerificationOtp({ phone_number: String(phone) }));
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
          Verify phone
        </Text>
        <Text className={`text-base font-satoshi mt-1 ${isDark ? "text-neutral-300" : "text-gray-600"}`}>
          We sent a 4-digit code to{" "}
          <Text className={`font-satoshiMedium ${isDark ? "text-neutral-100" : "text-black"}`}>{String(phone)}</Text>
        </Text>

        {/* OTP boxes */}
        <View className="mt-8 flex-row justify-between gap-3">
          {(["d1", "d2", "d3", "d4"] as const).map((name, idx) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field: { value, onBlur } }) => (
                <TextInput
                  ref={inputs[idx]}
                  value={value}
                  onChangeText={(t) => handleDigitChange(idx, t)}
                  onBlur={onBlur}
                  onKeyPress={(e) => handleKeyPress(idx, e)}
                  keyboardType={
                    Platform.OS === "ios" ? "number-pad" : "numeric"}
                  textContentType="oneTimeCode"
                  inputMode="numeric"
                  maxLength={1}
                  autoFocus={idx === 0}
                  className={`w-16 h-16 rounded-2xl text-center text-2xl font-satoshiBold shadow ${isDark ? "bg-neutral-900 text-neutral-100" : "bg-white text-black"}`}
                />
              )}
            />
          ))}
        </View>

        {/* Error */}
        {!!error && <Text className="text-red-600 text-xs mt-3">{error}</Text>}

        {/* Verify button (fallback manual submit) */}
        <View className="mt-8" />
        <FoodhutButtonComponent
          title="Verify"
          loading={loading}
          onPress={onSubmit}
        />

        {/* Resend */}
        <View className="mt-4 flex-row items-center justify-center">
          <Text className={`font-satoshi ${isDark ? "text-neutral-200" : "text-gray-700"}`}>
            {"Didn't receive code? "}
          </Text>
          <Pressable
            disabled={!canResend}
            onPress={onResend}
            className={`${canResend ? "" : "opacity-60"}`}
          >
            <Text className="text-primary font-satoshiMedium">
              {canResend ? "Resend OTP" : `Resend in ${cooldown}s`}
            </Text>
          </Pressable>
        </View>

        {/* Change number */}
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          className={`mt-6 rounded-2xl border px-4 py-4 items-center justify-center ${
            isDark ? "border-neutral-700" : "border-primary"
          }`}
        >
          <Text className={`${isDark ? "text-white" : "text-primary"} font-satoshiMedium`}>
            Use a different number
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
