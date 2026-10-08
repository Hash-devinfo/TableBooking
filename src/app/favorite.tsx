import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type FavoriteRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  location: string;
  image: ImageSourcePropType;
};

const RESTAURANT_DETAILS_ROUTE = "/bookATable";

const INITIAL_FAVORITES: FavoriteRestaurant[] = [
  {
    id: "1",
    name: "Monal",
    cuisine: "Desi",
    rating: 0,
    reviewCount: 0,
    location: "Lahore, Punjab",
    image: require("../../assets/images/restaurantimages/download.jpeg"),
  },
];

const Stars = ({ rating }: { rating: number }) => (
  <View className="flex-row">
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name="star"
        size={16}
        color={star <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
        style={{ marginRight: 2 }}
      />
    ))}
  </View>
);

const FavoriteCard = ({
  item,
  onRemove,
}: {
  item: FavoriteRestaurant;
  onRemove: (id: string) => void;
}) => (
  <View className="pt-3">
    <Pressable onPress={() => router.push("/bookAtable")} className="flex-row">
      <Image
        source={item.image}
        resizeMode="cover"
        className="h-32 w-36 rounded-l-2xl"
      />

      <View className="flex-1 justify-between px-3 py-1">
        <Text numberOfLines={2} className="text-lg font-bold text-blue-600">
          {item.name}
        </Text>
        <Text numberOfLines={1} className="text-sm text-blue-600">
          {item.cuisine}
        </Text>
        <View className="flex-row items-center">
          <Stars rating={item.rating} />
          <Text className="ml-2 text-base font-semibold text-blue-700">
            {item.rating.toFixed(1)}
          </Text>
          <Text className="ml-1 text-base text-blue-700">
            ({item.reviewCount})
          </Text>
        </View>
        <Text numberOfLines={1} className="text-xs text-blue-600">
          {item.location}
        </Text>
      </View>

      <Pressable
        onPress={() => onRemove(item.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name} from favourites`}
        className="h-8 w-8 items-center justify-center self-start">
        <Ionicons name="heart" size={22} color="#15803d" />
      </Pressable>
    </Pressable>

    <View className="mt-3 h-px bg-gray-300" />
  </View>
);

const Favorite = () => {
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((restaurant) => restaurant.id !== id));
  };

  return (
    <View className="flex-1 bg-white">
      <View className="mb-4 flex-row items-center justify-between mt-2">
        <Link href="/home" asChild>
          <Pressable className="h-10 w-10 justify-center">
            <Ionicons name="arrow-back" size={26} color="blue" />
          </Pressable>
        </Link>
        <Text className="text-2xl font-bold text-blue-700">Favourite</Text>
        <Link href="/notification" asChild>
          <Pressable className="h-10 w-10 items-end justify-center">
            <Ionicons name="notifications" size={26} color="blue" />
          </Pressable>
        </Link>
      </View>

      <FlatList
        className="px-4"
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FavoriteCard item={item} onRemove={removeFavorite} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center px-2 pt-24">
            <Ionicons name="heart-outline" size={56} color="#d1d5db" />
            <Text className="mt-4 text-lg font-bold text-gray-900">
              No favourites yet
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              Tap the heart on a restaurant to save it here.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Favorite;
