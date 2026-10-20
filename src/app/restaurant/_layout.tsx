import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import RestaurantNavigationBar from "../components/resaturantNavigationBar";

export default function RestaurantLayout() {
  const pathname = usePathname().replace(/\/$/, "");
  const hideBar = pathname.split("/").pop() === "createRestaurant";

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <Slot />
      </View>
      {!hideBar && <RestaurantNavigationBar />}
    </View>
  );
}