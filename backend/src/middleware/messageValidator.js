const validateMessage = (req, res, next) => {
  const { consultationId, senderId, senderRole, content } = req.body;

  // Check all required fields are present
  if (!consultationId || !senderId || !senderRole || !content) {
    return res.status(400).json({
      error: 'Missing required fields: consultationId, senderId, senderRole, content'
    });
  }

  // Validate role value
  if (!['patient', 'doctor'].includes(senderRole)) {
    return res.status(400).json({
      error: 'senderRole must be either "patient" or "doctor"'
    });
  }

  // Check content isn't empty
  if (typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({
      error: 'Message content cannot be empty'
    });
  }

  next();
};

module.exports = validateMessage;
