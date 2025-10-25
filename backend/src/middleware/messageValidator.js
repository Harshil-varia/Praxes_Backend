const validateMessage = (req, res, next) => {
  const { consultationId, authorId, authorRole, content } = req.body;
  
  // validation required fields.
  if (!consultationId || !authorId || !authorRole || !content) {
    return res.status(400).json({
      error: 'Missing required fields: consultationId, authorId, authorRole, content'
    });
  }
  
  if (!['patient', 'doctor'].includes(authorRole)) {
    return res.status(400).json({
      error: 'authorRole must be either "patient" or "doctor"'
    });
  }
  
  if (content.trim().length === 0) {
    return res.status(400).json({
      error: 'Message content cannot be empty'
    });
  }
  
  next();
};

module.exports = validateMessage;