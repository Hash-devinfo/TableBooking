import { Ionicons,MaterialCommunityIcons  } from "@expo/vector-icons";
import { router, Link } from "expo-router";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { Searchbar, Button } from 'react-native-paper';
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
export default function Home() {
  const [search, setSearch]=useState("")

  const handletablebookingpage = () => {
    router.replace("/bookAtable");
  };
  const handleLogout = async () => {
  try {
    await SecureStore.deleteItemAsync("authToken");
  } finally {
    router.replace("/"); // Use your login screen's actual route.
  }
};
  return (
    <View className="flex-1 bg-white px-2 pt-2">
      <View className="flex-row items-start">
        <Image
          source={require("../../assets/images/user.png")}
          className="w-20 h-20 rounded-full border-2 border-blue-700"
        />

        <View className="flex-1 ml-2">
          <Text className="text-2xl font-bold text-blue-700">
            Hi, Muhammad
          </Text>

          <View className="flex-row items-center">
            <Text
  numberOfLines={3}
  className="flex-1 text-blue-700 text-base"
>
  8, Iqbal Avenue Cooperative Housing Society - Phase I
  Iqbal Avenue Housing Society
  Lahore, Pakistan
</Text>
            <Pressable>

            <MaterialCommunityIcons name="refresh" size={20} color="blue" />
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center ml-2">
          <Link href="/favorite" asChild>
          <Pressable className="bg-blue-700 w-11 h-11 rounded-full items-center justify-center mr-2">
            <Ionicons name="heart" size={20} color="white" />
          </Pressable>
          </Link>
           <Link href="/notification" asChild>
          <Pressable className="bg-blue-700 w-11 h-11 rounded-full items-center justify-center">
            <Ionicons name="notifications" size={20} color="white" />
          </Pressable>
          </Link>
        </View>
      </View>

      <View className="flex-row items-center rounded-full mt-4">
        <Searchbar
        value={search}
        onChangeText={setSearch}
      placeholder="Search"
      
    />
      </View>
      <View className="flex-row items-center rounded-full mt-4 justify-center">
        <Button icon="" mode="contained" onPress={handletablebookingpage}>
    Book a table
  </Button>
 <Button icon="" mode="contained" onPress={handleLogout}>
    LogOut
  </Button>
  
      </View>
    </View>
  );
}