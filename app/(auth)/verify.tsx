import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FoodhutButton from "@/components/ui/FoodhutButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthError, selectAuthStatus } from "@/redux/auth/auth.selectors";
import { resendVerificationOtp, verifyOtp } from "@/redux/auth/auth.thunks";
import { StatusBar } from "expo-status-bar";

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
  const { phone = "" } = useLocalSearchParams<{ phone?: string }>(); // full E.164 passed from login/register
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const loading = status === "loading";

  const { control, handleSubmit, setValue, getValues, watch } =
    useForm<FormValues>({
      resolver: yupResolver(schema),
      defaultValues: { d1: "", d2: "", d3: "", d4: "" },
    });

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
  const otpValue = useMemo(() => {
    const { d1, d2, d3, d4 } = getValues();
    return `${d1}${d2}${d3}${d4}`;
  }, [watch(["d1", "d2", "d3", "d4"])]); // watch triggers recompute

  useEffect(() => {
    if (otpValue.length === 4 && !loading) {
      // small debounce to allow last digit render
      const t = setTimeout(() => onSubmit(), 50);
      return () => clearTimeout(t);
    }
  }, [otpValue, loading]);

  const onSubmit = handleSubmit(async (vals) => {
    const otp = `${vals.d1}${vals.d2}${vals.d3}${vals.d4}`;
    if (otp.length !== 4) return;
    const res = await dispatch(verifyOtp({ phone_number: String(phone), otp }));
    if (verifyOtp.fulfilled.match(res)) {
      router.replace("/users/(tabs)");
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
    const res = await dispatch(
      resendVerificationOtp({ phone_number: String(phone) })
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      >
        <Text className="text-3xl font-satoshiBold text-black mt-2">
          Verify phone
        </Text>
        <Text className="text-base text-gray-600 font-satoshi mt-1">
          We sent a 4-digit code to{" "}
          <Text className="font-satoshiMedium text-black">{String(phone)}</Text>
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
                    Platform.OS === "ios" ? "number-pad" : "numeric"
                  }
                  textContentType="oneTimeCode"
                  inputMode="numeric"
                  maxLength={1}
                  autoFocus={idx === 0}
                  className="w-16 h-16 rounded-2xl bg-white text-center text-2xl font-satoshiBold shadow"
                />
              )}
            />
          ))}
        </View>

        {/* Error */}
        {!!error && <Text className="text-red-600 text-xs mt-3">{error}</Text>}

        {/* Verify button (fallback manual submit) */}
        <View className="mt-8" />
        <FoodhutButton title="Verify" loading={loading} onPress={onSubmit} />

        {/* Resend */}
        <View className="mt-4 flex-row items-center justify-center">
          <Text className="font-satoshi text-gray-700">
            Didn't receive code?{" "}
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
          className="mt-6 self-center"
        >
          <Text className="text-gray-700 font-satoshi">
            Use a different number
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
