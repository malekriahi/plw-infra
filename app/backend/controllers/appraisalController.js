const Appraisal = require('../models/Appraisal');

exports.create = async (req, res) => {
  try { const a = new Appraisal(req.body); await a.save(); res.status(201).json(a); } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getAll = async (req, res) => {
  try { res.json(await Appraisal.find().populate('employeeId reviewerId', 'firstName lastName')); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getById = async (req, res) => {
  try { const a = await Appraisal.findById(req.params.id).populate('employeeId reviewerId', 'firstName lastName'); a ? res.json(a) : res.status(404).json({ error: 'Not found' }); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getByEmployee = async (req, res) => {
  try { res.json(await Appraisal.find({ employeeId: req.params.employeeId }).populate('reviewerId', 'firstName lastName')); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.submitSelfEval = async (req, res) => {
  try {
    const a = await Appraisal.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.selfEvaluation = req.body;
    a.status = 'submitted';
    await a.save();
    res.json(a);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.submitManagerEval = async (req, res) => {
  try {
    const a = await Appraisal.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.managerEvaluation = req.body;
    a.status = 'reviewed';
    await a.save();
    res.json(a);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.complete = async (req, res) => {
  try {
    const a = await Appraisal.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.status = 'completed';
    a.finalRating = (a.selfEvaluation.rating + a.managerEvaluation.rating) / 2;
    await a.save();
    res.json(a);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try { await Appraisal.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (err) { res.status(500).json({ error: err.message }); }
};
