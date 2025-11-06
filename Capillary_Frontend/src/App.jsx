import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// import Login from "./components/Login";
import Dashboard from "./components/Dasboard";
import HomePage from "./components/home/HomePage";


import SidebarLayout from "./components/dashboard/layout/SidebarLayout";
import UserRegistartion from "./components/dashboard/createuser/UserRegistartion";
import UserListTable from "./components/dashboard/createuser/UserListTable";
import AddUser from "./components/dashboard/createuser/AddUser";
import EditUser from "./components/dashboard/createuser/EditUser";
import AllowDomainList from "./components/dashboard/admin/AllowDomainList";
import DomainListTable from "./components/dashboard/admin/DomainListTable";
import CreateRequest from "./components/dashboard/requestlist/CreateRequest";
import ReqListTable from "./components/dashboard/requestlist/ReqListTable";
import VendorRegistration from "./components/dashboard/vendor/VendorRegistration";
import VendorListTable from "./components/dashboard/vendor/VendorListTable";
import Support from "./components/dashboard/support/Support";
import EmployeeReg from "./components/dashboard/employe/EmployeReg";
import AddEntity from "./components/dashboard/entity/AddEntity";
import Invoice from "./components/dashboard/requestlist/Invoice";
import EntityListTable from "./components/dashboard/entity/EntityListTable";
import EditEntity from "./components/dashboard/entity/EditEntity";
import EmployeListTable from "./components/dashboard/employe/EmployeListTable";
import EditEmploye from "./components/dashboard/employe/EditEmploye";
import EditVendor from "./components/dashboard/vendor/EditVendor";
import PreviewTheReq from "./components/dashboard/requestlist/PreviewTheReq";
import Approvals from "./components/dashboard/approvals/Approvals";
import EditRequestForm from "./components/dashboard/requestlist/edit/EditRequestForm";
import QuestionsDetails from "./components/questions/QuestionDetails";
import VendorPreview from "./components/dashboard/vendor/VendorPreview";
import PageNotFoundPage from "./components/404/PageNotFoundPage";
import RequestStatistcsTable from "./components/dashboard/requestlist/RequestStatistcsTable";
import PanelMembers from "./components/dashboard/panels-members/PanelMembers";
import PanelMemberTable from "./components/dashboard/panels-members/PanelMemberTable";
import EditPanelmembers from "./components/dashboard/panels-members/EditPanelmembers";
import SessionTimeoutSection from "./components/session/SessionTimeout";
import ReportPage from "./components/dashboard/report/ReportPage";
import MyRequestStatistics from "./components/dashboard/requestlist/MyRequestStatistics";
import Settings from "./components/dashboard/settings/Settings";
import GoogleSSO from "./components/dashboard/settings/integrations/GoogleSSO";
import SmtpPage from "./components/dashboard/settings/integrations/SmtpPage";
import RestApiPage from "./components/dashboard/settings/integrations/RestApiPage";
import ApprovalFlowPage from "./components/dashboard/settings/business-settings/ApprovalFlowPage";
import CurrencyPage from "./components/dashboard/settings/business-settings/CurrencyPage";
import PaymentTermsPage from "./components/dashboard/settings/business-settings/PaymentTermsPage";
import PaymentType from "./components/dashboard/settings/business-settings/PaymentType";
// import SystemLogs from "./components/dashboard/settings/logs/SystemLogs";
import ApproverType from "./components/dashboard/settings/business-settings/ApproverType";
import RoleBasedApprovals from "./components/dashboard/rolebasedapprovals/RoleBasedApprovals";
import EmployeeProfileCard from "./components/dashboard/employeeProfile/EmployeeProfileCard";
import EmailNotificationSettings from "./components/dashboard/settings/integrations/EmailNotificationSettings";
import MyAddedVendors from "./components/dashboard/reqaddnewvendor/MyAddedVendors";
import EmployeeAddedVendors from "./components/dashboard/vendor/EmployeeAddedVendors";
import ProvisonTable from "./components/dashboard/provison/ProvisonTable";
import PrepaidTable from "./components/dashboard/prepaid/PrepaidTable";
import HodApproveRequest from "./components/dashboard/requestlist/HodApproveRequest";
import UploadVendorPolicy from "./components/dashboard/settings/vendorpolicy/UploadVendorPolicy";
import UploadPOPolicy from "./components/dashboard/settings/uploadPoPolicy/UploadPoPolicy";


function App() {
  return (
    <Router>
      <Routes>

        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/req-list-table/hod-approve-request/:hodEmail/:reqId" element={<HodApproveRequest />} />
        <Route path="*" element={<PageNotFoundPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/" element={<SidebarLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employee-profile" element={<EmployeeProfileCard />} />

          <Route path="/req-list-table" element={<ReqListTable />} />
          <Route path="/req-list-table/create-request" element={<CreateRequest />} />
          <Route path="/req-list-table/create-request/:id" element={<CreateRequest />} />

          <Route path="/req-list-table/invoice/:id" element={<Invoice />} />
          <Route path="/req-list-table/preview-one-req/:id" element={<PreviewTheReq />} />


          <Route path="/req-list-table/edit-req/:id" element={<EditRequestForm />} />

          <Route path="/approval-request-list" element={<Approvals />} />
          <Route path="/role-based-approvals-list" element={<RoleBasedApprovals />} />

          <Route path="/req-list-table/show-request-statistcs/:action" element={<MyRequestStatistics />} />
          <Route path="/approval-request-list/show-request-statistcs/:action/:fromDate/:toDate" element={<RequestStatistcsTable />} />

          <Route path="/approval-request-list/preview-one-req/:id" element={<PreviewTheReq />} />

          <Route path="/panel-members-table/add-panel-members" element={<PanelMembers />} />
          <Route path="/panel-members-table" element={<PanelMemberTable />} />
          <Route path="/panel-members-table/edit-panel-members/:id" element={<EditPanelmembers />} />

          <Route path="/questions" element={<QuestionsDetails />} />

          <Route path="/users/list" element={<UserListTable />} />
          <Route path="/create-user" element={<UserRegistartion />} />
          <Route path="/users/adduser" element={<AddUser />} />
          <Route path="/users/edituser" element={<EditUser />} />

          <Route path="/entity-list-table" element={<EntityListTable />} />
          <Route path="/entity-list-table/entities" element={<AddEntity />} />
          <Route path="/entity-list-table/edit-entities/:id" element={<EditEntity />} />

          <Route path="/vendor-list-table" element={<VendorListTable />} />
          <Route path="/vendor-list-table/vendor-registration" element={<VendorRegistration />} />
          <Route path="/vendor-list-table/edit-vendor/:id" element={<EditVendor />} />
          <Route path="/vendor-list-table/get-vendor/:vendorId" element={<VendorPreview />} />
          <Route path="/vendor/my-added-vendors" element={<EmployeeAddedVendors />} />

          <Route path="/employee-list-table" element={<EmployeListTable />} />
          <Route path="/employee-list-table/employee-reg" element={<EmployeeReg />} />
          <Route path="/employee-list-table/edit-employee/:id" element={<EditEmploye />} />

          <Route path="/support" element={<Support />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/admin/domain" element={<AllowDomainList />} />
          <Route path="/admin/domain-table" element={<DomainListTable />} />
          <Route path="/genarate-report-page" element={<ReportPage />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/google-sso" element={<GoogleSSO />} />
          <Route path="/settings/smtp" element={<SmtpPage />} />
          <Route path="/settings/create-rest-api" element={<RestApiPage />} />
          <Route path="/settings/email-notification" element={<EmailNotificationSettings />} />
          <Route path="/settings/approval-flow" element={<ApprovalFlowPage />} />
          <Route path="/settings/approver-type" element={<ApproverType />} />

          <Route path="/settings/all-listed-currency" element={<CurrencyPage />} />
          <Route path="/settings/payment-terms" element={<PaymentTermsPage />} />
          <Route path="/settings/payment-type" element={<PaymentType />} />

          <Route path="/provision-table" element={<ProvisonTable />} />
          <Route path="/prepaid-table" element={<PrepaidTable />} />

          <Route path="/settings/upload-vendor-policy" element={<UploadVendorPolicy />} />
          <Route path="/settings/upload-po-policy" element={<UploadPOPolicy />} />






          {/* <Route path="/settings/system-logs" element={<SystemLogs/>} /> */}
        </Route>
      </Routes>
      <SessionTimeoutSection />
    </Router>
  );
}

export default App;
