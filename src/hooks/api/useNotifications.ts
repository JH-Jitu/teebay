

import { queryKeys } from "@/src/config/query";
import { firebaseService } from "@/src/services/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";





export const useInitializeNotifications = () => {
  return useMutation({
    mutationFn: () => firebaseService.initialize(),
    onError: (error) => {
      console.error("Failed to initialize notifications:", error);
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.notifications.settings(),
    queryFn: () => firebaseService.getNotificationSettings(),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useRequestNotificationPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => firebaseService.requestNotificationPermission(),
    onSuccess: () => {
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.settings(),
      });
    },
  });
};

export const useFCMToken = () => {
  return useQuery({
    queryKey: ["fcm", "token"],
    queryFn: () => firebaseService.getFCMToken(),
    staleTime: 10 * 60 * 1000, 
  });
};

export const useSendTokenToBackend = () => {
  return useMutation({
    mutationFn: (userId: string) => firebaseService.sendTokenToBackend(userId),
    onError: (error) => {
      console.error("Failed to send FCM token to backend:", error);
    },
  });
};

export const useSubscribeToTopic = () => {
  return useMutation({
    mutationFn: (topic: string) => firebaseService.subscribeToTopic(topic),
  });
};

export const useUnsubscribeFromTopic = () => {
  return useMutation({
    mutationFn: (topic: string) => firebaseService.unsubscribeFromTopic(topic),
  });
};

export const useDeliveredNotifications = () => {
  return useQuery({
    queryKey: ["notifications", "delivered"],
    queryFn: () => firebaseService.getDeliveredNotifications(),
    staleTime: 30 * 1000, 
  });
};

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => firebaseService.clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "delivered"],
      });
    },
  });
};

export const useSetBadgeCount = () => {
  return useMutation({
    mutationFn: (count: number) => firebaseService.setBadgeCount(count),
  });
};

export const useTestNotification = () => {
  return useMutation({
    mutationFn: () => firebaseService.testNotification(),
  });
};





export const useNotificationManager = (userId?: string) => {
  const queryClient = useQueryClient();

  const initializeNotifications = useInitializeNotifications();
  const notificationSettings = useNotificationSettings();
  const requestPermission = useRequestNotificationPermission();
  const sendTokenToBackend = useSendTokenToBackend();
  const fcmToken = useFCMToken();

  
  useEffect(() => {
    if (
      !initializeNotifications.isSuccess &&
      !initializeNotifications.isPending
    ) {
      initializeNotifications.mutate();
    }
  }, [initializeNotifications.isSuccess, initializeNotifications.isPending]);

  
  useEffect(() => {
    if (
      userId &&
      fcmToken.data &&
      !sendTokenToBackend.isSuccess &&
      !sendTokenToBackend.isPending
    ) {
      sendTokenToBackend.mutate(userId);
    }
  }, [
    userId,
    fcmToken.data,
    sendTokenToBackend.isSuccess,
    sendTokenToBackend.isPending,
  ]);

  return {
    
    isInitialized: initializeNotifications.isSuccess,
    isInitializing: initializeNotifications.isPending,
    initializeError: initializeNotifications.error,

    settings: notificationSettings.data,
    isLoadingSettings: notificationSettings.isLoading,
    settingsError: notificationSettings.error,

    fcmToken: fcmToken.data,
    isLoadingToken: fcmToken.isLoading,
    tokenError: fcmToken.error,

    
    requestPermission: requestPermission.mutateAsync,
    isRequestingPermission: requestPermission.isPending,
    permissionError: requestPermission.error,

    
    hasPermission: notificationSettings.data?.hasPermission || false,
    isTokenSentToBackend: sendTokenToBackend.isSuccess,

    
    refreshSettings: notificationSettings.refetch,
    refreshToken: fcmToken.refetch,
  };
};





export const useNotificationEvents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    
    

    return () => {
      
    };
  }, [queryClient]);

  return {
    
    
  };
};

export const useNotificationBadge = () => {
  const setBadgeCount = useSetBadgeCount();
  const deliveredNotifications = useDeliveredNotifications();

  const updateBadgeCount = (count: number) => {
    setBadgeCount.mutate(count);
  };

  const clearBadge = () => {
    setBadgeCount.mutate(0);
  };

  return {
    badgeCount: deliveredNotifications.data?.length || 0,
    updateBadgeCount,
    clearBadge,
    isUpdatingBadge: setBadgeCount.isPending,
  };
};
