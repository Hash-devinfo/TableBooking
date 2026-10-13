import { useEffect, useState, type ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, type Href,  usePathname } from "expo-router";
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Tab = {
  name: string;
  icon: IconName;
  route?: Href;
};

type Props = {
  tabs?: Tab[];
  initialIndex?: number;
  onChange?: (index: number, tab: Tab) => void;
};

const DEFAULT_TABS: Tab[] = [
  { name: "Home", icon: "home", route: "/home" },
  {
    name: "Restaurants",
    icon: "silverware-fork-knife",
    route: "/listRestaurants",
  },
  { name: "Locator", icon: "map-marker-outline", route: "/locationPage" },
  { name: "Booking", icon: "calendar-month", route: "/listBookings" },
  { name: "Profile", icon: "account-circle", route: "/profile" },
];

export default function NavigationBar({
  tabs = DEFAULT_TABS,
  initialIndex = 0,
  onChange,
}: Props) {
  const pathname = usePathname();

  // Which tab matches the screen we're on right now (-1 if none)
  const routeIndex = tabs.findIndex(
    (t) =>
      typeof t.route === "string" &&
      (pathname === t.route || pathname.startsWith(`${t.route}/`)),
  );

  const [value, setValue] = useState(
    routeIndex !== -1 ? routeIndex : initialIndex,
  );

  // Keep the highlight in sync whenever the route changes
  useEffect(() => {
    if (routeIndex !== -1) setValue(routeIndex);
  }, [routeIndex]);


  return (
    <View className="flex-row bg-blue-400 shadow-md  ">
      {tabs.map((item, index) => {
        const isActive = index === value;
        const color = isActive ? "blue" : "#FFFFFF";

        return (
          <Pressable
            key={item.name}
            onPress={() => {
              if (index === value) return;

              setValue(index);
              onChange?.(index, item);

              if (item.route) {
                router.replace(item.route);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityState={{ selected: isActive }}
            className="flex-1 items-center justify-center pt-2 pb-10">
            {isActive && (
              <View className="absolute top-0 h-1 w-3/5 rounded-b bg-blue-800" />
            )}

            <MaterialCommunityIcons name={item.icon} size={30} color={color} />

            <Text
              numberOfLines={1}
              className="mt-1 text-sm font-bold"
              style={{ color }}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
