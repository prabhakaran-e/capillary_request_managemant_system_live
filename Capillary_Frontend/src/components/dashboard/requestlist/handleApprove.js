import {
    businessFinanceApproveRequest,
    hodApproveRequest,
    hofApproveRequest,
    infoSecurityApproveRequest,
    legalTeamApproveRequest,
    poTeamApproveRequest,
    vendorManagementApproveRequest,
} from "../../../api/service/adminServices";

const handleApprove = async (userId, role, reqId, status, email, reason) => {
    try {
        console.log(
            `User ID: ${userId}, Role: ${role}, Request ID: ${reqId} reason ${reason}`
        );

        let response;

        switch (role) {
            case "Admin":
                console.log("Approving for HOD");
                response = await hodApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;
            case "HOD Department":
                console.log("Approving for HOD");
                response = await hodApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            case "Business Finance":
                console.log("Approving for Business Finance");
                response = await businessFinanceApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            case "Vendor Management":
                console.log("Approving for Vendor Management");
                response = await vendorManagementApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            case "Legal Team":
                console.log("Approving for Legal Team");
                response = await legalTeamApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            case "Info Security":
                console.log("Approving for Info Security");
                response = await infoSecurityApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            case "PO Team":
                console.log("Approving for PO Team");
                response = await poTeamApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            case "Head of Finance":
                console.log("Approving for HOF");
                response = await hofApproveRequest(
                    userId,
                    role,
                    reqId,
                    status,
                    email,
                    reason
                );
                break;

            default:
                console.log(`Unknown role: ${role}`);
                response = {
                    status: "error",
                    message: "Invalid role specified",
                };
        }

        return response;
    } catch (err) {
        console.error("Error in approve request", err);
        return {
            status: "error",
            message: "An error occurred during approval",
            error: err,
        };
    }
};

export default handleApprove;
