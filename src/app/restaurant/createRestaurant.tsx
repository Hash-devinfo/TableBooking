import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { createRestaurant, resolveImageUrl } from "../../api/restaurantApi";
import ImageUploader from "../components/ImageUploader";

const SEATING_OPTIONS = ["Indoor", "Outdoor", "Smoking"];
const FLOOR_SUGGESTIONS = [
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Rooftop",
];

const emptyForm = {
  name: "",
  cuisines: "",
  city: "",
  province: "",
  address: "",
  phone: "",
  description: "",
  availableSeats: "",
  openingTime: "",
  closingTime: "",
};

export default function CreateRestaurant() {
  const [form, setForm] = useState(emptyForm);
  const [seatingTypes, setSeatingTypes] = useState<string[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const [seatingText, setSeatingText] = useState("");
  const [floorText, setFloorText] = useState("");
  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${period}`;
  };
  const addItem = (
    text: string,
    items: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>,
    clearText: (value: string) => void,
  ) => {
    const value = text.trim();

    if (!value || items.includes(value)) return;

    setItems((current) => [...current, value]);
    clearText("");
  };

  const validate = () => ({
    name: !form.name.trim() ? "Enter the restaurant name." : "",
    cuisines: !form.cuisines.trim() ? "Enter at least one cuisine." : "",
    city: !form.city.trim() ? "Enter the city." : "",
    province: !form.province.trim() ? "Enter the province." : "",
    address: !form.address.trim() ? "Enter the address." : "",
    phone: form.phone.trim().length < 7 ? "Enter a valid phone number." : "",
    openingTime: !form.openingTime ? "Select an opening time." : "",
    closingTime: !form.closingTime ? "Select a closing time." : "",
    availableSeats:
      !Number.isInteger(Number(form.availableSeats)) ||
      Number(form.availableSeats) < 1
        ? "Available seats must be a whole number of at least 1."
        : "",
    seatingTypes:
      seatingTypes.length === 0 ? "Choose at least one seating type." : "",
    floors: floors.length === 0 ? "Add at least one floor." : "",
  });
  const errors = validate();
  const handleSubmit = async () => {
    setShowErrors(true);

    const errors = validate();
    if (Object.values(errors).some(Boolean)) return;

    try {
      setSubmitting(true);

      await createRestaurant({
        name: form.name.trim(),
        cuisines: form.cuisines
          .split(/[,|]/)
          .map((c) => c.trim())
          .filter(Boolean)
          .join(", "),
        city: form.city.trim(),
        province: form.province.trim() || undefined,
        address: form.address.trim(),
        phone: form.phone.trim(),
        description: form.description.trim() || undefined,
        images: images
          .map((u) => resolveImageUrl(u))
          .filter((u): u is string => !!u),
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        floorNumbers: floors,
        availableSeats: Number(form.availableSeats),
        seatingTypes,
      });

      Alert.alert("Restaurant created", "Your restaurant is now live.", [
        {
          text: "OK",
          onPress: () => router.replace("/restaurant/restaurantDashboard"),
        },
      ]);
    } catch (error: unknown) {
      Alert.alert(
        "Could not create restaurant",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-4 mt-16"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}>
        <View className="flex-row items-center">
          <Pressable
            onPress={goBack}
            disabled={!goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Ionicons name="arrow-back" size={22} color="#2563EB" />
          </Pressable>
          <Text className="flex-1 text-2xl font-bold text-blue-900">
            Create Your Restaurant
          </Text>
        </View>
        <Text className="mb-3 mt-6 text-xl font-bold text-blue-700">
          Basic information
        </Text>
        <Text className="mb-1 text-sm font-semibold text-gray-700">
          Restaurant name
        </Text>
        <TextInput
          value={form.name}
          placeholder="e.g. Korean Ramen"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("name")}
        />
        {showErrors && errors.name ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">{errors.name}</Text>
        ) : null}
        <Text className="mb-1 text-sm font-semibold text-gray-700">
          Cuisines
        </Text>
        <TextInput
          value={form.cuisines}
          placeholder="e.g. Korean, Pakistani, Chinies..."
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("cuisines")}
        />
        {showErrors && errors.cuisines ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">
            {errors.cuisines}
          </Text>
        ) : null}
        <Text className="mb-1 text-sm font-semibold text-gray-700">
          Description
        </Text>
        <TextInput
          value={form.description}
          placeholder="Tell customers what makes your restaurant special"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("description")}
          multiline
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />
        <Text className="mb-3 mt-6 text-xl font-bold text-blue-700">
          Location & contact
        </Text>
        <Text className="mb-1 text-sm font-semibold text-gray-700">City</Text>
        <TextInput
          value={form.city}
          placeholder="e.g. Lahore"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("city")}
        />
        {showErrors && errors.city ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">{errors.city}</Text>
        ) : null}
        <Text className="mb-1 text-sm font-semibold text-gray-700">
          Province
        </Text>
        <TextInput
          value={form.province}
          placeholder="e.g. Punjab"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("province")}
        />
        {showErrors && errors.province ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">
            {errors.province}
          </Text>
        ) : null}
        <Text className="mb-1 text-sm font-semibold text-gray-700">
          Address
        </Text>
        <TextInput
          value={form.address}
          placeholder="Street, area"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("address")}
        />
        {showErrors && errors.address ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">
            {errors.address}
          </Text>
        ) : null}
        <Text className="mb-1 text-sm font-semibold text-gray-700">Phone</Text>
        <TextInput
          value={form.phone}
          placeholder="+92 300 1234567"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("phone")}
          keyboardType="phone-pad"
        />
        {showErrors && errors.phone ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">{errors.phone}</Text>
        ) : null}
        <Text className="mb-3 mt-6 text-xl font-bold text-blue-700">
          Opening hours
        </Text>
        <View className="mb-4 flex-row gap-3">
          {/* Opens */}
          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-gray-700">
              Opens<Text className="text-red-500"> *</Text>
            </Text>
            {showErrors && errors.openingTime ? (
              <Text className="mb-3 mt-1 text-sm text-red-600">
                {errors.openingTime}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setShowOpeningPicker(true)}
              className="flex-row items-center justify-between rounded-lg border border-blue-300 px-3 py-3">
              <Text
                className={
                  form.openingTime ? "text-gray-900" : "text-gray-400"
                }>
                {form.openingTime || "Select time"}
              </Text>
              <Ionicons name="time-outline" size={18} color="#2563EB" />
            </Pressable>

            {showOpeningPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={false}
                onChange={(event, date) => {
                  if (Platform.OS !== "ios") setShowOpeningPicker(false);
                  if (event.type !== "dismissed" && date) {
                    set("openingTime")(formatTime(date));
                  }
                }}
              />
            )}

            {showOpeningPicker && Platform.OS === "ios" && (
              <Pressable
                onPress={() => setShowOpeningPicker(false)}
                className="mt-1 self-end">
                <Text className="font-semibold text-blue-700">Done</Text>
              </Pressable>
            )}
          </View>

          {/* Closes */}
          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-gray-700">
              Closes<Text className="text-red-500"> *</Text>
            </Text>
            {showErrors && errors.closingTime ? (
              <Text className="mb-3 mt-1 text-sm text-red-600">
                {errors.closingTime}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setShowClosingPicker(true)}
              className="flex-row items-center justify-between rounded-lg border border-blue-300 px-3 py-3">
              <Text
                className={
                  form.closingTime ? "text-gray-900" : "text-gray-400"
                }>
                {form.closingTime || "Select time"}
              </Text>
              <Ionicons name="time-outline" size={18} color="#2563EB" />
            </Pressable>

            {showClosingPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={false}
                onChange={(event, date) => {
                  if (Platform.OS !== "ios") setShowClosingPicker(false);
                  if (event.type !== "dismissed" && date) {
                    set("closingTime")(formatTime(date));
                  }
                }}
              />
            )}

            {showClosingPicker && Platform.OS === "ios" && (
              <Pressable
                onPress={() => setShowClosingPicker(false)}
                className="mt-1 self-end">
                <Text className="font-semibold text-blue-700">Done</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text className="mb-3 mt-6 text-xl font-bold text-blue-700">
          Seating
        </Text>
        <Text className="mb-1 text-sm font-semibold text-gray-700">
          Total available seats
        </Text>
        <TextInput
          value={form.availableSeats}
          placeholder="e.g. 40"
          placeholderTextColor="#9ca3af"
          className="rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
          onChangeText={set("availableSeats")}
          keyboardType="number-pad"
        />
        {showErrors && errors.availableSeats ? (
          <Text className="mb-3 mt-1 text-sm text-red-600">
            {errors.availableSeats}
          </Text>
        ) : null}
        {/* Seating types */}
        <View className="mb-2 mt-2">
          <Text className="mb-1 text-sm font-semibold text-gray-700">
            Seating types
          </Text>

          <View className="flex-row items-center">
            <TextInput
              value={seatingText}
              onChangeText={setSeatingText}
              onSubmitEditing={() =>
                addItem(
                  seatingText,
                  seatingTypes,
                  setSeatingTypes,
                  setSeatingText,
                )
              }
              placeholder="Add a seating type, e.g. Terrace"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              className="flex-1 rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
            />
            {showErrors && errors.seatingTypes ? (
              <Text className="mb-3 mt-1 text-sm text-red-600">
                {errors.seatingTypes}
              </Text>
            ) : null}
            <Pressable
              onPress={() =>
                addItem(
                  seatingText,
                  seatingTypes,
                  setSeatingTypes,
                  setSeatingText,
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Add seating type"
              className="ml-2 h-12 w-12 items-center justify-center rounded-lg bg-blue-700">
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>

          <View className="mt-2 flex-row flex-wrap">
            {SEATING_OPTIONS.filter(
              (option) => !seatingTypes.includes(option),
            ).map((option) => (
              <Pressable
                key={option}
                onPress={() =>
                  addItem(option, seatingTypes, setSeatingTypes, setSeatingText)
                }
                className="mb-2 mr-2 rounded-full border border-gray-300 bg-gray-50 px-3 py-1">
                <Text className="text-sm text-gray-600">+ {option}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-2 flex-row flex-wrap">
            {seatingTypes.map((type) => (
              <View
                key={type}
                className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-100 px-3 py-1">
                <Text className="text-sm text-blue-800">{type}</Text>
                <Pressable
                  onPress={() =>
                    setSeatingTypes((current) =>
                      current.filter((item) => item !== type),
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${type}`}
                  className="ml-2">
                  <Ionicons name="close-circle" size={16} color="#1d4ed8" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
        {/* Floors */}
        <View className="mb-2">
          <Text className="mb-1 text-sm font-semibold text-gray-700">
            Floors
          </Text>

          <View className="flex-row items-center">
            <TextInput
              value={floorText}
              onChangeText={setFloorText}
              onSubmitEditing={() =>
                addItem(floorText, floors, setFloors, setFloorText)
              }
              placeholder="Add a floor, e.g. Rooftop"
              placeholderTextColor="#9ca3af"
              returnKeyType="done"
              className="flex-1 rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
            />
            {showErrors && errors.floors ? (
              <Text className="mb-3 mt-1 text-sm text-red-600">
                {errors.floors}
              </Text>
            ) : null}
            <Pressable
              onPress={() =>
                addItem(floorText, floors, setFloors, setFloorText)
              }
              accessibilityRole="button"
              accessibilityLabel="Add floor"
              className="ml-2 h-12 w-12 items-center justify-center rounded-lg bg-blue-700">
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>

          <View className="mt-2 flex-row flex-wrap">
            {FLOOR_SUGGESTIONS.filter((floor) => !floors.includes(floor)).map(
              (floor) => (
                <Pressable
                  key={floor}
                  onPress={() =>
                    addItem(floor, floors, setFloors, setFloorText)
                  }
                  className="mb-2 mr-2 rounded-full border border-gray-300 bg-gray-50 px-3 py-1">
                  <Text className="text-sm text-gray-600">+ {floor}</Text>
                </Pressable>
              ),
            )}
          </View>
          <View className="mt-2 flex-row flex-wrap">
            {floors.map((floor) => (
              <View
                key={floor}
                className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-100 px-3 py-1">
                <Text className="text-sm text-blue-800">{floor}</Text>
                <Pressable
                  onPress={() =>
                    setFloors((current) =>
                      current.filter((item) => item !== floor),
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${floor}`}
                  className="ml-2">
                  <Ionicons name="close-circle" size={16} color="#1d4ed8" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
        <Text className="mb-3 mt-6 text-xl font-bold text-blue-700">
          Photos
        </Text>
        <ImageUploader images={images} onChange={setImages} />
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          className={`mt-4 items-center rounded-full py-4 ${
            submitting ? "bg-blue-400" : "bg-blue-700 mb-4"
          }`}>
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-bold text-white">
              Create Restaurant
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
