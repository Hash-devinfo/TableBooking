import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router,useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function App() {
  const handleLogin = () => {
    router.replace("/home");
  };

  const [rememberMe, setRememberMe] = useState(false);
  const { email: signupEmail, password: signupPassword } =
  useLocalSearchParams();

const [email, setEmail] = useState(
  typeof signupEmail === "string" ? signupEmail : ""
);

const [password, setPassword] = useState(
  typeof signupPassword === "string" ? signupPassword : ""
);
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
          <View className="items-center mt-2 mb-6">
            <Text className="text-4xl font-bold mb-5 text-black">Login</Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-gray-400">Don't have an account? </Text>
              <Link href="/singup" asChild>
                <Pressable>
                  <Text className="text-blue-400 font-medium">Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Email
          </Text>
          <TextInput
           value={email}
  onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            className="border border-gray-500 rounded-lg px-4 py-3 mb-4 text-black"
          />
          <Text className="text-sm font-semibold mb-1 text-gray-400">
            Password
          </Text>
          <TextInput
          value={password}
  onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            className="border border-gray-500 rounded-lg px-4 py-3 text-black"
          />
          <View className="flex-row justify-between ">
            <Pressable
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row mt-2"
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={20}
                color={rememberMe ? "blue" : "gray"}
              />
              <Text className="ml-2 text-gray-400">Remember me</Text>
            </Pressable>
            <Link href="/forgotpassword" asChild>
              <Pressable className="self-end mt-2 mb-6">
                <Text className="text-blue-400 text-base">
                  Forgot Password?
                </Text>
              </Pressable>
            </Link>
          </View>
          <Pressable
            onPress={handleLogin}
            className="bg-blue-600 py-3 rounded-lg items-center mb-6"
          >
            <Text className="text-white font-semibold">Log In</Text>
          </Pressable>
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="mx-3 text-gray-400 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>
          <Pressable className="border border-gray-500 rounded-lg py-3 items-center mb-3 flex-row justify-center">
            <FontAwesome name="google" size={20} color="#4B4B4B" />
            <Text className="font-bold ml-4 text-black">
              Continue with Google
            </Text>
          </Pressable>
          <Pressable className="border border-gray-500 rounded-lg py-3 items-center mb-3 flex-row justify-center">
            <FontAwesome name="facebook" size={20} color="#0000FF" />
            <Text className="font-bold ml-4 text-black">
              Continue with Facebook
            </Text>
          </Pressable>
         
        </View>
      </View>
    </LinearGradient>
  );
}
