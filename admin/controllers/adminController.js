const ProductService = require("../service/adminService");

// Create product with file uploads
const createProduct = async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body, req.files);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product
const getSingleProduct = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ error: "Product not found" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    const parseArrayField = (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      if (trimmed === "") return [];
      return trimmed.split(",").map((item) => item.trim());
    };

    if ("sizes" in updates) updates.sizes = parseArrayField(updates.sizes);
    if ("colors" in updates) updates.colors = parseArrayField(updates.colors);
    if ("tags" in updates) updates.tags = parseArrayField(updates.tags);
    // Added for category and brand
    if ("category" in updates)
      updates.category = parseArrayField(updates.category);
    if ("brand" in updates) updates.brand = parseArrayField(updates.brand);

    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImageUrl = await ProductService.uploadImage(
          req.files.mainImage[0],
          req.files.mainImage[0].originalname,
          "products"
        );
        updates.main_image_url = mainImageUrl;
      }

      if (req.files.otherImages && req.files.otherImages.length > 0) {
        const otherImageUrls = [];
        for (const file of req.files.otherImages) {
          const imageUrl = await ProductService.uploadImage(
            file,
            file.originalname,
            "products"
          );
          otherImageUrls.push(imageUrl);
        }
        updates.other_images_urls = otherImageUrls;
      }
    }

    const product = await ProductService.updateProduct(req.params.id, updates);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sortLowToHigh = async (req, res) => {
  try {
    const products = await ProductService.getProductsSortedByPrice(
      req.params.order
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in products-sorted route:", error);
    res.status(500).json({ error: error.message });
  }
};

const sortByDate = async (req, res) => {
  try {
    const products = await ProductService.getProductsSortedByDate(
      req.params.order
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in products-sorted/date route:", error);
    res.status(500).json({ error: error.message });
  }
};

const sortByName = async (req, res) => {
  try {
    const products = await ProductService.getProductsSortedByName(
      req.params.order
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in products-sorted/name route:", error);
    res.status(500).json({ error: error.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }
    const products = await ProductService.searchProducts(searchTerm);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: error.message });
  }
};

const filterProducts = async (req, res) => {
  try {
    const filters = {};

    if (req.query.sizes) {
      filters.sizes = Array.isArray(req.query.sizes)
        ? req.query.sizes
        : [req.query.sizes];
    }
    if (req.query.colors) {
      filters.colors = Array.isArray(req.query.colors)
        ? req.query.colors
        : [req.query.colors];
    }
    if (req.query.length) {
      filters.length = Array.isArray(req.query.length)
        ? req.query.length
        : [req.query.length];
    }
    if (req.query.tags) {
      filters.tags = Array.isArray(req.query.tags)
        ? req.query.tags
        : [req.query.tags];
    }
    if (req.query.brands) {
      filters.brands = Array.isArray(req.query.brands)
        ? req.query.brands
        : [req.query.brands];
    }
    if (req.query.category) {
      filters.category = Array.isArray(req.query.category)
        ? req.query.category
        : [req.query.category];
    }

    const products = await ProductService.getFilteredProducts(filters);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
