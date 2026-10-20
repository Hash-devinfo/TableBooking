import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Label, router, useFocusEffect } from "expo-router";
import { getAdminBookings } from "../../api/adminApi";
import type { Booking } from "../../api/bookingApi";
import { getBookingCode } from "../../utils/booking";
import { useLocalSearchParams } from "expo-router";

type Filter = "all" | Booking["status"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", className: "bg-gray-200 text-gray-600" },
};

const personName = (
  p?: string | { firstName?: string; lastName?: string },
): string => {
  if (p && typeof p === "object") {
    const name = `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
    if (name) return name;
  }
  return "Unknown";
};

const restaurantNameOf = (b: Booking): string =>
  b.restaurant && typeof b.restaurant === "object"
    ? (b.restaurant.name ?? "Restaurant")
    : "Restaurant";

const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const BookingCard = ({ item }: { item: Booking }) => {
  const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;

  return (
    <View className="mb-3 rounded-2xl bg-white p-4" style={{ elevation: 1 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-blue-700">
          {getBookingCode(item)}
        </Text>
        <Text
          className={`rounded-full px-2 py-1 text-xs font-bold ${style.className}`}>
          {style.label}
        </Text>
      </View>
      <Text className="mt-2 text-gray-900">{personName(item.customer)}</Text>
      <Text className="text-sm text-gray-500">{restaurantNameOf(item)}</Text>
      <Text className="mt-1 text-sm text-gray-500">
        {formatDate(item.date)} · {item.time} · {item.guests} guests
      </Text>
    </View>
  );
};

const AllBookings = () => {
  const params = useLocalSearchParams<{ label?: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const initialFilter = (params.label?.toLowerCase() as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(
    ["all", "pending", "confirmed", "rejected", "cancelled"].includes(
      initialFilter,
    )
      ? initialFilter
      : "all",
  );
  useEffect(() => {
    if (params.label) {
      const paramFilter = params.label.toLowerCase() as Filter;
      if (
        ["all", "pending", "confirmed", "rejected", "cancelled"].includes(
          paramFilter,
        )
      ) {
        setFilter(paramFilter);
      }
    }
  }, [params.label]);
  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      setBookings(await getAdminBookings());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(admin)/adminDashboard");
  };

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      if (b.status in c) c[b.status] += 1;
    });
    return c;
  }, [bookings]);

  const visible = useMemo(
    () =>
      filter === "all" ? bookings : bookings.filter((b) => b.status === filter),
    [bookings, filter],
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  

  return (
    <View className="flex-1 bg-gray-50 pt-16">
      <View className="mb-4 flex-row items-center px-4">
        <Pressable
          onPress={goBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="arrow-back" size={22} color="#2563EB" />
        </Pressable>
        <Text className="text-2xl font-bold text-blue-900 text-center ml-24">
          All Bookings
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`mr-2 flex-row items-center rounded-full border px-4 py-1  ${
                active
                  ? "border-blue-700 bg-blue-700"
                  : "border-gray-300 bg-white"
              }`}>
              <Text
                className={`text-base font-semibold ${
                  active ? "text-white" : "text-gray-700"
                }`}>
                {label}
              </Text>
              <Text
                className={`ml-2 text-base font-bold ${
                  active ? "text-blue-100" : "text-gray-400"
                }`}>
                {counts[key]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? (
        <View className="mx-4 mb-3 rounded-xl bg-red-50 p-3">
          <Text className="text-sm text-red-700">{error}</Text>
          <Pressable onPress={() => load()} className="mt-1 self-start">
            <Text className="text-sm font-semibold text-red-700">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={visible}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BookingCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="py-12 text-center text-gray-400">
            {filter === "all" ? "No bookings yet." : `No ${filter} bookings.`}
          </Text>
        }
      />
    </View>
  );
};

export default AllBookings;
