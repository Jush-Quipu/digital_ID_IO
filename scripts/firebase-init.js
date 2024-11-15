const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://inventory-management-821df-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const rtdb = admin.database();

async function setupFirebase() {
  try {
    // Initialize Firestore collections
    const batch = db.batch();

    // Create initial system document
    const systemRef = db.collection('system').doc('stats');
    batch.set(systemRef, {
      totalUsers: 0,
      totalDocuments: 0,
      totalShares: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create roles collection
    const rolesRef = db.collection('roles').doc('definitions');
    batch.set(rolesRef, {
      1: 'user',
      2: 'issuer',
      3: 'admin'
    });

    // Create document types
    const docTypesRef = db.collection('documentTypes').doc('supported');
    batch.set(docTypesRef, {
      'drivers-license': {
        name: "Driver's License",
        fields: ['Full Name', 'License Number', 'Date of Birth', 'Address'],
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png']
      },
      'passport': {
        name: "Passport",
        fields: ['Full Name', 'Passport Number', 'Date of Birth', 'Nationality'],
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png']
      },
      'social-security': {
        name: "Social Security Card",
        fields: ['Full Name', 'SSN', 'Date of Birth'],
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png']
      }
    });

    // Commit Firestore batch
    await batch.commit();

    // Initialize Realtime Database
    await rtdb.ref('/').set({
      system: {
        maintenance: {
          isUnderMaintenance: false,
          message: ""
        },
        stats: {
          activeUsers: 0,
          totalDocuments: 0,
          totalShares: 0
        }
      },
      status: {},
      presence: {},
      notifications: {}
    });

    console.log('Firebase initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    process.exit(1);
  }
}

setupFirebase().then(() => {
  console.log('Setup complete');
  process.exit(0);
});