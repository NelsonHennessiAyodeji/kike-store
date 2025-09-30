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

      // Prepare product data with NEW fields
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
        category: productData.category,
        // NEW FIELDS
        length: productData.length,
        brand: productData.brand,
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

  // Update product
  // static async updateProduct(id, updates) {
  //   try {
  //     const { data, error } = await supabase
  //       .from("products")
  //       .update({ ...updates, updated_at: new Date().toISOString() })
  //       .eq("id", id)
  //       .select();

  //     if (error) throw error;
  //     return data[0];
  //   } catch (error) {
  //     console.error("Error updating product:", error);
  //     throw error;
  //   }
  // }

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

  // Sort by Alphabetical Order
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
};
