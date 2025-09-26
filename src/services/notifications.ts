import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const getNativeFCMToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "android") {
      const token = await Notifications.getDevicePushTokenAsync();
      return token.data;
    } else if (Platform.OS === "ios") {
      const token = await Notifications.getDevicePushTokenAsync();
      return token.data;
    }
    return null;
  } catch {
    return null;
  }
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<
  string | null
> => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("transactions", {
        name: "Transaction Notifications",
        description: "Notifications for buy/sell/rent transactions",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
        sound: "default",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const fcmToken = await getNativeFCMToken();

    if (fcmToken) {
      await sendTokenToBackend(fcmToken);
      return fcmToken;
    } else {
      const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
      await sendTokenToBackend(expoToken);
      return expoToken;
    }
  } catch {
    return null;
  }
};

export const sendTokenToBackend = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("fcm_token", token);
  } catch {
    // Silent error handling
  }
};

export const getStoredFCMToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("fcm_token");
  } catch {
    return null;
  }
};

export const setupNotificationListeners = () => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      // Handle notification received while app is running
    }
  );

  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.product_id) {
        // Navigation handled by useNotifications hook
      }
    });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};

export const schedulePushNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null,
  });
};
