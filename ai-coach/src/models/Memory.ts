import mongoose from 'mongoose';

const MemorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'guest',
  },
  topic: {
    type: String,
    required: true, // e.g., "React Hooks", "System Design Patterns"
  },
  summary: {
    type: String,
    required: true, // e.g., "Struggles with useEffect cleanup, but strong in design patterns."
  },
  tags: {
    type: [String],
    default: [], // e.g. ["weakness", "react"] or ["strength", "system-design"]
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
