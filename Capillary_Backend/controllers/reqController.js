const CreateNewReq = require("../models/createNewReqSchema");
const empModel = require("../models/empModel");
const reqModel = require("../models/reqModel");
const addPanelUsers = require("../models/addPanelUsers");
const sendEmail = require("../utils/sendEmail");
const Approver = require("../models/approverSchema");
const { sendIndividualEmail } = require("../utils/otherTestEmail");
const entityModel = require("../models/entityModel");
const vendorSchema = require("../models/vendorModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const EmailSettings = require("../models/emailNotificationSchema");

const addReqForm = async (req, res) => {
  try {
    console.log("Welcome to add req", req.body);
    const orderData = req.body;
    const newOrder = new reqModel(orderData);
    await newOrder.save();
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      message: "Error creating order",
      error: err.message,
    });
  }
};

const postComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    console.log("id, data", id, data);

    const { taggedEmployeeEmail } = data;

    // Fetch employee data in parallel
    const [taggedEmployee, empDataFromModel, empDataFromPanel] =
      await Promise.all([
        taggedEmployeeEmail
          ? empModel.findOne(
            { company_email_id: taggedEmployeeEmail },
            { full_name: 1, company_email_id: 1, employee_id: 1 }
          )
          : Promise.resolve(null),
        empModel
          .findOne(
            { employee_id: data.senderId },
            {
              full_name: 1,
              employee_id: 1,
              department: 1,
              hod: 1,
              hod_email_id: 1,
            }
          )
          .lean(),
        addPanelUsers.findOne({ employee_id: data.senderId }).lean(),
      ]);

    const empData = empDataFromModel || empDataFromPanel;

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const commentData = {
      senderId: data.senderId,
      senderName: empData.full_name,
      message: data.message,
      attachmentUrl: data.attachmentUrl,
      topic: data.topic,
      timestamp: new Date(),
    };

    const updatedRequest = await CreateNewReq.findByIdAndUpdate(
      id,
      { $push: { commentLogs: commentData } },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Send email asynchronously (does not block response)
    if (taggedEmployeeEmail) {
      sendEmail(taggedEmployeeEmail, "chatNotificationTemplate", {
        senderName: empData.full_name,
        topic: data.message,
        employeeName: data.taggedEmployeeName,
        reqId: updatedRequest.reqid,
        senderDepartment: empData.department,
        attachmentUrl: data?.attachmentUrl ? data?.attachmentUrl : "",
      }).catch((err) => console.error("Email sending failed:", err));
    }

    res.status(200).json({
      message: "Comment added successfully",
      updatedRequest,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error in posting the comments", error: err.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    console.log("Welcome to fetch chats", req.params);

    const chatData = await CreateNewReq.findOne(
      { _id: req.params.id },
      { commentLogs: 1 }
    );

    console.log(chatData);

    res
      .status(200)
      .json({ message: "Chat data fetched successfully", chatData });
  } catch (err) {
    console.log("Error in fetching chats", err);
    res
      .status(500)
      .json({ message: "Error in fetching chats", error: err.message });
  }
};

const getNewNotifications = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID
    console.log("Notification for employee ID:", id);
    let consolidatedData;
    let notificationCount = 0;
    let reqData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = { ...panelUserData };
    } else {
      const employeeData = await empModel
        .findOne(
          { employee_id: id },
          {
            _id: 1,
            full_name: 1,
            department: 1,
            hod_email_id: 1,
            company_email_id: 1,
          }
        )
        .lean();

      if (employeeData) {
        const isEmpHod =
          employeeData.company_email_id &&
          (await CreateNewReq.findOne({
            "firstLevelApproval.hodEmail": employeeData.company_email_id,
          }).lean());

        consolidatedData = {
          ...employeeData,
          role: employeeData.role || (isEmpHod ? "HOD Department" : "Employee"),
        };
      }
    }

    console.log("consolidatedData", consolidatedData);
    if (!consolidatedData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employeeId = consolidatedData.employee_id;

    // Fetch all requests related to the employee
    if (consolidatedData.role === "HOD Department") {
      reqData = await CreateNewReq.find(
        {
          "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
          "firstLevelApproval.status": "Pending",
          isCompleted: true,
        },
        { _id: 1, reqid: 1 }
      );
    } else {
      reqData = await CreateNewReq.find(
        {
          "approvals.nextDepartment": consolidatedData.department,
          "approvals.status": "Approved",
        },
        { reqid: 1, _id: 1 }
      );
    }

    if (!reqData || reqData.length === 0) {
      return res
        .status(401)
        .json({ message: "No requests found for this employee" });
    }

    res.status(200).json({
      reqData,
    });
  } catch (err) {
    console.error("Error in fetching new notifications:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStatisticData = async (req, res) => {
  try {
    const { empId, role, email, multipartRole } = req.params;

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: empId },
        {
          _id: 1,
          full_name: 1,
          department: 1,
          role: 1,
          employee_id: 1,
          company_email_id: 1,
        }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = { ...panelUserData };
    } else {
      const employeeData = await empModel
        .findOne(
          { employee_id: empId },
          {
            _id: 1,
            full_name: 1,
            department: 1,
            hod_email_id: 1,
            company_email_id: 1,
          }
        )
        .lean();

      const isEmpHod =
        (await Approver.findOne({
          "departments.approvers.approverEmail": email,
        }).lean()) ||
        (await empModel
          .findOne({
            hod_email_id: employeeData?.company_email_id,
          })
          .lean());

      if (employeeData && !employeeData.role) {
        consolidatedData = {
          ...employeeData,
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }

    if (!consolidatedData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let adminAllTotalRequests = 0;
    let adminAllPendingRequests = 0;
    let adminAllCompletedRequests = 0;
    let departmentBudgetByCurrency = {};

    let myRequests = 0;
    let myApprovals = 0;
    let pendingApprovals = 0;
    let completedApprovals = 0;
    let pendingRequest = 0;
    let deptCompleteReq = 0;
    let completedRequest = 0;
    let totalApprovals = 0;
    let onHoldApprovals = 0;
    let rejectedApprovals = 0;
    let myReqOnHold = 0;
    let myRejectedReq = 0;

    const reqData = await CreateNewReq.find({ isCompleted: true });

    if (role === "Admin" && consolidatedData.department === "Admin") {
      adminAllTotalRequests = reqData.length;
      adminAllPendingRequests = reqData.filter(
        (req) => req.status !== "Pending"
      ).length;
      adminAllCompletedRequests = reqData.filter(
        (req) => req.status == "Approved"
      ).length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (req.supplies?.totalValue && req.supplies?.selectedCurrency) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (
      (role === "Business Finance" ||
        role === "Head of Finance" ||
        role === "Vendor Management" ||
        role === "Info Security" ||
        role === "Legal Team") &&
      multipartRole != 1
    ) {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedRequest++;
        } else if (request.status === "Hold") {
          myReqOnHold++;
        } else if (request.status === "Rejected") {
          myRejectedReq++;
        } else {
          pendingRequest++;
        }
      });

      const completedApprovalData = await CreateNewReq.find({
        $or: [
          {
            "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
            "firstLevelApproval.approved": true,
          },
          { "approvals.nextDepartment": role },
        ],
        isCompleted: true,
      });

      completedApprovalData.map((request) => {
        const { approvals } = request;
        const lastLevelApprovals = approvals[approvals.length - 1];
        console.log("lastLevelApprovals", lastLevelApprovals);
        if (
          lastLevelApprovals.approvalId === empId &&
          lastLevelApprovals.status === "Hold"
        ) {
          onHoldApprovals++;
        } else if (
          lastLevelApprovals.approvalId === empId &&
          lastLevelApprovals.status === "Rejected"
        ) {
          rejectedApprovals++;
        }
      });




      // pendingRequest = myRequestData.filter(
      //   (req) => req.status === "Pending" || req.status === "PO-Pending"
      // ).length;

      const reqDataStatics = reqData.filter(
        (req) =>
          req.approvals.some((app) => app.nextDepartment === role) ||
          req.firstLevelApproval?.hodEmail === consolidatedData.company_email_id
      );

      totalApprovals = reqDataStatics.length;

      reqData.forEach((request) => {
        if (!request.approvals || request.approvals.length === 0) {
          return;
        }

        let count = 0;

        const pendingRequests = request.approvals.filter((app) => {
          // Ensure request is not on hold or rejected
          if (request.status === "Hold" || request.status === "Rejected") {
            return false;
          }

          const isForEmployeeDept =
            app.departmentName === consolidatedData.department;
          const isPending =
            app.status === "Approved" && app.approvalId === empId;

          const hasPrevApproval = request.approvals.some((prevApp) => {
            return (
              prevApp.nextDepartment === role && prevApp.status === "Approved"
            );
          });

          return isForEmployeeDept && isPending && hasPrevApproval;
        });

        const approvalsForEmployee2 = request.approvals.filter((app) => {
          const isApprovedByEmp =
            app.approvalId === empId && app.status === "Approved";
          const isFirstLevelApproved =
            request.firstLevelApproval?.hodEmail ===
            consolidatedData.company_email_id &&
            request.firstLevelApproval?.approved;

          return isApprovedByEmp || isFirstLevelApproved;
        });

        completedApprovals += approvalsForEmployee2.length;
      });

      let pendingCount = 0;
      const pendingApprovalsdata = await CreateNewReq.find({
        isCompleted: true,
        status: { $nin: ["Hold", "Rejected"] },
      });
      const data = pendingApprovalsdata.map((req) => {
        const { approvals, firstLevelApproval, status } = req;
        let lastLevelApprovals = approvals[approvals.length - 1];

        if (
          firstLevelApproval.hodEmail === consolidatedData.company_email_id &&
          firstLevelApproval.approved === false
        ) {
          pendingCount++;
        } else if (lastLevelApprovals?.nextDepartment === role) {
          pendingCount++;
        }
      });

      pendingApprovals = pendingCount;



      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.isCompleted &&
          req.supplies?.selectedCurrency
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (role === "Employee") {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedApprovals++;
        } else if (request.status === "Hold") {
          myReqOnHold++;
        } else if (request.status === "Rejected") {
          myRejectedReq++;
        } else {
          pendingApprovals++;
        }
      });
    } else if (role === "HOD Department" || role === "Admin") {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedRequest++;
        } else if (request.status === "Hold") {
          myReqOnHold++;
        } else if (request.status === "Rejected") {
          myRejectedReq++;
        } else {
          pendingRequest++;
        }
      });

      const hodApprovals = await CreateNewReq.find(
        { "firstLevelApproval.hodEmail": email, isCompleted: true },
        { firstLevelApproval: 1 }
      ).lean();
      totalApprovals = hodApprovals.length;

      hodApprovals.forEach((request) => {
        if (request.firstLevelApproval?.status === "Approved") {
          myApprovals++;
        } else if (request.firstLevelApproval?.status === "Hold") {
          onHoldApprovals++;
        } else if (request.firstLevelApproval?.status === "Rejected") {
          rejectedApprovals++;
        } else if (!request.firstLevelApproval?.isApproved) {
          pendingApprovals++;
        }
      });

      const completedApprovalsData = await CreateNewReq.find({
        "firstLevelApproval.hodEmail": email,
        status: "Approved",
      }).lean();



      deptCompleteReq = completedApprovalsData.length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.supplies?.selectedCurrency &&
          req.firstLevelApproval?.hodEmail === email &&
          req.isCompleted
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (
      (role === "Business Finance" ||
        role === "Head of Finance" ||
        role === "Vendor Management" ||
        role === "Info Security" ||
        role === "Legal Team") &&
      multipartRole == 1
    ) {
      console.log("I am in multirole");

      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedRequest++;
        } else if (request.status === "Hold") {
          myReqOnHold++;
        } else if (request.status === "Rejected") {
          myRejectedReq++;
        } else {
          pendingRequest++;
        }
      });

      const reqDataStatics = await CreateNewReq.find({
        $or: [
          { "approvals.nextDepartment": role },
          { "firstLevelApproval.hodEmail": consolidatedData.company_email_id },
        ],
        isCompleted: true,
      });

      console.log("reqDataStatics", reqDataStatics);

      totalApprovals = reqDataStatics.length;
      completedApprovals = 0;

      const pendingApprovalData = await CreateNewReq.find({
        $or: [
          {
            "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
            "firstLevelApproval.approved": false,
          },
          {
            "approvals.nextDepartment": { $eq: role },
          },
        ],
        status: { $nin: ["Hold", "Rejected"] },
        isCompleted: true,
      });

      console.log("pendingApprovalData", pendingApprovalData);

      let pendingCount = 0;
      const pendingApprovalsdata = await CreateNewReq.find({
        isCompleted: true,
        status: { $nin: ["Hold", "Rejected"] }, // Exclude 'Hold' and 'Rejected' statuses
      });

      const data = pendingApprovalsdata.map((req) => {
        const { approvals, firstLevelApproval, status } = req;
        const lastLevelApprovals = approvals[approvals.length - 1];

        if (
          firstLevelApproval.hodEmail === consolidatedData.company_email_id &&
          firstLevelApproval.approved === false
        ) {
          pendingCount++;
        } else if (lastLevelApprovals?.nextDepartment === role) {
          pendingCount++;
        }
      });

      const completedApprovalData = await CreateNewReq.find({
        $or: [
          {
            "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
            "firstLevelApproval.approved": true,
          },
          { "approvals.nextDepartment": role },
        ],
        isCompleted: true,
      });

      completedApprovalData.map((request) => {
        const { approvals } = request;
        const lastLevelApprovals = approvals[approvals.length - 1];
        console.log("lastLevelApprovals", lastLevelApprovals);
        if (
          lastLevelApprovals.approvalId === empId &&
          lastLevelApprovals.status === "Hold"
        ) {
          onHoldApprovals++;
        } else if (
          lastLevelApprovals.approvalId === empId &&
          lastLevelApprovals.status === "Rejected"
        ) {
          rejectedApprovals++;
        }
      });
      completedApprovals =
        totalApprovals - (pendingCount + onHoldApprovals + rejectedApprovals);

      // pendingApprovals = pendingApprovalData.length;
      pendingApprovals = pendingCount;

      // pendingApprovals = Math.max(0, totalApprovals - completedApprovals);

      console.log("totalApprovals:", totalApprovals);
      console.log("pendingApprovals:", pendingApprovals);
      console.log("completedApprovals:", completedApprovals);
      console.log("onHoldApprovals:", onHoldApprovals);
      console.log("rejectedApprovals:", rejectedApprovals);

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.isCompleted &&
          req.supplies?.selectedCurrency
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    }

    Object.keys(departmentBudgetByCurrency).forEach((currency) => {
      departmentBudgetByCurrency[currency] =
        Math.round(departmentBudgetByCurrency[currency] * 100) / 100;
    });

    res.status(200).json({
      role: consolidatedData.role,
      adminAllTotalRequests,
      adminAllPendingRequests,
      adminAllCompletedRequests,
      departmentBudgetByCurrency,
      myRequests,
      myApprovals,
      completedApprovals,
      pendingApprovals,
      pendingRequest,
      deptCompleteReq,
      completedRequest,
      totalApprovals,
      myReqOnHold,
      myRejectedReq,
      rejectedApprovals,
      onHoldApprovals,
    });
  } catch (err) {
    console.error("Error in getting the statistics", err);
    res.status(500).json({ message: "Error in getting the statistics" });
  }
};

const filterByDateStatitics = async (req, res) => {
  try {
    const { empId, role, email, multipartRole } = req.params;
    const { from, to } = req.body;

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: empId },
        {
          _id: 1,
          full_name: 1,
          department: 1,
          role: 1,
          employee_id: 1,
          company_email_id: 1,
        }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = { ...panelUserData };
    } else {
      const employeeData = await empModel
        .findOne(
          { employee_id: empId },
          {
            _id: 1,
            full_name: 1,
            department: 1,
            hod_email_id: 1,
            company_email_id: 1,
          }
        )
        .lean();

      const isEmpHod =
        (await Approver.findOne({
          "departments.approvers.approverEmail": email,
        }).lean()) ||
        (await empModel
          .findOne({
            hod_email_id: employeeData?.company_email_id,
          })
          .lean());

      if (employeeData && !employeeData.role) {
        consolidatedData = {
          ...employeeData,
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }
    console.log("consolidatedData", consolidatedData);

    if (!consolidatedData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let adminAllTotalRequests = 0;
    let adminAllPendingRequests = 0;
    let adminAllCompletedRequests = 0;
    let departmentBudgetByCurrency = {};

    let myRequests = 0;
    let myApprovals = 0;
    let pendingApprovals = 0;
    let completedApprovals = 0;
    let pendingRequest = 0;
    let deptCompleteReq = 0;
    let completedRequest = 0;
    let totalApprovals = 0;

    const reqData = await CreateNewReq.find({
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
      isCompleted: true,
    });
    if (role === "Admin" && consolidatedData.department === "Admin") {
      adminAllTotalRequests = reqData.length;
      adminAllPendingRequests = reqData.filter(
        (req) => req.status === "Pending"
      ).length;
      adminAllCompletedRequests = reqData.filter(
        (req) => req.status === "Approved"
      ).length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (req.supplies?.totalValue && req.supplies?.selectedCurrency) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (
      (role === "Business Finance" ||
        role === "Head of Finance" ||
        role === "Vendor Management" ||
        role === "Info Security" ||
        role === "Legal Team") &&
      multipartRole != 1
    ) {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;
      pendingRequest = myRequestData.filter(
        (req) => req.status === "Pending" || req.status === "PO-Pending"
      ).length;

      const reqDataStatics = reqData.filter(
        (req) =>
          req.approvals.some((app) => app.nextDepartment === role) ||
          req.firstLevelApproval?.hodEmail === consolidatedData.company_email_id
      );

      console.log("reqDataStatics", reqDataStatics);

      totalApprovals = reqDataStatics.length;

      reqData.forEach((request) => {
        console.log("request----", request);

        if (!request.approvals || request.approvals.length === 0) {
          console.log("No approvals found for request ID:", request.reqid);
          return; // Skip this iteration if approvals are missing
        }

        let count = 0;

        const pendingRequests = request.approvals.filter((app) => {
          // Ensure request is not on hold or rejected
          if (request.status === "Hold" || request.status === "Rejected") {
            return false;
          }

          const isForEmployeeDept =
            app.departmentName === consolidatedData.department;
          const isPending =
            app.status === "Approved" && app.approvalId === empId;

          const hasPrevApproval = request.approvals.some((prevApp) => {
            console.log("prevApp", prevApp);
            return (
              prevApp.nextDepartment === role && prevApp.status === "Approved"
            );
          });

          return isForEmployeeDept && isPending && hasPrevApproval;
        });

        // pendingApprovals = pendingRequests.length;

        console.log("pendingRequests--", pendingRequests);

        const approvalsForEmployee2 = request.approvals.filter((app) => {
          const isApprovedByEmp =
            app.approvalId === empId && app.status === "Approved";
          const isFirstLevelApproved =
            request.firstLevelApproval?.hodEmail ===
            consolidatedData.company_email_id &&
            request.firstLevelApproval?.approved;

          return isApprovedByEmp || isFirstLevelApproved;
        });

        completedApprovals += approvalsForEmployee2.length;
      });

      let pendingCount = 0;
      const pendingApprovalsdata = await CreateNewReq.find({
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        isCompleted: true,
        status: { $nin: ["Hold", "Rejected"] }, // Exclude 'Hold' and 'Rejected' statuses
      });
      const data = pendingApprovalsdata.map((req) => {
        const { approvals, firstLevelApproval, status } = req;
        const lastLevelApprovals = approvals[approvals.length - 1];

        if (
          firstLevelApproval.hodEmail === consolidatedData.company_email_id &&
          firstLevelApproval.approved === false
        ) {
          pendingCount++;
        } else if (lastLevelApprovals?.nextDepartment === role) {
          pendingCount++;
        }
      });

      pendingApprovals = pendingCount;

      console.log("totalApprovals:", totalApprovals);
      console.log("pendingApprovals:", pendingApprovals);
      console.log("completedApprovals:", completedApprovals);

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.isCompleted &&
          req.supplies?.selectedCurrency
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (role === "Employee") {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedApprovals++;
        } else if (request.isCompleted) {
          pendingApprovals++;
        }
      });
    } else if (role === "HOD Department" || role === "Admin") {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedRequest++;
        } else {
          pendingRequest++;
        }
      });

      const hodApprovals = await CreateNewReq.find(
        {
          createdAt: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
          "firstLevelApproval.hodEmail": email,
          isCompleted: true,
        },
        { firstLevelApproval: 1 }
      ).lean();
      totalApprovals = hodApprovals.length;

      hodApprovals.forEach((request) => {
        if (request.firstLevelApproval?.status === "Approved") {
          myApprovals++;
        } else {
          pendingApprovals++;
        }
      });

      const completedApprovalsData = await CreateNewReq.find({
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        "firstLevelApproval.hodEmail": email,
        status: "Approved",
      }).lean();

      deptCompleteReq = completedApprovalsData.length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.supplies?.selectedCurrency &&
          req.firstLevelApproval?.hodEmail === email &&
          req.isCompleted
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (
      (role === "Business Finance" ||
        role === "Head of Finance" ||
        role === "Vendor Management" ||
        role === "Info Security" ||
        role === "Legal Team") &&
      multipartRole == 1
    ) {
      console.log("I am in multirole");

      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      pendingRequest = myRequestData.filter(
        (req) => req.status === "Pending"
      ).length;

      console.log(
        "role-consolidatedData.company_email_id",
        role,
        consolidatedData.company_email_id
      );
      const reqDataStatics = await CreateNewReq.find({
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        $or: [
          { "approvals.nextDepartment": role },
          { "firstLevelApproval.hodEmail": consolidatedData.company_email_id },
        ],
        isCompleted: true,
      });

      console.log("reqDataStatics", reqDataStatics);

      totalApprovals = reqDataStatics.length;
      completedApprovals = 0;

      const pendingApprovalData = await CreateNewReq.find({
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        $or: [
          {
            "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
            "firstLevelApproval.approved": false,
          },
          {
            "approvals.nextDepartment": { $eq: role },
          },
        ],
        isCompleted: true,
      });

      console.log("pendingApprovalData", pendingApprovalData);

      let pendingCount = 0;
      const pendingApprovalsdata = await CreateNewReq.find({
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        isCompleted: true,
        status: { $nin: ["Hold", "Rejected"] }, // Exclude 'Hold' and 'Rejected' statuses
      });
      const data = pendingApprovalsdata.map((req) => {
        const { approvals, firstLevelApproval, status } = req;
        const lastLevelApprovals = approvals[approvals.length - 1];

        if (
          firstLevelApproval.hodEmail === consolidatedData.company_email_id &&
          firstLevelApproval.approved === false
        ) {
          pendingCount++;
        } else if (lastLevelApprovals?.nextDepartment === role) {
          lastLevelApprovals++;
        }
      });

      const completedApprovalData = await CreateNewReq.find({
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
        $or: [
          {
            "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
            "firstLevelApproval.approved": true,
          },
          { "approvals.nextDepartment": role },
        ],
        isCompleted: true,
      });

      // pendingApprovals = pendingApprovalData.length;
      pendingApprovals = pendingCount;
      completedApprovals = completedApprovalData.length;

      // pendingApprovals = Math.max(0, totalApprovals - completedApprovals);

      console.log("totalApprovals:", totalApprovals);
      console.log("pendingApprovals:", pendingApprovals);
      console.log("completedApprovals:", completedApprovals);

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.isCompleted &&
          req.supplies?.selectedCurrency
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    }

    Object.keys(departmentBudgetByCurrency).forEach((currency) => {
      departmentBudgetByCurrency[currency] =
        Math.round(departmentBudgetByCurrency[currency] * 100) / 100;
    });

    res.status(200).json({
      role: consolidatedData.role,
      adminAllTotalRequests,
      adminAllPendingRequests,
      adminAllCompletedRequests,
      departmentBudgetByCurrency,
      myRequests,
      myApprovals,
      completedApprovals,
      pendingApprovals,
      pendingRequest,
      deptCompleteReq,
      completedRequest,
      totalApprovals,
    });
  } catch (err) {
    console.error("Error in getting the statistics", err);
    res.status(500).json({ message: "Error in getting the statistics" });
  }
};

const calculateBudget = (reqData, department = null) => {
  return reqData.reduce((acc, req) => {
    if (
      req.supplies &&
      req.supplies.totalValue &&
      req.supplies.selectedCurrency &&
      (!department || req.firstLevelApproval?.hodDepartment === department)
    ) {
      const { selectedCurrency, totalValue } = req.supplies;
      acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
    }
    return acc;
  }, {});
};

// const getApprovedReqData = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Id", id);

//     let consolidatedData;

//     const panelUserData = await addPanelUsers
//       .findOne(
//         { _id: id },
//         { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
//       )
//       .lean();
//     console.log("panelUserData", panelUserData);

//     const employeeData = await empModel
//       .findOne(
//         { _id: id },
//         {
//           _id: 1,
//           full_name: 1,
//           department: 1,
//           hod_email_id: 1,
//           company_email_id: 1,
//         }
//       )
//       .lean();

//     if (panelUserData) {
//       consolidatedData = panelUserData;
//     } else {
//       if (employeeData && !employeeData.role) {
//         const isEmpHod = await empModel
//           .findOne({ hod_email_id: employeeData.company_email_id })
//           .lean();
//         console.log("isEmpHod", isEmpHod);
//         consolidatedData = {
//           ...employeeData,
//           role: isEmpHod ? "HOD Department" : "Employee",
//         };
//       }
//     }
//     let reqData;

//     reqData = await CreateNewReq.find({
//       "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
//     })
//       .sort({ createdAt: -1 })
//       .exec();
//       console.log("reqData", reqData);
//     if (reqData.length<0) {
//       console.log("else");
//       reqData = await CreateNewReq.find().sort({ createdAt: -1 }).exec();
//     }

//     console.log("Request Data", reqData);
//     console.log("ReqData.count", reqData.length);

//     res.status(200).json({ reqData });
//   } catch (err) {
//     console.error("Error in fetching new notifications", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const getApprovedReqData = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Id", id);

//     let consolidatedData;

//     const panelUserData = await addPanelUsers
//       .findOne(
//         { _id: id },
//         { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
//       )
//       .lean();

//     console.log("panelUserData", panelUserData);

//     const employeeData = await empModel
//       .findOne(
//         { _id: id },
//         {
//           _id: 1,
//           full_name: 1,
//           department: 1,
//           hod_email_id: 1,
//           company_email_id: 1,
//         }
//       )
//       .lean();

//     if (panelUserData) {
//       consolidatedData = panelUserData;
//     } else if (employeeData) {
//       const isEmpHod = await CreateNewReq.findOne({
//         "firstLevelApproval.hodEmail": employeeData.company_email_id,
//       }).lean();

//       consolidatedData = {
//         ...employeeData,
//         role: isEmpHod ? "HOD Department" : "Employee",
//       };
//     }
//     console.log("consolidatedData", consolidatedData);

//     if (!consolidatedData || !consolidatedData.company_email_id) {
//       return res
//         .status(404)
//         .json({ message: "User not found or invalid data" });
//     }

//     let reqData = await CreateNewReq.find({
//       "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
//     })
//       .sort({ createdAt: -1 })
//       .exec();

//     console.log("reqData", reqData, consolidatedData.role);

//     if (
//       reqData.length === 0 &&
//       consolidatedData.role !== "HOD Department" &&
//       consolidatedData.role !== "Employee"
//     ) {
//       // Corrected condition
//       console.log("Fetching all requests as no matching records found.");
//       reqData = await CreateNewReq.find().sort({ createdAt: -1 }).exec();
//     }

//     console.log("Request Data", reqData);
//     console.log("ReqData.count", reqData.length);

//     res.status(200).json({ reqData });
//   } catch (err) {
//     console.error("Error in fetching new notifications", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const getApprovedReqData = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Id", id);

//     let consolidatedData;

//     const panelUserData = await addPanelUsers
//       .findOne(
//         { employee_id: id },
//         { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
//       )
//       .lean();

//     console.log("panelUserData", panelUserData);

//     const employeeData = await empModel
//       .findOne(
//         { employee_id: id },
//         {
//           _id: 1,
//           full_name: 1,
//           department: 1,
//           hod_email_id: 1,
//           company_email_id: 1,
//         }
//       )
//       .lean();

//     if (panelUserData) {
//       consolidatedData = panelUserData;
//     } else if (employeeData) {
//       const isEmpHod = await CreateNewReq.findOne({
//         "firstLevelApproval.hodEmail": employeeData.company_email_id,
//       }).lean();

//       consolidatedData = {
//         ...employeeData,
//         role: isEmpHod ? "HOD Department" : "Employee",
//       };
//     }

//     console.log("consolidatedData", consolidatedData);

//     if (!consolidatedData || !consolidatedData.company_email_id) {
//       return res
//         .status(404)
//         .json({ message: "User not found or invalid data" });
//     }

//     let reqData = await CreateNewReq.find({
//       "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
//       isCompleted: true,
//     })
//       .sort({ createdAt: -1 })
//       .lean(); // Added .lean() for better performance

//     console.log("reqData", reqData, consolidatedData.role);

//     if (
//       reqData.length === 0 &&
//       consolidatedData.role !== "HOD Department" &&
//       consolidatedData.role !== "Employee"
//     ) {
//       console.log("Fetching all requests as no matching records found.");
//       reqData = await CreateNewReq.find({
//         isCompleted: true,
//         $or: [
//           { "approvals.nextDepartment": consolidatedData.role },
//           { "firstLevelApproval.hodEmail": consolidatedData.company_email_id },
//         ],
//       })
//         .sort({ createdAt: -1 })
//         .lean();
//     }

//     const processedReqData = reqData.map((request) => {
//       const { approvals, firstLevelApproval } = request;
//       const latestLevelApproval = approvals?.[approvals.length - 1];
//       console.log("latestLevelApproval", latestLevelApproval);
//       let departmentInfo = {};

//       if (!latestLevelApproval) {
//         if (firstLevelApproval.approved) {
//           departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
//         } else {
//           departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
//         }

//         return { ...request, ...departmentInfo }; // This return was missing a closing brace
//       }

//       if (latestLevelApproval.status === "Approved") {
//         departmentInfo.nextDepartment = latestLevelApproval.nextDepartment;
//       } else if (
//         latestLevelApproval.status === "Hold" ||
//         latestLevelApproval.status === "Rejected"
//       ) {
//         departmentInfo.cDepartment = latestLevelApproval.departmentName;
//       }
//       console.log("latestLevelApproval", departmentInfo);

//       return { ...request, ...departmentInfo };
//     });

//     console.log("Processed Request Data", processedReqData);
//     res.status(200).json({ reqData: processedReqData });
//   } catch (err) {
//     console.error("Error in fetching new notifications", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const getApprovedReqData = async (req, res) => {
  try {
    const { id } = req.params;
    const { showPendingOnly } = req.query;
    console.log("showPendingOnly", showPendingOnly);


    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
      )
      .lean();

    const employeeData = await empModel
      .findOne(
        { employee_id: id },
        {
          _id: 1,
          full_name: 1,
          department: 1,
          hod_email_id: 1,
          company_email_id: 1,
        }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else if (employeeData) {
      const isEmpHod = await CreateNewReq.findOne({
        "firstLevelApproval.hodEmail": employeeData.company_email_id,
      }).lean();

      consolidatedData = {
        ...employeeData,
        role: isEmpHod ? "HOD Department" : "Employee",
      };
    }

    if (!consolidatedData || !consolidatedData.company_email_id) {
      return res
        .status(404)
        .json({ message: "User not found or invalid data" });
    }

    let reqData = await CreateNewReq.find({
      "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Check for pending filter
    if (showPendingOnly === "Pending") {
      reqData = reqData.filter((request) => {
        const latestLevelApproval =
          request.approvals?.[request.approvals.length - 1];

        return !latestLevelApproval || latestLevelApproval.status === "Pending";
      });
    }

    // If no pending requests are found, fetch all requests
    if (showPendingOnly === "All" || reqData.length === 0) {
      reqData = await CreateNewReq.find({
        isCompleted: true,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Process requests and check approval status
    const processedReqData = await Promise.all(
      reqData.map(async (request) => {
        const { approvals, firstLevelApproval, _id } = request;
        const latestLevelApproval = approvals?.[approvals.length - 1];
        let departmentInfo = {};

        if (!latestLevelApproval) {
          departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
        } else {
          if (latestLevelApproval.status === "Approved") {
            console.log("Am inside", latestLevelApproval.nextDepartment);
            departmentInfo.nextDepartment = latestLevelApproval.nextDepartment;
          } else if (
            latestLevelApproval.status === "Hold" ||
            latestLevelApproval.status === "Rejected"
          ) {
            departmentInfo.cDepartment = latestLevelApproval.departmentName;
          }
        }

        // Call the approval status function
        const approvalStatus = await checkApprovalStatus(
          consolidatedData.role,
          id,
          _id,
          consolidatedData.company_email_id
        );

        return { ...request, ...departmentInfo, approvalStatus };
      })
    );

    const sample = processedReqData.filter((req) => req.reqid==="INBH03112519");
    console.log("sample", sample);

    res.status(200).json({ reqData: processedReqData });
  } catch (err) {
    console.error("Error in fetching new notifications", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to check approval status and assign color if disabled
const checkApprovalStatus = async (role, userId, requestId, email) => {
  try {
    const request = await CreateNewReq.findById(requestId).lean();

    if (!request) {
      return { success: false, message: "Request not found", isDisplay: false };
    }

    const approvals = request.approvals || [];
    const latestApproval = approvals[approvals.length - 1];

    let isDisplay = true;
    let color = "gray"; // Default color

    if (latestApproval) {
      if (
        latestApproval.nextDepartment === role ||
        (latestApproval.approvalId === userId && request.status !== "Approved")
      ) {
        isDisplay = false;
        color = "red";
      } else if (
        latestApproval?.approvalId === userId &&
        (request.status === "Hold" || request.status === "Rejected")
      ) {
        console.log("Am inside");
        isDisplay = false;
        color = "red";
      }
    }
    if (!latestApproval) {
      if (
        request.firstLevelApproval.hodEmail === email &&
        request.firstLevelApproval.approved !== true
      ) {
        isDisplay = false;
        color = "red";
      }
    }

    return {
      success: true,
      message: "Approval status checked successfully",
      isDisplay,
      color,
    };
  } catch (error) {
    console.error("Error checking approval status:", error);
    return {
      success: false,
      message: "Error checking approval status",
      isDisplay: false,
    };
  }
};
const getFilteredRequest = async (req, res) => {
  try {
    const { id, action } = req.params;

    let consolidatedData;

    // Fetch panel user data
    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
      )
      .lean();

    // Fetch employee data if not a panel user
    const employeeData = await empModel
      .findOne(
        { employee_id: id },
        {
          _id: 1,
          full_name: 1,
          department: 1,
          hod_email_id: 1,
          company_email_id: 1,
        }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else if (employeeData) {
      const isEmpHod = await CreateNewReq.findOne({
        "firstLevelApproval.hodEmail": employeeData.company_email_id,
      }).lean();

      consolidatedData = {
        ...employeeData,
        role: isEmpHod ? "HOD Department" : "Employee",
      };
    }

    if (!consolidatedData || !consolidatedData.company_email_id) {
      return res
        .status(404)
        .json({ message: "User not found or invalid data" });
    }

    // Fetch requests assigned to this user's HOD email
    let reqData = await CreateNewReq.find({
      "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // If no matching requests and role is not HOD/Employee, fetch all completed requests
    if (
      reqData.length === 0 &&
      consolidatedData.role !== "HOD Department" &&
      consolidatedData.role !== "Employee"
    ) {
      reqData = await CreateNewReq.find({ isCompleted: true })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Process request data to add currentDepartment and nextDepartment
    const processedReqData = reqData.map((request) => {
      const { approvals, firstLevelApproval } = request;
      const latestLevelApproval = approvals?.[approvals.length - 1];

      let nextDepartment = null;
      let currentDepartment = null;

      if (!latestLevelApproval) {
        // No approvals yet → first level HOD
        nextDepartment = firstLevelApproval?.hodDepartment || null;
        currentDepartment = "Pending HOD Approval";
      } else if (latestLevelApproval.status === "Approved") {
        nextDepartment = latestLevelApproval.nextDepartment || null;
        currentDepartment = latestLevelApproval.departmentName || null;
      } else if (
        latestLevelApproval.status === "Hold" ||
        latestLevelApproval.status === "Rejected"
      ) {
        nextDepartment = latestLevelApproval.departmentName || null;
        currentDepartment = latestLevelApproval.departmentName || null;
      }

      return {
        ...request,
        nextDepartment,
        currentDepartment,
      };
    });

    res.status(200).json({ reqData: processedReqData });
  } catch (err) {
    console.error("Error in fetching filtered requests", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const isButtonSDisplay = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("button==>", id);

    const departmentData = await empModel.findOne(
      { _id: id },
      { empId: 1, department: 1 }
    );
    console.log(departmentData);

    if (!departmentData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isApproved = await CreateNewReq.exists({
      "approvals.department": departmentData.department,
    });

    const isNextDepartment = await CreateNewReq.exists({
      "approvals.nextDepartment": departmentData.department,
    });

    console.log("isApproved:", isApproved);
    console.log("isNextDepartment:", isNextDepartment);

    if (isApproved) {
      return res.status(200).json({ display: false, isDisable: true });
    } else if (isNextDepartment) {
      return res.status(200).json({ display: true, isDisable: false });
    } else {
      return res.status(200).json({ display: false, isDisable: true });
    }
  } catch (err) {
    console.error("Error in is display button:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generatePo = async (req, res) => {
  try {
    console.log("Welcome to generate PO", req.params);

    const reqData = await CreateNewReq.findOne(
      { _id: req.params.id },
      { approvals: 0, commentLogs: 0, complinces: 0 }
    );

    console.log(reqData);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({
      message: "PO data generated successfully",
      reqData,
    });
  } catch (err) {
    console.log("Error in generating PO", err);
    return res
      .status(500)
      .json({ message: "Error in generating PO", error: err.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    console.log("Welcome to req.body", req.body);

    const { id } = req.params;
    const { complinces, commercials, procurements, supplies, reqid } = req.body;
    const reqId = reqid;

    let hasDeviation = 0;

    if (complinces) {
      for (const key in complinces) {
        if (complinces[key].expectedAnswer !== complinces[key].answer) {
          hasDeviation = 1;
          break;
        }
      }
    }

    let reqDatas =
      (await CreateNewReq.findOne(
        { reqid: reqId },
        { procurements: 1 }
      ).lean()) || {};

    console.log("reqDatas", reqDatas);

    if (!complinces || !commercials) {
      return res
        .status(400)
        .json({ message: "Missing required compliance or commercial data." });
    }

    let empData = await empModel
      .findOne(
        { employee_id: id },
        { full_name: 1, employee_id: 1, department: 1, hod: 1, hod_email_id: 1 }
      )
      .lean();

    if (!empData) {
      empData = await addPanelUsers.findOne({ employee_id: id }).lean();
    }

    if (!empData) {
      return res.status(404).json({
        message: "Employee not found. Please provide a valid employee ID.",
      });
    }

    const panelMemberEmail = (
      await addPanelUsers
        .find({ role: { $ne: "Admin" } }, { company_email_id: 1, _id: 0 })
        .lean()
    ).map((member) => member.company_email_id);

    if (commercials.hodEmail) {
      panelMemberEmail.push(commercials.hodEmail);
    }

    let existingRequest = await CreateNewReq.findOne({ reqid: reqId });

    if (existingRequest) {
      let firstLevelApprovalUpdateNeeded = false;
      const existingFirstLevelApproval =
        existingRequest.firstLevelApproval || {};

      if (
        existingFirstLevelApproval.hodName !== commercials.hod &&
        existingFirstLevelApproval.hodEmail !== commercials.hodEmail
      ) {
        firstLevelApprovalUpdateNeeded = true;
      }

      if (firstLevelApprovalUpdateNeeded) {
        existingRequest.firstLevelApproval = {
          hodName: commercials.hod,
          hodEmail: commercials.hodEmail,
          hodDepartment: commercials.department,
          approved: false,
          status: "Pending",
        };
      }

      Object.assign(existingRequest, {
        commercials,
        procurements,
        supplies,
        complinces,
        hasDeviations: hasDeviation,
        isCompleted: true,
      });

      await existingRequest.save();

      try {
        await sendBulkEmails(
          panelMemberEmail,
          empData.full_name,
          empData.department,
          reqId
        );
      } catch (emailError) {
        console.error("Error sending bulk emails:", emailError);
      }

      let { vendorName, email, isNewVendor } = procurements || {};
      if (isNewVendor) {
        try {
          await sendEmail(email, "vendorOnboarding", { vendorName });

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

          await Promise.all(
            vendorManagementEmails.map(
              async ({ company_email_id }) =>
                await sendEmail(company_email_id, "newVendorOnBoard", {
                  vendorName: reqDatas.procurements?.vendorName,
                  email: reqDatas.procurements?.email,
                  reqId,
                })
            )
          );
        } catch (emailError) {
          console.error("Error sending vendor emails:", emailError);
        }
      }

      return res.status(200).json({
        message: "Request updated successfully",
        data: existingRequest,
      });
    } else {
      const newRequest = new CreateNewReq({
        reqid: reqId,
        userId: id,
        userName: empData.full_name,
        commercials,
        procurements,
        supplies,
        complinces,
        hasDeviations: hasDeviation ? 1 : 0,
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

      try {
        await sendBulkEmails(
          panelMemberEmail,
          empData.full_name,
          empData.department,
          reqId
        );
      } catch (emailError) {
        console.error("Error sending bulk emails:", emailError);
      }

      return res
        .status(201)
        .json({ message: "Request created successfully", data: newRequest });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

const downloadInvoicePdf = async (req, res) => {
  try {
    console.log("Downloading...");
    const { id } = req.params;
    console.log(id);

    const invoiceData = await CreateNewReq.findOne(
      { _id: id },
      { approvals: 0, commentLogs: 0, complinces: 0 }
    );
    console.log("Invoice data", invoiceData);

    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${invoiceData.reqid}.pdf`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to PDF
    generatePdfContent(doc, invoiceData);

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

const generatePdfContent = (doc, invoiceData) => {
  try {
    // Set initial positions and dimensions
    const margin = 50;
    const pageWidth = doc.page.width - 2 * margin;
    let yPos = margin;

    // Helper function to check page space and add new page if needed
    const checkAndAddPage = (neededSpace) => {
      if (yPos + neededSpace > doc.page.height - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Add header section
    doc.font("Helvetica-Bold");
    doc.fontSize(20);
    doc.text("Purchase Order Request", margin, yPos, { align: "center" });
    yPos += 30;

    // Company details (left side)
    doc.fontSize(10);
    doc.font("Helvetica");
    const companyDetails = [
      "Capillary Technologies India Ltd",
      "360, bearing PID No: 101, 360, 15th Cross Rd,",
      "Sector 4, HSR Layout",
      "Bengaluru, Karnataka 560102",
      "India",
      "",
      "Web: www.capillarytech.com",
      "Email: accounts@capillarytech.com",
      "Tax No.: 29AAECK7007Q1ZY",
    ];

    companyDetails.forEach((line) => {
      doc.text(line, margin, yPos);
      yPos += 15;
    });

    // Invoice details (right side)
    const invoiceDetailY = yPos - companyDetails.length * 15;
    doc.fontSize(10);
    doc.text(
      `Invoice No: #${invoiceData.reqid}`,
      pageWidth - 150,
      invoiceDetailY
    );
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - 150,
      invoiceDetailY + 15
    );

    yPos += 30;

    // Billing and Shipping Information
    doc.font("Helvetica-Bold");
    doc.fontSize(12);

    // Draw boxes for Bill To and Ship To
    const boxHeight = 80;
    const boxWidth = (pageWidth - 20) / 2;

    // Bill To Box
    doc.rect(margin, yPos, boxWidth, boxHeight).stroke();
    doc.text("Bill To:", margin + 10, yPos + 10);
    doc.font("Helvetica");
    doc.fontSize(10);
    doc.text(invoiceData.commercials?.billTo || "", margin + 10, yPos + 30, {
      width: boxWidth - 20,
      height: boxHeight - 40,
    });

    // Ship To Box
    doc.font("Helvetica-Bold");
    doc.fontSize(12);
    doc.rect(margin + boxWidth + 20, yPos, boxWidth, boxHeight).stroke();
    doc.text("Ship To:", margin + boxWidth + 30, yPos + 10);
    doc.font("Helvetica");
    doc.fontSize(10);
    doc.text(
      invoiceData.commercials?.shipTo || "",
      margin + boxWidth + 30,
      yPos + 30,
      {
        width: boxWidth - 20,
        height: boxHeight - 40,
      }
    );

    yPos += boxHeight + 30;

    // Services Table
    const drawTableHeader = (y) => {
      doc.font("Helvetica-Bold").fontSize(10);
      const headers = [
        { text: "Description", x: margin, width: 200 },
        { text: "Qty", x: margin + 210, width: 50 },
        { text: "Rate", x: margin + 270, width: 70 },
        { text: "Tax", x: margin + 350, width: 50 },
        { text: "Amount", x: margin + 410, width: 80 },
      ];

      // Draw header background
      doc.rect(margin, y, pageWidth, 20).fill("#f0f0f0");

      // Draw header texts
      headers.forEach((header) => {
        doc
          .fill("#000000")
          .text(header.text, header.x, y + 5, { width: header.width });
      });

      return y + 25;
    };

    yPos = drawTableHeader(yPos);

    // Table content
    doc.font("Helvetica").fontSize(10);
    (invoiceData.supplies?.services || []).forEach((service, index) => {
      checkAndAddPage(40);

      // Draw alternating row background
      if (index % 2 === 0) {
        doc.rect(margin, yPos - 5, pageWidth, 25).fill("#f9f9f9");
      }

      doc.fill("#000000");
      doc.text(service.productName, margin, yPos);
      doc.text(service.quantity.toString(), margin + 210, yPos);
      doc.text(service.price.toString(), margin + 270, yPos);
      doc.text(`${service.tax || "0"}%`, margin + 350, yPos);
      doc.text(calculateRowTotal(service).toFixed(2), margin + 410, yPos);

      yPos += 25;
    });

    // Totals section
    checkAndAddPage(100);
    yPos += 20;

    const totalsX = margin + 310;
    doc.fontSize(10);

    // Draw totals box
    doc.rect(totalsX, yPos, 200, 80).stroke();

    // Subtotal
    doc.text("Subtotal:", totalsX + 10, yPos + 10);
    doc.text(
      `${invoiceData.supplies?.selectedCurrency} ${calculateSubtotal(
        invoiceData.supplies?.services
      ).toFixed(2)}`,
      totalsX + 100,
      yPos + 10,
      { align: "right", width: 90 }
    );

    // Tax
    doc.text("Total Tax:", totalsX + 10, yPos + 35);
    doc.text(
      `${invoiceData.supplies?.selectedCurrency} ${calculateTotalTax(
        invoiceData.supplies?.services
      ).toFixed(2)}`,
      totalsX + 100,
      yPos + 35,
      { align: "right", width: 90 }
    );

    // Total
    doc.font("Helvetica-Bold");
    doc.text("Total:", totalsX + 10, yPos + 60);
    doc.text(
      `${invoiceData.supplies?.selectedCurrency} ${calculateTotal(
        invoiceData.supplies?.services
      ).toFixed(2)}`,
      totalsX + 100,
      yPos + 60,
      { align: "right", width: 90 }
    );

    // Footer
    doc.font("Helvetica");
    doc.fontSize(8);
    const footerY = doc.page.height - 50;
    doc.text(
      "Payment Instructions: Please pay via bank transfer to account #123456789",
      margin,
      footerY
    );
    doc.text("Thank you for your business!", margin, footerY + 15);
    console.log("success");
    return res.status(200);
  } catch (error) {
    console.error("Error generating PDF content:", error);
  }
};

// Helper functions for calculations
const calculateSubtotal = (services) => {
  if (!services) return 0;
  return services.reduce((acc, service) => {
    return acc + parseFloat(service.price) * parseInt(service.quantity);
  }, 0);
};

const calculateServiceTax = (service) => {
  const subtotal = parseFloat(service.price) * parseInt(service.quantity);
  const taxRate = service.tax ? parseFloat(service.tax) : 0;
  return subtotal * (taxRate / 100);
};

const calculateTotalTax = (services) => {
  if (!services) return 0;
  return services.reduce((acc, service) => {
    return acc + calculateServiceTax(service);
  }, 0);
};

const calculateTotal = (services) => {
  const subtotal = calculateSubtotal(services);
  const totalTax = calculateTotalTax(services);
  return subtotal + totalTax;
};

const calculateRowTotal = (service) => {
  const subtotal = parseFloat(service.price) * parseInt(service.quantity);
  const tax = calculateServiceTax(service);
  return subtotal + tax;
};

const sendNudgeNotification = async (req, res) => {
  try {
    console.log("Welcome to nudge notification", req.params);
    const { reqId } = req.params;
    const nudgeRequest = await EmailSettings.findOne({ emailId: "6" });
    console.log("nudgeRequest", nudgeRequest);

    const nudgeData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1, firstLevelApproval: 1, userId: 1, reqid: 1 }
    );
    const userData = await empModel.findOne(
      { employee_id: nudgeData.userId },
      { full_name: 1, company_email_id: 1, employee_id: 1, department: 1 }
    );
    if (!nudgeData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { firstLevelApproval, approvals } = nudgeData;

    let to_name = "";
    let to_email = "";

    if (
      !firstLevelApproval.approved &&
      firstLevelApproval.status !== "Approved"
    ) {
      to_name = firstLevelApproval.hodName;
      to_email = firstLevelApproval.hodEmail;
    } else {
      const approvedApprovals = approvals.filter(
        (approval) => approval.status === "Approved"
      );
      if (approvedApprovals.length === 0) {
        return res.status(404).json({ message: "No approved approvals found" });
      }

      const latestApprovedApproval = approvedApprovals.sort(
        (a, b) => new Date(b.approvalDate) - new Date(a.approvalDate)
      )[0];

      const empData =
        (await empModel
          .findOne(
            { department: latestApprovedApproval.nextDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          )
          .lean()) ||
        (await addPanelUsers
          .findOne({ role: latestApprovedApproval.nextDepartment })
          .lean());

      if (!empData) {
        return res
          .status(404)
          .json({ message: "Approver not found for the next department" });
      }

      to_name = empData.full_name;
      to_email = empData.company_email_id;
    }
    console.log("nudgeData", nudgeData.reqid);

    if (nudgeRequest.emailStatus) {
      await sendEmail(to_email, "nudgeNotification", {
        to_name,
        empId: userData.employee_id,
        empName: userData.full_name,
        reqid: nudgeData.reqid,
        empEmail: userData.company_email_id,
        department: userData.department,
      });
    }

    return res
      .status(200)
      .json({ message: "Nudge notification sent successfully" });
  } catch (err) {
    console.log("Error in sending the nudge notification", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReports = async (req, res) => {
  try {
    const reqData = await CreateNewReq.find({ isCompleted: true });
    console.log("ReqData", reqData);

    // Initialize counters
    let totalRequests = 0;
    let pendingRequests = 0;
    let rejectedRequests = 0;
    let approvedRequests = 0;
    let holdRequests = 0;
    let departmentBudgetByCurrency = 0;
    let poPendingRequest = 0;
    let invoicePending = 0;

    // Loop through the data and count based on the 'status'
    reqData.forEach((request) => {
      totalRequests++; // Increment total request count

      if (request.status === "Pending") {
        pendingRequests++; // Increment pending requests count
      } else if (request.status === "Rejected") {
        rejectedRequests++; // Increment rejected requests count
      } else if (request.status === "Hold") {
        holdRequests++;
      } else if (request.status === "Approved") {
        approvedRequests++;
      } else if (request.status === "PO-Pending") {
        poPendingRequest++;
      } else if (request.status === "Invoice-Pending") {
        invoicePending++;
      }
    });

    departmentBudgetByCurrency = reqData.reduce((acc, req) => {
      if (req.supplies?.totalValue && req.supplies?.selectedCurrency) {
        const { selectedCurrency, totalValue } = req.supplies;
        acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
      }
      return acc;
    }, {});

    // Return or log the results
    console.log("Total Requests:", totalRequests);
    console.log("Pending Requests:", pendingRequests);
    console.log("Rejected Requests:", rejectedRequests);

    // Optionally, send the counts in the response
    res.json({
      totalRequests,
      pendingRequests,
      rejectedRequests,
      departmentBudgetByCurrency,
      invoicePending,
      approvedRequests,
      poPendingRequest,
      approvedRequests,
      holdRequests,
    });
  } catch (err) {
    console.log("Error in getting the reports", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

const isApproved = async (req, res) => {
  try {
    console.log("is approve", req.params);
    const { userId, reqId, role } = req.params;
    console.log("userId", userId, reqId, role);

    // Fetch employee data
    const empData =
      (await empModel.findOne(
        { employee_id: userId },
        { full_name: 1, employee_id: 1, company_email_id: 1, department: 1 }
      )) || (await addPanelUsers.findOne({ employee_id: userId }));

    if (!empData) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    let disable = true;

    // Fetch request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { firstLevelApproval: 1, approvals: 1 }
    );
    console.log("reqData", reqData);
    const { approvals } = reqData;
    console.log("approvals", approvals, reqData.firstLevelApproval);
    const lastlevalApproval = approvals[approvals.length - 1];

    if (
      (role === "HOD Department" ||
        role === "Admin" ||
        reqData.firstLevelApproval.hodEmail === empData.company_email_id) &&
      reqData.firstLevelApproval.hodEmail === empData.company_email_id &&
      lastlevalApproval?.nextDepartment !== role
    ) {
      console.log("HOD Deparment");
      if (!reqData.firstLevelApproval.approved) {
        disable = false;
      }
    } else if (
      reqData.firstLevelApproval.approved === true &&
      role !== "HOD Department"
    ) {
      console.log("1");
      console.log("lastlevalApproval", lastlevalApproval, role);
      if (lastlevalApproval.nextDepartment === role) {
        console.log("2");
        disable = false;
      } else if (
        reqData.status !== "Approved" &&
        lastlevalApproval.approvalId === empData.employee_id &&
        role === lastlevalApproval.nextDepartment
      ) {
        console.log("3");
        disable = false;
      } else if (
        reqData.status !== "Approved" &&
        lastlevalApproval.approvalId === empData.employee_id &&
        lastlevalApproval.status !== "Approved"
      ) {
        console.log("4");

        disable = false;
      }
    }

    console.log("disable", disable);

    return res.status(200).json({
      success: true,
      message: "Approval status checked successfullyyes",
      isDisplay: disable,
    });
  } catch (err) {
    console.error("Error in getting the is approve", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const editSendRequestMail = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    console.log("Welcome sending the edit request mail", empId);
    const editRequestEnable = await EmailSettings.findOne({ emailId: "6" });
    console.log("editRequestEnable", editRequestEnable);

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { reqid: 1, firstLevelApproval: 1 }
    );

    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        {
          full_name: 1,
          employee_id: 1,
          company_email_id: 1,
          department: 1,
          hod: 1,
          hod_email_id: 1,
        }
      )) || (await addPanelUsers.findOne({ _id: empId }));
    console.log(empData);

    if (!empData) {
      return res.status(404).send("Employee not found");
    }

    const {
      full_name,
      hod_email_id,
      employee_id,
      department,
      company_email_id,
    } = empData;

    const { hodEmail, hodName } = reqData.firstLevelApproval;

    if (editRequestEnable.emailStatus) {
      await sendEmail(hodEmail, "editRequest", {
        empId: employee_id,
        empName: full_name,
        empEmail: company_email_id,
        reqid: reqData.reqid,
        to_name: hodName,

        department,
      });
    }

    res.status(200).send("Edit request email sent successfully");
  } catch (err) {
    console.log("Error in sending the edit request mail", err);
    res.status(500).send("Error in sending the email");
  }
};

const uploadPoDocuments = async (req, res) => {
  try {
    console.log("Welcome to upload documets", req.body);

    const { reqId, empId } = req.params;
    const { link, poNumber } = req.body;
    const oldReqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1, userId: 1, reqid: 1 }
    );
    const { approvals, userId, reqid } = oldReqData;
    const latestApproval = approvals[approvals.length - 1];

    const requesterData = await empModel.findOne(
      { employee_id: userId },
      { full_name: 1, company_email_id: 1 }
    );

    // Fetch employee data
    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        {
          full_name: 1,
          employee_id: 1,
          department: 1,
        }
      )) || (await addPanelUsers.findOne({ employee_id: empId }));

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prepare the PO document data
    const poDocument = {
      uploadedBy: {
        empName: empData.full_name,
        empId: empData.employee_id,
        department: empData.department,
        uploadedOn: new Date(), // Current date
        receivedConfirmation: null, // Initially null
      },
      poNumber: poNumber,
      poLink: link,
    };

    const approvalRecord = {
      departmentName: empData.department,
      status: "Po-Uploaded",
      approverName: empData.full_name,
      approvalId: empData.employee_id,
      approvalDate: new Date(),
      remarks: "",
      nextDepartment: "Invoice-Pending",
      receivedOn: latestApproval?.approvalDate,
    };

    // Update the request with PO document details
    const updatedRequest = await CreateNewReq.findByIdAndUpdate(
      reqId,
      {
        $push: { approvals: approvalRecord },
        $set: {
          poDocuments: poDocument,
          status: "Invoice-Pending",
        },
      },
      { new: true }
    );

    await sendEmail(
      requesterData.company_email_id,
      "poUploadedNotificationTemplate",
      {
        reqId: reqid,
        requestorName: requesterData.full_name,
        employeeName: latestApproval.approverName,
        department: latestApproval.departmentName,
        pdfLink: link,
      }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({
      message: "PO Document uploaded successfully",
      data: updatedRequest,
    });
  } catch (err) {
    console.error("Error in uploading the documents", err);
    return res.status(500).json({
      message: "Error uploading PO document",
      error: err.message,
    });
  }
};

const uploadInvoiceDocuments = async (req, res) => {
  try {
    console.log("Welcome to upload documents");

    const { reqId, empId } = req.params;
    const { link, notes, invoiceNumber } = req.body; // Added 'notes' for invoice

    console.log(link, reqId, empId);

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { reqid: 1, approvals: 1, commercials: 1, userId: 1, poDocuments: 1 }
    );

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { approvals, commercials, userId, reqid } = reqData;
    const latestApproval = approvals[approvals.length - 1];
    const requestorData = await empModel.findOne(
      { employee_id: userId },
      { full_name: 1, department: 1 }
    );

    // Fetch employee data
    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        {
          full_name: 1,
          employee_id: 1,
          department: 1,
        }
      )) || (await addPanelUsers.findOne({ employee_id: empId }));

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prepare the invoice document data
    const invoiceDocument = {
      uploadedBy: {
        empName: empData.full_name,
        empId: empData.employee_id,
        department: empData.department,
        uploadedOn: new Date(),
        receivedConfirmation: null,
        invoiceLink: link,
        notes: notes || "", // Optional notes field
        invoiceNumber,
      },
    };

    const approvalRecord = {
      departmentName: empData.department,
      status: "Invoice-Uploaded",
      approverName: empData.full_name,
      approvalId: empData.employee_id,
      approvalDate: new Date(),
      remarks: "",
      nextDepartment: "Request flow completed",
      receivedOn: latestApproval?.approvalDate,
    };

    // Update the request with the new invoice document
    const updatedRequest = await CreateNewReq.findByIdAndUpdate(
      reqId,
      {
        $push: {
          invoiceDocumets: invoiceDocument, // Append new invoice document
          approvals: approvalRecord, // Append approval record
        },
        $set: { status: "Approved" }, // Update status
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    const invoiceMail = await entityModel.findOne(
      { _id: commercials?.entityId },
      { invoiceMailId: 1 }
    );
    console.log("Invoice mail id", invoiceMail);

    const { invoiceMailId } = invoiceMail;
    await sendEmail(invoiceMailId, "invoiceUploadedEmail", {
      reqId: reqid,
      employeeName: requestorData.full_name,
      department: requestorData.department,
      invoiceLink: link,
    });

    return res.status(200).json({
      message: "Invoice Document uploaded successfully",
      data: updatedRequest,
    });
  } catch (err) {
    console.error("Error in uploading the documents", err);
    return res.status(500).json({
      message: "Error uploading invoice document",
      error: err.message,
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    console.log("Welcome to approbe req", req.body);
    const { reqId, status, remarks, email } = req.body;
    const { id } = req.params; // Approver's ID
    console.log("Status", status, id);
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        approvals: 1,
        userId: 1,
        createdAt: 1,
        firstLevelApproval: 1,
        hasDeviations: 1,
        commercials: 1,
        procurements: 1,
        reqid: 1,
      }
    );
    const { firstLevelApproval } = reqData;

    // Validate request status
    const validStatuses = ["Approved", "Rejected", "Hold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Status must be Approved, Rejected, or Hold",
      });
    }

    let approverData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean(); // Use lean here as well
    console.log("panelUserData", panelUserData);

    // Find the employee data
    const employeeData = await empModel
      .findOne(
        { employee_id: id },
        {
          _id: 1,
          full_name: 1,
          department: 1,
          company_email_id: 1,
          hod_email_id: 1,
          employee_id: 1,
        }
      )
      .lean(); // Use lean to get plain object
    console.log("employeeData", employeeData);

    if (panelUserData) {
      approverData = panelUserData;
    } else {
      if (employeeData && !employeeData.role) {
        const isEmpHod = firstLevelApproval.hodEmail === email;

        console.log("isEmpHod", isEmpHod);
        approverData = {
          ...employeeData, // Include existing employee data
          role: isEmpHod ? "HOD Department" : "Employee", // Assign role dynamically
        };
      }
    }

    const { department } = approverData;
    console.log("Approver department", department);

    // Fetch the request data

    const requestorData = await empModel.findOne(
      { employee_id: reqData.userId },
      { company_email_id: 1, full_name: 1, department: 1 }
    );
    const theReqId = reqData.reqid;

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvals = reqData.approvals || [];
    console.log(firstLevelApproval);

    // Define the department workflow order
    const departmentOrder = [
      firstLevelApproval.hodEmail,
      "Business Finance",
      "Vendor Management",
      "Legal Team",
      "Info Security",
      "HOF",
      "Proceed the PO invoice",
    ];

    // Validation 1: Check if HOD Department is the first approver
    if (approvals.length === 0 && email !== firstLevelApproval.hodEmail) {
      return res.status(400).json({
        message: "HOD Department must approve the request first.",
      });
    }

    // Get the latest approval
    const latestApproval = approvals[approvals.length - 1];

    // Validation 2: Check if any department has already rejected or put the request on hold
    if (
      latestApproval &&
      (latestApproval.status === "Rejected" || latestApproval.status === "Hold")
    ) {
      return res.status(400).json({
        message: `Request is currently ${latestApproval.status.toLowerCase()} by ${latestApproval.departmentName
          }. No further actions can be taken.`,
      });
    }

    // Validation 3: Check if the department has already approved
    const departmentPreviousApproval = approvals.find(
      (approval) => approval.departmentName === department
    );

    if (departmentPreviousApproval) {
      return res.status(400).json({
        message: `${department} has already processed this request with status: ${departmentPreviousApproval.status}`,
      });
    }

    // Validation 5: Check if it matches the expected next department
    if (latestApproval && latestApproval.nextDepartment !== department) {
      return res.status(400).json({
        message: `Request is not yet assigned to ${department}. Current assignment: ${latestApproval.nextDepartment}`,
      });
    }

    // Determine the next department
    console.log(
      "departmentOrder",
      departmentOrder,
      departmentOrder.indexOf(email)
    );
    let currentDeptIndex;
    if (email === firstLevelApproval.hodEmail) {
      currentDeptIndex = departmentOrder.indexOf(email);
    } else {
      currentDeptIndex = departmentOrder.indexOf(department);
    }

    console.log("currentDeptIndex", currentDeptIndex);
    const nextDepartment = departmentOrder[currentDeptIndex + 1] || null;
    console.log("n,nextDepartmentextDepartment", nextDepartment);

    // Create the approval record
    const approvalRecord = {
      departmentName: department,
      status: status,
      approverName: approverData.full_name,
      approvalId: approverData.employee_id,
      approvalDate: new Date(), // Current date and time
      remarks: remarks || "",
      nextDepartment: status === "Approved" ? nextDepartment : null,
      receivedOn:
        email === firstLevelApproval.hodEmail
          ? reqData.createdAt
          : latestApproval.approvalDate,
    };

    // Update request status

    let updatedStatus = "Pending";

    if (status === "Hold" || status === "Rejected") {
      updatedStatus = status;
    } else if (status === "Approved") {
      updatedStatus = "Pending";
    }
    console.log("updatedStatus", updatedStatus);

    const updateResult = await CreateNewReq.updateOne(
      {
        _id: reqId,
        $or: [
          { approvals: { $size: 0 } }, // First approval
          { "approvals.nextDepartment": department }, // Next in workflow
        ],
      },
      {
        $push: { approvals: approvalRecord },
        $set: {
          status: updatedStatus,
          currentDepartment:
            status === "Approved" ? nextDepartment : department,
        },
      }
    );

    if (email === firstLevelApproval.hodEmail) {
      if (status === "Approved") {
        console.log("Inaide work flow");
        firstLevelApproval.status = status;
        firstLevelApproval.approved = true;
      } else {
        console.log("Inaide work flow");
        firstLevelApproval.status = status;
        firstLevelApproval.approved = false;
        reqData.status = status;
      }
      await reqData.save();
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        message: "Unable to update request. Please verify the workflow state.",
      });
    }

    if (
      department === "Business Finance" &&
      !reqData.procurements.isNewVendor &&
      status === "Approved"
    ) {
      console.log("Am inside");
      if (reqData.hasDeviations === 1) {
        const autoApproveDepartments = ["Vendor Management", "Legal Team"];
        const remarks = "Auto-approved";

        for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
          const autoDepartment = autoApproveDepartments[i];
          const isLastDepartment = i === autoApproveDepartments.length - 1;

          const nextAutoDepartment = isLastDepartment
            ? null
            : autoApproveDepartments[i + 1];

          const autoApproverData = await addPanelUsers.findOne(
            { department: autoDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          );

          console.log("Inside auto-approval", autoApproverData);

          if (autoApproverData) {
            const autoApprovalRecord = {
              departmentName: autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: remarks,
              nextDepartment: nextAutoDepartment,
              receivedOn: new Date(),
            };

            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $push: { approvals: autoApprovalRecord },
                $set: {
                  currentStatus: "Approved",
                  currentDepartment: nextAutoDepartment || autoDepartment,
                },
              }
            );

            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break; // Stop the auto-approval process if approver data is missing
          }
        }
      } else {
        const autoApproveDepartments = [
          "Vendor Management",
          "Legal Team",
          "Info Security",
          "HOF",
        ];
        const remarks = "Auto-approved";

        for (let i = 0; i < autoApproveDepartments.length; i++) {
          const autoDepartment = autoApproveDepartments[i];
          const isLastDepartment = i === autoApproveDepartments.length - 1;

          const nextAutoDepartment = isLastDepartment
            ? null
            : autoApproveDepartments[i + 1];

          const autoApproverData = await addPanelUsers.findOne(
            { department: autoDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          );

          console.log("Inside auto-approval", autoApproverData);

          if (autoApproverData) {
            const autoApprovalRecord = {
              departmentName: autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: remarks,
              nextDepartment: nextAutoDepartment,
              receivedOn: new Date(),
            };

            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $push: { approvals: autoApprovalRecord },
                $set: {
                  currentStatus: "Approved",
                  currentDepartment: nextAutoDepartment || autoDepartment,
                },
              }
            );

            // Optionally, send approval email notifications
            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break; // Stop the auto-approval process if approver data is missing
          }

          // After Info Security, the flow should move to HOF, but no approval happens at HOF
          if (autoDepartment === "Info Security") {
            console.log(
              "Info Security approved. Moving to HOF, but no auto-approval needed."
            );
            // Update to set the current department to HOF but no approval record is created for HOF
            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $set: {
                  currentDepartment: "HOF",
                },
              }
            );
            break; // No further auto-approval, just update to HOF
          }
        }
      }
    }

    if (department === "HOF" && status === "Approved") {
      await CreateNewReq.updateOne(
        { _id: reqId },
        {
          $set: {
            status: "PO-Pending",
            approvedOn: new Date(),
          },
        }
      );
      const entityMail = await entityModel.findOne(
        { _id: reqData.commercials.entityId },
        { poMailId: 1 }
      );
      console.log("entityMail", entityMail);
      const { poMailId } = entityMail;
      await sendEmail(poMailId, "financeApprovalEmail", {
        theReqId,
      });
    }

    if (
      department === "Vendor Management" &&
      reqData.hasDeviations === 0 &&
      status === "Approved"
    ) {
      console.log(
        "Auto approved ",
        department === "Vendor Management",
        reqData.hasDeviations === 0
      );

      const autoApproveDepartments = ["Legal Team", "Info Security", "HOF"];
      const remarks = "Auto-approved: No violations in the legal compliance";

      for (let i = 0; i < autoApproveDepartments.length; i++) {
        const autoDepartment = autoApproveDepartments[i];
        const isLastDepartment = i === autoApproveDepartments.length - 1;

        const nextAutoDepartment = isLastDepartment
          ? null
          : autoApproveDepartments[i + 1];

        const autoApproverData = await addPanelUsers.findOne(
          { department: autoDepartment },
          { full_name: 1, employee_id: 1, company_email_id: 1 }
        );

        console.log("Inside auto-approval", autoApproverData);

        if (autoApproverData) {
          const autoApprovalRecord = {
            departmentName: autoDepartment,
            status: "Approved",
            approverName: autoApproverData.full_name,
            approvalId: autoApproverData.employee_id,
            approvalDate: new Date(),
            remarks: remarks,
            nextDepartment: nextAutoDepartment,
            receivedOn: new Date(),
          };

          await CreateNewReq.updateOne(
            { _id: reqId },
            {
              $push: { approvals: autoApprovalRecord },
              $set: {
                currentStatus: "Approved",
                currentDepartment: nextAutoDepartment || autoDepartment,
              },
            }
          );

          // Optionally, send approval email notifications
          await sendIndividualEmail(
            "EMPLOYEE",
            requestorData.company_email_id,
            requestorData.full_name,
            requestorData.department,
            theReqId,
            autoApprovalRecord
          );
          await sendIndividualEmail(
            "AUTHORITY",
            autoApproverData.company_email_id,
            autoApproverData.full_name,
            autoApproverData.department,
            theReqId,
            autoApprovalRecord
          );

          console.log(
            `Auto-approval completed for department: ${autoDepartment}`
          );
        } else {
          console.error(`No approver found for department: ${autoDepartment}`);
          break; // Stop the auto-approval process if approver data is missing
        }

        // After Info Security, the flow should move to HOF, but no approval happens at HOF
        if (autoDepartment === "Info Security") {
          console.log(
            "Info Security approved. Moving to HOF, but no auto-approval needed."
          );
          // Update to set the current department to HOF but no approval record is created for HOF
          await CreateNewReq.updateOne(
            { _id: reqId },
            {
              $set: {
                currentDepartment: "HOF",
              },
            }
          );
          break; // No further auto-approval, just update to HOF
        }
      }
    } else {
      await sendIndividualEmail(
        "EMPLOYEE",
        requestorData.company_email_id,
        requestorData.full_name,
        requestorData.department,
        theReqId,
        approvalRecord
      );
      if (status === "Approved") {
        await sendIndividualEmail(
          "AUTHORITY",
          approverData.company_email_id,
          approverData.full_name,
          approverData.department,
          theReqId,
          approvalRecord
        );
      }
    }

    // Send success response with detailed message
    const message =
      status === "Approved"
        ? `Request approved successfully by ${department}`
        : `Request ${status.toLowerCase()} by ${department}. Workflow stopped.`;

    res.status(200).json({ message });
  } catch (err) {
    console.error("Error in approving request:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const releaseReqStatus = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    const { status, department, role, email } = req.body;
    console.log(status, department, role, empId, reqId, email);

    // Fetch employee data from the database
    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        { full_name: 1, employee_id: 1, company_email_id: 1 }
      )) || (await addPanelUsers.findOne({ department: department }));

    console.log("Employee Data:", empData);

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        status: 1,
        firstLevelApproval: 1,
        approvals: 1,
        createdAt: 1,
        hasDeviations: 1,
        procurements: 1,
        userId: 1,
      }
    );
    const theReqId = reqData.reqid;
    const requestorData = await empModel.findOne(
      { employee_id: reqData.userId },
      { company_email_id: 1, full_name: 1, department: 1 }
    );

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }
    const approvals = reqData.approvals || [];
    const latestApproval = approvals[approvals.length - 1];
    let departmentOrders;
    if (approvals.length <= 0) {
      departmentOrders = [
        empData.department,
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "HOF",
        "Proceed the PO invoice",
      ];
    } else {
      departmentOrders = [
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "HOF",
        "Proceed the PO invoice",
      ];
    }

    const currentDeptIndex = departmentOrders.indexOf(department);
    let nextDepartment = departmentOrders[currentDeptIndex + 1] || null;

    console.log(
      "Current Department:",
      department,
      "Next Department:",
      nextDepartment
    );

    // Fetch request data

    if (
      reqData.firstLevelApproval.hodDepartment === department &&
      reqData.firstLevelApproval.status !== "Approved"
    ) {
      reqData.status = "Pending";
      reqData.firstLevelApproval.status = "Approved";
      reqData.firstLevelApproval.approved = true;
      await reqData.save();
    }

    const remarks = `Request status ${reqData.firstLevelApproval.status} from ${status} released`;

    const approvalRecord = {
      departmentName: department,
      status: "Approved",
      approverName: empData.full_name,
      approvalId: empData.employee_id,
      approvalDate: new Date(),
      remarks: remarks,
      nextDepartment: nextDepartment,
      receivedOn: approvals.length
        ? latestApproval.approvalDate
        : reqData.createdAt,
    };

    console.log("Approval Record:", approvalRecord);

    const updateResult = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: { approvals: approvalRecord },
        $set: { status: "Pending" },
      }
    );
    console.log(
      "reqData.procurements.isNewVendor",
      reqData.procurements.isNewVendor
    );

    if (
      department === "Business Finance" &&
      !reqData.procurements.isNewVendor
    ) {
      console.log("Hai");
      if (reqData.hasDeviations === 1) {
        console.log("After Business finance vendr");
        const autoApproveDepartments = ["Vendor Management", "Legal Team"];
        const remarks = "Auto-approved";

        for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
          const autoDepartment = autoApproveDepartments[i];
          const isLastDepartment = i === autoApproveDepartments.length - 1;

          const nextAutoDepartment = isLastDepartment
            ? null
            : autoApproveDepartments[i + 1];

          const autoApproverData = await addPanelUsers.findOne(
            { department: autoDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          );

          console.log("Inside auto-approval", autoApproverData);

          if (autoApproverData) {
            const autoApprovalRecord = {
              departmentName: autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: remarks,
              nextDepartment: nextAutoDepartment,
              receivedOn: new Date(),
            };

            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $push: { approvals: autoApprovalRecord },
                $set: {
                  currentStatus: "Approved",
                  currentDepartment: nextAutoDepartment || autoDepartment,
                },
              }
            );

            // Optionally, send approval email notifications
            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break; // Stop the auto-approval process if approver data is missing
          }
        }
      } else {
        console.log("No deviation aftre bf");
        const autoApproveDepartments = [
          "Vendor Management",
          "Legal Team",
          "Info Security",
          "HOF",
        ];
        const remarks = "Auto-approved";

        for (let i = 0; i < autoApproveDepartments.length; i++) {
          const autoDepartment = autoApproveDepartments[i];
          const isLastDepartment = i === autoApproveDepartments.length - 1;

          const nextAutoDepartment = isLastDepartment
            ? null
            : autoApproveDepartments[i + 1];

          const autoApproverData = await addPanelUsers.findOne(
            { department: autoDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          );

          console.log("Inside auto-approval", autoApproverData);

          if (autoApproverData) {
            const autoApprovalRecord = {
              departmentName: autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: remarks,
              nextDepartment: nextAutoDepartment,
              receivedOn: new Date(),
            };

            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $push: { approvals: autoApprovalRecord },
                $set: {
                  currentStatus: "Approved",
                  currentDepartment: nextAutoDepartment || autoDepartment,
                },
              }
            );
            console.log("requestorData", requestorData);

            // Optionally, send approval email notifications
            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break; // Stop the auto-approval process if approver data is missing
          }

          // After Info Security, the flow should move to HOF, but no approval happens at HOF
          if (autoDepartment === "Info Security") {
            console.log(
              "Info Security approved. Moving to HOF, but no auto-approval needed."
            );
            // Update to set the current department to HOF but no approval record is created for HOF
            await CreateNewReq.updateOne(
              { _id: reqId },
              {
                $set: {
                  currentDepartment: "HOF",
                },
              }
            );
            break; // No further auto-approval, just update to HOF
          }
        }
      }
    }

    if (
      department === "Vendor Management" &&
      reqData.hasDeviations === 0 &&
      status === "Pending"
    ) {
      console.log(
        "Auto approved ",
        department === "Vendor Management",
        reqData.hasDeviations === 0
      );

      const autoApproveDepartments = ["Legal Team", "Info Security", "HOF"];
      const remarks = "Auto-approved";

      for (let i = 0; i < autoApproveDepartments.length; i++) {
        const autoDepartment = autoApproveDepartments[i];
        const isLastDepartment = i === autoApproveDepartments.length - 1;

        const nextAutoDepartment = isLastDepartment
          ? null
          : autoApproveDepartments[i + 1];

        const autoApproverData = await addPanelUsers.findOne(
          { department: autoDepartment },
          { full_name: 1, employee_id: 1, company_email_id: 1 }
        );

        console.log("Inside auto-approval", autoApproverData);

        if (autoApproverData) {
          const autoApprovalRecord = {
            departmentName: autoDepartment,
            status: "Approved",
            approverName: autoApproverData.full_name,
            approvalId: autoApproverData.employee_id,
            approvalDate: new Date(),
            remarks: remarks,
            nextDepartment: nextAutoDepartment,
            receivedOn: new Date(),
          };

          await CreateNewReq.updateOne(
            { _id: reqId },
            {
              $push: { approvals: autoApprovalRecord },
              $set: {
                currentStatus: "Approved",
                currentDepartment: nextAutoDepartment || autoDepartment,
              },
            }
          );

          // Optionally, send approval email notifications
          await sendIndividualEmail(
            "EMPLOYEE",
            requestorData.company_email_id,
            requestorData.full_name,
            requestorData.department,
            theReqId,
            autoApprovalRecord
          );
          await sendIndividualEmail(
            "AUTHORITY",
            autoApproverData.company_email_id,
            autoApproverData.full_name,
            autoApproverData.department,
            theReqId,
            autoApprovalRecord
          );

          console.log(
            `Auto-approval completed for department: ${autoDepartment}`
          );
        } else {
          console.error(`No approver found for department: ${autoDepartment}`);
          break; // Stop the auto-approval process if approver data is missing
        }

        // After Info Security, the flow should move to HOF, but no approval happens at HOF
        if (autoDepartment === "Info Security") {
          console.log(
            "Info Security approved. Moving to HOF, but no auto-approval needed."
          );
          // Update to set the current department to HOF but no approval record is created for HOF
          await CreateNewReq.updateOne(
            { _id: reqId },
            {
              $set: {
                currentDepartment: "HOF",
              },
            }
          );
          break; // No further auto-approval, just update to HOF
        }
      }
    }

    if (updateResult.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Request status updated successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "Failed to update request status" });
    }
  } catch (err) {
    console.error("Error in releaseReqStatus:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to generate request ID
const generateReqid = (digitLength = 2) => {
  const date = new Date();
  const prefix = `INBH${String(date.getDate()).padStart(2, "0")}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}`;
  const randomDigits = Math.floor(Math.random() * Math.pow(10, digitLength))
    .toString()
    .padStart(digitLength, "0");
  return `${prefix}${randomDigits}`;
};

// API to get a unique request ID
const getANewRequestId = async (req, res) => {
  try {
    let digitLength = 2;
    let reqid;
    let isUnique = false;
    let retryCount = 0;
    const maxRetries = 5;

    while (!isUnique) {
      reqid = generateReqid(digitLength);

      // check if it already exists in DB
      const exists = await CreateNewReq.findOne({ reqid }).lean();

      if (!exists) {
        isUnique = true;
      } else {
        retryCount++;
        digitLength++;
        if (retryCount >= maxRetries) {
          return res.status(500).json({
            message:
              "Failed to generate a unique request ID after multiple attempts.",
          });
        }
      }
    }

    return res.status(200).json({
      message: "Unique request ID generated successfully",
      reqid,
    });
  } catch (err) {
    console.error("Error generating request ID:", err);
    return res.status(500).json({
      message: "An error occurred while generating request ID.",
      error: err.message,
    });
  }
};

const saveCommercialData = async (req, res) => {
  try {
    const { empId } = req.params;
    const { formData } = req.body;
    console.log("empId", empId, "formData", formData);

    const { newReqId } = formData;

    if (!newReqId) {
      return res.status(400).json({
        message: "Request ID (newReqId) is required.",
      });
    }

    // 1. Get employee data
    let empData = await empModel
      .findOne(
        { _id: empId },
        { full_name: 1, employee_id: 1, department: 1, hod: 1, hod_email_id: 1 }
      )
      .lean();

    if (!empData) {
      empData = await addPanelUsers.findOne({ _id: empId }).lean();
    }

    if (!empData) {
      return res.status(404).json({
        message: "Employee not found. Please provide a valid employee ID.",
      });
    }

    // 2. Fetch panel member emails
    const panelMemberEmail = (
      await addPanelUsers
        .find({ role: { $ne: "Admin" } }, { company_email_id: 1, _id: 0 })
        .lean()
    ).map((member) => member.company_email_id);

    let responseMessage = "";

    // ✅ Build First Level Approval Object ALWAYS with latest formData values
    const firstLevelApproval = {
      hodName: formData.hod,
      hodEmail: formData.hodEmail,
      hodDepartment: formData.department,
      status: "Pending",
      approved: false,
    };

    // 3. Try to update first
    let updatedRequest = await CreateNewReq.findOneAndUpdate(
      { reqid: newReqId },
      {
        $set: {
          commercials: formData,
          firstLevelApproval: firstLevelApproval, // ✅ Always overwrite
        },
      },
      { new: true }
    );

    if (updatedRequest) {
      responseMessage = "Commercial data updated successfully.";
    } else {
      // 4. If not found, create a new record with that reqid
      updatedRequest = new CreateNewReq({
        reqid: newReqId,
        userId: empData.employee_id,
        userName: empData.full_name,
        empDepartment: empData.department,
        commercials: formData,
        firstLevelApproval: firstLevelApproval,
      });

      await updatedRequest.save();
      responseMessage = "Commercial data created successfully.";
    }

    return res.status(200).json({
      message: responseMessage,
      reqid: updatedRequest.reqid,
      employee: empData,
      panelEmails: panelMemberEmail,
    });

  } catch (err) {
    console.error("Error in saving the commercial data:", err);
    return res.status(500).json({
      message: "An error occurred while saving the commercial data.",
      error: err.message,
    });
  }
};



const editCommercialData = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    const { formData } = req.body;

    console.log("empId", empId, "formData", formData);

    // 1. Get employee details
    let empData = await empModel
      .findOne(
        { _id: empId },
        { full_name: 1, employee_id: 1, department: 1, hod: 1, hod_email_id: 1 }
      )
      .lean();

    if (!empData) {
      empData = await addPanelUsers.findOne({ _id: empId }).lean();
    }

    if (!empData) {
      return res.status(404).json({
        message: "Employee not found. Please provide a valid employee ID.",
      });
    }

    // 2. Get panel member emails (except admin)
    const panelMemberEmail = (
      await addPanelUsers
        .find({ role: { $ne: "Admin" } }, { company_email_id: 1, _id: 0 })
        .lean()
    ).map((member) => member.company_email_id);

    console.log("panelMemberEmail", panelMemberEmail);

    // 3. Prepare First Level Approval Update
    const firstLevelUpdate = {
      firstLevelApproval: {
        hodName: formData.hod,
        hodEmail: formData.hodEmail,
        hodDepartment: formData.department,
        status: "Pending",       // Always move to pending
        approved: false,         // Reset approved status
        approvedAt: null,        // Clear timestamp
        remarks: ""              // Clear any remarks
      }
    };

    // 4. Update commercials + update ONLY first level approval
    let updatedRequest = await CreateNewReq.findOneAndUpdate(
      { _id: reqId },
      {
        $set: {
          commercials: formData,
          ...firstLevelUpdate
        }
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Request not found. Unable to update.",
      });
    }

    return res.status(201).json({
      message: "Commercial data updated and First Level approval reset.",
      reqid: updatedRequest.reqid,
      employee: empData,
      panelEmails: panelMemberEmail,
    });

  } catch (err) {
    console.error("Error in saving the commercial data:", err);
    return res.status(500).json({
      message: "An error occurred while saving the commercial data.",
      error: err.message,
    });
  }
};


const saveProcurementsData = async (req, res) => {
  try {
    const { formData } = req.body;
    const { reqId } = formData;
    const { newReqId } = req.params;
    console.log("formData", formData);
    const { vendor } = formData;
    const vendorData = await vendorSchema.findOne({ vendorId: vendor });

    const updateData = await CreateNewReq.findOne({
      reqid: reqId || newReqId,
    });

    if (!updateData) {
      return res.status(404).json({
        message: "Request not found. Please provide a valid request ID.",
      });
    }

    // Initialize procurements if it doesn't exist
    if (!updateData.procurements) {
      updateData.procurements = {};
    }

    let formattedUploadedFiles = [];
    if (formData.uploadedFiles) {
      formattedUploadedFiles = Array.isArray(formData.uploadedFiles)
        ? formData.uploadedFiles
        : [formData.uploadedFiles];
    }

    if (!updateData.procurements.uploadedFiles) {
      updateData.procurements.uploadedFiles = [];
    }

    if (formattedUploadedFiles.length > 0) {
      // collect existing urls
      const existingUrls = new Set();
      if (updateData.procurements.uploadedFiles[0]) {
        Object.values(updateData.procurements.uploadedFiles[0]).forEach(
          (fileObj) => {
            if (fileObj && typeof fileObj === "object" && fileObj.urls) {
              const urls = Array.isArray(fileObj.urls)
                ? fileObj.urls
                : fileObj.urls
                  ? [fileObj.urls]
                  : [];
              urls.forEach((url) => existingUrls.add(url));
            }
          }
        );
      }

      const mergedFiles = {};
      const newFiles = formattedUploadedFiles[0] || {};

      Object.entries(newFiles).forEach(([key, fileObj]) => {
        if (fileObj && typeof fileObj === "object") {
          // normalize urls
          let urls = Array.isArray(fileObj.urls)
            ? fileObj.urls
            : fileObj.urls
              ? [fileObj.urls]
              : [];

          // remove duplicates
          let mergedUrls = urls.filter((url) => !existingUrls.has(url));

          // merge with old urls if exist
          if (updateData.procurements.uploadedFiles[0]?.[key]?.urls) {
            const oldUrls = Array.isArray(
              updateData.procurements.uploadedFiles[0][key].urls
            )
              ? updateData.procurements.uploadedFiles[0][key].urls
              : updateData.procurements.uploadedFiles[0][key].urls
                ? [updateData.procurements.uploadedFiles[0][key].urls]
                : [];

            mergedUrls = [...oldUrls, ...mergedUrls];
          }

          // keep other fields (agreementValidFrom, agreementValidTo, etc.)
          mergedFiles[key] = {
            ...fileObj,
            urls: mergedUrls,
          };
        }
      });

      updateData.procurements.uploadedFiles = [mergedFiles];
    }

    // Update other procurements data
    const { uploadedFiles, ...otherFormData } = formData;
    updateData.procurements = {
      ...updateData.procurements,
      ...otherFormData,
      uploadedFiles: updateData.procurements.uploadedFiles,
    };

    if (vendorData) {
      updateData.procurements.email = "";
      updateData.procurements.isNewVendor = false;
    }

    await updateData.save();

    return res.status(200).json({
      message: "Procurements data updated successfully.",
      updatedData: updateData,
    });
  } catch (err) {
    console.error("Error in saving the procurements data:", err);
    return res.status(500).json({
      message: "An error occurred while updating procurements data.",
      error: err.message,
    });
  }
};

const saveSuppliesData = async (req, res) => {
  try {
    console.log("Welcome to supplies data", req.body);

    const { reqId } = req.params;
    const { remarks, services, selectedCurrency } = req.body.formData;

    console.log(
      "remarks, services, selectedCurrency, reqId",
      remarks,
      services,
      selectedCurrency,
      reqId
    );

    const updateData = await CreateNewReq.findOne({ reqid: reqId });

    if (!updateData) {
      return res.status(404).json({
        message: "Request not found. Please provide a valid request ID.",
      });
    }

    updateData.supplies = req.body.formData;
    await updateData.save();

    return res.status(200).json({
      message: "Supplies data updated successfully.",
      reqid: updateData.reqid,
      updatedSupplies: updateData.supplies,
    });
  } catch (err) {
    console.error("Error in saving the supplies", err);
    return res.status(500).json({
      message: "An error occurred while saving the supplies data.",
      error: err.message,
    });
  }
};

const saveAggrementData = async (req, res) => {
  try {
    const { reqId } = req.params;
    const { formData } = req.body;

    console.log(
      "Received formData:",
      JSON.stringify(formData, null, 2),
      "Req ID:",
      reqId
    );

    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ message: "Invalid formData" });
    }

    let complinces = Array.isArray(formData.complinces)
      ? formData.complinces
      : Object.values(formData.complinces);

    if (!Array.isArray(complinces)) {
      return res.status(400).json({ message: "Invalid compliance data" });
    }

    const updateData = await CreateNewReq.findOne({ reqid: reqId });

    if (!updateData) {
      return res.status(404).json({ message: "Request not found" });
    }

    let departmentDeviations = new Map();
    let hasDeviation = false;

    complinces.forEach(({ department, answer, expectedAnswer }) => {
      if (answer !== expectedAnswer) {
        departmentDeviations.set(department, true);
        hasDeviation = true; // deviation found
      } else {
        // mark false only if not already true for that dept
        if (!departmentDeviations.has(department)) {
          departmentDeviations.set(department, false);
        }
      }
    });

    updateData.departmentDeviations = Object.fromEntries(departmentDeviations);
    updateData.complinces = complinces;
    updateData.hasDeviations = hasDeviation ? 1 : 0;
    updateData.riskAccepted = formData.riskAccepted;

    await updateData.save();

    res.status(200).json({
      message: "Compliance data saved successfully",
      hasDeviations: updateData.hasDeviations,
      departmentDeviations: updateData.departmentDeviations,
      riskAccepted: updateData.riskAccepted,
    });
  } catch (err) {
    console.error("Error in saving the compliance:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const generateRequestPdfData = async (request, res) => {
  try {
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: "A4",
      bufferPages: true,
    });

    const fileName = `Request_${request.reqid || "Unknown"}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    const formatCurrency = (value) => {
      if (!value) return "N/A";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB");
    };

    const extractDateAndTime = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString("en-GB");
    };

    // Add header
    doc
      .fontSize(22)
      .fillColor("#003366")
      .text("REQUEST DETAILS", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .fillColor("#666666")
      .text(`Request ID: ${request.reqid || "Unknown"}`, { align: "center" })
      .moveDown(1);

    // Add divider
    doc
      .strokeColor("#003366")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    doc.moveDown(1);

    // COMMERCIAL DETAILS SECTION
    doc
      .fontSize(16)
      .fillColor("#003366")
      .text("Commercial Details", { underline: true })
      .moveDown(0.5);

    if (
      request.commercials &&
      Object.values(request.commercials).some((value) => value)
    ) {
      // First row
      const firstRowY = doc.y;
      const colWidth = (doc.page.width - 100) / 3;

      // Request ID
      doc.fontSize(11).fillColor("#666666").text("Request ID", 50, firstRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(request.reqid || "N/A", 50, firstRowY + 15);

      // Business Unit
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("Business Unit", 50 + colWidth, firstRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          request.commercials.businessUnit || "N/A",
          50 + colWidth,
          firstRowY + 15
        );

      // Created At
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("Created At", 50 + colWidth * 2, firstRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          extractDateAndTime(request.createdAt) || "N/A",
          50 + colWidth * 2,
          firstRowY + 15
        );

      // Move down for next row
      doc.y = firstRowY + 40;

      // Second row
      const secondRowY = doc.y;

      // Entity
      doc.fontSize(11).fillColor("#666666").text("Entity", 50, secondRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(request.commercials.entity || "N/A", 50, secondRowY + 15);

      // City
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("City", 50 + colWidth, secondRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          request.commercials.city || "N/A",
          50 + colWidth,
          secondRowY + 15
        );

      // Site
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("Site", 50 + colWidth * 2, secondRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          request.commercials.site || "N/A",
          50 + colWidth * 2,
          secondRowY + 15
        );

      // Move down for next row
      doc.y = secondRowY + 40;

      // Third row - two columns
      const thirdRowY = doc.y;
      const wideColWidth = (doc.page.width - 100) / 2;

      // Department
      doc.fontSize(11).fillColor("#666666").text("Department", 50, thirdRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(request.commercials.department || "N/A", 50, thirdRowY + 15);

      // Head of Department
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("Head of Department", 50 + wideColWidth, thirdRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          request.commercials.hod || "N/A",
          50 + wideColWidth,
          thirdRowY + 15
        );

      // Move down for Bill To and Ship To
      doc.y = thirdRowY + 40;

      // Fourth row - two columns for Bill To and Ship To
      const fourthRowY = doc.y;

      // Bill To
      doc.fontSize(11).fillColor("#666666").text("Bill To", 50, fourthRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(request.commercials.billTo || "N/A", 50, fourthRowY + 15);

      // Ship To
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("Ship To", 50 + wideColWidth, fourthRowY);
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          request.commercials.shipTo || "N/A",
          50 + wideColWidth,
          fourthRowY + 15
        );

      // Move down past this section
      doc.y = fourthRowY + 40;

      // Payment Terms Section if available
      if (
        request.commercials.paymentTerms &&
        request.commercials.paymentTerms.length > 0
      ) {
        doc
          .fontSize(14)
          .fillColor("#003366")
          .text("Payment Terms", { underline: false })
          .moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const tableColWidth = (doc.page.width - 100) / 3;

        doc.rect(50, tableTop, doc.page.width - 100, 20).fill("#e6eef7");

        doc
          .fontSize(11)
          .fillColor("#003366")
          .text("Percentage", 60, tableTop + 5)
          .text("Payment Term", 60 + tableColWidth, tableTop + 5)
          .text("Type", 60 + tableColWidth * 2, tableTop + 5);

        // Table rows
        let currentY = tableTop + 20;

        request.commercials.paymentTerms.forEach((term, index) => {
          const isEven = index % 2 === 0;

          if (isEven) {
            doc.rect(50, currentY, doc.page.width - 100, 20).fill("#f7f7f7");
          }

          doc
            .fontSize(10)
            .fillColor("#333333")
            .text(`${term.percentageTerm}%`, 60, currentY + 5)
            .text(
              term.paymentTerm?.toLowerCase() || "N/A",
              60 + tableColWidth,
              currentY + 5
            )
            .text(
              term.paymentType?.toLowerCase() || "N/A",
              60 + tableColWidth * 2,
              currentY + 5
            );

          currentY += 20;
        });

        // Move past the table
        doc.y = currentY + 20;
      }
    } else {
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("No commercial details available")
        .moveDown(1);
    }

    // Check if we need a page break
    if (doc.y > 650) doc.addPage();

    // PROCUREMENT DETAILS SECTION
    doc
      .fontSize(16)
      .fillColor("#003366")
      .text("Procurement Details", { underline: true })
      .moveDown(0.5);

    if (
      request.procurements &&
      Object.values(request.procurements).some((value) => value)
    ) {
      const procFields = [
        { label: "Vendor ID", value: request.procurements.vendor },
        { label: "Vendor Name", value: request.procurements.vendorName },
        {
          label: "Quotation Number",
          value: request.procurements.quotationNumber,
        },
        {
          label: "Quotation Date",
          value: request.procurements.quotationDate
            ? formatDate(request.procurements.quotationDate)
            : null,
        },
        { label: "Service Period", value: request.procurements.servicePeriod },
        {
          label: "PO Valid From",
          value: request.procurements.poValidFrom
            ? formatDate(request.procurements.poValidFrom)
            : null,
        },
        {
          label: "PO Valid To",
          value: request.procurements.poValidTo
            ? formatDate(request.procurements.poValidTo)
            : null,
        },
      ].filter((item) => item.value);

      // Arrange in 2 columns
      const procColWidth = (doc.page.width - 100) / 2;
      let procRowY = doc.y;

      procFields.forEach((item, index) => {
        const colIndex = index % 2;
        const rowOffset = Math.floor(index / 2) * 40;

        doc
          .fontSize(11)
          .fillColor("#666666")
          .text(item.label, 50 + colIndex * procColWidth, procRowY + rowOffset);

        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(
            item.value,
            50 + colIndex * procColWidth,
            procRowY + rowOffset + 15
          );

        // Adjust Y position based on rows
        if (
          index === procFields.length - 1 ||
          index === procFields.length - 2
        ) {
          doc.y = procRowY + rowOffset + 40;
        }
      });

      // Uploaded Files Section
      if (request.procurements.uploadedFiles) {
        doc
          .fontSize(14)
          .fillColor("#003366")
          .text("Uploaded Files", { underline: false })
          .moveDown(0.5);

        if (Object.keys(request.procurements.uploadedFiles).length > 0) {
          doc
            .fontSize(11)
            .fillColor("#007700")
            .text("Files uploaded successfully")
            .moveDown(0.5);

          // List the files
          Object.keys(request.procurements.uploadedFiles).forEach((fileKey) => {
            doc
              .fontSize(10)
              .fillColor("#333333")
              .text(`• ${fileKey}`, { indent: 10 })
              .moveDown(0.2);
          });
        } else {
          doc
            .fontSize(11)
            .fillColor("#666666")
            .text("No files uploaded")
            .moveDown(0.5);
        }
      }
    } else {
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("No procurement details available")
        .moveDown(1);
    }

    // Check if we need a page break
    if (doc.y > 600) doc.addPage();

    // PRODUCT/SERVICES SECTION
    doc
      .fontSize(16)
      .fillColor("#003366")
      .text("Product/Services Details", { underline: true })
      .moveDown(0.5);

    if (request.supplies?.services?.length > 0) {
      // Table header
      const servicesTableTop = doc.y;
      doc.rect(50, servicesTableTop, doc.page.width - 100, 20).fill("#e6eef7");

      const serviceColCount = 7;
      const serviceColWidth = (doc.page.width - 100) / serviceColCount;

      // Define column positions
      const serviceColPositions = Array.from(
        { length: serviceColCount },
        (_, i) => 50 + i * serviceColWidth
      );

      doc
        .fontSize(9)
        .fillColor("#003366")
        .text("Product Names", serviceColPositions[0] + 3, servicesTableTop + 5)
        .text("Description", serviceColPositions[1] + 3, servicesTableTop + 5)
        .text("Purpose", serviceColPositions[2] + 3, servicesTableTop + 5)
        .text("Quantity", serviceColPositions[3] + 3, servicesTableTop + 5)
        .text("Price", serviceColPositions[4] + 3, servicesTableTop + 5)
        .text("Tax (%)", serviceColPositions[5] + 3, servicesTableTop + 5)
        .text("Total", serviceColPositions[6] + 3, servicesTableTop + 5);

      // Table rows
      let serviceRowY = servicesTableTop + 20;

      request.supplies.services.forEach((service, index) => {
        // Check if we need a page break
        if (serviceRowY > doc.page.height - 100) {
          doc.addPage();
          serviceRowY = 50;

          // Redraw header on new page
          doc.rect(50, serviceRowY, doc.page.width - 100, 20).fill("#e6eef7");

          doc
            .fontSize(9)
            .fillColor("#003366")
            .text("Product Names", serviceColPositions[0] + 3, serviceRowY + 5)
            .text("Description", serviceColPositions[1] + 3, serviceRowY + 5)
            .text("Purpose", serviceColPositions[2] + 3, serviceRowY + 5)
            .text("Quantity", serviceColPositions[3] + 3, serviceRowY + 5)
            .text("Price", serviceColPositions[4] + 3, serviceRowY + 5)
            .text("Tax (%)", serviceColPositions[5] + 3, serviceRowY + 5)
            .text("Total", serviceColPositions[6] + 3, serviceRowY + 5);

          serviceRowY += 20;
        }

        const isEven = index % 2 === 0;
        if (isEven) {
          doc.rect(50, serviceRowY, doc.page.width - 100, 20).fill("#f7f7f7");
        }

        // Calculate the total
        const quantity = parseFloat(service.quantity) || 0;
        const price = parseFloat(service.price) || 0;
        const tax = parseFloat(service.tax) || 0;
        const total = quantity * price * (1 + tax / 100);

        // Truncate text that's too long
        const truncateText = (text, maxLength = 15) => {
          return text && text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text || "N/A";
        };

        doc
          .fontSize(8)
          .fillColor("#333333")
          .text(
            truncateText(service.productName),
            serviceColPositions[0] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6 }
          )
          .text(
            truncateText(service.productDescription),
            serviceColPositions[1] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6 }
          )
          .text(
            truncateText(service.productPurpose),
            serviceColPositions[2] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6 }
          )
          .text(
            service.quantity || "N/A",
            serviceColPositions[3] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6, align: "center" }
          )
          .text(
            formatCurrency(service.price),
            serviceColPositions[4] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6, align: "right" }
          )
          .text(
            service.tax || "N/A",
            serviceColPositions[5] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6, align: "right" }
          )
          .text(
            formatCurrency(total),
            serviceColPositions[6] + 3,
            serviceRowY + 5,
            { width: serviceColWidth - 6, align: "right" }
          );

        serviceRowY += 20;
      });

      // Total Value
      if (request.supplies?.totalValue !== undefined) {
        doc.y = serviceRowY + 20;

        doc.fontSize(11).fillColor("#666666").text("Total Value", 50);
        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(formatCurrency(request.supplies.totalValue), {
            align: "right",
          });
      }

      // Remarks
      if (request.supplies?.remarks) {
        doc.y += 20;
        doc
          .fontSize(14)
          .fillColor("#003366")
          .text("Remarks", { underline: false })
          .moveDown(0.5);
        doc
          .fontSize(10)
          .fillColor("#333333")
          .text(request.supplies.remarks)
          .moveDown(1);
      }
    } else {
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("No products or services details available")
        .moveDown(1);
    }

    // Check if we need a page break
    if (doc.y > 600) doc.addPage();

    // COMPLIANCE DETAILS SECTION
    doc
      .fontSize(16)
      .fillColor("#003366")
      .text("Compliance Details", { underline: true })
      .moveDown(0.5);

    if (request.complinces && Object.keys(request.complinces).length > 0) {
      // Create a grid layout for compliance items
      let compRowY = doc.y;
      const compColWidth = (doc.page.width - 100) / 2;
      let colIndex = 0;

      Object.entries(request.complinces).forEach(
        ([questionId, compliance], index) => {
          // Check if we need a page break
          if (compRowY > doc.page.height - 200) {
            doc.addPage();
            compRowY = 50;
            colIndex = 0;
          }

          // Determine colors based on compliance status
          const bgColor =
            compliance.expectedAnswer !== compliance.answer
              ? "#ffebee"
              : "#e8f5e9";
          const textColor =
            compliance.expectedAnswer !== compliance.answer
              ? "#c62828"
              : "#2e7d32";

          // Calculate position
          const xPosition = 50 + colIndex * compColWidth;
          const boxHeight = 100; // Fixed height for all boxes

          // Draw box
          doc
            .rect(xPosition, compRowY, compColWidth - 10, boxHeight)
            .fillAndStroke(bgColor, bgColor);

          // Question text
          doc
            .fontSize(10)
            .fillColor(textColor)
            .text(compliance.question, xPosition + 10, compRowY + 10, {
              width: compColWidth - 30,
            });

          // Answer
          doc
            .fontSize(10)
            .fillColor(textColor)
            .text(
              `Answer: ${compliance.answer ? "Yes" : "No"}`,
              xPosition + 10,
              compRowY + 40
            );

          // Department if available
          if (compliance.department) {
            doc
              .fontSize(9)
              .fillColor("#666666")
              .text(
                `Department: ${compliance.department}`,
                xPosition + 10,
                compRowY + 60
              );
          }

          // Deviation reason if applicable
          if (
            compliance.deviation &&
            compliance.expectedAnswer !== compliance.answer
          ) {
            doc
              .fontSize(9)
              .fillColor(textColor)
              .text(
                `Deviation Reason: ${compliance.deviation.reason}`,
                xPosition + 10,
                compRowY + 75,
                { width: compColWidth - 30 }
              );
          }

          // Increment column index or move to next row
          colIndex = (colIndex + 1) % 2;
          if (colIndex === 0) {
            compRowY += boxHeight + 10; // Move to next row
          }
        }
      );

      // Adjust final Y position
      if (colIndex !== 0) {
        compRowY += boxHeight + 10;
      }
      doc.y = compRowY;
    } else {
      doc
        .fontSize(11)
        .fillColor("#666666")
        .text("No compliance details available")
        .moveDown(1);
    }

    // Add footer with page numbers
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);

      // Add page number
      doc.fontSize(10).fillColor("#666666");
      doc.text(`Page ${i + 1} of ${range.count}`, 50, doc.page.height - 50, {
        align: "center",
        width: doc.page.width - 100,
      });

      // Add timestamp
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Generated on: ${dateStr}`, 50, doc.page.height - 35, {
        align: "center",
        width: doc.page.width - 100,
      });
    }

    // Finalize the PDF
    doc.end();

    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Error generating PDF", error: error.message });
    }
    return { success: false, error: error.message };
  }
};

const getRoleBasedApprovals = async (req, res) => {
  try {
    const { role, userId } = req.params;
    console.log("My role", role, userId);
    const empData = await empModel.findOne(
      { employee_id: userId },
      { company_email_id: 1 }
    );

    console.log("empData", empData, role === "HOD Department");

    let roleApprovalData;
    let roleApprovalDatas;

    if (role === "HOD Department" || role === "Admin") {
      roleApprovalData = await CreateNewReq.find({
        "firstLevelApproval.hodEmail": empData.company_email_id,
      }).lean();
    } else {
      if (role === "Head of Finance") {
        roleApprovalDatas = await CreateNewReq.find({
          $or: [{ "approvals.nextDepartment": role }, { status: "PO-Pending" }],
        }).lean();
      } else {
        roleApprovalDatas = await CreateNewReq.find({
          "approvals.nextDepartment": role,
        }).lean();
      }

      roleApprovalData = roleApprovalDatas.filter((item) => {
        const lastApproval = item.approvals[item.approvals.length - 1];
        return (
          lastApproval?.nextDepartment === role ||
          (lastApproval.approvalId === userId && item.status !== "Approved")
        );
      });
    }

    const processedReqData = roleApprovalData.map((request) => {
      const { approvals, firstLevelApproval } = request;
      const latestLevelApproval = approvals?.[approvals.length - 1];
      console.log("latestLevelApproval", latestLevelApproval);
      let departmentInfo = {};

      if (!latestLevelApproval) {
        if (firstLevelApproval.approved) {
          departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
        } else {
          departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
        }

        return { ...request, ...departmentInfo };
      }

      if (latestLevelApproval.status === "Approved") {
        departmentInfo.nextDepartment = latestLevelApproval.nextDepartment;
      } else if (
        latestLevelApproval.status === "Hold" ||
        latestLevelApproval.status === "Rejected"
      ) {
        departmentInfo.cDepartment = latestLevelApproval.departmentName;
      }
      console.log("latestLevelApproval", departmentInfo);

      return { ...request, ...departmentInfo };
    });

    console.log("roleApprovalData", roleApprovalData);

    // Check if data exists
    if (!roleApprovalData || roleApprovalData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No approvals found for this role" });
    }

    // Send response
    res.status(200).json({
      success: true,
      message: "Role-based approvals fetched successfully",
      processedReqData,
    });
  } catch (err) {
    console.error("Error in getting the role-based approvals", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const emailNotificationAction = async (req, res) => {
  try {
    console.log("Welcome to change the email notification data", req.body);

    const { emailId, name, emailStatus, label } = req.body.emailData;

    let emailEntry = await EmailSettings.findOne({ emailId: emailId });

    if (emailEntry) {
      emailEntry.emailStatus = emailStatus;
      await emailEntry.save();
      return res.status(200).json({
        message: "Email status updated successfully",
        data: emailEntry,
      });
    } else {
      const newEmailEntry = new EmailSettings({
        emailId,
        emailType: name,
        emailStatus,
        label,
      });

      await newEmailEntry.save();
      return res
        .status(201)
        .json({ message: "New email notification added", data: newEmailEntry });
    }
  } catch (err) {
    console.error("Error in changing the email status", err);
    return res.status(500).json({
      message: "Error updating email notification",
      error: err.message,
    });
  }
};

const getAllEmailData = async (req, res) => {
  try {
    let emailData = await EmailSettings.find();

    // If no email settings exist, insert default settings
    if (emailData.length === 0) {
      const defaultEmailSettings = [
        {
          emailId: "1",
          name: "login",
          emailStatus: true,
          label: "Login Notification",
        },
        {
          emailId: "2",
          name: "requestAcknowledgementMails",
          emailStatus: true,
          label: "Send Mails to All Panel Members",
        },
        {
          emailId: "3",
          name: "vendorOnboarding",
          emailStatus: true,
          label: "Vendor Onboarding Process - To Vendor",
        },
        {
          emailId: "4",
          name: "newVendorOnBoard",
          emailStatus: true,
          label: "New Vendor Added - To Vendor Management",
        },
        {
          emailId: "5",
          name: "vendorOnboardingRequestorTemplate",
          emailStatus: true,
          label: "New Vendor Onboarding - To Requestor",
        },
        {
          emailId: "6",
          name: "editRequest",
          emailStatus: true,
          label: "Edit Request for Employee",
        },
        {
          emailId: "7",
          name: "reqApprovedNotificationtoRequestor",
          emailStatus: true,
          label: "Request Approved Notification - To Requestor",
        },
        {
          emailId: "8",
          name: "reqApprovelNotificationtoNextdepartment",
          emailStatus: true,
          label: "Request Approval Notification - To Next Department",
        },
        {
          emailId: "9",
          name: "autoApprovalNotificationtolegal",
          emailStatus: true,
          label: "Auto Approved Notification - To Legal Department",
        },
        {
          emailId: "10",
          name: "autoApprovalNotificationtoInfoSecurity",
          emailStatus: true,
          label: "Auto Approved Notification - To Info Security Department",
        },
        {
          emailId: "11",
          name: "financeApprovalEmail",
          emailStatus: true,
          label: "Finance Approval Notification",
        },
        {
          emailId: "12",
          name: "nudgeNotification",
          emailStatus: true,
          label: "Reminder: PO-Request Pending Action",
        },
        {
          emailId: "13",
          name: "poUploadedNotificationTemplate",
          emailStatus: true,
          label: "PO Uploaded - Invoice Submission Pending",
        },
        {
          emailId: "14",
          name: "invoiceUploadedNotificationTemplate",
          emailStatus: true,
          label: "Invoice Uploaded - Request Process Completed",
        },
        {
          emailId: "15",
          name: "nudgeNotification",
          emailStatus: true,
          label: "Nudge Notification",
        },
      ];

      emailData = await EmailSettings.insertMany(defaultEmailSettings);
    }

    return res
      .status(200)
      .json({ message: "All email data fetched successfully", emailData });
  } catch (err) {
    console.error("Error in getting all emails", err);
    return res
      .status(500)
      .json({ message: "Error fetching email data", error: err.message });
  }
};

const tagMessageToEmployee = async (req, res) => {
  try {
    console.log("Welcome to tag employee");

    const { role, reqId } = req.params;
    console.log("role, reqId:", role, reqId);

    let empData = [];

    if (role === "Head of Dept") {
      const hodData = await CreateNewReq.findOne(
        { _id: reqId },
        { firstLevelApproval: 1 }
      );

      if (hodData && hodData.firstLevelApproval) {
        const hodEmplData = await empModel.findOne(
          { company_email_id: hodData.firstLevelApproval.hodEmail },
          { full_name: 1, company_email_id: 1, employee_id: 1 }
        );
        empData.push(hodEmplData);
      }
    } else if (role === "Requestor") {
      const requstorData = await CreateNewReq.findOne(
        { _id: reqId },
        { userId: 1 }
      );
      const reqData = await empModel.findOne(
        { employee_id: requstorData.userId },
        { full_name: 1, company_email_id: 1, employee_id: 1 }
      );
      empData.push(reqData);
    } else {
      empData = await addPanelUsers.find(
        { role: role },
        { full_name: 1, company_email_id: 1 }
      );
    }

    console.log(`Tag to ${role}:`, empData);

    return res.status(200).json({
      success: true,
      message: `Employees tagged successfully for role: ${role}`,
      empData,
    });
  } catch (err) {
    console.log("Error in tagging the employee:", err);
    return res.status(500).json({
      success: false,
      message: "Error in tagging the employee",
      error: err.message,
    });
  }
};
// const getSearchedData = async (req, res) => {
//   try {
//     const { data } = req.body;
//     console.log("Welcome to searched data", data);

//     const { entity, department, status, fromDate, toDate } = data;

//     // Special departments to treat differently
//     const additionalDepartments = [
//       "Business Finance",
//       "Vendor Management",
//       "Legal Team",
//       "Info Security",
//       "Head of Finance",
//     ];

//     // Build match query
//     const matchQuery = { isCompleted: true };
//     if (entity) matchQuery["commercials.entity"] = entity;

//     if (department) {
//       if (additionalDepartments.includes(department)) {
//         matchQuery["approvals.departmentName"] = department;
//       } else {
//         matchQuery["commercials.department"] = department;
//       }
//     }

//     if (status) matchQuery.status = status;

//     if (fromDate && toDate) {
//       matchQuery.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate),
//       };
//     } else if (fromDate) {
//       matchQuery.createdAt = { $gte: new Date(fromDate) };
//     } else if (toDate) {
//       matchQuery.createdAt = { $lte: new Date(toDate) };
//     }

//     // Debug info
//     const totalDocs = await CreateNewReq.countDocuments(matchQuery);
//     const docsWithApprovals = await CreateNewReq.find({
//       ...matchQuery,
//       approvals: { $exists: true, $ne: [] },
//     }).limit(3);

//     console.log("docsWithApprovals", docsWithApprovals);

//     // ----------------------
//     // NORMAL DEPARTMENTS
//     // ----------------------
//     const normalData = await CreateNewReq.aggregate([
//       { $match: matchQuery },
//       {
//         $match: {
//           "commercials.department": { $nin: additionalDepartments },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             entity: "$commercials.entity",
//             department: "$commercials.department",
//             currency: "$supplies.selectedCurrency",
//           },
//           totalRequests: { $sum: 1 },
//           pendingRequests: {
//             $sum: {
//               $cond: [
//                 {
//                   $in: [
//                     "$status",
//                     ["Pending", "Invoice-Pending", "PO-Pending"],
//                   ],
//                 },
//                 1,
//                 0,
//               ],
//             },
//           },
//           approvedRequests: {
//             $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
//           },
//           holdRequests: {
//             $sum: { $cond: [{ $eq: ["$status", "Hold"] }, 1, 0] },
//           },
//           rejectedRequests: {
//             $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
//           },
//           totalFund: { $sum: "$supplies.totalValue" },
//           pendingFund: {
//             $sum: {
//               $cond: [
//                 {
//                   $in: [
//                     "$status",
//                     ["Pending", "Invoice-Pending", "PO-Pending"],
//                   ],
//                 },
//                 "$supplies.totalValue",
//                 0,
//               ],
//             },
//           },
//           approvedFund: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$status", "Approved"] },
//                 "$supplies.totalValue",
//                 0,
//               ],
//             },
//           },
//           holdFund: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "Hold"] }, "$supplies.totalValue", 0],
//             },
//           },
//           rejectedFund: {
//             $sum: {
//               $cond: [
//                 { $eq: ["$status", "Rejected"] },
//                 "$supplies.totalValue",
//                 0,
//               ],
//             },
//           },
//         },
//       },
//     ]);

//     // ----------------------
//     // SPECIAL DEPARTMENTS (Sequential Approval Logic)
//     // ----------------------
//     const specialRequests = await CreateNewReq.find({isCompleted:true,
//       approvals: { $exists: true, $ne: [] },
//     });

//     const specialData = [];

//     specialRequests.forEach((req) => {
//       const approvals = req.approvals.filter((a) =>
//         additionalDepartments.includes(a.departmentName)
//       );

//       let canCount = true; // stop counting if Hold/Rejected encountered

//       approvals.forEach((a) => {
//         if (!canCount) return;

//         // 🔑 Ensure only the requested special department is counted
//         if (department && a.departmentName !== department) return;

//         let totalRequests = 1;
//         let pendingRequests = 0,
//           approvedRequests = 0,
//           holdRequests = 0,
//           rejectedRequests = 0;

//         if (
//           ["Pending", "Invoice-Pending", "PO-Pending", null].includes(a.status)
//         )
//           pendingRequests = 1;
//         if (a.status === "Approved") approvedRequests = 1;
//         if (a.status === "Hold") holdRequests = 1;
//         if (a.status === "Rejected") rejectedRequests = 1;

//         if (["Hold", "Rejected"].includes(a.status)) canCount = false;

//         // specialData.push({
//         //   _id: {
//         //     entity: req.commercials.entity,
//         //     requestDepartment: req.commercials.department,
//         //     department: a.departmentName,
//         //     currency: req.supplies.selectedCurrency,
//         //   },
//         //   totalRequests,
//         //   pendingRequests,
//         //   approvedRequests,
//         //   holdRequests,
//         //   rejectedRequests,
//         //   totalFund: req.supplies.totalValue,
//         //   pendingFund: pendingRequests ? req.supplies.totalValue : 0,
//         //   approvedFund: approvedRequests ? req.supplies.totalValue : 0,
//         //   holdFund: holdRequests ? req.supplies.totalValue : 0,
//         //   rejectedFund: rejectedRequests ? req.supplies.totalValue : 0,
//         // });
//       });
//     });

//     // ----------------------
//     // MERGE NORMAL + SPECIAL
//     // ----------------------
//     let reqData = [...normalData, ...specialData];

//     // Optional: Final filter safeguard
//     if (department) {
//       reqData = reqData.filter(
//         (item) =>
//           item._id.department === department ||
//           item._id.requestDepartment === department
//       );
//     }

//     res.status(200).json({
//       success: true,
//       data: reqData,
//       debug: {
//         totalDocs,
//         docsWithApprovals: docsWithApprovals.length,
//       },
//       message: "Filtered data by department",
//     });
//   } catch (err) {
//     console.log("Error in getting the data", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };

const getSearchedData = async (req, res) => {
  try {
    const { data } = req.body;
    console.log("from data", data);
    const { entity, department, fromDate, toDate, role } = data;



    const deptRoleLower = (department || role).trim().toLowerCase();

    // ---------- Build match query ----------
    const matchQuery = { isCompleted: true };
    if (entity) matchQuery["commercials.entity"] = entity;

    if (fromDate || toDate) {
      matchQuery.createdAt = {};
      if (fromDate)
        matchQuery.createdAt.$gte = new Date(`${fromDate}T00:00:00.000Z`);
      if (toDate)
        matchQuery.createdAt.$lte = new Date(`${toDate}T23:59:59.999Z`);
    }

    const allRequests = await CreateNewReq.find(matchQuery).lean();
    const counts = {};

    allRequests.forEach((req) => {
      const approvals = req.approvals || [];
      const firstApproval = req.firstLevelApproval || {};
      const key = `${req.commercials.entity}-${department || role}-${req.supplies.selectedCurrency
        }`;

      // Initialize counts
      if (!counts[key]) {
        counts[key] = {
          _id: {
            entity: req.commercials.entity,
            department: department || role,
            currency: req.supplies.selectedCurrency,
          },
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          holdRequests: 0,
          rejectedRequests: 0,
          totalFund: 0,
          pendingFund: 0,
          approvedFund: 0,
          holdFund: 0,
          rejectedFund: 0,
        };
      }

      let countedThisRequest = false;

      // ---------- Department-level (firstLevelApproval) ----------
      if (firstApproval.hodDepartment) {
        const deptLower = firstApproval.hodDepartment.trim().toLowerCase();
        if (deptLower === deptRoleLower) {
          counts[key].totalRequests += 1;
          counts[key].totalFund += req.supplies.totalValue;

          if (firstApproval.status === "Approved") {
            counts[key].approvedRequests += 1;
            counts[key].approvedFund += req.supplies.totalValue;
          } else if (firstApproval.status === "Rejected") {
            counts[key].rejectedRequests += 1;
            counts[key].rejectedFund += req.supplies.totalValue;
          } else {
            counts[key].pendingRequests += 1;
            counts[key].pendingFund += req.supplies.totalValue;
          }
          countedThisRequest = true;
        }
      }

      // ---------- Role-level (approvals array) ----------
      approvals.forEach((a, idx) => {
        const nextDept = a.nextDepartment
          ? a.nextDepartment.trim().toLowerCase()
          : null;
        const deptName = a.departmentName
          ? a.departmentName.trim().toLowerCase()
          : null;

        // Skip PO-Pending / Invoice-Pending
        if (["po-pending", "invoice-pending"].includes(nextDept)) return;

        const nextApproval = approvals[idx + 1];

        // Approved → nextDepartment matches role and next approval status is Approved
        if (
          nextDept === deptRoleLower &&
          nextApproval &&
          nextApproval.status === "Approved"
        ) {
          counts[key].totalRequests += 1;
          counts[key].approvedRequests += 1;
          counts[key].totalFund += req.supplies.totalValue;
          counts[key].approvedFund += req.supplies.totalValue;
          countedThisRequest = true;
        }

        // Hold / Rejected → departmentName matches role
        if (deptName === deptRoleLower && a.status === "Hold") {
          counts[key].totalRequests += 1;
          counts[key].holdRequests += 1;
          counts[key].totalFund += req.supplies.totalValue;
          counts[key].holdFund += req.supplies.totalValue;
          countedThisRequest = true;
        }

        if (deptName === deptRoleLower && a.status === "Rejected") {
          counts[key].totalRequests += 1;
          counts[key].rejectedRequests += 1;
          counts[key].totalFund += req.supplies.totalValue;
          counts[key].rejectedFund += req.supplies.totalValue;
          countedThisRequest = true;
        }
      });

      // ---------- Pending → if not counted yet, last approval points to this department/role ----------
      const lastApproval = approvals[approvals.length - 1];
      const lastNextDept =
        lastApproval && lastApproval.nextDepartment
          ? lastApproval.nextDepartment.trim().toLowerCase()
          : null;
      if (!countedThisRequest && lastNextDept === deptRoleLower) {
        counts[key].totalRequests += 1;
        counts[key].pendingRequests += 1;
        counts[key].totalFund += req.supplies.totalValue;
        counts[key].pendingFund += req.supplies.totalValue;
      }
    });

    const result = Object.values(counts);

    res.status(200).json({
      success: true,
      data: result,
      message:
        "Filtered report by department/role including Pending, Approved, Hold, Rejected",
    });
  } catch (err) {
    console.error("Error generating report", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


const getAllFilteredRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, department, fromDate, toDate } = req.body;

    console.log("Filter inputs:", status, department, fromDate, toDate);

    let query = {};

    if (userId) query.userId = userId;
    if (status && status !== "All") query.status = status;
    if (department && department !== "All")
      query["commercials.department"] = department;

    if (fromDate && toDate) {
      query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    } else if (fromDate) {
      query.createdAt = { $gte: new Date(fromDate) };
    } else if (toDate) {
      query.createdAt = { $lte: new Date(toDate) };
    }

    console.log("Mongo Query:", query);

    // Fetch filtered requests
    const reqData = await CreateNewReq.find(query).sort({ createdAt: -1 });

    // Process approvals to determine currentDepartment & nextDepartment
    const processedReqData = reqData.map((request) => {
      const { approvals, firstLevelApproval } = request;

      let currentDepartment = null;
      let nextDepartment = null;

      if (!approvals || approvals.length === 0) {
        currentDepartment = "Pending HOD Approval";
        nextDepartment = firstLevelApproval?.hodDepartment || null;
      } else {
        const latestApproval = approvals[approvals.length - 1];
        currentDepartment =
          latestApproval.departmentName || "Unknown Department";

        if (latestApproval.status === "Approved") {
          nextDepartment = latestApproval.nextDepartment || "End of Approval";
        } else if (
          latestApproval.status === "Hold" ||
          latestApproval.status === "Rejected"
        ) {
          nextDepartment = latestApproval.departmentName; // stuck at current
        } else {
          nextDepartment = latestApproval.nextDepartment || null;
        }
      }

      return {
        ...request.toObject(), // convert Mongoose doc to plain object
        currentDepartment,
        nextDepartment,
      };
    });

    return res.status(200).json({
      success: true,
      total: processedReqData.length,
      data: processedReqData,
    });
  } catch (err) {
    console.log("Error in filtering requests", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while filtering requests",
    });
  }
};

const getRequestDataForProvison = async (req, res) => {
  try {
    const { reqId } = req.params;

    const reqData = await CreateNewReq.findOne(
      { reqid: reqId },
      {
        poDocuments: 1,
        "procurements.vendor": 1,
        "procurements.vendorName": 1,
        "supplies.totalValue": 1,
        "supplies.selectedCurrency": 1,
      }
    );

    if (!reqData) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: reqData,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};












module.exports = {
  getRequestDataForProvison,
  getAllFilteredRequest,
  getSearchedData,
  tagMessageToEmployee,
  getAllEmailData,
  emailNotificationAction,
  getRoleBasedApprovals,
  generateRequestPdfData,
  editCommercialData,
  saveAggrementData,
  saveSuppliesData,
  saveProcurementsData,
  saveCommercialData,
  uploadInvoiceDocuments,
  uploadPoDocuments,
  releaseReqStatus,
  isApproved,
  addReqForm,
  postComments,
  getAllChats,
  getReports,
  approveRequest,
  getNewNotifications,
  getApprovedReqData,
  isButtonSDisplay,
  generatePo,
  updateRequest,
  downloadInvoicePdf,
  getStatisticData,
  sendNudgeNotification,
  editSendRequestMail,
  filterByDateStatitics,
  getFilteredRequest,
  getANewRequestId,
};
