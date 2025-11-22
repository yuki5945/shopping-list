const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Helper to handle async errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all inventory (grouped by genre)
app.get('/api/inventory', asyncHandler(async (req, res) => {
    const sql = `
        SELECT 
            g.id as genre_id, g.name as genre_name, g."order" as genre_order,
            i.id as item_id, i.name as item_name, i.min_quantity, i.current_quantity, i."order" as item_order
        FROM genres g
        LEFT JOIN items i ON g.id = i.genre_id
        ORDER BY g."order", i."order"
    `;
    
    const result = await db.query(sql);
    const rows = result.rows;

    // Group by genre
    const inventory = [];
    const genreMap = new Map();

    rows.forEach(row => {
        if (!genreMap.has(row.genre_id)) {
            const genre = {
                id: row.genre_id,
                name: row.genre_name,
                order: row.genre_order,
                items: []
            };
            genreMap.set(row.genre_id, genre);
            inventory.push(genre);
        }
        if (row.item_id) {
            genreMap.get(row.genre_id).items.push({
                id: row.item_id,
                name: row.item_name,
                min_quantity: row.min_quantity,
                current_quantity: row.current_quantity,
                order: row.item_order
            });
        }
    });

    res.json({ data: inventory });
}));

// Get all genres
app.get('/api/genres', asyncHandler(async (req, res) => {
    const result = await db.query("SELECT * FROM genres ORDER BY \"order\"");
    res.json({ data: result.rows });
}));

// Add new item with dynamic genre creation
app.post('/api/items', asyncHandler(async (req, res) => {
    const { genre_name, name, min_quantity, current_quantity } = req.body;
    
    if (!genre_name || !name) {
        res.status(400).json({ error: "Genre name and Item name are required" });
        return;
    }

    // 1. Check if genre exists
    const genreRes = await db.query("SELECT id FROM genres WHERE name = ?", [genre_name]);
    let genreId;

    if (genreRes.rows.length > 0) {
        genreId = genreRes.rows[0].id;
    } else {
        // Create new genre
        let insertGenreSql = "INSERT INTO genres (name, \"order\") VALUES (?, 0)";
        if (db.isPostgres) insertGenreSql += " RETURNING id";
        
        const newGenreRes = await db.query(insertGenreSql, [genre_name]);
        genreId = newGenreRes.lastID;
    }

    // 2. Insert Item
    let insertItemSql = "INSERT INTO items (genre_id, name, min_quantity, current_quantity) VALUES (?, ?, ?, ?)";
    if (db.isPostgres) insertItemSql += " RETURNING id";

    const newItemRes = await db.query(insertItemSql, [genreId, name, min_quantity, current_quantity]);
    
    res.json({
        message: "success",
        data: { id: newItemRes.lastID, genre_id: genreId, ...req.body }
    });
}));

// Update item
app.put('/api/items/:id', asyncHandler(async (req, res) => {
    const { name, min_quantity, current_quantity, genre_id } = req.body;
    const sql = `UPDATE items SET name = ?, min_quantity = ?, current_quantity = ?, genre_id = ? WHERE id = ?`;
    const params = [name, min_quantity, current_quantity, genre_id, req.params.id];
    await db.query(sql, params);
    res.json({ message: "success" });
}));

// Delete item
app.delete('/api/items/:id', asyncHandler(async (req, res) => {
    const sql = `DELETE FROM items WHERE id = ?`;
    await db.query(sql, [req.params.id]);
    res.json({ message: "deleted" });
}));

// Batch update current quantities (Stocktaking)
app.post('/api/inventory/update', asyncHandler(async (req, res) => {
    const { updates } = req.body; // Array of { id, current_quantity }
    if (!updates || !Array.isArray(updates)) return res.status(400).json({ error: "Invalid input" });

    // Note: Transaction support is tricky with the unified adapter without more complexity.
    // For now, we'll execute sequentially. In a real app, we'd expose a transaction API.
    for (const update of updates) {
        await db.query("UPDATE items SET current_quantity = ? WHERE id = ?", [update.current_quantity, update.id]);
    }
    res.json({ message: "Batch update successful" });
}));

// Complete shopping
app.post('/api/shopping/complete', asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid input" });

    for (const item of items) {
        await db.query("UPDATE items SET current_quantity = current_quantity + ? WHERE id = ?", [item.purchased_quantity, item.id]);
    }
    res.json({ message: "Shopping completed" });
}));

// Reorder genres
app.put('/api/genres/reorder', asyncHandler(async (req, res) => {
    const { genres } = req.body;
    for (const genre of genres) {
        await db.query("UPDATE genres SET \"order\" = ? WHERE id = ?", [genre.order, genre.id]);
    }
    res.json({ message: "Genres reordered" });
}));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
