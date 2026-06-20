import mongoose from 'mongoose';

const StudyPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'guest',
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  focusAreas: {
    type: [String],
    default: [],
  },
  tasks: [
    {
      topic: { type: String, required: true },
      task: { type: String, required: true },
      priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      estimatedTime: { type: String, required: true }, // e.g. "3 hours", "1 day"
      status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.StudyPlan || mongoose.model('StudyPlan', StudyPlanSchema);
