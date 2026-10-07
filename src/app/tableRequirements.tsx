import {
  View,
  Text,
  Platform,
  Pressable,
  Alert,
  ImageBackground,
  ScrollView,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Button, RadioButton } from "react-native-paper";
import { router, Link } from "expo-router";
import React from "react";

const TableRequirements = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [area, setArea] = useState("Indoor");
  const [specialRequest, setSpecialRequest] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("First Floor");
  const toggleFavorite = () => {
    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);
    Alert.alert(
      nextIsFavorite ? "Added to favorites" : "Removed from favorites",
      nextIsFavorite
        ? "Added to your favorites."
        : "Removed from your favorites.",
    );
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const timeSlots = Array.from({ length: 30 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  });

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const handleContinue = () => {
    if (!selectedTime) {
      Alert.alert("Select a time", "Please choose a time first.");
      return;
    }

    router.push({
      pathname: "/bookingConfirmation",
      params: {
        date: date.toISOString(),
        time: selectedTime,
        guests: String(guestCount),
        seatingType: area,
        floor: String(selectedFloor),
        request: specialRequest,
      },
    });
  };

  return (
    <View className="flex-1 bg-white px-2 py-4">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        <View className="flex-row justify-between  mb-4">
          <Link href={"/bookAtable"} asChild>
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
        <View className="flex-row  items-start">
          <ImageBackground
            source={require("../../assets/images/restaurantimages/download.jpeg")}
            resizeMode="cover"
            className="w-40 h-40 rounded-l-lg overflow-hidden">
            <View className="flex-1 justify-end items-end">
              <Text className="bg-orange-500 text-white px-2 py-1 rounded-tl-lg font-semibold text-xs">
                8.4KM
              </Text>
            </View>
          </ImageBackground>

          <View className="px-3 flex-1 gap-3">
            <Text numberOfLines={2} className="font-bold text-xl text-black">
              Basilico by Sara - Lake City
            </Text>
            <Text numberOfLines={1} className="text-gray-700 font-normal">
              Italian
            </Text>
            <View className="flex-row gap-1 items-center">
              {Array.from({ length: 5 }, (_, index) => (
                <Ionicons
                  key={index}
                  name="star-outline"
                  size={20}
                  color="blue"
                />
              ))}
              <Text className="px-2 font-semibold text-blue-700">0.0</Text>
              <Text className="text-gray-500">(0)</Text>
            </View>
            <Text className="text-gray-600">Lahore, Punjab</Text>
          </View>

          <Pressable
            onPress={toggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className="h-11 w-11 rounded-full items-center justify-center">
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color="gray"
            />
          </Pressable>
        </View>

        <View className="h-px bg-blue-400 mb-2 mt-2" />

        <View className="mt-4 ">
          <Text className="text-blue-600 font-bold text-xl">Select Date:</Text>

          <Pressable
            onPress={() => setShowPicker(true)}
            accessibilityRole="button"
            className="mb-4 mt-2 flex-row items-center justify-between rounded-lg border border-blue-500 px-4 py-3">
            <Text className="text-gray-700">{date.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="blue" />
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={onChange}
            />
          )}
        </View>
        <Text className="text-blue-600 font-bold text-xl">Select Timings:</Text>
        <View className="h-[250px]">
          <ScrollView nestedScrollEnabled>
            <View className="mt-3 mb- px-4">
              {Array.from(
                { length: Math.ceil(timeSlots.length / 3) },
                (_, rowIndex) => (
                  <View key={rowIndex} className="mb-3 flex-row gap-3">
                    {timeSlots
                      .slice(rowIndex * 3, rowIndex * 3 + 3)
                      .map((time) => (
                        <Pressable
                          key={time}
                          onPress={() => setSelectedTime(time)}
                          className={`flex-1 items-center rounded-full border px-2 py-2 ${
                            selectedTime === time
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-200 bg-gray-100"
                          }`}>
                          <Text
                            numberOfLines={1}
                            className={
                              selectedTime === time
                                ? "text-sm text-white"
                                : "text-sm text-gray-700"
                            }>
                            {time}
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                ),
              )}
            </View>
          </ScrollView>
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-blue-600 font-bold text-xl">
            Number of Seats
          </Text>
          <Text className="text-blue-600 font-bold text-sm">
            Avaliable 50 Seats
          </Text>
        </View>
        <View className="flex-row items-center gap-16 mt-2">
          <Pressable
            onPress={() => setGuestCount((count) => Math.max(1, count - 1))}
            accessibilityRole="button"
            accessibilityLabel="Decrease guest count"
            className="h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-300">
            <Ionicons name="remove" size={24} color="#333" />
          </Pressable>

          <Text className="text-3xl font-semibold">{guestCount}</Text>

          <Pressable
            onPress={() => {
              if (!selectedTime) {
                Alert.alert("Select a time", "Please choose a time first.");
                return;
              }

              setGuestCount((count) => count + 1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Increase guest count"
            className="h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-blue-500">
            <Ionicons name="add" size={24} color="#333" />
          </Pressable>
        </View>

        <View className="mt-2">
          <Text className="text-blue-600 font-bold text-xl mb-2">
            Seating type
          </Text>
          <RadioButton.Group onValueChange={setArea} value={area}>
            <View className="gap-2">
              {[
                { value: "Indoor", label: "Indoor" },
                { value: "Outdoor", label: "Outdoor" },
                { value: "Smoking", label: "Smoking" },
              ].map((option) => {
                const selected = area === option.value;

                return (
                  <View
                    key={option.value}
                    className={`flex-row items-center rounded-lg border-2 ${
                      selected ? "border-blue-400" : "border-gray-300"
                    }`}>
                    <RadioButton value={option.value} />
                    <Text>{option.label}</Text>
                  </View>
                );
              })}
            </View>
          </RadioButton.Group>
          <View className="mt-2">
            <Text className="text-blue-600 font-bold text-xl mb-2">
              Select Floor
            </Text>
            <View className="flex-row justify-between">
              {["First Floor", "Second Floor", "Third Floor"].map((floor) => {
                const selected = selectedFloor === floor;

                return (
                  <Pressable
                    key={floor}
                    onPress={() => setSelectedFloor(floor)}
                    className={`items-center justify-center rounded-full border-2 px-3 py-2 ${
                      selected
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }`}>
                    <Text className={selected ? "text-white" : "text-gray-700"}>
                      {floor}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="mt-2">
            <Text className="text-blue-600 font-bold text-xl mb-2">
              Special Request
            </Text>
            <TextInput
              value={specialRequest}
              onChangeText={setSpecialRequest}
              placeholder="Special Request (Optional)"
              multiline
              textAlignVertical="top"
              className="h-[120px] rounded-lg border-2 border-blue-400 px-4 py-3 mb-8"
            />
          </View>
        </View>
      </ScrollView>
      <View className="px-4 pb-6 pt-3 bg-white">
        <Button mode="contained" onPress={handleContinue}>
          Continue
        </Button>
      </View>
    </View>
  );
};

export default TableRequirements;
