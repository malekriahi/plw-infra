const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  department: { type: String, required: true },
  position: { type: String, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  hireDate: { type: Date, default: Date.now },
  annualLeaveDays: { type: Number, default: 25 },
  remainingLeaveDays: { type: Number, default: 25 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
