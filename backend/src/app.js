const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const createTables = require('./data/createTables');
const seedData = require('./data/seedData');

// Import routes
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'telemed-messages-backend'
  });
});

// Database test
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      database: 'Connected successfully',
      currentTime: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Seed data (remove in production)
app.get('/seed', async (req, res) => {
  try {
    await seedData();
    res.json({ message: 'Seed data created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed data: ' + error.message });
  }
});

// Debug endpoint
app.get('/debug-data', async (req, res) => {
  try {
    const consultations = await pool.query('SELECT * FROM consultations');
    const messages = await pool.query('SELECT * FROM messages ORDER BY sent_at');
    
    res.json({
      consultations: consultations.rows,
      messages: messages.rows,
      consultationCount: consultations.rows.length,
      messageCount: messages.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
createTables().then(() => {
  console.log('Database tables ready');
  app.listen(PORT, () => {
    console.log(`Telemed messages backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error('Failed to create tables:', err);
  process.exit(1);
});