import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import Entypo from "@expo/vector-icons/Entypo";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

export interface DropdownMenuItem {
  id: string;
  label: string;
  iconName?: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  style?: ViewStyle;
  iconColor?: string;
  testID?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  style,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [visible, setVisible] = useState(false);

  const handleItemPress = (item: DropdownMenuItem) => {
    setVisible(false);
    item.onPress();
  };

  return (
    <>
      <Pressable
        style={[styles.trigger, style]}
        onPress={() => setVisible(true)}
        testID={testID}
      >
        <Entypo
          name="dots-three-vertical"
          size={16}
          color={Colors[theme].text}
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.menu,
                {
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].border,
                  ...Shadows.md,
                },
              ]}
            >
              <View style={styles.modalTitle}>
                <View>
                  <Text
                    style={{
                      color: Colors[theme].text,
                      fontSize: Typography.fontSize.lg,
                    }}
                  >
                    Available Actions
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.cancelIcon,
                    { backgroundColor: Colors[theme].error },
                  ]}
                  onPress={() => setVisible(false)}
                >
                  <Entypo name="cross" size={20} color="white" />
                </Pressable>
              </View>
              {items.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    index !== items.length - 1 && {
                      borderBottomColor: Colors[theme].border,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                    pressed && {
                      backgroundColor: Colors[theme].backgroundSecondary,
                    },
                  ]}
                  onPress={() => handleItemPress(item)}
                >
                  {item.iconName && (
                    <IconSymbol
                      name={item.iconName}
                      size={18}
                      color={
                        item.destructive
                          ? Colors[theme].error
                          : Colors[theme].text
                      }
                    />
                  )}
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: item.destructive
                          ? Colors[theme].error
                          : Colors[theme].text,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelIcon: {
    position: "absolute",
    zIndex: 30,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: Spacing.sm,
    right: Spacing.sm,
  },
  menu: {
    minWidth: 190,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  menuItemText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default DropdownMenu;
