import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth client for Android
const androidClient = new OAuth2Client(process.env.GOOGLE_ANDROID_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Google Sign-In for Android
// @route   POST /api/auth/google/android
// @access  Public
export const googleAuthAndroid = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    console.log('Verifying Android ID token...');

    // Verify the ID token
    const ticket = await androidClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_ANDROID_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    console.log('Google user verified:', { googleId, email, name });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        googleId,
        name,
        email,
        avatar: picture,
      });
      console.log('New user created:', email);
    } else {
      // Update user info
      user.googleId = googleId;
      user.name = name;
      user.avatar = picture;
      await user.save();
      console.log('Existing user updated:', email);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google Auth Android Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token or authentication failed',
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};