const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const PORT = process.env.PORT || 3000;

app.post('/send-call-notification', (req, res) => {
    const { token, callerName, callId } = req.body;

    if (!token || !callerName || !callId) {
        return res.status(400).send({
            error: 'Missing required fields: token, callerName, and callId must be provided.'
        });
    }

    const message = {
        data: {
            callerName: callerName,
            callId: callId,
        },
        token: token,
        android: {
            priority: 'high',
        },
    };

    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
            res.status(200).send({ success: true, messageId: response });
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            res.status(500).send({ success: false, error: error.message });
        });
});

app.get('/', (req, res) => {
    res.send('FCM Notification Server is running. Send a POST request to /send-call-notification to trigger a call.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
    console.log('To send a notification, make a POST request to http://localhost:3000/send-call-notification');
    console.log('With a JSON body like: { "token": "DEVICE_FCM_TOKEN", "callerName": "John Doe", "callId": "12345" }');
});
        "firebase_url": "https://your-project-id.firebaseio.com",
        "project_id": "your-project-id",
        "storage_bucket": "your-project-id.appspot.com"
    },
    "client": [
        {
        "client_info": {
            "mobilesdk_app_id": "1:123456789012:android:abcdef123456",
            "android_client_info": {
            "package_name": "com.example.app"
            }
        },
        "oauth_client": [],
        "api_key": [],
        "services": {
            "appinvite_service": {
            "other_platform_oauth_client": []
            }
        }
        }
    ],
    "configuration_version": "1"
    }