import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { checkRateLimit, getClientIP, formatTimeUntilReset } from "@/libs/utils/rateLimiter";

type Data = {
  success: boolean;
  message: string;
  resetTime?: number;
  remaining?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { name, email, subject, number, text, agree, userId } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !number || !text) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!agree) {
      return res.status(400).json({
        success: false,
        message: "Please agree to the Privacy Policy",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Rate limiting: Use userId if logged in, otherwise use IP address
    const identifier = userId || getClientIP(req);
    const rateLimit = checkRateLimit(identifier, 1); // 1 email per day

    if (!rateLimit.allowed) {
      const timeUntilReset = formatTimeUntilReset(rateLimit.resetTime);
      return res.status(429).json({
        success: false,
        message: `You have reached the daily limit of 1 email per day. Please try again in ${timeUntilReset}.`,
        resetTime: rateLimit.resetTime,
        remaining: rateLimit.remaining,
      });
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.GMAIL_USER,
      to: "medibridgeapp@gmail.com",
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #336AEA;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${number}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 3px;">${text}</p>
            <p><strong>Privacy Policy Agreed:</strong> ${agree ? "Yes" : "No"}</p>
            ${userId ? `<p><strong>User ID:</strong> ${userId} (Member)</p>` : '<p><strong>User Type:</strong> Non-Member</p>'}
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Submitted on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      replyTo: email, // Allow replying directly to the user
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      remaining: rateLimit.remaining,
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send email. Please try again later.",
    });
  }
}
