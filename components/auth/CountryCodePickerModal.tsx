import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";

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
      <View className="bg-white rounded-t-3xl p-4 max-h-[70%]">
        <View className="h-1.5 w-12 bg-gray-300 self-center rounded-full mb-3" />
        <Text className="text-xl font-satoshiBold mb-2">Select Country</Text>

        <View className="border border-gray-200 rounded-xl px-3 py-2 mb-3">
          <TextInput
            placeholder="Search country or code"
            value={q}
            onChangeText={setQ}
            className="text-base font-satoshi"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => (
            <View className="h-[1px] bg-gray-100" />
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
                  <Text className="text-base font-satoshiMedium">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500 font-satoshi">
                    {item.code}
                  </Text>
                </View>
              </View>
              <Text className="text-base font-satoshiMedium">
                {item.dial_code}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
