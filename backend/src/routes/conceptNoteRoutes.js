const express = require('express');
const conceptNoteController = require('../controllers/conceptNoteController');

const router = express.Router();

router.get('/:noteId', conceptNoteController.getConceptNoteById);
router.get('/:noteId/related-mistakes', conceptNoteController.getRelatedMistakes);

module.exports = router;
