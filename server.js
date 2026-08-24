const express = require("express");
const mysql = require("mysql2");

const app = express();

const PORT = 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.urlencoded({ extended: true }));


// ===============================
// MYSQL CONNECTION
// ===============================

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


            console.log("Registration successful! ✅");
            console.log("New User ID:", result.insertId);
            console.log("-----------------------------\n");


            res.send(`
                <h2>Registration Successful! 🎉</h2>

                <p>Welcome to ShopSphere, ${name}!</p>

                <p>Account Type: ${role}</p>

                <br>

                <a href="/login">Login to your account</a>
                <br><br>
                <a href="/">Go to Home</a>
            `);

        }
    );

});


// ===============================
// LOGIN PAGE
// ===============================

app.get("/login", (req, res) => {

    res.sendFile(__dirname + "/views/login.html");

});


// ===============================
// LOGIN FORM SUBMISSION
// ===============================

app.post("/login", (req, res) => {

    const { email, password } = req.body;


    console.log("\n-----------------------------");
    console.log("Login attempt");
    console.log("Email:", email);
    console.log("-----------------------------");


    const sql = `
        SELECT * FROM users
        WHERE email = ? AND password = ?
    `;


    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.log("Login error:", err);

                return res.send(`
                    <h2>Login Failed ❌</h2>
                    <p>Something went wrong.</p>
                    <a href="/login">Try Again</a>
                `);

            }


            // User not found
            if (results.length === 0) {

                console.log("Login failed ❌ - Invalid email or password");

                return res.send(`
                    <h2>Login Failed ❌</h2>

                    <p>Invalid email or password.</p>

                    <br>

                    <a href="/login">Try Again</a>
                `);

            }


            // User found
            const user = results[0];


            console.log("Login successful! ✅");
            console.log("User:", user.name);
            console.log("Role:", user.role);
            console.log("-----------------------------\n");


            res.send(`
                <h2>Login Successful! 🎉</h2>

                <p>Welcome back, ${user.name}!</p>

                <p>Account Type: ${user.role}</p>

                <br>

                <a href="/">Go to Home</a>
            `);

        }
    );

});


// ===============================
// PRODUCTS PAGE
// ===============================

app.get("/products", (req, res) => {

    res.sendFile(__dirname + "/views/products.html");

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});