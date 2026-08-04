const mongoose = require('mongoose');

const TimecardSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  totalHours: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timecard', TimecardSchema);
