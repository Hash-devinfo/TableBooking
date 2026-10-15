import { View } from "react-native";
import { Slot } from "expo-router";
import RestaurantNavigationBar from "../components/resaturantNavigationBar";

export default function RestaurantLayout() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <Slot />
      </View>
      <RestaurantNavigationBar />
    </View>
  );
}