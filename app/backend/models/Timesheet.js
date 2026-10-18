const mongoose = require('mongoose');

// Hours per day per ticket
const DayHoursSchema = new mongoose.Schema({
  mon: { type: Number, default: 0, min: 0, max: 24 },
  tue: { type: Number, default: 0, min: 0, max: 24 },
  wed: { type: Number, default: 0, min: 0, max: 24 },
  thu: { type: Number, default: 0, min: 0, max: 24 },
  fri: { type: Number, default: 0, min: 0, max: 24 }
}, { _id: false });

const TimesheetEntrySchema = new mongoose.Schema({
  ticketId:    { type: String, required: true },   // e.g. PLW-142
  ticketTitle: { type: String, required: true },
  category:    { type: String, default: '' },
  hours:       { type: DayHoursSchema, default: () => ({}) }
}, { _id: false });

const TimesheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
    // Monday of the ISO week, stored as midnight UTC
  },
  entries: [TimesheetEntrySchema],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedAt: { type: Date },
  approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  notes:       { type: String },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

// Compound unique index: one timesheet per employee per week
TimesheetSchema.index({ employeeId: 1, weekStartDate: 1 }, { unique: true });

// Virtual: total hours this week
TimesheetSchema.virtual('totalHours').get(function () {
  return this.entries.reduce((sum, e) => {
    const h = e.hours || {};
    return sum + (h.mon || 0) + (h.tue || 0) + (h.wed || 0) + (h.thu || 0) + (h.fri || 0);
  }, 0);
});

TimesheetSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Timesheet', TimesheetSchema);
