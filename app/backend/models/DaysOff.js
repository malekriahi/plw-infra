const mongoose = require('mongoose');

const DaysOffSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['vacation', 'sick', 'personal'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DaysOff', DaysOffSchema);
