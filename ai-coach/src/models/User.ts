import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: 'Guest User',
  },
  email: {
    type: String,
    required: false,
    default: '',
  },
  targetRole: {
    type: String,
    required: false,
    default: '',
  },
  experienceLevel: {
    type: String,
    required: false,
    default: 'Mid',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
