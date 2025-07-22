# WhatsApp Clone Notification App

A React Native app demonstrating real-time push notifications (like WhatsApp calls) with Firebase Cloud Messaging (FCM), native Android module integration, and a simulated backend.

---

## Features
- Real-time push notifications (foreground, background, killed)
- Native Android notification handling (Java/Kotlin module)
- Deep linking: tap notification to open specific screen
- Local notification storage and badge count (bonus)
- Simulated backend to trigger notifications

---

## Project Structure
```
INTERNSALA_APP/
│
├── android/                # Native Android code (FCM, custom modules)
├── backend/                # Simulated backend (Node.js/Express)
│   └── server.js           # Backend server to send notifications
├── src/                    # React Native app code
│   ├── App.js              # Entry point
│   ├── components/         # UI components
│   ├── screens/            # App screens
│   ├── navigation/         # Navigation/deep linking
│   └── services/           # Notification service (FCM logic)
├── google-services.json    # Firebase config for Android (in android/app/)
├── package.json            # Project dependencies
└── README.md               # This file
```

---

## How It Works

### 1. **React Native App**
- The app is bootstrapped in `src/App.js` and uses React Navigation for screen management.
- `NotificationService.js` initializes Firebase Cloud Messaging (FCM), requests notification permissions, and listens for notifications in all app states (foreground, background, killed).
- When a notification is received, it is displayed as an alert (foreground) or handled by the OS (background/killed). Tapping a notification can deep link to a specific screen (e.g., Call screen).
- The FCM device token is logged in the console and can be used by the backend to target the device.

### 2. **Backend Simulation**
- The backend (`backend/server.js`) is a simple Node.js/Express server.
- It uses the Firebase Admin SDK to send push notifications to devices via FCM.
- You trigger a notification by sending a POST request to `/send-notification` with the device's FCM token and notification details.

### 3. **Native Android Module**
- The `android/` folder contains the native Android project.
- You can add custom Java/Kotlin code here for advanced notification handling (e.g., custom heads-up call UI, background processing, etc.).
- The app is configured for FCM in Gradle and the manifest, and the `google-services.json` file is required for Firebase integration.

### 4. **Notification Flow**
1. The app requests notification permissions and retrieves the FCM token.
2. The backend sends a push notification to the device using the FCM token.
3. The app receives the notification:
   - If in foreground: shows an alert.
   - If in background/killed: notification appears in the system tray; tapping it opens the app and can deep link to a screen.
4. (Bonus) You can extend the app to store notifications locally and show badge counts, similar to WhatsApp.

---

## Setup Instructions

### 1. **Clone the Repository**
```sh
git clone <your-repo-url>
cd internsala_app
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Firebase Setup**
- Create a Firebase project at https://console.firebase.google.com/
- Add an Android app (package name: e.g., `com.internsala_app`)
- Download `google-services.json` and place it in `android/app/`

### 4. **Android Native Setup**
- Ensure `android/` folder is present (from React Native CLI init)
- Update `android/build.gradle` and `android/app/build.gradle` as per FCM docs
- Update `AndroidManifest.xml` with required permissions/services

### 5. **Run the App**
```sh
npx react-native run-android
```

### 6. **Start the Backend**
- Add your Firebase Admin SDK key as `backend/serviceAccountKey.json`
- Start the backend server:
```sh
cd backend
npm install express body-parser firebase-admin
node server.js
```

### 7. **Trigger a Notification**
- Use Postman or curl to POST to `http://localhost:4000/send-notification` with:
```json
{
  "token": "<device_fcm_token>",
  "title": "Incoming Call",
  "body": "You have a new call!",
  "data": { "screen": "Call" }
}
```

---

## Notes
- For Android 15+ support, ensure you test on a compatible emulator/device.
- Native module code for advanced notification handling should be added in `android/` (see comments in code).
- For deep linking, see `src/navigation/` and notification tap handlers in `NotificationService.js`.

---

## License
MIT 
