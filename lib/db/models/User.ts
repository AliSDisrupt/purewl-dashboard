import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  lastLoginAt?: string;
  loginHistory: Array<{
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }>;
}

const LoginHistorySchema = new Schema(
  {
    timestamp: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    createdAt: { type: String, required: true },
    lastLoginAt: { type: String },
    loginHistory: { type: [LoginHistorySchema], default: [] },
  },
  { timestamps: false }
);

UserSchema.index({ email: 1 });
UserSchema.index({ id: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
