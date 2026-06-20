import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  answerText: {
    type: String,
    required: true,
  },
  scoreTechnical: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  scoreCommunication: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  scoreConfidence: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  scoreStructure: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  scoreRelevance: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  weaknessTags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);
