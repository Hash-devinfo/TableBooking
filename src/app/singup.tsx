import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Image, Pressable, Text, TextInput, View } from "react-native";
export default function SingUp() {
  return (
    <LinearGradient
      colors={["#2F6FED", "#1FD1D1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
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
          <View className=" mt-2 mb-6">
            <Text className="text-4xl font-bold mb-5 text-black">Sing up</Text>
            <View className="flex-row items-center ">
              <Text className="text-gray-400">Already have an account? </Text>
              <Link href="/" asChild>
                <Pressable>
                  <Text className="text-blue-400 font-medium">LogIn</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Full Name
          </Text>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-white"
          />
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Email
          </Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-white"
          />
          <Text className="text-sm font-semibold mb-1 text-gray-400">DoB</Text>
          <TextInput
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-white"
          />
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Phone No
          </Text>
          <TextInput
            placeholder="Enter your phone number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            className="border border-gray-500 rounded-lg px-4 py-3 text-white"
          />
          <Text className="text-sm font-semibold mb-1 mt-1 text-gray-400">
            Password
          </Text>
          <TextInput
            placeholder="********"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            className="border border-gray-500 rounded-lg px-4 py-3 text-white"
          />
          <Pressable className="bg-blue-600 py-3 rounded-lg items-center mb-6 mt-4">
            <Text className="text-white font-semibold">Register</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
