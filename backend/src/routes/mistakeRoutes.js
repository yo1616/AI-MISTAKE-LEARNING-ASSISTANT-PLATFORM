const express = require('express');
const mistakeController = require('../controllers/mistakeController');

const router = express.Router();

router.get('/:mistakeRecordId', mistakeController.getMistakeById);
router.get('/:mistakeRecordId/related-notes', mistakeController.getRelatedNotes);
router.patch('/:mistakeRecordId/star', mistakeController.updateMistakeStar);

module.exports = router;
