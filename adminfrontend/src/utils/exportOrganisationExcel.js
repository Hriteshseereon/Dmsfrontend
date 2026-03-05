import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportOrganisationExcel = (org) => {

  const rows = [];

  const address = org.addresses?.[0] || {};

  (org.persons || []).forEach((p) => {

    // parse children safely
    let children = {};
    try {
      children = JSON.parse(p.family_details?.children_details || "{}");
    } catch {}

    const banks = p.bank_details?.length
      ? p.bank_details
      : [{}];

    const companies = p.company_details?.length
      ? p.company_details
      : [{}];

    banks.forEach((bank) => {
      companies.forEach((company) => {

        rows.push({
          // ========= ORG =========
          Organisation: org.registered_name,
          OrgType: org.organisation_type,
          OrgPhone: org.phone_number_1,
          OrgEmail: org.email,
          Location: org.head_office_location,

          // ========= ADDRESS =========
          Address1: address.address_line_1,
          City: address.city,
          State: address.state,
          PIN: address.pin_code,

          // ========= DIRECTOR =========
          Director: p.full_name,
          Role: p.role,
          Mobile: p.phone_number_1,
          Email: p.email,
          Gender: p.gender,
          DOB: p.date_of_birth,
          Aadhaar: p.aadhaar_no,
          PAN: p.pan_no,
          Percentage: p.percentage_of_interest,

          // ========= FAMILY =========
          Spouse: p.family_details?.spouse_name,
          Father: p.family_details?.parents_details,
          ChildrenCount: children.count,

          // ========= BANK =========
          BankName: bank.bank_name,
          AccountNumber: bank.account_number,
          IFSC: bank.ifsc_code,
          Branch: bank.branch_name,

          // ========= COMPANY =========
          CompanyName: company.company_name,
          RegistrationNo: company.registration_no,
          CompanyGST: company.gst_no,
          CompanyCity: company.address,
          CompanyState: company.location,
        });

      });
    });

  });

  // ===== CREATE SHEET =====
  const ws = XLSX.utils.json_to_sheet(rows);

  // auto column width (nice UX)
  ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Organisation Data");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer]),
    `${org.registered_name}_organisation.xlsx`
  );
};