const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const app = express();
const PORT = 4000;

// Initialize Firebase Admin SDK (requires serviceAccountKey.json)
// Place your Firebase service account key in backend/serviceAccountKey.json
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(bodyParser.json());

// Endpoint to send notification
app.post('/send-notification', async (req, res) => {
  const { token, title, body, data } = req.body;
  try {
    const message = {
      token,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'calls',
        },
      },
    };
    await admin.messaging().send(message);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
