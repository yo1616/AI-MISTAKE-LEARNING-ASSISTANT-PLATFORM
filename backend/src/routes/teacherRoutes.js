const express = require('express');
const teacherController = require('../controllers/teacherController');

const router = express.Router();

router.get('/classes', teacherController.getClasses);

module.exports = router;
