const pool = require('../config/database');

const setupDB = async () => {
  try {
    // consultations table
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

    // messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        consultation_id UUID NOT NULL,
        sender_id VARCHAR(100) NOT NULL,
        message_text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // add foreign key constraint only if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_consultation_id'
        ) THEN
          ALTER TABLE messages 
          ADD CONSTRAINT fk_consultation_id 
          FOREIGN KEY (consultation_id) 
          REFERENCES consultations(id) 
          ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    console.log("Database tables script finished");
  } catch (err) {
    console.error("DB setup failed:", err);
    throw err;
  }
};

module.exports = setupDB;
