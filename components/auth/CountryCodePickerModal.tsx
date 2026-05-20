import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";

type Country = { name: string; dial_code: string; code: string };

const COUNTRIES: Country[] = [
  { name: "Nigeria", dial_code: "+234", code: "NG" },
  { name: "Ghana", dial_code: "+233", code: "GH" },
  { name: "Kenya", dial_code: "+254", code: "KE" },
  { name: "South Africa", dial_code: "+27", code: "ZA" },
  { name: "United States", dial_code: "+1", code: "US" },
  { name: "United Kingdom", dial_code: "+44", code: "GB" },
  { name: "Canada", dial_code: "+1", code: "CA" },
  { name: "India", dial_code: "+91", code: "IN" },
];

function flagFromCode(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (c: Country) => void;
};

export default function CountryCodePickerModal({
  visible,
  onClose,
  onPick,
}: Props) {
  const [q, setQ] = useState("");
  const isDark = useAppSelector(selectThemeMode) === "dark";

  const filtered = useMemo(() => {
    const x = q.trim().toLowerCase();
    if (!x) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(x) ||
        c.dial_code.includes(x) ||
        c.code.toLowerCase().includes(x)
    );
  }, [q]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className={`rounded-t-3xl p-4 max-h-[70%] ${
          isDark ? "bg-neutral-950 border-t border-neutral-800" : "bg-white"
        }`}
      >
        <View className={`h-1.5 w-12 self-center rounded-full mb-3 ${isDark ? "bg-neutral-700" : "bg-gray-300"}`} />
        <Text className={`text-xl font-satoshiBold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
          Select Country
        </Text>

        <View
          className={`border rounded-xl px-3 py-2 mb-3 ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"
          }`}
        >
          <TextInput
            placeholder="Search country or code"
            value={q}
            onChangeText={setQ}
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            className={`text-base font-satoshi ${isDark ? "text-white" : "text-neutral-900"}`}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => (
            <View className={`h-[1px] ${isDark ? "bg-neutral-800" : "bg-gray-100"}`} />
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onPick(item);
                onClose();
              }}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center gap-3">
                  <Text className="text-xl">{flagFromCode(item.code)}</Text>
                  <View>
                  <Text className={`text-base font-satoshiMedium ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {item.name}
                  </Text>
                  <Text className={`text-xs font-satoshi ${isDark ? "text-neutral-500" : "text-gray-500"}`}>
                    {item.code}
                  </Text>
                </View>
              </View>
              <Text className={`text-base font-satoshiMedium ${isDark ? "text-neutral-200" : "text-neutral-900"}`}>
                {item.dial_code}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
