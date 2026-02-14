import admin from '../config/firebase.js';

// Send notification to a single user
export const sendNotificationToUser = async (fcmToken, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Send notification to multiple users
export const sendNotificationToMultipleUsers = async (fcmTokens, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens: fcmTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`${response.successCount} notifications sent successfully`);
    return response;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};