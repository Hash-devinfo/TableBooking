import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const Notification = () => {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: "/bookAtable" });
  };
  return (
    <ScrollView className="flex-1 bg-white px-2 pt-16">
      <View className="flex-row justify-between mb-6">
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
      <View className="flex-row justify-between rounded-xl border border-gray-200 p-4 " >
        <View className="flex-1 flex-row gap-4">
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 46, height: 46 }}
          />

          <View className="flex-1">
            <Text className="mb-2 text-lg font-bold">
              Booking Request Received
            </Text>

            <Text className="mb-2 text-base font-normal">
              Your booking request for Khuram ka Kitchen has been received and
              is waiting for confirmation.
            </Text>

            <Pressable>
              <Text className="text-base font-normal text-blue-500">
                Mark as read
              </Text>
            </Pressable>
          </View>
        </View>

        <Text className="ml-3 text-base text-gray-600">8 days ago</Text>
      </View>
    </ScrollView>
  );
};

export default Notification;
