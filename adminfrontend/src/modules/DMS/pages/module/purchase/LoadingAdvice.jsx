// LoadingAdvice.js
import React, { useState, useEffect } from "react";
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
import { exportToExcel } from "../../../../../utils/exportToExcel";
import { getLoadingAdvice, getLoadingAdviceById, updateLoadingAdvice } from "../../../../../api/purchase";
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

const ALL_STATUS = [

  "Approved",
  "In-Transit",
  "Out for delivery",
  "Delivered",
];

const statusFlow = {
 Pending: ["Pending", ], 
 
  Approved: ["Approved", "In-Transit"],
  "In-Transit": ["In-Transit", "Out for delivery"],
  "Out for delivery": ["Out for delivery", "Delivered"],
  Delivered: ["Delivered"],
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
    fetchLoadingAdvice();
    return;
  }

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
  );

  setData(filtered);
};
const handleExport = async () => {
  try {
    const res = await getLoadingAdvice();
    const list = res || [];

    const exportRows = [];

    for (const advice of list) {
      const detail = await getLoadingAdviceById(advice.loading_id);

      detail.items?.forEach((item) => {
        exportRows.push({
          // Basic
          "Advice No": detail.advice_no,
          "Loading Advice Date": detail.advice_date,
          "Status": detail.status,

          // Company Details
          "Vendor Name": detail.vendor_name,
          "Vendor Address": detail.vendor_address,
          "Contact Person": detail.vendor_contact_person,
          "Vendor Phone": detail.vendor_phone,

          // Plant Details
          "Plant Name": detail.plant_name,
          "Plant Address": detail.plant_address,
          "Plant Contact Person": detail.plant_contact_person,

          // Item Details
         
          "Item Name": item.product_name,
          "Required Qty": item.required_qty,
          "Actual Qty": item.actual_qty,
          "Variance": item.variance,

          // Transport Details
          "Transporter": detail.transporter_name,
          "Vehicle No": detail.vehicle_no,
          "Driver Name": detail.driver_name,
          "Driver Contact": detail.driver_contact,
          "Insurance Valid Upto": detail.insurance_valid_upto,
          "PU Valid Upto": detail.pu_valid_upto,
          "Fitness Valid Upto": detail.fitness_valid_upto,

          // Loading Details
          "Vehicle In Time": detail.vehicle_in_time,
          "Vehicle Out Time": detail.vehicle_out_time,
          "Tare Weight (KG)": detail.tare_weight_kg,
          "Net Weight (KG)": detail.net_weight_kg,
          "Gross Weight (KG)": detail.gross_weight_kg,
        });
      });
    }

    exportToExcel(exportRows, "Loading_Advice_Details", "LoadingAdvice");

  } catch (error) {
    console.error("Export failed:", error);
    message.error("Export failed");
  }
};

  const fetchLoadingAdvice = async () => {
    try {
      const res = await getLoadingAdvice();

      const formatted = res.map((item) => ({
        key: item.id,
        id: item.id,

        // Basic Info
         advice_no: item.advice_no || "-",
        lodingadvicedate: item.advice_date || "-",
        invoiceNo: item.invoice_number || "-",   
        companyName: item.vendor_name || "-",
        plantName: item.plant_name || "-",
        status: item.status || "-",
        vendor_name: item.vendor_name,
        plant_name: item.plant_name,
       vendor_address: item.vendor_addresses?.[0]?.address_line1,
       plant_address: item.plant_details?.address,
        vendor_gstin: item.vendor_gstin,
        plant_gstin: item.plant_gstin,
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

      
        itemCode: item.items?.[0]?.hsn_code || "-",   // 👈 HSN code
itemName: item.items?.[0]?.product_name || "-",

        reqQty: item.items?.[0]?.required_qty || 0,
        actualQty: item.items?.[0]?.actual_qty || 0,
        variance: item.items?.[0]?.variance || 0,

        original: item,
      }));

      setData(formatted.reverse());
    } catch (error) {
      console.error("Failed to fetch loading advice:", error);
    }
  };



  const handleOpenEdit = async (record) => {
    try {
      const res = await getLoadingAdviceById(record.id);
      console.log("PLANT PHONE:", res.plant_details?.phone_number); // ✅ 
      const item = res;
form.setFieldsValue({
  invoiceNo: item.invoice_number,
  lodingadvicedate: item.advice_date ? dayjs(item.advice_date) : null,
  status: item.status,

 // ✅ VENDOR (CORRECT)
  companyName: item.vendor_name,
  companyAddress: item.vendor_addresses?.[0]?.address_line1 || "",
  contactPerson: item.vendor_details?.contact_person || "",
  contactNo: item.vendor_details?.contact_person_no || "",

  // ✅ PLANT (CORRECT)
  plantName: item.plant_name,
  plantAddress: item.plant_details?.address || "",
 plantContactPerson: item.vendor_details?.contact_person || "", plantPhone: item.plant_details?.phone_number || "",

  // Transport
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

 items: item.items?.map((itm) => ({
    id: itm.id,
    product: itm.product,
    product_name: itm.product_name,
    hsn_code: itm.hsn_code,
    required_qty: itm.required_qty,
    actual_qty: itm.actual_qty,
    variance: itm.variance,
  })) || [],
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
        advice_date: values.lodingadvicedate
    ? dayjs(values.lodingadvicedate).format("YYYY-MM-DD")
    : null,

  invoice_number: values.invoiceNo,
  status: values.status,
        assignment: selectedRecord.assignment,

        transporter_name: values.transporter,
        vehicle_no: values.vehicleNo,
        driver_name: values.driverName,
        driver_contact: values.driverContact,
        vendor_name: selectedRecord.vendor_name,
plant_name: selectedRecord.plant_name,
vendor_address: selectedRecord.vendor_address,
plant_address: selectedRecord.plant_address,
vendor_gstin: selectedRecord.vendor_gstin,
plant_gstin: selectedRecord.plant_gstin,

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

       items: values.items.map((itm) => ({
  id: itm.id,
  product: itm.product,
  loading_advice: selectedRecord.id,
  product_name: itm.product_name,
  hsn_code: itm.hsn_code,
  required_qty: itm.required_qty,
  actual_qty: itm.actual_qty,
  variance: itm.variance,
}))

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

 const handleOpenView = async (record) => {
  try {
    const item = await getLoadingAdviceById(record.id);

    viewForm.setFieldsValue({
      invoiceNo: item.invoice_number,
      lodingadvicedate: item.advice_date
        ? dayjs(item.advice_date)
        : null,
      status: item.status,

      // ✅ VENDOR (CORRECT)
  companyName: item.vendor_name,
  companyAddress: item.vendor_addresses?.[0]?.address_line1 || "",
  contactPerson: item.vendor_details?.contact_person || "",
  contactNo: item.vendor_details?.contact_person_no || "",

  // ✅ PLANT (CORRECT)
  plantName: item.plant_name,
  plantAddress: item.plant_details?.address || "",
  plantContactPerson: item.vendor_details?.contact_person || "",
  plantPhone: item.plant_details?.phone_number || "",

      // Transport
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

       items: item.items?.map((itm) => ({
    id: itm.id,
    product_name: itm.product_name,
    hsn_code: itm.hsn_code,
    required_qty: itm.required_qty,
    actual_qty: itm.actual_qty,
    variance: itm.variance,
  })) || [],
    });

    setSelectedRecord(item);
    setIsViewModalOpen(true);
  } catch (error) {
    console.error("View fetch failed:", error);
    message.error("Failed to load details");
  }
};


 

  // Columns - removed Assign button; Admin can only approve pending ones
  const columns = [
    {
       title: <span className="text-amber-700 font-semibold">Advice No</span>,
      dataIndex: "advice_no",
      render: (t) => <span className="text-amber-800">{t}</span>,

    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoiceNo",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },

  
    {
      title: <span className="text-amber-700 font-semibold">Loading Advice Date</span>,
      dataIndex: "lodingadvicedate",
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
      width:150,
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Pending: "bg-yellow-100 text-yellow-700",
         
          "Pending Approval": "bg-orange-100 text-orange-700",
          Approved: "bg-green-100 text-green-700",
          Delivered:" bg-green-100 text-green-700",
          "In-Transit":"bg-orange-100 text-orange-700",
         "Out for delivery":"bg-blue-100 text-blue-700"


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
       render: (_, record) => {
    const showEdit =
      record.driverName && record.vehicleNo && record.driverName !== "-" && record.vehicleNo !== "-";

    return (
      <div className="flex gap-3">
        <EyeOutlined
          className="cursor-pointer! text-blue-500!"
          onClick={() => handleOpenView(record)}
        />

        {showEdit && (
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleOpenEdit(record)}
          />
        )}
      </div>
    );
  },
    },
  ];
const getAllowedStatus = (formInstance) => {
  const currentStatus = formInstance.getFieldValue("status");
  const driver = formInstance.getFieldValue("driverName");
  const vehicle = formInstance.getFieldValue("vehicleNo");
  const items = formInstance.getFieldValue("items") || [];

  const hasDriverVehicle =
    driver && vehicle && driver !== "-" && vehicle !== "-";

  const hasActualQty = items.some(
    (itm) => Number(itm.actual_qty) > 0
  );

  // ❌ No driver/vehicle → restrict
  if (!hasDriverVehicle) {
    return ["Pending"];
  }

  // ❌ Driver present but no actual qty → only till Approved
  if (hasDriverVehicle && !hasActualQty) {
    return [ "Approved"];
  }

  // ✅ ⭐ SPECIAL CASE (your requirement)
  if (currentStatus === "Approved" && hasActualQty) {
    return ALL_STATUS; // allow everything
  }

  // ✅ Default flow
  return statusFlow[currentStatus] || [];
};
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
                    plantAddress: payload.plantAddress,
                    plantContactPerson: payload.plantContactPerson,
                    plantPhone: payload.plantPhone,
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
              disabled
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
    disabled={disabled && !isEditModalOpen}
  >
   {getAllowedStatus(formInstance).map((status) => (   <Option key={status} value={status}>
        {status}
      </Option>
    ))}
  </Select>
</Form.Item>
        </Col>
      </Row>

      {/* Company Details */}
      <Row gutter={24}>
        <Col span={24}>
          <h6 className="text-amber-600 ">Vendor Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Vendor Name" name="companyName" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Address" name="companyAddress">
            <Input disabled />
          </Form.Item>
        </Col>

          <Col span={6}>
         <Form.Item label="Phone" name="contactNo">
    <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
         <Form.Item label="Contact Person" name="contactPerson">
    <Input disabled />
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
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Address" name="plantAddress">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Contact Person" name="plantContactPerson">
  <Input disabled />
</Form.Item>
</Col>
<Col span={6}>
<Form.Item label="Phone" name="plantPhone">
  <Input disabled />
</Form.Item>
</Col>
      </Row>

      {/* Item Details */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 ">Items Details</h6>
        </Col>

        <Form.List name="items">
  {(fields) => (
    <>
      {fields.map(({ key, name }) => (
        <Row gutter={16} key={key} style={{ width: "100%" }} className="mt-2 ml-2! mr-2! border border-amber-200 rounded-lg p-2">
        

          <Col span={6}>
            <Form.Item label="Item Name" name={[name, "product_name"]}>
              <Input disabled className="w-full!"/>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Req. Qty" name={[name, "required_qty"]}>
              <Input disabled className="w-full!"/>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Actual Qty" name={[name, "actual_qty"]}>
              <Input disabled className="w-full!"/>
            </Form.Item>
          </Col>
            <Col span={6}>
            <Form.Item label="Variance" name={[name, "variance"]}>
              <Input disabled className="w-full!"/>
            </Form.Item>
          </Col>
        </Row>
      ))}
    </>
  )}
</Form.List>

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
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle Out Time" name="vehicleOutTime">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Tare Weight (KG)" name="tareWeight">
            <Input type="number" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Net Weight (KG)" name="netWeight">
            <Input type="number" disabled />
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
          <Button
  icon={<DownloadOutlined />}
  onClick={handleExport}
  className="border-amber-400! text-amber-700! hover:bg-amber-100!"
>
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