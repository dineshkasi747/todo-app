import admin from '../config/firebase.js';

// Send notification to a single user
export const sendNotificationToUser = async (fcmToken, title, body, data = {}) => {
  try {
    if (!fcmToken) {
      console.log('⚠️ No FCM token provided');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'todo_notifications',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    throw error;
  }
};

// Send notification to multiple users
export const sendNotificationToMultipleUsers = async (fcmTokens, title, body, data = {}) => {
  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('⚠️ No FCM tokens provided');
      return null;
    }

    // Filter out null/undefined tokens
    const validTokens = fcmTokens.filter(token => token && token.trim() !== '');

    if (validTokens.length === 0) {
      console.log('⚠️ No valid FCM tokens found');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: validTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'todo_notifications',
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ ${response.successCount} notifications sent successfully`);
    console.log(`❌ ${response.failureCount} notifications failed`);
    
    return response;
  } catch (error) {
    console.error('❌ Error sending notifications:', error.message);
    throw error;
  }
};