const emailTemplates = {
  login: {
    subject: "Login Notification from PO Request Portal",
    html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
                <h1>Capillary Technologies - PO Request Portal</h1>
              </div>
              <div style="padding: 20px; color: #333;">
                <p>Hi <strong>{{full_name}}</strong>,</p>
                <p>You have successfully logged in to PO Request Portal!</p>
                <p>If you did not perform this action, please sign out immediately and notify us.</p>
                <p>Thank you,<br>Capillary Finance</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
  },

  vendorOnboarding: {
    subject: "Vendor Onboarding Process - Capillary Finance",
    html: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
            <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
                <h1>Welcome, {{vendorName}}!</h1>
              </div>
              <div style="padding: 20px; color: #333;">
                <p>Hi <strong>{{vendorName}}</strong>,</p>
                <p>We are pleased to inform you that you are now providing services to Capillary Finance.</p>
                <p>As a new vendor, you must complete the onboarding process.</p>
                <p>Please contact the <strong>Capillary Finance Vendor Management Team</strong> to complete your onboarding.</p>
                <p>We look forward to working with you!</p>
                <p>Best Regards,<br>Capillary Finance Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
  },
  newVendorOnBoard: {
    subject: "Vendor Onboarding Process - Capillary Finance",
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
              <h1>Vendor Onboarding Notification - Capillary Finance</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Team,</p>
              <p>A new vendor, <strong>{{vendorName}}</strong>, <strong>{{email}}</strong>,has been added to the system for the PO-Request {{reqId}} and is awaiting onboarding.</p>
              <p>Please review the vendor details and complete the necessary onboarding process. Ensure all details are accurate before proceeding.</p>
              <p>It is crucial to verify all the necessary information as soon as possible.</p>
              <p>Best Regards,<br>Capillary Finance Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  editRequest: {
    subject: `Edit Request for Employee`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
              <h1>Request Edit Notification</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear {{to_name}},</p>
              <p>This is to inform you that employee with ID <strong>{{empId}}</strong> {{empName}} has requested an edit for the request with Request Id <strong>{{reqid}}</strong>.</p>
              <p>Please review the request at your earliest convenience.</p>
              <p>Best regards,</p>
              <p><strong>{{empName}}</strong><br>{{empEmail}}</p>
              <p><strong>{{department}}</strong></p>

              <div style="text-align: center; margin-top: 20px;">
                <a href="https://porequests.corp.capillarytech.com" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Review Request</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  financeApprovalEmail: {
    subject: `Finance Approval Notification`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #28a745; color: #ffffff; padding: 20px;">
              <h1>Finance Approval Notification</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Team,</p>
              <p>The request with ID <strong>{{reqid}}</strong> has been approved by the <strong>Finance Department</strong>.</p>
              <p>The request is now awaiting PO upload. Please proceed with the next steps.</p>
              
              <div style="text-align: center; margin-top: 20px;">
            <a href="https://porequests.corp.capillarytech.com/req-list-table/preview-one-req/{{reqId}}" 
style="background-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Upload PO</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  nudgeNotification: {
    subject: `Reminder:PO-Request Pending Action`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #ff9800; color: #ffffff; padding: 20px;">
              <h1>Action Required: Pending Request</h1>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Team,</p>
              <p>This is a gentle reminder that Request ID <strong>{{reqid}}</strong> is still pending from the user's side.</p>
              <p>Please review the request and take the necessary action at the earliest.</p>
              <p><strong>Requester:</strong> {{empName}} ({{empEmail}})</p>
              <p><strong>Department:</strong> {{department}}</p>
  
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://porequests.corp.capillarytech.com" style="background-color: #ff9800; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Review Request</a>
              </div>
  
              <p style="margin-top: 20px; font-size: 12px; color: #777;">
                This is an automated reminder. If action has already been taken, please ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  vendorOnboardingRequestorTemplate: {
    subject: "New Vendor Added - Action Required",
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #28a745; color: #ffffff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h1>New Vendor Added - Action Required</h1>
            </div>
            <div style="padding: 20px; color: #333; text-align: left;">
              <p>Dear {{requestorName}},</p>
              <p>A new vendor has been added for your PO Request <strong>{{reqId}}</strong>.</p>
              <p><strong>Vendor Details:</strong></p>
              <ul>
                <li><strong>Name:</strong> {{vendorName}}</li>
                <li><strong>Email:</strong> {{email}}</li>
              </ul>
              <p>Please complete the onboarding process at your earliest convenience to proceed with further steps.</p>
              <p>Ensuring a smooth onboarding process is crucial for seamless operations.</p>
              <p>If you have any questions, feel free to reach out.</p>
              <p>Best Regards,</p>
              <p><strong>Capillary Finance Team</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  poUploadedNotificationTemplate: {
    subject: "PO Uploaded - Invoice Submission Pending",
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
          <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #17a2b8; color: #ffffff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h1>PO Uploaded - Invoice Submission Pending</h1>
            </div>
            <div style="padding: 20px; color: #333; text-align: left;">
              <p>Dear {{requestorName}},</p>
              <p>The PO for your request <strong>{{reqId}}</strong> has been uploaded by <strong>{{employeeName}}</strong> from the <strong>{{department}}</strong> department.</p>
              <p>Next Steps:</p>
              <ul>
                <li>Please ensure that the invoice is uploaded within 7 days to proceed with further processing.</li>
                <li>Verify the details of the PO before proceeding.</li>
              </ul>
              <p>Click below to view or download the PO:</p>
              <p>
                <a href="{{pdfLink}}" style="color: #ffffff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View PO PDF</a>
              </p>
              <p>Ensuring timely invoice submission is crucial to avoid delays.</p>
              <p>If you have any questions or require assistance, feel free to reach out.</p>
              <p>Best Regards,</p>
              <p><strong>Capillary Finance Team</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  
  chatNotificationTemplate: {
    subject: "New Chat Message Received",
    html: `
   <!DOCTYPE html>
<html>
<body>
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #007bff; color: #ffffff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h1>New Chat Notification</h1>
      </div>
      <div style="padding: 20px; color: #333; text-align: left;">
        <p>Dear {{employeeName}},</p>
        <p>You have received a new chat message related to request <strong>{{reqId}}</strong>.</p>
        <p><strong>Sender:</strong> {{senderName}} ({{senderDepartment}})</p>
        <p><strong>Message:</strong> {{topic}}</p>
        <p>To respond, please check the chat section in your dashboard.</p>
        <p>If you have any issues, feel free to reach out.</p>
        <p>Best Regards,</p>
        <p><strong>Capillary Finance</strong></p>
        {{#if attachmentUrl}}
        <p>
          <a href="{{attachmentUrl}}" style="display: inline-block; padding: 10px 20px; margin-top: 20px; font-size: 16px; color: #ffffff; background-color: #28a745; border-radius: 5px; text-decoration: none;">Download Attachment</a>
        </p>
        {{/if}}
      </div>
    </div>
  </div>
</body>
</html>

  `,
  },
  requestApprovalNotificationTemplate: {
    subject: "Request Submitted Successfully - Awaiting Approval",
    html: `
   <!DOCTYPE html>
<html>
<body>
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #28a745; color: #ffffff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h1>Request Submission Successful</h1>
      </div>
      <div style="padding: 20px; color: #333; text-align: left;">
        <p>Dear {{employeeName}},</p>
        <p>Your request with Request ID <strong>{{reqId}}</strong> has been successfully submitted and is currently awaiting approval.</p>
        <p>You will be notified once the request is approved.</p>
        <p>If you have any questions, feel free to reach out.</p>
        <p>Best Regards,</p>
        <p><strong>Capillary Finance</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
},
invoiceUploadedEmail: {
  subject: `Invoice Upload Notification`,
  html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #28a745; color: #ffffff; padding: 20px;">
            <h1>Invoice Upload Notification</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Dear Team,</p>
            <p><strong>{{employeeName}}</strong> from the <strong>{{department}}</strong> department has successfully uploaded the invoice for request ID <strong>{{reqId}}</strong>.</p>
            <p>The invoice has been submitted and is now available for review.</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="{{invoiceLink}}" 
              style="background-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Invoice</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,
},

};

module.exports = emailTemplates;
