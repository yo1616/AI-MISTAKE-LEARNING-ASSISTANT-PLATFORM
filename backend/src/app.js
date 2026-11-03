const express = require('express');
const cors = require('cors');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const studentRoutes = require('./routes/studentRoutes');
const chatSessionRoutes = require('./routes/chatSessionRoutes');
const mistakeRoutes = require('./routes/mistakeRoutes');
const conceptNoteRoutes = require('./routes/conceptNoteRoutes');
const generatedExamRoutes = require('./routes/generatedExamRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  const workspaceRoot = path.join(__dirname, '..', '..');
  const teacherDashboardDir = path.join(workspaceRoot, 'frontend', 'teacherDashboard');
  const studentBuildDir = path.join(workspaceRoot, 'frontend', 'studentMobile', 'build');
  const sendStudentIndex = (res) => {
    res.sendFile(path.join(studentBuildDir, 'index.html'), (error) => {
      if (error) {
        res.status(503).send(
          'Student web app build not found. Run "npm install" and "npm start" or "npm run build" in frontend/studentMobile first.'
        );
      }
    });
  };

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api', healthRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api', dictionaryRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/chat-sessions', chatSessionRoutes);
  app.use('/api/mistakes', mistakeRoutes);
  app.use('/api/concept-notes', conceptNoteRoutes);
  app.use('/api/generated-exams', generatedExamRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use('/teacher', express.static(teacherDashboardDir));
  app.get('/teacher', (req, res) => {
    res.redirect('/teacher/');
  });

  app.use('/student', express.static(studentBuildDir));
  app.get('/student', (req, res) => sendStudentIndex(res));
  app.get('/student/*', (req, res) => sendStudentIndex(res));

  app.get('/', (req, res) => {
    res.type('html').send(`
      <!doctype html>
      <html lang="zh-Hant">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Mistake Learning System</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #f5f7fb; color: #111827; }
            main { max-width: 900px; margin: 48px auto; padding: 0 20px; }
            .card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); margin-bottom: 20px; }
            a { color: #2563eb; text-decoration: none; }
            code { background: #eef2ff; padding: 2px 6px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <main>
            <div class="card">
              <h1>Mistake Learning System</h1>
              <p>Teacher dashboard: <a href="/teacher/">/teacher/</a></p>
              <p>Student mobile web: <a href="/student">/student</a> or React dev server at <code>http://localhost:3000</code></p>
              <p>API health: <a href="/api/health">/api/health</a></p>
              <p>AI status: <a href="/api/ai/status">/api/ai/status</a></p>
            </div>
          </main>
        </body>
      </html>
    `);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
