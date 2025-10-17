import React, { useEffect } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAds } from "@/redux/ads/ads.thunks";
import { selectAdsList, selectAdsListStatus } from "@/redux/ads/ads.selectors";

function AdSkeleton() {
  return (
    <View className="h-40 w-[320px] mr-3 rounded-3xl bg-neutral-200 animate-pulse" />
  );
}

export default function AdsCarousel() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAdsListStatus);
  const ads = useAppSelector(selectAdsList);

  useEffect(() => {
    if (status === "idle" || status === "failed") {
      dispatch(fetchAds({ page: 1, per_page: 5 }));
    }
  }, [status, dispatch]);

//   console.log(ads)

  if (status === "loading") {
    return (
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[1, 2]}
        keyExtractor={(i) => String(i)}
        renderItem={() => <AdSkeleton />}
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={ads}
      keyExtractor={(x) => x.id}
      ItemSeparatorComponent={() => <View className="w-3" />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            item.link &&
            (typeof window !== "undefined"
              ? window.open(item.link, "_blank")
              : null)
          }
          className="h-40 w-[320px] rounded-3xl overflow-hidden bg-neutral-900"
          style={{
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {item.banner_image?.url ? (
            <Image
              source={{ uri: item.banner_image.url }}
              className="w-full h-full"
            />
          ) : (
            <View className="flex-1 bg-neutral-800" />
          )}
        </Pressable>
      )}
    />
  );
}
