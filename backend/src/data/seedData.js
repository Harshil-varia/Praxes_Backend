const pool = require('../config/database.js');

const seedData = async () => {
  try {
    // clear existing data
    await pool.query('DELETE FROM messages');
    await pool.query('DELETE FROM consultations');

    // Example 1
    const consult1 = await pool.query(
      `INSERT INTO consultations (patient_id, doctor_id, status) 
       VALUES ($1, $2, $3) RETURNING id`,
      ['patient_123', 'doctor_456', 'active']
    );

    // Example 2
    const consult2 = await pool.query(
      `INSERT INTO consultations (patient_id, doctor_id, status) 
       VALUES ($1, $2, $3) RETURNING id`,
      ['patient_789', 'doctor_012', 'active']
    );

    const c1 = consult1.rows[0].id;
    const c2 = consult2.rows[0].id;

    // Example 3
    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c1, 'patient_123', "Hi doctor, I've been having bad headaches for 3 days now", new Date(Date.now() - 30 * 60000)]
    );
    
    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c1, 'doctor_456', "Can you describe the pain? Where exactly does it hurt?", new Date(Date.now() - 28 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c1, 'patient_123', "It's behind my eyes mostly. Throbbing pain.", new Date(Date.now() - 25 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c1, 'doctor_456', "Are you sensitive to light? Any nausea?", new Date(Date.now() - 22 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c1, 'patient_123', "Yes light bothers me but no nausea", new Date(Date.now() - 20 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c1, 'doctor_456', "This sounds like migraine. Let's discuss treatment options.", new Date(Date.now() - 15 * 60000)]
    );

    // consultation 2 messages - medication side effects
    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'patient_789', "Dr. Rodriguez, I started the blood pressure meds you prescribed", new Date(Date.now() - 40 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'doctor_012', "Good! How are you feeling so far?", new Date(Date.now() - 38 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'patient_789', "I'm getting dizzy and feel tired all the time", new Date(Date.now() - 35 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'doctor_012', "How bad is the dizziness?", new Date(Date.now() - 32 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'patient_789', "Pretty bad when I stand up quickly", new Date(Date.now() - 30 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'doctor_012', "That's a common side effect. Try standing up slowly and drink more water.", new Date(Date.now() - 25 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'patient_789', "Should I be worried about this?", new Date(Date.now() - 20 * 60000)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at) 
       VALUES ($1, $2, $3, $4)`,
      [c2, 'doctor_012', "Usually it goes away after a week or two. Call me if you feel like you're going to faint.", new Date(Date.now() - 15 * 60000)]
    );

    console.log('Seeded:', c1, c2);

  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedData;
