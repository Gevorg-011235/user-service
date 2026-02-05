const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://root:password@mongo:27017/auth-demo?authSource=admin';

async function migrateUsers() {
  await mongoose.connect(MONGO_URI);

  const update = {
    $set: {
      role: 'user',
      isActive: true
    }
  };

  const result = await User.updateMany(
    {
      $or: [
        { fullName: { $exists: false } },
        { role: { $exists: false } },
        { isActive: { $exists: false } },
        { birthDate: { $exists: false } }
      ]
    },
    [
      {
        $set: {
          fullName: { $ifNull: ['$fullName', '$username'] },
          birthDate: { $ifNull: ['$birthDate', null] },
          role: { $ifNull: ['$role', 'user'] },
          isActive: { $ifNull: ['$isActive', true] }
        }
      }
    ]
  );

  console.log('Migration complete:', {
    matched: result.matchedCount ?? result.n,
    modified: result.modifiedCount ?? result.nModified
  });

  await mongoose.disconnect();
}

migrateUsers()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
