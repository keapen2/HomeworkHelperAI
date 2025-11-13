const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student' 
  },
  lastActive: { type: Date, default: Date.now }
  // Other fields for student auth (e.g., password) will be handled by Firebase.
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

