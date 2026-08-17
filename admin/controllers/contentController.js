const ContentService = require("../service/contentService");

// Get all content (admin)
const getAllContent = async (req, res) => {
  try {
    const content = await ContentService.getAllContent();
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get content for a specific page (public)
const getPageContent = async (req, res) => {
  try {
    const { page } = req.params;
    const content = await ContentService.getPageContent(page);
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a specific section
const updateContent = async (req, res) => {
  try {
    const { page, section } = req.params;
    let content = req.body;

    // If files are uploaded, handle image uploads
    if (req.files) {
      // We'll handle multipart form data with fields
      // The body will contain other fields as string
      // We'll parse content from req.body.content if it's JSON string
      // For simplicity, we assume req.body is the content object
      // But we also have file uploads: for each image field, we upload and replace URL
      // We'll process fields like: hero_slides[0].image (file), etc.
      // Since this is complex, we'll handle it differently:
      // We'll expect a JSON body with content, and if image files are sent,
      // we'll process them separately.
    }

    // If content is a string, parse it as JSON
    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch (e) {
        // keep as string
      }
    }

    const result = await ContentService.upsertContent(page, section, content);
    res.status(200).json(result);
  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload an image for content (returns URL)
const uploadContentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = await ContentService.uploadImage(
      req.file.buffer,
      req.file.originalname
    );
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllContent,
  getPageContent,
  updateContent,
  uploadContentImage,
};
