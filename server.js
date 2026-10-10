
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ===============================
// MYSQL CONNECTION
// ===============================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "shopsphere_db"
});


// ===============================
// CONNECT TO MYSQL
// ===============================

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
    res.sendFile(path.join(__dirname, "views", "home.html"));
});


// ===============================
// REGISTER PAGE
// ===============================

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});


// ===============================
// REGISTER FORM
// ===============================

app.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;

    console.log("New registration:", name, email, role);

    const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, password, role], (err, result) => {
        if (err) {
            console.log("Registration error:", err);

            return res.send(`
                <h2>Registration Failed ❌</h2>
                <p>Something went wrong during registration.</p>
                <a href="/register">Go Back</a>
            `);
        }

        console.log("Registration successful! ✅");
        console.log("New User ID:", result.insertId);

        res.send(`
            <h2>Registration Successful! 🎉</h2>
            <p>Welcome to ShopSphere, ${name}!</p>
            <p>Account Type: ${role}</p>
            <br>
            <a href="/login">Login to your account</a>
            <br><br>
            <a href="/">Go to Home</a>
        `);
    });
});


// ===============================
// LOGIN PAGE
// ===============================

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});


// ===============================
// LOGIN FORM
// ===============================

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const sql = `
        SELECT * FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.log("Login error:", err);

            return res.send(`
                <h2>Login Failed ❌</h2>
                <p>Something went wrong.</p>
                <a href="/login">Try Again</a>
            `);
        }

        if (results.length === 0) {
            return res.send(`
                <h2>Login Failed ❌</h2>
                <p>Invalid email or password.</p>
                <a href="/login">Try Again</a>
            `);
        }

        const user = results[0];

        console.log("Login successful! ✅");
        console.log("User:", user.name);
        console.log("Role:", user.role);

        // CUSTOMER
        if (user.role === "customer") {
            return res.redirect("/customer-dashboard");
        }

        // SELLER
        if (user.role === "seller") {
            return res.send(`
                <h2>Seller Login Successful! 🎉</h2>
                <p>Welcome, ${user.name}!</p>
                <p>You are logged in as a Seller.</p>
                <br>
                <a href="/seller-dashboard">Go to Seller Dashboard</a>
                <br><br>
                <a href="/">Go to Home</a>
            `);
        }

        // ADMIN / OTHER ROLE
        return res.send(`
            <h2>Login Successful!</h2>
            <a href="/">Go to Home</a>
        `);
    });
});


// ===============================
// CUSTOMER DASHBOARD
// ===============================

app.get("/customer-dashboard", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "customer-dashboard.html")
    );
});


// ===============================
// SELLER DASHBOARD
// ===============================

app.get("/seller-dashboard", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "seller-dashboard.html")
    );
});


// ===============================
// PRODUCTS PAGE
// ===============================

app.get("/products", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "products.html"));
});


// ===============================
// GET PRODUCTS FROM MYSQL
// ===============================

app.get("/api/products", (req, res) => {
    const sql = `
        SELECT *
        FROM products
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Products fetch error:", err);

            return res.status(500).json({
                message: "Failed to fetch products."
            });
        }

        res.json(results);
    });
});


// ===============================
// DELETE PRODUCT FROM MYSQL
// ===============================

app.delete("/api/products/:id", (req, res) => {
    const productId = Number(req.params.id);

    // Check whether the product ID is valid
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            message: "Invalid product ID."
        });
    }

    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.log("Product delete error:", err);

            return res.status(500).json({
                message: "Failed to delete product."
            });
        }

        // Check whether the product exists
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        console.log("Product deleted successfully. ID:", productId);

        return res.json({
            message: "Product deleted successfully."
        });
    });
});


// ===============================
// ADD PRODUCT PAGE
// ===============================

app.get("/add-product", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "add-product.html")
    );
});


// ===============================
// ADD PRODUCT FORM
// ===============================

app.post("/add-product", (req, res) => {
    const {
        name,
        description,
        price,
        stock,
        category,
        image_url
    } = req.body;

    console.log("New product:", name);

    const sql = `
        INSERT INTO products
        (name, description, price, stock, category, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, description, price, stock, category, image_url],
        (err, result) => {
            if (err) {
                console.log("Product insert error:", err);

                return res.send(`
                    <h2>Product Add Failed ❌</h2>
                    <p>Something went wrong while adding the product.</p>
                    <br>
                    <a href="/add-product">Go Back</a>
                `);
            }

            console.log("Product added successfully! ✅");
            console.log("Product ID:", result.insertId);

            res.send(`
                <h2>Product Added Successfully! 🎉</h2>
                <p>Your product <strong>${name}</strong> has been added.</p>
                <br>
                <a href="/add-product">Add Another Product</a>
                <br><br>
                <a href="/products">View Products</a>
                <br><br>
                <a href="/seller-dashboard">Back to Seller Dashboard</a>
            `);
        }
    );
});


// ===============================
// CART PAGE
// ===============================

app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "cart.html"));
});


// ===============================
// CHECKOUT PAGE
// ===============================

app.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "checkout.html"));
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
