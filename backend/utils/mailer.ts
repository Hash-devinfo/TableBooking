import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT ?? 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// Never throws: a failed email must not break the request that triggered it
export const sendEmail = async (mail: MailInput): Promise<boolean> => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, ...mail });
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};


export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log("Mail server ready");
  } catch (error) {
    console.error("Mail server not ready:", error);
  }
};