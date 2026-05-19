const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.get('/:studentId', studentController.getStudentById);
router.get('/:studentId/classes', studentController.getStudentClasses);
router.get('/:studentId/mistakes', studentController.getStudentMistakes);
router.get('/:studentId/concept-notes', studentController.getStudentConceptNotes);
router.get('/:studentId/chat-sessions', studentController.getStudentChatSessions);

module.exports = router;
