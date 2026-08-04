const DaysOff = require('../models/DaysOff');
const Employee = require('../models/Employee');

exports.request = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, type, reason } = req.body;
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.remainingLeaveDays < days) return res.status(400).json({ error: 'Insufficient leave balance' });
    const daysOff = new DaysOff({ employeeId, startDate, endDate, type, reason });
    await daysOff.save();
    res.status(201).json(daysOff);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.approve = async (req, res) => {
  try {
    const daysOff = await DaysOff.findById(req.params.id);
    if (!daysOff) return res.status(404).json({ error: 'Not found' });
    daysOff.status = 'approved';
    daysOff.approvedBy = req.body.approvedBy;
    daysOff.approvedAt = new Date();
    await daysOff.save();
    const days = Math.ceil((new Date(daysOff.endDate) - new Date(daysOff.startDate)) / 86400000);
    await Employee.findByIdAndUpdate(daysOff.employeeId, { $inc: { remainingLeaveDays: -days } });
    res.json(daysOff);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.reject = async (req, res) => {
  try {
    const daysOff = await DaysOff.findById(req.params.id);
    if (!daysOff) return res.status(404).json({ error: 'Not found' });
    daysOff.status = 'rejected';
    await daysOff.save();
    res.json(daysOff);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getAll = async (req, res) => {
  try { res.json(await DaysOff.find().populate('employeeId', 'firstName lastName email')); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPending = async (req, res) => {
  try { res.json(await DaysOff.find({ status: 'pending' }).populate('employeeId', 'firstName lastName')); } catch (err) { res.status(500).json({ error: err.message }); }
};
