import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Notification = () => {

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else
      router.replace({ pathname: "/bookAtable", params: { id: restaurantId } });
  };
  return (
    <ScrollView className="flex-1 bg-white px-2 pt-16">
      

      <View className="flex-row justify-between mb-4">
          <Pressable onPress={goBack} className="w-12 h-12">
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </Pressable>
          <Text className="text-blue-600 font-bold text-3xl">Notifications</Text>
          <Pressable
            onPress={() => router.push("/notification")}
            className="w-12 h-12">
            <Ionicons name="notifications" size={26} color="#2563EB" />
          </Pressable>
        </View>
      
    </ScrollView>
  );
};

export default Notification;
