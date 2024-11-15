const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://inventory-management-821df-default-rtdb.firebaseio.com"
  });
}

async function createTestUser() {
  try {
    // Create a test user in Authentication
    const userRecord = await admin.auth().createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      displayName: 'Test User'
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: 1, // Basic user role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    });

    console.log('Test user created successfully:', userRecord.uid);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser().then(() => process.exit(0));