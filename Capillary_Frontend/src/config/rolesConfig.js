export const emailRoleMapping = {
  [import.meta.env.VITE_ADMIN_EMAIL]: "Admin",
  [import.meta.env.VITE_ACCOUNTS_EMAIL]: "Vendor Management",
  [import.meta.env.VITE_BUSINESS_FINANCE_EMAIL]: "Business Finance",
  [import.meta.env.VITE_LEGAL_TEAM_EMAIL]: "Legal Team",
  [import.meta.env.VITE_INFO_SECURITY_EMAIL]: "Info Security",
  [import.meta.env.VITE_PAYMENT_EMAIL]: "Payment",
  [import.meta.env.VITE_PO_TEAM_EMAIL]: "PO Team",
  [import.meta.env.VITE_HOD_EMAIL]: "HOD Department",
  [import.meta.env.VITE_HOF_EMAIL]: "HOF",

};

export const defaultRole = import.meta.env.VITE_DEFAULT_ROLE;
