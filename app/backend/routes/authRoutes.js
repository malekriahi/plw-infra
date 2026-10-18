const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    let user = await Employee.findOne({ email });
    if (!user) {
      // Auto-create admin user on first login
      user = new Employee({
        firstName: 'Admin',
        lastName: 'User',
        email,
        password,
        department: 'IT',
        position: 'Administrator',
        role: 'admin'
      });
      await user.save();
    } else {
      // Simple password check (plain text for demo)
      if (user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = Buffer.from(JSON.stringify({ id: user._id, email: user.email, name: user.firstName + ' ' + user.lastName, role: user.role })).toString('base64');
    res.json({ token, user: { id: user._id, name: user.firstName + ' ' + user.lastName, email: user.email, role: user.role, department: user.department } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/register', async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const { firstName, lastName, email, password, department, position, role } = req.body;
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const user = new Employee({ firstName, lastName, email, password, department: department || 'General', position: position || 'Employee', role: role || 'employee' });
    await user.save();
    const token = Buffer.from(JSON.stringify({ id: user._id, email: user.email, name: user.firstName + ' ' + user.lastName, role: user.role })).toString('base64');
    res.status(201).json({ token, user: { id: user._id, name: user.firstName + ' ' + user.lastName, email: user.email } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  try {
    const user = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString());
    res.json(user);
  } catch { res.status(401).json({ message: 'Invalid token' }); }
});

router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));
module.exports = router;
