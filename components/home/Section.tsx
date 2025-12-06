import { selectThemeMode } from "@/redux/theme/theme.selectors";
import { useAppSelector } from "@/store/hooks";
import React, { JSX } from "react";
import { FlatList, Text, View } from "react-native";

export default function Section({
  title,
  onSeeAll,
  data,
  renderItem,
  horizontal = false,
}: {
  title: string;
  onSeeAll?: () => void;
  data: any[];
  renderItem: ({ item, index }: any) => JSX.Element;
  horizontal?: boolean;
}) {
  const isDark = useAppSelector(selectThemeMode) === "dark";
  return (
    <View className="mt-6">
      <View className="px-4 flex-row items-center justify-between">
        <Text className={`text-[20px] font-satoshiBold ${isDark ? "text-white" : "text-neutral-900"}`}>
          {title}
        </Text>
        {onSeeAll ? (
          <Text className="text-primary font-satoshiMedium" onPress={onSeeAll}>
            See all
          </Text>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(_, i) => String(i)}
        ItemSeparatorComponent={() => (
          <View className={horizontal ? "w-3" : "h-3"} />
        )}
        renderItem={renderItem}
      />
    </View>
  );
}
