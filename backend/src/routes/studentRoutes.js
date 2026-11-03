const express = require('express');
const studentController = require('../controllers/studentController');
const studentDashboardRoutes = require('./dashboard/studentDashboardRoutes');

const router = express.Router();

router.get('/', studentController.getStudents);
router.get('/:studentId', studentController.getStudentById);
router.use('/:studentId/dashboard', studentDashboardRoutes);
router.get('/:studentId/classes', studentController.getStudentClasses);
router.get('/:studentId/mistakes', studentController.getStudentMistakes);
router.get('/:studentId/concept-notes', studentController.getStudentConceptNotes);
router.get('/:studentId/favorites', studentController.getStudentFavoritesSummary);
router.get('/:studentId/favorites/mistakes', studentController.getStudentFavoriteMistakes);
router.get('/:studentId/favorites/concept-notes', studentController.getStudentFavoriteConceptNotes);
router.get('/:studentId/chat-sessions', studentController.getStudentChatSessions);
router.get('/:studentId/generated-exams', studentController.getStudentGeneratedExams);
router.get('/:studentId/analytics/summary', studentController.getStudentDashboardSummary);
router.get('/:studentId/analytics/charts', studentController.getStudentDashboardCharts);

module.exports = router;
