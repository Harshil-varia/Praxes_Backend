const express = require('express');
const { sendMessage, getMessages } = require('../controller/messageController');
const validateMessage = require('../middleware/messageValidator');

const router = express.Router();

// Send a new message
router.post('/messages', validateMessage, sendMessage);

// Get messages for a consultation
router.get('/consultations/:consultationId/messages', getMessages);

module.exports = router;