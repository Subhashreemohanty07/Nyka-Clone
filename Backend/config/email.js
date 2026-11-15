
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
  async sendMail({ from, to, subject, text, html }) {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Nykaa Clone <onboarding@resend.dev>",
      to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {})
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};

export default transporter;
