const Interview = require('../models/Interview');

exports.create = async (req, res) => {
  try { const i = new Interview(req.body); await i.save(); res.status(201).json(i); } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getAll = async (req, res) => {
  try { res.json(await Interview.find().populate('interviewers feedback.interviewerId', 'firstName lastName')); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try { const i = await Interview.findById(req.params.id).populate('interviewers', 'firstName lastName'); i ? res.json(i) : res.status(404).json({ error: 'Not found' }); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try { res.json(await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.addFeedback = async (req, res) => {
  try {
    const i = await Interview.findById(req.params.id);
    if (!i) return res.status(404).json({ error: 'Not found' });
    i.feedback.push(req.body);
    await i.save();
    res.json(i);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try { await Interview.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); }
};
