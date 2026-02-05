import mongoose from 'mongoose';
import 'dotenv/config';

import User from '../models/User.js';

const MONGO_URI =
  process.env.MONGO_URI ??
  'mongodb://root:password@mongo:27017/auth-demo?authSource=admin';

async function migrateUsers() {
  await mongoose.connect(MONGO_URI);

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
    matched: (result as { matchedCount?: number; n?: number }).matchedCount ??
      (result as { n?: number }).n,
    modified: (result as { modifiedCount?: number; nModified?: number }).modifiedCount ??
      (result as { nModified?: number }).nModified
  });

  await mongoose.disconnect();
}

migrateUsers().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

