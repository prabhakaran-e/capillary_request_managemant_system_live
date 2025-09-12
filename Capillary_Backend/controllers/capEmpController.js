const jwt = require("jsonwebtoken");

const addPanelUsers = require("../models/addPanelUsers");
const Employee = require("../models/empModel");
const sendEmail = require("../utils/sendEmail");
const { sendBulkEmails } = require("../utils/otherTestEmail");
const CreateNewReq = require("../models/createNewReqSchema");
const Approver = require("../models/approverSchema");
const { CAPILLARY_JWT_SECRET } = require("../config/variables");
const EmailSettings = require("../models/emailNotificationSchema");

const verifyUser = async (req, res) => {
  try {
    console.log("Verify user");
    console.log(req.body);
    const { email } = req.body;
    console.log("Email", email);
    let multiRole = 0;
    const loginMail = await EmailSettings.findOne({ emailId: "1" });
    console.log("login action email", loginMail);

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { company_email_id: email },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean();
    console.log("panelUserData", panelUserData);

    const employeeData = await Employee.findOne(
      { company_email_id: email },
      { _id: 1, full_name: 1, department: 1, hod_email_id: 1, employee_id: 1 }
    ).lean();
    console.log("employeeData", employeeData);

    const isEmpHod =
      (await Approver.findOne({
        "departments.approvers.approverEmail": email,
      }).lean()) || (await Employee.findOne({ hod_email_id: email }).lean());
    console.log(
      "isEmpHod",
      isEmpHod,
      "isEmpHod && panelUserData",
      isEmpHod && panelUserData
    );
    if (isEmpHod && panelUserData) {
      multiRole = 1;
    }

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else {
      if (employeeData && !employeeData.role) {
        consolidatedData = {
          ...employeeData,
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }

    const full_name = consolidatedData?.full_name || "Unknown User";

    if (consolidatedData) {
      const token = jwt.sign(
        {
          id: consolidatedData._id,
          email: email,
          role: consolidatedData.role,
          department: consolidatedData.department,
          capEmpId: consolidatedData.employee_id,
        },
        CAPILLARY_JWT_SECRET,
        { expiresIn: "10h" }
      );
      if (loginMail?.emailStatus) {
        await sendEmail(email, "login", { full_name });
      }

      console.log("multiRole", multiRole);

      return res.status(200).json({
        success: true,
        message: "Employee verified successfully.",
        data: consolidatedData,
        token,
        multiRole,
      });
    } else {
      console.log("else");
      return res.status(401).json({
        success: false,
        message: "Employee not found.",
      });
    }
  } catch (err) {
    console.log("Error in verifying the employee", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const createNewReq = async (req, res) => {
  try {
    console.log(req.body);
    const sendBulkMails = await EmailSettings.findOne({ emailId: "2" });
    const vendorMails = await EmailSettings.findOne({ emailId: "3" });
    const VendorManagementMails = await EmailSettings.findOne({ emailId: "4" });
    const requestorMail = await EmailSettings.findOne({ emailId: "5" });

    const { id, reqId } = req.params;
    const { complinces, commercials, procurements, supplies, hasDeviations,firstLevelApproval } =
      req.body;
    const reqDatas = await CreateNewReq.findOne(
      { reqid: reqId },
      { procurements: 1, userId: 1 }
    ).lean();

    const requestorData = await Employee.findOne(
      { employee_id: reqDatas.userId },
      { full_name: 1, company_email_id: 1 ,department:1}
    );

    console.log("reqDatas", reqDatas);

    if (!complinces || !commercials) {
      return res
        .status(400)
        .json({ message: "Missing required compliance or commercial data." });
    }

    let empData = await Employee.findOne(
      { employee_id: id },
      { full_name: 1, employee_id: 1, department: 1, hod: 1, hod_email_id: 1 }
    ).lean();
    if (!empData) {
      empData = await addPanelUsers.findOne({ employee_id: id }).lean();
    }

    if (!empData) {
      return res.status(404).json({
        message: "Employee not found. Please provide a valid employee ID.",
      });
    }

    // const panelMemberEmail = (
    //   await addPanelUsers
    //     .find({ role: { $ne: "Admin" } }, { company_email_id: 1, _id: 0 })
    //     .lean()
    // ).map((member) => member.company_email_id);
    let panelMemberEmail = []
    if(commercials?.hodEmail){

      panelMemberEmail.push(commercials.hodEmail);
    }

    let existingRequest = await CreateNewReq.findOne({ reqid: reqId });
    console.log("existingRequest", existingRequest,firstLevelApproval);


    if (existingRequest) {
      existingRequest.commercials = commercials;
      existingRequest.procurements = procurements;
      existingRequest.supplies = supplies;
      existingRequest.complinces = complinces;
      existingRequest.hasDeviations = hasDeviations ? 1 : 0;
      existingRequest.isCompleted = true;
      // existingRequest.approvals.push(autoApprovalRecord)

      await existingRequest.save();
      if (sendBulkMails.emailStatus) {
        try {
          await sendBulkEmails(
            panelMemberEmail,
            empData.full_name,
            empData.department,
            reqId
          );
          const reqEmail  = requestorData.company_email_id
          await sendEmail(reqEmail, "requestApprovalNotificationTemplate", { reqId,employeeName:requestorData.full_name });
        } catch (emailError) {
          console.error("Error sending bulk emails:", emailError);
        }
      }
      let { vendorName, email, isNewVendor } = procurements;
      console.log(
        "vendorName, email, isNewVendor, reqId",
        vendorName,
        email,
        isNewVendor,
        reqId
      );

      if (isNewVendor) {
        console.log("Iaminside the vendor auti send mails");
        try {
          const reqEmail = requestorData.company_email_id;

          if (vendorMails.emailStatus) {
            await sendEmail(email, "vendorOnboarding", { vendorName });
          }
          if (requestorMail.emailStatus) {
            await sendEmail(reqEmail, "vendorOnboardingRequestorTemplate", {
              vendorName,
              email,
              reqId,
              requestorName: requestorData.full_name,
            });
          }

          const vendorManagementEmails = await addPanelUsers
            .find(
              {
                $or: [
                  { department: "Vendor Management" },
                  { role: "Vendor Management" },
                ],
              },
              { company_email_id: 1 }
            )
            .lean();
          if (VendorManagementMails.emailStatus) {
            await Promise.all(
              vendorManagementEmails.map(({ company_email_id }) =>
                sendEmail(company_email_id, "newVendorOnBoard", {
                  vendorName: vendorName,
                  email,
                  reqId,
                })
              )
            );
          }
        } catch (emailError) {
          console.error("Error sending vendor emails:", emailError);
        }
      }

      return res.status(200).json({
        message: "Request updated successfully",
        data: existingRequest,
        approvals: existingRequest?.approvals || [],
      });
    } else {
      const newRequest = new CreateNewReq({
        reqid: reqId,
        userId: id,
        userName: empData.full_name,
        empDepartment: empData.department,
        commercials,
        procurements,
        supplies,
        complinces,
        hasDeviations: hasDeviations ? 1 : 0,
        firstLevelApproval: {
          hodName: commercials.hod,
          hodEmail: commercials.hodEmail,
          hodDepartment: commercials.department,
          status: "Pending",
          approved: false,
        },
        isCompleted: true,
      });

      await newRequest.save();
      if (sendBulkMails.emailStatus) {
        try {
          await sendBulkEmails(
            panelMemberEmail,
            empData.full_name,
            empData.department,
            reqId
          );
          const reqEmail  = requestorData.company_email_id
          await sendEmail(reqEmail, "requestApprovalNotificationTemplate", { reqId,employeeName:requestorData.full_name });

        } catch (emailError) {
          console.error("Error sending bulk emails:", emailError);
        }
      }

      let { vendorName, email, isNewVendor, reqId } = procurements;
      console.log(vendorName, email, isNewVendor, reqId);

      if (isNewVendor) {
        console.log("Iaminside the vendor auti send mails");
        try {
          if (vendorMails.emailStatus) {
            await sendEmail(email, "vendorOnboarding", { vendorName });
          }

          const vendorManagementEmails = await addPanelUsers
            .find(
              {
                $or: [
                  { department: "Vendor Management" },
                  { role: "Vendor Management" },
                ],
              },
              { company_email_id: 1 }
            )
            .lean();
            if(VendorManagementMails.emailStatus){
              await Promise.all(
                vendorManagementEmails.map(
                  ({ company_email_id }) =>
                    sendEmail(company_email_id, "newVendorOnBoard", {
                      vendorName: reqDatas.procurements.reqDatas,
                      email: reqDatas.procurements.email,
                      reqId,
                    }) 
                )
              );

            }
        } catch (emailError) {
          console.error("Error sending vendor emails:", emailError);
        }
      }

      return res.status(201).json({
        message: "Request created successfully",
        data: newRequest,
        approvals: newRequest?.approvals || [],
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);

    if (error.code === "ECONNRESET") {
      return res.status(503).json({
        message: "Temporary connectivity issue, please try again later.",
      });
    }

    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

// Retry logic for emails
const sendEmailWithRetry = async (
  email,
  template,
  data,
  retries = 3,
  delay = 1000
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // await sendEmail(email, template, data);
      return; // Successful send, exit
    } catch (error) {
      console.error(`Attempt ${attempt} failed to send email:`, error);
      if (attempt < retries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Delay before retry
      } else {
        throw new Error(`Failed to send email after ${retries} attempts`);
      }
    }
  }
};

module.exports = {
  verifyUser,
  createNewReq,
};
