import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useMemo } from "react";
import { fetchOrders } from "@/redux/orders/orders.thunks";
import { selectOrdersList } from "@/redux/orders/orders.selectors";
import { fetchTransactions } from "@/redux/transactions/transactions.thunks";
import { selectTransactionsList } from "@/redux/transactions/transactions.selectors";
import { fetchUsers } from "@/redux/users/users.thunks";
import { selectRiders, selectVendors } from "@/redux/users/users.selectors";
import { fetchAds } from "@/redux/ads/ads.thunks";
import { selectAdsMeta } from "@/redux/ads/ads.selectors";
import { formatNGN } from "@/utils/money";

function StatCard({
  label,
  value,
  onPress,
  children,
  highlight = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-3xl border px-4 py-3 mr-3 mb-3 ${
        highlight
          ? "bg-secondary border-primary"
          : "bg-[#FFEED4] border-[#F5C88D]"
      }`}
      style={{ minHeight: 90 }}
    >
      <Text className="text-[12px] font-satoshi text-neutral-700 mb-1">
        {label}
      </Text>
      {value && (
        <Text className="text-[16px] font-satoshiBold text-neutral-900">
          {value}
        </Text>
      )}
      {children}
    </Pressable>
  );
}

export default function AdminHomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showAmount, setShowAmount] = useState(true);

  const orders = useAppSelector(selectOrdersList);
  const transactions = useAppSelector(selectTransactionsList);
  const vendors = useAppSelector(selectVendors);
  const riders = useAppSelector(selectRiders);
  const adsMeta = useAppSelector(selectAdsMeta);

  useEffect(() => {
    dispatch(fetchOrders({ per_page: 500 }));
    dispatch(fetchTransactions({ per_page: 500 }));
    dispatch(fetchUsers({ per_page: 500 }));
    dispatch(fetchAds({ per_page: 100 }));
  }, [dispatch]);

  const stats = useMemo(() => {
    const earnings = transactions.reduce((acc, tx) => {
      const amt = Number(tx.amount) || 0;
      return tx.direction === "INCOMING" ? acc + amt : acc - amt;
    }, 0);

    const pending = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
    const completed = orders.filter((o) => o.status === "DELIVERED").length;
    const canceled = orders.filter((o) => o.status === "CANCELLED").length;

    return {
      totalEarnings: formatNGN(earnings),
      pendingOrders: pending,
      completedOrders: completed,
      canceledOrders: canceled,
      ridersCount: riders.length,
      vendorsCount: vendors.length,
      adsCount: adsMeta?.total ?? 0,
      transactionsCount: transactions.length,
    };
  }, [transactions, orders, riders, vendors, adsMeta]);

  const totalAmount = stats.totalEarnings;

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
      >
        {/* Header */}
        <View className="mt-6 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/avatar.png")}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <View className="flex-row items-center">
                <Text className="text-[20px] font-satoshiBold text-black mr-2">
                  Hi FoodHut
                </Text>
              </View>
              <View className="mt-1 px-3 py-1 rounded-full bg-emerald-100 self-start">
                <Text className="text-[11px] text-emerald-700 font-satoshiMedium">
                  Admin
                </Text>
              </View>
            </View>
          </View>

          <Pressable className="w-10 h-10 rounded-2xl bg-white items-center justify-center shadow-sm">
            <Ionicons name="notifications-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        {/* Grid cards */}
        <View className="flex-col flex-wrap ">
          <View className="flex-row">
            {/* Total earnings */}
            <StatCard
              label="Total earnings"
              highlight
              onPress={() => router.push("/admin/transactions")}
            >
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-[18px] font-satoshiBold text-neutral-900">
                  {showAmount ? totalAmount : "********"}
                </Text>
                <Pressable onPress={() => setShowAmount((v) => !v)}>
                  <Ionicons
                    name={showAmount ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#111827"
                  />
                </Pressable>
              </View>
            </StatCard>
            
            {/* Total orders */}
            <StatCard
              label="Total Orders"
              onPress={() => router.push("/admin/orders")}
            >
              <View className="flex-row flex-wrap mt-2">
                <View className="mr-4">
                  <Text className="text-[12px] text-neutral-500 font-satoshi">
                    Pending
                  </Text>
                  <Text className="text-[14px] font-satoshiBold text-neutral-900">
                    {stats.pendingOrders}
                  </Text>
                </View>
                <View className="mr-4">
                  <Text className="text-[12px] text-neutral-500 font-satoshi">
                    Completed
                  </Text>
                  <Text className="text-[14px] font-satoshiBold text-neutral-900">
                    {stats.completedOrders}
                  </Text>
                </View>
                <View>
                  <Text className="text-[12px] text-neutral-500 font-satoshi">
                    Canceled
                  </Text>
                  <Text className="text-[14px] font-satoshiBold text-neutral-900">
                    {stats.canceledOrders}
                  </Text>
                </View>
              </View>
            </StatCard>
          </View>

          <View className="flex-row">
            {/* Riders */}
            <StatCard
              label="Riders"
              value={String(stats.ridersCount)}
              onPress={() => router.push("/admin/riders")}
            />
            
            {/* Transactions */}
            <StatCard
              label="Transactions"
              value={String(stats.transactionsCount)}
              onPress={() => router.push("/admin/transactions")}
            />
          </View>

          <View className="flex-row">
            {/* Vendors */}
            <StatCard
              label="Vendors"
              value={String(stats.vendorsCount)}
              onPress={() => router.push("/admin/vendors")}
            />
            
            {/* Created Ads */}
            <StatCard
              label="Created ADs"
              value={String(stats.adsCount)}
              onPress={() => router.push("/admin/ads")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
