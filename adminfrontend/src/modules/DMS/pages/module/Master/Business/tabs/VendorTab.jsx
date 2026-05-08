import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  InputNumber,
  message,
  Upload,
  Tag,
  Tooltip,
  Popconfirm,
  Empty,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  SaveOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import {
  getVendors,
  createVendor,
  updateVendor,
  getVendorDetailsByid,
  getCompanyGroupDropdown,
} from "../../../../../../../api/bussinesspatnr";
import {
  getCountryOptions,
  getStateOptions,
  getDistrictOptions,
  getCityOptions,
  getCountryIsoByName,
  getStateIsoByName,
} from "../../../../../../../utils/locationHelper";
import {
  createDraft,
  saveDraft,
  loadDraft,
  deleteDraft,
  deserialiseDraftValues,
  getAllDrafts,
  createAutoSaveHandler,
  createManualSaveHandler,
  hasDrafts,
  debugLocalStorage,
} from "../../../../../../../utils/businessPartnerDraftUtils";
import UniversalDraftTable from "./UniversalDraftTable";

import { API_BASE_URL } from "@/utils/config";

const { Option } = Select;
const { Text } = Typography;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";
export const phoneValidator = (_, value) => {
  if (!value) return Promise.resolve();
  const phone = value.toString().trim();
  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
    return Promise.reject(new Error("Enter valid number"));
  }
  return Promise.resolve();
};

// ─────────────────────────────────────────────────────────────────────────────
// Main VendorTab
// ─────────────────────────────────────────────────────────────────────────────
export default function VendorTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [companyGroups, setCompanyGroups] = useState([]);
  // location cascade
  const [selCountryIso, setSelCountryIso] = useState("IN");
  const [selStateName, setSelStateName] = useState(null);
  const [selStateIso, setSelStateIso] = useState(null);
  const [corpStateName, setCorpStateName] = useState(null);
  const [corpStateIso, setCorpStateIso] = useState(null);
  const [form] = Form.useForm();

  // draft state
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [draftTableKey, setDraftTableKey] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);

  const companyGroupOptions = companyGroups.map((item) => ({
    label: item.name,
    value: item.id,
  }));
  const getCompanyGroups = async () => {
    try {
      const res = await getCompanyGroupDropdown();
      setCompanyGroups(res);
      console.log("Fetched company groups:", res);
    } catch {
      message.error("Failed to fetch company groups");
    }
  };

  useEffect(() => {
    getCompanyGroups();
  }, []);
  // check draft
  const checkDraftExists = () => {
    setHasDraft(hasDrafts("vendor"));
  };
  useEffect(() => {
    checkDraftExists();
  }, [draftTableKey]);

  // Auto-save handler
  const handleFormValuesChange = useCallback(
    createAutoSaveHandler(
      "vendor",
      form,
      activeDraftId,
      setActiveDraftId,
      setDraftSavedAt,
      setDraftTableKey,
      selected,
      viewMode,
    ),
    [form, selected, viewMode, activeDraftId],
  );

  // Manual save handler
  const handleManualSave = createManualSaveHandler(
    "vendor",
    form,
    activeDraftId,
    setActiveDraftId,
    setDraftSavedAt,
    setDraftTableKey,
    selected,
    viewMode,
    message,
  );

  // Close modal from draft table
  const closeDraftModal = () => {
    closeModal();
    setDraftTableKey((k) => k + 1);
  };

  // ── helpers ──────────────────────────────────────────────────────────────
  const fileFromUrl = (url) => {
    if (!url) return [];
    const finalUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    return [
      {
        uid: finalUrl,
        name: finalUrl.split("/").pop(),
        status: "done",
        url: finalUrl,
      },
    ];
  };

  // ── location handlers ─────────────────────────────────────────────────────
  const handleCountryChange = (isoCode, option) => {
    setSelCountryIso(isoCode);
    setSelStateName(null);
    setSelStateIso(null);
    form.setFieldsValue({
      country: option.label,
      state: undefined,
      district: undefined,
      city: undefined,
    });
  };

  const handleStateChange = (isoCode, option) => {
    setSelStateName(option.label);
    setSelStateIso(isoCode);
    form.setFieldsValue({
      state: option.label,
      district: undefined,
      city: undefined,
    });
  };

  const handleDistrictChange = () => form.setFieldsValue({ city: undefined });

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchVendors = async () => {
    try {
      const res = await getVendors();
      setData(Array.isArray(res) ? res : res?.results || []);
    } catch {
      message.error("Failed to fetch vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // ── DRAFT: continue (restore into form) ──────────────────────────────────
  const handleContinueDraft = (draftId) => {
    console.log("[VendorTab] Attempting to continue draft:", draftId);

    // Debug localStorage state in production
    const storageInfo = debugLocalStorage();
    if (storageInfo.errors.length > 0) {
      console.error(
        "[VendorTab] localStorage issues detected:",
        storageInfo.errors,
      );
    }

    const draft = loadDraft(draftId);
    if (!draft) {
      console.error("[VendorTab] Draft not found or failed to load:", draftId);
      message.error("Draft not found");
      return;
    }

    console.log(
      "[VendorTab] Draft loaded successfully, attempting to restore values:",
      {
        draftId: draft.id,
        hasValues: !!draft.values,
        valuesKeys: Object.keys(draft.values || {}),
        savedAt: draft.savedAt,
      },
    );

    const restored = deserialiseDraftValues(draft.values, dayjs);

    if (!restored || Object.keys(restored).length === 0) {
      console.error(
        "[VendorTab] Failed to restore draft values - empty result:",
        restored,
      );
      message.error("Failed to restore draft data");
      return;
    }

    console.log("[VendorTab] Successfully restored draft values:", {
      restoredKeys: Object.keys(restored),
      sampleValues: Object.keys(restored)
        .slice(0, 3)
        .reduce((acc, key) => {
          acc[key] = restored[key];
          return acc;
        }, {}),
    });

    form.resetFields();
    form.setFieldsValue(restored);

    // restore top-level location cascade
    if (restored.country) {
      const iso = getCountryIsoByName(restored.country) || "IN";
      setSelCountryIso(iso);
    }
    if (restored.state) {
      const countryIso = getCountryIsoByName(restored.country) || "IN";
      const stateIso = getStateIsoByName(countryIso, restored.state);
      setSelStateName(restored.state);
      setSelStateIso(stateIso);
    }

    // Check for uploaded files and show warning
    const hasFiles = Object.keys(restored).some((key) => {
      const value = restored[key];
      return Array.isArray(value) && value.length > 0 && value[0]?._fromDraft;
    });

    // Also check nested plants for files
    const hasPlantFiles =
      Array.isArray(restored.plants) &&
      restored.plants.some((plant) => {
        if (!plant) return false;
        return Object.keys(plant).some((key) => {
          const value = plant[key];
          return (
            Array.isArray(value) && value.length > 0 && value[0]?._fromDraft
          );
        });
      });

    if (hasFiles || hasPlantFiles) {
      message.warning(
        "Draft restored! Please re-upload any documents as they are not saved in drafts.",
        5,
      );
    }

    setActiveDraftId(draftId);
    setDraftSavedAt(draft.savedAt ? new Date(draft.savedAt) : null);
    setSelected(null);
    setViewMode(false);
    setOpen(true);
  };

  // ── DRAFT: discard on submit ──────────────────────────────────────────────
  const discardActiveDraft = () => {
    if (!activeDraftId) return;
    deleteDraft(activeDraftId);
    setActiveDraftId(null);
    setDraftSavedAt(null);
    setDraftTableKey((k) => k + 1);
  };

  // ── close modal ───────────────────────────────────────────────────────────
  const closeModal = () => {
    setOpen(false);
    form.resetFields();
    setSelCountryIso("IN");
    setSelStateName(null);
    setSelStateIso(null);
    setSelected(null);
    // draft stays in localStorage until submitted
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!selected && !viewMode && open) {
        saveCurrentDraft();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [open, selected, viewMode]);

  // ── MAP API → FORM ────────────────────────────────────────────────────────
  const mapDetailsToForm = (d) => {
    const contactDetails =
      d.contact_person_details || d.contact_person_input || {};
    const group = companyGroups.find(
      (g) => g.name === d.company_group || g.name === d.company_group_name,
    );
    return {
      name: d.name || d.company_name,
      shortName: d.short_name,
      legalName: d.legal_name,
      companyType: d.company_type,
      mobileNo1: d.mobile_no_1,
      mobileNo2: d.mobile_no_2,
      phoneNumber: d.phone_number || d.mobile_no_1,
      whatsappNo: d.whatsapp_number,
      email1: d.email_address || d.primary_email,
      email2: d.secondary_email,
      socialLink: d.social_link,
      websiteUrl: d.company_website,
      // companyGroupName: d.company_group_name || d.company_group,
      companyGroupName: group?.id || null,
      contactPerson:
        contactDetails.name ||
        contactDetails.contact_person_name ||
        d.contact_person,
      gender: contactDetails.gender || d.gender,
      contactMobile:
        contactDetails.contact_person_no ||
        contactDetails.mobile_no ||
        d.contact_person_no ||
        d.mobile_no_1,
      contactWhatsapp:
        contactDetails.contact_person_whats_no ||
        contactDetails.whatsapp_no ||
        d.contact_person_details?.whatsapp_no ||
        d.whatsapp_number,
      contactEmail:
        contactDetails.contact_person_email ||
        contactDetails.contract_person_email ||
        contactDetails.email ||
        d.email_address ||
        d.primary_email,
      aadharNo:
        contactDetails.aadhaar_no ||
        contactDetails.aadhar_no ||
        d.aadhar_no ||
        d.aadhaar_no,

      tinNo: d.business_details?.tin_no,
      tinDate: d.business_details?.tin_date
        ? dayjs(d.business_details.tin_date)
        : null,
      panNo: d.business_details?.pan || d.business_details?.pan_no,
      fssaiNo: d.business_details?.fssai_no,
      gstIn: d.business_details?.gstin || d.business_details?.gstin_no,
      igstApplicable: d.business_details?.igst_applicable ? "Yes" : "No",

      address1: d.addresses?.[0]?.address_line1 || d.addresses?.address_line_1,
      address2: d.addresses?.[0]?.address_line2 || d.addresses?.address_line_2,
      country: d.addresses?.[0]?.country || "India",
      state: d.addresses?.[0]?.state || d.addresses?.state,
      district: d.addresses?.[0]?.district || d.addresses?.district,
      city: d.addresses?.[0]?.city || d.addresses?.city,
      location: d.addresses?.[0]?.location || d.addresses?.location,
      pinCode: d.addresses?.[0]?.pin || d.addresses?.pin_code,
      transactionType:
        d.addresses?.[0]?.transaction_type || d.addresses?.transaction_type,

      status: (
        d.is_active !== undefined
          ? d.is_active
          : d.addresses?.[0]?.status === "Active"
      )
        ? "Active"
        : "Inactive",

      panDoc: fileFromUrl(d.pan_document || d.business_details?.pan_document),
      gstDoc: fileFromUrl(
        d.gstin_document || d.business_details?.gstin_document,
      ),
      tinDoc: fileFromUrl(d.tin_document || d.business_details?.tin_document),
      aadharDoc: fileFromUrl(
        d.aadhaar_documents ||
          d.aadhar_document ||
          d.business_details?.aadhaar_documents,
      ),
      corporateAddress: d.corporate_addresses?.[0]
        ? {
            name: d.corporate_addresses[0].name,
            address: d.corporate_addresses[0].address,
            phoneNo: d.corporate_addresses[0].phone_number,
            email: d.corporate_addresses[0].email_address,
            country: d.corporate_addresses[0].country,
            state: d.corporate_addresses[0].state,
            district: d.corporate_addresses[0].district,
            city: d.corporate_addresses[0].city,
            pin: d.corporate_addresses[0].pin,
          }
        : {},
      plants: (d.plants || []).map((p) => ({
        plantName: p.name || p.plant_name,
        address: p.address,
        phoneNo: p.phone_number || p.phone_no,
        email: p.email_address || p.email,
        country: p.country || "India",
        state: p.state,
        district: p.district,
        city: p.city,
        pin: p.pin,
        faxNo: p.fax_no,
        // stateIso is needed for city dropdown — derive it when mapping
        stateIso: p.state
          ? getStateIsoByName(
              getCountryIsoByName(p.country || "India") || "IN",
              p.state,
            )
          : null,
      })),
    };
  };

  const openVendor = async (record, view = false) => {
    try {
      const details = await getVendorDetailsByid(record.id);

      if (!companyGroups.length) {
        await getCompanyGroups();
      }
      const mapped = mapDetailsToForm(details);
      form.setFieldsValue(mapped);
      // restore top-level location cascade for edit/view
      if (mapped.country) {
        const iso = getCountryIsoByName(mapped.country) || "IN";
        setSelCountryIso(iso);
      }
      if (mapped.state) {
        const countryIso = getCountryIsoByName(mapped.country) || "IN";
        const stateIso = getStateIsoByName(countryIso, mapped.state);
        setSelStateName(mapped.state);
        setSelStateIso(stateIso);
      }

      setSelected(details);
      setViewMode(view);
      setActiveDraftId(null);
      setOpen(true);
    } catch {
      message.error("Failed to load vendor");
    }
  };

  // ── build FormData payload ────────────────────────────────────────────────
  const buildFormData = (values) => {
    const fd = new FormData();
    const payload = {
      name: values.name,
      short_name: values.shortName,
      legal_name: values.legalName,
      company_type: values.companyType,
      mobile_no_1: values.mobileNo1?.toString(),
      mobile_no_2: values.mobileNo2?.toString(),
      phone_number:
        values.phoneNumber?.toString() || values.mobileNo1?.toString(),
      whatsapp_number: values.whatsappNo?.toString(),
      email_address: values.email1,
      secondary_email: values.email2,
      social_link: values.socialLink,
      company_website: values.websiteUrl,
      is_active: values.status === "Active",
      company_group: values.companyGroupName,
      contact_person_input: {
        name: values.contactPerson || "",
        gender: values.gender,
        contact_person_no: values.contactMobile?.toString() || "",
        contact_person_whats_no: values.contactWhatsapp?.toString() || "",
        contact_person_email: values.contactEmail,
        aadhaar_no: values.aadharNo,
      },
      addresses: [
        {
          address_line1: values.address1,
          address_line2: values.address2,
          country: values.country,
          state: values.state,
          district: values.district,
          city: values.city,
          location: values.location,
          pin: values.pinCode?.toString(),
          transaction_type: values.transactionType,
        },
      ],
      corporate_addresses: values.corporateAddress
        ? [
            {
              name: values.corporateAddress.name,
              address: values.corporateAddress.address,
              phone_number: values.corporateAddress.phoneNo?.toString(),
              email_address: values.corporateAddress.email,
              country: values.corporateAddress.country,
              state: values.corporateAddress.state,
              district: values.corporateAddress.district,
              city: values.corporateAddress.city,
              pin: values.corporateAddress.pin?.toString(),
            },
          ]
        : [],
      plants: (values.plants || []).map((p) => ({
        name: p.plantName,
        address: p.address,
        fax_no: p.faxNo,
        country: p.country,
        state: p.state,
        city: p.city,
        district: p.district,
        pin: p.pin?.toString(),
        phone_number: p.phoneNo?.toString(),
        email_address: p.email,
      })),
      business_details: {
        pan: values.panNo,
        gstin: values.gstIn,
        tin_no: values.tinNo,
        tin_date: values.tinDate
          ? dayjs(values.tinDate).format("YYYY-MM-DD")
          : null,
        igst_applicable: values.igstApplicable === "Yes",
        fssai_no: values.fssaiNo,
      },
    };

    fd.append("data", JSON.stringify(payload));

    const appendFile = (key, fileList) => {
      if (fileList?.[0]?.originFileObj)
        fd.append(key, fileList[0].originFileObj);
    };
    appendFile("pan_document", values.panDoc);
    appendFile("gstin_document", values.gstDoc);
    appendFile("tin_document", values.tinDoc);
    appendFile("aadhaar_documents", values.aadharDoc);

    return fd;
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (values) => {
    try {
      const formData = buildFormData(values);
      if (selected) {
        await updateVendor(selected.id, formData);
        message.success("Vendor Updated");
      } else {
        await createVendor(formData);
        message.success("Vendor Created");
        discardActiveDraft(); // ✅ delete draft on successful submit
      }
      setOpen(false);
      form.resetFields();
      fetchVendors();
    } catch (e) {
      console.log(e);
      message.error("Save failed");
    }
  };

  // ── filter / search ───────────────────────────────────────────────────────
  const filteredData = (() => {
    if (!search) return data;
    const value = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) => val && JSON.stringify(val).toLowerCase().includes(value),
      ),
    );
  })();

  // ── TABLE COLUMNS ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Company Name</span>,
      render: (_, r) => (
        <span className="text-amber-800">{r.name || r.company_name}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Short Name</span>,
      dataIndex: "short_name",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile</span>,
      dataIndex: "mobile_no_1",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      render: (_, r) => (
        <span className="text-amber-800">
          {r.email_address || r.primary_email}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      render: (_, r) => (
        <span className="text-amber-800">
          {r.is_active || r.addresses?.[0]?.status === "Active"
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-red-500! cursor-pointer! text-base! hover:text-red-600!"
            onClick={() => openVendor(record, true)}
          />
          <EditOutlined
            className="text-blue-500! cursor-pointer! text-base! hover:text-blue-600!"
            onClick={() => openVendor(record, false)}
          />
        </div>
      ),
    },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64! border-amber-400! focus:border-amber-600! text-amber-700! placeholder:text-amber-400!"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setSearch("")}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
          onClick={() => {
            setSelected(null);
            setViewMode(false);
            setActiveDraftId(null);
            setDraftSavedAt(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </div>
      {hasDraft && (
        <UniversalDraftTable
          key={draftTableKey}
          moduleType="vendor"
          refreshTrigger={draftTableKey}
          onContinue={handleContinueDraft}
          onDelete={() => setDraftTableKey((k) => k + 1)}
          onCloseModal={closeDraftModal}
        />
      )}
      {/* ===== SUPPLIER TABLE ===== */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Supplier Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your supplier data</p>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          rowClassName="hover:bg-amber-50"
        />
      </div>

      {/* ===== MODAL ===== */}
      <Modal
        open={open}
        footer={null}
        width={1200}
        onCancel={closeModal}
        title={
          <div className="flex items-center gap-3">
            <span className="text-amber-700 font-semibold text-lg">
              {viewMode
                ? "View Supplier"
                : selected
                  ? "Edit Supplier"
                  : "Add Supplier"}
            </span>

            {/* Draft indicator — only for new-supplier forms */}
            {!selected && !viewMode && (
              <div className="flex items-center gap-2 ml-2">
                {activeDraftId ? (
                  <Tooltip
                    title={
                      draftSavedAt
                        ? `Last auto-saved at ${dayjs(draftSavedAt).format("HH:mm:ss")}`
                        : "Draft saved"
                    }
                  >
                    <Tag
                      color="gold"
                      icon={<SaveOutlined />}
                      className="cursor-default select-none"
                    >
                      Draft saved
                    </Tag>
                  </Tooltip>
                ) : (
                  <Tag
                    color="default"
                    className="cursor-default select-none text-xs"
                  >
                    Not saved yet
                  </Tag>
                )}
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  className="border-amber-400! text-amber-700! hover:bg-amber-100! text-xs!"
                  onClick={() => {
                    handleManualSave();
                    // Navigate to draft table view after saving
                    closeModal();
                    setDraftTableKey((k) => k + 1);
                  }}
                >
                  Save Draft
                </Button>
              </div>
            )}
          </div>
        }
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormValuesChange}
          initialValues={{
            status: "Active",
            igstApplicable: "No",
            companyType: "Supplier",
          }}
        >
          {/* ================= Supplier Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Supplier Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Supplier Name"
                  name="name"
                  rules={[
                    { required: true, message: "Supplier name is required" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Company name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Short Name"
                  name="shortName"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Add a company Short name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Legal Name" name="legalName">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Legal Name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Mobile No"
                  name="mobileNo1"
                  rules={[
                    { required: true, message: "Mobile number is required" },
                    { validator: phoneValidator },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="+917833242424"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Phone No"
                  name="mobileNo2"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="7984568331"
                    maxLength={16}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Primary Email"
                  name="email1"
                  rules={[
                    { required: true, message: "Primary email is required" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Secondary Email"
                  name="email2"
                  rules={[
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="WhatsApp No"
                  name="whatsappNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Social Link"
                  name="socialLink"
                  rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="https://www.facebook.com/"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Company Website"
                  name="websiteUrl"
                  rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="https://www.example.com"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Supplier Type"
                  name="companyType"
                  rules={[
                    { required: true, message: "Please select supplier type" },
                  ]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Type"
                  >
                    <Option value="Supplier">Supplier</Option>
                    <Option value="Both">Both</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Contact Person Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Contact Person Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Contact Person Name"
                  name="contactPerson"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Mr. John Doe"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Mobile No"
                  name="contactMobile"
                  rules={[{ required: true }, { validator: phoneValidator }]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="WhatsApp No"
                  name="contactWhatsapp"
                  rules={[{ validator: phoneValidator }]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="9984568331"
                    style={{ width: "100%" }}
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Gender" name="gender">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Gender"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Email"
                  name="contactEmail"
                  rules={[
                    { required: true, message: "Email is required" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Tax & Registration ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Tax & Registration
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="GSTIN No" name="gstIn">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="GSTIN1234567890"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="gstDoc"
                  label="GSTIN Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button
                      disabled={viewMode}
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="PAN No" name="panNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="PAN1234567890"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="panDoc"
                  label="PAN Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button
                      disabled={viewMode}
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="TIN No"
                  name="tinNo"
                  rules={[
                    {
                      pattern: /^[A-Z0-9]{11,15}$/,
                      message: "Please enter a valid TIN number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="TIN1234567890"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="tinDoc"
                  label="TIN Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button
                      disabled={viewMode}
                      icon={<UploadOutlined />}
                      style={{ width: "100%" }}
                    >
                      Upload
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="FSSAI No" name="fssaiNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter FSSAI Number"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Address & Location ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Address & Location
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Address Line 1"
                  name="address1"
                  rules={[
                    { required: true, message: "Missing Address Line 1" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Address Line 1"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Address Line 2" name="address2">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Address Line 2"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: "Please select country" }]}
                  initialValue="India"
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    showSearch
                    optionFilterProp="label"
                    options={getCountryOptions()}
                    onChange={handleCountryChange}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[{ required: true }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select state"
                    showSearch
                    optionFilterProp="label"
                    value={selStateIso}
                    options={getStateOptions(selCountryIso || "IN")}
                    onChange={handleStateChange}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="District"
                  name="district"
                  rules={[{ required: true }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateName}
                    placeholder="Select district"
                    showSearch
                    optionFilterProp="label"
                    options={getDistrictOptions(selStateName)}
                    onChange={handleDistrictChange}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateIso}
                    placeholder="Select city"
                    showSearch
                    optionFilterProp="label"
                    options={getCityOptions(selCountryIso || "IN", selStateIso)}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Google Location" name="location">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Location"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Pin Code"
                  name="pinCode"
                  rules={[
                    {
                      pattern: /^[0-9]{6}$/,
                      message: "Please enter a valid Pin Code",
                    },
                  ]}
                >
                  <InputNumber
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Pin Code"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Status" name="status">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Status"
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Type of Transaction" name="transactionType">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select Transaction Type"
                  >
                    <Option value="Super Stockist">Super Stockist</Option>
                    <Option value="Distributer">Distributer</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {/* ================= Corporate Address (Single) ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Corporate Address
            </h3>

            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  name={["corporateAddress", "name"]}
                  label="Corporate Name"
                  rules={[
                    { required: true, message: "Corporate name is required" },
                  ]}
                >
                  <Input placeholder="Enter Name" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name={["corporateAddress", "address"]}
                  label="Address"
                  rules={[{ required: true, message: "Address is required" }]}
                >
                  <Input placeholder="Enter Address" />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  name={["corporateAddress", "phoneNo"]}
                  label="Phone No"
                  rules={[
                    { required: true, message: "Phone number is required" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  name={["corporateAddress", "email"]}
                  label="Email"
                  rules={[
                    { required: true, message: "Email is required" },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  name={["corporateAddress", "country"]}
                  label="Country"
                  initialValue="India"
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={getCountryOptions()}
                    onChange={(iso, option) => {
                      form.setFieldsValue({
                        corporateAddress: {
                          country: option.label,
                          state: undefined,
                          district: undefined,
                          city: undefined,
                        },
                      });

                      setCorpStateName(null);
                      setCorpStateIso(null);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={["corporateAddress", "state"]} label="State">
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select State"
                    options={getStateOptions("IN")}
                    onChange={(iso, option) => {
                      setCorpStateName(option.label);
                      setCorpStateIso(iso);

                      form.setFieldsValue({
                        corporateAddress: {
                          ...form.getFieldValue("corporateAddress"),
                          state: option.label,
                          district: undefined,
                          city: undefined,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  name={["corporateAddress", "district"]}
                  label="District"
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select District"
                    options={getDistrictOptions(corpStateName)}
                    disabled={!corpStateName}
                    onChange={() => {
                      form.setFieldsValue({
                        corporateAddress: {
                          ...form.getFieldValue("corporateAddress"),
                          city: undefined,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={["corporateAddress", "city"]} label="City">
                  <Select
                    options={getCityOptions("IN", corpStateIso)}
                    disabled={!corpStateIso}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select City"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={["corporateAddress", "pin"]} label="Pin">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {/* ================= Company Group ================= */}
          <h3 className="text-lg font-semibold text-amber-700 mt-4 mb-2">
            Company Group name
          </h3>
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Company Group Name"
                  name="companyGroupName"
                  rules={[
                    { required: true, message: "Please select company group" },
                  ]}
                >
                  <Select
                    placeholder="Select Company Group"
                    options={companyGroupOptions}
                    showSearch
                    optionFilterProp="label"
                    disabled={viewMode}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Plant Details (Dynamic) ================= */}
          <div className="max-h-60 overflow-y-auto pr-2 mb-4">
            <Form.List name="plants">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      title={
                        <span className="text-amber-700">
                          Plant {index + 1}
                        </span>
                      }
                      extra={
                        !viewMode && (
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="text-red-500 hover:text-red-700"
                          />
                        )
                      }
                      style={{ marginBottom: 16, border: "1px solid #ffc877" }}
                    >
                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "plantName"]}
                            label="Plant Name"
                            rules={[
                              { required: true, message: "Missing Plant Name" },
                            ]}
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Plant Name"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, "address"]}
                            label="Address"
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Plant Address"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "phoneNo"]}
                            label="Phone No"
                            rules={[
                              {
                                required: true,
                                message: "Mobile number is required",
                              },
                              { validator: phoneValidator },
                            ]}
                          >
                            <InputNumber
                              disabled={viewMode}
                              placeholder="Enter Phone Number"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "email"]}
                            label="Email"
                            rules={[
                              { required: true, message: "Email is required" },
                              {
                                type: "email",
                                message: "Please enter a valid email address",
                              },
                            ]}
                          >
                            <Input
                              disabled={viewMode}
                              placeholder="Enter Email"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "country"]}
                            label="Country"
                            initialValue="India"
                            rules={[
                              { required: true, message: "Select Country" },
                            ]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              options={getCountryOptions()}
                              disabled={viewMode}
                              onChange={(isoCode, option) => {
                                const plants =
                                  form.getFieldValue("plants") || [];
                                plants[name] = {
                                  ...plants[name],
                                  country: option.label,
                                  state: undefined,
                                  district: undefined,
                                  city: undefined,
                                  stateIso: null,
                                };
                                form.setFieldsValue({ plants });
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "state"]}
                            label="State"
                            rules={[
                              { required: true, message: "Select State" },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select State"
                              optionFilterProp="label"
                              options={getStateOptions("IN")}
                              disabled={viewMode}
                              onChange={(isoCode, option) => {
                                const plants =
                                  form.getFieldValue("plants") || [];
                                plants[name] = {
                                  ...plants[name],
                                  state: option.label,
                                  district: undefined,
                                  city: undefined,
                                  stateIso: isoCode,
                                };
                                form.setFieldsValue({ plants });
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "district"]}
                            label="District"
                            rules={[
                              { required: true, message: "Select District" },
                            ]}
                          >
                            <Select
                              showSearch
                              placeholder="Select District"
                              optionFilterProp="label"
                              disabled={
                                viewMode ||
                                !form.getFieldValue(["plants", name, "state"])
                              }
                              options={getDistrictOptions(
                                form.getFieldValue(["plants", name, "state"]),
                              )}
                              onChange={() => {
                                const plants =
                                  form.getFieldValue("plants") || [];
                                plants[name] = {
                                  ...plants[name],
                                  city: undefined,
                                };
                                form.setFieldsValue({ plants });
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "city"]}
                            label="City"
                            rules={[{ required: true, message: "Select City" }]}
                          >
                            <Select
                              showSearch
                              placeholder="Select City"
                              optionFilterProp="label"
                              disabled={
                                viewMode ||
                                !form.getFieldValue([
                                  "plants",
                                  name,
                                  "stateIso",
                                ])
                              }
                              options={getCityOptions(
                                "IN",
                                form.getFieldValue([
                                  "plants",
                                  name,
                                  "stateIso",
                                ]),
                              )}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "pin"]}
                            label="Pin"
                            rules={[
                              {
                                required: true,
                                pattern: /^[0-9]{6}$/,
                                message: "Please enter a valid Pin Code",
                              },
                            ]}
                          >
                            <InputNumber
                              disabled={viewMode}
                              placeholder="Enter Pin"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  {!viewMode && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        className="border-amber-400 text-amber-700 hover:bg-amber-100"
                      >
                        Add Plant
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </div>

          {/* ===== FOOTER ACTIONS ===== */}
          {!viewMode && (
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={closeModal}>Cancel</Button>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-amber-500! border-none!"
              >
                {selected ? "Update" : "Save"}
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
}
