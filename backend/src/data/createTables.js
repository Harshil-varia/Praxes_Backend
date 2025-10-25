const pool = require('../config/database');

async function setupTables() {
  try {
    // Consultations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(100) NOT NULL,
        doctor_id VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✓ Consultations table created');

    // Messages table 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
        sender_id VARCHAR(100) NOT NULL,
        message_text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Messages table created');

    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_consultation 
      ON messages(consultation_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sent_at 
      ON messages(sent_at DESC)
    `);

    console.log('✓ Indexes created');
    console.log('Database setup complete');

  } catch (err) {
    console.error('Failed to create tables:', err.message);
    throw err;
  }
}

module.exports = setupTables;
