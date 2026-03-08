const express = require('express');
const router = express.Router();
const { generateProposal } = require('../controllers/proposalController');

router.post('/generate', generateProposal);

module.exports = router;
