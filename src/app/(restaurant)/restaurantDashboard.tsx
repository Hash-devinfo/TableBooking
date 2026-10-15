import React, { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import {
  deleteBooking,
  getRestaurantBookings,
  updateBookingStatus,
  type Booking,
} from "../../api/bookingApi";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-blue-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", className: "bg-gray-200 text-gray-600" },
};

const getCustomerName = (customer: Booking["customer"]): string => {
  if (customer && typeof customer === "object") {
    const name = `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim();
    if (name) return name;
  }
  return "Customer";
};

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ActionButton = ({
  label,
  enabledClass,
  disabled,
  onPress,
}: {
  label: string;
  enabledClass: string;
  disabled: boolean;
  onPress: () => void;
}) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    className={`rounded px-3 py-1 ${disabled ? "bg-gray-300" : enabledClass}`}
  >
    <Text
      className={`text-xs font-bold ${disabled ? "text-gray-500" : "text-white"}`}
    >
      {label}
    </Text>
  </Pressable>
);

const RestaurantDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
  try {
    if (!silent) setLoading(true);

    const data = await getRestaurantBookings();
    setBookings(data);
  } catch (error: unknown) {
    console.error("Failed to load restaurant bookings:", error);

    if (!silent) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load customer bookings.";

      Alert.alert("Error", message);
    }
  } finally {
    if (!silent) setLoading(false);
  }
}, []);

  // Load when the screen opens, then check for new requests every 10 seconds
  useFocusEffect(
    useCallback(() => {
      load();
      const interval = setInterval(() => load(true), 10000);
      return () => clearInterval(interval);
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const handleUpdateStatus = async (
    bookingId: string,
    status: "confirmed" | "rejected",
  ) => {
    try {
      setBusyId(bookingId);
      await updateBookingStatus(bookingId, status);

      setBookings((current) =>
        current.map((b) => (b._id === bookingId ? { ...b, status } : b)),
      );
    } catch (error: any) {
      console.error("Failed to update booking status:", error);
      Alert.alert("Error", error?.message || "Could not update booking status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (booking: Booking) => {
    Alert.alert(
      "Delete booking?",
      `This permanently removes ${getCustomerName(booking.customer)}'s booking. This can't be undone.`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyId(booking._id);
              await deleteBooking(booking._id);
              setBookings((current) =>
                current.filter((b) => b._id !== booking._id),
              );
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Could not delete booking.");
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="mb-6 text-center text-2xl font-bold text-blue-900">
        Customer Bookings
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View className="w-[900px] overflow-hidden rounded-lg border border-blue-200">
          <View className="flex-row border-b border-blue-200 bg-blue-50 py-3">
            <Text className="w-[130px] px-2 font-bold text-blue-900">Name</Text>
            <Text className="w-[100px] text-center font-bold text-blue-900">Date</Text>
            <Text className="w-[90px] text-center font-bold text-blue-900">Time</Text>
            <Text className="w-[70px] text-center font-bold text-blue-900">Guests</Text>
            <Text className="w-[100px] text-center font-bold text-blue-900">Seating</Text>
            <Text className="w-[100px] text-center font-bold text-blue-900">Floor</Text>
            <Text className="w-[110px] text-center font-bold text-blue-900">Status</Text>
            <Text className="w-[200px] text-center font-bold text-blue-900">Actions</Text>
          </View>

          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            extraData={busyId}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text className="py-16 text-center text-gray-400">
                No customer bookings found.
              </Text>
            }
            renderItem={({ item, index }) => {
              const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
              const busy = busyId === item._id;
              const canRespond = item.status === "pending";
             const canDelete = item.status === "rejected" || item.status === "cancelled";

              return (
                <View
                  className={`flex-row items-center border-b border-gray-100 py-3 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <Text numberOfLines={1} className="w-[130px] px-2 text-gray-800">
                    {getCustomerName(item.customer)}
                  </Text>
                  <Text className="w-[100px] text-center text-gray-600">
                    {formatDate(item.date)}
                  </Text>
                  <Text className="w-[90px] text-center text-gray-600">{item.time}</Text>
                  <Text className="w-[70px] text-center text-gray-600">{item.guests}</Text>
                  <Text className="w-[100px] text-center text-gray-600">
                    {item.seatingType}
                  </Text>
                  <Text numberOfLines={1} className="w-[100px] text-center text-gray-600">
                    {item.floor}
                  </Text>

                  {/* Status: current status only */}
                  <View className="w-[110px] items-center">
                    <Text
                      className={`rounded-full px-2 py-1 text-xs font-bold ${style.className}`}
                    >
                      {style.label}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View className="w-[200px] items-center">
                    {busy ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <View className="flex gap-2">
                        <ActionButton
                          label="Confirm"
                          enabledClass="bg-blue-600"
                          disabled={!canRespond}
                          onPress={() => handleUpdateStatus(item._id, "confirmed")}
                        />
                        <ActionButton
                          label="Reject"
                          enabledClass="bg-orange-500"
                          disabled={!canRespond}
                          onPress={() => handleUpdateStatus(item._id, "rejected")}
                        />
                        <ActionButton
                          label="Delete"
                          enabledClass="bg-red-600"
                          disabled={!canDelete}
                          onPress={() => handleDelete(item)}
                        />
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default RestaurantDashboard;