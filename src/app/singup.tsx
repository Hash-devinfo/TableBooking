import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { signupUser } from "../api/authApi";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useState } from "react";

type Role = "customer" | "restaurant" | "admin";

type Errors = {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  dob?: boolean;
  phone?: boolean;
  password?: boolean; 
};

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [errors, setErrors] = useState<Errors>({});

  const [loading, setLoading] = useState(false);

  const formattedDob = dob
    ? `${String(dob.getDate()).padStart(2, "0")}/${String(
        dob.getMonth() + 1,
      ).padStart(2, "0")}/${dob.getFullYear()}`
    : "";

  const onDateChange = (event: any, selectedDate: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    setDob(selectedDate);
  };

  const onDatePickerDismiss = () => {
    setShowDatePicker(false);
  };

  const handleSignup = async () => {
    const newErrors: Errors = {};

    if (!firstName) newErrors.firstName = true;
    if (!lastName) newErrors.lastName = true;
    if (!email) newErrors.email = true;
    if (!dob) newErrors.dob = true;
    if (!phone) newErrors.phone = true;
    if (!password) newErrors.password = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert(
        "Missing or Invalid Fields",
        "Please check the highlighted fields.",
      );
      return;
    }

    try {
      setLoading(true);

      await signupUser({
        firstName,
        lastName,
        email,
        dob: dob!.toISOString(),
        phone,
        role,
        password,
      });

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/",
              params: {
                email,
                password,
              },
            }),
        },
      ]);
    } catch (error) {
      console.error("Signup error:", error);

      Alert.alert(
        "Signup Failed",
        error instanceof Error ? error.message : "Something went wrong.",
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
      style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
                <Ionicons name="arrow-back" size={24} color="black" />
              </Pressable>
            </Link>

            <View className="mt-2 mb-6">
              <Text className="text-4xl font-bold mb-5 text-black">
                Sign up
              </Text>

              <View className="flex-row items-center">
                <Text className="text-gray-400">Already have an account? </Text>

                <Link href="/" asChild>
                  <Pressable>
                    <Text className="text-blue-400 font-medium">Log In</Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            <Text className="text-sm font-semibold mb-1 text-gray-400">
              First Name
            </Text>

            <TextInput
              placeholder="First Name"
              placeholderTextColor="#9ca3af"
              value={firstName}
              onChangeText={setFirstName}
              className={`border rounded-lg px-4 py-3 mb-4 text-black ${
                errors.firstName ? "border-red-500" : "border-gray-500"
              }`}
            />
            <Text className="text-sm font-semibold mb-1 text-gray-400">
              Last Name
            </Text>

            <TextInput
              placeholder="Last Name"
              placeholderTextColor="#9ca3af"
              value={lastName}
              onChangeText={setLastName}
              className={`border rounded-lg px-4 py-3 mb-4 text-black ${
                errors.lastName ? "border-red-500" : "border-gray-500"
              }`}
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
              className={`border rounded-lg px-4 py-3 mb-4 text-black ${
                errors.email ? "border-red-500" : "border-gray-500"
              }`}
            />

            <Text className="text-sm font-semibold mb-1 text-gray-400">
              DoB
            </Text>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              className={`border rounded-lg px-4 py-3 mb-4 ${
                errors.dob ? "border-red-500" : "border-gray-500"
              }`}>
              <Text className={dob ? "text-black" : "text-gray-400"}>
                {dob ? formattedDob : "DD/MM/YYYY"}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onValueChange={onDateChange}
                onDismiss={onDatePickerDismiss}
              />
            )}

            <Text className="text-sm font-semibold mb-1 text-gray-400">
              Phone No
            </Text>

            <TextInput
              placeholder="Enter your phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
              className={`border rounded-lg px-4 py-3 mb-4 text-black ${
                errors.phone ? "border-red-500" : "border-gray-500"
              }`}
            />

            <Text className="text-sm font-semibold mb-2 text-gray-400">
              Register As
            </Text>

            <View className="border border-gray-500 rounded-lg mb-4 overflow-hidden">
              <Picker
                selectedValue={role}
                onValueChange={(value) => {
                  setRole(value as Role);
                }}>
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Restaurant" value="restaurant" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
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
              className={`border rounded-lg px-4 py-3 text-black ${
                errors.password ? "border-red-500" : "border-gray-500"
              }`}
            />

            <Pressable
              onPress={handleSignup}
              disabled={loading}
              className={`py-3 rounded-lg items-center mb-6 mt-4 ${
                loading ? "bg-gray-400" : "bg-blue-600"
              }`}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Register</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
