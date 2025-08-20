const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer();
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminController");

// Create product with file uploads
router.post(
  "/products",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 3 },
  ]),
  createProduct
);

// Get all products
router.get("/products", getAllProducts);

// Get single product
router.get("/products/:id", getSingleProduct);

// Update product
router.put("/products/:id", updateProduct);

// Delete product
router.delete("/products/:id", deleteProduct);

module.exports = router;
