const express = require("express");
const multer = require("multer");
const { authenticateAdmin } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer();

router.use(authenticateAdmin);

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

// Create product with file uploads
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

module.exports = router;
