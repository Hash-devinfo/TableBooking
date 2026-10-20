import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadImage, type UploadType } from "../../api/uploadApi";

type Props = {
  images: string[];
  onChange: (next: string[]) => void;
  type?: UploadType;
  maxImages?: number;
  helperText?: string;
};

export default function ImageUploader({
  images,
  onChange,
  type = "restaurants",
  maxImages = 6,
  helperText,
}: Props) {
  const [uploading, setUploading] = useState(0);

  const pick = async () => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      Alert.alert("Limit reached", `You can add up to ${maxImages} photos.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (result.canceled) return;

    let next = [...images];
    setUploading(result.assets.length);

    for (const asset of result.assets) {
      try {
        const url = await uploadImage(asset.uri, type);
        next = [...next, url];
        onChange(next);
      } catch (error) {
        Alert.alert(
          "Upload failed",
          error instanceof Error
            ? error.message
            : "Could not upload that photo.",
        );
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const busy = uploading > 0;

  const defaultHelper =
    type === "restaurants"
      ? `Up to ${maxImages} photos. The first photo is your restaurant's cover.`
      : `Up to ${maxImages} photos.`;

  return (
    <View className="mb-4">
      <View className="flex-row flex-wrap">
        {images.map((url, index) => (
          <View key={url} className="mb-3 mr-3">
            <Image source={{ uri: url }} className="h-24 w-24 rounded-xl" />
            {type === "restaurants" && index === 0 && (
              <Text className="absolute bottom-1 left-1 rounded bg-blue-700 px-1 text-[10px] font-bold text-white">
                Cover
              </Text>
            )}
            {!busy && (
              <Pressable
                onPress={() => onChange(images.filter((u) => u !== url))}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-600">
                <Ionicons name="close" size={14} color="white" />
              </Pressable>
            )}
          </View>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <View
            key={`uploading-${i}`}
            className="mb-3 mr-3 h-24 w-24 items-center justify-center rounded-xl bg-gray-100">
            <ActivityIndicator color="#2563EB" />
          </View>
        ))}

        {images.length + uploading < maxImages && (
          <Pressable
            onPress={pick}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Add photos"
            className="mb-3 h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-blue-300">
            <Ionicons name="camera-outline" size={26} color="#2563EB" />
            <Text className="mt-1 text-xs font-semibold text-blue-700">
              Add
            </Text>
          </Pressable>
        )}
      </View>

      <Text className="text-xs text-gray-500">
        {helperText ?? defaultHelper}
      </Text>
    </View>
  );
}
