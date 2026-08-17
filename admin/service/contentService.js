const { createClient } = require("@supabase/supabase-js");
const path = require("path");

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);

class ContentService {
  // Upload an image to Supabase Storage
  static async uploadImage(fileBuffer, originalName, folder = "content") {
    try {
      const fileExt = originalName.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("site-images") // Create this bucket first in Supabase
        .upload(filePath, fileBuffer, {
          contentType: "image/jpeg", // or detect from originalName
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading content image:", error);
      throw error;
    }
  }

  // Get content by page and section
  static async getContent(page, section) {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("page", page)
        .eq("section", section)
        .maybeSingle();

      if (error) throw error;
      return data ? data.content : null;
    } catch (error) {
      console.error("Error fetching content:", error);
      throw error;
    }
  }

  // Get all content for a page (to reduce calls)
  static async getPageContent(page) {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("section, content")
        .eq("page", page);

      if (error) throw error;
      const result = {};
      data.forEach((row) => {
        result[row.section] = row.content;
      });
      return result;
    } catch (error) {
      console.error("Error fetching page content:", error);
      throw error;
    }
  }

  // Update or insert content
  static async upsertContent(page, section, content) {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .upsert(
          {
            page,
            section,
            content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "page, section" }
        )
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error upserting content:", error);
      throw error;
    }
  }

  // Get all content (for admin listing)
  static async getAllContent() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("page", { ascending: true })
        .order("section", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching all content:", error);
      throw error;
    }
  }
}

module.exports = ContentService;
