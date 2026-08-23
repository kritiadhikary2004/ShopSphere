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


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/views/home.html");

});


// ===============================
// REGISTRATION PAGE
// ===============================

app.get("/register", (req, res) => {

    res.sendFile(__dirname + "/views/register.html");

});


// ===============================
// REGISTRATION FORM SUBMISSION
// ===============================

app.post("/register", (req, res) => {

    const { name, email, password, role } = req.body;


    // Show registration details in terminal
    console.log("\n-----------------------------");
    console.log("New registration received");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Role:", role);
    console.log("-----------------------------");


    const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    `;


    db.query(
        sql,
        [name, email, password, role],
        (err, result) => {

            if (err) {

                console.log("Registration error:", err);

                return res.send(`
                    <h2>Registration Failed ❌</h2>
                    <p>${err.message}</p>
                    <a href="/register">Go Back</a>
                `);
            }


            // Successful registration
            console.log("Registration successful! ✅");
            console.log("New User ID:", result.insertId);
            console.log("-----------------------------\n");


            res.send(`
                <h2>Registration Successful! 🎉</h2>

                <p>Welcome to ShopSphere, ${name}!</p>

                <p>Account Type: ${role}</p>

                <br>

                <a href="/">Go to Home</a>
            `);

        }
    );

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});