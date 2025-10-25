const pool = require('../config/database');

async function seedDatabase() {
  try {
    // Clear existing data
    await pool.query('TRUNCATE TABLE messages, consultations CASCADE');
    
    // Consultation 1: Headache discussion
    const result1 = await pool.query(
      `INSERT INTO consultations (patient_id, doctor_id, status)
       VALUES ($1, $2, $3) RETURNING id`,
      ['P123', 'D456', 'active']
    );
    const consult1 = result1.rows[0].id;

    // Consultation 2: Random Medication side effects
    const result2 = await pool.query(
      `INSERT INTO consultations (patient_id, doctor_id, status)
       VALUES ($1, $2, $3) RETURNING id`,
      ['P789', 'D012', 'active']
    );
    const consult2 = result2.rows[0].id;

    console.log('Created 2 consultations');

    // Helper to create timestamps
    const now = Date.now();
    const minsAgo = (mins) => new Date(now - mins * 60000);

    // Consultation 1 messages
    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult1, 'P123', "Hi doctor, I've been having really bad headaches the past few days", minsAgo(35)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult1, 'D456', "Sorry to hear that. Can you describe the pain? Is it sharp, dull, or throbbing?", minsAgo(32)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult1, 'P123', "It's mostly throbbing, especially behind my eyes. Bright lights make it worse", minsAgo(28)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult1, 'D456', "That sounds like tension headaches, possibly migraines. Have you been more stressed than usual?", minsAgo(24)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult1, 'P123', "Yeah actually, work has been intense. Also been on screens way more than normal", minsAgo(20)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult1, 'D456', "That's likely the culprit. Try ibuprofen and take regular screen breaks. If it persists past a week, let's follow up", minsAgo(16)]
    );

    // Consultation 2 messages
    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'P789', "Morning doctor, quick question about the medication from last week", minsAgo(50)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'D012', "Good morning! What's going on with it?", minsAgo(47)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'P789', "I've been getting dizzy in the mornings. Is that expected?", minsAgo(43)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'D012', "Dizziness can happen initially. How bad is it? Can you still get through your day?", minsAgo(39)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'P789', "It's manageable, just wobbly when I stand up. Usually passes in a minute", minsAgo(35)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'D012', "That's orthostatic hypotension - pretty common with this med. Stand up slower and drink more water. Should improve in a couple weeks", minsAgo(31)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'P789', "Okay good to know. Anything else I should watch for?", minsAgo(27)]
    );

    await pool.query(
      `INSERT INTO messages (consultation_id, sender_id, message_text, sent_at)
       VALUES ($1, $2, $3, $4)`,
      [consult2, 'D012', "Monitor it, but if it worsens or you get chest pain or severe headaches, reach out immediately. Otherwise check in with me in 2 weeks", minsAgo(23)]
    );

    console.log('Seeded 14 messages across 2 consultations');

  } catch (err) {
    console.error('Seeding failed:', err.message);
    throw err;
  }
}

module.exports = seedDatabase;
