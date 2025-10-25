const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const setupTables = require('./data/createTables');
const seedDatabase = require('./data/seedData');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', messageRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// seed test data
app.post('/dev/seed', async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: 'Database seeded successfully' });
    } catch (err) {
      console.error('Seed error:', err);
      res.status(500).json({ error: 'Failed to seed database' });
    }
  });

  app.get('/dev/data', async (req, res) => {
    try {
      const consultations = await pool.query('SELECT * FROM consultations');
      const messages = await pool.query('SELECT * FROM messages ORDER BY sent_at');
      
      res.json({
        consultations: consultations.rows,
        messages: messages.rows
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server after DB setup
async function startServer() {
  try {
    await setupTables();
    console.log('Database ready');
    
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Seed data: POST http://localhost:${PORT}/dev/seed\n`);
      }
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
