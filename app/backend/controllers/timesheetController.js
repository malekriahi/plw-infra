const Timesheet = require('../models/Timesheet');

/** Return the Monday of the ISO week containing `date` (UTC midnight) */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * GET /api/timesheets/week?employeeId=&date=
 * Returns (or initialises) the timesheet for the week containing `date`.
 */
exports.getWeek = async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    if (!employeeId) return res.status(400).json({ message: 'employeeId required' });

    const weekStart = getWeekStart(date ? new Date(date) : new Date());

    let sheet = await Timesheet.findOne({ employeeId, weekStartDate: weekStart });
    if (!sheet) {
      // Return an empty draft without saving yet
      sheet = { employeeId, weekStartDate: weekStart, entries: [], status: 'draft', totalHours: 0 };
    }
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/timesheets/employee/:employeeId
 * Returns all timesheets for an employee, newest first.
 */
exports.getByEmployee = async (req, res) => {
  try {
    const sheets = await Timesheet
      .find({ employeeId: req.params.employeeId })
      .sort({ weekStartDate: -1 });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/timesheets/save
 * Upsert a timesheet in draft status (auto-save).
 * Body: { employeeId, weekStartDate, entries }
 */
exports.save = async (req, res) => {
  try {
    const { employeeId, weekStartDate, entries } = req.body;
    if (!employeeId || !weekStartDate) {
      return res.status(400).json({ message: 'employeeId and weekStartDate are required' });
    }

    const weekStart = getWeekStart(new Date(weekStartDate));

    const sheet = await Timesheet.findOneAndUpdate(
      { employeeId, weekStartDate: weekStart },
      { $set: { entries: entries || [], status: 'draft', updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/timesheets/submit
 * Submit a timesheet (locks it for admin review).
 * Body: { employeeId, weekStartDate, entries }
 */
exports.submit = async (req, res) => {
  try {
    const { employeeId, weekStartDate, entries } = req.body;
    if (!employeeId || !weekStartDate) {
      return res.status(400).json({ message: 'employeeId and weekStartDate are required' });
    }

    const weekStart = getWeekStart(new Date(weekStartDate));

    // Validate: each day total should equal 8h (warn but don't block)
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const dailyTotals = {};
    days.forEach(d => {
      dailyTotals[d] = (entries || []).reduce((s, e) => s + ((e.hours && e.hours[d]) || 0), 0);
    });

    const sheet = await Timesheet.findOneAndUpdate(
      { employeeId, weekStartDate: weekStart },
      {
        $set: {
          entries: entries || [],
          status: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ sheet, dailyTotals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/timesheets/all  (admin only)
 * Returns all submitted timesheets with populated employee info.
 */
exports.getAll = async (req, res) => {
  try {
    const { status, week } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (week) filter.weekStartDate = getWeekStart(new Date(week));

    const sheets = await Timesheet
      .find(filter)
      .populate('employeeId', 'firstName lastName department')
      .sort({ weekStartDate: -1, 'employeeId.lastName': 1 });

    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/timesheets/:id/approve  (admin only)
 */
exports.approve = async (req, res) => {
  try {
    const sheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved', approvedBy: req.body.adminId, updatedAt: new Date() } },
      { new: true }
    );
    if (!sheet) return res.status(404).json({ message: 'Timesheet not found' });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/timesheets/:id/reject  (admin only)
 */
exports.reject = async (req, res) => {
  try {
    const sheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'rejected', notes: req.body.reason || '', updatedAt: new Date() } },
      { new: true }
    );
    if (!sheet) return res.status(404).json({ message: 'Timesheet not found' });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
