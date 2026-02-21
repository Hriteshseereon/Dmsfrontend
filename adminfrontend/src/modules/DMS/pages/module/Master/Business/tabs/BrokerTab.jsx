import React, { useEffect, useState } from "react";
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
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

// import { getBrokers, addBroker, updateBroker, getBrokerDetails } from "../../../../../../../api/broker";

const { Option } = Select;

const inputClass = "border-amber-400 h-8";
const selectClass = "border-amber-400 h-8 w-full";

const vendorProductMap = {
  "Ruchi Soya": ["Soybean Oil", "Palm Oil", "Sunflower Oil"],
  "ABC Traders": ["Wheat", "Rice", "Maize"],
  "Tata Commodities": ["Tea", "Coffee"],
};

/* ================= HELPERS ================= */

/** Convert a URL string from API into Ant Design Upload fileList format */
const fileFromUrl = (url) => {
  if (!url) return [];
  return [
    {
      uid: url,
      name: url.split("/").pop(),
      status: "done",
      url,
    },
  ];
};

/** Build FormData exactly like VendorTab:
 *  - one `data` key containing a JSON string of all non-file fields
 *  - separate keys for each file
 */
const buildFormData = (values) => {
  const fd = new FormData();

  const payload = {
    broker_name: values.brokerName || "",
    phone_number: values.phoneNo || "",
    alternate_phone: values.altPhoneNo || "",
    whatsapp_number: values.whatsappNo || "",
    fax_number: values.faxNo || "",
    primary_email: values.email || "",
    secondary_email: values.secondaryEmail || "",
    status: values.status || "",

    // Permanent Address
    permanent_address: values.permanent_address || "",
    permanent_city: values.permanent_city || "",
    permanent_district: values.permanent_district || "",
    permanent_state: values.permanent_state || "",
    permanent_pin: values.permanent_pin || "",

    // Current Address
    current_address: values.current_address || "",
    current_city: values.current_city || "",
    current_district: values.current_district || "",
    current_state: values.current_state || "",
    current_pin: values.current_pin || "",

    // KYC numbers (docs are sent as files)
    pan_no: values.panNo || "",
    aadhar_no: values.aadharNo || "",
    bank_details: values.bankDetails || "",
    gstin: values.gstin || "",

    // Commissions
    commissions: (values.commissions || []).map((c) => ({
      vendor: c.vendor || "",
      product: c.product || "",
      commission_type: c.type || "",
      method: c.method || "",
      amount: c.amount || "",
    })),
  };

  // Attach JSON payload
  fd.append("data", JSON.stringify(payload));

  // Helper to attach a file if a new one was picked
  const appendFile = (key, fileList) => {
    if (fileList?.[0]?.originFileObj) {
      fd.append(key, fileList[0].originFileObj);
    }
  };

  appendFile("pan_document", values.panDoc);
  appendFile("aadhar_document", values.aadharDoc);
  appendFile("gstin_document", values.gstinDoc);
  appendFile("passport_photo", values.passportPhoto);

  return fd;
};

export default function BrokerTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form] = Form.useForm();

  /* ================= FETCH ================= */
  const fetchBrokers = async () => {
    try {
      // const res = await getBrokers();
      // const list = Array.isArray(res) ? res : res?.results || [];
      // setData(list);
      setData([]); // replace with API call
    } catch {
      message.error("Failed to fetch brokers");
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    brokerName: d.broker_name,
    phoneNo: d.phone_number,
    altPhoneNo: d.alternate_phone,
    whatsappNo: d.whatsapp_number,
    faxNo: d.fax_number,
    email: d.primary_email,
    secondaryEmail: d.secondary_email,
    status: d.status,

    // Permanent Address
    permanent_address: d.permanent_address,
    permanent_city: d.permanent_city,
    permanent_district: d.permanent_district,
    permanent_state: d.permanent_state,
    permanent_pin: d.permanent_pin,

    // Current Address
    current_address: d.current_address,
    current_city: d.current_city,
    current_district: d.current_district,
    current_state: d.current_state,
    current_pin: d.current_pin,

    // KYC numbers
    panNo: d.pan_no,
    aadharNo: d.aadhar_no,
    bankDetails: d.bank_details,
    gstin: d.gstin,

    // KYC docs → Upload fileList format
    panDoc: fileFromUrl(d.pan_document),
    aadharDoc: fileFromUrl(d.aadhar_document),
    gstinDoc: fileFromUrl(d.gstin_document),
    passportPhoto: fileFromUrl(d.passport_photo),

    // Commissions
    commissions: (d.commissions || []).map((c) => ({
      vendor: c.vendor,
      product: c.product,
      type: c.commission_type,
      method: c.method,
      amount: c.amount,
    })),
  });

  /* ================= OPEN MODAL ================= */
  const openBroker = async (record, view = false) => {
    try {
      // const details = await getBrokerDetails(record.id);
      const details = record; // replace with API call
      form.setFieldsValue(mapDetailsToForm(details));
      setSelected(details);
      setViewMode(view);
      setOpen(true);
    } catch {
      message.error("Failed to load broker details");
    }
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const formData = buildFormData(values);

      if (selected) {
        // await updateBroker(selected.id, formData);
        message.success("Broker Updated");
      } else {
        // await addBroker(formData);
        message.success("Broker Added");
      }

      setOpen(false);
      form.resetFields();
      fetchBrokers();
    } catch (e) {
      console.error(e);
      message.error("Save failed");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "Broker Name", dataIndex: "broker_name" },
    { title: "Phone", dataIndex: "phone_number" },
    { title: "Email", dataIndex: "primary_email" },
    { title: "WhatsApp", dataIndex: "whatsapp_number" },
    { title: "Status", dataIndex: "status" },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-blue-500 cursor-pointer text-base"
            onClick={() => openBroker(record, true)}
          />
          <EditOutlined
            className="text-amber-500 cursor-pointer text-base"
            onClick={() => openBroker(record, false)}
          />
        </div>
      ),
    },
  ];

  const filteredData = data.filter((b) =>
    b.broker_name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */
  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search broker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border-amber-300"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              fetchBrokers();
            }}
            className="border-amber-400 text-amber-600"
          >
            Reset
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-amber-500 border-none"
          onClick={() => {
            setSelected(null);
            setViewMode(false);
            form.resetFields();
            setOpen(true);
          }}
        >
          Add Broker
        </Button>
      </div>

      {/* ===== TABLE ===== */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="small"
        bordered
      />

      {/* ===== MODAL ===== */}
      <Modal
        open={open}
        footer={null}
        width={1200}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        title={
          <span className="text-amber-700 font-semibold text-base">
            {viewMode ? "View Broker" : selected ? "Edit Broker" : "Add Broker"}
          </span>
        }
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "Active" }}
        >
          {/* ================= Broker Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Broker Details
            </h3>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  label="Broker Name"
                  name="brokerName"
                  rules={[
                    { required: true, message: "Broker name is required" },
                  ]}
                >
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter broker name"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Phone Number" name="phoneNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter phone number"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Alternate Phone" name="altPhoneNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter alternate phone"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="WhatsApp Number" name="whatsappNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter WhatsApp number"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Fax Number" name="faxNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter fax number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Primary Email" name="email">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter primary email"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Secondary Email" name="secondaryEmail">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter secondary email"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Status" name="status">
                  <Select
                    className={selectClass}
                    disabled={viewMode}
                    placeholder="Select status"
                  >
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Address Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Address Details
            </h3>

            <h4 className="text-amber-600 font-medium mb-2">
              Permanent Address
            </h4>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="Address" name="permanent_address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter permanent address"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="City" name="permanent_city">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter city"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="District" name="permanent_district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="State" name="permanent_state">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter state"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Pin Code" name="permanent_pin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                  />
                </Form.Item>
              </Col>
            </Row>

            <h4 className="text-amber-600 font-medium mt-4 mb-2">
              Current Address
            </h4>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="Address" name="current_address">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter current address"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="City" name="current_city">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter city"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="District" name="current_district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="State" name="current_state">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter state"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Pin Code" name="current_pin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Documents & KYC ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Documents & KYC
            </h3>
            <Row gutter={24}>
              {/* PAN */}
              <Col span={4}>
                <Form.Item label="PAN Number" name="panNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter PAN number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="PAN Document"
                  name="panDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* Aadhar */}
              <Col span={4}>
                <Form.Item label="Aadhar Number" name="aadharNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter Aadhar number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Aadhar Document"
                  name="aadharDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* Bank Details */}
              <Col span={6}>
                <Form.Item label="Bank AC number" name="bankDetails">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter bank account number"
                  />
                </Form.Item>
              </Col>

              {/* Passport Photo */}
              <Col span={6}>
                <Form.Item
                  label="Passport Photo"
                  name="passportPhoto"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* GSTIN */}
              <Col span={4}>
                <Form.Item label="GSTIN Number" name="gstin">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter GSTIN number"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="GSTIN Document"
                  name="gstinDoc"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    listType="picture"
                    onPreview={(file) =>
                      window.open(
                        file.url || URL.createObjectURL(file.originFileObj),
                      )
                    }
                  >
                    <Button disabled={viewMode}>Select File</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Commission Setup ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Commission Setup
            </h3>

            <Form.List name="commissions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      className="mb-3 border border-amber-100"
                      title={
                        <span className="text-amber-700">
                          Commission {index + 1}
                        </span>
                      }
                      extra={
                        !viewMode && (
                          <MinusCircleOutlined
                            className="text-red-500 cursor-pointer"
                            onClick={() => remove(name)}
                          />
                        )
                      }
                    >
                      <Row gutter={24}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            label="Vendor"
                            name={[name, "vendor"]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select vendor"
                            >
                              {Object.keys(vendorProductMap).map((v) => (
                                <Option key={v} value={v}>
                                  {v}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            label="Product"
                            name={[name, "product"]}
                          >
                            <Input
                              className={inputClass}
                              disabled={viewMode}
                              placeholder="Enter product"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            label="Commission Type"
                            name={[name, "type"]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select type"
                            >
                              <Option value="basic">Basic</Option>
                              <Option value="scheme">Scheme</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            label="Method"
                            name={[name, "method"]}
                          >
                            <Select
                              className={selectClass}
                              disabled={viewMode}
                              placeholder="Select method"
                            >
                              <Option value="percentage">Percentage</Option>
                              <Option value="fixed">Fixed</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            label="Amount"
                            name={[name, "amount"]}
                          >
                            <Input
                              className={inputClass}
                              disabled={viewMode}
                              placeholder="Enter amount"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}

                  {!viewMode && (
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                      className="border-amber-400 text-amber-700"
                    >
                      Add Another Commission
                    </Button>
                  )}
                </>
              )}
            </Form.List>
          </Card>

          {/* ===== FOOTER ACTIONS ===== */}
          {!viewMode && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  setOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                type="primary"
                className="bg-amber-500 border-none"
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
