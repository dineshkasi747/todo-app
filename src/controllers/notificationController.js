import User from '../models/User.js';
import { sendNotificationToUser, sendNotificationToMultipleUsers } from '../services/notificationService.js';

// @desc    Send notification to all users
// @route   POST /api/notifications/send-all
// @access  Private (Admin only - you can add admin middleware later)
export const sendNotificationToAll = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    // Get all users with FCM tokens
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users with FCM tokens found',
      });
    }

    // Extract FCM tokens
    const fcmTokens = users.map(user => user.fcmToken);

    // Send notification to all users
    const response = await sendNotificationToMultipleUsers(
      fcmTokens,
      title,
      body,
      { type: 'admin_broadcast' }
    );

    console.log(`✅ Notification sent to ${users.length} users`);

    res.status(200).json({
      success: true,
      message: `Notification sent to ${users.length} users`,
      totalUsers: users.length,
      successCount: response?.successCount || 0,
      failureCount: response?.failureCount || 0,
    });
  } catch (error) {
    console.error('Send notification to all error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Send notification to specific user
// @route   POST /api/notifications/send-user
// @access  Private (Admin only)
export const sendNotificationToSpecificUser = async (req, res) => {
  try {
    const { userId, email, title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Either userId or email is required',
      });
    }

    // Find user by ID or email
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'User does not have FCM token (app not installed or not logged in)',
      });
    }

    // Send notification
    await sendNotificationToUser(
      user.fcmToken,
      title,
      body,
      { type: 'admin_message', userId: user._id.toString() }
    );

    console.log(`✅ Notification sent to user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Send notification to user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all users (for admin panel dropdown)
// @route   GET /api/notifications/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id name email fcmToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        hasToken: !!user.fcmToken,
      })),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};