const express = require('express');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {
    status: 'ok',
    service: 'mistake-learning-system-backend',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
