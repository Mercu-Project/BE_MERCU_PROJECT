const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_NAME, DB_USER, DB_PASS, DB_PORT, DB_HOST } = process.env;

const db = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    connectionLimit: 10,
});

module.exports = db;
