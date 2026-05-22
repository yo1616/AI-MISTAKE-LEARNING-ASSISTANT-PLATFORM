const express = require('express');
const studentDashboardController = require('../../controllers/dashboard/studentDashboardController');

const router = express.Router({ mergeParams: true });

router.get('/', studentDashboardController.getDashboard);

module.exports = router;
