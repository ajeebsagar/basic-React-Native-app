package com.pushnotificationapp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.Collections

class CallNotificationPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules = ArrayList<NativeModule>()
        modules.add(CallNotificationModule(reactContext))
        return modules
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return Collections.emptyList()
    }
}
```kotlin
// File: android/app/src/main/java/com/pushnotificationapp/CallNotificationModule.kt
package com.pushnotificationapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class CallNotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "CallNotificationModule"

    @ReactMethod
    fun showCallNotification(callerName: String, callId: String) {
        val context = reactApplicationContext
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channelId = "call_channel_id"
        val channelName = "Incoming Calls"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Channel for incoming call notifications"
                setSound(null, null) // Use custom sound or none
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Intent for when the user taps the notification body (full screen intent)
        val fullScreenIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("callId", callId)
            putExtra("callerName", callerName)
            putExtra("action", "answered")
        }
        val fullScreenPendingIntent = PendingIntent.getActivity(
            context, 0, fullScreenIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // "Answer" action intent
        val answerIntent = Intent(context, MainActivity::class.java).apply {
            action = "ANSWER_CALL"
            putExtra("callId", callId)
            putExtra("callerName", callerName)
            putExtra("action", "answered")
        }
        val answerPendingIntent = PendingIntent.getActivity(
            context, 1, answerIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // "Decline" action intent
        val declineIntent = Intent(context, CallNotificationActionReceiver::class.java).apply {
            action = "DECLINE_CALL"
            putExtra("callId", callId)
        }
        val declinePendingIntent = PendingIntent.getBroadcast(
            context, 2, declineIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )


        val notificationBuilder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_notification) // You need to add this icon
            .setContentTitle("Incoming Call")
            .setContentText(callerName)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setOngoing(true)
            .setAutoCancel(true)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .addAction(0, "Decline", declinePendingIntent)
            .addAction(0, "Answer", answerPendingIntent)

        notificationManager.notify(123, notificationBuilder.build())
    }

    @ReactMethod
    fun dismissCallNotification(promise: Promise) {
        val context = reactApplicationContext
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(123) // Use the same ID
        promise.resolve(true)
    }
}
```kotlin
// File: android/app/src/main/java/com/pushnotificationapp/CallNotificationActionReceiver.kt
package com.pushnotificationapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.NotificationManager

class CallNotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "DECLINE_CALL") {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.cancel(123) // Make sure this ID matches the one used to show the notification
        }
    }
}
```kotlin
// File: android/app/src/main/java/com/pushnotificationapp/MyFirebaseMessagingService.kt
package com.pushnotificationapp

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Check if message contains a data payload.
        remoteMessage.data.isNotEmpty().let {
            val callerName = remoteMessage.data["callerName"]
            val callId = remoteMessage.data["callId"]

            if (callerName != null && callId != null) {
                // This is where you would trigger the native module to show the notification
                val callModule = CallNotificationModule(applicationContext as com.facebook.react.bridge.ReactApplicationContext)
                callModule.showCallNotification(callerName, callId)

                // If app is in background, you can also start a headless JS task.
                val serviceIntent = Intent(applicationContext, MyHeadlessJsTaskService::class.java)
                applicationContext.startService(serviceIntent)
                HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
            }
        }
    }
}
```javascript
// File: index.js (in your project root)
// Add this to your index.js file
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// This is the entry point for the Headless JS task
const MyHeadlessJsTask = async (taskData) => {
  console.log('Receiving headless task', taskData);
  // You can perform background tasks here, like fetching call details
};

AppRegistry.registerHeadlessTask('MyHeadlessJsTask', () => MyHeadlessJsTask);
AppRegistry.registerComponent(appName, () => App);
```kotlin
// File: android/app/src/main/java/com/pushnotificationapp/MyHeadlessJsTaskService.kt
package com.pushnotificationapp

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class MyHeadlessJsTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        return intent?.extras?.let {
            HeadlessJsTaskConfig(
                "MyHeadlessJsTask",
                Arguments.fromBundle(it),
                5000, // timeout for the task
                true // optional: defines whether or not the task is allowed in foreground. Default is false
            )
        }
    }
}
```

### Next Steps:

1.  **Add an icon:** You need to add a notification icon at `android/app/src/main/res/drawable/ic_notification.png`. You can use any small, simple icon.
2.  **Register the Package:** Open `android/app/src/main/java/com/pushnotificationapp/MainApplication.kt` (or `.java`) and add your `CallNotificationPackage` to the list of packages.

    ```kotlin
    // In MainApplication.kt
    override fun getPackages(): List<ReactPackage> =
        PackageList(this).packages.apply {
            // Packages that cannot be autolinked yet can be added manually here, for example:
            add(CallNotificationPackage()) // <-- Add this line
        }
    ```

3.  **Update `AndroidManifest.xml`:** You need to register your services and add permissions.

    ```xml
    <!-- File: android/app/src/main/AndroidManifest.xml -->
    <manifest ...>
        <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

        <application ...>
            ...
            <service
                android:name=".MyFirebaseMessagingService"
                android:exported="false">
                <intent-filter>
                    <action android:name="com.google.firebase.MESSAGING_EVENT" />
                </intent-filter>
            </service>

            <service android:name=".MyHeadlessJsTaskService" />

            <receiver
                android:name=".CallNotificationActionReceiver"
                android:enabled="true"
                android:exported="false" />
            ...
        </application>
    </manifest>
    ```

After setting up the native side, the next step is to write the React Native code to handle the logic within the app. Let me know when you're ready for the `App.js` and other JavaScript fil