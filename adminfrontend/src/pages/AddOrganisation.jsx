import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Upload,
  Radio,
  InputNumber,
  Divider,
  Checkbox,
  message as antMessage,
  DatePicker,
  Steps,
  Progress,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import LocationPicker from "../modules/DMS/helpers/LocationPicker.jsx";
import { useCreateOrganization } from "../queries/useCreateOrganization.js";
import { useNavigate, useParams } from "react-router-dom";
import { useGetOrganization } from "../queries/useGetOrganization.js";
import { useUpdateOrganization } from "../queries/useUpdateOrganization.js";
import dayjs from "dayjs";
import { useFormStore } from "../store/formStore.js";

const { Option } = Select;
const { TextArea } = Input;

const ORG_RULES = {
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
    roleLabel: "Director", // OPC uses Director
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

const SHOW_COMPANY_DETAILS_FOR = ["PRIVATE_LIMITED", "LLP", "Partnership"];

const modulesList = [
  { id: "DMS", label: "DMS", description: "Distributed Management System" },
  { id: "AMS", label: "AMS", description: "Asset Management System" },
  { id: "WMS", label: "WMS", description: "Wealth Management System" },
  // {
  //   id: "HRMS",
  //   label: "HRMS",
  //   description: "Human Resource Management System",
  // },
];

export default function AddOrganisation() {
  const { orgId } = useParams();
  const isEdit = Boolean(orgId);
  const { data: orgData, isLoading } = useGetOrganization(orgId);
  const { mutate: updateOrg, isPending: isUpdating } = useUpdateOrganization();
  const { mutate: createOrg, isPending: isCreating } = useCreateOrganization();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [orgType, setOrgType] = useState("");
  const [hasBranch, setHasBranch] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const rule = ORG_RULES[orgType];
  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);
  const navigate = useNavigate();

  const { createForm, values, loadValues, setValues, reset } = useFormStore();

  // validation for mobile number: starts with 6-9 and has total 10 digits
  const handleTenDigitNumber = (fieldPath) => (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    form.setFieldValue(fieldPath, value);
  };

  const hydrateDates = (data) => {
    const cloned = structuredClone(data || {});

    // ---------- Partner DOB ----------
    if (cloned.partners) {
      cloned.partners = cloned.partners.map((p) => ({
        ...p,
        dob: p?.dob ? dayjs(p.dob) : null,
      }));
    }

    // ---------- Legal Details ----------
    if (cloned.legalDetails) {
      Object.keys(cloned.legalDetails).forEach((key) => {
        const validity = cloned.legalDetails[key]?.validity;

        if (Array.isArray(validity)) {
          cloned.legalDetails[key].validity = [
            validity[0] ? dayjs(validity[0]) : null,
            validity[1] ? dayjs(validity[1]) : null,
          ];
        }
      });
    }

    // ---------- Custom Docs ----------
    if (cloned.customLegalDocs) {
      cloned.customLegalDocs = cloned.customLegalDocs.map((doc) => ({
        ...doc,
        validity: doc.validity
          ? [dayjs(doc.validity[0]), dayjs(doc.validity[1])]
          : undefined,
      }));
    }

    return cloned;
  };
  useEffect(() => {
    if (isEdit && orgData) return;
    let draftId = new URLSearchParams(window.location.search).get("draft");
    if (!draftId) {
      draftId = createForm();
    }
    const loadedValues = loadValues(draftId);
    // const formData = loadedValues.formData || {};
    // form.setFieldsValue(formData);
    const rawData = loadedValues.formData || {};
    const formData = hydrateDates(rawData);

    form.setFieldsValue(formData);
    setCurrentStep(loadedValues.currentStep || 0);
    if (formData.organisationType) {
      handleOrgTypeChange(
        formData.organisationType,
        formData.partners || [{}],
        true,
      );
    }
  }, []);

  const handlePhoneFormat = (fieldPath) => (e) => {
    let value = e.target.value;

    // allow only numbers + space + hyphen
    value = value.replace(/[^0-9+\-\s]/g, "");

    // only one "+" and only at start
    value = value.replace(/(?!^)\+/g, "");

    // optional: limit total length
    value = value.slice(0, 20);

    form.setFieldValue(fieldPath, value);
  };

  const steps = [
    { title: "Organisation", description: "Basic Details" },
    { title: "Partners/Directors", description: rule?.label || "Details" },
    { title: "Legal Details", description: "Documents" },
    { title: "Branch", description: "Locations" },
    { title: "Finalize", description: "Modules & Review" },
  ];

  // legal documents section
  const LEGAL_DOCUMENTS = [
    {
      key: "cin",
      label: "CIN",
      full_label: "Company Identification Number",
      validityRequired: false,
    },
    {
      key: "pan",
      label: "PAN",
      full_label: "Permanent Account Number",
      validityRequired: false,
    },
    {
      key: "tan",
      label: "TAN",
      full_label: "Tax Deduction and Collection Account Number",
      validityRequired: false,
    },
    {
      key: "gst",
      label: "GST",
      full_label: "Goods and Services Tax Identification Number",
      validityRequired: false,
    },
    {
      key: "msme",
      label: "MSME Udyam",
      full_label: "Micro, Small and Medium Enterprise",
      validityRequired: false,
    },
    {
      key: "esi",
      label: "ESI",
      full_label: "Employee State Insurance",
      validityRequired: false,
    },
    {
      key: "epf",
      label: "EPF",
      full_label: "Employees' Provident Fund",
      validityRequired: false,
    },
    {
      key: "professionalTax",
      label: "Professional Tax",
      full_label: "Professional Tax Number",
      validityRequired: true,
    },
    {
      key: "tradeLicense",
      label: "Trade License",
      full_label: "Trade License Number",
      validityRequired: true,
    },
    {
      key: "fssai",
      label: "FSSAI",
      full_label: "Food Safety and Standards Authority of India",
      validityRequired: true,
    },
    {
      key: "startup",
      label: "Startup India",
      full_label: "Startup India Recognition Number",
      validityRequired: true,
    },
    {
      key: "lei",
      label: "LEI",
      full_label: "Legal Entity Identifier",
      validityRequired: true,
    },
  ];

  const LEGAL_KEY_MAP = {
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

  const createExistingFile = (path) => {
    if (!path) return null;
    const fileUrl = path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_API_URL}${path}`;
    const cleanPath = path.split("?")[0].split("#")[0];
    const fileName = cleanPath.substring(cleanPath.lastIndexOf("/") + 1);
    return [
      {
        uid: fileName,
        name: fileName,
        status: "done",
        url: fileUrl,
        thumbUrl: fileUrl,
      },
    ];
  };

  // third payload to check with fields mapping while edit
  const mapOrgToForm = (org) => {
    const hqAddress = org.addresses?.find((a) => a.address_category === "HQ");

    const legal = org.legal_details ?? {};
    const selectedLegalDocs = Object.entries(LEGAL_KEY_MAP)
      .filter(([formKey, apiKey]) => legal?.[apiKey])
      .map(([formKey]) => formKey);

    const legalDetails = Object.entries(LEGAL_KEY_MAP).reduce(
      (acc, [formKey, apiKey]) => {
        acc[formKey] = {
          number: legal?.[apiKey] ?? null,
        };

        const documentKey = apiKey.replace("_no", "_document");

        if (legal?.[documentKey]) {
          acc[formKey] = {
            ...acc[formKey],
            document: createExistingFile(legal?.[documentKey]),
          };
        }

        const fromKey = apiKey.replace("_no", "_valid_from");
        const toKey = apiKey.replace("_no", "_valid_to");

        if (legal?.[fromKey] && legal?.[toKey]) {
          acc[formKey] = {
            ...acc[formKey],
            validity: [dayjs(legal[fromKey]), dayjs(legal[toKey])],
          };
        }

        return acc;
      },
      {},
    );

    return {
      // ================= ORG CORE =================
      registeredName: org.registered_name,
      organisationType: org.organisation_type,
      organisationLogo: createExistingFile(org.organisation_logo),
      phone: org.phone_number_1,
      phone2: org.phone_number_2,
      email: org.email,
      landlineNumber: org.landline_number,
      whatsappNumber: org.whatsapp_number,
      secondaryEmail: org.secondary_email,
      businessLocation: org.head_office_location,
      partnersCount: org.number_of_partners ?? org.persons?.length ?? 0,

      // ================= HQ ADDRESS =================
      organisationAddress: {
        address: hqAddress?.address_line_1,
        address2: hqAddress?.address_line_2,
        city: hqAddress?.city,
        state: hqAddress?.state,
        pin: hqAddress?.pin_code,
      },

      // ================= PERSONS =================
      partners: org.persons?.map((p) => {
        let childrenParsed = {};

        try {
          childrenParsed =
            typeof p.family_details?.children_details === "string"
              ? JSON.parse(p.family_details.children_details)
              : {};
        } catch {
          childrenParsed = {};
        }
        const sons = childrenParsed.sons ?? [];
        const daughters = childrenParsed.daughters ?? [];

        const calculatedChildrenCount = sons.length + daughters.length;
        return {
          id: p.id,
          familyId: p.family_details?.id,

          name: p.full_name,
          email: p.email,
          email2: p.secondary_email,

          adharNo: p.aadhaar_no,
          panNo: p.pan_no,
          gstNo: p.gst_no,
          dinNumber: p.din_no,
          adharDocument: createExistingFile(p.aadhaar_document),
          panDocument: createExistingFile(p.pan_document),
          gstDocument: createExistingFile(p.gst_document),
          dinDocument: createExistingFile(p.din_document),
          mobileNumber: p.phone_number_1,
          contactNumber: p.phone_number_2,
          whatsappNumber: p.whatsapp_number,
          photo: createExistingFile(p.photo),

          gender: p.gender,
          dob: p.date_of_birth ? dayjs(p.date_of_birth) : null,
          percentage: p.percentage_of_interest
            ? Number(p.percentage_of_interest)
            : null,

          fatherName: p.family_details?.parents_details,
          spouseName: p.family_details?.spouse_name,

          // ✅ CHILDREN (EDIT MODE FIX)
          childrenCount: calculatedChildrenCount,

          childrenType: [
            ...(sons.length ? ["SON"] : []),
            ...(daughters.length ? ["DAUGHTER"] : []),
          ],
          sonsCount: sons.length,
          daughtersCount: daughters.length,
          children: {
            sons: sons.map((s) => ({
              name: s.name || "",
              age: s.age || "",
            })),
            daughters: daughters.map((d) => ({
              name: d.name || "",
              age: d.age || "",
            })),
          },
          currentAddress: {
            address1: p.current_address_line_1,
            address2: p.current_address_line_2,
            city: p.current_city,
            state: p.current_state,
            pin: p.current_pin_code,
          },

          permanentAddress: {
            address1: p.permanent_address_line_1,
            address2: p.permanent_address_line_2,
            city: p.permanent_city,
            state: p.permanent_state,
            pin: p.permanent_pin_code,
          },

          bankDetails: (p.bank_details ?? []).map((b) => ({
            id: b.id,
            bankName: b.bank_name,
            accountNo: b.account_number,
            ifsc: b.ifsc_code,
            branchName: b.branch_name,
            accountType: b.account_type,
            cancelCheque: createExistingFile(b.cancel_cheque),
          })),

          companies: (p.company_details ?? []).map((c) => ({
            id: c.id,
            companyName: c.company_name,
            companyWebsite: c.website,
            registrationNo: c.registration_no,
            gstNo: c.gst_no,

            address: {
              address1: c.address,
              address2: c.location,
              city: c.city,
              state: c.state,
              pin: c.pin_code,
            },
            companyCertificate: createExistingFile(c.company_certificate),
            cinDocument: createExistingFile(c.cin_document),
            gstDocument: createExistingFile(c.gst_document),
          })),
        };
      }),

      // ================= LEGAL DETAILS =================

      selectedLegalDocs,
      legalDetails,

      // ================= BRANCHES =================
      hasBranch: org.branches?.length > 0,

      branches: org.branches?.map((b) => ({
        id: b.id, // include ID for existing branches to handle updates
        branchName: b.name,
        shortName: b.short_name,
        city: b.address?.city,
        gstin: b.gstin,
        state: b.address?.state,
        pinNo: b.address?.pin_code,
        address1: b.address?.address_line_1,
        address2: b.address?.address_line_2,
        contacts: b.contacts?.map((c) => ({
          id: c.id,
          person: c.contact_person,
          number: c.contact_number,
          email: c.email,
        })) ?? [{}],
      })),

      // ================= MODULES =================
      ...(org.modules_data ?? []).reduce((acc, m) => {
        acc[`module_${m.module}`] = m.is_enabled;
        return acc;
      }, {}),
    };
  };

  useEffect(() => {
    if (orgData && isEdit) {
      const values = mapOrgToForm(orgData);

      form.setFieldsValue(values);

      setOrgType(values.organisationType);
      setHasBranch(values.hasBranch);
      setCurrentStep(0);
    }
  }, [orgData, isEdit]);
  // ✅ Auto create director forms based on count
  useEffect(() => {
    const count = form.getFieldValue("partnersCount");

    if (!rule?.askCount) return;

    if (count && count > 0) {
      const currentPartners = form.getFieldValue("partners") || [];

      // only recreate if length different
      if (currentPartners.length !== count) {
        const arr = Array.from({ length: count }, (_, i) => {
          return currentPartners[i] || {};
        });

        form.setFieldsValue({ partners: arr });
      }
    }
  }, [form, orgType, form.getFieldValue("partnersCount")]);

  // const handleOrgTypeChange = (value, partnerList = [{}]) => {
  //   setOrgType(value);
  //   if (ORG_RULES[value].askCount) {
  //     form.setFieldsValue({ partners: [] });
  //   } else {
  //     form.setFieldsValue({ partners: partnerList });
  //   }
  // };
  const handleOrgTypeChange = (
    value,
    partnerList = null,
    isRestore = false,
  ) => {
    setOrgType(value);

    const rule = ORG_RULES[value];

    if (rule.askCount) {
      // ✅ only clear when user manually changes type
      if (!isRestore) {
        form.setFieldsValue({ partners: [] });
      }
    } else {
      form.setFieldsValue({
        partners: partnerList ?? [{}],
      });
    }
  };
  const nextStep = async () => {
    try {
      // Validate current step fields
      const fieldsToValidate = getFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      antMessage.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return [
          "registeredName",
          "phone",
          "phone2",
          "email",
          "secondaryEmail",
          ["organisationAddress", "address"],
          ["organisationAddress", "city"],
          ["organisationAddress", "state"],
          ["organisationAddress", "pin"],
          "businessLocation",
          "organisationType",
        ];
        return [];
      case 1: {
        if (!orgType) return [];

        const partners = form.getFieldValue("partners") || [];
        const count = form.getFieldValue("partnersCount");

        if (rule?.askCount && count && partners.length !== count) {
          antMessage.error(`Please fill all ${count} ${rule.label} details`);
          throw new Error("Director count mismatch");
        }
        const fields = [];

        partners.forEach((_, index) => {
          fields.push(
            ["partners", index, "name"],
            ["partners", index, "email"],
            ["partners", index, "mobileNumber"],
          );
        });

        return fields;
      }
      case 2:
        return []; // Legal details are optional
      case 3:
        return hasBranch ? ["branches"] : [];
      default:
        return [];
    }
  };

  // third build payload
  const buildPayload = (values) => {
    return {
      // ================= ORG CORE =================
      registered_name: values.registeredName ?? "",
      rms_org_id: values.rmsOrgId ?? null,

      organisation_type: values.organisationType ?? "",
      legal_type: null,

      phone_number_1: values.phone ?? "",
      phone_number_2: values.phone2 ?? null,
      landline_number: values.landlineNumber ?? null,
      whatsapp_number: values.whatsappNumber ?? null,
      email: values.email ?? "",
      secondary_email: values.secondaryEmail ?? null,

      number_of_partners: values.partnersCount ?? values.partners?.length ?? 0,

      head_office_location: values.businessLocation ?? null,

      owner: null,
      is_active: true,

      // ================= HQ ADDRESS =================
      addresses: [
        {
          address_line_1: values.organisationAddress?.address ?? "",
          address_line_2: values.organisationAddress?.address2 ?? "",
          landmark: null,
          city: values.organisationAddress?.city ?? "",
          state: values.organisationAddress?.state ?? "",
          country: "India",
          pin_code: values.organisationAddress?.pin ?? "",

          latitude: null,
          longitude: null,

          address_type: "OWN",
          address_category: "HQ",
          is_branch: false,
          agreement_document: null,
        },
      ],

      // ================= PERSONS =================
      persons: (values.partners ?? []).map((p) => ({
        id: p.id ?? undefined,
        full_name: p.name ?? "",
        role:
          values.organisationType === "PRIVATE_LIMITED"
            ? "DIRECTOR"
            : values.organisationType === "LLP" ||
                values.organisationType === "Partnership"
              ? "PARTNER"
              : "PROPRIETOR",

        phone_number_1: p.mobileNumber ?? null,
        phone_number_2: p.contactNumber ?? null,
        whatsapp_number: p.whatsappNumber ?? null,

        email: p.email ?? null,
        secondary_email: p.email2 ?? null,
        // photo: p.photo?.[0]?.originFileObj ?? null,
        aadhaar_no: p.adharNo ?? null,
        // aadhaar_document: p.adharDocument?.[0]?.originFileObj ?? null,
        pan_no: p.panNo ?? null,
        // pan_document: p.panDocument?.[0]?.originFileObj ?? null,
        gst_no: p.gstNo ?? null,
        // gst_document: p.gstDocument?.[0]?.originFileObj ?? null,
        din_no: p.dinNumber ?? null,
        gender: p.gender ?? null,
        date_of_birth: p.dob ? dayjs(p.dob).format("YYYY-MM-DD") : null,
        percentage_of_interest: p.percentage ?? null,

        current_address_line_1: p.currentAddress?.address1 ?? null,
        current_address_line_2: p.currentAddress?.address2 ?? null,
        current_city: p.currentAddress?.city ?? null,
        current_state: p.currentAddress?.state ?? null,
        current_pin_code: p.currentAddress?.pin ?? null,

        permanent_address_line_1: p.permanentAddress?.address1 ?? null,
        permanent_address_line_2: p.permanentAddress?.address2 ?? null,
        permanent_city: p.permanentAddress?.city ?? null,
        permanent_state: p.permanentAddress?.state ?? null,
        permanent_pin_code: p.permanentAddress?.pin ?? null,

        family_details: {
          spouse_name: p.spouseName ?? null,
          // children_details:
          //   p.childrenCount !== undefined ? String(p.childrenCount) : null,
          children_details: JSON.stringify({
            count:
              (p.children?.sons?.length || 0) +
              (p.children?.daughters?.length || 0),
            sons: (p.children?.sons ?? []).map((c) => ({
              name: c?.name ?? null,
              age: Number(c?.age) || null,
            })),
            daughters: (p.children?.daughters ?? []).map((c) => ({
              name: c?.name ?? null,
              age: Number(c?.age) || null,
            })),
          }),
          parents_details: p.fatherName ?? null,
        },
        bank_details: (p.bankDetails ?? []).map((b) => ({
          bank_name: b.bankName ?? null,
          account_holder_name: p.name ?? null,
          account_number: b.accountNo ?? null,
          ifsc_code: b.ifsc ?? null,
          branch_name: b.branchName ?? null,
          branch: b.branchName ?? null,
          account_type: b.accountType ?? null,
        })),
        company_details: (p.companies ?? []).map((c) => ({
          company_name: c.companyName ?? null,
          website: c.companyWebsite ?? null,
          registration_no: c.registrationNo ?? null,
          gst_no: c.gstNo ?? null,
          address: c.address?.address1 ?? null,
          location: c.address?.address2 ?? null,
          city: c.address?.city ?? null,
          state: c.address?.state ?? null,
          pin_code: c.address?.pin ?? null,
        })),
      })),

      // ================= LEGAL DETAILS =================
      legal_details: Object.entries(LEGAL_KEY_MAP).reduce(
        (acc, [formKey, apiKey]) => {
          const doc = values.legalDetails?.[formKey];

          acc[apiKey] = doc?.number ?? null;

          if (doc?.validity?.[0]) {
            acc[apiKey.replace("_no", "_valid_from")] = dayjs(
              doc.validity[0],
            ).format("YYYY-MM-DD");
          }

          if (doc?.validity?.[1]) {
            acc[apiKey.replace("_no", "_valid_to")] = dayjs(
              doc.validity[1],
            ).format("YYYY-MM-DD");
          }

          return acc;
        },
        {},
      ),

      // ================= BRANCHES =================
      branches: values.hasBranch
        ? (values.branches ?? []).map((b) => ({
            id: b.id ?? undefined,
            name: b.branchName ?? "",
            short_name: b.shortName ?? "",
            branch_head_name: null,
            phone_number_1: null,
            phone_number_2: null,
            email: null,
            gstin: b.gstin ?? null,
            type: "Main",
            contacts: (b.contacts ?? []).map((c) => ({
              id: c.id ?? undefined,
              contact_person: c.person ?? "",
              contact_number: c.number ?? "",
              email: c.email ?? null,
            })),
            address: {
              address_line_1: b.address1 ?? "",
              address_line_2: b.address2 ?? "",
              landmark: null,
              city: b.city ?? "",
              state: b.state ?? "",
              country: "India",
              pin_code: b.pinNo ?? "",

              latitude: null,
              longitude: null,

              address_type: "RENTED",
              address_category: "BRANCH",
              is_branch: true,
              agreement_document: null,
            },
          }))
        : [],

      // ================= DEPOS =================
      depos: [],

      // ================= MODULES =================
      modules_input: modulesList
        .filter((m) => values[`module_${m.id}`])
        .map((m) => m.id),
    };
  };

  const handleSubmit = () => {
    setSubmitError(null);

    const values = form.getFieldsValue(true);
    const payload = buildPayload(values);

    const formData = new FormData();

    // ✅ Append JSON payload as string
    formData.append("payload", JSON.stringify(payload));

    // =============================
    // 🔹 Append Legal Document Files
    // =============================
    Object.entries(values.legalDetails || {}).forEach(([key, doc]) => {
      const fieldName = `legal_details.${LEGAL_KEY_MAP[key].replace("_no", "_document")}`;

      if (doc?.document?.[0]?.originFileObj) {
        // new file selected
        formData.append(fieldName, doc.document[0].originFileObj);
      } else if (!doc?.document?.[0]?.url) {
        // no file & no existing URL (we have deleted the file)
        formData.append(fieldName, null);
      }
    });

    // =============================
    // 🔹 Append Person Files
    // =============================
    (values.partners || []).forEach((person, index) => {
      const appendFile = (fieldKey, fileObj) => {
        const fieldName = `persons.${index}.${fieldKey}`;
        if (fileObj?.[0]?.originFileObj) {
          // new file selected
          formData.append(fieldName, fileObj[0].originFileObj);
        } else if (!fileObj?.[0]?.url) {
          // no file at all
          formData.append(fieldName, null);
        }
      };

      appendFile("pan_document", person?.panDocument);
      appendFile("aadhaar_document", person?.adharDocument);
      appendFile("gst_document", person?.gstDocument);
      appendFile("din_document", person?.dinDocument);
      appendFile("photo", person?.photo);
      // appendFile("company_certificate", person?.companyCertificate);
      const appendNestedFile = (path, fileObj) => {
        if (fileObj?.[0]?.originFileObj) {
          formData.append(path, fileObj[0].originFileObj);
        } else if (!fileObj?.[0]?.url) {
          formData.append(path, null);
        }
      };
      // file for handle the company logo
      if (values.organisationLogo?.[0]?.originFileObj) {
        formData.append(
          "organisation_logo",
          values.organisationLogo[0].originFileObj,
        );
      }
      appendNestedFile(
        `persons.${index}.company_details.company_certificate`,
        person?.companyCertificate,
      );
      (person.companies || []).forEach((c, companyIndex) => {
        appendNestedFile(
          `persons.${index}.company_details.${companyIndex}.cin_document`,
          c?.cinDocument,
        );

        appendNestedFile(
          `persons.${index}.company_details.${companyIndex}.gst_document`,
          c?.gstDocument,
        );
      });
      (person.bankDetails || []).forEach((b, bankIndex) => {
        appendNestedFile(
          `persons.${index}.bank_details.${bankIndex}.cancel_cheque`,
          b?.cancelCheque,
        );
      });
    });

    if (isEdit) {
      updateOrg(
        { id: orgId, data: formData },
        {
          onSuccess: () => {
            antMessage.success("Organisation updated successfully");
            navigate("/organizations");
          },
          onError: (error) => {
            antMessage.error("Failed to update organisation");
            console.error("Update Organization Error:", error);
          },
        },
      );
    } else {
      createOrg(formData, {
        onSuccess: () => {
          reset(); // resetting form store after successful creation
          antMessage.success("Organisation created successfully");
          navigate("/organizations");
        },
        onError: (error) => {
          antMessage.error("Failed to create organisation");
          console.error("Create Organisation Error:", error);
        },
      });
    }
  };

  // const handleSubmit = () => {
  //   setSubmitError(null);

  //   const values = form.getFieldsValue(true);

  //   const jsonPayload = buildPayload(values); // WITHOUT files

  //   const formData = new FormData();

  //   // ✅ Append JSON payload as string
  //   formData.append("payload", JSON.stringify(jsonPayload));

  //   // =============================
  //   // 🔹 Append Legal Document Files
  //   // =============================
  //   Object.entries(values.legalDetails || {}).forEach(([key, doc]) => {
  //     if (doc?.document?.[0]?.originFileObj) {
  //       formData.append(
  //         `legal_details.${LEGAL_KEY_MAP[key].replace("_no", "_document")}`,
  //         doc.document[0].originFileObj,
  //       );
  //     }
  //   });

  //   // =============================
  //   // 🔹 Append Person Files
  //   // =============================
  //   (values.partners || []).forEach((person, index) => {
  //     if (person?.panDocument?.[0]?.originFileObj) {
  //       formData.append(
  //         `persons.${index}.pan_document`,
  //         person.panDocument[0].originFileObj,
  //       );
  //     }

  //     if (person?.adharDocument?.[0]?.originFileObj) {
  //       formData.append(
  //         `persons.${index}.aadhaar_document`,
  //         person.adharDocument[0].originFileObj,
  //       );
  //     }

  //     if (person?.gstDocument?.[0]?.originFileObj) {
  //       formData.append(
  //         `persons.${index}.gst_document`,
  //         person.gstDocument[0].originFileObj,
  //       );
  //     }

  //     if (person?.photo?.[0]?.originFileObj) {
  //       formData.append(
  //         `persons.${index}.photo`,
  //         person.photo[0].originFileObj,
  //       );
  //     }
  //   });

  //   // =============================
  //   // 🚀 Send request
  //   // =============================
  //   createOrg(formData, {
  //     onSuccess: () => {
  //       antMessage.success("Organisation created successfully");
  //       navigate("/organizations");
  //     },
  //     onError: (error) => {
  //       antMessage.error("Failed to create organisation");
  //       console.error("Create Organisation Error:", error);
  //     },
  //   });
  // };

  const handleBack = () => {
    window.history.back();
  };

  const handlePreview = async (file) => {
    let fileURL = file.url || URL.createObjectURL(file.originFileObj);

    if (fileURL) {
      window.open(fileURL, "_blank");
    }
  };

  const handleFormValueChange = async () => {
    const allValues = form.getFieldsValue(true);
    setValues({ currentStep, formData: allValues });
  };

  // Step 0: Organisation Details
  const renderOrganisationDetails = () => (
    <>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Registered Name"
            name="registeredName"
            rules={[
              { required: true, message: "Please enter registered name" },
            ]}
          >
            <Input placeholder="Enter registered name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Organisation Logo"
            name="organisationLogo"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              onPreview={handlePreview}
            >
              <Button icon={<UploadOutlined />}>Upload Logo</Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Address Line 1"
            name={["organisationAddress", "address"]}
            rules={[{ required: true, message: "Enter address" }]}
          >
            <Input placeholder="Address line" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Address Line 2"
            name={["organisationAddress", "address2"]}
          >
            <Input placeholder="Address line" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="City"
            name={["organisationAddress", "city"]}
            rules={[{ required: true, message: "Enter city" }]}
          >
            <Input placeholder="City" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Form.Item
            label="State"
            name={["organisationAddress", "state"]}
            rules={[
              { required: true, message: "Enter state" },
              {
                pattern: /^[A-Za-z\s]+$/,
                message: "Only alphabets are allowed",
              },
            ]}
          >
            <Input
              placeholder="State"
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                form.setFieldsValue({
                  organisationAddress: {
                    ...form.getFieldValue("organisationAddress"),
                    state: value,
                  },
                });
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Form.Item
            label="PIN Code"
            name={["organisationAddress", "pin"]}
            rules={[
              { required: true, message: "Enter PIN" },
              {
                pattern: /^[0-9]{6}$/,
                message: "Only numbers are allowed",
              },
            ]}
          >
            <Input placeholder="PIN" maxLength={6} inputMode="numeric" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^\+?[0-9\s-]{8,20}$/,
                message: "Invalid phone format",
              },
            ]}
          >
            <Input
              placeholder="Enter phone number"
              maxLength={15}
              onChange={handlePhoneFormat("phone")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Alternate Phone Number"
            name="phone2"
            rules={[
              {
                pattern: /^\+?[0-9\s-]{8,20}$/,
                message: "Invalid phone format",
              },
            ]}
          >
            <Input
              placeholder="Enter phone number"
              maxLength={15}
              inputMode="numeric"
              onChange={handlePhoneFormat("phone2")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Landline Number"
            name="landlineNumber"
            rules={[
              { message: "Please enter landline number" },
              {
                pattern: /^[0-9]{2,4}-[0-9]{6,8}$/,
                message: "Enter a valid landline number (e.g. 044-12345678)",
              },
            ]}
          >
            <Input placeholder="e.g. 044-12345678" maxLength={15} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="WhatsApp Number"
            name="whatsappNumber"
            rules={[
              { message: "Please enter WhatsApp number" },
              {
                pattern: /^\+?[0-9\s-]{8,20}$/,
                message: "Invalid phone format",
              },
            ]}
          >
            <Input
              placeholder="Enter WhatsApp number"
              maxLength={15}
              onChange={handlePhoneFormat("whatsappNumber")}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Secondary Email"
            name="secondaryEmail"
            rules={[
              { message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Head Office Location"
            name="businessLocation"
            rules={[{ message: "Please select location" }]}
          >
            {/* <LocationPicker /> */}
            <Input placeholder="Enter location" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Organisation Type"
            name="organisationType"
            rules={[
              { required: true, message: "Please select organisation type" },
            ]}
          >
            <Select
              placeholder="Select organisation type"
              onChange={handleOrgTypeChange}
            >
              <Option value="PRIVATE_LIMITED">Private Limited (Pvt Ltd)</Option>
              <Option value="LLP">LLP</Option>
              <Option value="OPC">OPC</Option>
              <Option value="Partnership">Partnership</Option>
              <Option value="PROPRIETORSHIP">Proprietor</Option>
            </Select>
          </Form.Item>
        </Col>
        {rule?.askCount && (
          <Col md={6}>
            <Form.Item
              label={`Number of ${rule.roleLabel}s`}
              name="partnersCount"
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder={`Enter number of ${rule.roleLabel}s (optional)`}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </>
  );

  // Step 1: Partner/Director Details
  const renderPartnerDetails = () => {
    if (!orgType) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#999", fontSize: "16px" }}>
            Please select an organisation type in the previous step
          </p>
        </div>
      );
    }

    return (
      <Form.List name="partners" initialValue={rule?.askCount ? [] : [{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16, border: "1px solid #fef3c7" }}
                title={`${rule.roleLabel} ${name + 1}`}
                // extra={
                //   rule.askCount &&
                //   fields.length > 1 && (
                //     <MinusCircleOutlined
                //       onClick={() => remove(name)}
                //       style={{ color: "#ef4444", cursor: "pointer" }}
                //     />
                //   )
                // }
              >
                <Divider
                  orientation="left"
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                    marginTop: 0,
                  }}
                >
                  {rule.roleLabel} Personal Details
                </Divider>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label={`${rule.roleLabel} Name`}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Please enter name" }]}
                    >
                      <Input placeholder="Enter name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Email"
                      name={[name, "email"]}
                      rules={[
                        {
                          required: true,
                          type: "email",
                          message: "Invalid email",
                        },
                      ]}
                    >
                      <Input placeholder="Enter email" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Secondary Email"
                      name={[name, "email2"]}
                      rules={[{ type: "email", message: "Invalid email" }]}
                    >
                      <Input placeholder="Enter secondary email" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Mobile Number"
                      name={[name, "mobileNumber"]}
                      rules={[
                        {
                          required: true,
                          message: "Please enter mobile number",
                        },

                        {
                          pattern: /^\+?[0-9\s-]{8,20}$/,
                          message: "Invalid phone format",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter mobile number"
                        maxLength={15}
                        inputMode="numeric"
                        onChange={handlePhoneFormat([
                          "partners",
                          name,
                          "mobileNumber",
                        ])}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Alternative Number"
                      name={[name, "contactNumber"]}
                      rules={[
                        {
                          pattern: /^\+?[0-9\s-]{8,20}$/,
                          message: "Invalid phone format",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter contact number"
                        maxLength={15}
                        inputMode="numeric"
                        onChange={handlePhoneFormat([
                          "partners",
                          name,
                          "contactNumber",
                        ])}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="WhatsApp Number"
                      name={[name, "whatsappNumber"]}
                      rules={[
                        {
                          pattern: /^\+?[0-9\s-]{8,20}$/,
                          message: "Invalid phone format",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter WhatsApp number"
                        maxLength={15}
                        inputMode="numeric"
                        onChange={handlePhoneFormat([
                          "partners",
                          name,
                          "whatsappNumber",
                        ])}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Gender"
                      name={[name, "gender"]}
                    >
                      <Radio.Group>
                        <Radio value="Male">Male</Radio>
                        <Radio value="Female">Female</Radio>
                        <Radio value="Other">Other</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Date of Birth"
                      name={[name, "dob"]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Select DOB"
                        format="DD-MM-YYYY"
                      />
                    </Form.Item>
                  </Col>

                  {rule.showPercent && (
                    <Col xs={24} sm={12} md={3}>
                      <Form.Item
                        {...restField}
                        label="% of Interest"
                        name={[name, "percentage"]}
                        rules={[
                          {
                            pattern: /^[0-9]*$/,
                            message: "Only numbers are allowed",
                          },
                        ]}
                      >
                        <Input
                          min={0}
                          max={100}
                          style={{ width: "100%" }}
                          placeholder="Enter percentage"
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Father Name"
                      name={[name, "fatherName"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z\s]+$/,
                          message: "Only letters are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="Enter father name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Spouse Name"
                      name={[name, "spouseName"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z\s]+$/,
                          message: "Only letters are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="Enter spouse name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={3}>
                    <Form.Item label="No of Sons" name={[name, "sonsCount"]}>
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={3}>
                    <Form.Item
                      label="No of Daughters"
                      name={[name, "daughtersCount"]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => {
                      const sons =
                        getFieldValue(["partners", name, "sonsCount"]) || 0;

                      const daughters =
                        getFieldValue(["partners", name, "daughtersCount"]) ||
                        0;

                      return (
                        <>
                          {/* SON SECTION */}
                          {sons > 0 && (
                            <Card title="Son Details">
                              {Array.from({ length: sons }).map((_, i) => (
                                <Row key={i}>
                                  <Form.Item
                                    name={[name, "children", "sons", i, "name"]}
                                    label="Name"
                                  >
                                    <Input />
                                  </Form.Item>

                                  <Form.Item
                                    name={[name, "children", "sons", i, "age"]}
                                    label="Age"
                                  >
                                    <Input />
                                  </Form.Item>
                                </Row>
                              ))}
                            </Card>
                          )}

                          {/* DAUGHTER SECTION */}
                          {daughters > 0 && (
                            <Card title="Daughter Details">
                              {Array.from({ length: daughters }).map((_, i) => (
                                <Row key={i}>
                                  <Form.Item
                                    name={[
                                      name,
                                      "children",
                                      "daughters",
                                      i,
                                      "name",
                                    ]}
                                    label="Name"
                                  >
                                    <Input />
                                  </Form.Item>

                                  <Form.Item
                                    name={[
                                      name,
                                      "children",
                                      "daughters",
                                      i,
                                      "age",
                                    ]}
                                    label="Age"
                                  >
                                    <Input />
                                  </Form.Item>
                                </Row>
                              ))}
                            </Card>
                          )}
                        </>
                      );
                    }}
                  </Form.Item>
                  <Divider
                    orientation="left"
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      marginTop: 0,
                    }}
                  >
                    {rule.roleLabel} Address
                  </Divider>
                  <Col xs={24}>
                    <Divider orientation="left" plain>
                      Current Address
                    </Divider>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line1"
                      name={[name, "currentAddress", "address1"]}
                    >
                      <Input placeholder="Address line1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line2"
                      name={[name, "currentAddress", "address2"]}
                    >
                      <Input placeholder="Address line2" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="City"
                      name={[name, "currentAddress", "city"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z\s]+$/,
                          message: "Only letters are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="City" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="State"
                      name={[name, "currentAddress", "state"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z\s]+$/,
                          message: "Only letters are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="PIN"
                      name={[name, "currentAddress", "pin"]}
                      rules={[
                        {
                          pattern: /^[0-9]*$/,
                          message: "Only numbers are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="PIN" maxLength={6} />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Divider orientation="left" plain>
                      Permanent Address
                    </Divider>
                    <Form.Item
                      {...restField}
                      name={[name, "isPermanentAddressSame"]}
                      valuePropName="checked"
                    >
                      <Checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            const currentAddress = form.getFieldValue([
                              "partners",
                              name,
                              "currentAddress",
                            ]);
                            form.setFieldsValue({
                              partners: {
                                [name]: {
                                  permanentAddress: currentAddress || {},
                                },
                              },
                            });
                          } else {
                            form.setFieldsValue({
                              partners: {
                                [name]: {
                                  permanentAddress: {},
                                },
                              },
                            });
                          }
                        }}
                      >
                        {" "}
                        Same as Current Address{" "}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line1"
                      name={[name, "permanentAddress", "address1"]}
                    >
                      <Input placeholder="Address line1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line2"
                      name={[name, "permanentAddress", "address2"]}
                    >
                      <Input placeholder="Address line2" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="City"
                      name={[name, "permanentAddress", "city"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z\s]+$/,
                          message: "Only letters are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="City" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="State"
                      name={[name, "permanentAddress", "state"]}
                      rules={[
                        {
                          pattern: /^[A-Za-z\s]+$/,
                          message: "Only letters are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="PIN"
                      name={[name, "permanentAddress", "pin"]}
                      rules={[
                        {
                          pattern: /^[0-9]*$/,
                          message: "Only numbers are allowed",
                        },
                      ]}
                    >
                      <Input placeholder="PIN" maxLength={6} />
                    </Form.Item>
                  </Col>
                  <Divider
                    orientation="left"
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      marginTop: 0,
                    }}
                  >
                    {rule.roleLabel} Documents
                  </Divider>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        label={<span>Passport Size Photo</span>}
                        name={[name, "photo"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          beforeUpload={() => false}
                          onPreview={handlePreview}
                          listType="picture"
                          maxCount={1}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            style={{ borderRadius: "6px" }}
                          >
                            Upload Photo
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={<span s>Aadhaar Number</span>}
                        name={[name, "adharNo"]}
                        rules={[
                          {
                            pattern: /^[0-9]{12}$/,
                            message: "Enter a valid 12-digit Aadhaar number",
                          },
                        ]}
                      >
                        <Input
                          placeholder="1234 5678 9012"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Form.Item
                        {...restField}
                        label={<span>Aadhaar Document</span>}
                        name={[name, "adharDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          beforeUpload={() => false}
                          onPreview={handlePreview}
                        >
                          <Button style={{ borderRadius: "6px" }}>
                            Upload Aadhaar
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    {rule.showPan && (
                      <>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="PAN Number"
                            name={[name, "panNo"]}
                          >
                            <Input placeholder="ABCDE1234F" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="PAN Document"
                            name={[name, "panDocument"]}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                          >
                            <Upload
                              beforeUpload={() => false}
                              onPreview={handlePreview}
                            >
                              <Button>Upload PAN</Button>
                            </Upload>
                          </Form.Item>
                        </Col>
                      </>
                    )}

                    {rule.showGst && (
                      <>
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label="GST Number"
                            name={[name, "gstNo"]}
                          >
                            <Input placeholder="22AAAAA0000A1Z5" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={3}>
                          <Form.Item
                            {...restField}
                            label="GST Document"
                            name={[name, "gstDocument"]}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                          >
                            <Upload
                              beforeUpload={() => false}
                              onPreview={handlePreview}
                            >
                              <Button>Upload GST</Button>
                            </Upload>
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    {rule.showDIN && (
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          {...restField}
                          label={rule.idLabel}
                          name={[name, "dinNumber"]}
                        >
                          <Input
                            placeholder={`Enter ${rule.idLabel}`}
                            style={{ borderRadius: "6px" }}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {rule.showDIN && (
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          {...restField}
                          label={`${rule.idLabel} Document`}
                          name={[name, "dinDocument"]}
                          valuePropName="fileList"
                          getValueFromEvent={normFile}
                        >
                          <Upload
                            beforeUpload={() => false}
                            onPreview={handlePreview}
                          >
                            <Button>Upload {rule.idLabel}</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  <Form.List name={[name, "bankDetails"]} initialValue={[{}]}>
                    {(fields, { add, remove }) => (
                      <>
                        {/* Custom Divider Row with Add Button */}
                        <Row
                          justify="space-between"
                          align="middle"
                          style={{ marginBottom: 16 }}
                        >
                          <Divider
                            orientation="left"
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "#374151",
                              margin: 0,
                              flex: 1,
                            }}
                          >
                            Bank Details
                          </Divider>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            icon={<PlusOutlined />}
                            style={{ marginLeft: 1020, flexShrink: 0 }}
                            className="!bg-amber-500 hover:!bg-amber-600 !border-none !text-white"
                          >
                            Add Bank
                          </Button>
                        </Row>

                        {fields.map(
                          ({ key, name: bankIndex, ...restField }) => (
                            <Card
                              key={key}
                              size="small"
                              style={{ marginBottom: 12 }}
                              extra={
                                <MinusCircleOutlined
                                  onClick={() => remove(bankIndex)}
                                />
                              }
                            >
                              <Row gutter={[50, 16]}>
                                <Col xs={12} sm={8} md={4}>
                                  <Form.Item
                                    {...restField}
                                    label={<span>Bank Name</span>}
                                    name={[bankIndex, "bankName"]}
                                    rules={[
                                      {
                                        pattern: /^[A-Za-z\s]+$/,
                                        message: "Only letters are allowed",
                                      },
                                    ]}
                                  >
                                    <Input
                                      placeholder="Enter bank name"
                                      style={{ borderRadius: "6px" }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={4}>
                                  <Form.Item
                                    {...restField}
                                    label={<span>Branch Name</span>}
                                    name={[bankIndex, "branchName"]}
                                  >
                                    <Input
                                      placeholder="Enter branch name"
                                      style={{ borderRadius: "6px" }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={4}>
                                  <Form.Item
                                    {...restField}
                                    label={<span>Type of Account</span>}
                                    name={[bankIndex, "accountType"]}
                                  >
                                    <Input
                                      placeholder="Enter account type"
                                      style={{ borderRadius: "6px" }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={4}>
                                  <Form.Item
                                    {...restField}
                                    label={<span>Account Number</span>}
                                    name={[bankIndex, "accountNo"]}
                                    rules={[
                                      {
                                        pattern: /^[0-9]*$/,
                                        message: "Only numbers are allowed",
                                      },
                                    ]}
                                  >
                                    <Input
                                      placeholder="Enter account number"
                                      style={{ borderRadius: "6px" }}
                                    />
                                  </Form.Item>
                                </Col>

                                <Col xs={12} sm={8} md={4}>
                                  <Form.Item
                                    {...restField}
                                    label={<span>IFSC Code</span>}
                                    name={[bankIndex, "ifsc"]}
                                  >
                                    <Input
                                      placeholder="SBIN0001234"
                                      style={{ borderRadius: "6px" }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={4}>
                                  <Form.Item
                                    label="Cancel Cheque"
                                    name={[bankIndex, "cancelCheque"]}
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                  >
                                    <Upload beforeUpload={() => false}>
                                      <Button>Upload Cheque</Button>
                                    </Upload>
                                  </Form.Item>
                                </Col>
                              </Row>
                            </Card>
                          ),
                        )}
                      </>
                    )}
                  </Form.List>
                  {SHOW_COMPANY_DETAILS_FOR.includes(orgType) && (
                    <>
                      <Form.List name={[name, "companies"]}>
                        {(fields, { add, remove }) => (
                          <>
                            <Row
                              justify="space-between"
                              align="middle"
                              style={{ marginBottom: 16 }}
                            >
                              <Divider
                                orientation="left"
                                style={{
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  color: "#374151",
                                  margin: 0,
                                  flex: 1,
                                }}
                              >
                                {rule.roleLabel} Associate Company Details
                              </Divider>
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                style={{ marginLeft: 1020, flexShrink: 0 }}
                                className="!bg-amber-500 hover:!bg-amber-600 !border-none !text-white"
                              >
                                Add Company
                              </Button>
                            </Row>
                            {fields.map(
                              ({ key, name: compIndex, ...restField }) => (
                                <Card
                                  key={key}
                                  size="small"
                                  extra={
                                    <MinusCircleOutlined
                                      onClick={() => remove(compIndex)}
                                    />
                                  }
                                >
                                  <Row gutter={[16, 16]}>
                                    {/* <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            label={<span>Company Certificate</span>}
                            name={[name, "companyCertificate"]}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                          >
                            <Upload
                              beforeUpload={() => false}
                              onPreview={handlePreview}
                              maxCount={1}
                            >
                              <Button
                                icon={<UploadOutlined />}
                                style={{ borderRadius: "6px" }}
                              >
                                Upload Certificate
                              </Button>
                            </Upload>
                          </Form.Item>
                        </Col> */}

                                    <Col xs={24} sm={12} md={6}>
                                      <Form.Item
                                        {...restField}
                                        label={<span>Company Name</span>}
                                        name={[compIndex, "companyName"]}
                                      >
                                        <Input
                                          placeholder="Enter company name"
                                          style={{ borderRadius: "6px" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label="Address Line 1"
                                        name={[
                                          compIndex,
                                          "address",
                                          "address1",
                                        ]}
                                      >
                                        <Input placeholder="Address line 1" />
                                      </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label="Address Line 2"
                                        name={[
                                          compIndex,
                                          "address",
                                          "address2",
                                        ]}
                                      >
                                        <Input placeholder="Address line 2" />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label={<span>City</span>}
                                        name={[compIndex, "address", "city"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Please enter city",
                                          },
                                          {
                                            pattern: /^[A-Za-z\s]+$/,
                                            message:
                                              "Only alphabets are allowed",
                                          },
                                        ]}
                                      >
                                        <Input
                                          placeholder="Enter city"
                                          style={{ borderRadius: "6px" }}
                                          onChange={(e) => {
                                            e.target.value =
                                              e.target.value.replace(
                                                /[^A-Za-z\s]/g,
                                                "",
                                              );
                                          }}
                                        />
                                      </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label={<span>State</span>}
                                        name={[compIndex, "address", "state"]}
                                        rules={[
                                          {
                                            pattern: /^[A-Za-z\s]+$/,
                                            message: "Only letters are allowed",
                                          },
                                        ]}
                                      >
                                        <Input
                                          placeholder="Enter state"
                                          style={{ borderRadius: "6px" }}
                                          onChange={(e) => {
                                            const value =
                                              e.target.value.replace(
                                                /[^A-Za-z\s]/g,
                                                "",
                                              );
                                            form.setFieldsValue({
                                              partners: {
                                                [name]: {
                                                  companyDetails: {
                                                    ...form.getFieldValue([
                                                      "partners",
                                                      name,
                                                      "companyDetails",
                                                    ]),
                                                    address: {
                                                      ...form.getFieldValue([
                                                        "partners",
                                                        name,
                                                        "companyDetails",
                                                        "address",
                                                      ]),
                                                      state: value,
                                                    },
                                                  },
                                                },
                                              },
                                            });
                                          }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    {rule.company_website && (
                                      <Col xs={24} sm={6}>
                                        <Form.Item
                                          {...restField}
                                          label={
                                            <span
                                              style={{
                                                fontSize: "14px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              Company Website
                                            </span>
                                          }
                                          name={[compIndex, "companyWebsite"]}
                                        >
                                          <Input
                                            placeholder="https://www.example.com"
                                            style={{ borderRadius: "6px" }}
                                          />
                                        </Form.Item>
                                      </Col>
                                    )}
                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label={<span>PIN Code</span>}
                                        name={[compIndex, "address", "pin"]}
                                        rules={[
                                          {
                                            pattern: /^[0-9]{6}$/,
                                            message:
                                              "Enter a valid 6-digit PIN code",
                                          },
                                        ]}
                                      >
                                        <Input
                                          maxLength={6}
                                          placeholder="123456"
                                          style={{ borderRadius: "6px" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label={<span>CIN Number</span>}
                                        name={[compIndex, "registrationNo"]}
                                      >
                                        <Input
                                          placeholder="Enter registration number"
                                          style={{ borderRadius: "6px" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={3}>
                                      <Form.Item
                                        {...restField}
                                        name={[compIndex, "cinDocument"]}
                                        label="CIN Document"
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                      >
                                        <Upload beforeUpload={() => false}>
                                          <Button>Upload CIN</Button>
                                        </Upload>
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={4}>
                                      <Form.Item
                                        {...restField}
                                        label={<span>Company GST Number</span>}
                                        name={[compIndex, "gstNo"]}
                                      >
                                        <Input
                                          placeholder="22AAAAA0000A1Z5"
                                          style={{ borderRadius: "6px" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={3}>
                                      <Form.Item
                                        {...restField}
                                        name={[compIndex, "gstDocument"]}
                                        label="GST Document"
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                      >
                                        <Upload beforeUpload={() => false}>
                                          <Button>Upload GST</Button>
                                        </Upload>
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </Card>
                              ),
                            )}
                          </>
                        )}
                      </Form.List>
                    </>
                  )}
                </Row>
              </Card>
            ))}
            {rule.askCount &&
              (() => {
                const requiredCount = form.getFieldValue("partnersCount") || 0;

                return fields.length < requiredCount ? (
                  <Button
                    type="dashed"
                    onClick={() => add({})}
                    icon={<PlusOutlined />}
                    block
                  >
                    Add {rule.label}
                  </Button>
                ) : null;
              })()}
          </>
        )}
      </Form.List>
    );
  };

  // Step 2: Legal Details
  const renderLegalDetails = () => (
    <>
      <Form.Item label="Select Legal Documents" name="selectedLegalDocs">
        <Checkbox.Group style={{ width: "100%" }}>
          <Row gutter={[16, 8]}>
            {LEGAL_DOCUMENTS.map((doc) => (
              <Col xs={24} sm={12} md={4} key={doc.key}>
                <Checkbox value={doc.key}>{doc.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Form.Item>
      {/* add more document section add */}
      <Divider orientation="left">Other / Custom Documents</Divider>

      <Form.List name="customLegalDocs">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16, background: "#fffbeb" }}
                title={`Custom Document ${name + 1}`}
                extra={
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{ color: "#ef4444", cursor: "pointer" }}
                  />
                }
              >
                <Row gutter={[16, 8]}>
                  {/* Document Name */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Document Name"
                      name={[name, "name"]}
                      rules={[{ message: "Enter document name" }]}
                    >
                      <Input placeholder="e.g. Fire Safety Certificate" />
                    </Form.Item>
                  </Col>

                  {/* Document Number */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Document Number"
                      name={[name, "number"]}
                    >
                      <Input placeholder="Enter document number" />
                    </Form.Item>
                  </Col>

                  {/* Upload */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Upload Document"
                      name={[name, "document"]}
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={() => false}
                        onPreview={handlePreview}
                      >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  {/* Validity */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Validity Period"
                      name={[name, "validity"]}
                    >
                      <DatePicker.RangePicker
                        style={{ width: "100%" }}
                        format="DD-MM-YYYY"
                        placeholder={["DD-MM-YYYY", "DD-MM-YYYY"]}
                        inputReadOnly={false}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}

            {/* ➕ ADD MORE BUTTON */}
            <Button
              type="dashed"
              onClick={() => add({})}
              icon={<PlusOutlined />}
              block
            >
              Add More Document
            </Button>
          </>
        )}
      </Form.List>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.selectedLegalDocs !== curr.selectedLegalDocs
        }
      >
        {({ getFieldValue }) => {
          const selected = getFieldValue("selectedLegalDocs") || [];

          return selected.map((docKey) => {
            const doc = LEGAL_DOCUMENTS.find((d) => d.key === docKey);
            if (!doc) return null;

            return (
              <Card
                key={doc.key}
                size="small"
                style={{ marginBottom: 16, background: "#fffbeb" }}
                title={`${doc.label} ${doc.full_label ? `(${doc.full_label})` : ""}`}
              >
                <Row gutter={[16, 8]}>
                  {/* Document Number */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={`${doc.label} Number`}
                      name={["legalDetails", doc.key, "number"]}
                    >
                      <Input placeholder={`Enter ${doc.label} number`} />
                    </Form.Item>
                  </Col>

                  {/* Upload */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={`${doc.label} Document`}
                      name={["legalDetails", doc.key, "document"]}
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={() => false}
                        onPreview={handlePreview}
                      >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  {/* Validity – ONLY if Excel says Y */}
                  {doc.validityRequired && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Validity Period"
                        name={["legalDetails", doc.key, "validity"]}
                      >
                        <DatePicker.RangePicker
                          style={{ width: "100%" }}
                          format="DD-MM-YYYY"
                          placeholder={["DD-MM-YYYY", "DD-MM-YYYY"]}
                          inputReadOnly={false}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Card>
            );
          });
        }}
      </Form.Item>
    </>
  );

  // Step 3: Branch Details
  const renderBranchDetails = () => (
    <>
      <Form.Item
        label="Is company associated with branch?"
        name="hasBranch"
        rules={[{ required: true, message: "Please select an option" }]}
      >
        <Radio.Group onChange={(e) => setHasBranch(e.target.value)}>
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.hasBranch !== curr.hasBranch}
      >
        {({ getFieldValue }) =>
          getFieldValue("hasBranch") ? (
            <Form.List name="branches" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{
                        marginBottom: 16,
                        background: "#fffbeb",
                        border: "1px solid #fef3c7",
                      }}
                      title={`Branch ${name + 1}`}
                      extra={
                        fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            style={{ color: "#ef4444", cursor: "pointer" }}
                          />
                        )
                      }
                    >
                      <Row gutter={[16, 8]}>
                        <Col xs={12} sm={6} md={4}>
                          <Form.Item
                            {...restField}
                            label="Short Name"
                            name={[name, "shortName"]}
                            rules={[{ max: 5, message: "Max 5 chars" }]}
                          >
                            <Input placeholder="5 chars" maxLength={5} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="Branch Name"
                            name={[name, "branchName"]}
                          >
                            <Input placeholder="Branch name" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="City"
                            name={[name, "city"]}
                          >
                            <Input placeholder="City" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="State"
                            name={[name, "state"]}
                          >
                            <Input placeholder="State" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="PIN No"
                            name={[name, "pinNo"]}
                          >
                            <Input placeholder="PIN" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item
                            {...restField}
                            label="Address Line 1"
                            name={[name, "address1"]}
                          >
                            <Input placeholder="Address 1" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item
                            {...restField}
                            label="Address Line 2"
                            name={[name, "address2"]}
                          >
                            <Input placeholder="Address 2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item
                            {...restField}
                            label="Branch GSTIN"
                            name={[name, "gstin"]}
                          >
                            <Input placeholder="GSTIN" />
                          </Form.Item>
                        </Col>

                        <Col xs={24}>
                          <Divider orientation="left" plain>
                            Branch Contact Details
                          </Divider>
                          <Form.List
                            name={[name, "contacts"]}
                            initialValue={[{}]}
                          >
                            {(
                              contactFields,
                              { add: addContact, remove: removeContact },
                            ) => (
                              <>
                                {contactFields.map(
                                  ({
                                    key: cKey,
                                    name: cName,
                                    ...cRestField
                                  }) => (
                                    <Row
                                      key={cKey}
                                      gutter={8}
                                      align="middle"
                                      style={{ marginBottom: 8 }}
                                    >
                                      <Col xs={24} sm={8}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Contact Person"
                                          name={[cName, "person"]}
                                          rules={[
                                            {
                                              pattern: /^[A-Za-z\s]+$/,
                                              message:
                                                "Only letters are allowed",
                                            },
                                          ]}
                                        >
                                          <Input
                                            placeholder="Contact person"
                                            size="small"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={12} sm={7}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Contact No"
                                          name={[cName, "number"]}
                                          rules={[
                                            {
                                              pattern: /^\+?[0-9\s-]{8,20}$/,
                                              message: "Invalid phone format",
                                            },
                                          ]}
                                        >
                                          <Input
                                            placeholder="Contact no"
                                            size="small"
                                            onChange={handlePhoneFormat([
                                              "branches",
                                              name,
                                              "contacts",
                                              cName,
                                              "number",
                                            ])}
                                            maxLength={15}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={10} sm={7}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Email"
                                          name={[cName, "email"]}
                                          rules={[
                                            {
                                              type: "email",
                                              message: "Invalid email",
                                            },
                                          ]}
                                        >
                                          <Input
                                            placeholder="Email"
                                            size="small"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col
                                        xs={2}
                                        sm={2}
                                        style={{ textAlign: "center" }}
                                      >
                                        <MinusCircleOutlined
                                          onClick={() => removeContact(cName)}
                                          style={{
                                            color: "#ef4444",
                                            cursor: "pointer",
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ),
                                )}
                                <Button
                                  type="dashed"
                                  onClick={() => addContact()}
                                  size="small"
                                  icon={<PlusOutlined />}
                                >
                                  Add Contact
                                </Button>
                              </>
                            )}
                          </Form.List>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Branch
                  </Button>
                </>
              )}
            </Form.List>
          ) : null
        }
      </Form.Item>
    </>
  );

  // Step 4: Finalize (Modules & Additional Info)
  const renderFinalize = () => (
    <>
      <Divider orientation="left" style={{ color: "#d97706", fontWeight: 600 }}>
        Enable Modules
      </Divider>
      <Row gutter={[16, 8]}>
        {modulesList.map((module) => (
          <Col xs={24} sm={12} md={6} key={module.id}>
            <Card
              hoverable
              className="
          relative h-full
          border-gray-200
          transition-all
          [&:has(input:checked)]:border-amber-500
          [&:has(input:checked)]:bg-amber-50
        "
            >
              {/* Checkbox – Top Right */}
              <div className="absolute top-3 right-3">
                <Form.Item
                  name={`module_${module.id}`}
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Checkbox />
                </Form.Item>
              </div>

              {/* Content */}
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-gray-800">
                  {module.label}
                </h4>

                {module.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {module.description}
                  </p>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* <Divider
        orientation="left"
        style={{ color: "#d97706", fontWeight: 600, marginTop: 24 }}
      >
        Additional Information
      </Divider>
      <Row gutter={[16, 8]}>
        <Col xs={24}>
          <Form.Item label="Remarks" name="remarks">
            <TextArea rows={4} placeholder="Optional notes or remarks" />
          </Form.Item>
        </Col>
      </Row> */}
    </>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderOrganisationDetails();
      case 1:
        return renderPartnerDetails();
      case 2:
        return renderLegalDetails();
      case 3:
        return renderBranchDetails();
      case 4:
        return renderFinalize();
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#d97706",
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  Add Organisation
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Step {currentStep + 1} of {steps.length}:{" "}
                  {steps[currentStep].title}
                </p>
              </div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                size="middle"
              >
                Exit
              </Button>
            </div>
          }
          bordered={false}
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: "8px",
          }}
        >
          {submitError && (
            <Alert
              message="Submission Failed"
              description={submitError}
              type="error"
              showIcon
              closable
              onClose={() => setSubmitError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Progress Bar */}
          <div style={{ marginBottom: 32 }}>
            <Progress
              percent={((currentStep + 1) / steps.length) * 100}
              strokeColor="#d97706"
              showInfo={false}
              style={{ marginBottom: 16 }}
            />
            <Steps current={currentStep} size="small" items={steps} />
          </div>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormValueChange}
            autoComplete="off"
            size="middle"
          >
            {/* Step Content */}

            {isEdit && isLoading ? (
              // make it in centered container
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                }}
              >
                <Spin size="large" tip="Loading organisation data..." />
              </div>
            ) : (
              <div style={{ minHeight: "400px" }}>{renderStepContent()}</div>
            )}

            {/* Navigation Buttons */}
            <Divider />
            <Form.Item style={{ marginBottom: 0 }}>
              <Space
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  size="large"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  icon={<ArrowLeftOutlined />}
                >
                  Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    htmlType="button"
                    onClick={nextStep}
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    style={{
                      background: "linear-gradient(to right, #f59e0b, #ea580c)",
                      borderColor: "transparent",
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    disabled={isCreating || isUpdating}
                    onClick={handleSubmit}
                    icon={<CheckOutlined />}
                    loading={isCreating || isUpdating}
                    style={{
                      background: "linear-gradient(to right, #10b981, #059669)",
                      borderColor: "transparent",
                    }}
                  >
                    {isEdit ? "Update Organisation" : "Create Organisation"}
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
