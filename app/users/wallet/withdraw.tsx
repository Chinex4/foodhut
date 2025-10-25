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

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-2xl border border-neutral-200 px-3 py-4 flex-row items-center mb-3">
      {icon}
      <View className="ml-3 flex-1">{children}</View>
    </View>
  );
}

export default function WithdrawScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // fetch banks once
  const banksStatus = useAppSelector(selectBanksStatus);
  useEffect(() => {
    if (banksStatus === "idle")
      dispatch(fetchBanks({ page: 1, per_page: 200 }));
  }, [banksStatus, dispatch]);

  const banks = useAppSelector(selectBanksList);

  // local form state
  const [bankQuery, setBankQuery] = useState("");
  const [bankCode, setBankCode] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  // resolve
  const resolveStatus = useAppSelector(selectResolveStatus);
  const resolvedName = useAppSelector(selectResolvedAccountName);

  // withdraw
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
        })
      ).unwrap();
      showSuccess(res.message);
      router.back();
    } catch (e: any) {
      showError(e);
    }
  };

  // reset resolved name when bank or account changes
  useEffect(() => {
    dispatch(resetResolvedAccount());
  }, [bankCode, accountNumber, dispatch]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-2 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-2">
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>
          <Text className="text-[18px] font-satoshiBold text-neutral-900">
            Withdraw
          </Text>
        </View>

        {/* Body */}
        <View className="flex-1 px-5 mt-2">
          {/* Bank picker — inline searchable list */}
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
                className="flex-1 font-satoshi text-neutral-900 placeholder:text-neutral-400"
              />
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </Pressable>
          </Field>

          {/* Result list (only when typing or empty selection) */}
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
                    className="px-3 py-3 bg-white border-b border-neutral-100"
                  >
                    <Text className="font-satoshi text-neutral-900">
                      {item.name}{" "}
                      <Text className="text-neutral-400">({item.code})</Text>
                    </Text>
                  </Pressable>
                )}
                style={{
                  maxHeight: 220,
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#eee",
                  backgroundColor: "white",
                }}
                ListEmptyComponent={
                  <View className="px-3 py-4 bg-white rounded-2xl border border-neutral-100">
                    <Text className="text-neutral-500 font-satoshi">
                      No banks match your search.
                    </Text>
                  </View>
                }
              />
            </View>
          )}

          {/* Account number */}
          <Field
            icon={<Ionicons name="card-outline" size={18} color="#9CA3AF" />}
          >
            <TextInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              placeholder="Account Number"
              maxLength={12}
              className="font-satoshi text-neutral-900"
            />
          </Field>

          {/* Resolve button + result */}
          <Pressable
            disabled={!canResolve || busy}
            onPress={doResolve}
            className={`rounded-2xl py-3 items-center justify-center ${canResolve ? "bg-primary" : "bg-neutral-300"}`}
          >
            {resolveStatus === "loading" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-satoshiBold">
                Resolve Account
              </Text>
            )}
          </Pressable>

          {resolvedName && (
            <View className="mt-3 bg-white rounded-2xl border border-neutral-200 px-3 py-3">
              <Text className="text-neutral-500 font-satoshi">
                Account Name
              </Text>
              <Text className="text-neutral-900 font-satoshiBold mt-1">
                {resolvedName}
              </Text>
            </View>
          )}

          {/* Amount */}
          <View className="mt-4" />
          <Field
            icon={<Ionicons name="cash-outline" size={18} color="#9CA3AF" />}
          >
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Amount"
              className="font-satoshi text-neutral-900"
            />
          </Field>
        </View>

        {/* CTA */}
        <View className="px-5 pb-6">
          <Pressable
            disabled={!canWithdraw}
            onPress={doWithdraw}
            className={`rounded-2xl py-4 items-center justify-center ${canWithdraw ? "bg-primary" : "bg-neutral-300"}`}
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
