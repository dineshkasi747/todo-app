import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
  // Check if Firebase service account is configured
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found in environment variables');
    console.warn('⚠️ Push notifications will not work');
  } else {
    // Parse the service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.error('❌ Push notifications will not work');
}

export default admin;