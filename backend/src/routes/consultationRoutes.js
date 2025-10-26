const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all consultations
router.get('/consultations', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM consultations ORDER BY created_at DESC'
    );
    
    // convert to camelCase for consistency
    const consultations = result.rows.map(c => ({
      id: c.id,
      patientId: c.patient_id,
      doctorId: c.doctor_id,
      status: c.status,
      createdAt: c.created_at
    }));
    
    res.json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Create new consultation
router.post('/consultations', async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    
    if (!patientId || !doctorId) {
      return res.status(400).json({ 
        error: 'Both patientId and doctorId are required' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO consultations (patient_id, doctor_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patientId, doctorId, 'active']
    );
    
    const consult = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: consult.id,
        patientId: consult.patient_id,
        doctorId: consult.doctor_id,
        status: consult.status,
        createdAt: consult.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

module.exports = router;
