import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
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

// TODO: point these at your actual API module, e.g. "../../../../../api/driver"
// import {
//   getAllDriver,
//   addDriver,
//   getDriverById,
//   updateDriver,
//   deleteDriver,
// } from "../../../../../api/driver";

const { TextArea } = Input;
const DATE_FORMAT = "DD-MM-YYYY";

export default function VehicleDriverMaster() {
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
    fetchDrivers();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const fetchDrivers = async () => {
    try {
      const res = await getAllDriver();
      const formattedData = (res || []).map((item) => ({
        key: item.id,
        driverName: item.driver_name,
        licenceNo: item.driving_licence_no,
        dlExpiredDate: item.dl_expired_date,
        driverMobileNo: item.driver_mobile_no,
        helperName: item.helper_name,
        helperMobileNo: item.helper_mobile_no,
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

  const toFileList = (url, name) =>
    url ? [{ uid: `-${name}`, name, status: "done", url }] : [];

  const buildPayload = (values) => {
    const payload = new FormData();
    payload.append("driver_name", values.driverName || "");
    payload.append("address", values.address || "");
    payload.append("driving_licence_no", values.licenceNo || "");
    payload.append(
      "dl_expired_date",
      values.dlExpiredDate ? values.dlExpiredDate.format("YYYY-MM-DD") : "",
    );
    payload.append("driver_mobile_no", values.driverMobileNo || "");
    payload.append("helper_name", values.helperName || "");
    payload.append("helper_mobile_no", values.helperMobileNo || "");

    if (values.dlUpload?.[0]?.originFileObj) {
      payload.append("dl_upload", values.dlUpload[0].originFileObj);
    }
    return payload;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleAdd = async (values) => {
    try {
      const payload = buildPayload(values);
      await addDriver(payload);
      message.success("Driver added successfully");
      setAddOpen(false);
      addForm.resetFields();
      fetchDrivers();
    } catch (error) {
      console.log(error);
      message.error("Failed to add driver");
    }
  };

  const handleEdit = async (values) => {
    try {
      const payload = buildPayload(values);
      await updateDriver(selectedRow.id, payload);
      message.success("Driver updated successfully");
      setEditOpen(false);
      fetchDrivers();
    } catch (error) {
      console.log(error);
      message.error("Failed to update driver");
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteDriver(id);
      message.success("Driver deleted successfully");
      fetchDrivers();
    } catch (error) {
      console.log(error);
      message.error("Failed to delete driver");
    }
  };

  const fillFormFromRecord = (form, res) => {
    form.setFieldsValue({
      driverName: res.driver_name,
      address: res.address,
      licenceNo: res.driving_licence_no,
      dlExpiredDate: res.dl_expired_date ? dayjs(res.dl_expired_date) : null,
      driverMobileNo: res.driver_mobile_no,
      helperName: res.helper_name,
      helperMobileNo: res.helper_mobile_no,
      dlUpload: toFileList(res.dl_upload, "DL Copy"),
    });
  };

  const handleViewClick = async (id) => {
    try {
      const res = await getDriverById(id);
      setSelectedRow(res);
      fillFormFromRecord(viewForm, res);
      setViewOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = async (id) => {
    try {
      const res = await getDriverById(id);
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
      title: <span className="text-amber-700 font-semibold">Driver Name</span>,
      dataIndex: "driverName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Driving Licence No.
        </span>
      ),
      dataIndex: "licenceNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">DL Expired Dt.</span>
      ),
      dataIndex: "dlExpiredDate",
      render: (text) => (
        <span className="text-amber-800">
          {text ? dayjs(text).format(DATE_FORMAT) : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Driver Mobile No.</span>
      ),
      dataIndex: "driverMobileNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Helper Name</span>,
      dataIndex: "helperName",
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Helper Mobile No.</span>
      ),
      dataIndex: "helperMobileNo",
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
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
            title="Are you sure to delete this driver?"
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
  const DriverFields = ({ disabled = false }) => (
    <Row gutter={16}>
      <Col span={8}>
        <Form.Item
          label="Driver Name"
          name="driverName"
          rules={[{ required: !disabled, message: "Driver Name is required" }]}
        >
          <Input placeholder="Enter driver name" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={16}>
        <Form.Item label="Address" name="address">
          <TextArea rows={1} placeholder="Enter address" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Driving Licence No."
          name="licenceNo"
          rules={[
            { required: !disabled, message: "Driving Licence No. is required" },
          ]}
        >
          <Input
            placeholder="Enter driving licence number"
            disabled={disabled}
            className="uppercase"
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item label="DL Expired Dt." name="dlExpiredDate">
          <DatePicker
            className="w-full!"
            format={DATE_FORMAT}
            disabled={disabled}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Driver Mobile No."
          name="driverMobileNo"
          rules={[
            { required: !disabled, message: "Driver Mobile No. is required" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Enter a valid 10 digit mobile number",
            },
          ]}
        >
          <Input
            placeholder="Enter driver mobile number"
            disabled={disabled}
            maxLength={10}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Upload DL"
          name="dlUpload"
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
        <Form.Item label="Helper Name (if any)" name="helperName">
          <Input placeholder="Enter helper name" disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label="Helper Mobile No."
          name="helperMobileNo"
          rules={[
            {
              pattern: /^[0-9]{10}$/,
              message: "Enter a valid 10 digit mobile number",
            },
          ]}
        >
          <Input
            placeholder="Enter helper mobile number"
            disabled={disabled}
            maxLength={10}
          />
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
            placeholder="Search driver..."
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
            Add Driver
          </span>
        }
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Driver Details</h6>
            <DriverFields />
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
            View Driver
          </span>
        }
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          <Card bordered className="border-amber-300 bg-amber-50">
            <h6 className="text-amber-600 mb-3">Driver Details</h6>
            <DriverFields disabled />
          </Card>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Edit Driver
          </span>
        }
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Driver Details</h6>
            <DriverFields />
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
