import { View, Text, Pressable, Image, ScrollView } from "react-native";
import React, { useCallback, useState } from "react";
import NavigationBar from "./components/navigationBar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getMe } from "../api/authApi";
import { Link, router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Button, TextInput } from "react-native-paper";

type Profile = {
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  email?: string;
};

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const getStoredToken = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync("authToken");
    } catch (error) {
      console.error("Error reading auth token:", error);
      return null;
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      const token = await getStoredToken();
      if (!token) return;

      const data: any = await getMe(token);
      const u = data?.user ?? data;
      setProfile({
        firstName: u?.firstName,
        lastName: u?.lastName,
        address: u?.address,
        phone: u?.phone,
        email: u?.email,
      });
    } catch (e) {
      console.log("Error loading profile:", e);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

 const handleLogout = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
    router.replace("/");
  } catch (error) {
    console.error("Failed to log out:", error);
  }
};

  return (
    <View className="flex-1 justify-between bg-white ">
      <ScrollView className="px-4 mb-8">
        <View className="flex items-center mt-8 bg-gray-400 rounded-2xl">
          <Image
            source={require("../../assets/images/user.png")}
            className="mt-8 w-28 h-28 rounded-full border-2 border-blue-700"
          />

          <View className="flex items-center mt-6">
            <Text className="text-2xl font-bold text-blue-700">
              {profile?.lastName ?? "there"}
            </Text>

            <View className="flex-row items-center mt-2">
              <Text numberOfLines={3} className=" text-blue-700 text-base">
                {profile?.address || "Address not provided"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex  mt-4 bg-gray-100 rounded-2xl px-4 py-4">
          <Text className="text-blue-600 font-bold text-xl ">
            Personal Information
          </Text>
          <View className="flex mt-8">
            <View className="border-1 bg-gray-300 rounded-full h-12  p-2 flex justify-center">
              <Text className="text-lg ml-4 text-blue-500 font-semibold ">
                {profile?.phone}
              </Text>
            </View>
          </View>
          <View className="flex mt-4">
            <View className="border-1 bg-gray-300 rounded-full h-12  p-2 flex justify-center">
              <Text className="text-lg ml-4 text-blue-500 font-semibold ">
                {profile?.firstName} {profile?.lastName}
              </Text>
            </View>
          </View>
          <View className="flex mt-4">
            <View className="border-1 bg-gray-300 rounded-full h-12  p-2 flex justify-center">
              <Text className="text-lg ml-4 text-blue-500 font-semibold ">
                {profile?.email}
              </Text>
            </View>
          </View>
          <View className="flex mt-4">
            <View className="border-1 bg-gray-300 rounded-xl h-28  p-2 flex ">
              <Text
                numberOfLines={3}
                className="text-lg ml-2  text-blue-500 font-semibold">
                {profile?.address || "Not Provided"}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex  mt-4 bg-gray-100 rounded-2xl px-4 py-4">
          <Text className="text-blue-600 font-bold text-xl ">
            Food Interest
          </Text>
        </View>

        <View className="mt-4 border-1 bg-orange-500 rounded-full justify-center flex ">
          <Button>
            <Text className="text-xl font-bold text-white">Edit profile </Text>
          </Button>
        </View>
        <View className="mt-4 border-1 bg-red-400 rounded-full justify-center flex ">
          <Button onPress={handleLogout}>
            <Text className="text-xl font-bold text-white">Logout </Text>
          </Button>
        </View>
        <View className="mt-4 border-1 bg-red-700 rounded-full justify-center flex ">
          <Button>
            <Text className="text-xl font-bold text-white">Delete Account </Text>
          </Button>
        </View>
      </ScrollView>

      <NavigationBar />
    </View>
  );
};

export default Profile;
