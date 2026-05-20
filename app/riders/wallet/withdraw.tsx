import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { showError, showSuccess } from "@/components/ui/toast";
import { goBackOrReplace } from "@/utils/navigation";
import {
  fetchBanks,
  fetchWalletProfile,
  resolveBankAccount,
  withdrawFunds,
} from "@/redux/wallet/wallet.thunks";
import {
  selectBanksList,
  selectBanksStatus,
  selectResolvedAccountName,
  selectResolveStatus,
  selectWalletProfileStatus,
  selectWithdrawStatus,
} from "@/redux/wallet/wallet.selectors";
import { resetResolvedAccount } from "@/redux/wallet/wallet.slice";

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  return (
    <View
      className={`rounded-2xl border px-3 py-4 flex-row items-center mb-3 ${
        isDark
          ? "bg-neutral-900 border-neutral-800"
          : "bg-white border-neutral-200"
      }`}
    >
      {icon}
      <View className="ml-3 flex-1">{children}</View>
    </View>
  );
}

export default function RiderWithdrawScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const banksStatus = useAppSelector(selectBanksStatus);
  const banks = useAppSelector(selectBanksList);
  const resolvedName = useAppSelector(selectResolvedAccountName);
  const resolveStatus = useAppSelector(selectResolveStatus);
  const walletStatus = useAppSelector(selectWalletProfileStatus);
  const withdrawStatus = useAppSelector(selectWithdrawStatus);
  const [bankName, setBankName] = useState("");
  const [bankQuery, setBankQuery] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const lastResolvedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (banksStatus === "idle") dispatch(fetchBanks({ page: 1, per_page: 200 }));
    if (walletStatus === "idle") dispatch(fetchWalletProfile({ as_rider: true }));
  }, [banksStatus, dispatch, walletStatus]);

  const cleanAccount = accountNumber.replace(/\D/g, "");
  const filteredBanks = useMemo(() => {
    if (!bankQuery.trim()) return banks;
    const q = bankQuery.toLowerCase();
    return banks.filter((bank) => bank.name.toLowerCase().includes(q) || bank.code.includes(bankQuery));
  }, [bankQuery, banks]);
  const canWithdraw =
    !!resolvedName &&
    bankCode.length > 0 &&
    cleanAccount.length === 10 &&
    pin.trim().length >= 4 &&
    Number(amount.replace(/[^0-9.]/g, "")) > 0 &&
    withdrawStatus !== "loading";

  useEffect(() => {
    dispatch(resetResolvedAccount());
    lastResolvedKeyRef.current = null;
  }, [bankCode, accountNumber, dispatch]);

  useEffect(() => {
    if (!bankCode || cleanAccount.length !== 10 || resolveStatus === "loading") return;
    const key = `${bankCode}:${cleanAccount}`;
    if (lastResolvedKeyRef.current === key) return;
    lastResolvedKeyRef.current = key;
    dispatch(resolveBankAccount({ bank_code: bankCode, account_number: cleanAccount })).catch(() => {});
  }, [bankCode, cleanAccount, dispatch, resolveStatus]);

  const handleWithdraw = async () => {
    if (!canWithdraw) return;
    try {
      const amountValue = Math.round(Number(amount.replace(/[^0-9.]/g, "")));
      const res = await dispatch(
        withdrawFunds({
          bank_code: bankCode,
          account_number: cleanAccount,
          account_name: resolvedName,
          amount: amountValue,
          pin: pin.trim(),
          as_rider: true,
        })
      ).unwrap();
      showSuccess(res.message);
      router.back();
    } catch (error: any) {
      showError(error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <Pressable onPress={() => goBackOrReplace(router, "/riders/wallet")} className="mr-2">
            <Ionicons
              name="chevron-back"
              size={22}
              color={isDark ? "#E5E7EB" : "#0F172A"}
            />
          </Pressable>
          <Text className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
            Withdraw
          </Text>
        </View>

        <View className="flex-1 px-5 mt-2">
          <Field icon={<Ionicons name="business-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Select bank"
              value={bankName || bankQuery}
              onChangeText={(value) => {
                setBankName("");
                setBankCode("");
                setBankQuery(value);
              }}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          {(bankQuery.length > 0 || !bankCode) && (
            <FlatList
              data={filteredBanks}
              keyExtractor={(bank) => bank.id}
              style={{ maxHeight: 180, marginBottom: 12 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setBankName(item.name);
                    setBankCode(item.code);
                    setBankQuery("");
                  }}
                  className={`px-3 py-3 border-b ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"}`}
                >
                  <Text className={isDark ? "text-white" : "text-neutral-900"}>
                    {item.name} <Text className="text-neutral-400">({item.code})</Text>
                  </Text>
                </Pressable>
              )}
            />
          )}

          <Field icon={<Ionicons name="card-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          {resolveStatus === "loading" && <ActivityIndicator color="#ffa800" />}
          {resolvedName ? (
            <Text className={`mb-3 font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
              {resolvedName}
            </Text>
          ) : null}

          <Field icon={<Ionicons name="cash-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <Field icon={<Ionicons name="keypad-outline" size={18} color="#9CA3AF" />}>
            <TextInput
              placeholder="Wallet PIN"
              value={pin}
              onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <Pressable
            onPress={handleWithdraw}
            disabled={!canWithdraw}
            className={`mt-2 rounded-2xl py-3 items-center ${
              canWithdraw ? "bg-primary" : "bg-neutral-400"
            }`}
          >
            {withdrawStatus === "loading" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold">Withdraw Funds</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
