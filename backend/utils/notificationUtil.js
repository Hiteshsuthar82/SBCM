const admin = require('../config/firebase');

const sendNotification = async (token, title, body, data = {}) => {
  try {
    const response = await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
    return response;
  } catch (err) {
    console.error('FCM error:', err);
  }
};

module.exports = { sendNotification };