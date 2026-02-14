import express from 'express';
import { updateFCMToken } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @route   POST /api/users/fcm-token
// @desc    Update user FCM token
// @access  Private
router.post('/fcm-token', protect, updateFCMToken);

export default router;