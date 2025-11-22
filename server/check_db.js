const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('shopping.db');

db.serialize(() => {
    db.all("SELECT * FROM genres", (err, rows) => {
        if (err) {
            console.log("Error:", err.message); // Likely table doesn't exist yet
        } else {
            console.log("Genres count:", rows.length);
            console.log("Genres:", rows);
        }
    });
});
