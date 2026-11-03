const express = require('express');
const generatedExamController = require('../controllers/generatedExamController');

const router = express.Router();

router.get('/:examId', generatedExamController.getGeneratedExamById);
router.get('/:examId/questions', generatedExamController.getGeneratedExamQuestions);
router.get('/:examId/source-mistakes', generatedExamController.getGeneratedExamSourceMistakes);

module.exports = router;
