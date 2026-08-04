const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  candidatePhone: { type: String },
  position: { type: String, required: true },
  department: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  duration: { type: Number, default: 60 },
  interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  type: { type: String, enum: ['phone', 'video', 'onsite'], default: 'video' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  resumeUrl: { type: String },
  feedback: [{
    interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
    recommendation: { type: String, enum: ['hire', 'no-hire', 'maybe'] }
  }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', InterviewSchema);
