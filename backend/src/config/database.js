// Importing PostgresSqL library

const { Pool } = require('pg');
require('dotenv').config();

// load environment variables from .env file

// initializing connection pool with db credentials
// if env variables are not set use the default values
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'telemed',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

// call back fn if connected successfully.
pool.on('connect',()=>{
    console.log('Connected to database server');
});

// error call back fn.
pool.on('error',()=>{
    console.error('Database connection error:',err);
});

module.exports = pool;