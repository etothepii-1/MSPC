const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
mongoose.set('strictQuery', false);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.get('/get-client-id', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

const userSchema = new mongoose.Schema({
  name: String,
  sub: String,
  id: String,
  total_score: Number,
  score_update: Date,
  problem_score: Map,
  language: String,
  position: String,
});
const User = mongoose.model('User', userSchema);

app.post('/user-register', async (req, res) => {
  try {
    const userName = req.body.user_name;
    const userSub = req.body.user_sub;
    const user = await User.findOne({ sub: userSub });
    if (!user) {
      const newUser = new User({
        name: userName,
        sub: userSub,
        id: userName,
        total_score: 0,
        score_update: new Date(),
        problem_score: {},
        language: 'c',
        position: '',
      });
      await newUser.save();
      res.json({ id: userName });
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get-user', async (req, res) => {
  try {
    const userSub = req.body.user_sub;
    const user = await User.findOne({ sub: userSub });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const problemSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  input: String,
  output: String,
  sample_input: [String],
  sample_output: [String],
  time_limit: Number,
  score: Number,
});
const Problem = mongoose.model('Problem', problemSchema);
const problem15 = new Problem({
  id: 15,
  title: '',
  description: '',
  input: '',
  output: '',
  sample_input: [''],
  sample_output: [''],
  time_limit: 1,
  score: 50,
});

const testdataSchema = new mongoose.Schema({
  id: Number,
  input: [String],
  output: [String],
  time_limit: String,
});
const Testdata = mongoose.model('Testdata', testdataSchema);
const testdata15 = new Testdata({
  id: 15,
  input: [''],
  output: [''],
  time_limit: '1',
});

app.get('/problems', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'problems.html'));
});

app.get('/get-all-problems', async (req, res) => {
  try {
    const currentDate = new Date();
    const startDate = new Date(process.env.START_DATE);
    if (currentDate >= startDate) {
      const problems = await Problem.find({}, { _id: 0 }).sort({ id: 1 });
      res.json(problems);
    } else res.json({ started: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/problems/:id', (req, res) => {
  const currentDate = new Date();
  const startDate = new Date(process.env.START_DATE);
  if (currentDate >= startDate) {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'problem.html'));
  } else res.end();
});

app.post('/problem-exists', async (req, res) => {
  try {
    const currentDate = new Date();
    const startDate = new Date(process.env.START_DATE);
    if (currentDate >= startDate) {
      const { problemId } = req.body;
      const exists = await Problem.exists({ id: problemId });
      res.json({ exists });
    } else res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/get-problem', async (req, res) => {
  try {
    const currentDate = new Date();
    const startDate = new Date(process.env.START_DATE);
    if (currentDate >= startDate) {
      const problemId = req.body.problem_id;
      const problem = await Problem.findOne({ id: problemId });
      res.json(problem);
    } else res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const submissionSchema = new mongoose.Schema({
  user_name: String,
  problem_id: Number,
  code: String,
  language: Number,
  status: Number,
  date: Date,
});
const Submission = mongoose.model('Submission', submissionSchema);

app.post('/submit', async (req, res) => {
  try {
    const { userSub, problemId, language, code } = req.body;
    const problem = await Problem.findOne({ id: problemId });
    const problemScore = problem.score;
    const user = await User.findOne({ sub: userSub });
    const userProblemsScore = new Map(user.problem_score);
    const userProblemScore = userProblemsScore.get(problemId) ?? 0;
    const testdata = await Testdata.findOne({ id: problemId });
    const submissions = {
      submissions: testdata.input.map((stdin, index) => ({
        language_id: language,
        source_code: code,
        stdin,
        expected_output: testdata.output[index],
        cpu_time_limit: testdata.time_limit,
      })),
    };

    const judge0Response = await fetch('http://localhost:2358/submissions/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissions),
    });

    const tokens = await judge0Response.json();
    const results = await Promise.all(
      tokens.map(async ({ token }) => {
        let result;
        while (true) {
          const response = await fetch(`http://localhost:2358/submissions/${token}`);
          result = await response.json();
          if (result.hasOwnProperty('error')) {
            return { status: { id: 13 } };
          } else if (result.status.id === 1 || result.status.id === 2) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          } else {
            break;
          }
        }
        return result;
      })
    );

    const statusId = Math.max(...results.map((result) => result.status.id));
    const scoreIncrease = problemScore - userProblemScore;
    const currentDate = new Date();
    const endDate = new Date(process.env.END_DATE);
    if (statusId === 3 && scoreIncrease !== 0 && currentDate < endDate) {
      await User.findOneAndUpdate({ sub: userSub }, { $inc: { total_score: scoreIncrease } }, { new: true });
      await User.findOneAndUpdate({ sub: userSub }, { $set: { [`problem_score.${problemId}`]: problemScore } }, { new: true });
      await User.findOneAndUpdate({ sub: userSub }, { score_update: new Date() }, { new: true });
    }
    const userName = user.name;
    const submission = new Submission({
      user_name: userName,
      problem_id: problemId,
      code: code,
      language: language,
      status: statusId,
      date: currentDate,
    });
    await submission.save();
    res.json({ result: statusId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'leaderboard.html'));
});

app.post('/get-all-users', async (req, res) => {
  try {
    const { userSub } = req.body;
    const usersWithSub = await User.find({ position: { $ne: 'Admin' } }, {}).sort({
      total_score: -1,
      score_update: 1,
    });
    const userIndex = usersWithSub.findIndex((user) => user.sub === userSub);
    const users = await User.find({ position: { $ne: 'Admin' } }, { name: 0, sub: 0, _id: 0 }).sort({
      total_score: -1,
      score_update: 1,
    });
    res.json({ users: users, user_index: userIndex });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/contact_us', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'contact-us.html'));
});

const inquirySchema = new mongoose.Schema({
  user_id: String,
  content: String,
});
const Inquiry = mongoose.model('Inquiry', inquirySchema);

app.post('/inquiry', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const newInquiry = new Inquiry({ user_id: userId, content: content });
    await newInquiry.save();
    res.redirect('/contact_us');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'settings.html'));
});

app.post('/change-id', async (req, res) => {
  try {
    const { user_sub, id } = req.body;
    await User.findOneAndUpdate({ sub: user_sub }, { id }, { new: true });
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/change-language', async (req, res) => {
  try {
    const { user_sub, language } = req.body;
    await User.findOneAndUpdate({ sub: user_sub }, { language }, { new: true });
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 8080;
const MONGODB_CONNECTION = process.env.MONGODB_CONNECTION;
const start = async () => {
  try {
    await mongoose.connect(MONGODB_CONNECTION);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Listening on ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
};

start();
