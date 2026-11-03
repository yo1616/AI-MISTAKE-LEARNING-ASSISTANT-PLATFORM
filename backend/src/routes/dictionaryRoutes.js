const express = require('express');
const dictionaryController = require('../controllers/dictionaryController');

const router = express.Router();

router.get('/subjects', dictionaryController.getSubjects);
router.get('/subjects/:subjectId/units', dictionaryController.getUnitsBySubjectId);
router.get('/units/:unitId/subunits', dictionaryController.getSubUnitsByUnitId);
router.get('/units/:unitId/sub-units', dictionaryController.getSubUnitsByUnitId);
router.get('/concepts', dictionaryController.getConcepts);

module.exports = router;
