import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
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
import dayjs from "dayjs";

// TODO: point these at your actual API modules
// import {
//   getAllVehicle,
//   addVehicle,
//   getVehicleById,
//   updateVehicle,
//   deleteVehicle,
// } from "../../../../../api/vehicle";
// import { getAllVehicleOwner } from "../../../../../api/vehicleowner";

const { Option } = Select;
const DATE_FORMAT = "DD-MM-YYYY";

export default function VehicleMaster() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [ownerList, setOwnerList] = useState([]);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchVehicles();
    fetchOwners();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const fetchVehicles = async () => {
    try {
      const res = await getAllVehicle();
      const formattedData = (res || []).map((item) => ({
        key: item.id,
        ownerName: item.owner_name,
        vehicleType: item.vehicle_type,
        vehicleNo: item.vehicle_no,
        regdDate: item.regd_date,
        insuranceValidUpto: item.insurance_valid_upto,
        permitUpto: item.permit_upto,
      }));
      setData(formattedData);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await getAllVehicleOwner();
      setOwnerList(res || []);
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const toFileList = (url, name) =>
    url ? [{ uid: `-${name}`, name, status: "done", url }] : [];

  const buildPayload = (values) => {
    const payload = new FormData();
    payload.append("vehicle_owner", values.vehicleOwner || "");
    payload.append("vehicle_type", values.vehicleType || "");
    payload.append("vehicle_no", values.vehicleNo || "");
    payload.append(
      "regd_date",
      values.regdDate ? values.regdDate.format("YYYY-MM-DD") : "",
    );
    payload.append("engine_no", values.engineNo || "");
    payload.append("chassis_no", values.chassisNo || "");
    payload.append(
      "insurance_valid_upto",
      values.insuranceValidUpto
        ? values.insuranceValidUpto.format("YYYY-MM-DD")
        : "",
    );
    payload.append(
      "tax_paid_upto",
      values.taxPaidUpto ? values.taxPaidUpto.format("YYYY-MM-DD") : "",
    );
    payload.append(
      "fitness_valid_upto",
      values.fitnessValidUpto
        ? values.fitnessValidUpto.format("YYYY-MM-DD")
        : "",
    );
    payload.append(
      "permit_upto",
      values.permitUpto ? values.permitUpto.format("YYYY-MM-DD") : "",
    );
    payload.append(
      "national_permit_upto",
      values.nationalPermitUpto
        ? values.nationalPermitUpto.format("YYYY-MM-DD")
        : "",
    );
    payload.append("gps_available", values.gpsAvailable || "");

    const fileFields = [
      ["rcCopyUpload", "rc_copy_upload"],
      ["chassisStencilUpload", "chassis_stencil_upload"],
      ["insuranceCopyUpload", "insurance_copy_upload"],
      ["taxPaidCopyUpload", "tax_paid_copy_upload"],
      ["fitnessCopyUpload", "fitness_copy_upload"],
      ["permitCopyUpload", "permit_copy_upload"],
    ];
    fileFields.forEach(([formKey, apiKey]) => {
      if (values[formKey]?.[0]?.originFileObj) {
        payload.append(apiKey, values[formKey][0].originFileObj);
      }
    });

    return payload;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleAdd = async (values) => {
    try {
      const payload = buildPayload(values);
      await addVehicle(payload);
      message.success("Vehicle added successfully");
      setAddOpen(false);
      addForm.resetFields();
      fetchVehicles();
    } catch (error) {
      console.log(error);
      message.error("Failed to add vehicle");
    }
  };

  const handleEdit = async (values) => {
    try {
      const payload = buildPayload(values);
      await updateVehicle(selectedRow.id, payload);
      message.success("Vehicle updated successfully");
      setEditOpen(false);
      fetchVehicles();
    } catch (error) {
      console.log(error);
      message.error("Failed to update vehicle");
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteVehicle(id);
      message.success("Vehicle deleted successfully");
      fetchVehicles();
    } catch (error) {
      console.log(error);
      message.error("Failed to delete vehicle");
    }
  };

  const fillFormFromRecord = (form, res) => {
    form.setFieldsValue({
      vehicleOwner: res.vehicle_owner,
      vehicleType: res.vehicle_type,
      vehicleNo: res.vehicle_no,
      regdDate: res.regd_date ? dayjs(res.regd_date) : null,
      engineNo: res.engine_no,
      chassisNo: res.chassis_no,
      insuranceValidUpto: res.insurance_valid_upto
        ? dayjs(res.insurance_valid_upto)
        : null,
      taxPaidUpto: res.tax_paid_upto ? dayjs(res.tax_paid_upto) : null,
      fitnessValidUpto: res.fitness_valid_upto
        ? dayjs(res.fitness_valid_upto)
        : null,
      permitUpto: res.permit_upto ? dayjs(res.permit_upto) : null,
      nationalPermitUpto: res.national_permit_upto
        ? dayjs(res.national_permit_upto)
        : null,
      gpsAvailable: res.gps_available,
      rcCopyUpload: toFileList(res.rc_copy_upload, "RC Copy"),
      chassisStencilUpload: toFileList(
        res.chassis_stencil_upload,
        "Chassis Stencil Copy",
      ),
      insuranceCopyUpload: toFileList(
        res.insurance_copy_upload,
        "Insurance Copy",
      ),
      taxPaidCopyUpload: toFileList(res.tax_paid_copy_upload, "Tax Paid Copy"),
      fitnessCopyUpload: toFileList(res.fitness_copy_upload, "Fitness Copy"),
      permitCopyUpload: toFileList(res.permit_copy_upload, "Permit Copy"),
    });
  };

  const handleViewClick = async (id) => {
    try {
      const res = await getVehicleById(id);
      setSelectedRow(res);
      fillFormFromRecord(viewForm, res);
      setViewOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = async (id) => {
    try {
      const res = await getVehicleById(id);
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
          Owner / Transport Name
        </span>
      ),
      dataIndex: "ownerName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vehicle Type</span>,
      dataIndex: "vehicleType",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vehicle No.</span>,
      dataIndex: "vehicleNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Regd. Date</span>,
      dataIndex: "regdDate",
      render: (text) => (
        <span className="text-amber-800">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Insurance Valid Upto
        </span>
      ),
      dataIndex: "insuranceValidUpto",
      render: (text) => (
        <span className="text-amber-800">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Permit Upto</span>,
      dataIndex: "permitUpto",
      render: (text) => (
        <span className="text-amber-800">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
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
            title="Are you sure to delete this vehicle?"
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

  /* ---------------- SMALL UPLOAD FIELD ---------------- */
  const UploadField = ({ label, name, disabled }) => (
    <Col span={8}>
      <Form.Item
        label={label}
        name={name}
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
  );

  /* ---------------- COMMON FORM FIELDS ---------------- */
  const VehicleFields = ({ disabled = false }) => (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item
          label="Vehicle Owner / Transport Name"
          name="vehicleOwner"
          rules={[
            {
              required: !disabled,
              message: "Vehicle Owner / Transport Name is required",
            },
          ]}
        >
          <Select placeholder="Select owner / transport" disabled={disabled}>
            {ownerList.map((owner) => (
              <Option key={owner.id} value={owner.id}>
                {owner.firm_transport_name || owner.vehicle_owner_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Vehicle Type / Passing Weight"
          name="vehicleType"
          rules={[
            {
              required: !disabled,
              message: "Vehicle Type / Passing Weight is required",
            },
          ]}
        >
          <Input
            placeholder="Enter vehicle type / passing weight"
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Vehicle No."
          name="vehicleNo"
          rules={[{ required: !disabled, message: "Vehicle No. is required" }]}
        >
          <Input
            placeholder="Enter vehicle number"
            disabled={disabled}
            className="uppercase"
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Regd. Date" name="regdDate">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload RC Copy"
        name="rcCopyUpload"
        disabled={disabled}
      />

      <Col span={8} />

      <Col span={8}>
        <Form.Item label="Engine No." name="engineNo">
          <Input placeholder="Enter engine number" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Chassis No." name="chassisNo">
          <Input placeholder="Enter chassis number" disabled={disabled} />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload Chassis No. - Stencil Copy"
        name="chassisStencilUpload"
        disabled={disabled}
      />

      <Col span={8}>
        <Form.Item label="Insurance Valid Upto" name="insuranceValidUpto">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Tax Paid Upto" name="taxPaidUpto">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={8} />

      <UploadField
        label="Upload Insurance Copy"
        name="insuranceCopyUpload"
        disabled={disabled}
      />
      <UploadField
        label="Upload Tax Paid Copy"
        name="taxPaidCopyUpload"
        disabled={disabled}
      />

      <Col span={8} />

      <Col span={8}>
        <Form.Item label="Fitness Valid Upto" name="fitnessValidUpto">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload Fitness Copy"
        name="fitnessCopyUpload"
        disabled={disabled}
      />

      <Col span={8} />

      <Col span={8}>
        <Form.Item label="Permit Upto" name="permitUpto">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="National Permit Upto" name="nationalPermitUpto">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload Permit Copy"
        name="permitCopyUpload"
        disabled={disabled}
      />

      <Col span={8}>
        <Form.Item label="GPS System (Available or Not)" name="gpsAvailable">
          <Select placeholder="Select option" disabled={disabled}>
            <Option value="available">Available</Option>
            <Option value="not_available">Not Available</Option>
          </Select>
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
            placeholder="Search vehicle..."
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
            Add Vehicle
          </span>
        }
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Vehicle Details</h6>
            <VehicleFields />
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
            View Vehicle
          </span>
        }
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          <Card bordered className="border-amber-300 bg-amber-50">
            <h6 className="text-amber-600 mb-3">Vehicle Details</h6>
            <VehicleFields disabled />
          </Card>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Edit Vehicle
          </span>
        }
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Vehicle Details</h6>
            <VehicleFields />
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
