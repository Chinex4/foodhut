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
import {
  fetchBanks,
  resolveBankAccount,
  withdrawFunds,
} from "@/redux/wallet/wallet.thunks";
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

export default function KitchenWithdrawScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const banksStatus = useAppSelector(selectBanksStatus);
  useEffect(() => {
    if (banksStatus === "idle")
      dispatch(fetchBanks({ page: 1, per_page: 200 }));
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
      (b) => b.name.toLowerCase().includes(q) || b.code.includes(bankQuery)
    );
  }, [banks, bankQuery]);

  const canResolve =
    bankCode.length > 0 && accountNumber.replace(/\D/g, "").length >= 10;

  const canWithdraw =
    !!resolvedName &&
    Number(amount.replace(/[^0-9.]/g, "")) > 0 &&
    canResolve &&
    !busy;

  const doResolve = async () => {
    try {
      await dispatch(
        resolveBankAccount({
          bank_code: bankCode,
          account_number: accountNumber.replace(/\D/g, ""),
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
          account_number: accountNumber.replace(/\D/g, ""),
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
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-neutral-950" : "bg-primary-50"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <Pressable
            onPress={() => router.push("/kitchen/wallet")}
            className="mr-2"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isDark ? "#E5E7EB" : "#0F172A"}
            />
          </Pressable>
          <Text
            className={`text-[18px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}
          >
            Withdraw
          </Text>
        </View>

        <View className="flex-1 px-5 mt-2">
          <Field
            icon={
              <Ionicons name="business-outline" size={18} color="#9CA3AF" />
            }
          >
            <Pressable
              onPress={() => {}}
              className="flex-row items-center justify-between"
            >
              <TextInput
                placeholder="Select Bank"
                value={bankName || bankQuery}
                onChangeText={(t) => {
                  setBankName("");
                  setBankQuery(t);
                }}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                className={`flex-1 font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
              />
              <Ionicons
                name="chevron-down"
                size={18}
                color={isDark ? "#9CA3AF" : "#9CA3AF"}
              />
            </Pressable>
          </Field>

          {(bankQuery.length > 0 || !bankCode) && (
            <View className="mb-3">
              <FlatList
                data={filteredBanks}
                keyExtractor={(b) => b.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setBankName(item.name);
                      setBankCode(item.code);
                      setBankQuery("");
                    }}
                    className={`px-3 py-3 ${
                      isDark
                        ? "bg-neutral-900 border-b border-neutral-800"
                        : "bg-white border-b border-neutral-100"
                    }`}
                  >
                    <Text
                      className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
                    >
                      {item.name}{" "}
                      <Text
                        className={
                          isDark ? "text-neutral-400" : "text-neutral-400"
                        }
                      >
                        ({item.code})
                      </Text>
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          <Field
            icon={<Ionicons name="card-outline" size={18} color="#9CA3AF" />}
          >
            <TextInput
              placeholder="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <Field
            icon={<Ionicons name="cash-outline" size={18} color="#9CA3AF" />}
          >
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
            />
          </Field>

          <View className="mb-3">
            <Pressable
              onPress={doResolve}
              disabled={!canResolve}
              className={`rounded-2xl py-3 items-center justify-center ${
                canResolve ? "bg-primary" : "bg-neutral-700/70"
              }`}
            >
              {resolveStatus === "loading" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-satoshiBold">
                  Verify Account
                </Text>
              )}
            </Pressable>
          </View>

          {resolvedName && (
            <Text className={`mb-3 font-satoshi ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
              Name: {resolvedName}
            </Text>
          )}

          <Pressable
            onPress={doWithdraw}
            disabled={!canWithdraw}
            className={`rounded-2xl py-3 items-center justify-center ${
              canWithdraw ? "bg-primary" : "bg-neutral-700/70"
            }`}
          >
            {withdrawStatus === "loading" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold">Withdraw</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
