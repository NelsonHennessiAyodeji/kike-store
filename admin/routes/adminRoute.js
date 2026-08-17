const express = require("express");
const multer = require("multer");
const { authenticateAdmin } = require("../middleware/authMiddleware");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  sortLowToHigh,
  sortByDate,
  sortByName,
  searchProducts,
  filterProducts,
} = require("../controllers/adminController");

const {
  getAllContent,
  getPageContent,
  updateContent,
  uploadContentImage,
} = require("../controllers/contentController");

const router = express.Router();
const upload = multer();

// Public routes for content (no auth required for reading)
router.get("/content/page/:page", getPageContent);

// Admin routes (auth required)
router.use(authenticateAdmin);

// Product routes
router.post(
  "/products",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 3 },
  ]),
  createProduct
);
router.get("/products", getAllProducts);
router.get("/products/search", searchProducts);
router.get("/products/filter", filterProducts);
router.get("/products/:id", getSingleProduct);
router.get("/products-sorted/price/:order", sortLowToHigh);
router.get("/products-sorted/date/:order", sortByDate);
router.get("/products-sorted/name/:order", sortByName);
router.put(
  "/products/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 3 },
  ]),
  updateProduct
);
router.delete("/products/:id", deleteProduct);

// Content management routes (admin only)
router.get("/content", getAllContent);
router.put("/content/:page/:section", upload.single("image"), updateContent);
router.post("/content/upload-image", upload.single("image"), uploadContentImage);

module.exports = router;
