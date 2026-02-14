import express from 'express';
import { 
  googleAuthAndroid,
  getCurrentUser, 
  logout 
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/google/android
// @desc    Google Sign-In for Android
// @access  Public
router.post('/google/android', googleAuthAndroid);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

export default router;