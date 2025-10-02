const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);

const authenticateAdmin = async (req, res, next) => {
  if (req.method === "GET") {
    return next();
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    // You can add additional admin checks here
    // For example: check if user.email === process.env.ADMIN_EMAIL
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = { authenticateAdmin };
