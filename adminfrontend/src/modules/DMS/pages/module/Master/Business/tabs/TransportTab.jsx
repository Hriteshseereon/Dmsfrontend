import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Row,
  Col,
  Card,
  message,
  Upload,
  Select,
  Popconfirm,
  Tag,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  getAllTransport,
  createTransport,
  updateTransport,
  getTransportById,
  sendTransportCredential,
} from "@/api/transport.js";
import {
  getCountryOptions,
  getStateOptions,
  getDistrictOptions,
  getCityOptions,
  getCountryIsoByName,
  getStateIsoByName,
} from "../../../../../../../utils/locationHelper";
// import { getTransporters, addTransporter, updateTransporter, getTransporterDetails } from "../../../../../../../api/transporter";
import { API_BASE_URL } from "@/utils/config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
const { Text } = Typography;
dayjs.extend(relativeTime);
const inputClass = "border-amber-400 h-8";
const passwordClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";
export const phoneValidator = (_, value) => {
  if (!value) return Promise.resolve(); // allow empty if not required

  const phone = value.toString().trim();

  // E.164 format:
  // optional +
  // first digit 1–9
  // total digits max 15
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  if (!phoneRegex.test(phone)) {
    return Promise.reject(new Error("Enter valid number "));
  }

  return Promise.resolve();
};

// ================= DRAFT SYSTEM =================
const DRAFT_PREFIX = "transport-form-draft-";

// Serialise form values (date + upload)
const serialiseDraft = (values) => {
  const out = {};
  for (const [key, val] of Object.entries(values)) {
    if (val === null || val === undefined) {
      out[key] = val;
      continue;
    }

    // dayjs
    if (typeof val === "object" && typeof val.isValid === "function") {
      out[key] = val.toISOString();
      continue;
    }

    // Upload fileList
    if (Array.isArray(val) && val.length && val[0]?.uid !== undefined) {
      out[key] = val.map(({ uid, name, status, url, thumbUrl }) => ({
        uid,
        name,
        status,
        url,
        thumbUrl,
        _fromDraft: true,
      }));
      continue;
    }

    out[key] = val;
  }
  return out;
};

// Deserialise
const deserialiseDraft = (values, dayjs) => {
  const out = {};
  for (const [key, val] of Object.entries(values)) {
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      const d = dayjs(val);
      out[key] = d.isValid() ? d : null;
      continue;
    }

    if (Array.isArray(val) && val.length && val[0]?._fromDraft) {
      out[key] = val;
      continue;
    }

    out[key] = val;
  }
  return out;
};

// Storage helpers
const saveDraft = (id, values, meta = {}) => {
  const payload = {
    id,
    savedAt: new Date().toISOString(),
    meta,
    values: serialiseDraft(values),
  };
  localStorage.setItem(id, JSON.stringify(payload));
  return id;
};

const createDraft = (values, meta = {}) => {
  const id = `${DRAFT_PREFIX}${Date.now()}`;
  return saveDraft(id, values, meta);
};

const loadDraft = (id) => {
  try {
    const raw = localStorage.getItem(id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const deleteDraft = (id) => localStorage.removeItem(id);

const getAllDrafts = () => {
  const result = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DRAFT_PREFIX)) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed?.values) {
        result.push({
          id: key,
          savedAt: parsed.savedAt,
          name: parsed.meta?.agencyName || parsed.values?.agencyName || "—",
          email: parsed.meta?.email || parsed.values?.email || "—",
          mobile: parsed.meta?.mobileNo || parsed.values?.mobileNo || "—",
        });
      }
    } catch {}
  }
  return result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
};
export default function TransportTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const { Option } = Select;
  const [selCountryIso, setSelCountryIso] = useState(null);
  const [selStateName, setSelStateName] = useState(null);
  const [selStateIso, setSelStateIso] = useState(null);
  const [form] = Form.useForm();
  const generatePassword = (length = 10) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // draft functionality
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [draftTableKey, setDraftTableKey] = useState(0);
  const draftTableRef = useRef(null);
  const saveCurrentDraft = ({ showToast = false, closeAfterSave = false } = {}) => {
    if (selected || viewMode || !open) return;
    const values = form.getFieldsValue(true);
    const meta = {
      agencyName: values.agencyName,
      email: values.email,
      mobileNo: values.mobileNo,
    };

    setActiveDraftId((prevId) => {
      const id = prevId || createDraft(values, meta);
      saveDraft(id, values, meta);
      setDraftSavedAt(new Date());
      setDraftTableKey((k) => k + 1);

      if (showToast) {
        message.success("Draft saved");
      }
      if (closeAfterSave) {
        setOpen(false);
        form.resetFields();
        setSelCountryIso(null);
        setSelStateName(null);
        setSelStateIso(null);
        setSelected(null);
        setViewMode(false);
        setTimeout(() => {
          draftTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }

      return id;
    });
  };

  // Manual save draft function
  const handleManualSave = () => {
    saveCurrentDraft({ showToast: true, closeAfterSave: true });
  };

  const closeModal = () => {
    setOpen(false);
    form.resetFields();
    setSelected(null);
    setViewMode(false);
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
  /* ================= FETCH ================= */
  const fetchTransporters = async () => {
    try {
      const res = await getAllTransport();
      const list = Array.isArray(res) ? res : res?.results || [];
      setData(list);
    } catch {
      message.error("Failed to fetch transporters");
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);
  // handler function to get the dynamic country state dsitrict and cities
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

  const handleDistrictChange = () => {
    form.setFieldsValue({ city: undefined });
  };

  const fileFromUrl = (url) => {
    if (!url) return [];

    // if backend already returns full URL → use it
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
  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    agencyName: d.registered_name,
    contactPersonName: d.contact_person_name,
    mobileNo: d.phone_number,
    altMobileNo: d.alternate_mobile_no,
    whatsappNo: d.whatsapp_number,
    email: d.email_id,
    secondaryEmail: d.secondary_email,
    panNo: d.pan,
    gstin: d.gstin,
    ownerAadharNo: d.owner_aadhar_number,
    address1: d.address_1,
    address2: d.address_2,
    country: d.country || "India",
    city: d.city,
    state: d.state,
    district: d.district,
    pinCode: d.pin,
    status: d.is_active ? "true" : "false",
    // ✅ FILE PREVIEW DATA
    panDoc: fileFromUrl(d.pan_document),
    gstDoc: fileFromUrl(d.gstin_document),
    aadharDoc: fileFromUrl(d.aadhar_document),
  });
  const buildFormData = (values) => {
    const fd = new FormData();

    fd.append("registered_name", values.agencyName || "");
    fd.append("contact_person_name", values.contactPersonName || "");
    fd.append("email_id", values.email || "");
    fd.append("secondary_email", values.secondaryEmail || "");
    fd.append("password", values.password || "");
    fd.append("phone_number", values.mobileNo || "");
    fd.append("alternate_mobile_no", values.altMobileNo || "");
    fd.append("whatsapp_number", values.whatsappNo || "");
    fd.append("is_active", values.status === "true");
    fd.append("pan", values.panNo || "");

    fd.append("gstin", values.gstin || "");
    fd.append("owner_aadhar_number", values.ownerAadharNo || "");
    fd.append("address_1", values.address1 || "");
    fd.append("address_2", values.address2 || "");
    fd.append("country", values.country || "");
    fd.append("city", values.city || "");
    fd.append("state", values.state || "");
    fd.append("district", values.district || "");
    fd.append("pin", values.pinCode || "");

    // FILES
    if (values.panDoc?.[0]?.originFileObj)
      fd.append("pan_document", values.panDoc[0].originFileObj);

    if (values.gstDoc?.[0]?.originFileObj)
      fd.append("gstin_document", values.gstDoc[0].originFileObj);

    if (values.aadharDoc?.[0]?.originFileObj)
      fd.append("aadhar_document", values.aadharDoc[0].originFileObj);

    return fd;
  };
  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const formData = buildFormData(values);
      if (!selected) {
        deleteDraft(activeDraftId);
        setActiveDraftId(null);
        setDraftSavedAt(null);
        setDraftTableKey((k) => k + 1);
      }
      if (selected) {
        await updateTransport(selected.id, formData);
        message.success("Transporter Updated");
      } else {
        await createTransport(formData);
        message.success("Transporter Added");
      }

      setOpen(false);
      form.resetFields();
      fetchTransporters();
    } catch (e) {
      message.error("Save failed");
    }
  };
  // mail sending function
  const handleSendPassword = async (record) => {
    try {
      const partnerId = record.id;

      setSendingId(partnerId);

      const payload = {
        partner_type: "transport",
        partner_id: partnerId,
      };

      await sendTransportCredential(payload);

      message.success("Mail successfully sent");

      setData((prev) =>
        prev.map((item) =>
          item.id === partnerId ? { ...item, credentials_sent: true } : item,
        ),
      );
    } catch (error) {
      message.error("Failed to send mail");
    } finally {
      setSendingId(null);
    }
  };

  const getFilteredData = () => {
    if (!search) return data;

    const value = search.toLowerCase();

    return data.filter((item) => {
      return Object.values(item).some((val) => {
        if (!val) return false;

        // convert everything safely to string
        return JSON.stringify(val).toLowerCase().includes(value);
      });
    });
  };

  const handleReset = () => {
    setSearch("");
  };
  /* ================= TABLE ================= */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Agency Name</span>,
      dataIndex: "registered_name",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile</span>,
      dataIndex: "phone_number",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Email</span>,
      dataIndex: "email_id",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">City</span>,
      dataIndex: "city",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">State</span>,
      dataIndex: "state",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-red-500! cursor-pointer! text-base! hover:text-red-600!"
            onClick={async () => {
              const details = await getTransportById(record.id);

              form.setFieldsValue(mapDetailsToForm(details));
              const countryName = details.country || "India";
              const countryIso = getCountryIsoByName(countryName);
              const stateIso = getStateIsoByName(countryIso, details.state);

              setSelCountryIso(countryIso);
              setSelStateName(details.state);
              setSelStateIso(stateIso);
              setSelected(details);
              setViewMode(true);
              setActiveDraftId(null);
              setOpen(true);
            }}
          />
          <EditOutlined
            className="text-blue-500! cursor-pointer! text-base! hover:text-blue-600!"
            onClick={async () => {
              const details = await getTransportById(record.id);

              form.setFieldsValue(mapDetailsToForm(details));
              const countryName = details.country || "India";
              const countryIso = getCountryIsoByName(countryName);
              const stateIso = getStateIsoByName(countryIso, details.state);

              setSelCountryIso(countryIso);
              setSelStateName(details.state);
              setSelStateIso(stateIso);
              setSelected(details);
              setViewMode(false);
              setActiveDraftId(null);
              setOpen(true);
            }}
          />
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Password</span>,
      render: (_, record) => {
        const partnerId = record.id;

        return (
          <Button
            size="small"
            type="primary"
            disabled={record.credentials_sent}
            loading={sendingId === partnerId}
            className={
              record.credentials_sent
                ? "bg-green-500! border-none!"
                : "bg-amber-500! border-none! hover:bg-amber-600!"
            }
            onClick={() => handleSendPassword(record)}
          >
            {record.credentials_sent
              ? "Sent"
              : sendingId === partnerId
                ? "Sending..."
                : "Send"}
          </Button>
        );
      },
    },
  ];

  const filteredData = getFilteredData();

  function DraftTable({ refreshKey, onContinue, onDelete }) {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
      setDrafts(getAllDrafts());
    }, [refreshKey]);

    if (!drafts.length) return null; // hide when no drafts

    const handleDelete = (id) => {
      deleteDraft(id);
      onDelete?.();
      setDrafts(getAllDrafts());
    };

    const columns = [
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">
            Agency Name
          </span>
        ),
        dataIndex: "name",
        render: (t) => (
          <span className="text-amber-800 font-medium">{t || "—"}</span>
        ),
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">Email</span>
        ),
        dataIndex: "email",
        render: (t) => (
          <span className="text-amber-700 text-sm">{t || "—"}</span>
        ),
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">Mobile</span>
        ),
        dataIndex: "mobile",
        render: (t) => (
          <span className="text-amber-700 text-sm">{t || "—"}</span>
        ),
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">
            Last Saved
          </span>
        ),
        dataIndex: "savedAt",
        render: (v) => (
          <Tag
            icon={<ClockCircleOutlined />}
            color="gold"
            className="text-xs font-normal"
          >
            {v ? dayjs(v).fromNow() : "—"}
          </Tag>
        ),
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">Actions</span>
        ),
        render: (_, record) => (
          <div className="flex gap-2">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              className="bg-amber-500! hover:bg-amber-600! border-none! text-xs!"
              onClick={() => onContinue(record.id)}
            >
              Continue
            </Button>

            <Popconfirm
              title="Delete this draft?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Keep"
              okButtonProps={{
                danger: true,
                className: "bg-red-500! border-none!",
              }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="text-xs!"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <div className="border border-amber-200 rounded-lg p-4 bg-white shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileTextOutlined className="text-amber-500 text-lg" />
          <h2 className="text-base font-semibold text-amber-700 m-0">
            Saved Drafts
          </h2>
          <Tag color="gold" className="ml-1">
            {drafts.length}
          </Tag>
        </div>

        <Text className="text-amber-500 text-xs block mb-3">
          These forms were not submitted. Click <b>Continue</b> to resume
          editing.
        </Text>

        <Table
          columns={columns}
          dataSource={drafts}
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          rowClassName="hover:bg-amber-50"
        />
      </div>
    );
  }
  const handleContinueDraft = (id) => {
    const draft = loadDraft(id);
    if (!draft) return;

    const restored = deserialiseDraft(draft.values, dayjs);
    form.setFieldsValue(restored);

    // Check for uploaded files and show warning
    const hasFiles = Object.keys(restored).some(key => {
      const value = restored[key];
      return Array.isArray(value) && value.length > 0 && value[0]?._fromDraft;
    });

    if (hasFiles) {
      message.warning("Draft restored! Please re-upload any documents as they are not saved in drafts.", 5);
    }

    setActiveDraftId(id);
    setDraftSavedAt(new Date(draft.savedAt));
    setOpen(true);
  };
  /* ================= UI ================= */
  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center mb-3">
        {/* Left: Search + Reset */}
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search transporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64! border-amber-400! focus:border-amber-600! text-amber-700! placeholder:text-amber-400!"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>

        {/* Right: Add Transport */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
          onClick={() => {
            const randomPassword = generatePassword();
            setSelected(null);
            setViewMode(false);
            setActiveDraftId(null);
            setDraftSavedAt(null);
            form.resetFields();

            const countryIso = getCountryIsoByName("India");
            setSelCountryIso(countryIso); // IMPORTANT

            form.setFieldsValue({
              password: randomPassword,
              status: "true",
              country: "India",
            });

            setOpen(true);
          }}
        >
          Add Transport
        </Button>
      </div>
      {/* draft table */}
      <div ref={draftTableRef}>
        <DraftTable
          refreshKey={draftTableKey}
          onContinue={handleContinueDraft}
          onDelete={() => setDraftTableKey((k) => k + 1)}
        />
      </div>
      {/* ===== TABLE CONTAINER ===== */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Transport Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your transport data</p>
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
                ? "View Transporter"
                : selected
                  ? "Edit Transporter"
                  : "Add Transporter"}
            </span>

            {/* Draft indicator — shown only for new-transporter forms */}
            {!selected && !viewMode && (
              <div className="flex items-center gap-2 ml-2">
                {activeDraftId ? (
                  <Tag
                    color="gold"
                    icon={<SaveOutlined />}
                    className="cursor-default select-none"
                  >
                    Draft saved
                  </Tag>
                ) : (
                  <Tag
                    color="default"
                    className="cursor-default select-none text-xs"
                  >
                    Not saved yet
                  </Tag>
                )}

                {/* Manual save button */}
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  className="border-amber-400! text-amber-700! hover:bg-amber-100! text-xs!"
                  onClick={handleManualSave}
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
        >
          {/* ================= Transporter / Agency Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Transporter / Agency Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Agency Name"
                  name="agencyName"
                  rules={[
                    { required: true, message: "Agency name is required" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter agency name"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Contact Person Name"
                  name="contactPersonName"
                  rules={[
                    {
                      required: true,
                      message: "Contact person name is required",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter contact person name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Mobile Number"
                  name="mobileNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter mobile number"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Phone No"
                  name="altMobileNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter alternate mobile number"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="WhatsApp Number"
                  name="whatsappNo"
                  rules={[{ validator: phoneValidator }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter WhatsApp number"
                    maxLength={16}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Primary Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email id is required" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter primary email"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Secondary Email"
                  name="secondaryEmail"
                  rules={[
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter secondary email"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Password" name="password">
                  <Input.Password
                    className={passwordClass}
                    disabled={viewMode || selected}
                    placeholder="Enter password"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Status is required" }]}
                >
                  <Select className={selectClass} disabled={viewMode}>
                    <Option value="true">Active</Option>
                    <Option value="false">Inactive</Option>
                  </Select>
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
              <Col span={8}>
                <Form.Item
                  label="Address Line 1"
                  name="address1"
                  rules={[{ required: true, message: "Address1 is required" }]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address line 1"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Address Line 2" name="address2">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter address line 2"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: "Select country" }]}
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
                  rules={[{ required: true, message: "Select state" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selCountryIso}
                    options={getStateOptions(selCountryIso)}
                    onChange={handleStateChange}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select State"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="District"
                  name="district"
                  rules={[{ required: true, message: "Select district" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateName}
                    options={getDistrictOptions(selStateName)}
                    onChange={handleDistrictChange}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select District"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: "Select city" }]}
                >
                  <Select
                    className={selectClass}
                    disabled={viewMode || !selStateIso}
                    options={getCityOptions(selCountryIso, selStateIso)}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select City"
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
                      message: "Only numbers are allowed",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {/* ================= Business & KYC Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Legal Details
            </h3>
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="PAN Number" name="panNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter PAN number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="PAN Document"
                  name="panDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
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
                <Form.Item label="GSTIN Number" name="gstin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter GSTIN number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="GST Document"
                  name="gstDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
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
                  label="Owner Aadhar Number"
                  name="ownerAadharNo"
                  rules={[
                    {
                      pattern: /^[0-9]{12}$/,
                      message: "Enter a valid 12-digit Aadhaar number",
                    },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter owner Aadhar number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Adhar Document"
                  name="aadharDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    style={{ width: "100%" }}
                    listType="picture"
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
            </Row>
          </Card>

          {/* ===== FOOTER ACTIONS ===== */}
          {!viewMode && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={closeModal}
              >
                Cancel
              </Button>
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
