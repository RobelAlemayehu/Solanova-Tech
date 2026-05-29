import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@proplist.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234!';

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
});

async function seedAdmin() {
  await mongoose.connect(DATABASE_URL);
  const User = mongoose.model('User', userSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    email: ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    deletedAt: null,
  });

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
  console.log(`Default password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
