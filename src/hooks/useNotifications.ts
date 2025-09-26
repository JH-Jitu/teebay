import {
  registerForPushNotifications,
  setupNotificationListeners,
} from "@/src/services/notifications";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      setExpoPushToken(token);
    });

    const cleanupListeners = setupNotificationListeners();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.product_id) {
          router.push(`/products/${data.product_id}` as any);
        } else if (data?.transaction_id && data?.transaction_type) {
          router.push(
            `/transactions/${data.transaction_id}?type=${data.transaction_type}` as any
          );
        } else {
          router.push("/(tabs)/index" as any);
        }
      });

    return () => {
      cleanupListeners();
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
