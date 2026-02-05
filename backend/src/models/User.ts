import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    birthDate: { type: Date, required: false },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
    isActive: { type: Boolean, default: true, required: true }
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema>;
export type IUserDoc = mongoose.HydratedDocument<IUser>;

const User = mongoose.model<IUser>('User', userSchema);

export default User;

