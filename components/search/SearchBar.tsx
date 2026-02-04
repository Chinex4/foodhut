import React from "react";
import { View, TextInput, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppDispatch } from "@/store/hooks";
import { searchMealsAndKitchens } from "@/redux/search/search.thunks";
import type { SearchQuery } from "@/redux/search/search.types";
import { router, usePathname } from "expo-router";
import SearchFilterModal, { SearchFilters } from "./SearchFilterModal";

type Props = {
  placeholder?: string;
  initial?: string;
  perPage?: number;
  autoFocus?: boolean;
  className?: string;
};

export default function SearchBar({
  placeholder = "search food/vendor/groceries",
  initial = "",
  perPage = 20,
  autoFocus,
  className = "",
}: Props) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [value, setValue] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<SearchFilters>({
    scope: "ALL",
    per_page: perPage,
  });
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const doSearch = async (q: string, extra?: Partial<SearchQuery>) => {
    const query: SearchQuery = {
      q: q.trim(),
      page: 1,
      per_page: extra?.per_page ?? filters.per_page ?? perPage,
    };
    if (!query.q) return; 
    try {
      await dispatch(searchMealsAndKitchens(query)).unwrap();
      if (pathname !== "/users/(tabs)/search") {
        router.push("/users/(tabs)/search");
      }
    } catch {
      // optional toast here
    }
  };

  // debounce as user types
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        doSearch(value);
      }
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <View className={`flex-row items-center bg-[#949292]/10 rounded-2xl px-4 h-12 ${className}`}>
        <Ionicons name="search-outline" size={20} color="#949292" />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          className="flex-1 ml-3 py-4 font-satoshi"
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={() => doSearch(value)}
        />
        <Pressable className="ml-3" onPress={() => setOpen(true)} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color="#8E8E93" />
        </Pressable>
      </View>

      <SearchFilterModal
        open={open}
        initial={filters}
        onClose={() => setOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setOpen(false);
          doSearch(value, { per_page: f.per_page });
        }}
      />
    </>
  );
}
