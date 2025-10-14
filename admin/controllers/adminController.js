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
    // Parse array fields from comma-separated strings to arrays
    const updates = { ...req.body };

    if (updates.sizes && typeof updates.sizes === "string") {
      updates.sizes = updates.sizes.split(",");
    }

    if (updates.colors && typeof updates.colors === "string") {
      updates.colors = updates.colors.split(",");
    }

    // NEW: Parse tags from comma-separated string to array
    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = updates.tags.split(",");
    }

    // Handle file uploads if they exist
    if (req.files) {
      // Process main image
      if (req.files.mainImage && req.files.mainImage[0]) {
        const mainImageUrl = await ProductService.uploadImage(
          req.files.mainImage[0],
          req.files.mainImage[0].originalname,
          "products" // Use the same folder as create
        );
        updates.main_image_url = mainImageUrl;
      }

      // Process other images
      if (req.files.otherImages && req.files.otherImages.length > 0) {
        const otherImageUrls = [];
        for (const file of req.files.otherImages) {
          const imageUrl = await ProductService.uploadImage(
            file,
            file.originalname,
            "products" // Use the same folder as create
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

// Update product
// const updateProduct = async (req, res) => {
//   try {
//     console.log(req.body);

//     const product = await ProductService.updateProduct(req.params.id, req.body);
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

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

// Search products
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
};
