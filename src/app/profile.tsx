import { View } from "react-native";
import ProfileContent from "./components/ProfileContent";
import NavigationBar from "./components/navigationBar";

export default function Profile() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <ProfileContent />
      </View>
      <NavigationBar />
    </View>
  );
}