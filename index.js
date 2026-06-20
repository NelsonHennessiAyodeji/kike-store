require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const adminRoute = require("./admin/routes/adminRoute");
const contactRoutes = require('./contact/contactRoutes');
const paymentRoutes = require('./payment/paymentRoutes');
const { ensureAdminUser } = require("./admin/setupAdmin");

// Ensures admin user exists in Supabase Auth (run once on startup)
ensureAdminUser().catch(console.error);

// Serve static files (CSS, JS, images) from 'public'
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin-api", adminRoute);
app.use('/contact', contactRoutes);
app.use('/payment', paymentRoutes);

// Route to serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/product", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "product.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.get("/shoping-cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "shoping-cart.html"));
});

app.get("/custom-order", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "custom-order.html"));
});

app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "terms.html"));
});

app.get("/store-policy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "store-policy.html"));
});

app.get("/return-policy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "return-policy.html"));
});

// Route to serve Admin HTML file - PROTECTED
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Route to serve Admin Products HTML file - PROTECTED
app.get("/admin-products.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-products.html"));
});

// Route to serve Admin Edit HTML file - PROTECTED
app.get("/admin-edit.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-edit.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
