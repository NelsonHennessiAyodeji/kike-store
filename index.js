require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

const adminRoute = require("./admin/routes/adminRoute");

// Serve static files (CSS, JS, images) from 'public'
app.use(express.static(path.join(__dirname, "public")));

// Route to serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to serve Admin HTML file
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.use("/admin-api", adminRoute);

app.listen(port, () => {
  console.log("Server listening on port 3000. http://localhost:3000");
});
