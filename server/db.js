const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const isPostgres = !!process.env.DATABASE_URL;
let pool;
let sqliteDb;

if (isPostgres) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log('Connected to PostgreSQL');
} else {
    const dbPath = path.resolve(__dirname, 'shopping.db');
    sqliteDb = new sqlite3.Database(dbPath);
    console.log('Connected to SQLite');
}

// Unified Query Interface
const query = (text, params = []) => {
    return new Promise((resolve, reject) => {
        if (isPostgres) {
            // Convert ? to $1, $2... for Postgres
            let paramCount = 1;
            const pgText = text.replace(/\?/g, () => `$${paramCount++}`);
            
            pool.query(pgText, params, (err, res) => {
                if (err) return reject(err);
                // For INSERT with RETURNING id, the id is in rows[0].id
                const lastID = res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : null;
                resolve({
                    rows: res.rows,
                    lastID: lastID,
                    rowCount: res.rowCount
                });
            });
        } else {
            // SQLite
            if (text.trim().toUpperCase().startsWith('SELECT')) {
                sqliteDb.all(text, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve({ rows });
                });
            } else {
                sqliteDb.run(text, params, function(err) {
                    if (err) return reject(err);
                    resolve({ 
                        rows: [], 
                        lastID: this.lastID,
                        changes: this.changes 
                    });
                });
            }
        }
    });
};

// Initialize Database
const initDb = async () => {
    const serialType = isPostgres ? 'SERIAL' : 'INTEGER';
    const autoIncrement = isPostgres ? '' : 'AUTOINCREMENT';

    const createGenres = `CREATE TABLE IF NOT EXISTS genres (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        name TEXT NOT NULL,
        "order" INTEGER DEFAULT 0
    )`;
    
    const createItems = `CREATE TABLE IF NOT EXISTS items (
        id ${serialType} PRIMARY KEY ${autoIncrement},
        genre_id INTEGER,
        name TEXT NOT NULL,
        min_quantity INTEGER DEFAULT 1,
        current_quantity INTEGER DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        FOREIGN KEY (genre_id) REFERENCES genres (id)
    )`;

    try {
        await query(createGenres);
        await query(createItems);
        console.log('Database tables initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

module.exports = { query, isPostgres };
