import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "list.bullet": "view-list",
  "plus.app": "add-box",
  "person.crop.circle": "account-circle",
  magnifyingglass: "search",
  plus: "add",
  pencil: "edit",
  trash: "delete",
  eye: "visibility",
  "eye.slash": "visibility-off",
  "cube.box": "inventory",
  cart: "shopping-cart",
  clock: "schedule",
  "person.circle": "account-circle",
  "lock.fill": "lock",
  "info.circle.fill": "info",
  "arrow.right.circle.fill": "exit-to-app",
  "location.fill": "location-on",
  faceid: "fingerprint",
  camera: "camera-alt",
  photo: "photo-library",
  checkmark: "check",
  "chevron.up": "keyboard-arrow-up",
  "chevron.down": "keyboard-arrow-down",
  "rectangle.grid.3x2": "view-module",
  xmark: "close",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name as keyof typeof MAPPING] || "help"}
      style={style}
    />
  );
}
