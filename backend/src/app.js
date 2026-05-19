const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const studentRoutes = require('./routes/studentRoutes');
const chatSessionRoutes = require('./routes/chatSessionRoutes');
const mistakeRoutes = require('./routes/mistakeRoutes');
const conceptNoteRoutes = require('./routes/conceptNoteRoutes');
const generatedExamRoutes = require('./routes/generatedExamRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/chat-sessions', chatSessionRoutes);
  app.use('/api/mistakes', mistakeRoutes);
  app.use('/api/concept-notes', conceptNoteRoutes);
  app.use('/api/generated-exams', generatedExamRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
