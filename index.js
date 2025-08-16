const express = require("express");

const app = express();
const port = 3000;

app.get("/", () => {});

app.listen(port, () => {
  console.log("Server listening on port 3000. http://localhost:3000");
});
