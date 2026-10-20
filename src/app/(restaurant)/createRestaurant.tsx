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

const SEATING_OPTIONS = ["Indoor", "Outdoor", "Smoking"];
const FLOOR_SUGGESTIONS = [
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Rooftop",
];

const formatTime = (d: Date) => {
  const h = d.getHours();
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${period}`;
};

const TimeField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [show, setShow] = useState(false);

  return (
    <View className="flex-1">
      <Text className="mb-1 text-sm font-semibold text-gray-700">
        {label}
        <Text className="text-red-500"> *</Text>
      </Text>
      <Pressable
        onPress={() => setShow(true)}
        className="flex-row items-center justify-between rounded-lg border border-blue-300 px-3 py-3">
        <Text className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Select time"}
        </Text>
        <Ionicons name="time-outline" size={18} color="#2563EB" />
      </Pressable>

      {show && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          onChange={(event, date) => {
            if (Platform.OS !== "ios") setShow(false);
            if (event.type !== "dismissed" && date) onChange(formatTime(date));
          }}
        />
      )}
      {show && Platform.OS === "ios" && (
        <Pressable onPress={() => setShow(false)} className="mt-1 self-end">
          <Text className="font-semibold text-blue-700">Done</Text>
        </Pressable>
      )}
    </View>
  );
};

// Add / remove a list of short strings (floors, image links)
const StringListInput = ({
  label,
  required,
  placeholder,
  items,
  onChange,
  suggestions = [],
  validate,
  keyboardType,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[];
  validate?: (value: string) => string | null;
  keyboardType?: TextInputProps["keyboardType"];
}) => {
  const [text, setText] = useState("");

  const add = (raw: string) => {
    const value = raw.trim();
    if (!value) return;

    const problem = validate?.(value);
    if (problem) {
      Alert.alert("Check this value", problem);
      return;
    }
    if (items.includes(value)) return;

    onChange([...items, value]);
    setText("");
  };

  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-semibold text-gray-700">{label}</Text>

      <View className="flex-row items-center">
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => add(text)}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType={keyboardType}
          returnKeyType="done"
          className="flex-1 rounded-lg border border-blue-300 px-3 py-3 text-base text-gray-900"
        />
        <Pressable
          onPress={() => add(text)}
          accessibilityRole="button"
          accessibilityLabel={`Add ${label}`}
          className="ml-2 h-12 w-12 items-center justify-center rounded-lg bg-blue-700">
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <View className="mt-2 flex-row flex-wrap">
          {suggestions
            .filter((s) => !items.includes(s))
            .map((s) => (
              <Pressable
                key={s}
                onPress={() => add(s)}
                className="mb-2 mr-2 rounded-full border border-gray-300 bg-gray-50 px-3 py-1">
                <Text className="text-sm text-gray-600">+ {s}</Text>
              </Pressable>
            ))}
        </View>
      )}

      {items.length > 0 && (
        <View className="mt-2 flex-row flex-wrap">
          {items.map((item) => (
            <View
              key={item}
              className="mb-2 mr-2 flex-row items-center rounded-full bg-blue-100 px-3 py-1">
              <Text
                numberOfLines={1}
                className="max-w-[220px] text-sm text-blue-800">
                {item}
              </Text>
              <Pressable
                onPress={() => onChange(items.filter((i) => i !== item))}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item}`}
                className="ml-2">
                <Ionicons name="close-circle" size={16} color="#1d4ed8" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

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

  const toggleSeating = (type: string) =>
    setSeatingTypes((cur) =>
      cur.includes(type) ? cur.filter((t) => t !== type) : [...cur, type],
    );

  const validate = () => ({
    name: !form.name.trim() ? "Enter the restaurant name." : "",
    cuisines: !form.cuisines.trim() ? "Enter at least one cuisine." : "",
    city: !form.city.trim() ? "Enter the city." : "",
    province:!form.province.trim() ? "Enter the province." : "",
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
    const problem = validate();
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
          onPress: () => router.replace("/(restaurant)/restaurantDashboard"),
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
          <Text className="mb-3 mt-1 text-sm text-red-600">{errors.province}</Text>
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
          <Text className="mb-3 mt-1 text-sm text-red-600">{errors.address}</Text>
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
          <TimeField
            label="Opens"
            value={form.openingTime}
            onChange={set("openingTime")}
          />
          <TimeField
            label="Closes"
            value={form.closingTime}
            onChange={set("closingTime")}
          />
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
          <Text className="mb-3 mt-1 text-sm text-red-600">{errors.availableSeats}</Text>
        ) : null}
        <StringListInput
          label="Seating types"
          required
          placeholder="Add a seating type, e.g. Terrace"
          items={seatingTypes}
          onChange={setSeatingTypes}
          suggestions={SEATING_OPTIONS}
        />

        <StringListInput
          label="Floors"
          placeholder="Add a floor, e.g. Rooftop"
          items={floors}
          onChange={setFloors}
          suggestions={FLOOR_SUGGESTIONS}
        />
        <Text className="mb-3 mt-6 text-xl font-bold text-blue-700">
          Photos
        </Text>

        <StringListInput
          label="Image links"
          placeholder="https://..."
          items={images}
          onChange={setImages}
          keyboardType="url"
          validate={(v) =>
            /^https?:\/\//i.test(v)
              ? null
              : "Image links must start with http:// or https://"
          }
        />
        <Text className="-mt-2 mb-2 text-xs text-gray-500">
          Use direct links to the picture itself. The first image is shown on
          your restaurant's card.
        </Text>

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          className={`mt-6 items-center rounded-full py-4 ${
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
