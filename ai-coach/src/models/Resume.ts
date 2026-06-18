import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false, // Optional for now if we don't have auth yet
  },
  fileUrl: {
    type: String,
    required: true,
  },
  rawText: {
    type: String,
    required: false,
  },
  parsedAt: {
    type: Date,
    default: null,
  },
  parsedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
