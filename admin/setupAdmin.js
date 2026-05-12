require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY, // service role key (secret)
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "Admin email or password missing in .env – skipping user creation"
    );
    return;
  }

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const userExists = existingUsers.users.some(
      (user) => user.email === adminEmail
    );

    if (userExists) {
      console.log(`Admin user ${adminEmail} already exists.`);
      return;
    }

    // Create the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // auto-confirm email
    });

    if (error) throw error;
    console.log(`Admin user ${adminEmail} created successfully.`);
  } catch (error) {
    console.error("Error ensuring admin user:", error.message);
  }
}

module.exports = { ensureAdminUser };
