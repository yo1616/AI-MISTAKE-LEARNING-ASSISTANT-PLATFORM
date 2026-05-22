const express = require('express');
const teacherDashboardController = require('../../controllers/dashboard/teacherDashboardController');

const router = express.Router();

router.get('/overview', teacherDashboardController.getOverview);
router.get('/summary', teacherDashboardController.getSummary);
router.get('/charts', teacherDashboardController.getClassCharts);
router.get('/concepts-risk', teacherDashboardController.getConceptsRisk);
router.get('/students', teacherDashboardController.getStudents);
router.get('/students/:studentId/detail', teacherDashboardController.getStudentDetail);
router.get('/students/:studentId/concepts', teacherDashboardController.getStudentConcepts);
router.get('/students/:studentId/charts', teacherDashboardController.getStudentCharts);

module.exports = router;
