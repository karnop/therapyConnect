"use server";

import nodemailer from "nodemailer";

// Reuse the existing transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function submitTherapistApplication(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const experience = formData.get("experience");
  const linkedin = formData.get("linkedin");

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
      <h2>New Therapist Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Experience:</strong> ${experience} years</p>
      <p><strong>Profile/LinkedIn:</strong> ${linkedin}</p>
      <hr />
      <p>Action Required: Verify credentials and manually create account in Appwrite.</p>
    </div>
  `;

  try {
    // Send to YOUR admin email (using the same GMAIL_USER for now as the receiver)
    await transporter.sendMail({
      from: `"TherapyConnect Bot" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Sends to yourself
      subject: `New Partner Application: ${name}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("Application Email Error:", error);
    return { error: "Failed to send application." };
  }
}
