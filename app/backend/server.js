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
app.use('/api/timecards', require('./routes/timecardRoutes'));
app.use('/api/days-off', require('./routes/daysOffRoutes'));
app.use('/api/wfh', require('./routes/wfhRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/appraisals', require('./routes/appraisalRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Planisware HR', timestamp: new Date() });
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const Employee = require('./models/Employee');
    const Timecard = require('./models/Timecard');
    const DaysOff = require('./models/DaysOff');
    const WFHPlan = require('./models/WFHPlan');
    const Interview = require('./models/Interview');
    res.json({
      totalEmployees: await Employee.countDocuments(),
      openTimecards: await Timecard.countDocuments({ status: 'open' }),
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
