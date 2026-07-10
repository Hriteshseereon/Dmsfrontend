import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Upload,
  Popconfirm,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// TODO: point these at your actual API module, e.g. "../../../../../api/vehicleowner"
// import {
//   getAllVehicleOwner,
//   addVehicleOwner,
//   getVehicleOwnerById,
//   updateVehicleOwner,
//   deleteVehicleOwner,
// } from "../../../../../api/vehicleowner";

const { Option } = Select;
const { TextArea } = Input;

export default function VehicleOwnerMaster() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchVehicleOwners();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const fetchVehicleOwners = async () => {
    try {
      const res = await getAllVehicleOwner();
      const formattedData = (res || []).map((item) => ({
        key: item.id,
        firmName: item.firm_transport_name,
        ownerName: item.vehicle_owner_name,
        location: item.location,
        contactPerson: item.contact_person,
        mobileNo: item.mobile_no,
      }));
      setData(formattedData);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const buildPayload = (values) => {
    const payload = new FormData();
    payload.append("firm_transport_name", values.firmName || "");
    payload.append("vehicle_owner_name", values.ownerName || "");
    payload.append("location", values.location || "");
    payload.append("father_husband_name", values.fatherHusbandName || "");
    payload.append("address", values.address || "");
    payload.append("contact_person", values.contactPerson || "");
    payload.append("designation", values.designation || "");
    payload.append("mobile_no", values.mobileNo || "");
    payload.append("email_id", values.emailId || "");
    payload.append("pan_no", values.panNo || "");
    payload.append("adhar_no", values.adharNo || "");
    payload.append("non_tds_declaration", values.nonTdsDeclaration || "");

    if (values.panUpload?.[0]?.originFileObj) {
      payload.append("pan_upload", values.panUpload[0].originFileObj);
    }
    if (values.adharUpload?.[0]?.originFileObj) {
      payload.append("adhar_upload", values.adharUpload[0].originFileObj);
    }
    if (values.nonTdsUpload?.[0]?.originFileObj) {
      payload.append("non_tds_upload", values.nonTdsUpload[0].originFileObj);
    }
    return payload;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleAdd = async (values) => {
    try {
      const payload = buildPayload(values);
      await addVehicleOwner(payload);
      message.success("Vehicle owner added successfully");
      setAddOpen(false);
      addForm.resetFields();
      fetchVehicleOwners();
    } catch (error) {
      console.log(error);
      message.error("Failed to add vehicle owner");
    }
  };

  const handleEdit = async (values) => {
    try {
      const payload = buildPayload(values);
      await updateVehicleOwner(selectedRow.id, payload);
      message.success("Vehicle owner updated successfully");
      setEditOpen(false);
      fetchVehicleOwners();
    } catch (error) {
      console.log(error);
      message.error("Failed to update vehicle owner");
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteVehicleOwner(id);
      message.success("Vehicle owner deleted successfully");
      fetchVehicleOwners();
    } catch (error) {
      console.log(error);
      message.error("Failed to delete vehicle owner");
    }
  };

  const fillFormFromRecord = (form, res) => {
    form.setFieldsValue({
      firmName: res.firm_transport_name,
      ownerName: res.vehicle_owner_name,
      location: res.location,
      fatherHusbandName: res.father_husband_name,
      address: res.address,
      contactPerson: res.contact_person,
      designation: res.designation,
      mobileNo: res.mobile_no,
      emailId: res.email_id,
      panNo: res.pan_no,
      adharNo: res.adhar_no,
      nonTdsDeclaration: res.non_tds_declaration,
      panUpload: res.pan_upload
        ? [
            {
              uid: "-1",
              name: "PAN Document",
              status: "done",
              url: res.pan_upload,
            },
          ]
        : [],
      adharUpload: res.adhar_upload
        ? [
            {
              uid: "-2",
              name: "Aadhar Document",
              status: "done",
              url: res.adhar_upload,
            },
          ]
        : [],
      nonTdsUpload: res.non_tds_upload
        ? [
            {
              uid: "-3",
              name: "Non-TDS Document",
              status: "done",
              url: res.non_tds_upload,
            },
          ]
        : [],
    });
  };

  const handleViewClick = async (id) => {
    try {
      const res = await getVehicleOwnerById(id);
      setSelectedRow(res);
      fillFormFromRecord(viewForm, res);
      setViewOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = async (id) => {
    try {
      const res = await getVehicleOwnerById(id);
      setSelectedRow(res);
      fillFormFromRecord(editForm, res);
      setEditOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getFilteredData = () => {
    if (!searchText) return data;
    const value = searchText.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) => {
        if (!val) return false;
        return JSON.stringify(val).toLowerCase().includes(value);
      }),
    );
  };

  const handleReset = () => setSearchText("");

  const filteredData = getFilteredData();

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Firm / Transport Name
        </span>
      ),
      dataIndex: "firmName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Vehicle Owner Name</span>
      ),
      dataIndex: "ownerName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Location</span>,
      dataIndex: "location",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Contact Person</span>
      ),
      dataIndex: "contactPerson",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Mobile No.</span>,
      dataIndex: "mobileNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-red-500! hover:text-red-600!"
            onClick={() => handleViewClick(record.key)}
          />
          <EditOutlined
            className="cursor-pointer! text-blue-500! hover:text-blue-600!"
            onClick={() => handleEditClick(record.key)}
          />
          <Popconfirm
            title="Are you sure to delete this vehicle owner?"
            onConfirm={() => handleDeleteClick(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="cursor-pointer! text-gray-500! hover:text-gray-700!" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ---------------- COMMON FORM FIELDS ---------------- */
  const VehicleOwnerFields = ({ disabled = false }) => (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item
          label="Firm / Transport Name"
          name="firmName"
          rules={[
            {
              required: !disabled,
              message: "Firm / Transport Name is required",
            },
          ]}
        >
          <Input
            placeholder="Enter firm / transport name"
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Vehicle Owner Name"
          name="ownerName"
          rules={[
            { required: !disabled, message: "Vehicle Owner Name is required" },
          ]}
        >
          <Input placeholder="Enter vehicle owner name" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: !disabled, message: "Location is required" }]}
        >
          <Input placeholder="Enter location" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Father / Husband Name" name="fatherHusbandName">
          <Input
            placeholder="Enter father / husband name"
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={16}>
        <Form.Item label="Address" name="address">
          <TextArea rows={1} placeholder="Enter address" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Contact Person"
          name="contactPerson"
          rules={[
            { required: !disabled, message: "Contact Person is required" },
          ]}
        >
          <Input placeholder="Enter contact person" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Designation" name="designation">
          <Input placeholder="Enter designation" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Mobile No."
          name="mobileNo"
          rules={[
            { required: !disabled, message: "Mobile No. is required" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Enter a valid 10 digit mobile number",
            },
          ]}
        >
          <Input
            placeholder="Enter mobile number"
            disabled={disabled}
            maxLength={10}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="E-mail Id"
          name="emailId"
          rules={[{ type: "email", message: "Enter a valid email" }]}
        >
          <Input placeholder="Enter email id" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="PAN No."
          name="panNo"
          rules={[
            {
              pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
              message: "Enter a valid PAN number",
            },
          ]}
        >
          <Input
            placeholder="Enter PAN number"
            disabled={disabled}
            maxLength={10}
            className="uppercase"
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Upload PAN"
          name="panUpload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="text"
            maxCount={1}
            beforeUpload={() => false}
            disabled={disabled}
          >
            {!disabled && (
              <Button
                icon={<UploadOutlined />}
                className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              >
                Upload
              </Button>
            )}
          </Upload>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Aadhar No."
          name="adharNo"
          rules={[
            {
              pattern: /^[0-9]{12}$/,
              message: "Enter a valid 12 digit Aadhar number",
            },
          ]}
        >
          <Input
            placeholder="Enter Aadhar number"
            disabled={disabled}
            maxLength={12}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Upload Aadhar"
          name="adharUpload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="text"
            maxCount={1}
            beforeUpload={() => false}
            disabled={disabled}
          >
            {!disabled && (
              <Button
                icon={<UploadOutlined />}
                className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              >
                Upload
              </Button>
            )}
          </Upload>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Non-TDS Declaration" name="nonTdsDeclaration">
          <Select placeholder="Select option" disabled={disabled}>
            <Option value="yes">Yes</Option>
            <Option value="no">No</Option>
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Upload Non-TDS Declaration"
          name="nonTdsUpload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="text"
            maxCount={1}
            beforeUpload={() => false}
            disabled={disabled}
          >
            {!disabled && (
              <Button
                icon={<UploadOutlined />}
                className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              >
                Upload
              </Button>
            )}
          </Upload>
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search vehicle owner..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add New
        </Button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-4 bg-white shadow-md">
        <Table columns={columns} dataSource={filteredData} rowKey="key" />
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Add Vehicle Owner
          </span>
        }
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Vehicle Owner Details</h6>
            <VehicleOwnerFields />
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              className="bg-amber-500! border-none! text-white"
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------------- VIEW MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            View Vehicle Owner
          </span>
        }
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          <Card bordered className="border-amber-300 bg-amber-50">
            <h6 className="text-amber-600 mb-3">Vehicle Owner Details</h6>
            <VehicleOwnerFields disabled />
          </Card>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Edit Vehicle Owner
          </span>
        }
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Vehicle Owner Details</h6>
            <VehicleOwnerFields />
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              className="bg-amber-500! border-none! text-white"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
