import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['behavioral', 'technical', 'resume-based', 'project-based', 'role-specific', 'weakness-followup'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  expectedSignals: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
