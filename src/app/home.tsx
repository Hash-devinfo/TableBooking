import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  const backPage = () => {
    router.replace("/");
  };
  return (
    <View className="flex-1 flex-row items-center justify-center">
      <Pressable onPress={backPage}>
        <Ionicons name="arrow-back" size={24} color="black" />{" "}
      </Pressable>
      <Text className="text-2xl font-bold">Home</Text>
    </View>
  );
}
