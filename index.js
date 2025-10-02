require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const adminRoute = require("./admin/routes/adminRoute");

// Serve static files (CSS, JS, images) from 'public'
app.use(express.static(path.join(__dirname, "public")));

// Route to serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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

app.use("/admin-api", adminRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
