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
    // Don't throw error, just return null
    return null;
  }
};

// Send notification to multiple users (send one by one)
export const sendNotificationToMultipleUsers = async (fcmTokens, title, body, data = {}) => {
  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('⚠️ No FCM tokens provided');
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    // Filter out null/undefined tokens
    const validTokens = fcmTokens.filter(token => token && token.trim() !== '');

    if (validTokens.length === 0) {
      console.log('⚠️ No valid FCM tokens found');
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    console.log(`📤 Sending notifications to ${validTokens.length} users...`);

    // Send notifications one by one
    let successCount = 0;
    let failureCount = 0;
    const responses = [];

    for (const token of validTokens) {
      try {
        const message = {
          notification: {
            title,
            body,
          },
          data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
          token: token,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'todo_notifications',
            },
          },
        };

        const response = await admin.messaging().send(message);
        successCount++;
        responses.push({ success: true, response, token: token.substring(0, 20) + '...' });
        console.log(`✅ Notification sent (${successCount}/${validTokens.length})`);
      } catch (error) {
        failureCount++;
        responses.push({ success: false, error: error.message, token: token.substring(0, 20) + '...' });
        console.error(`❌ Failed to send notification: ${error.message}`);
      }
    }

    console.log(`\n📊 Summary: ${successCount} succeeded, ${failureCount} failed out of ${validTokens.length} total`);

    return {
      successCount,
      failureCount,
      responses,
    };
  } catch (error) {
    console.error('❌ Error sending notifications:', error.message);
    return { successCount: 0, failureCount: fcmTokens.length, error: error.message };
  }
};