import express from 'express';
import {
  sendNotificationToAll,
  sendNotificationToSpecificUser,
  getAllUsers,
} from '../controllers/notificationController.js';

const router = express.Router();

// @route   POST /api/notifications/send-all
// @desc    Send notification to all users
// @access  Public (you can add auth later)
router.post('/send-all', sendNotificationToAll);

// @route   POST /api/notifications/send-user
// @desc    Send notification to specific user
// @access  Public (you can add auth later)
router.post('/send-user', sendNotificationToSpecificUser);

// @route   GET /api/notifications/users
// @desc    Get all users
// @access  Public (you can add auth later)
router.get('/users', getAllUsers);

export default router;