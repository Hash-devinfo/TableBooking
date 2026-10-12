import { useState, useEffect } from "react";
import { Button } from "react-native-paper";
import {
  Text,
  ImageBackground,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getRestaurantById, Restaurant } from "../api/restaurantApi";
import { toggleFavorite } from "../api/favoritesApi";

const TABS = ["Overview", "Menu", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function BookATable() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // Fetch single restaurant details by ID
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        if (!id) {
          Alert.alert("Error", "No restaurant ID provided");
          return;
        }
        const data = await getRestaurantById(id);
        setRestaurant(data);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        Alert.alert("Error", "Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  // Image Slideshow Timer
  useEffect(() => {
    if (!restaurant?.images || restaurant.images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % restaurant.images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [restaurant]);

  // Toggle Favorite API Handler
  const handleToggleFavorite = async () => {
    if (!id) return;
    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);

    try {
      const token = "token";
      await toggleFavorite(token, id);
      Alert.alert(
        nextIsFavorite ? "Added to favorites" : "Removed from favorites",
        nextIsFavorite
          ? "Added to your favorites."
          : "Removed from your favorites.",
      );
    } catch (error) {
      // Revert UI on failure
      setIsFavorite(!nextIsFavorite);
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  const backPage = () => {
    router.replace("/home");
  };

  const navigateToBooking = () => {
    router.push({
      pathname: "/tableRequirements",
      params: { restaurantId: id },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const imagesList =
    restaurant?.images && restaurant.images.length > 0
      ? restaurant.images
      : ["https://via.placeholder.com/300"];

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <ImageBackground
          source={{ uri: imagesList[currentPhotoIndex] }}
          resizeMode="cover"
          className="w-full h-72 justify-between">
          <View className="flex-row justify-between px-4 pt-4">
            <Pressable
              onPress={backPage}
              className="bg-blue-700 w-11 h-11 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>

            <Pressable
              onPress={handleToggleFavorite}
              accessibilityRole="button"
              className="bg-blue-700 w-11 h-11 rounded-full items-center justify-center">
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color="white"
              />
            </Pressable>
          </View>

          <View className="mb-4 p-4">
            <Text className="text-2xl font-bold text-white">
              {restaurant?.name || "Restaurant Name"}
            </Text>
            <Text className="text-base text-white">
              {restaurant?.cuisines || "Cuisines"}
            </Text>
          </View>
        </ImageBackground>

        {/* Content Details */}
        <View className="flex-1 -mt-6 bg-white rounded-t-3xl px-4 pt-6">
          <View className="flex-row justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="star" size={24} color="#facc15" />
              <Text className="font-semibold">
                {restaurant?.rating ? restaurant.rating.toFixed(1) : "0.0"}
              </Text>
              <Text className="text-gray-600">
                ({restaurant?.reviewCount || 0} Reviews)
              </Text>
            </View>

            <View>
              <View className="flex-row items-center justify-center gap-1">
                <Ionicons name="location-outline" size={18} color="blue" />
                <Text className="text-gray-600">
                  {restaurant?.city || "Lahore"}
                </Text>
              </View>
              <Text className="mt-2 text-gray-600">
                {restaurant?.province || "Punjab"}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between mt-6">
            <Pressable className="flex-row border-2 border-blue-700 rounded-full items-center justify-center w-[100px] py-2 gap-2">
              <Ionicons name="call" size={18} color="blue" />
              <Text className="text-blue-700 font-medium">Call</Text>
            </Pressable>
            <Pressable className="flex-row border-2 border-blue-700 rounded-full items-center justify-center w-[100px] py-2 gap-2">
              <Ionicons name="map" size={18} color="blue" />
              <Text className="text-blue-700 font-medium">Map</Text>
            </Pressable>
            <Pressable className="flex-row border-2 border-blue-700 rounded-full items-center justify-center w-[100px] py-2 gap-2">
              <Ionicons name="share-social" size={18} color="blue" />
              <Text className="text-blue-700 font-medium">Share</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-6 mt-6 border-b border-gray-200">
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="pb-2">
                <Text
                  className={
                    activeTab === tab
                      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-2"
                      : "text-gray-500 font-medium"
                  }>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "Overview" ? (
            <>
              {/* Photo Thumbnails */}
              <View className="flex-row gap-3 mt-6">
                {imagesList.slice(0, 3).map((photoUri, index) => (
                  <Image
                    key={index}
                    source={{ uri: photoUri }}
                    className="w-24 h-24 rounded-xl"
                  />
                ))}
              </View>

              {/* About Us */}
              <Text className="text-xl font-bold text-blue-700 mt-6">
                About Us
              </Text>
              <View>
                <Text
                  className="text-gray-600 mt-2 leading-5"
                  numberOfLines={isAboutExpanded ? undefined : 3}>
                  {restaurant?.description ||
                    "No description provided for this restaurant."}
                </Text>
                <Pressable
                  onPress={() => setIsAboutExpanded((expanded) => !expanded)}
                  className="self-start mt-1">
                  <Text className="text-blue-700 font-medium">
                    {isAboutExpanded ? "Read less" : "Read more"}
                  </Text>
                </Pressable>
              </View>

              {/* Timings */}
              <Text className="text-xl font-bold text-blue-700 mt-6">
                Timings
              </Text>
              <View className="flex-row items-center gap-3 mt-3 mb-6">
                <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
                  <Ionicons name="time-outline" size={16} color="blue" />
                  <Text className="text-gray-700 text-sm">
                    Open: {restaurant?.openingTime || "9:00 AM"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
                  <Ionicons name="time-outline" size={16} color="blue" />
                  <Text className="text-gray-700 text-sm">
                    Close: {restaurant?.closingTime || "11:45 PM"}
                  </Text>
                </View>
              </View>

              {/* Available Seating Types */}
              <Text className="text-xl font-bold text-blue-700 mt-6">
                Available Seating
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-3 mb-6">
                {(restaurant?.seatingTypes || ["Indoor", "Outdoor"]).map(
                  (type) => (
                    <View
                      key={type}
                      className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
                      <MaterialCommunityIcons
                        name="home-outline"
                        size={16}
                        color="blue"
                      />
                      <Text className="text-gray-700 text-sm">{type}</Text>
                    </View>
                  ),
                )}
              </View>

              {/* Floor Numbers */}
              <Text className="text-xl font-bold text-blue-700 mt-6">
                Floors
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-3 mb-6">
                {(restaurant?.floorNumbers || ["First Floor"]).map((floor) => (
                  <View
                    key={floor}
                    className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
                    <MaterialCommunityIcons
                      name="floor-plan"
                      size={16}
                      color="blue"
                    />
                    <Text className="text-gray-700 text-sm">{floor}</Text>
                  </View>
                ))}
              </View>

              {/* Address / Contact */}
              <Text className="text-xl font-bold text-blue-700 mt-6">
                Contact & Address:
              </Text>
              <View className="flex-row items-center gap-3 mt-3 mb-6">
                <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
                  <MaterialCommunityIcons name="pin" size={16} color="blue" />
                  <Text className="text-gray-700 text-sm">
                    {restaurant?.address || "Address not provided"}
                  </Text>
                </View>
              </View>
            </>
          ) : activeTab === "Menu" ? (
            <View className="flex items-center mt-6">
              <Text className="text-gray-600 font-semibold">
                No Menu Available
              </Text>
            </View>
          ) : (
            <View className="mt-6 flex items-center">
              <Text className="text-gray-600 font-semibold">
                No Reviews Available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Book Button */}
      <View className="px-4 pb-6 pt-3 bg-white">
        <Button mode="contained" onPress={navigateToBooking}>
          Book a table
        </Button>
      </View>
    </View>
  );
}
