import { View, Text, Pressable, Image, Alert, ScrollView } from "react-native";
import React, { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Checkbox, Button } from "react-native-paper";
import { createBooking } from "@/api/bookingApi";
const BookingConfirmation = () => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { date, time, guests, seatingType, request, floor } =
    useLocalSearchParams<{
      date: string;
      time: string;
      guests: string;
      seatingType: string;
      request: string;
      floor: string;
    }>();

  const selectedDate = date ? new Date(date) : null;
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No date selected";

  const handleConfirmBooking = async () => {
    if (!selectedDate || !time || !guests || !seatingType) {
      Alert.alert(
        "Missing Information",
        "Please go back and complete all booking details.",
      );
      return;
    }

    try {
      setLoading(true);

      const data = await createBooking({
        date: selectedDate.toISOString(),
        time,
        guests: Number(guests),
        seatingType,
        floor,
        request: request || undefined,
      });

      Alert.alert(
        "Booking Confirmed",
        "Your table has been booked successfully!",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/bookingDetails",
                params: { id: data.booking._id },
              }),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View className=" flex-1 bg-white px-2 py-4">
      <View className="flex-row justify-between  mb-4">
        <Link href={"/tableRequirements"} asChild>
          <Pressable className=" w-12 h-12 ">
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </Pressable>
        </Link>
        <Text className="text-blue-600 font-bold text-3xl">Book a Table</Text>
        <Link href={"/notification"} asChild>
          <Pressable className="w-12 h-12  ">
            <Ionicons name="notifications" size={26} color="#2563EB" />
          </Pressable>
        </Link>
      </View>
      <View className="flex  px-2">
        <View className="bg-gray-100 px-4 py-4  rounded-lg">
          <View className="flex-row ">
            <Image
              source={require("../../assets/images/restaurantimages/download.jpeg")}
              resizeMode="cover"
              className="h-28 w-28 rounded-lg"
            />

            <View className="flex-1 justify-between px-2">
              <Text
                numberOfLines={2}
                className="text-2xl font-bold text-blue-600">
                Basilico by Sara - Lake City
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#2563EB" />
                <Text>Lahore, Punjab</Text>
              </View>
            </View>
          </View>
          <View className="h-px bg-blue-400 mb-2 mt-4" />
          <View className="flex-row mt-4 items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <Ionicons name="calendar-outline" size={24} color="#2563EB" />
            </View>

            <View className="px-2">
              <Text className="text-lg">Date</Text>
              <Text
                className="text-lg font-bold text-blue-500"
                style={{ color: "#3b82f6" }}>
                {formattedDate}
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <Ionicons name="time-outline" size={24} color="#2563EB" />
            </View>

            <View className="px-2">
              <Text className="text-lg">Time</Text>
              <Text
                className="text-lg font-bold text-blue-500"
                style={{ color: "#3b82f6" }}>
                {time || "No time selected"}
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <Ionicons name="people" size={24} color="#2563EB" />
            </View>

            <View className="px-2">
              <Text className="text-lg">Seat</Text>
              <Text
                className="text-lg font-bold  text-blue-500 "
                style={{ color: "#3b82f6" }}>
                {guests || "No guest"}
                &nbsp; - Person
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <MaterialCommunityIcons
                name="floor-plan"
                size={24}
                color="#2563EB"
              />
            </View>

            <View className="px-2">
              <Text className="text-lg">Floor</Text>
              <Text
                className="text-lg font-bold text-blue-500"
                style={{ color: "#3b82f6" }}>
                {floor || "NOT Selected"}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <Ionicons name="restaurant" size={24} color="#2563EB" />
            </View>

            <View className="px-2">
              <Text className="text-lg">Type</Text>
              <Text
                className="text-lg font-bold text-blue-500"
                style={{ color: "#3b82f6" }}>
                {seatingType || "NOT Selected"}
              </Text>
            </View>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-4  border border-blue-500 rounded-lg"
            style={{ height: 50 }}>
            <Text className="font-semibold px-2 text-blue-500">
              {request || "No special Requirements"}
            </Text>
          </ScrollView>
        </View>
        <Pressable
          onPress={() => setAgreed((checked) => !checked)}
          className="mb-4 flex-row items-center mt-4"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}>
          <Checkbox
            status={agreed ? "checked" : "unchecked"}
            onPress={() => setAgreed((checked) => !checked)}
          />
          <Text className="flex-1 text-blue-700">
            I agree to the terms and cancellation policy
          </Text>
        </Pressable>
        <Button
          mode="contained"
          disabled={!agreed || loading}
          loading={loading}
          onPress={handleConfirmBooking}>
          Confirm Booking
        </Button>
      </View>
    </View>
  );
};

export default BookingConfirmation;
