import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import RestaurantNavigationBar from "../components/resaturantNavigationBar";

// Screens that should hide the bottom bar (paths have no "(group)" part)
const HIDE_BAR_ON = ["/createRestaurant"];

export default function RestaurantLayout() {
  const pathname = usePathname();
  const hideBar = HIDE_BAR_ON.includes(pathname);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <Slot />
      </View>
      {!hideBar && <RestaurantNavigationBar />}
    </View>
  );
}