import React from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectThemeMode } from "@/redux/theme/theme.selectors";

export type SearchFilters = {
  scope: "ALL" | "MEALS" | "KITCHENS";
  per_page?: number;
};

export default function SearchFilterModal({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: SearchFilters;
  onClose: () => void;
  onApply: (next: SearchFilters) => void;
}) {
  const [scope, setScope] = React.useState<SearchFilters["scope"]>(
    initial.scope ?? "ALL"
  );
  const [perPage, setPerPage] = React.useState(String(initial.per_page ?? 20));
  const isDark = useAppSelector(selectThemeMode) === "dark";

  React.useEffect(() => {
    if (open) {
      setScope(initial.scope ?? "ALL");
      setPerPage(String(initial.per_page ?? 20));
    }
  }, [open, initial.scope, initial.per_page]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30 justify-end">
        <View
          className={`rounded-t-3xl p-4 ${
            isDark ? "bg-neutral-900 border-t border-neutral-800" : "bg-white"
          }`}
        >
          <Text
            className={`text-lg font-satoshiBold mb-3 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Filters
          </Text>

          {/* Scope selector */}
          <View className="flex-row mb-3">
            {(["ALL", "MEALS", "KITCHENS"] as const).map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setScope(opt)}
                className={`mr-2 px-3 py-2 rounded-xl border ${
                  scope === opt
                    ? "bg-primary border-primary"
                    : isDark
                      ? "bg-neutral-800 border-neutral-700"
                      : "bg-white border-neutral-200"
                }`}
              >
                <Text
                  className={`${
                    scope === opt
                      ? "text-white"
                      : isDark
                        ? "text-neutral-200"
                        : "text-neutral-700"
                  } font-satoshiMedium`}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Page size */}
          <View className="mb-6">
            <Text
              className={`mb-1 ${
                isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              Results per page
            </Text>
            <TextInput
              value={perPage}
              onChangeText={setPerPage}
              keyboardType="number-pad"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`h-11 px-3 rounded-xl border font-satoshi ${
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-200 text-neutral-900"
              }`}
              placeholder="20"
            />
          </View>

          {/* Actions */}
          <View className="flex-row justify-between">
            <Pressable
              onPress={onClose}
              className={`px-4 py-3 rounded-xl ${
                isDark ? "bg-neutral-800" : "bg-neutral-100"
              }`}
            >
              <Text
                className={`font-satoshiMedium ${
                  isDark ? "text-neutral-100" : "text-neutral-800"
                }`}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onApply({ scope, per_page: Math.max(1, Number(perPage) || 20) })
              }
              className="px-5 py-3 rounded-xl bg-primary"
            >
              <Text className="text-white font-satoshiBold">Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
