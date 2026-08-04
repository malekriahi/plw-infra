const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const employee = new Employee({ ...rest, email, password: hashed });
    await employee.save();
    res.status(201).json({ message: 'Employee registered', employee: { id: employee._id, email } });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, employee.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: employee._id, role: employee.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, employee: { id: employee._id, email, firstName: employee.firstName, lastName: employee.lastName, role: employee.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAll = async (req, res) => {
  try { res.json(await Employee.find().select('-password').sort({ lastName: 1 })); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try { const e = await Employee.findById(req.params.id).select('-password'); e ? res.json(e) : res.status(404).json({ error: 'Not found' }); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try { res.json(await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')); } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try { await Employee.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); }
};
