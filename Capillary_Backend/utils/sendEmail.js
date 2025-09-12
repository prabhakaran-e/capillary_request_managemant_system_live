const nodemailer = require("nodemailer");
const emailTemplates = require("./emailTemplate");

// const sendEmail = async (email, subject, textContent, htmlContent) => {
const sendEmail = async (email, templateType, customData={}) => {
  try {
   console.log("email, templateType, customData",email, templateType, customData)
    const template = emailTemplates[templateType];

    let { subject, html } = template;

    Object.keys(customData).forEach((key) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), customData[key]);
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log("html",html)

    console.log("subject",subject)
    console.log("customData",customData)


    const mailOptions = {
      from: `"Capillary Technology" ${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: subject,

      html: html,
    };
    console.log("Mail options", mailOptions);

    await transporter.sendMail(mailOptions);
    console.log("Login email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
