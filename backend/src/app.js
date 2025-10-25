const express = require('express');
const cors = require('cors');
const pool = require('./config/database.js');
const app = express();
const createTables = require('./data/createTables.js');
const seedData = require('./data/seedData.js');

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/home', async (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: 'telemed_consultancy_backend'
    });
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            database: 'Connected Successfully',
            currentTime: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.post('/seed', async (req, res) => {
    try {
        await seedData();
        res.json({ message: 'Seed Data created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to seed data' });
    }
});

// start server first, then setup database
app.listen(PORT, async () => {
    console.log(`Telemed backend running on port ${PORT}`);
    console.log(`Running check: http://localhost:${PORT}/home`);
    
    try {
        await createTables();
        console.log('Database tables ready');
    } catch (err) {
        console.error('Failed to create tables:', err);
    }
});
