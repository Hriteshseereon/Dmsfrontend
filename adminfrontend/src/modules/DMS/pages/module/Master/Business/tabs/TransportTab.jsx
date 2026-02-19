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
  message,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

// import { getTransporters, addTransporter, updateTransporter, getTransporterDetails } from "../../../../../../../api/transporter";

const inputClass = "border-amber-400 h-8";
const passwordClass = "h-8";

export default function TransportTab() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form] = Form.useForm();

  /* ================= FETCH ================= */
  const fetchTransporters = async () => {
    try {
      // const res = await getTransporters();
      // const list = Array.isArray(res) ? res : res?.results || [];
      // setData(list);
      setData([]); // replace with API call
    } catch {
      message.error("Failed to fetch transporters");
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  /* ================= MAP API → FORM ================= */
  const mapDetailsToForm = (d) => ({
    agencyName: d.agency_name,
    mobileNo: d.mobile_number,
    altMobileNo: d.alternate_mobile_no,
    whatsappNo: d.whatsapp_number,
    email: d.primary_email,
    secondaryEmail: d.secondary_email,
    // password intentionally not pre-filled
    panNo: d.pan_no,
    gstin: d.gstin,
    ownerAadharNo: d.owner_aadhar_no,
    address1: d.address_line1,
    address2: d.address_line2,
    city: d.city,
    state: d.state,
    district: d.district,
    pinCode: d.pin_code,
  });

  /* ================= SAVE ================= */
  const handleSubmit = async (values) => {
    try {
      const payload = {
        agency_name: values.agencyName || "",
        mobile_number: values.mobileNo || "",
        alternate_mobile_no: values.altMobileNo || "",
        whatsapp_number: values.whatsappNo || "",
        primary_email: values.email || "",
        secondary_email: values.secondaryEmail || "",
        password: values.password || "",
        pan_no: values.panNo || "",
        gstin: values.gstin || "",
        owner_aadhar_no: values.ownerAadharNo || "",
        address_line1: values.address1 || "",
        address_line2: values.address2 || "",
        city: values.city || "",
        state: values.state || "",
        district: values.district || "",
        pin_code: values.pinCode || "",
      };

      if (selected) {
        // await updateTransporter(selected.id, payload);
        message.success("Transporter Updated");
      } else {
        // await addTransporter(payload);
        message.success("Transporter Added");
      }

      setOpen(false);
      form.resetFields();
      fetchTransporters();
    } catch {
      message.error("Save failed");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "Agency Name", dataIndex: "agency_name" },
    { title: "Mobile", dataIndex: "mobile_number" },
    { title: "Email", dataIndex: "primary_email" },
    { title: "City", dataIndex: "city" },
    { title: "State", dataIndex: "state" },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-blue-500 cursor-pointer text-base"
            onClick={async () => {
              try {
                // const details = await getTransporterDetails(record.id);
                const details = record; // replace with API call
                form.setFieldsValue(mapDetailsToForm(details));
                setSelected(details);
                setViewMode(true);
                setOpen(true);
              } catch {
                message.error("Failed to load transporter details");
              }
            }}
          />
          <EditOutlined
            className="text-amber-500 cursor-pointer text-base"
            onClick={async () => {
              try {
                // const details = await getTransporterDetails(record.id);
                const details = record; // replace with API call
                form.setFieldsValue(mapDetailsToForm(details));
                setSelected(details);
                setViewMode(false);
                setOpen(true);
              } catch {
                message.error("Failed to load transporter details");
              }
            }}
          />
        </div>
      ),
    },
  ];

  const filteredData = data.filter((t) =>
    t.agency_name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */
  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="flex justify-between items-center mb-3">
        {/* Left: Search + Reset */}
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search transporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border-amber-300"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              fetchTransporters();
            }}
            className="border-amber-400 text-amber-600"
          >
            Reset
          </Button>
        </div>

        {/* Right: Add Transport */}
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
          Add Transport
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
            {viewMode
              ? "View Transporter"
              : selected
                ? "Edit Transporter"
                : "Add Transporter"}
          </span>
        }
        styles={{
          body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

              <Col span={4}>
                <Form.Item label="Mobile Number" name="mobileNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter mobile number"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Alternate Mobile No" name="altMobileNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter alternate mobile number"
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
                <Form.Item label="Password" name="password">
                  <Input.Password
                    className={passwordClass}
                    disabled={viewMode}
                    placeholder="Enter password"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ================= Business & KYC Details ================= */}
          <Card className="mb-4 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-3">
              Business & KYC Details
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

              <Col span={6}>
                <Form.Item label="PAN Document" name="panDoc">
                  <Input type="file" disabled={viewMode} />
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

              <Col span={6}>
                <Form.Item label="GSTIN Document" name="gstDoc">
                  <Input type="file" disabled={viewMode} />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Owner Aadhar Number" name="ownerAadharNo">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter owner Aadhar number"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Aadhar Document" name="aadharDoc">
                  <Input type="file" disabled={viewMode} />
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
                <Form.Item label="Address Line 1" name="address1">
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
                <Form.Item label="City" name="city">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter city"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="State" name="state">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter state"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="District" name="district">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter district"
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Pin Code" name="pinCode">
                  <Input
                    className={inputClass}
                    disabled={viewMode}
                    placeholder="Enter pin code"
                  />
                </Form.Item>
              </Col>
            </Row>
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
