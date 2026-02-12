// LoadingAdvice.js
import React, { useState ,useEffect} from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getLoadingAdvice,getLoadingAdviceById ,updateLoadingAdvice} from "../../../../../api/purchase";
const { Option } = Select;

const invoiceData = {
  ORD001: {
    invoiceNo: "ORD001",
    companyName: "ABC Pvt Ltd",
    companyAddress: "Bhubaneswar, Odisha",
    companyGST: "21ABCDE1234F1Z5",
    contactPerson: "Rakesh Sharma",
    contactNo: "9876543210",
    plantName: "Plant A",
    plantCode: "PLT001",
    plantGST: "21PLT1234F1Z9",
    plantAddress: "Cuttack, Odisha",
    plantContactPerson: "Suresh Kumar",
    plantContactNo: "9090909090",
    transporter: "Tata Logistics",
    vehicleNo: "OD-05-AB-1234",
    driverName: "Rajesh Kumar",
    driverContact: "9876543211",
    insuranceValidUpto: "2025-12-30",
    puValidUpto: "2025-12-30",
    fitnessValidUpto: "2025-12-30",
    vehicleInTime: "08:30 AM",
    vehicleOutTime: "10:45 AM",
    tareWeight: 12000,
    netWeight: 25000,
    grossWeight: 37000,
    itemCode: "ITM001",
    itemName: "Palm Oil",
    itemDescription: "Edible Palm Oil",
    reqQty: 1000,
    actualQty: 950,
    variance: 50,
  },
  ORD002: {
    invoiceNo: "ORD002",
    companyName: "XYZ Ltd",
    companyAddress: "Kolkata, WB",
    companyGST: "19XYZAB1234F2Z3",
    contactPerson: "Amit Kumar",
    contactNo: "9123456789",
    plantName: "Plant B",
    plantCode: "PLT002",
    plantGST: "19PLT5678F2Z4",
    plantAddress: "Howrah, WB",
    plantContactPerson: "Sunil Das",
    plantContactNo: "9000000001",
    transporter: "",
    vehicleNo: "",
    driverName: "",
    driverContact: "",
    insuranceValidUpto: "",
    puValidUpto: "",
    fitnessValidUpto: "",
    vehicleInTime: "",
    vehicleOutTime: "",
    tareWeight: "",
    netWeight: "",
    grossWeight: "",
    itemCode: "ITM002",
    itemName: "Sunflower Oil",
    itemDescription: "Refined Sunflower Oil",
    reqQty: 800,
    actualQty: 790,
    variance: 10,
  },
};

const loadingAdviceJSON = {
  records: [
    {
      key: 1,
      lodingadvicedate: dayjs().format("YYYY-MM-DD"),
      invoiceNo: "ORD001",
      companyName: "ABC Pvt Ltd",
      companyAddress: "Bhubaneswar, Odisha",
      companyGST: "21ABCDE1234F1Z5",
      contactPerson: "Rakesh Sharma",
      contactNo: "9876543210",

      plantName: "Plant A",
      plantCode: "PLT001",
      plantGST: "21PLT1234F1Z9",
      plantAddress: "Cuttack, Odisha",
      plantContactPerson: "Suresh Kumar",
      plantContactNo: "9090909090",

      transporter: "Tata Logistics",
      vehicleNo: "OD-05-AB-1234",
      driverName: "Rajesh Kumar",
      driverContact: "9876543211",
      insuranceValidUpto: "2025-12-30",
      puValidUpto: "2025-12-30",
      fitnessValidUpto: "2025-12-30",

      vehicleInTime: "08:30 AM",
      vehicleOutTime: "10:45 AM",
      tareWeight: 12000,
      netWeight: 25000,
      grossWeight: 37000,

      itemCode: "ITM001",
      itemName: "Palm Oil",
      itemDescription: "Edible Palm Oil",
      reqQty: 1000,
      actualQty: 950,
      variance: 50,
      // statuses: Unassigned | Assigned | Pending Approval | Approved
      status: "Pending",
    },
  ],
};

export default function LoadingAdvice() {
  const [data, setData] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();
 useEffect(() => {
    fetchLoadingAdvice();
  }, []);
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setData(loadingAdviceJSON.records);
      return;
    }
    const filtered = loadingAdviceJSON.records.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setData(filtered);
  };

const fetchLoadingAdvice = async () => {
  try {
    const res = await getLoadingAdvice();

    const formatted = res.map((item) => ({
      key: item.id,
      id: item.id,

      // Basic Info
      lodingadvicedate: item.advice_date || "-",
      invoiceNo: item.invoice_no || "-",   // ✅ correct field
      companyName: item.vendor_name || "-", // change if backend sends vendor name
      plantName: item.plant_name || "-",
      status: item.status || "-",

      // Transport Details ✅ correct fields from API
      transporter: item.transporter_name || "-",
      vehicleNo: item.vehicle_no || "-",
      driverName: item.driver_name || "-",
      driverContact: item.driver_contact || "-",
      insuranceValidUpto: item.insurance_valid_upto || null,
      puValidUpto: item.pu_valid_upto || null,
      fitnessValidUpto: item.fitness_valid_upto || null,

      // Loading Details
      vehicleInTime: item.vehicle_in_time || "-",
      vehicleOutTime: item.vehicle_out_time || "-",
      tareWeight: item.tare_weight_kg || 0,
      netWeight: item.net_weight_kg || 0,
      grossWeight: item.gross_weight_kg || 0,

      // Items (first item only)
      itemCode: item.items?.[0]?.product || "-",  
      itemName: item.items?.[0]?.product_name || "-",
      reqQty: item.items?.[0]?.required_qty || 0,
      actualQty: item.items?.[0]?.actual_qty || 0,
      variance: item.items?.[0]?.variance || 0,

      original: item,
    }));

    setData(formatted);
  } catch (error) {
    console.error("Failed to fetch loading advice:", error);
  }
};


 
const handleOpenEdit = async (record) => {
  try {
    const res = await getLoadingAdviceById(record.id);

    const item = res;

    form.setFieldsValue({
      invoiceNo: item.invoice_no,
      lodingadvicedate: item.advice_date ? dayjs(item.advice_date) : null,
      status: item.status,

      transporter: item.transporter_name,
      vehicleNo: item.vehicle_no,
      driverName: item.driver_name,
      driverContact: item.driver_contact,

      insuranceValidUpto: item.insurance_valid_upto
        ? dayjs(item.insurance_valid_upto)
        : null,
      puValidUpto: item.pu_valid_upto
        ? dayjs(item.pu_valid_upto)
        : null,
      fitnessValidUpto: item.fitness_valid_upto
        ? dayjs(item.fitness_valid_upto)
        : null,

      vehicleInTime: item.vehicle_in_time,
      vehicleOutTime: item.vehicle_out_time,
      tareWeight: item.tare_weight_kg,
      netWeight: item.net_weight_kg,

      // first item
      itemCode: item.items?.[0]?.product,
      itemName: item.items?.[0]?.product_name,
      reqQty: item.items?.[0]?.required_qty,
      actualQty: item.items?.[0]?.actual_qty,
      variance: item.items?.[0]?.variance,
    });

    setSelectedRecord(item);
    setIsEditModalOpen(true);
  } catch (error) {
    console.error("Error fetching by ID:", error);
    message.error("Failed to load data");
  }
};


 const handleEdit = async (values) => {
  try {
    const payload = {
      invoice_no: values.invoiceNo,
      status: values.status,

      transporter_name: values.transporter,
      vehicle_no: values.vehicleNo,
      driver_name: values.driverName,
      driver_contact: values.driverContact,

      insurance_valid_upto: values.insuranceValidUpto
        ? dayjs(values.insuranceValidUpto).format("YYYY-MM-DD")
        : null,
      pu_valid_upto: values.puValidUpto
        ? dayjs(values.puValidUpto).format("YYYY-MM-DD")
        : null,
      fitness_valid_upto: values.fitnessValidUpto
        ? dayjs(values.fitnessValidUpto).format("YYYY-MM-DD")
        : null,

      vehicle_in_time: values.vehicleInTime,
      vehicle_out_time: values.vehicleOutTime,
      tare_weight_kg: values.tareWeight,
      net_weight_kg: values.netWeight,

      items: [
        {
          id: selectedRecord.items?.[0]?.id,
          product: values.itemCode,
          required_qty: values.reqQty,
          actual_qty: values.actualQty,
          variance: values.variance,
        },
      ],
    };

    await updateLoadingAdvice(selectedRecord.id, payload);

    message.success("Updated successfully");

    setIsEditModalOpen(false);
    form.resetFields();

    fetchLoadingAdvice(); // refresh table
  } catch (error) {
    console.error("Update failed:", error);
    message.error("Update failed");
  }
};

  const handleOpenView = (record) => {
    setSelectedRecord(record);

    const convert = (v) => (v ? dayjs(v) : null);

    viewForm.setFieldsValue({
      ...record,
      lodingadvicedate: convert(record.lodingadvicedate),
      insuranceValidUpto: convert(record.insuranceValidUpto),
      puValidUpto: convert(record.puValidUpto),
      fitnessValidUpto: convert(record.fitnessValidUpto),
    });

    setIsViewModalOpen(true);
  };

  // Admin approves a pending transporter-submitted record
  const handleApprove = (record) => {
    if (record.status !== "Pending Approval") {
      message.info("Only records with 'Pending Approval' can be approved.");
      return;
    }
    setData((prev) => prev.map((r) => (r.key === record.key ? { ...r, status: "Approved" } : r)));
    message.success("Approved.");
  };

  // Columns - removed Assign button; Admin can only approve pending ones
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Loading Advice Date</span>,
      dataIndex: "lodingadvicedate",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoiceNo",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
  

    // transporter + vehicle/driver columns (display-only)
    {
      title: <span className="text-amber-700 font-semibold">Transporter</span>,
      dataIndex: "transporter",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vehicle No</span>,
      dataIndex: "vehicleNo",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Driver</span>,
      dataIndex: "driverName",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Assignment</span>,
      dataIndex: "status",
      key: "status",
    render: (status) => {
  const colorMap = {
    Pending: "bg-yellow-100 text-yellow-700",
    Unassigned: "bg-gray-100 text-gray-700",
    Assigned: "bg-blue-100 text-blue-700",
    "Pending Approval": "bg-orange-100 text-orange-700",
    Approved: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-2 py-1 rounded ${colorMap[status] || "bg-gray-100 text-gray-700"}`}>
      {status || "-"}
    </span>
  );
}

    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined className="cursor-pointer! text-blue-500!" onClick={() => handleOpenView(record)} />
          <EditOutlined className="cursor-pointer! text-red-500!" onClick={() => handleOpenEdit(record)} />
        </div>
      ),
    },
  ];

  const renderFormFields = (disabled = false, formInstance) => (
    <>
      {/* Date and Order */}
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Invoice No" name="invoiceNo" rules={[{ required: true }]}>
            <Select
              placeholder="Select invoice No"
              onChange={(val) => {
                if (!val) return;
                const payload = invoiceData[val];
                if (payload) {
                  formInstance.setFieldsValue({
                    invoiceNo: payload.invoiceNo,
                    companyName: payload.companyName,
                    companyAddress: payload.companyAddress,
                    companyGST: payload.companyGST,
                    contactPerson: payload.contactPerson,
                    contactNo: payload.contactNo,
                    plantName: payload.plantName,
                    plantCode: payload.plantCode,
                    plantGST: payload.plantGST,
                    plantAddress: payload.plantAddress,
                    plantContactPerson: payload.plantContactPerson,
                    plantContactNo: payload.plantContactNo,
                    itemCode: payload.itemCode,
                    itemName: payload.itemName,
                    itemDescription: payload.itemDescription,
                    reqQty: payload.reqQty,
                    actualQty: payload.actualQty,
                    variance: payload.variance,
                    transporter: payload.transporter || "",
                  });
                }
              }}
              disabled={disabled}
              showSearch
            >
              {Object.keys(invoiceData).map((k) => (
                <Option key={k} value={k}>
                  {k}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Loading Advice Date" name="lodingadvicedate" rules={[{ required: true }]}>
            <DatePicker className="w-full" disabled format="YYYY-MM-DD" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select
              placeholder="Select Status"
              // disabled when NOT in edit mode (i.e. view) OR if the form is rendered as disabled
              disabled={disabled && !isEditModalOpen}
            >
              {/* adjust these options to your allowed statuses */}
              <Option value="Unassigned">Unassigned</Option>
              <Option value="Assigned">Assigned</Option>
              <Option value="Pending Approval">Pending Approval</Option>
              <Option value="Approved">Approved</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Company Details */}
      <Row gutter={24}>
        <Col span={24}>
          <h6 className="text-amber-600 ">Company Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Company Name" name="companyName" rules={[{ required: true }]}>
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Address" name="companyAddress">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="GSTIN No." name="companyGST">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Contact Person" name="contactPerson">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      {/* Plant */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600  "> Plant Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Plant Name" name="plantName">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Plant Code" name="plantCode">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="GSTIN No." name="plantGST">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Address" name="plantAddress">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      {/* Item Details */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 ">Items Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Item Code" name="itemCode">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Item Name" name="itemName">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Req. Qty" name="reqQty">
            <Input type="number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Actual Qty" name="actualQty">
            <Input type="number" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      {/* Transport Details (display-only) */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 "> Transport Details (from transporter)</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Transporter" name="transporter">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle No" name="vehicleNo">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Driver Name" name="driverName">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Driver Contact" name="driverContact">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Insurance Valid Upto" name="insuranceValidUpto">
            <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="PU Valid Upto" name="puValidUpto">
            <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Fitness Valid Upto" name="fitnessValidUpto">
            <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* Loading Details */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 "> Loading Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle In Time" name="vehicleInTime">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle Out Time" name="vehicleOutTime">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Tare Weight (KG)" name="tareWeight">
            <Input type="number" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Net Weight (KG)" name="netWeight">
            <Input type="number" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button icon={<FilterOutlined />} className="border-amber-400! text-amber-700! hover:bg-amber-100!" onClick={() => handleSearch("")}>
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button icon={<DownloadOutlined />} className="border-amber-400! text-amber-700! hover:bg-amber-100!">
            Export
          </Button>
          {/* Add New removed as requested */}
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Loading Advice</h2>
        <p className="text-amber-600 mb-3">Incoming loading advice; transporter details come from Purchase Indent</p>

        <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 300 }} rowKey="key" />
      </div>

      {/* Edit Modal (admin can view/edit admin-level fields incl. approve status) */}
      <Modal title={<span className="text-amber-700 text-2xl font-semibold">Edit Loading Advice</span>} open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null} width={1200}>
        <Form layout="vertical" form={form} onFinish={handleEdit}>
          {renderFormFields(false, form)}
          <div className="flex justify-end mt-4">
            <Button htmlType="submit" className="bg-amber-500 hover:bg-amber-600 text-white border-none">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal title={<span className="text-amber-700 text-2xl font-semibold">View Loading Advice</span>} open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={null} width={1200}>
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true, viewForm)}
        </Form>
      </Modal>
    </div>
  );
}