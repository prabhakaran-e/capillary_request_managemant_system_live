const cron = require("node-cron");
const nodemailer = require("nodemailer");
const CreateNewReq = require("../models/createNewReqSchema");



const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // 👈 prevents self-signed cert error
  },
});

const poExpiryNotificationEmail = {
  subject: `PO Expiry Notification`,
  html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #dc3545; color: #ffffff; padding: 20px;">
            <h1>PO Expiry Alert</h1>
          </div>
          <div style="padding: 20px; color: #333; text-align: left;">
            <p>Dear HOD,</p>
            <p>The Purchase Order request with ID <strong>{{reqId}}</strong> is about to 
               <span style="color: #dc3545;">expire</span>.</p>
            <p><strong>Valid Until:</strong> {{poValidTo}}</p>
            <p><strong>Expires In:</strong> {{diffDays}} day(s)</p>
            <p>Please take the necessary action at the earliest to avoid disruptions.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="{{poLink}}" 
              style="background-color: #dc3545; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                View PO Request
              </a>
            </div>
          </div>
          <div style="background-color: #f1f1f1; padding: 15px; font-size: 12px; color: #777;">
            <p>This is an automated reminder from Capillary Finance System. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};

cron.schedule("56 20 * * *", async () => {
  try {
    console.log("⏰ Running PO expiry cron...");


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requests = await CreateNewReq.find({
      isCompleted: true,
      "procurements.poValidTo": { $exists: true },
    });

    for (let req of requests) {
      const poValidTo = req.procurements?.poValidTo;
      if (!poValidTo) continue;

      const expiryDate = new Date(poValidTo);
      expiryDate.setHours(0, 0, 0, 0);

      // Calculate days until expiry
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
        const hodEmail = req.firstLevelApproval?.hodEmail


        const emailHtml = poExpiryNotificationEmail.html
          .replace("{{reqId}}", req.reqid)
          .replace("{{poValidTo}}", expiryDate.toDateString())
          .replace("{{diffDays}}", diffDays)
          .replace("{{poLink}}", req.poDocuments?.poLink || "#");

        await transporter.sendMail({
          from: `"Capillary Technology" <${process.env.EMAIL_ADDRESS}>`,
          to: hodEmail,
          subject: poExpiryNotificationEmail.subject,
          html: emailHtml,
        });

        console.log(
          `✅ Email sent → ${hodEmail}, ReqID: ${req.reqid}, Expires in: ${diffDays} day(s)`
        );
      } else {
        console.log(
          `⏭️ Skipping ReqID: ${req.reqid}, Expires in: ${diffDays} day(s)`
        );
      }
    }
  } catch (err) {
    console.error("❌ Error in PO expiry cron:", err);
  }
});
