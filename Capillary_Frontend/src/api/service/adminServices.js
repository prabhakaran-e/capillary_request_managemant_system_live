import { adminServices } from "../axiosInstance/adminService";

export const verifyUser = async (email) => {
  try {
    const response = await adminServices.post(`/employees/verify-person`, {
      email: email,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchDateFilterStatistics = async (
  empId,
  role,
  email,
  multipartRole,
  from,
  to
) => {
  try {
    const response = await adminServices.post(
      `/request/filter-by-date/${empId}/${role}/${email}/${multipartRole}`,
      { from, to }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getStatisticData = async (empId, role, email, multipartRole) => {
  try {
    console.log(empId, role, email, multipartRole);
    const response = await adminServices.get(
      `/request/get-statistic-data/${empId}/${role}/${email}/${multipartRole}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const sendReqEditMail = async (empId, reqId) => {
  try {
    const response = await adminServices.post(
      `/request/send-edit-request-mail/${empId}/${reqId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................VENDOR SIDE..........................................................

export const getNewVendorId = async () => {
  try {
    const response = await adminServices.get(`/vendors/get-new-vendorid`);
    return response;
  } catch (err) {
    return err;
  }
};

export const createNewVendor = async (formData) => {
  try {
    const response = await adminServices.post(
      `/auth/create-newvendor`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getVendorList = async (empId) => {
  try {
    const response = await adminServices.get(
      `/vendors/vendor-added-by-me/${empId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const RegVendorData = async (formData) => {
  try {
    const response = await adminServices.post(`/vendors/create`, formData);
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchAllVendorData = async () => {
  try {
    const response = await adminServices.get(`/vendors/get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteVendor = async (id) => {
  try {
    const response = await adminServices.delete(`/vendors/delete/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};
export const getVendorData = async (id) => {
  try {
    const response = await adminServices.get(`/vendors/get-vendor-data/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateVendorData = async (id, formData) => {
  try {
    const response = await adminServices.put(`/vendors/update/${id}`, formData);
    return response;
  } catch (err) {
    return err;
  }
};

export const getVenorIndividualData = async (vendorId) => {
  try {
    console.log("loading....");
    const response = await adminServices.get(
      `/vendors/get-vendor-data/${vendorId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................VENDOR SIDE..........................................................

// ............................EMPLOYEE SIDE..........................................................

export const generateEmployeeUniqueId = async () => {
  try {
    const response = await adminServices.get(`/employees/generate-empid`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getSyncEmployeeTable = async (syncOffEmployee) => {
  try {
    const response = await adminServices.post(`/employees/sync-emp-data`, {
      syncOffEmployee,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const regNewEmployee = async (formData) => {
  try {
    const response = await adminServices.post(
      `/employees/create-new-employee`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await adminServices.delete(`/employees/delete/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const deletePanelEmployee = async (id) => {
  try {
    const response = await adminServices.delete(
      `/employees/panel-delete/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getEmployeeList = async () => {
  try {
    const response = await adminServices.get(`/employees/get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getPanelMenberData = async () => {
  try {
    const response = await adminServices.get(`/employees/panel-member-get-all`);
    return response;
  } catch (err) {
    return err;
  }
};

export const createNewRequest = async (id, formData, reqId) => {
  try {
    const response = await adminServices.put(
      `/employees/create-newrequest/${id}/${reqId}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getEmployeeData = async (id) => {
  try {
    const response = await adminServices.get(`/employees/get/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getIndividualEmployee = async (id) => {
  try {
    const response = await adminServices.get(
      `/employees/get-panel-members/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const updateEmployeeData = async (id, formData) => {
  try {
    const response = await adminServices.put(
      `/employees/update/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const isDisplayButton = async (id) => {
  try {
    const response = await adminServices.get(
      `/request/is-display-button/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const generatePo = async (id) => {
  try {
    const response = await adminServices.get(`/request/generate-po/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getNewReqId = async () => {
  try {
    const response = await adminServices.get(`/request/get-a-request-id`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateRequest = async (id, formData) => {
  try {
    const response = await adminServices.put(
      `/request/update-request/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const addNewQuestion = async (userId, newQuestion, role) => {
  try {
    const response = await adminServices.post(
      `/questions/create-new-question/${userId}/${role}`,
      newQuestion
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchMyQuestions = async (userId, role) => {
  try {
    const response = await adminServices.get(
      `/questions/get-my-question/${userId}/${role}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteQuestion = async (userId) => {
  try {
    const response = await adminServices.delete(
      `/questions/delete-my-question/${userId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchAllQuestions = async () => {
  try {
    const response = await adminServices.get(`/questions/get-all-question`);
    return response;
  } catch (err) {
    return err;
  }
};

export const changeQuestionVisibility = async (questionId) => {
  try {
    const response = await adminServices.put(
      `/questions/update-question-visibility/${questionId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getAllLegalQuestions = async () => {
  try {
    const response = await adminServices.get(
      `/questions/get-all-legal-questions`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const verifyToken = async (crediantial) => {
  try {
    const response = await adminServices.post(`/verify-token`, {
      token: crediantial,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const sendReminder = async (reqId) => {
  try {
    const response = await adminServices.post(
      `/request/send-reminder/${reqId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................EMPLOYEE SIDE..........................................................

// ............................DOMAIN SIDE..........................................................

export const allowedDomain = async (domain) => {
  try {
    const response = await adminServices.post(`/auth/admin-allow-domain`, {
      domain,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const listDomains = async (domain) => {
  try {
    const response = await adminServices.get(`/auth/admin-domain-list`, {
      domain,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteDomain = async (id) => {
  try {
    const response = await adminServices.delete(
      `/auth/admin-delete-domain/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................DOMAIN SIDE..........................................................

// ............................REQUEST SIDE..........................................................

export const submitRequest = async (id, formData) => {
  try {
    const response = await adminServices.post(
      `/auth/create-request/${id}`,
      formData
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getReqListEmployee = async (id) => {
  try {
    console.log("Loading....");
    const response = await adminServices.get(`/employees/get-all-req/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchIndividualReq = async (id) => {
  try {
    console.log(id);
    const response = await adminServices.get(
      `/employees/get-individual-req/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchIndividualRequest = async (id) => {
  try {
    console.log(id);
    const response = await adminServices.get(
      `/request/get-individual-request-data/${id}`
    );
    return response;
  } catch (err) {
    return err;
  }
};
export const dispalyIsApproved = async (userId, reqId, role) => {
  try {
    const response = await adminServices.get(
      `/request/is-approved/${userId}/${reqId}/${role}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteFileFromAwsS3 = async (url) => {
  try {
    const response = await adminServices.post(`/upload-s3/delete-s3-image`, {
      url,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteReq = async (id) => {
  try {
    const response = await adminServices.delete(`/employees/delete-req/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getReqListHR = async () => {
  try {
    const response = await adminServices.get(`/employees/get-all-req-admin`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getAdminReqListEmployee = async () => {
  try {
    const response = await adminServices.get(`/employees/get-all-req-admin`);
    return response;
  } catch (err) {
    return err;
  }
};

export const hodApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    console.log("request/accept-request-hod");
    const response = await adminServices.post(
      `/request/accept-request-hod/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const businessFinanceApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-business/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const vendorManagementApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-vendor/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const legalTeamApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-legal/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const infoSecurityApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-info-security/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const poTeamApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-po-team/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const hofApproveRequest = async (
  userId,
  role,
  reqId,
  status,
  email,
  reason
) => {
  try {
    const response = await adminServices.post(
      `/request/accept-request-hof-team/${userId}`,
      { role, reqId, status, email, reason }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getNewNotification = async (userId) => {
  try {
    const response = await adminServices.get(
      `/request/get-new-notification/${userId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getApprovedReq = async (userId, showPendingOnly = false) => {
  try {
    const flag = typeof showPendingOnly === "boolean" ? showPendingOnly : false;
    const response = await adminServices.get(
      `/request/get-approved-req/${userId}`,
      { params: { showPendingOnly: flag } }
    );
    return response;
  } catch (err) {
    return err;
  }
};
export const getFilteredRequest = async (userId, action) => {
  try {
    const response = await adminServices.get(
      `/request/get-filtered-req/${userId}/${action}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// api/service/adminServices.js
export const downloadInvoicePdf = async (id) => {
  try {
    const response = await adminServices.get(
      `/request/invoice/download/${id}`,
      {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return { success: false, error: error.message };
  }
};

export const releseReqStatus = async (
  status,
  department,
  userId,
  reqId,
  role,
  email
) => {
  try {
    const response = await adminServices.put(
      `/request/relese-status/${userId}/${reqId}`,
      { status, department, role, email }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getReqReports = async () => {
  try {
    const response = await adminServices.get(`/request/get-reports`);
    return response;
  } catch (err) {
    return err;
  }
};

export const addPODocument = async (empId, reqId, link, poNumber) => {
  try {
    const response = await adminServices.put(
      `/request/upload-po-documents/${empId}/${reqId}`,
      { link, poNumber }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const addInvoiceDocument = async (empId, reqId, link, invoiceNumber) => {
  try {
    const response = await adminServices.put(
      `/request/upload-invoice-documents/${empId}/${reqId}`,
      { link, invoiceNumber }
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ............................REQUEST SIDE..........................................................

// ............................ENTITY SIDE..........................................................

export const getAllEntityData = async (empId) => {
  try {
    const response = await adminServices.get(`/entity/get-all/${empId}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const addEntityData = async (data) => {
  try {
    const response = await adminServices.post(`/entity/create`, { data });
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteEntity = async (id) => {
  try {
    const response = await adminServices.delete(`/entity/delete/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getEntityData = async (id) => {
  try {
    const response = await adminServices.get(`/entity/get/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateEntityData = async (id, data) => {
  try {
    const response = await adminServices.put(`/entity/update/${id}`, {
      data: data,
    });
    return response;
  } catch (err) {
    return err;
  }
};

// ............................ENTITY SIDE..........................................................

export const sendMessageComments = async (message) => {
  try {
    const response = await adminServices.put(
      `/request/chats/${message.reqId}`,
      {
        data: message,
      }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const fetcAllChats = async (id) => {
  try {
    const response = await adminServices.get(
      `/request/get-all-chats/${id}`,
      {}
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const addNewUser = async (formData) => {
  try {
    const response = await adminServices.post(`/employees/add-new-panels`, {
      formData,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getAllApprovalData = async () => {
  try {
    const response = await adminServices.get(`/employees/get-approval-datas`);
    return response;
  } catch (err) {
    return err;
  }
};

export const uploadCSVFile = async (formData) => {
  try {
    const response = await adminServices.post(
      "/employees/upload-csv-file",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const checkDarwinStatus = async () => {
  try {
    const response = await adminServices.get("/employees/darwin-status");
    return response;
  } catch (err) {
    return err;
  }
};

export const updateDarwinStatus = async () => {
  try {
    const response = await adminServices.put("/employees/update-darwin-status");
    return response;
  } catch (err) {
    return err;
  }
};

// ..............................GENERATE CRETIANTIALS................................

export const generateApiCrediantial = async (email) => {
  try {
    const response = await adminServices.post("/credantials/api-crediantials", {
      email,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const saveCommercialData = async (formData, empId) => {
  try {
    const response = await adminServices.post(
      `/request/save-commercial-data/${empId}`,
      { formData }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const editCommercials = async (formData, empId, reqId) => {
  try {
    const response = await adminServices.post(
      `/request/edit-commercial-data/${empId}/${reqId}`,
      { formData }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const savePocurementsData = async (formData, reqId) => {
  try {
    const response = await adminServices.put(
      `/request/save-procurements-data/${reqId}`,
      { formData }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const saveSuppliesData = async (formData, reqId) => {
  try {
    const response = await adminServices.put(
      `/request/save-supplies-data/${reqId}`,
      { formData }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const saveAggrementData = async (formData, reqId) => {
  try {
    const response = await adminServices.put(
      `/request/save-aggrement-data/${reqId}`,
      { formData }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const generatePDF = async (reqId) => {
  try {
    const response = await adminServices.post(
      `/request/generate-request-pdf/${reqId}`,
      {},
      {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    // Check if the response is a valid PDF
    const contentType =
      response.headers?.["content-type"] ||
      response.headers?.get("content-type");
    if (!contentType || !contentType.includes("application/pdf")) {
      throw new Error("Received invalid content type from server");
    }

    return response; // Return the full response, not just `data`
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Rethrow for handling in the calling function
  }
};

export const getRoleBasedApprovals = async (userId, role) => {
  try {
    const response = await adminServices.get(
      `/request/get-role-based-approvals/${userId}/${role}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const addNewVendorsExcel = async (data, empId) => {
  try {
    const response = await adminServices.post(
      `/vendors/create-new-vendors/${empId}`,
      {
        data,
      }
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ...............................................................................................

export const getAllRequestForPureAdmin = async () => {
  try {
    const response = await adminServices.get(
      `/request/get-all-request-for-admin`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const actionEmailNotifications = async (emailData) => {
  try {
    const response = await adminServices.post(
      `/request/email-notification-action`,
      { emailData }
    );
    return response;
  } catch (err) {
    return err;
  }
};
export const getAllEmailsByName = async () => {
  try {
    const response = await adminServices.get(
      `/request/get-email-notification-data`
    );
    return response;
  } catch (err) {
    return err;
  }
};
export const fetchEmployeesByTopic = async (role, reqId) => {
  try {
    const response = await adminServices.get(
      `/request/tag-employee/${role}/${reqId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getEmployeeDataForApi = async (role, reqId) => {
  try {
    const response = await adminServices.get(`/employees/get-all-employee`);
    return response;
  } catch (err) {
    return err;
  }
};
export const getAllApiData = async () => {
  try {
    const response = await adminServices.get(`/credantials/get-all-api-data`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updateApiCredentialValidity = async (apiId, status) => {
  try {
    const response = await adminServices.put(
      `/credantials/update-api-status/${apiId}`,
      { status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getEntityName = async () => {
  try {
    const response = await adminServices.get(`/entity/get-entity-name`);
    return response;
  } catch (err) {
    return err;
  }
};

export const searchReports = async (data) => {
  try {
    const response = await adminServices.post(`/request/get-searched-data`, {
      data,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const addNewApprover = async (data) => {
  try {
    const response = await adminServices.post(
      `/employees/add-new-approver-data`,
      { data }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const editApprover = async (data) => {
  try {
    const response = await adminServices.put(`/employees/edit-approver-data`, {
      data,
    });
    return response;
  } catch (err) {
    return err;
  }
};
export const deleteApproverData = async (data) => {
  try {
    const response = await adminServices.put(
      `/employees/delete-approver-data`,
      { data }
    );
    return response;
  } catch (err) {
    return err;
  }
};
export const showFileUrl = async (presignedUrl) => {
  try {
    const response = await adminServices.post(
      `/upload-s3/refresh-presigned-url`,
      { presignedUrl }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const saveNewSSoKey = async (key) => {
  try {
    const response = await adminServices.post(`/create-key/save-new-sso-key`, {
      key,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getSSOKey = async () => {
  try {
    const response = await adminServices.get(`/create-key/get-saved-sso-key`);
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteSSOKey = async () => {
  try {
    const response = await adminServices.delete(
      `/create-key/delete-saved-sso-key`
    );
    return response;
  } catch (err) {
    return err;
  }
};

// ...............................................................................................

export const addNewCurrency = async (currency) => {
  try {
    const response = await adminServices.post(`/currency/add-new-currency `, {
      currency,
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getAllCurrencyData = async () => {
  try {
    const response = await adminServices.get(`/currency/get-currency-data`);
    return response;
  } catch (err) {
    return err;
  }
};

export const changeCurrencyStatus = async (currencyId, status) => {
  try {
    const response = await adminServices.put(
      `/currency/update-currency-status/${currencyId}`,
      { status }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteCurrency = async (currencyId) => {
  try {
    const response = await adminServices.delete(
      `/currency/delete-currency-data/${currencyId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const bulkApprovalReq = async (empId, selectedRequests, role) => {
  try {
    const response = await adminServices.post(
      `/request/business-finance-bulk-approval/${empId}`,
      { selectedRequests, role }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const addNewPOData = async (poData, empId) => {
  try {
    const response = await adminServices.post(
      `/purchase-order/add-new-po-data/${empId}`,
      { poData }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const saveSmtpConfiguration = async (smtpConfig, empId) => {
  try {
    const response = await adminServices.post(
      `/create-smtp/add-new-smtp-data/${empId}`,
      { smtpConfig }
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const getSmtpConfig = async () => {
  try {
    const response = await adminServices.get(`/create-smtp/get-new-smtp-data`);
    return response;
  } catch (err) {
    return err;
  }
};


export const deleteSmtpConfiguration = async (id, empId) => {
  try {
    const response = await adminServices.delete(`/create-smtp/delete-smtp-data/${id}/${empId}`);
    return response;
  } catch (err) {
    return err;
  }
};


export const getPoData = async () => {
  try {
    const response = await adminServices.get(`/purchase-order/get-po-data`);
    return response;
  } catch (err) {
    return err;
  }
};

export const deletePOData = async (id, empId) => {
  try {
    const response = await adminServices.delete(
      `/purchase-order/delete-po-data/${id}/${empId}`
    );
    return response;
  } catch (err) {
    return err;
  }
};

export const updatePOData = async (editingId, newEntry, empId) => {
  try {
    const response = await adminServices.put(
      `/purchase-order/update-po-data/${editingId}/${empId}`, { newEntry }
    );
    return response;
  } catch (err) {
    return err;
  }
};


export const getFilteredRequests = async ({ userId, status, department, fromDate, toDate }) => {
  console.log(userId, status, department, fromDate, toDate)
  try {
    const response = await adminServices.post(
      `/request/get-filtered-request/${userId}`, { status, department, fromDate, toDate }
    );
    return response;
  } catch (err) {
    return err;
  }
};