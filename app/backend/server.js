const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/timesheets', require('./routes/timesheetRoutes'));
// Legacy alias kept for backwards-compat during transition
app.use('/api/timecards', require('./routes/timecardRoutes'));
app.use('/api/days-off', require('./routes/daysOffRoutes'));
app.use('/api/wfh', require('./routes/wfhRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appraisals', require('./routes/appraisalRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'v3', app: 'Planisware HR', timestamp: new Date() });
});

/**
 * POST /api/admin/accrue-leave
 * Adds 2.5 days to all active employees (call monthly via cron or manually).
 * Protected: must be called by an admin (checked via token role).
 */
app.post('/api/admin/accrue-leave', async (req, res) => {
  try {
    const Employee = require('./models/Employee');
    // Decode simple base64 token to get role
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const user = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString());
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const ACCRUAL = 2.5;
    const result = await Employee.updateMany(
      { isActive: true },
      { $inc: { remainingLeaveDays: ACCRUAL } }
    );
    res.json({ message: `Accrued ${ACCRUAL} days to ${result.modifiedCount} employees` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/admin/create-employee
 * Admin RH creates a new employee account with a specified password.
 */
app.post('/api/admin/create-employee', async (req, res) => {
  try {
    const Employee = require('./models/Employee');
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const caller = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString());
    if (caller.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { firstName, lastName, email, password, department, position, role, managerId } = req.body;
    if (!firstName || !lastName || !email || !password || !department || !position) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const emp = new Employee({
      firstName, lastName, email, password,
      department, position,
      role: role || 'employee',
      managerId: managerId || undefined
    });
    await emp.save();
    res.status(201).json({ message: 'Employee created', employee: { id: emp._id, email: emp.email, name: `${emp.firstName} ${emp.lastName}` } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const Employee = require('./models/Employee');
    const Timesheet = require('./models/Timesheet');
    const DaysOff = require('./models/DaysOff');
    const WFHPlan = require('./models/WFHPlan');
    const Interview = require('./models/Interview');
    res.json({
      totalEmployees: await Employee.countDocuments({ isActive: true }),
      pendingTimesheets: await Timesheet.countDocuments({ status: 'submitted' }),
      pendingDaysOff: await DaysOff.countDocuments({ status: 'pending' }),
      pendingWFH: await WFHPlan.countDocuments({ status: 'pending' }),
      todayInterviews: await Interview.countDocuments({
        scheduledDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log('🌸 Planisware HR Backend on port', PORT));
