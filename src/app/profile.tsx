import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import React, { useCallback, useState } from "react";
import NavigationBar from "./components/navigationBar";
import { getMe, deleteMe } from "../api/authApi";
import { Link, router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";

type Profile = {
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  email?: string;
};

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
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
      await SecureStore.deleteItemAsync("userRole");
      await SecureStore.deleteItemAsync("rememberMePreference");
      router.replace("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleDelete = async () => {
    if (!password) {
      Alert.alert(
        "Password required",
        "Enter your password to delete your account.",
      );
      return;
    }

    try {
      setDeleting(true);

      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        router.replace("/");
        return;
      }

      await deleteMe(token, password);

      await SecureStore.deleteItemAsync("authToken");
      setShowDeleteModal(false);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Could not delete account",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setDeleting(false);
      setPassword("");
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
          <Button onPress={() => setShowDeleteModal(true)}>
            <Text className="text-xl font-bold text-white">
              Delete Account{" "}
            </Text>
          </Button>
        </View>
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}>
          <View className="flex-1 items-center justify-center bg-black/50 px-6">
            <View className="w-full rounded-2xl bg-white p-6">
              <Text className="text-xl font-bold text-blue-600">
                Confirm deletion
              </Text>
              <Text
                className="mt-2 text-gray-600 text-base font-medium
              ">
                Enter your password to permanently delete your account.
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                className=" rounded-full border border-gray-300 px-4 py-3"
              />

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                  }}
                  disabled={deleting}
                  className="flex-1 items-center rounded-full border border-gray-300 bg-blue-400 py-3">
                  <Text className="font-semibold text-white">Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleDelete}
                  disabled={deleting}
                  className="flex-1 items-center rounded-full bg-red-600 py-3">
                  {deleting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-semibold text-white">Delete</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <NavigationBar />
    </View>
  );
};

export default Profile;
