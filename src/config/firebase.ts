

import { Platform } from "react-native";

export const FIREBASE_CONFIG = {
  
  PROJECT_ID: "teebay-mobile-assesment",
  PROJECT_NUMBER: "1004067434105",
  STORAGE_BUCKET: "teebay-mobile-assesment.firebasestorage.app",

  
  ANDROID: {
    PACKAGE_NAME: "com.teebay.appname",
    MOBILE_SDK_APP_ID: "1:1004067434105:android:6e1d9af93cb46d62ac2ea8",
    API_KEY: "AIzaSyBTH8TBBxtPINvyyewXEobkWpUw5uWOJZs",
  },

  
  IOS: {
    BUNDLE_ID: "com.teebay.appname",
    MOBILE_SDK_APP_ID: "1:1004067434105:ios:fea4a4867f4c948eac2ea8",
    API_KEY: "AIzaSyBm6TNPl9fe_QRpaqqLkDUuYHnzIWERDCc",
  },

  
  FCM: {
    SENDER_ID: "1004067434105",
    VAPID_KEY: "", // Will be set if using web push
  },

  // Notification configuration
  NOTIFICATIONS: {
    CHANNELS: {
      DEFAULT: {
        id: "default",
        name: "Default",
        description: "Default notification channel",
        importance: "HIGH" as const,
        sound: true,
        vibrate: true,
      },
      TRANSACTIONS: {
        id: "transactions",
        name: "Transactions",
        description: "Transaction related notifications",
        importance: "HIGH" as const,
        sound: true,
        vibrate: true,
      },
      PRODUCTS: {
        id: "products",
        name: "Products",
        description: "Product related notifications",
        importance: "NORMAL" as const,
        sound: true,
        vibrate: false,
      },
    },

    
    TYPES: {
      PRODUCT_SOLD: {
        type: "PRODUCT_SOLD",
        channel: "transactions",
        route: "/product-details",
      },
      PRODUCT_RENTED: {
        type: "PRODUCT_RENTED",
        channel: "transactions",
        route: "/product-details",
      },
      TRANSACTION_UPDATE: {
        type: "TRANSACTION_UPDATE",
        channel: "transactions",
        route: "/transaction-details",
      },
      REMINDER: {
        type: "REMINDER",
        channel: "default",
        route: "/home",
      },
    } as const,
  },
} as const;


export const getPlatformConfig = () => {
  return Platform.select({
    ios: {
      BUNDLE_ID: FIREBASE_CONFIG.IOS.BUNDLE_ID,
      MOBILE_SDK_APP_ID: FIREBASE_CONFIG.IOS.MOBILE_SDK_APP_ID,
      API_KEY: FIREBASE_CONFIG.IOS.API_KEY,
    },
    android: {
      PACKAGE_NAME: FIREBASE_CONFIG.ANDROID.PACKAGE_NAME,
      MOBILE_SDK_APP_ID: FIREBASE_CONFIG.ANDROID.MOBILE_SDK_APP_ID,
      API_KEY: FIREBASE_CONFIG.ANDROID.API_KEY,
    },
    default: {
      PACKAGE_NAME: FIREBASE_CONFIG.ANDROID.PACKAGE_NAME,
      MOBILE_SDK_APP_ID: FIREBASE_CONFIG.ANDROID.MOBILE_SDK_APP_ID,
      API_KEY: FIREBASE_CONFIG.ANDROID.API_KEY,
    },
  });
};


export const getFirebaseConfig = () => {
  const platformConfig = getPlatformConfig();
  return {
    apiKey: platformConfig?.API_KEY || FIREBASE_CONFIG.ANDROID.API_KEY,
    authDomain: `${FIREBASE_CONFIG.PROJECT_ID}.firebaseapp.com`,
    projectId: FIREBASE_CONFIG.PROJECT_ID,
    storageBucket: FIREBASE_CONFIG.STORAGE_BUCKET,
    messagingSenderId: FIREBASE_CONFIG.FCM.SENDER_ID,
    appId:
      platformConfig?.MOBILE_SDK_APP_ID ||
      FIREBASE_CONFIG.ANDROID.MOBILE_SDK_APP_ID,
  };
};
