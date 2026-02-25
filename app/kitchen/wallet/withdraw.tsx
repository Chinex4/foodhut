import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBanks, resolveBankAccount, withdrawFunds } from "@/redux/wallet/wallet.thunks";
import {
  selectBanksList,
  selectBanksStatus,
  selectResolveStatus,
  selectResolvedAccountName,
  selectWithdrawStatus,
} from "@/redux/wallet/wallet.selectors";
import { resetResolvedAccount } from "@/redux/wallet/wallet.slice";
import { showError, showSuccess } from "@/components/ui/toast";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { getKitchenPalette } from "@/app/kitchen/components/kitchenTheme";

function Field({
  icon,
  children,
  isDark,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
}) {
  const palette = getKitchenPalette(isDark);
  return (
    <View
      className="rounded-2xl border px-3 py-4 flex-row items-center mb-3"
      style={{
        backgroundColor: palette.surface,
        borderColor: palette.border,
      }}
    >
      {icon}
      <View className="ml-3 flex-1">{children}</View>
    </View>
  );
}

export default function KitchenWithdrawScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";
  const palette = getKitchenPalette(isDark);

  const banksStatus = useAppSelector(selectBanksStatus);
  useEffect(() => {
    if (banksStatus === "idle") {
      dispatch(fetchBanks({ page: 1, per_page: 200 }));
    }
  }, [banksStatus, dispatch]);

  const banks = useAppSelector(selectBanksList);

  const [bankQuery, setBankQuery] = useState("");
  const [bankCode, setBankCode] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const resolveStatus = useAppSelector(selectResolveStatus);
  const resolvedName = useAppSelector(selectResolvedAccountName);

  const withdrawStatus = useAppSelector(selectWithdrawStatus);
  const busy = resolveStatus === "loading" || withdrawStatus === "loading";

  const filteredBanks = useMemo(() => {
    if (!bankQuery.trim()) return banks;
    const q = bankQuery.toLowerCase();
    return banks.filter(
      (bank) => bank.name.toLowerCase().includes(q) || bank.code.includes(bankQuery)
    );
  }, [banks, bankQuery]);

  const cleanAccount = accountNumber.replace(/\D/g, "");

  const canResolve = bankCode.length > 0 && cleanAccount.length >= 10;
  const canWithdraw =
    !!resolvedName && Number(amount.replace(/[^0-9.]/g, "")) > 0 && canResolve && !busy;

  const doResolve = async () => {
    try {
      await dispatch(
        resolveBankAccount({
          bank_code: bankCode,
          account_number: cleanAccount,
          as_kitchen: true,
        })
      ).unwrap();
    } catch (e: any) {
      showError(e);
    }
  };

  const doWithdraw = async () => {
    try {
      const amt = Math.round(Number(amount.replace(/[^0-9.]/g, "")));
      const res = await dispatch(
        withdrawFunds({
          bank_code: bankCode,
          account_number: cleanAccount,
          account_name: resolvedName as string,
          amount: amt,
          as_kitchen: true,
        })
      ).unwrap();
      showSuccess(res.message);
      router.back();
    } catch (e: any) {
      showError(e);
    }
  };

  useEffect(() => {
    dispatch(resetResolvedAccount());
  }, [bankCode, accountNumber, dispatch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="px-5 pt-2 pb-3 flex-row items-center">
          <Pressable
            onPress={() => router.push("/kitchen/wallet")}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </Pressable>
          <Text className="text-[22px] font-satoshiBold" style={{ color: palette.textPrimary }}>
            Withdraw
          </Text>
        </View>

        <View className="flex-1 px-5 mt-2">
          <Field icon={<Ionicons name="business-outline" size={18} color={palette.textMuted} />} isDark={isDark}>
            <View className="flex-row items-center justify-between">
              <TextInput
                placeholder="Search bank"
                value={bankName || bankQuery}
                onChangeText={(value) => {
                  setBankName("");
                  setBankQuery(value);
                }}
                placeholderTextColor={palette.textMuted}
                className="flex-1 font-satoshi text-[15px]"
                style={{ color: palette.textPrimary }}
              />
              <Ionicons name="chevron-down" size={18} color={palette.textMuted} />
            </View>
          </Field>

          {(bankQuery.length > 0 || !bankCode) && (
            <View
              className="mb-3 rounded-2xl overflow-hidden"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <FlatList
                data={filteredBanks}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 180 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setBankName(item.name);
                      setBankCode(item.code);
                      setBankQuery("");
                    }}
                    className="px-3 py-3"
                    style={{ borderTopWidth: 1, borderTopColor: palette.border }}
                  >
                    <Text className="font-satoshi" style={{ color: palette.textPrimary }}>
                      {item.name}
                      <Text style={{ color: palette.textMuted }}>{` (${item.code})`}</Text>
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          <Field icon={<Ionicons name="card-outline" size={18} color={palette.textMuted} />} isDark={isDark}>
            <TextInput
              placeholder="Account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              placeholderTextColor={palette.textMuted}
              className="font-satoshi text-[15px]"
              style={{ color: palette.textPrimary }}
            />
          </Field>

          <Field icon={<Ionicons name="cash-outline" size={18} color={palette.textMuted} />} isDark={isDark}>
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={palette.textMuted}
              className="font-satoshi text-[15px]"
              style={{ color: palette.textPrimary }}
            />
          </Field>

          <Pressable
            onPress={doResolve}
            disabled={!canResolve || busy}
            className="rounded-2xl py-3 items-center justify-center"
            style={{
              backgroundColor: canResolve && !busy ? palette.surfaceAlt : palette.textMuted,
            }}
          >
            {resolveStatus === "loading" ? (
              <ActivityIndicator color={palette.textPrimary} />
            ) : (
              <Text className="font-satoshiBold" style={{ color: palette.textPrimary }}>
                Verify Account
              </Text>
            )}
          </Pressable>

          {resolvedName ? (
            <View
              className="mt-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: isDark ? palette.elevated : "#F1FFF4" }}
            >
              <Text className="font-satoshiBold" style={{ color: palette.success }}>
                {resolvedName}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={doWithdraw}
            disabled={!canWithdraw}
            className="rounded-2xl py-4 items-center justify-center mt-4"
            style={{ backgroundColor: canWithdraw ? palette.accent : palette.textMuted }}
          >
            {withdrawStatus === "loading" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold text-[16px]">Withdraw</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
