const Timecard = require('../models/Timecard');

exports.clockIn = async (req, res) => {
  try {
    const { employeeId, notes } = req.body;
    const existing = await Timecard.findOne({ employeeId, status: 'open' });
    if (existing) return res.status(400).json({ error: 'Already clocked in' });
    const timecard = new Timecard({ employeeId, date: new Date(), clockIn: new Date(), status: 'open', notes });
    await timecard.save();
    res.status(201).json(timecard);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.clockOut = async (req, res) => {
  try {
    const timecard = await Timecard.findById(req.params.id);
    if (!timecard) return res.status(404).json({ error: 'Not found' });
    if (timecard.status === 'closed') return res.status(400).json({ error: 'Already clocked out' });
    timecard.clockOut = new Date();
    timecard.totalHours = (timecard.clockOut - timecard.clockIn) / 3600000;
    timecard.status = 'closed';
    await timecard.save();
    res.json(timecard);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getByEmployee = async (req, res) => {
  try { res.json(await Timecard.find({ employeeId: req.params.employeeId }).sort({ date: -1 }).limit(30)); } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStats = async (req, res) => {
  try { res.json({ open: await Timecard.countDocuments({ status: 'open' }), total: await Timecard.countDocuments() }); } catch (err) { res.status(500).json({ error: err.message }); }
};
