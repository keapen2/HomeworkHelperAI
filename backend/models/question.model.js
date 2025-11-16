const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  text: { type: String, required: true },
  subject: { 
    type: String, 
    required: true, 
    enum: ['Math', 'Science', 'English', 'History', 'Other'],
    default: 'Other'
  },
  topic: { type: String, index: true }, // e.g., "Calculus Derivatives", "Physics Mechanics"
  aiResponse: { type: String },
  answer: { type: String }, // Alias for aiResponse for consistency
  askCount: { type: Number, default: 1 }, // Used for "Top Questions"
  upvotes: { type: Number, default: 0 },
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  askedBy: { type: String, index: true }, // Firebase UID for user who asked
  askedAt: { type: Date, default: Date.now }, // When the question was asked
  accuracyRating: { type: Number, min: 0, max: 100 }, // Used for "Avg Accuracy"
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);

