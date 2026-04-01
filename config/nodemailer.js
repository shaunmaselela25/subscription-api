import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_USER } from "./env";

export const accountEmail = EMAIL_USER || "shaunmaselela25@gmail.com";

const isGmail = accountEmail.endsWith("@gmail.com");

const transporter = nodemailer.createTransport(
  isGmail
    ? {
        service: "gmail",
        auth: {
          user: accountEmail,
          pass: EMAIL_PASSWORD,
        },
      }
    : {
        sendmail: true,
        newline: "unix",
        path: "/usr/sbin/sendmail",
      }
);

transporter.verify((err, success) => {
  if (err) {
    console.error("[nodemailer] transporter verification failed:", err);
    return;
  }
  console.info("[nodemailer] transporter is ready to send messages");
});

export default transporter;