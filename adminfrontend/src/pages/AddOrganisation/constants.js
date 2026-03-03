export const ORG_RULES = {
  PRIVATE_LIMITED: {
    roleLabel: "Director",
    idLabel: "DIN Number",
    showDIN: true,
    askCount: true,
    showPercent: true,
    company_website: true,
    showPan: true,
    showGst: true,
  },
  LLP: {
    roleLabel: "Partner",
    idLabel: "DPIN Number",
    showDIN: true,
    askCount: true,
    showPercent: true,
    company_website: true,
    showPan: true,
    showGst: true,
  },
  OPC: {
    roleLabel: "Director",
    idLabel: null,
    showDIN: false,
    askCount: false,
    showPercent: false,
    showPan: false,
    showGst: false,
  },
  Partnership: {
    roleLabel: "Partner",
    idLabel: null,
    showDIN: false,
    askCount: true,
    showPercent: true,
    company_website: true,
    showPan: true,
    showGst: true,
  },
  PROPRIETORSHIP: {
    roleLabel: "Proprietor",
    idLabel: null,
    showDIN: false,
    askCount: false,
    showPercent: false,
    showPan: true,
    showGst: true,
  },
};

export const SHOW_COMPANY_DETAILS_FOR = ["PRIVATE_LIMITED", "LLP", "Partnership"];

export const LEGAL_DOCUMENTS = [
  { key: "cin", label: "CIN", full_label: "Company Identification Number", validityRequired: false },
  { key: "pan", label: "PAN", full_label: "Permanent Account Number", validityRequired: false },
  { key: "tan", label: "TAN", full_label: "Tax Deduction and Collection Account Number", validityRequired: false },
  { key: "gst", label: "GST", full_label: "Goods and Services Tax Identification Number", validityRequired: false },
  { key: "msme", label: "MSME Udyam", full_label: "Micro, Small and Medium Enterprise", validityRequired: false },
  { key: "esi", label: "ESI", full_label: "Employee State Insurance", validityRequired: false },
  { key: "epf", label: "EPF", full_label: "Employees' Provident Fund", validityRequired: false },
  { key: "professionalTax", label: "Professional Tax", full_label: "Professional Tax Number", validityRequired: true },
  { key: "tradeLicense", label: "Trade License", full_label: "Trade License Number", validityRequired: true },
  { key: "fssai", label: "FSSAI", full_label: "Food Safety and Standards Authority of India", validityRequired: true },
  { key: "startup", label: "Startup India", full_label: "Startup India Recognition Number", validityRequired: true },
  { key: "lei", label: "LEI", full_label: "Legal Entity Identifier", validityRequired: true },
];

export const LEGAL_KEY_MAP = {
  cin: "cin_no",
  pan: "pan_no",
  tan: "tan_no",
  gst: "gst_no",
  msme: "msme_udyam_no",
  esi: "esi_no",
  epf: "epf_no",
  professionalTax: "professional_tax_no",
  tradeLicense: "trade_license_no",
  fssai: "fssai_no",
  startup: "startup_no",
  lei: "lei_no",
};

export const modulesList = [
  { id: "DMS", label: "DMS", description: "Distributed Management System" },
  { id: "AMS", label: "AMS", description: "Asset Management System" },
  { id: "WMS", label: "WMS", description: "Wealth Management System" },
];

export const STEPS = [
  { title: "Organisation", description: "Basic Details" },
  { title: "Partners/Directors", description: "Details" },
  { title: "Legal Details", description: "Documents" },
  { title: "Branch", description: "Locations" },
  { title: "Finalize", description: "Modules & Review" },
];