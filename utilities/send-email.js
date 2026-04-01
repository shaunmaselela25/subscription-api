import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer";
import { emailTemplates } from "./email-template";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type || !subscription) {
    throw new Error("Missing required parameters for sendReminderEmail");
  }

  const template = emailTemplates.find((t) => t.label === type);
  if (!template) {
    throw new Error(`Invalid email type: ${type}`);
  }

  const mailInfo = {
    userName: subscription.user?.name ?? "Subscriber",
    subscriptionName: subscription.name ?? "Subscription",
    renewalDate: dayjs(subscription.renewalDate).format("MM, D, YYYY"),
    planName: subscription.plan?.name ?? subscription.name ?? "",
    price: `${subscription.currency ?? ""} ${subscription.price ?? ""} (${subscription.frequency ?? ""})`,
    payMethod: subscription.payMethod ?? "N/A",
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to,
    subject,
    html: message,
  };

  const info = await transporter.sendMail(mailOptions);
  console.info(`Email reminder sent to ${to}: ${info.response}`);

  return info;
};

export default sendReminderEmail;