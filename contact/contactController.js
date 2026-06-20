const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send contact message via email and store in Supabase
 */
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    // --- Validation ---
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Sanitise inputs (simple trim)
    const sanitised = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
    };

    // --- Store in Supabase ---
    const { data, error: dbError } = await supabase
      .from('contact_messages')
      .insert([{
        name: sanitised.name,
        phone: sanitised.phone,
        email: sanitised.email,
        message: sanitised.message,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      // Still proceed to send email, but log the error
    }

    // --- Send email ---
    const mailOptions = {
      from: `"LinaBen Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Message from ${sanitised.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitised.name}</p>
        <p><strong>Phone:</strong> ${sanitised.phone}</p>
        <p><strong>Email:</strong> ${sanitised.email}</p>
        <p><strong>Message:</strong><br/>${sanitised.message.replace(/\n/g, '<br/>')}</p>
      `,
      replyTo: sanitised.email, // so the admin can reply directly
    };

    await transporter.sendMail(mailOptions);

    // --- Respond to client ---
    res.status(200).json({
      success: true,
      message: 'Your message has been sent. We will get back to you shortly.',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Something went wrong. Please try again later.',
    });
  }
};