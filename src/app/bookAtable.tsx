import { useState , useEffect} from "react";
import { Button } from 'react-native-paper';

import {
  Text,
  ImageBackground,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
const photos = [
    require("../../assets/images/restaurantimages/download.jpeg"),
  require("../../assets/images/restaurantimages/download (1).jpeg"),
  require("../../assets/images/restaurantimages/download (2).jpeg"),
  
];
const TABS = ["Overview", "Menu", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function BookATable() {


 const backPage = () => {
    router.replace("/home");
  };

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
   const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  }, 6000);

  return () => clearInterval(interval);
}, []);  
 

  const toggleFavorite = () => {
    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);
    Alert.alert(
      nextIsFavorite ? "Added to favorites" : "Removed from favorites",
      nextIsFavorite
        ? "Added to your favorites."
        : "Removed from your favorites."
    );
  };

  return (
    <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
      <ImageBackground
        source={photos[currentPhotoIndex]}
  resizeMode="cover"
  className="w-full h-72 justify-between"
      >
        <View className="flex-row justify-between px-4 pt-4">
          <Pressable
            onPress={backPage}
            className="bg-blue-700 w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>
          <Pressable
            onPress={toggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="bg-blue-700 w-11 h-11 rounded-full items-center justify-center"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color="white"
            />
          </Pressable>
        </View>

        <View className="mb-4 p-4">
          <Text className="text-2xl font-bold text-white">
            Basilico by Sara - Lake City
          </Text>
          <Text className="text-base text-white">Italian</Text>
        </View>
      </ImageBackground>

      <View className="flex-1 -mt-6 bg-white rounded-t-3xl px-4 pt-6">
        
          <View className="flex-row justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="star" size={24} color="#facc15" />
              <Text className="font-semibold">3.0</Text>
              <Text className="text-gray-600">(12 Reviews)</Text>
            </View>

            <View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={18} color="blue" />
                <Text className="text-gray-600">2km</Text>
              </View>
              <Text className="mt-2 text-gray-600">Lahore, Punjab</Text>
            </View>
          </View>

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

          <View className="flex-row gap-6 mt-6 border-b border-gray-200">
            {TABS.map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} className="pb-2">
                <Text
                  className={
                    activeTab === tab
                      ? "text-blue-700 font-semibold border-b-2 border-blue-700 pb-2"
                      : "text-gray-500 font-medium"
                  }
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "Overview" ? (
            <>
          <View className="flex-row gap-3 mt-6">
            {photos.map((photo, index) => (
              <Image key={index} source={photo} className="w-24 h-24 rounded-xl" />
            ))}
          </View>

          <Text className="text-xl font-bold text-blue-700 mt-6">About Us</Text>
         <View>
            <Text
              className="text-gray-600 mt-2 leading-5"
              numberOfLines={isAboutExpanded ? undefined : 3}
            >
              Born from a culinary journey through Italy. Made with love.
               Basilico is chef-owner Sara's love letter to Italian and 
               Mediterranean cooking — cozy, warm, and deeply personal.
            </Text>
            <Pressable
              onPress={() => setIsAboutExpanded((expanded) => !expanded)}
              className="self-start mt-1"
            >
              <Text className="text-blue-700 font-medium">
                {isAboutExpanded ? "Read less" : "Read more"}
              </Text>
            </Pressable>
          </View>

          <Text className="text-xl font-bold text-blue-700 mt-6">Timings</Text>
          <View className="flex-row items-center gap-3 mt-3 mb-6">
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="time-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Open at 9:00</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="time-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Closed at 11:45</Text>
            </View>
            <View className="bg-green-100 rounded-full px-3 py-2">
              <Text className="text-blue-700 text-sm font-medium">Open</Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-blue-700 mt-6">Avaliable Seating</Text>
          <View className="flex-row items-center gap-3 mt-3 mb-6">
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <MaterialCommunityIcons name="home-outline"  size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Indoor</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <MaterialCommunityIcons name="tree-outline"  size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Outdoor</Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-blue-700 mt-6">Table Capacity</Text>
          <View className="flex-row items-center gap-3 mt-3 mb-6">
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="people-outline"  size={16} color="blue" />
              <Text className="text-gray-700 text-sm">2-Person</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <MaterialCommunityIcons name="human-male-female-child" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">5-Person</Text>
            </View>
            <View className="bg-green-100 rounded-full px-3 py-2">
              <Text className="text-blue-700 text-sm font-medium">More</Text>
            </View>
            
          </View>
           <Text className="text-xl font-bold text-blue-700 mt-6">Floor No:</Text>
          <View className="flex-row items-center gap-3 mt-3 mb-6">
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <MaterialCommunityIcons name="floor-plan"  size={16} color="blue" />
              <Text className="text-gray-700 text-sm">First Floor</Text>
            </View>
            
          </View>
          
          <Text className="text-xl font-bold text-blue-700 mt-6 ">Amenities</Text>
          <View className="flex-row flex-wrap gap-3 mt-3 mb-6">
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="musical-notes-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Enviroment</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="wifi-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Wifi</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="snow-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">AC</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="man-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Restrooms</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <Ionicons name="car-outline" size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Parking</Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-blue-700 mt-6">Contact:</Text>
          <View className="flex-row items-center gap-3 mt-3 mb-6">
            <View className="flex-row items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
              <MaterialCommunityIcons name="pin"  size={16} color="blue" />
              <Text className="text-gray-700 text-sm">Lahore, Pakistan</Text>
            </View>
            
          </View>
            </>
          ) : activeTab === "Menu" ? (
            <View className="flex  items-center mt-6 ">
             <Text className="text-gray-600 font-semibold">No Menu Available</Text>
            </View>
          ) : (
            <View className="mt-6">
              <View className="flex  items-center mt-6 ">
             <Text className="text-gray-600 font-semibold">No Reviews Available</Text>
            </View>
              
            </View>
          )}
        </View>
        
      </ScrollView>

        <View className="px-4 pb-6 pt-3 bg-white">
      <Button icon="" mode="contained" >
Book a table
  </Button>
        </View>
    
    </View>
  );
}