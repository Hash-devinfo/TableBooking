import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { signupUser } from "../api/authApi";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useState } from "react";


const API_URL = "http://10.0.2.2:3000/api";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
  if (!name || !email || !dob || !phone || !password) {
    Alert.alert("Missing Fields", "Please fill in all fields.");
    return;
  }

  try {
    setLoading(true);

    await signupUser({
      name,
      email,
      dob,
      phone,
      role,
      password,
    });

    Alert.alert(
      "Success",
      "Account created successfully!",
      [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]
    );

  } catch (error) {

    console.error("Signup error:", error);

    Alert.alert(
      "Signup Failed",
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );

  } finally {
  
    setLoading(false);
  }
};

  return (
    <LinearGradient
      colors={["#2F6FED", "#1FD1D1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
    
    showsVerticalScrollIndicator={false}
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

          <Link href="/" asChild>
            <Pressable>
              <Ionicons
                name="arrow-back"
                size={24}
                color="black"
              />
            </Pressable>
          </Link>

          <View className="mt-2 mb-6">
            <Text className="text-4xl font-bold mb-5 text-black">
              Sign up
            </Text>

            <View className="flex-row items-center">
              <Text className="text-gray-400">
                Already have an account?{" "}
              </Text>

              <Link href="/" asChild>
                <Pressable>
                  <Text className="text-blue-400 font-medium">
                    Log In
                  </Text>
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
            value={name}
            onChangeText={setName}
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-black"
          />

        
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Email
          </Text>

          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-black"
          />

        
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            DoB
          </Text>

          <TextInput
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={dob}
            onChangeText={setDob}
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-black"
          />

          
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Phone No
          </Text>

          <TextInput
            placeholder="Enter your phone number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-black"
          />

         
          <Text className="text-sm font-semibold mb-2 text-gray-400">
            Register As
          </Text>

          <View className="flex-row mb-4">

            
            <Pressable
              onPress={() => setRole("customer")}
              className={`flex-1 py-3 mr-2 rounded-lg border ${
                role === "customer"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-400"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  role === "customer"
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Customer
              </Text>
            </Pressable>

            
            <Pressable
              onPress={() => setRole("restaurant")}
              className={`flex-1 py-3 ml-2 rounded-lg border ${
                role === "restaurant"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-400"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  role === "restaurant"
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Restaurant
              </Text>
            </Pressable>

          </View>

          {/* Password */}
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Password
          </Text>

          <TextInput
            placeholder="********"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="border border-gray-500 rounded-lg px-4 py-3 text-black"
          />

          
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            className={`py-3 rounded-lg items-center mb-6 mt-4 ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                Register
              </Text>
            )}
          </Pressable>

        </View>
      </View>
      </ScrollView>
    </LinearGradient>
  );
}