import mongoose from 'mongoose';

const InterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'guest',
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: false,
    default: 'Generic',
  },
  mode: {
    type: String,
    enum: ['behavioral', 'technical', 'resume-based', 'full-mock'],
    default: 'full-mock',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'active',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.InterviewSession || mongoose.model('InterviewSession', InterviewSessionSchema);
