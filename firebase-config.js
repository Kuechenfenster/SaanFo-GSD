/**
 * Firebase Admin SDK Configuration
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create or select your project
 * 3. Go to Project Settings > Service Accounts
 * 4. Generate new private key and copy the JSON
 * 5. Add the values to your .env file
 */

const admin = require('firebase-admin');

// Check if all required Firebase env vars are present
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn('⚠️  Firebase configuration incomplete. Auth will use mock mode.');
  console.warn(`Missing: ${missingVars.join(', ')}`);
  console.warn('Set these in your .env file to enable real Firebase Authentication.');
} else {
  try {
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
  }
}

module.exports = {
  admin,
  isConfigured: missingVars.length === 0
};
