const pool = require('../config/database');

// Helper: figure out if sender is patient or doctor
function determineSenderRole(senderId, consultation) {
  if (senderId === consultation.patient_id) {
    return 'patient';
  } else if (senderId === consultation.doctor_id) {
    return 'doctor';
  }
  return null;
}

// Create new message
const createMessage = async (consultationId, senderId, messageText) => {
  const result = await pool.query(
    `INSERT INTO messages (consultation_id, sender_id, message_text)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [consultationId, senderId, messageText]
  );
  
  // Convert to camelCase for API response
  const msg = result.rows[0];
  return {
    id: msg.id,
    consultationId: msg.consultation_id,
    senderId: msg.sender_id,
    messageText: msg.message_text,
    sentAt: msg.sent_at
  };
};

// Get messages with role derived from consultation
const getMessagesByConsultation = async (consultationId, roleFilter = null) => {
  // First grab the consultation to know who's who
  const consultResult = await pool.query(
    'SELECT patient_id, doctor_id FROM consultations WHERE id = $1',
    [consultationId]
  );
  
  if (consultResult.rows.length === 0) {
    return null;
  }
  
  const consultation = consultResult.rows[0];
  
  // Get all messages for this consultation
  const msgResult = await pool.query(
    `SELECT * FROM messages 
     WHERE consultation_id = $1 
     ORDER BY sent_at ASC`,
    [consultationId]
  );
  
  // Add role to each message and convert to camelCase
  let messages = msgResult.rows.map(msg => {
    const role = determineSenderRole(msg.sender_id, consultation);
    return {
      id: msg.id,
      consultationId: msg.consultation_id,
      senderId: msg.sender_id,
      senderRole: role,
      messageText: msg.message_text,
      sentAt: msg.sent_at
    };
  });
  
  // Filter by role if requested
  if (roleFilter) {
    messages = messages.filter(msg => msg.senderRole === roleFilter);
  }
  
  return messages;
};

// Get consultation by ID
const getConsultationById = async (consultationId) => {
  const result = await pool.query(
    'SELECT * FROM consultations WHERE id = $1',
    [consultationId]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const c = result.rows[0];
  return {
    id: c.id,
    patientId: c.patient_id,
    doctorId: c.doctor_id,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
};

module.exports = {
  createMessage,
  getMessagesByConsultation,
  getConsultationById
};
