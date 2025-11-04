const CreateNewReq = require("../models/createNewReqSchema");
const Employee = require("../models/empModel");
const panelUserData = require("../models/addPanelUsers");
const { sendIndividualEmail } = require("../utils/otherTestEmail");
const entityModel = require("../models/entityModel");
const sendEmail = require("../utils/sendEmail");

const approveRequest = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { id } = req.params;
    let { reqId, status, email, reason, role } = req.body;

    if (status === "Reject") {
      status = "Rejected";
    }

    const remarks = reason;

    // Fetch required data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        firstLevelApproval: 1,
        userId: 1,
        approvals: 1,
        procurements: 1,
        hasDeviations: 1,
        createdAt: 1,
        status: 1,
        commercials: 1,
        reqid: 1,
        departmentDeviations: 1,
      }
    );

    if (!reqData) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const approverData =
      (await panelUserData.findOne({ employee_id: id })) ||
      (await Employee.findOne({ employee_id: id }));

    if (!approverData) {
      return res.status(404).json({
        success: false,
        message: "Approver not found",
      });
    }

    const requesterData = await Employee.findOne(
      { employee_id: reqData.userId },
      { full_name: 1, company_email_id: 1, department: 1, employee_id: 1 }
    );

    if (!requesterData) {
      return res.status(404).json({
        success: false,
        message: "Requester not found",
      });
    }

    const isHeHod = reqData.firstLevelApproval.hodEmail === email;
    const { department } = approverData;

    // Handle Hold or Rejected status
    if (status === "Hold" || status === "Rejected") {
      const latestApproval = reqData.approvals[reqData.approvals.length - 1];

      const approvalRecord = {
        departmentName: approverData.department,
        status: status,
        approverName: approverData.full_name,
        approvalId: approverData.employee_id,
        approvalDate: new Date(),
        remarks: remarks || "",
        nextDepartment: null,
        receivedOn: isHeHod
          ? reqData.createdAt
          : latestApproval?.approvalDate || new Date(),
      };

      if (isHeHod) {
        reqData.firstLevelApproval.approved = false;
        reqData.firstLevelApproval.status = status;
        reqData.status = status;
        reqData.approvals.push(approvalRecord);
        await reqData.save();
      } else {
        reqData.status = status;
        reqData.approvals.push(approvalRecord);
        await reqData.save();
      }

      await sendIndividualEmail(
        "EMPLOYEE",
        requesterData.company_email_id,
        requesterData.full_name,
        requesterData.department,
        reqData.reqid,
        approvalRecord
      );

      await sendIndividualEmail(
        "AUTHORITY",
        approverData.company_email_id,
        approverData.full_name,
        approverData.department,
        reqData.reqid,
        approvalRecord
      );

      return res.status(200).json({
        success: true,
        message: `Request ${status.toLowerCase()} successfully`,
        data: approvalRecord,
      });
    } else {
      console.log(
        "reqData.status",
        reqData.status,
        reqData.firstLevelApproval.hodEmail
      );
      const departmentOrder = [
        reqData.firstLevelApproval.hodEmail,
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "Head of Finance",
        "Proceed the PO invoice",
      ];
      const departmentOrders = [
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "Head of Finance",
        "Proceed the PO invoice",
      ];

      let currentDeptIndex;
      if (
        email === reqData.firstLevelApproval.hodEmail &&
        !reqData.firstLevelApproval.approved
      ) {
        currentDeptIndex = departmentOrder.indexOf(email);
      } else {
        currentDeptIndex = departmentOrder.indexOf(role);
      }

      const nextDepartment = departmentOrder[currentDeptIndex + 1] || null;
      const latestApproval = reqData.approvals[reqData.approvals.length - 1];

      if (
        latestApproval?.nextDepartment !== role &&
        latestApproval?.approvalId !== id &&
        latestApproval?.length < 0
      ) {
        return res.status(401).json({
          message: `Request approve failed!. Expected deparment is ${latestApproval.nextDepartment} `,
        });
      }
      if (reqData.status === "Hold" || reqData.status === "Rejected") {
        reqData.status = "Pending";
        await reqData.save();
      }

      const approvalRecord = {
        departmentName: approverData.department,
        status: status,
        approverName: approverData.full_name,
        approvalId: approverData.employee_id,
        approvalDate: new Date(),
        remarks: remarks || "",
        nextDepartment: status === "Approved" ? nextDepartment : null,
        receivedOn: isHeHod
          ? reqData.createdAt
          : latestApproval?.approvalDate || new Date(),
      };

      if (
        (latestApproval?.status === "Rejected" ||
          latestApproval?.status === "Hold") &&
        latestApproval.length > 0
      ) {
        const approvalRecords = {
          departmentName: approverData.department,
          status: status,
          approverName: approverData.full_name,
          approvalId: approverData.employee_id,
          approvalDate: new Date(),
          remarks: remarks || "",
          nextDepartment: status === "Approved" ? nextDepartment : null,

          receivedOn: isHeHod
            ? reqData.createdAt
            : latestApproval?.approvalDate || new Date(),
        };

        reqData.approvals.push(approvalRecords);
        await reqData.save();
      }

      if (isHeHod) {
        reqData.firstLevelApproval.approved = true;
        reqData.firstLevelApproval.status = status;
        reqData.status = "Pending";
        reqData.approvals.push(approvalRecord);
        await reqData.save();

        await sendIndividualEmail(
          "EMPLOYEE",
          requesterData.company_email_id,
          requesterData.full_name,
          requesterData.department,
          reqData.reqid,
          approvalRecord
        );
      }

      // Business Finance Auto-approval flow
      else if (
        role === "Business Finance" &&
        !reqData.procurements.isNewVendor &&
        status === "Approved"
      ) {
        console.log("From business finance auto appropved");
        if (reqData.hasDeviations === 1) {
          const legalDeviation =
            reqData.departmentDeviations?.get("Legal Team");
          const infoDeviation =
            reqData.departmentDeviations?.get("Info Security");

          if (legalDeviation) {
            console.log("inside has deviation - legal");

            const autoApproveDepartments = [
              "Business Finance",
              "Vendor Management",
              "Legal Team",
            ];

            for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
              // FIXED HERE
              const newRequestData = await CreateNewReq.findOne(
                { _id: reqId },
                { approvals: 1 }
              );
              const { approvals } = newRequestData;
              const lastLeveLApprovals = approvals[approvals.length - 1];
              const autoDepartment = autoApproveDepartments[i];

              let remarks = role === autoDepartment ? "" : "Not-Applicable";

              const isLastDepartment = i === autoApproveDepartments.length - 1;
              const nextAutoDepartment = isLastDepartment
                ? null
                : autoApproveDepartments[i + 1];

              const autoApproverData = await panelUserData.findOne(
                { role: autoDepartment },
                { full_name: 1, employee_id: 1, company_email_id: 1 }
              );

              if (autoApproverData) {
                const autoApprovalRecord = {
                  departmentName: autoDepartment,
                  status: "Approved",
                  approverName: autoApproverData.full_name,
                  approvalId: autoApproverData.employee_id,
                  approvalDate: new Date(),
                  remarks: remarks,
                  nextDepartment: nextAutoDepartment,
                  receivedOn: lastLeveLApprovals.approvalDate,
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
                  requesterData.company_email_id,
                  requesterData.full_name,
                  requesterData.department,
                  reqData.reqid,
                  autoApprovalRecord
                );

                await sendIndividualEmail(
                  "AUTHORITY",
                  autoApproverData.company_email_id,
                  autoApproverData.full_name,
                  autoApproverData.department,
                  reqData.reqid,
                  autoApprovalRecord
                );
              } else {
                console.error(
                  `No approver found for department: ${autoDepartment}`
                );
                break;
              }
            }
          } else {
            const autoApproveDepartments = [
              "Business Finance",
              "Vendor Management",
              "Legal Team",
              "Info Security",
            ];

            for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
              // FIXED HERE
              const newRequestData = await CreateNewReq.findOne(
                { _id: reqId },
                { approvals: 1 }
              );
              const { approvals } = newRequestData;
              const lastLeveLApprovals = approvals[approvals.length - 1];
              const autoDepartment = autoApproveDepartments[i];

              let remarks = role === autoDepartment ? "" : "Not-Applicable";

              const isLastDepartment = i === autoApproveDepartments.length - 1;
              const nextAutoDepartment = isLastDepartment
                ? null
                : autoApproveDepartments[i + 1];

              const autoApproverData = await panelUserData.findOne(
                { role: autoDepartment },
                { full_name: 1, employee_id: 1, company_email_id: 1 }
              );

              if (autoApproverData) {
                const autoApprovalRecord = {
                  departmentName: autoDepartment,
                  status: "Approved",
                  approverName: autoApproverData.full_name,
                  approvalId: autoApproverData.employee_id,
                  approvalDate: new Date(),
                  remarks: remarks,
                  nextDepartment: nextAutoDepartment,
                  receivedOn: lastLeveLApprovals.approvalDate,
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

                if (autoDepartment === "Info Security") {
                  const entityEmail = await entityModel.findOne(
                    { _id: reqData?.commercials?.entityId },
                    { PoSVOK: 1 }
                  );
                  const emailString = entityEmail?.PoSVOK || "";
                  const emailList = emailString
                    .split(",")
                    .map((email) => email.trim())
                    .filter(Boolean);
                  for (i = 0; i < emailList.length; i++) {
                    await sendIndividualEmail(
                      "AUTHORITY",
                      emailList[i],
                      autoApproverData.full_name,
                      autoDepartment,
                      reqData.reqid,
                      autoApprovalRecord
                    );
                  }

                  console.log("Checking the entity email", emailList);
                  break;
                }

                await sendIndividualEmail(
                  "EMPLOYEE",
                  requesterData.company_email_id,
                  requesterData.full_name,
                  requesterData.department,
                  reqData.reqid,
                  autoApprovalRecord
                );

                await sendIndividualEmail(
                  "AUTHORITY",
                  autoApproverData.company_email_id,
                  autoApproverData.full_name,
                  autoApproverData.department,
                  reqData.reqid,
                  autoApprovalRecord
                );
              } else {
                console.error(
                  `No approver found for department: ${autoDepartment}`
                );
                break;
              }
            }
          }
        } else {
          const autoApproveDepartments = [
            "Business Finance",
            "Vendor Management",
            "Legal Team",
            "Info Security",
            "Head of Finance",
          ];

          for (let i = 0; i < autoApproveDepartments.length; i++) {
            const newRequestData = await CreateNewReq.findOne(
              { _id: reqId },
              { approvals: 1 }
            );
            const { approvals } = newRequestData;
            const lastLeveLApprovals = approvals[approvals.length - 1];
            const autoDepartment = autoApproveDepartments[i];
            let remarks = "";
            if (role === autoDepartment) {
              remarks = "";
            } else {
              remarks = "Not-Applicable";
            }
            const isLastDepartment = i === autoApproveDepartments.length - 1;
            const nextAutoDepartment = isLastDepartment
              ? null
              : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              {
                full_name: 1,
                employee_id: 1,
                company_email_id: 1,
                department: 1,
              }
            );

            if (autoApproverData) {
              const autoApprovalRecord = {
                departmentName: autoApproverData.department,
                status: "Approved",
                approverName: autoApproverData.full_name,
                approvalId: autoApproverData.employee_id,
                approvalDate: new Date(),
                remarks: remarks,
                nextDepartment: nextAutoDepartment,
                receivedOn: lastLeveLApprovals.approvalDate,
              };

              await sendIndividualEmail(
                "EMPLOYEE",
                requesterData.company_email_id,
                requesterData.full_name,
                requesterData.department,
                reqData.reqid,
                autoApprovalRecord
              );

              await sendIndividualEmail(
                "AUTHORITY",
                autoApproverData.company_email_id,
                autoApproverData.full_name,
                autoDepartment,
                reqData.reqid,
                autoApprovalRecord
              );

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
              if (autoDepartment === "Info Security") {
                const entityEmail = await entityModel.findOne(
                  { _id: reqData?.commercials?.entityId },
                  { PoSVOK: 1 }
                );
                const emailString = entityEmail?.PoSVOK || "";
                const emailList = emailString
                  .split(",")
                  .map((email) => email.trim())
                  .filter(Boolean);
                for (i = 0; i < emailList.length; i++) {
                  await sendIndividualEmail(
                    "AUTHORITY",
                    emailList[i],
                    autoApproverData.full_name,
                    autoDepartment,
                    reqData.reqid,
                    autoApprovalRecord
                  );
                }

                console.log("Checking the entity email", emailList);
                break;
              }

              console.log("autoDepartment", autoDepartment);
            } else {
              console.error(
                `No approver found for department: ${autoDepartment}`
              );
              break;
            }
          }
        }
      } else if (
        role === "Business Finance" &&
        reqData.procurements.isNewVendor
      ) {
        console.log("nextDepartment--->", nextDepartment);
        const newRequestData = await CreateNewReq.findOne(
          { _id: reqId },
          { approvals: 1 }
        );
        const { approvals } = newRequestData;
        const lastLeveLApprovals = approvals[approvals.length - 1];
        const autoApprovalRecord = {
          departmentName: approverData.department,
          status: "Approved",
          approverName: approverData.full_name,
          approvalId: approverData.employee_id,
          approvalDate: new Date(),
          remarks: remarks,
          nextDepartment: nextDepartment,
          receivedOn: lastLeveLApprovals.approvalDate,
        };

        await CreateNewReq.updateOne(
          { _id: reqId },
          {
            $push: { approvals: autoApprovalRecord },
          }
        );
      }

      // Vendor Management Auto-approval flow
      else if (
        role === "Vendor Management" &&
        reqData.hasDeviations === 0 &&
        status === "Approved"
      ) {
        const autoApproveDepartments = [
          "Vendor Management",
          "Legal Team",
          "Info Security",
          "Head of Finance",
        ];
        let remarks;

        for (let i = 0; i < autoApproveDepartments.length; i++) {
          const newRequestData = await CreateNewReq.findOne(
            { _id: reqId },
            { approvals: 1 }
          );
          const { approvals } = newRequestData;
          const lastLeveLApprovals = approvals[approvals.length - 1];
          const autoDepartment = autoApproveDepartments[i];
          const isLastDepartment = i === autoApproveDepartments.length - 1;
          const nextAutoDepartment = isLastDepartment
            ? null
            : autoApproveDepartments[i + 1];

          const autoApproverData = await panelUserData.findOne(
            { role: autoDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          );

          if (
            nextAutoDepartment === "Info Security" ||
            nextAutoDepartment === "Head of Finance"
          ) {
            remarks = "Not-Applicable";
          } else {
            remarks = "";
          }

          if (autoApproverData) {
            const autoApprovalRecord = {
              departmentName: autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: remarks,
              nextDepartment: nextAutoDepartment,
              receivedOn: lastLeveLApprovals.approvalDate,
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
              requesterData.company_email_id,
              requesterData.full_name,
              requesterData.department,
              reqData.reqid,
              autoApprovalRecord
            );

            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              reqData.reqid,
              autoApprovalRecord
            );

            if (autoDepartment === "Info Security") {
              const entityEmail = await entityModel.findOne(
                { _id: reqData?.commercials?.entityId },
                { PoSVOK: 1 }
              );
              const emailString = entityEmail?.PoSVOK || "";
              const emailList = emailString
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean);
              for (i = 0; i < emailList.length; i++) {
                await sendIndividualEmail(
                  "AUTHORITY",
                  emailList[i],
                  autoApproverData.full_name,
                  autoDepartment,
                  reqData.reqid,
                  autoApprovalRecord
                );
              }

              console.log("Checking the entity email", emailList);
              break;
            }
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break;
          }
        }
      } else if (
        role === "Vendor Management" &&
        reqData.hasDeviations === 1 &&
        status === "Approved"
      ) {
        const legalDeviation = reqData.departmentDeviations?.get("Legal Team");
        const infoDeviation =
          reqData.departmentDeviations?.get("Info Security");

        if (legalDeviation) {
          console.log("inside has deviation - legal");

          const autoApproveDepartments = ["Vendor Management", "Legal Team"];

          for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
            // FIXED HERE
            const newRequestData = await CreateNewReq.findOne(
              { _id: reqId },
              { approvals: 1 }
            );
            const { approvals } = newRequestData;
            const lastLeveLApprovals = approvals[approvals.length - 1];
            const autoDepartment = autoApproveDepartments[i];

            let remarks = "";

            const isLastDepartment = i === autoApproveDepartments.length - 1;
            const nextAutoDepartment = isLastDepartment
              ? null
              : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              { full_name: 1, employee_id: 1, company_email_id: 1 }
            );

            if (autoApproverData) {
              const autoApprovalRecord = {
                departmentName: autoDepartment,
                status: "Approved",
                approverName: autoApproverData.full_name,
                approvalId: autoApproverData.employee_id,
                approvalDate: new Date(),
                remarks: remarks,
                nextDepartment: nextAutoDepartment,
                receivedOn: lastLeveLApprovals.approvalDate,
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
                requesterData.company_email_id,
                requesterData.full_name,
                requesterData.department,
                reqData.reqid,
                autoApprovalRecord
              );

              await sendIndividualEmail(
                "AUTHORITY",
                autoApproverData.company_email_id,
                autoApproverData.full_name,
                autoApproverData.department,
                reqData.reqid,
                autoApprovalRecord
              );
            } else {
              console.error(
                `No approver found for department: ${autoDepartment}`
              );
              break;
            }
          }
        } else if (infoDeviation) {
          console.log("inside has deviation - legal");

          const autoApproveDepartments = [
            "Vendor Management",
            "Legal Team",
            "Info Security",
          ];

          for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
            // FIXED HERE
            const newRequestData = await CreateNewReq.findOne(
              { _id: reqId },
              { approvals: 1 }
            );
            const { approvals } = newRequestData;
            const lastLeveLApprovals = approvals[approvals.length - 1];
            const autoDepartment = autoApproveDepartments[i];

            let remarks = "";
            if (autoDepartment === "Legal Team") {
              remarks = "Not-Applicable";
            } else {
              remarks = "";
            }

            const isLastDepartment = i === autoApproveDepartments.length - 1;
            const nextAutoDepartment = isLastDepartment
              ? null
              : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              { full_name: 1, employee_id: 1, company_email_id: 1 }
            );

            if (autoApproverData) {
              const autoApprovalRecord = {
                departmentName: autoDepartment,
                status: "Approved",
                approverName: autoApproverData.full_name,
                approvalId: autoApproverData.employee_id,
                approvalDate: new Date(),
                remarks: remarks,
                nextDepartment: nextAutoDepartment,
                receivedOn: lastLeveLApprovals.approvalDate,
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
                requesterData.company_email_id,
                requesterData.full_name,
                requesterData.department,
                reqData.reqid,
                autoApprovalRecord
              );

              await sendIndividualEmail(
                "AUTHORITY",
                autoApproverData.company_email_id,
                autoApproverData.full_name,
                autoApproverData.department,
                reqData.reqid,
                autoApprovalRecord
              );
            } else {
              console.error(
                `No approver found for department: ${autoDepartment}`
              );
              break;
            }
          }
        }
      } else if (role === "Legal Team") {
        const infoDeviation =
          reqData.departmentDeviations?.get("Info Security");
        if (!infoDeviation) {
          const autoApproveDepartments = [
            "Legal Team",
            "Info Security",
            "Head of Finance",
          ];
          let remarks;

          for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
            const newRequestData = await CreateNewReq.findOne(
              { _id: reqId },
              { approvals: 1 }
            );
            const { approvals } = newRequestData;
            const lastLeveLApprovals = approvals[approvals.length - 1];
            const autoDepartment = autoApproveDepartments[i];
            const isLastDepartment = i === autoApproveDepartments.length - 1;
            const nextAutoDepartment = isLastDepartment
              ? null
              : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              { full_name: 1, employee_id: 1, company_email_id: 1 }
            );

            if (autoApproverData) {
              if (nextAutoDepartment === "Head of Finance") {
                remarks = " Not-Applicable";
              } else {
                remarks = "";
              }

              const autoApprovalRecord = {
                departmentName: autoDepartment,
                status: "Approved",
                approverName: autoApproverData.full_name,
                approvalId: autoApproverData.employee_id,
                approvalDate: new Date(),
                remarks: remarks,
                nextDepartment: nextAutoDepartment,
                receivedOn: lastLeveLApprovals.approvalDate,
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
                requesterData.company_email_id,
                requesterData.full_name,
                requesterData.department,
                reqData.reqid,
                autoApprovalRecord
              );

              await sendIndividualEmail(
                "AUTHORITY",
                autoApproverData.company_email_id,
                autoApproverData.full_name,
                autoApproverData.department,
                reqData.reqid,
                autoApprovalRecord
              );

              if (autoDepartment === "Info Security") {
                const entityEmail = await entityModel.findOne(
                  { _id: reqData?.commercials?.entityId },
                  { PoSVOK: 1 }
                );
                const emailString = entityEmail?.PoSVOK || "";
                const emailList = emailString
                  .split(",")
                  .map((email) => email.trim())
                  .filter(Boolean);
                for (i = 0; i < emailList.length; i++) {
                  await sendIndividualEmail(
                    "AUTHORITY",
                    emailList[i],
                    autoApproverData.full_name,
                    autoDepartment,
                    reqData.reqid,
                    autoApprovalRecord
                  );
                }

                console.log("Checking the entity email", emailList);
                break;
              }
            } else {
              console.error(
                `No approver found for department: ${autoDepartment}`
              );
              break;
            }
          }
        }
      } else if (role === "Head of Finance" && status === "Approved") {
        console.log("Sending email to requestor and po");
        const approvalRecord = {
          departmentName: approverData.department,
          status: status,
          approverName: approverData.full_name,
          approvalId: approverData.employee_id,
          approvalDate: new Date(),
          remarks: "",
          nextDepartment: "PO-Pending",
          receivedOn: latestApproval?.approvalDate || new Date(),
        };
        const newReqData = await CreateNewReq.updateOne(
          { _id: reqId },
          {
            $push: { approvals: approvalRecord },
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

        if (entityMail?.poMailId) {
          await sendEmail(entityMail.poMailId, "financeApprovalEmail", {
            reqid: reqData.reqid,
            reqId,
          });
        }
      } else {
        reqData.approvals.push(approvalRecord);
        await reqData.save();
        await sendIndividualEmail(
          "EMPLOYEE",
          requesterData.company_email_id,
          requesterData.full_name,
          requesterData.department,
          reqData.reqid,
          approvalRecord
        );
      }

      // Send success response
      return res.status(200).json({
        success: true,
        message: "Request processed successfully",
        data: {
          status,
          department,
          approvalRecord,
          updatedRequest: reqData,
        },
      });
    }
  } catch (err) {
    console.error("Error in approving the request:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const businessFinanceBulkApproval = async (req, res) => {
  try {
    const { empId } = req.params;
    const { selectedRequests, role } = req.body;

    // approverData only once since empId is same
    const approverData =
      (await panelUserData.findOne({ employee_id: empId })) ||
      (await Employee.findOne({ employee_id: empId }));

    if (!approverData) {
      return res.status(404).json({
        success: false,
        message: "Approver not found",
      });
    }

    const results = [];

    // LOOP THROUGH ALL REQUESTS
    for (const reqId of selectedRequests) {
      try {
        const reqData = await CreateNewReq.findOne(
          { _id: reqId },
          {
            firstLevelApproval: 1,
            userId: 1,
            approvals: 1,
            procurements: 1,
            hasDeviations: 1,
            createdAt: 1,
            status: 1,
            commercials: 1,
            reqid: 1,
            departmentDeviations: 1,
          }
        );

        console.log("reqData", reqData);

        if (!reqData) {
          results.push({ reqId, success: false, message: "Request not found" });
          continue;
        }

        const requesterData = await Employee.findOne(
          { employee_id: reqData.userId },
          { full_name: 1, company_email_id: 1, department: 1, employee_id: 1 }
        );

        if (!requesterData) {
          results.push({
            reqId,
            success: false,
            message: "Requester not found",
          });
          continue;
        }

        // -------- Business Finance Auto-Approval Flow --------
        if (role === "Business Finance" && !reqData.procurements.isNewVendor) {
          console.log(`Auto-approving reqId: ${reqId}`);

          let autoApproveDepartments = [
            "Business Finance",
            "Vendor Management",
            "Legal Team",
            "Info Security",
            "Head of Finance",
          ];

          // if deviation exists -> stop before Head of Finance
          if (reqData.hasDeviations === 1) {
            const legalDeviation =
              reqData.departmentDeviations?.get("Legal Team");
            const infoDeviation =
              reqData.departmentDeviations?.get("Info Security");

            if (legalDeviation) {
              autoApproveDepartments = [
                "Business Finance",
                "Vendor Management",
                "Legal Team",
              ];
            } else if (infoDeviation) {
              autoApproveDepartments = [
                "Business Finance",
                "Vendor Management",
                "Legal Team",
                "Info Security",
              ];
            }
          }

          // Loop through approval departments
          for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
            const autoDepartment = autoApproveDepartments[i];

            const lastApproval =
              reqData.approvals[reqData.approvals.length - 1];

            const nextAutoDepartment =
              i === autoApproveDepartments.length - 1
                ? null
                : autoApproveDepartments[i + 1];

            const autoApproverData = await panelUserData.findOne(
              { role: autoDepartment },
              {
                full_name: 1,
                employee_id: 1,
                company_email_id: 1,
                department: 1,
              }
            );

            if (!autoApproverData) {
              console.error(`No approver found for ${autoDepartment}`);
              break;
            }

            const autoApprovalRecord = {
              departmentName: autoApproverData.department || autoDepartment,
              status: "Approved",
              approverName: autoApproverData.full_name,
              approvalId: autoApproverData.employee_id,
              approvalDate: new Date(),
              remarks: role === autoDepartment ? "" : "Not-Applicable",
              nextDepartment: nextAutoDepartment,
              receivedOn: lastApproval?.approvalDate || reqData.createdAt,
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
              requesterData.company_email_id,
              requesterData.full_name,
              requesterData.department,
              reqData.reqid,
              autoApprovalRecord
            );

            // Notify Approver
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoDepartment,
              reqData.reqid,
              autoApprovalRecord
            );

            // Special: Info Security → send to entity email also
            if (autoDepartment === "Info Security") {
              const entityEmail = await entityModel.findOne(
                { _id: reqData?.commercials?.entityId },
                { PoSVOK: 1 }
              );
              const emailList = (entityEmail?.PoSVOK || "")
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);

              for (let mail of emailList) {
                await sendIndividualEmail(
                  "AUTHORITY",
                  mail,
                  autoApproverData.full_name,
                  autoDepartment,
                  reqData.reqid,
                  autoApprovalRecord
                );
              }
              // break after InfoSec if deviation
              if (reqData.hasDeviations === 1) break;
            }
            if (autoDepartment === "Head of Finance") break;
          }
        }

        results.push({
          reqId,
          success: true,
          message: "Processed successfully",
        });
      } catch (err) {
        console.error("Error processing reqId:", reqId, err);
        results.push({ reqId, success: false, message: err.message });
      }
    }

    return res.json({
      success: true,
      message: "Bulk approval completed",
      results,
    });
  } catch (err) {
    console.error("Error in businessFinanceBulkApproval:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  businessFinanceBulkApproval,
  approveRequest,
};
