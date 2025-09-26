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
  sortLowToHigh,
  sortByDate,
  sortByName,
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

router.get("/products-sorted/price/:order", sortLowToHigh);

router.get("/products-sorted/date/:order", sortByDate);

router.get("/products-sorted/name/:order", sortByName);

// Update product
router.put(
  "/products/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 3 },
  ]),
  updateProduct
);

// Delete product
router.delete("/products/:id", deleteProduct);

module.exports = router;
