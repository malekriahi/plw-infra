const WFHPlan = require('../models/WFHPlan');

exports.request = async (req, res) => {
  try { const w = new WFHPlan(req.body); await w.save(); res.status(201).json(w); } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.approve = async (req, res) => {
  try {
    const w = await WFHPlan.findById(req.params.id);
    if (!w) return res.status(404).json({ error: 'Not found' });
    w.status = 'approved';
    w.approvedBy = req.body.approvedBy;
    w.approvedAt = new Date();
    await w.save();
    res.json(w);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.reject = async (req, res) => {
  try {
    const w = await WFHPlan.findById(req.params.id);
    if (!w) return res.status(404).json({ error: 'Not found' });
    w.status = 'rejected';
    await w.save();
    res.json(w);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getAll = async (req, res) => {
  try { res.json(await WFHPlan.find().populate('employeeId', 'firstName lastName')); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getToday = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    res.json(await WFHPlan.find({ date: { $gte: today, $lt: new Date(today.getTime() + 86400000) }, status: 'approved' }).populate('employeeId', 'firstName lastName'));
  } catch (err) { res.status(500).json({ error: err.message }); }
};
