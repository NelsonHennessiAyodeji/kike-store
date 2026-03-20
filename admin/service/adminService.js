const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);

module.exports = class ProductService {
  // Upload image to Supabase Storage
  static async uploadImage(file, fileName, folder = "products") {
    try {
      const fileExt = fileName.split(".").pop();
      const filePath = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  // Create product with file uploads
  static async createProduct(productData, files) {
    try {
      let mainImageUrl = null;
      const otherImagesUrls = [];

      // Upload main image if provided
      if (files.mainImage) {
        mainImageUrl = await this.uploadImage(
          files.mainImage[0],
          files.mainImage[0].originalname
        );
      }

      // Upload other images (max 3)
      if (files.otherImages) {
        for (let i = 0; i < Math.min(files.otherImages.length, 3); i++) {
          const imageUrl = await this.uploadImage(
            files.otherImages[i],
            files.otherImages[i].originalname
          );
          otherImagesUrls.push(imageUrl);
        }
      }

      // Prepare product data with array fields
      const product = {
        product_name: productData.productName,
        description: productData.description,
        price: parseFloat(productData.price),
        quantity: parseInt(productData.quantity),
        sizes: Array.isArray(productData.sizes)
          ? productData.sizes
          : [productData.sizes],
        colors: Array.isArray(productData.colors)
          ? productData.colors
          : [productData.colors],
        // category as array
        category: Array.isArray(productData.category)
          ? productData.category
          : [productData.category],
        length: productData.length,
        // brand as array
        brand: Array.isArray(productData.brand)
          ? productData.brand
          : [productData.brand],
        tags: Array.isArray(productData.tags)
          ? productData.tags
          : productData.tags
          ? [productData.tags]
          : [],
        main_image_url: mainImageUrl,
        other_images_urls: otherImagesUrls,
      };

      // Insert into database
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select();

      if (error) throw error;

      return data[0];
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  // Get all products
  static async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  // Update product
  static async updateProduct(id, updates) {
    try {
      // Extract file-related updates (if any)
      const { main_image_url, other_images_urls, ...dbUpdates } = updates;

      // Prepare the update object
      const updateData = {
        ...dbUpdates,
        updated_at: new Date().toISOString(),
      };

      // Add image URLs if they were provided
      if (main_image_url) {
        updateData.main_image_url = main_image_url;
      }

      if (other_images_urls) {
        updateData.other_images_urls = other_images_urls;
      }

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  // Sort by price
  static async getProductsSortedByPrice(order = "asc") {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("price", { ascending: order === "asc" });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching sorted products:", error);
      throw error;
    }
  }

  // Sort by date
  static async getProductsSortedByDate(order = "desc") {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: order === "asc" });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching date-sorted products:", error);
      throw error;
    }
  }

  // Sort by name
  static async getProductsSortedByName(order = "asc") {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product_name", { ascending: order === "asc" });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching name-sorted products:", error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(searchTerm) {
    try {
      const searchTermLower = `%${searchTerm.toLowerCase()}%`;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(
          `product_name.ilike.${searchTermLower},description.ilike.${searchTermLower},brand.cs.{"${searchTerm.toLowerCase()}"}`
        )
        .order("created_at", { ascending: false });

      if (error && error.code === "42883") {
        // Fallback to client-side search
        return await this.alternativeSearchProducts(searchTerm);
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  // Alternative search method
  static async alternativeSearchProducts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const searchTermLower = searchTerm.toLowerCase();
      const filteredProducts = data.filter((product) => {
        return (
          (product.product_name &&
            product.product_name.toLowerCase().includes(searchTermLower)) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTermLower)) ||
          (product.category &&
            product.category.some((cat) =>
              cat.toLowerCase().includes(searchTermLower)
            )) ||
          (product.brand &&
            product.brand.some((b) =>
              b.toLowerCase().includes(searchTermLower)
            )) ||
          (product.tags &&
            product.tags.some((tag) =>
              tag.toLowerCase().includes(searchTermLower)
            ))
        );
      });

      return filteredProducts;
    } catch (error) {
      console.error("Error in alternative search:", error);
      throw error;
    }
  }

  // Filter products by multiple criteria
  static async getFilteredProducts(filters = {}) {
    try {
      let query = supabase.from("products").select("*");

      if (filters.sizes && filters.sizes.length > 0) {
        query = query.overlaps("sizes", filters.sizes);
      }

      if (filters.colors && filters.colors.length > 0) {
        query = query.overlaps("colors", filters.colors);
      }

      if (filters.length && filters.length.length > 0) {
        query = query.in("length", filters.length);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      if (filters.brands && filters.brands.length > 0) {
        query = query.overlaps("brand", filters.brands);
      }

      // Optional: add category filter
      if (filters.category && filters.category.length > 0) {
        query = query.overlaps("category", filters.category);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      throw error;
    }
  }
};
