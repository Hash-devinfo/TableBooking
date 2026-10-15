import React, { useCallback, useMemo, useState } from "react";
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
import { router, useFocusEffect } from "expo-router";
import { getAdminUsers, type AdminUser } from "../../api/adminApi";

type Filter = "all" | "customer" | "restaurant";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "restaurant", label: "Restaurants" },
];

const ROLE_STYLES: Record<string, { label: string; className: string }> = {
  customer: { label: "Customer", className: "bg-gray-200 text-gray-600" },
  restaurant: { label: "Restaurant", className: "bg-blue-100 text-blue-700" },
  admin: { label: "Admin", className: "bg-purple-100 text-purple-700" },
};

const fullName = (u: AdminUser): string => {
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return name || "Unnamed user";
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const UserCard = ({ item }: { item: AdminUser }) => {
  const role = ROLE_STYLES[item.role] ?? ROLE_STYLES.customer;
  const joined = formatDate(item.createdAt);

  return (
    <View className="mb-3 rounded-2xl bg-white p-4" style={{ elevation: 1 }}>
      <View className="flex-row items-center justify-between">
        <Text
          numberOfLines={1}
          className="mr-2 flex-1 text-base font-bold text-gray-900">
          {fullName(item)}
        </Text>
        <Text
          className={`rounded-full px-2 py-1 text-xs font-bold ${role.className}`}>
          {role.label}
        </Text>
      </View>

      {item.email ? (
        <View className="mt-2 flex-row items-center">
          <Ionicons name="mail-outline" size={14} color="#6b7280" />
          <Text numberOfLines={1} className="ml-2 flex-1 text-sm text-gray-500">
            {item.email}
          </Text>
        </View>
      ) : null}

      {item.phone ? (
        <View className="mt-1 flex-row items-center">
          <Ionicons name="call-outline" size={14} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-500">{item.phone}</Text>
        </View>
      ) : null}

      {joined ? (
        <Text className="mt-2 text-xs text-gray-400">Joined {joined}</Text>
      ) : null}
    </View>
  );
};

const AllUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      setUsers(await getAdminUsers());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load users.");
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

  // How many users each chip will show
  const counts = useMemo(
    () => ({
      all: users.length,
      customer: users.filter((u) => u.role === "customer").length,
      restaurant: users.filter((u) => u.role === "restaurant").length,
    }),
    [users],
  );

  const visible = useMemo(
    () => (filter === "all" ? users : users.filter((u) => u.role === filter)),
    [users, filter],
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const activeLabel = FILTERS.find((f) => f.key === filter)?.label ?? "";

  return (
    <View className="flex-1 bg-gray-50 pt-16">
      {/* Header */}
      <View className="mb-4 flex-row items-center px-4">
        <Pressable
          onPress={goBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="arrow-back" size={22} color="#2563EB" />
        </Pressable>
        <Text className="text-2xl ml-24 font-bold text-blue-900">All Users</Text>
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
        renderItem={({ item }) => <UserCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="py-12 text-center text-gray-400">
            {filter === "all"
              ? "No users yet."
              : `No ${activeLabel.toLowerCase()} found.`}
          </Text>
        }
      />
    </View>
  );
};

export default AllUsers;