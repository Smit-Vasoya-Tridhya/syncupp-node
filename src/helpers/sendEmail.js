const nodemailer = require("nodemailer");
require("dotenv").config();

// this function is used for the send email
const sendEmail = async (payload) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.MAIL,
    to: payload.email,
    subject: payload.subject,
    text: payload.message,
  };

  const data = await transporter.sendMail(mailOptions);
  return data;
};

module.exports = sendEmail;
