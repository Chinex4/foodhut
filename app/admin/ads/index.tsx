import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  selectAdsList,
  selectAdsListStatus,
  selectAdsMeta,
  selectAdsQuery,
} from "@/redux/ads/ads.selectors";
import { deleteAdById, fetchAds } from "@/redux/ads/ads.thunks";
import type { Ad } from "@/redux/ads/ads.types";
import CachedImage from "@/components/ui/CachedImage";

export default function CreatedAdsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const ads = useAppSelector(selectAdsList);
  const listStatus = useAppSelector(selectAdsListStatus);
  const meta = useAppSelector(selectAdsMeta);
  const lastQuery = useAppSelector(selectAdsQuery);

  const [search, setSearch] = useState<string>(lastQuery?.search ?? "");
  const [refreshing, setRefreshing] = useState(false);

  const loading = listStatus === "loading";
  const initialLoading = loading && (!meta || meta.page === 1);

  const loadInitial = useCallback(
    (overrideSearch?: string) => {
      const q = {
        page: 1,
        per_page: lastQuery?.per_page ?? 10,
        search: overrideSearch ?? (search || undefined),
      };
      dispatch(fetchAds(q));
    },
    [dispatch, lastQuery?.per_page, search]
  );

  useEffect(() => {
    if (!meta) {
      loadInitial();
    }
  }, [meta, loadInitial]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(
        fetchAds({
          page: 1,
          per_page: lastQuery?.per_page ?? 10,
          search: search || undefined,
        })
      ).unwrap();
    } catch (e) {
      // errors already handled
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, lastQuery?.per_page, search]);

  const hasMore = useMemo(() => {
    if (!meta) return false;
    return meta.page * meta.per_page < meta.total;
  }, [meta]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading || !meta) return;
    dispatch(
      fetchAds({
        page: meta.page + 1,
        per_page: meta.per_page,
        search: search || undefined,
      })
    );
  }, [dispatch, hasMore, loading, meta, search]);

  const handleSearchSubmit = useCallback(() => {
    loadInitial(search || undefined);
  }, [loadInitial, search]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteAdById(id)).unwrap();
        // slice already updates list
      } catch (e) {
        // errors toasted
      }
    },
    [dispatch]
  );

  const renderItem = ({ item }: { item: Ad }) => (
    <Pressable
      onPress={() => router.push(`/admin/ads/${item.id}`)}
      className="bg-white rounded-3xl mb-3 overflow-hidden"
    >
      <View className="m-3 rounded-2xl overflow-hidden bg-gray-200 h-24">
        <CachedImage
          uri={item.banner_image?.url || undefined}
          fallback={
            <Image
              source={require("@/assets/images/banner-placeholder.png")}
              className="w-full h-full"
            />
          }
          className="w-full h-full"
        />
      </View>
      <View className="px-4 pb-3 flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-[14px] font-satoshiMedium text-neutral-900">
            {item.link || "Ad Link"}
          </Text>
          <Text className="text-[11px] text-neutral-500 font-satoshi mt-1">
            Duration: {item.duration}s
          </Text>
        </View>
        <View className="flex-row">
          <Pressable
            onPress={() => handleDelete(item.id)}
            className="px-3 py-1 rounded-full bg-red-500 mr-2"
          >
            <Text className="text-[11px] text-white font-satoshiMedium">
              Delete
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/admin/ads/${item.id}/edit`)}
            className="px-3 py-1 rounded-full bg-primary"
          >
            <Text className="text-[11px] text-white font-satoshiMedium">
              Edit
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const keyExtractor = (item: Ad) => item.id;

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Pressable>
          <Text className="text-[20px] font-satoshiBold text-black">
            Created ADs
          </Text>
        </View>
      </View>

      <View className="px-5 pb-2">
        <View className="flex-row items-center bg-white rounded-2xl px-3 py-2">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Search by link…"
            className="flex-1 ml-2 py-2 font-satoshi text-[13px]"
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => {
                setSearch("");
                loadInitial("");
              }}
              className="ml-2"
            >
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 80,
          paddingTop: 8,
        }}
        data={ads}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          initialLoading ? null : (
            <View className="mt-10 items-center">
              <Text className="text-[13px] text-neutral-500 font-satoshi">
                No ads yet.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && hasMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />

      {/* floating add button */}
      <Pressable
        onPress={() => router.push("/admin/ads/create")}
        className="absolute right-6 bottom-24 w-12 h-12 rounded-2xl bg-primary items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
