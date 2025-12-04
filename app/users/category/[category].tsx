import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  Image,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAppSelector } from "@/store/hooks";
import {
  selectMealsListStatus,
  selectMealsError,
} from "@/redux/meals/meals.selectors";
import {
  makeSelectTrendingDiscounts,
  makeSelectMostPopular,
  makeSelectVendorsCloseBy,
} from "@/redux/meals/meals.selectors";

import MealCard from "@/components/home/MealCard";
import MealCardSkeleton from "@/components/home/MealCardSkeleton";
import AdsCarousel from "@/components/home/AdsCarousel";
import { toNum } from "@/utils/money";

type CategoryKey = "trending" | "popular" | "vendors";

const TITLES: Record<CategoryKey, string> = {
  trending: "Trending Discounts",
  popular: "Most Popular Order",
  vendors: "Vendors Close By",
};

const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "discount", label: "Best Discount" },
  { key: "rating", label: "Highest Rating" },
  { key: "price_asc", label: "Price: Low → High" },
  { key: "price_desc", label: "Price: High → Low" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

export default function CategoryListScreen() {
  const { category } = useLocalSearchParams<{ category: CategoryKey }>();
  const cat = (category as CategoryKey) ?? "trending";

  // Memoize selector instance once per category
  const selector = useMemo(() => {
    switch (cat) {
      case "popular":
        return makeSelectMostPopular(200, "");
      case "vendors":
        return makeSelectVendorsCloseBy(200);
      default:
        return makeSelectTrendingDiscounts(200);
    }
  }, [cat]);

  const status = useAppSelector(selectMealsListStatus);
  const error = useAppSelector(selectMealsError);
  const base = useAppSelector(selector); // derived list for this category

  // Local search + filters
  const [q, setQ] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [discountOnly, setDiscountOnly] = useState(cat === "trending");

  const filtered = useMemo(() => {
    let arr = base;

    if (discountOnly) {
      arr = arr.filter((m) => toNum(m.original_price) > toNum(m.price));
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter((m) =>
        [m.name, m.description].join(" ").toLowerCase().includes(s)
      );
    }

    switch (sort) {
      case "discount":
        arr = arr.slice().sort((a, b) => {
          const pa = toNum(a.price),
            oa = toNum(a.original_price);
          const pb = toNum(b.price),
            ob = toNum(b.original_price);
          const da = oa > pa ? (oa - pa) / (oa || 1) : 0;
          const db = ob > pb ? (ob - pb) / (ob || 1) : 0;
          return db - da;
        });
        break;
      case "rating":
        arr = arr
          .slice()
          .sort(
            (a, b) =>
              toNum(b.rating) - toNum(a.rating) ||
              toNum(b.likes) - toNum(a.likes)
          );
        break;
      case "price_asc":
        arr = arr.slice().sort((a, b) => toNum(a.price) - toNum(b.price));
        break;
      case "price_desc":
        arr = arr.slice().sort((a, b) => toNum(b.price) - toNum(a.price));
        break;
      default:
        // relevance -> leave order from selector
        break;
    }

    return arr;
  }, [base, q, sort, discountOnly]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      {/* Header */}
      <View
        style={{ marginTop: Platform.select({ android: 40, ios: 60 }) }}
        className="flex-row items-center px-4 pt-4 pb-2"
      >
        <Pressable onPress={() => router.back()} className="mr-2 p-1">
          <View>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </View>
        </Pressable>
        <Text className="text-[24px] font-satoshiBold text-neutral-900 flex-1 text-center mr-9">
          {TITLES[cat]}
        </Text>
      </View>

      {/* Search + filter row */}
      <View className="px-4">
        <View className="flex-row items-center bg-neutral-100 rounded-2xl px-4 h-12">
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput
            placeholder="Search for food"
            placeholderTextColor="#8E8E93"
            className="flex-1 ml-3 font-satoshi"
            value={q}
            onChangeText={setQ}
          />
          <Pressable onPress={() => setSortOpen(true)} className="ml-3">
            <Ionicons name="options-outline" size={22} color="#8E8E93" />
          </Pressable>
        </View>
      </View>

      {/* Ads row */}
      <AdsCarousel />

      {/* List */}
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
        data={status === "loading" ? Array.from({ length: 6 }) : filtered}
        keyExtractor={(item: any, i) =>
          status === "loading" ? `s-${i}` : item.id
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) =>
          status === "loading" ? <MealCardSkeleton /> : <MealCard item={item} />
        }
        ListEmptyComponent={
          status === "succeeded" ? (
            <View>
              <Image
                className="mx-auto"
                source={require("@/assets/images/trayy.png")}
              />
              <Text className="text-center text-neutral-500 mt-10">
                No meals match your filters.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Error (optional, since list can still render) */}
      {status === "failed" && !!error && (
        <Text className="px-4 pb-4 text-red-600">{error}</Text>
      )}

      {/* Filter modal */}
      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
        className="py-10"
      >
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setSortOpen(false)}
        >
          <View className="mt-auto bg-white rounded-t-3xl p-4">
            <Text className="text-[18px] font-satoshiBold mb-3">Filters</Text>

            {/* Discounts only toggle */}
            <Pressable
              onPress={() => setDiscountOnly((v) => !v)}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-[16px] font-satoshi">Discounts only</Text>
              <Ionicons
                name={discountOnly ? "toggle" : "toggle-outline"}
                size={44}
                color="#ffa800"
              />
            </Pressable>

            {/* Sort choices */}
            <Text className="text-[14px] text-neutral-500 mt-1 mb-2">
              Sort by
            </Text>
            {SORTS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setSort(s.key)}
                className="flex-row items-center justify-between py-3"
              >
                <Text className="text-[16px] font-satoshi">{s.label}</Text>
                {sort === s.key ? (
                  <Ionicons name="checkmark-circle" size={22} color="#ffa800" />
                ) : null}
              </Pressable>
            ))}

            <Pressable
              onPress={() => setSortOpen(false)}
              className="bg-primary rounded-2xl items-center py-3 mt-4"
            >
              <Text className="text-white font-satoshiMedium">Apply</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
