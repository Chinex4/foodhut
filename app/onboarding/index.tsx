import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { STORAGE_KEYS } from "@/storage/keys";

const SLIDES = [
  {
    key: "1",
    title: "Make More Money,\nWe Make The Food For You.",
    image: require("../../assets/images/onb1.png"),
  },
  {
    key: "2",
    title: "Tell Us Your Location,\nWe Deliver It To Your Doorstep",
    image: require("../../assets/images/onb2.png"),
  },
  {
    key: "3",
    title: "Enjoy Your Favorite,\nWith Friends & Family",
    image: require("../../assets/images/onb3.png"),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const goRegister = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, "1");
    router.replace("/(auth)/register"); // go straight to register after Get Started
  }, [router]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length) {
      setIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const skip = async () => {
    // mark as seen and jump to register
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, "1");
    router.replace("/(auth)/register");
  };

  return (
    <View className="flex-1 bg-[#FFF6E7]">
      {" "}
      {/* light warm background */}
      {/* Top bar with Skip */}
      <View className="flex-row justify-end items-center px-4 py-3 mt-20">
        {index < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={skip} hitSlop={12}>
            <Text className="text-primary font-satoshiMedium">Skip →</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(i) => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View style={{ width }} className="px-6">
            <View className="items-center mt-6">
              <Image
                source={item.image}
                className="w-64 h-64"
                resizeMode="contain"
              />
            </View>

            <View className="mt-10 px-2">
              <Text className="text-center text-[22px] leading-7 text-black font-satoshiBold">
                {item.title}
              </Text>
            </View>

            {/* Dots */}
            <View className="mt-8 flex-row items-center justify-center gap-2">
              {SLIDES.map((_, i) => {
                const active = i === index;
                return (
                  <View
                    key={i}
                    className={
                      active
                        ? "h-2 w-10 rounded-full bg-primary"
                        : "h-2 w-2 rounded-full bg-[#F1C56F]"
                    }
                  />
                );
              })}
            </View>
          </View>
        )}
      />
      {/* Bottom CTA */}
      <View className="px-6 pb-8">
        {index === SLIDES.length - 1 ? (
          <TouchableOpacity
            onPress={goRegister}
            className="w-full py-4 rounded-2xl bg-primary"
          >
            <Text className="text-center text-white font-satoshiMedium">
              Get Started
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={next}
            className="self-center mt-2 px-6 py-3 rounded-2xl bg-primary/90"
          >
            <Text className="text-white font-satoshiMedium">Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
