// scripts/set-user-role.js
// Script to set user roles (admin or student) in Firebase
// Usage: node scripts/set-user-role.js <email> <role>

require('dotenv').config();
const admin = require('../config/firebase-admin');

const email = process.argv[2];
const role = process.argv[3]; // 'admin' or 'student'

if (!email || !role) {
  console.error('Usage: node scripts/set-user-role.js <email> <role>');
  console.error('Example: node scripts/set-user-role.js admin@homework.com admin');
  console.error('Example: node scripts/set-user-role.js student@homework.com student');
  process.exit(1);
}

if (!['admin', 'student'].includes(role)) {
  console.error('Role must be either "admin" or "student"');
  process.exit(1);
}

async function setUserRole() {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    const customClaims = {
      admin: role === 'admin',
      role: role,
    };

    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
    
    console.log(`✅ Successfully set role "${role}" for user: ${email}`);
    console.log(`   User UID: ${userRecord.uid}`);
    console.log(`   Custom claims:`, customClaims);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: User with email ${email} not found in Firebase`);
      console.error('   Please create the user in Firebase Console first.');
    } else {
      console.error('❌ Error setting user role:', error.message);
    }
    process.exit(1);
  }
}

setUserRole();

