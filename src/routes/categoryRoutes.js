const express = require('express');
const router = express.Router();
const { generateCategory } = require('../controllers/categoryController');

router.post('/generate', generateCategory);

module.exports = router;
