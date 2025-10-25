const pool = require('../config/database');

// Create a new message
const createMessage = async (consultationId, authorId, authorRole, content) => {
  const result = await pool.query(
    `INSERT INTO messages (consultation_id, author_id, author_role, content) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [consultationId, authorId, authorRole, content]
  );
  return result.rows[0];
};

// Filter message according to role
const getMessagesByConsultation = async (consultationId, authorRole = null) => {
  let query = `SELECT * FROM messages WHERE consultation_id = $1`;
  const params = [consultationId];
  
  if (authorRole) {
    query += ` AND author_role = $2`;
    params.push(authorRole);
  }
  
  query += ` ORDER BY sent_at ASC`;
  
  const result = await pool.query(query, params);
  return result.rows;
};

// Check if consultation exists
const getConsultationById = async (consultationId) => {
  const result = await pool.query(
    "SELECT * FROM consultations WHERE id = $1",
    [consultationId]
  );
  return result.rows[0];
};

module.exports = {
  createMessage,
  getMessagesByConsultation,
  getConsultationById
};