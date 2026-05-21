const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/overview', dashboardController.getOverview);
router.get('/summary', dashboardController.getSummary);
router.get('/concepts-risk', dashboardController.getConceptsRisk);
router.get('/students', dashboardController.getStudents);
router.get('/students/:studentId/detail', dashboardController.getStudentDetail);
router.get('/students/:studentId/concepts', dashboardController.getStudentConcepts);
router.get('/students/:studentId/charts', dashboardController.getStudentCharts);

module.exports = router;
