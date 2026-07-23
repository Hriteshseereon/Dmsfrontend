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
  AutoComplete,
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
import AppDatePicker from "../../../../../../components/AppDatePicker.jsx";
// TODO: point these at your actual API modules
import {
  getAllVehicles,
  addVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAllVehicleOwner,
  getallvehicleType,
  getallPassingWeight,
} from "../../../../../../api/vehiclemaster.js";

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
  const [vehicleType, setVehileType] = useState(null);
  const [passingWeight, setPassingWeight] = useState(null);
  useEffect(() => {
    fetchVehicles();
    fetchOwners();
    fetchllvehicleType();
    fetchallpassingWeight();
  }, []);

  const fetchllvehicleType = async () => {
    try {
      const res = await getallvehicleType();
      console.log("the vehicletype data", res);
      setVehileType(res);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchallpassingWeight = async () => {
    try {
      const res = await getallPassingWeight();
      console.log("this is the passing weight data", res);
      setPassingWeight(res);
    } catch (err) {
      console.log(err);
    }
  };
  /* ---------------- FETCH DATA ---------------- */
  const fetchVehicles = async () => {
    try {
      const res = await getAllVehicles();

      const formattedData = (res || []).map((item) => ({
        key: item.id,

        ownerName: item.transport_owner_name, // agar backend de
        vehicleNo: item.vehicle_number,
        vehicleType: item.vehicle_type,
        passingWeight: item.passing_weight,

        regdDate: item.registration_date,

        engineNo: item.engine_number,
        chassisNo: item.chassis_number,

        insuranceValidUpto: item.insurance_valid_upto,
        taxPaidUpto: item.tax_paid_upto,
        fitnessValidUpto: item.fitness_valid_upto,
        permitUpto: item.permit_upto,
        nationalPermitUpto: item.national_permit_upto,

        gpsSystem: item.gps_available,

        rcCopy: item.rc_copy,
        chassisCopy: item.chassis_copy,
        insuranceCopy: item.insurance_copy,
        taxCopy: item.tax_copy,
        fitnessCopy: item.fitness_copy,
        permitCopy: item.permit_copy,
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

      console.log("Owner API", res);

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

    payload.append("transport_owner", values.transportOwner || "");
    payload.append("vehicle_number", values.vehicleNumber || "");
    payload.append("vehicle_type", values.vehicleType || "");
    payload.append("passing_weight", values.passingWeight || "");

    payload.append(
      "registration_date",
      values.registrationDate
        ? values.registrationDate.format("YYYY-MM-DD")
        : "",
    );

    payload.append("engine_number", values.engineNumber || "");
    payload.append("chassis_number", values.chassisNumber || "");

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

    payload.append("gps_available", values.gpsAvailable ?? false);
    payload.append("is_active", values.isActive ?? true);

    if (values.rcCopyUpload?.[0]?.originFileObj) {
      payload.append("rc_copy", values.rcCopyUpload[0].originFileObj);
    }

    if (values.chassisCopyUpload?.[0]?.originFileObj) {
      payload.append("chassis_copy", values.chassisCopyUpload[0].originFileObj);
    }

    if (values.insuranceCopyUpload?.[0]?.originFileObj) {
      payload.append(
        "insurance_copy",
        values.insuranceCopyUpload[0].originFileObj,
      );
    }

    if (values.taxCopyUpload?.[0]?.originFileObj) {
      payload.append("tax_copy", values.taxCopyUpload[0].originFileObj);
    }

    if (values.fitnessCopyUpload?.[0]?.originFileObj) {
      payload.append("fitness_copy", values.fitnessCopyUpload[0].originFileObj);
    }

    if (values.permitCopyUpload?.[0]?.originFileObj) {
      payload.append("permit_copy", values.permitCopyUpload[0].originFileObj);
    }

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
      transportOwner: res.transport_owner,

      vehicleType: res.vehicle_type,
      passingWeight: res.passing_weight,

      vehicleNumber: res.vehicle_number,

      registrationDate: res.registration_date
        ? dayjs(res.registration_date)
        : null,

      engineNumber: res.engine_number,

      chassisNumber: res.chassis_number,

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

      rcCopyUpload: toFileList(res.rc_copy, "RC Copy"),

      chassisCopyUpload: toFileList(res.chassis_copy, "Chassis Copy"),

      insuranceCopyUpload: toFileList(res.insurance_copy, "Insurance Copy"),

      taxCopyUpload: toFileList(res.tax_copy, "Tax Copy"),

      fitnessCopyUpload: toFileList(res.fitness_copy, "Fitness Copy"),

      permitCopyUpload: toFileList(res.permit_copy, "Permit Copy"),
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
      title: <span className="text-amber-700 font-semibold">Vehicle No.</span>,
      dataIndex: "vehicleNo",
      width: 130,
      fixed: "left",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">{text || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Owner</span>,
      dataIndex: "ownerName",
      width: 180,
      ellipsis: true,
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Type</span>,
      dataIndex: "vehicleType",
      width: 120,
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Weight</span>,
      dataIndex: "passingWeight",
      width: 110,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">{text || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Regd. Date</span>,
      dataIndex: "regdDate",
      width: 120,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Chassis No.</span>,
      dataIndex: "chassisNo",
      width: 210,
      ellipsis: true,
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Insurance Valid</span>
      ),
      dataIndex: "insuranceValidUpto",
      width: 125,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Tax Valid</span>,
      dataIndex: "taxPaidUpto",
      width: 120,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Fitness Valid</span>
      ),
      dataIndex: "fitnessValidUpto",
      width: 120,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Permit Valid</span>,
      dataIndex: "permitUpto",
      width: 120,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">N. Permit Valid</span>
      ),
      dataIndex: "nationalPermitUpto",
      width: 130,
      align: "center",
      render: (text) => (
        <span className="text-amber-800 whitespace-nowrap">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">GPS</span>,
      dataIndex: "gpsSystem",
      width: 80,
      align: "center",
      render: (value) => (
        <span
          className={`font-medium ${value ? "text-green-600" : "text-red-500"}`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <EyeOutlined
            className="cursor-pointer text-red-500 hover:text-red-600"
            onClick={() => handleViewClick(record.key)}
          />

          <EditOutlined
            className="cursor-pointer text-blue-500 hover:text-blue-600"
            onClick={() => handleEditClick(record.key)}
          />

          <Popconfirm
            title="Are you sure to delete this vehicle?"
            onConfirm={() => handleDeleteClick(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="cursor-pointer text-gray-500 hover:text-gray-700" />
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
          name="transportOwner"
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
                {owner.firm_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item name="vehicleType" label="Vehicle Type">
          <AutoComplete
            options={vehicleType?.map((item) => ({
              value: item,
            }))}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().includes(inputValue.toLowerCase())
            }
          >
            <Input placeholder="Select or type vehicle type" />
          </AutoComplete>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item name="passingWeight" label="passing weight">
          <AutoComplete
            options={vehicleType?.map((item) => ({
              value: item,
            }))}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().includes(inputValue.toLowerCase())
            }
          >
            <Input placeholder="Select or type vehicle type" />
          </AutoComplete>
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item
          label="Vehicle No."
          name="vehicleNumber"
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
        <Form.Item label="Regd. Date" name="registrationDate">
          <AppDatePicker disabled={disabled} />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload RC Copy"
        name="rcCopyUpload"
        disabled={disabled}
      />

      <Col span={8}>
        <Form.Item label="Engine No." name="engineNumber">
          <Input placeholder="Enter engine number" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Chassis No." name="chassisNumber">
          <Input placeholder="Enter chassis number" disabled={disabled} />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload Chassis No. - Stencil Copy"
        name="chassisCopyUpload"
        disabled={disabled}
      />

      <Col span={8}>
        <Form.Item label="Insurance Valid Upto" name="insuranceValidUpto">
          <AppDatePicker disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="Tax Paid Upto" name="taxPaidUpto">
          <AppDatePicker disabled={disabled} />
        </Form.Item>
      </Col>

      {/* <Col span={8} /> */}

      <UploadField
        label="Upload Insurance Copy"
        name="insuranceCopyUpload"
        disabled={disabled}
      />
      <UploadField
        label="Upload Tax Paid Copy"
        name="taxCopyUpload"
        disabled={disabled}
      />

      {/* <Col span={8} /> */}

      <Col span={8}>
        <Form.Item label="Fitness Valid Upto" name="fitnessValidUpto">
          <AppDatePicker disabled={disabled} />
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
          <AppDatePicker disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="National Permit Upto" name="nationalPermitUpto">
          <AppDatePicker disabled={disabled} />
        </Form.Item>
      </Col>

      <UploadField
        label="Upload Permit Copy"
        name="permitCopyUpload"
        disabled={disabled}
      />

      <Col span={8}>
        <Form.Item label="GPS System (Available or Not)" name="gpsAvailable">
          <Select>
            <Option value={true}>Available</Option>
            <Option value={false}>Not Available</Option>
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
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="key"
          size="small"
          // bordered
          scroll={{ x: 1700 }}
        />
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
