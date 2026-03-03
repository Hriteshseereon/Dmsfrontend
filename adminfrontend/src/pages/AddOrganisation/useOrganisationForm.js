import { useState, useEffect } from "react";
import { message as antMessage } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useCreateOrganization } from "../../queries/useCreateOrganization.js";
import { useGetOrganization } from "../../queries/useGetOrganization.js";
import { useUpdateOrganization } from "../../queries/useUpdateOrganization.js";
import { useFormStore } from "../../store/formStore.js";
import { LEGAL_KEY_MAP, modulesList, ORG_RULES } from "./constants.js";

// ─────────────────────────────────────────────
// Helper: build an existing-file object for Upload
// ─────────────────────────────────────────────
export const createExistingFile = (path) => {
  if (!path) return null;
  const fileUrl = path.startsWith("http")
    ? path
    : `${import.meta.env.VITE_API_URL}${path}`;
  const cleanPath = path.split("?")[0].split("#")[0];
  const fileName = cleanPath.substring(cleanPath.lastIndexOf("/") + 1);
  return [{ uid: fileName, name: fileName, status: "done", url: fileUrl, thumbUrl: fileUrl }];
};

// ─────────────────────────────────────────────
// Helper: convert raw ISO strings → dayjs inside form data
// ─────────────────────────────────────────────
export const hydrateDates = (data) => {
  const cloned = structuredClone(data || {});

  if (cloned.partners) {
    cloned.partners = cloned.partners.map((p) => ({
      ...p,
      dob: p?.dob ? dayjs(p.dob) : null,
    }));
  }

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

// ─────────────────────────────────────────────
// Helper: map API org object → form values
// ─────────────────────────────────────────────
export const mapOrgToForm = (org) => {
  const hqAddress = org.addresses?.find((a) => a.address_category === "HQ");
  const legal = org.legal_details ?? {};

  const selectedLegalDocs = Object.entries(LEGAL_KEY_MAP)
    .filter(([, apiKey]) => legal?.[apiKey])
    .map(([formKey]) => formKey);

  const legalDetails = Object.entries(LEGAL_KEY_MAP).reduce((acc, [formKey, apiKey]) => {
    acc[formKey] = { number: legal?.[apiKey] ?? null };

    const documentKey = apiKey.replace("_no", "_document");
    if (legal?.[documentKey]) {
      acc[formKey] = { ...acc[formKey], document: createExistingFile(legal?.[documentKey]) };
    }

    const fromKey = apiKey.replace("_no", "_valid_from");
    const toKey = apiKey.replace("_no", "_valid_to");
    if (legal?.[fromKey] && legal?.[toKey]) {
      acc[formKey] = { ...acc[formKey], validity: [dayjs(legal[fromKey]), dayjs(legal[toKey])] };
    }

    return acc;
  }, {});

  return {
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

    organisationAddress: {
      address: hqAddress?.address_line_1,
      address2: hqAddress?.address_line_2,
      city: hqAddress?.city,
      state: hqAddress?.state,
      pin: hqAddress?.pin_code,
    },

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
        percentage: p.percentage_of_interest ? Number(p.percentage_of_interest) : null,
        fatherName: p.family_details?.parents_details,
        spouseName: p.family_details?.spouse_name,
        childrenCount: sons.length + daughters.length,
        childrenType: [
          ...(sons.length ? ["SON"] : []),
          ...(daughters.length ? ["DAUGHTER"] : []),
        ],
        sonsCount: sons.length,
        daughtersCount: daughters.length,
        children: {
          sons: sons.map((s) => ({ name: s.name || "", age: s.age || "" })),
          daughters: daughters.map((d) => ({ name: d.name || "", age: d.age || "" })),
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
          address: { address1: c.address, address2: c.location, city: c.city, state: c.state, pin: c.pin_code },
          companyCertificate: createExistingFile(c.company_certificate),
          cinDocument: createExistingFile(c.cin_document),
          gstDocument: createExistingFile(c.gst_document),
        })),
      };
    }),

    selectedLegalDocs,
    legalDetails,

    hasBranch: org.branches?.length > 0,
    branches: org.branches?.map((b) => ({
      id: b.id,
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

    ...(org.modules_data ?? []).reduce((acc, m) => {
      acc[`module_${m.module}`] = m.is_enabled;
      return acc;
    }, {}),
  };
};

// ─────────────────────────────────────────────
// Helper: form values → API payload
// ─────────────────────────────────────────────
export const buildPayload = (values) => ({
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

  persons: (values.partners ?? []).map((p) => ({
    id: p.id ?? undefined,
    full_name: p.name ?? "",
    role:
      values.organisationType === "PRIVATE_LIMITED"
        ? "DIRECTOR"
        : values.organisationType === "LLP" || values.organisationType === "Partnership"
        ? "PARTNER"
        : "PROPRIETOR",
    phone_number_1: p.mobileNumber ?? null,
    phone_number_2: p.contactNumber ?? null,
    whatsapp_number: p.whatsappNumber ?? null,
    email: p.email ?? null,
    secondary_email: p.email2 ?? null,
    aadhaar_no: p.adharNo ?? null,
    pan_no: p.panNo ?? null,
    gst_no: p.gstNo ?? null,
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
      children_details: JSON.stringify({
        count: (p.children?.sons?.length || 0) + (p.children?.daughters?.length || 0),
        sons: (p.children?.sons ?? []).map((c) => ({ name: c?.name ?? null, age: Number(c?.age) || null })),
        daughters: (p.children?.daughters ?? []).map((c) => ({ name: c?.name ?? null, age: Number(c?.age) || null })),
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

  legal_details: Object.entries(LEGAL_KEY_MAP).reduce((acc, [formKey, apiKey]) => {
    const doc = values.legalDetails?.[formKey];
    acc[apiKey] = doc?.number ?? null;
    if (doc?.validity?.[0]) acc[apiKey.replace("_no", "_valid_from")] = dayjs(doc.validity[0]).format("YYYY-MM-DD");
    if (doc?.validity?.[1]) acc[apiKey.replace("_no", "_valid_to")] = dayjs(doc.validity[1]).format("YYYY-MM-DD");
    return acc;
  }, {}),

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

  depos: [],

  modules_input: modulesList.filter((m) => values[`module_${m.id}`]).map((m) => m.id),
});

// ─────────────────────────────────────────────
// Helper: append files to FormData
// ─────────────────────────────────────────────
const appendFile = (formData, fieldName, fileObj) => {
  if (fileObj?.[0]?.originFileObj) {
    formData.append(fieldName, fileObj[0].originFileObj);
  } else if (!fileObj?.[0]?.url) {
    formData.append(fieldName, null);
  }
};

export const buildFormData = (values, payload) => {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));

  // Legal documents
  Object.entries(values.legalDetails || {}).forEach(([key, doc]) => {
    const fieldName = `legal_details.${LEGAL_KEY_MAP[key].replace("_no", "_document")}`;
    appendFile(formData, fieldName, doc?.document);
  });

  // Organisation logo
  if (values.organisationLogo?.[0]?.originFileObj) {
    formData.append("organisation_logo", values.organisationLogo[0].originFileObj);
  }

  // Person files
  (values.partners || []).forEach((person, index) => {
    appendFile(formData, `persons.${index}.pan_document`, person?.panDocument);
    appendFile(formData, `persons.${index}.aadhaar_document`, person?.adharDocument);
    appendFile(formData, `persons.${index}.gst_document`, person?.gstDocument);
    appendFile(formData, `persons.${index}.din_document`, person?.dinDocument);
    appendFile(formData, `persons.${index}.photo`, person?.photo);

    appendFile(formData, `persons.${index}.company_details.company_certificate`, person?.companyCertificate);

    (person.companies || []).forEach((c, companyIndex) => {
      appendFile(formData, `persons.${index}.company_details.${companyIndex}.cin_document`, c?.cinDocument);
      appendFile(formData, `persons.${index}.company_details.${companyIndex}.gst_document`, c?.gstDocument);
    });

    (person.bankDetails || []).forEach((b, bankIndex) => {
      appendFile(formData, `persons.${index}.bank_details.${bankIndex}.cancel_cheque`, b?.cancelCheque);
    });
  });

  return formData;
};

// ─────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────
export const useOrganisationForm = (form) => {
  const { orgId } = useParams();
  const isEdit = Boolean(orgId);
  const { data: orgData, isLoading } = useGetOrganization(orgId);
  const { mutate: updateOrg, isPending: isUpdating } = useUpdateOrganization();
  const { mutate: createOrg, isPending: isCreating } = useCreateOrganization();
  const navigate = useNavigate();
  const { createForm, loadValues, setValues, reset } = useFormStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [orgType, setOrgType] = useState("");
  const [hasBranch, setHasBranch] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const rule = ORG_RULES[orgType];

  // ── Phone / format helpers ──────────────────
  const handlePhoneFormat = (fieldPath) => (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9+\-\s]/g, "");
    value = value.replace(/(?!^)\+/g, "");
    value = value.slice(0, 20);
    form.setFieldValue(fieldPath, value);
  };

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handlePreview = async (file) => {
    const fileURL = file.url || URL.createObjectURL(file.originFileObj);
    if (fileURL) window.open(fileURL, "_blank");
  };

  // ── Org type change ─────────────────────────
  const handleOrgTypeChange = (value, partnerList = null, isRestore = false) => {
    setOrgType(value);
    const r = ORG_RULES[value];
    if (r.askCount) {
      if (!isRestore) form.setFieldsValue({ partners: [] });
    } else {
      form.setFieldsValue({ partners: partnerList ?? [{}] });
    }
  };

  // ── Step validation fields ──────────────────
  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return [
          "registeredName", "phone", "email",
          ["organisationAddress", "address"],
          ["organisationAddress", "city"],
          ["organisationAddress", "state"],
          ["organisationAddress", "pin"],
          "organisationType",
        ];
      case 1: {
        if (!orgType) return [];
        const partners = form.getFieldValue("partners") || [];
        const count = form.getFieldValue("partnersCount");
        if (rule?.askCount && count && partners.length !== count) {
          antMessage.error(`Please fill all ${count} ${rule.roleLabel} details`);
          throw new Error("Director count mismatch");
        }
        return partners.flatMap((_, index) => [
          ["partners", index, "name"],
          ["partners", index, "email"],
          ["partners", index, "mobileNumber"],
        ]);
      }
      case 2:
        return [];
      case 3:
        return hasBranch ? ["branches"] : [];
      default:
        return [];
    }
  };

  // ── Navigation ──────────────────────────────
  const nextStep = async () => {
    try {
      await form.validateFields(getFieldsForStep(currentStep));
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      antMessage.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Form value change (draft save) ──────────
  const handleFormValueChange = () => {
    const allValues = form.getFieldsValue(true);
    setValues({ currentStep, formData: allValues });
  };

  // ── Submit ──────────────────────────────────
  const handleSubmit = () => {
    setSubmitError(null);
    const values = form.getFieldsValue(true);
    const payload = buildPayload(values);
    const formData = buildFormData(values, payload);

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
        }
      );
    } else {
      createOrg(formData, {
        onSuccess: () => {
          reset();
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

  // ── Load draft or edit data ─────────────────
  useEffect(() => {
    if (isEdit && orgData) return;
    let draftId = new URLSearchParams(window.location.search).get("draft");
    if (!draftId) draftId = createForm();
    const loadedValues = loadValues(draftId);
    const rawData = loadedValues.formData || {};
    const formData = hydrateDates(rawData);
    form.setFieldsValue(formData);
    setCurrentStep(loadedValues.currentStep || 0);
    if (formData.organisationType) {
      handleOrgTypeChange(formData.organisationType, formData.partners || [{}], true);
    }
  }, []);

  useEffect(() => {
    if (orgData && isEdit) {
      const values = mapOrgToForm(orgData);
      form.setFieldsValue(values);
      setOrgType(values.organisationType);
      setHasBranch(values.hasBranch);
      setCurrentStep(0);
    }
  }, [orgData, isEdit]);

  // ── Auto-fill partner slots based on count ──
  useEffect(() => {
    const count = form.getFieldValue("partnersCount");
    if (!rule?.askCount || !count || count <= 0) return;
    const currentPartners = form.getFieldValue("partners") || [];
    if (currentPartners.length !== count) {
      const arr = Array.from({ length: count }, (_, i) => currentPartners[i] || {});
      form.setFieldsValue({ partners: arr });
    }
  }, [form, orgType, form.getFieldValue("partnersCount")]);

  return {
    // state
    currentStep,
    orgType,
    hasBranch,
    setHasBranch,
    submitError,
    setSubmitError,
    rule,
    isEdit,
    isLoading,
    isCreating,
    isUpdating,
    // handlers
    nextStep,
    prevStep,
    handleSubmit,
    handleOrgTypeChange,
    handlePhoneFormat,
    handleFormValueChange,
    normFile,
    handlePreview,
  };
};