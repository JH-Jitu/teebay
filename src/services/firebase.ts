

import { FIREBASE_CONFIG } from "@/src/config/firebase";
import type { PushNotification } from "@/src/types";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

class FirebaseService {
  private isInitialized = false;
  private fcmToken: string | null = null;

    async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      
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
      console.log("Firebase service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Firebase service:", error);
      throw error;
    }
  }

    private async configureNotifications(): Promise<void> {
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

    async requestNotificationPermission(): Promise<boolean> {
    try {
      
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        return true;
      }

      
      const newAuthStatus = await messaging().requestPermission();
      const isGranted =
        newAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        newAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!isGranted) {
        console.warn("Notification permission denied");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

    async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      const token = await messaging().getToken();
      this.fcmToken = token;

      console.log("FCM Token:", token);
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

    private setupMessageListeners(): void {
    
    messaging().onTokenRefresh((token) => {
      console.log("FCM token refreshed:", token);
      this.fcmToken = token;
      
    });

    
    messaging().onMessage(this.handleForegroundMessage.bind(this));

    
    messaging().setBackgroundMessageHandler(
      this.handleBackgroundMessage.bind(this)
    );

    
    messaging().onNotificationOpenedApp(
      this.handleNotificationOpened.bind(this)
    );

    
    messaging()
      .getInitialNotification()
      .then(this.handleNotificationOpened.bind(this));
  }

    private async handleForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    console.log("Foreground message received:", remoteMessage);

    
    const notification =
      this.createNotificationFromRemoteMessage(remoteMessage);
    await this.showLocalNotification(notification);
  }

    private async handleBackgroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    console.log("Background message received:", remoteMessage);

    
    
  }

    private handleNotificationOpened(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage | null
  ): void {
    if (!remoteMessage) return;

    console.log("Notification opened:", remoteMessage);

    
    this.handleNotificationNavigation(remoteMessage.data);
  }

    private handleNotificationNavigation(data?: { [key: string]: string }): void {
    if (!data) return;

    const { type, productId, transactionId } = data;

    
    
    switch (type) {
      case "PRODUCT_SOLD":
      case "PRODUCT_RENTED":
        if (productId) {
          console.log("Navigate to product details:", productId);
          
        }
        break;
      case "TRANSACTION_UPDATE":
        if (transactionId) {
          console.log("Navigate to transaction details:", transactionId);
          
        }
        break;
      default:
        console.log("Navigate to home");
      
    }
  }

    private createNotificationFromRemoteMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): PushNotification {
    return {
      id: remoteMessage.messageId || Date.now().toString(),
      title: remoteMessage.notification?.title || "TeeBay",
      body: remoteMessage.notification?.body || "",
      data: remoteMessage.data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Show local notification
   */
  async showLocalNotification(notification: PushNotification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error showing local notification:", error);
    }
  }

  /**
   * Create notification channels (Android only)
   */
  private async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    try {
      const channels = Object.values(FIREBASE_CONFIG.NOTIFICATIONS.CHANNELS);

      for (const channel of channels) {
        await Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          description: channel.description,
          importance: this.getNotificationImportance(channel.importance),
          sound: channel.sound ? "default" : undefined,
          vibrationPattern: channel.vibrate ? [0, 250, 250, 250] : undefined,
        });
      }

      console.log("Notification channels created");
    } catch (error) {
      console.error("Error creating notification channels:", error);
    }
  }

    private getNotificationImportance(
    importance: string
  ): Notifications.AndroidImportance {
    switch (importance) {
      case "HIGH":
        return Notifications.AndroidImportance.HIGH;
      case "NORMAL":
        return Notifications.AndroidImportance.DEFAULT;
      case "LOW":
        return Notifications.AndroidImportance.LOW;
      default:
        return Notifications.AndroidImportance.DEFAULT;
    }
  }

    async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

    async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

    async getNotificationSettings(): Promise<{
    authorizationStatus: messaging.AuthorizationStatus;
    hasPermission: boolean;
    token: string | null;
  }> {
    try {
      const authorizationStatus = await messaging().hasPermission();
      const hasPermission =
        authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;
      const token = await this.getFCMToken();

      return {
        authorizationStatus,
        hasPermission,
        token,
      };
    } catch (error) {
      console.error("Error getting notification settings:", error);
      return {
        authorizationStatus: messaging.AuthorizationStatus.DENIED,
        hasPermission: false,
        token: null,
      };
    }
  }

    async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
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

    async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS !== "ios") return;

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
    }
  }

    async sendTokenToBackend(userId: string): Promise<void> {
    try {
      const token = await this.getFCMToken();
      if (!token) {
        console.warn("No FCM token available to send to backend");
        return;
      }

      
      console.log("Sending FCM token to backend:", { userId, token });

      
      
      
      
      
      
    } catch (error) {
      console.error("Error sending token to backend:", error);
    }
  }

    async testNotification(): Promise<void> {
    if (!__DEV__) return;

    try {
      const testNotification: PushNotification = {
        id: "test_" + Date.now(),
        title: "Test Notification",
        body: "This is a test notification from TeeBay",
        data: { type: "TEST" },
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      await this.showLocalNotification(testNotification);
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }
}


export const firebaseService = new FirebaseService();
export default firebaseService;
