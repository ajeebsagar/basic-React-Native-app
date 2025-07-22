import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

const NotificationService = {
  init: async () => {
    // Request permissions on iOS, auto-granted on Android
    await NotificationService.requestPermission();
    // Get FCM token
    const fcmToken = await NotificationService.getFcmToken();
    console.log('FCM Token:', fcmToken);
    // Listen for foreground messages
    messaging().onMessage(async remoteMessage => {
      Alert.alert('New Notification', remoteMessage.notification?.title || '', [
        { text: 'OK' }
      ]);
    });
    // Listen for background/quit notifications (when tapped)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage.notification);
      // TODO: Navigate to specific screen if needed
    });
    // Check if app was opened by a notification (from quit state)
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from quit by notification:', remoteMessage.notification);
        // TODO: Navigate to specific screen if needed
      }
    });
  },

  requestPermission: async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Notification permission enabled:', authStatus);
    } else {
      Alert.alert('Permission required', 'Please enable notifications in settings.');
    }
  },

  getFcmToken: async () => {
    let fcmToken = await messaging().getToken();
    return fcmToken;
  },
};

export default NotificationService; 