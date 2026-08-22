const express = require("express");
const mysql = require("mysql2");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "shopsphere_db"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL database connected successfully!");
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/home.html");
});

// Registration page
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/views/register.html");
});

// Registration form submission
app.post("/register", (req, res) => {

    const { name, email, password, role } = req.body;

    const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, password, role], (err, result) => {

        if (err) {
            console.log("Registration error:", err);
            return res.send("Registration failed.");
        }

        res.send("Registration successful! Welcome to ShopSphere.");
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});