import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to, type, data) {
  let subject = "";
  let htmlBody = "";

  // Extract both B2C and B2B variables safely
  const {
    // B2C Variables
    clientName = "Client",
    therapistName = "Therapist",
    date = "Date",
    time = "Time",
    meetingLink = "#",
    address = "Clinic",
    paymentInstructions = "Check dashboard for details.",
    
    // B2B Variables
    name = "User",
    email = "",
    company = "Company",
    size = "Team Size",
    message = "No additional message provided."
  } = data || {};

  switch (type) {
    // ==========================================
    // B2C: THERAPIST & CLIENT ALERTS
    // ==========================================
    case "REQUEST_RECEIVED":
      subject = `New Booking Request from ${clientName}`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6B8E78;">New Client Request</h2>
          <p>Hi ${therapistName},</p>
          <p><strong>${clientName}</strong> has requested a session.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>📅 Date:</strong> ${date}</p>
            <p><strong>⏰ Time:</strong> ${time}</p>
          </div>
          <p>Please log in to your dashboard to Accept or Decline.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/therapist/requests" style="background: #2D2D2D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
        </div>
      `;
      break;

    case "REQUEST_SENT":
      subject = `Booking Request Sent: ${therapistName}`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6B8E78;">Request Sent</h2>
          <p>Hi ${clientName},</p>
          <p>Your request for a session with <strong>${therapistName}</strong> has been sent.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>📅 Date:</strong> ${date}</p>
            <p><strong>⏰ Time:</strong> ${time}</p>
          </div>
          <p>You will be notified once the therapist accepts your request.</p>
        </div>
      `;
      break;

    case "REQUEST_ACCEPTED":
      subject = `Request Accepted! Action Required`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Request Accepted</h2>
          <p>Hi ${clientName},</p>
          <p><strong>${therapistName}</strong> has accepted your request. To confirm your slot, please complete the payment.</p>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bfdbfe;">
            <h3 style="margin-top: 0; font-size: 16px;">💳 Payment Instructions</h3>
            <p style="white-space: pre-line;">${
              paymentInstructions ||
              "Please log in to your dashboard to view payment details."
            }</p>
          </div>

          <a href="${
            process.env.NEXT_PUBLIC_BASE_URL
          }/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard to Pay</a>
        </div>
      `;
      break;

    case "REQUEST_DECLINED":
      subject = `Update on your booking request`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ef4444;">Request Declined</h2>
          <p>Hi ${clientName},</p>
          <p>Unfortunately, <strong>${therapistName}</strong> cannot accept your booking request for ${date} at ${time}.</p>
          <p>The slot has been freed up. We encourage you to try booking a different time or therapist.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/search" style="color: #6B8E78; text-decoration: underline;">Find another therapist</a>
        </div>
      `;
      break;

    case "PAYMENT_CONFIRMED":
      subject = `Booking Confirmed! You are all set.`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #22c55e;">Booking Confirmed</h2>
          <p>Hi ${clientName},</p>
          <p>Your payment has been verified. Your session is locked in.</p>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
             ${
               meetingLink
                 ? `<p><strong>📹 Video Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>`
                 : `<p><strong>📍 Clinic Address:</strong> ${address}</p>`
             }
          </div>
          <p>See you there!</p>
        </div>
      `;
      break;

    // ==========================================
    // B2B: ENTERPRISE DEMO ALERTS
    // ==========================================
    case "NEW_B2B_LEAD":
      subject = `🚨 New Enterprise Lead: ${company}`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #2D2D2D; border-bottom: 2px solid #eee; padding-bottom: 10px;">New B2B Demo Request</h2>
          <div style="background: #FAFAF8; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #eaeaea;">
            <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>✉️ Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 5px 0;"><strong>🏢 Company:</strong> ${company}</p>
            <p style="margin: 5px 0;"><strong>👥 Team Size:</strong> ${size}</p>
            <br/>
            <p style="margin: 5px 0;"><strong>💬 Message:</strong></p>
            <p style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #eee; font-style: italic;">${message}</p>
          </div>
          <p style="color: #ef4444; font-weight: bold;">Action: Follow up with this lead within 24 hours.</p>
        </div>
      `;
      break;

    case "B2B_DEMO_CONFIRMATION":
      subject = `Your TherapyConnect Demo Request`;
      htmlBody = `
        <div style="font-family: sans-serif; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; max-width: 600px; background: #ffffff;">
          <h2 style="color: #5A7A66; margin-top: 0;">Demo Request Received</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Thank you for your interest in bringing TherapyConnect to <strong>${company}</strong>.</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">We have received your request. One of our enterprise specialists is reviewing your details and will reach out to you within 24 hours to schedule a personalized platform tour.</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">We look forward to showing you how we build resilient teams.</p>
          <br>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; margin: 0;">Best regards,</p>
          <p style="color: #2D2D2D; font-size: 14px; font-weight: bold; margin-top: 5px;">The TherapyConnect Team</p>
        </div>
      `;
      break;
  }

  // Ensure we don't try to send a blank email if type is not found
  if (!subject || !htmlBody) {
    console.error(`Email Error: Unknown email type -> ${type}`);
    return { success: false, error: "Unknown email type" };
  }

  try {
    await transporter.sendMail({
      from: `"TherapyConnect" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false };
  }
}