const express = require('express');
const conceptNoteController = require('../controllers/conceptNoteController');

const router = express.Router();

router.post('/', conceptNoteController.createConceptNote);
router.get('/:noteId', conceptNoteController.getConceptNoteById);
router.get('/:noteId/related-mistakes', conceptNoteController.getRelatedMistakes);
router.patch('/:noteId/star', conceptNoteController.updateConceptNoteStar);

module.exports = router;
