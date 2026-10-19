// src/app/(auth)/forgot-password.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function ForgotPassword() {
  return (
    <LinearGradient
      colors={["#2F6FED", "#1FD1D1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}>
      <View className="flex px-8 pt-12">
        <View className="flex-row justify-center items-center mb-10">
          <Image
            source={require("../../assets/images/logo.png")}
            className="w-8 h-8 mr-2"
          />
          <Text className="text-lg font-semibold text-white">
            Booking Tables
          </Text>
        </View>
        <View className="justify-center bg-white rounded-2xl p-6">
          <Link href="/">
            <Ionicons name="arrow-back" size={24} color="black" />{" "}
          </Link>
          <View className="flex px-8 py-4 pt-14 bg-white">
            <Text className="text-4xl font-bold mb-5">Reset Password</Text>
            <Text className="text-gray-500 mb-10">
              Enter your email and we'll send you a link to reset your password
            </Text>

            <Text className="text-sm font-semibold mb-2">Email</Text>
            <TextInput
              placeholder="you@example.com"
              keyboardType="email-address"
              className="border border-gray-400 rounded-lg px-4 py-3 mb-8"
            />

            <Pressable className="bg-blue-600 py-3 rounded-lg items-center">
              <Text className="text-white font-semibold">Send Reset Link</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
