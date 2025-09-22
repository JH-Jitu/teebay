import { FIREBASE_CONFIG } from "@/src/config/firebase";
import type { PushNotification } from "@/src/types";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class FirebaseService {
  private isInitialized = false;
  private fcmToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      await this.configureNotifications();

      const hasPermission = await this.requestNotificationPermission();

      if (hasPermission) {
        await this.getFCMToken();

        this.setupMessageListeners();

        if (Platform.OS === "android") {
          await this.createNotificationChannels();
        }
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Firebase initialization error:", error);
      this.isInitialized = false;
      return false;
    }
  }

  private async configureNotifications(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("Failed to get push token for push notification!");
          return false;
        }

        return true;
      } else {
        console.log("Must use physical device for Push Notifications");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!Device.isDevice) {
        console.warn("Push notifications don't work on simulator/emulator");
        return null;
      }

      const tokenPromise = Notifications.getExpoPushTokenAsync({
        projectId: FIREBASE_CONFIG.PROJECT_ID,
      }).then((res) => res.data);

      const timeoutPromise = new Promise<string | null>((resolve) =>
        setTimeout(() => resolve(null), 10000)
      );

      const token = await Promise.race([tokenPromise, timeoutPromise]);

      this.fcmToken = token;
      if (token) {
        console.log("Expo Push Token:", token);
      } else {
        console.warn("Expo Push Token timed out or unavailable");
      }
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  private setupMessageListeners(): void {
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received in foreground:", notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);

      const notificationData = response.notification.request.content.data;
    });
  }

  private async createNotificationChannels(): Promise<void> {
    if (Platform.OS === "android") {
      for (const channel of FIREBASE_CONFIG.NOTIFICATIONS.CHANNELS) {
        await Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: channel.lightColor,
          sound: channel.sound,
        });
      }
    }
  }

  async showLocalNotification(notification: PushNotification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error showing local notification:", error);
    }
  }

  async scheduleNotification(
    notification: PushNotification,
    scheduledDate: Date
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: {
          date: scheduledDate,
        },
      });

      return identifier;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  async getDeliveredNotifications(): Promise<Notifications.Notification[]> {
    try {
      return await Notifications.getPresentedNotificationsAsync();
    } catch (error) {
      console.error("Error getting delivered notifications:", error);
      return [];
    }
  }

  async clearDeliveredNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error clearing delivered notifications:", error);
    }
  }

  handleNotificationNavigation(data: Record<string, any>): void {
    console.log("Handling notification navigation:", data);

    if (data.screen) {
      console.log(`Navigate to screen: ${data.screen}`);
    }

    if (data.productId) {
      console.log(`Navigate to product: ${data.productId}`);
    }

    if (data.transactionId) {
      console.log(`Navigate to transaction: ${data.transactionId}`);
    }
  }

  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      console.log(`Subscribing to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      return false;
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      console.log(`Unsubscribing from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      return false;
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  getCurrentToken(): string | null {
    return this.fcmToken;
  }

  async refreshToken(): Promise<string | null> {
    try {
      this.fcmToken = null;
      return await this.getFCMToken();
    } catch (error) {
      console.error("Error refreshing FCM token:", error);
      return null;
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
