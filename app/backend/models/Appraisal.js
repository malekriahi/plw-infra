const mongoose = require('mongoose');

const AppraisalSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  period: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  selfEvaluation: {
    strengths: String, weaknesses: String, goals: String, achievements: String,
    rating: { type: Number, min: 1, max: 5 }
  },
  managerEvaluation: {
    strengths: String, weaknesses: String, goals: String, achievements: String,
    rating: { type: Number, min: 1, max: 5 }
  },
  goals: [{
    description: String, deadline: Date,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
  }],
  status: { type: String, enum: ['draft', 'submitted', 'reviewed', 'completed'], default: 'draft' },
  finalRating: { type: Number, min: 1, max: 5 },
  comments: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appraisal', AppraisalSchema);
