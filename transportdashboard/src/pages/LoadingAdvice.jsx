import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
  Row,
  Col,
  Select,
  Space,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const loadingAdviceJSON = {
  initialData: [
    {
      key: 1,
      adviceNo: "LA-2025-001",
      adviceDate: "2025-11-20",
      poNo: "PO-2025-001",
      deliveryAddress: "Plant Gate A, Manufacturing Hub 1",
      wayBill: "WB123",
      status: "Approved",
      vendorName: "Global Suppliers Co.",
      vendorAddress: "456 Commerce St, NY",
      vendorGSTIN: "GSTEB001",
      vendorContactPerson: "Alice Johnson",
      vendorPhoneNumber: "9876543210",
      plantName: "Manufacturing Hub 1",
      plantCode: "P-MH1",
      plantGSTIN: "GSTMA001",
      plantAddress: "123 Industrial Rd, CA",
      plantContactPerson: "Bob Williams",
      plantPhoneNumber: "0123456789",
      vehicleNo: "MH12AB4567",
      driverName: "Ram Singh",
      driverContact: "9123456789",
      insuranceValidUpto: "2026-05-20",
      puValidUpto: "2026-06-01",
      fitnessValidUpto: "2026-07-15",
      delivery_date: "2025-11-21",
     
      items: [
        {
          key: "item-1",
          slNo: 1,
          itemName: "Raw Material X",
          itemCode: "ITEM-001",
          itemDescription: "Raw Material X",
          reqQty: 1000,
          
          variance: "",
          uom: "Kgs",
        },
        {
          key: "item-2",
          slNo: 2,
          itemName: "Component A",
          itemCode: "ITEM-002",
          itemDescription: "Component A",
          reqQty: 500,
         
          variance: "",
          uom: "Pcs",
        },
      ],
    },
    {
      key: 2,
      adviceNo: "LA-2025-002",
      adviceDate: "2025-11-22",
      poNo: "PO-2025-002",
      deliveryAddress: "Plant Gate B, Manufacturing Hub 1",
      wayBill: "WB456",
      status: "In Transit",
      vendorName: "Local Steel Traders",
      vendorAddress: "789 Main Ave, TX",
      vendorGSTIN: "GSTLT002",
      vendorContactPerson: "Charles Davis",
      vendorPhoneNumber: "9988776655",
      plantName: "Assembly Unit 2",
      plantCode: "P-AU2",
      plantGSTIN: "GSTAS002",
      plantAddress: "55 Logistics Pkwy, FL",
      plantContactPerson: "Diana Prince",
      plantPhoneNumber: "0987654321",
      vehicleNo: "DL05CD9876",
      driverName: "Gopal Varma",
      driverContact: "9222333444",
      insuranceValidUpto: "2026-01-01",
      puValidUpto: "2026-02-01",
      fitnessValidUpto: "2026-03-01",
      delivery_date: "2025-11-23",
      
      items: [
        {
          key: "item-1",
          slNo: 1,
          itemName: "Steel Bars",
          itemCode: "ITEM-003",
          itemDescription: "Steel Bars",
          reqQty: 800,
          actualQty: 800,
          variance: 0,
          uom: "Kgs",
        },
      ],
    },
  ],
  statusOptions: ["Approved", "In Transit", "Out for Delivery", "Delivered"],
  uomOptions: ["Kgs", "Pcs", "Ltrs", "Tons", "Meters"],
};


export default function LoadingAdvice() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState(loadingAdviceJSON.initialData);
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState([]);

  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const filteredData = data.filter(
    (item) =>
      item.adviceNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.poNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.vendorName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.plantName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleFormSubmit = () => {
    editForm.validateFields().then((values) => {
      const currentRecord = selectedRecord;

      const payload = {
        ...currentRecord,
        ...values,
        items: items,
        adviceDate: values.adviceDate?.format("YYYY-MM-DD"),
        insuranceValidUpto: values.insuranceValidUpto?.format("YYYY-MM-DD"),
        puValidUpto: values.puValidUpto?.format("YYYY-MM-DD"),
        fitnessValidUpto: values.fitnessValidUpto?.format("YYYY-MM-DD"),
        delivery_date: values.delivery_date?.format("YYYY-MM-DD"),
      };

      setData((prev) =>
        prev.map((item) =>
          item.key === currentRecord.key ? { ...payload, key: item.key } : item
        )
      );

      setIsEditModalOpen(false);
      setSelectedRecord(null);
      setItems([]);
    });
  };

  const getStatusClasses = (status) => {
    const base = "px-3 py-1 rounded-full font-semibold inline-block text-sm";

    switch (status) {
      
      case "In Transit":
        return `${base} bg-blue-100 text-blue-700`;
      case "Out for Delivery":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "Delivered":
        return `${base} bg-green-100 text-green-700`;
      default:
        return `${base} bg-red-100 text-red-700`;
    }
  };

  const mapRecordToFormValues = (record) => {
    if (!record) return {};
    return {
      ...record,
      adviceDate: record.adviceDate
        ? dayjs(record.adviceDate, "YYYY-MM-DD")
        : null,
      insuranceValidUpto: record.insuranceValidUpto
        ? dayjs(record.insuranceValidUpto, "YYYY-MM-DD")
        : null,
      puValidUpto: record.puValidUpto
        ? dayjs(record.puValidUpto, "YYYY-MM-DD")
        : null,
      fitnessValidUpto: record.fitnessValidUpto
        ? dayjs(record.fitnessValidUpto, "YYYY-MM-DD")
        : null,
      delivery_date: record.delivery_date
        ? dayjs(record.delivery_date, "YYYY-MM-DD")
        : null,
    };
  };

  const addNewItem = () => {
    const newItem = {
      key: `item-${Date.now()}`,
      slNo: items.length + 1,
      itemCode: "",
      itemDescription: "",
      reqQty: 0,
      actualQty: 0,
      variance: 0,
      uom: "Kgs",
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (key) => {
    const updatedItems = items.filter((item) => item.key !== key);
    // Renumber SL No
    const renumberedItems = updatedItems.map((item, index) => ({
      ...item,
      slNo: index + 1,
    }));
    setItems(renumberedItems);
  };
const getAllowedStatusOptions = (currentStatus) => {
  const flow = {
    Approved: ["In Transit", "Out for Delivery", "Delivered"],
    "In Transit": ["Out for Delivery", "Delivered"],
    "Out for Delivery": ["Delivered"],
    Delivered: ["Delivered"],
  };

  return flow[currentStatus] || [];
};

  const updateItem = (key, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === "actualQty" || field === "reqQty") {
          const actualQty = field === "actualQty" ? parseFloat(value) || 0 : parseFloat(item.actualQty) || 0;
          const reqQty = field === "reqQty" ? parseFloat(value) || 0 : parseFloat(item.reqQty) || 0;
          updatedItem.variance = actualQty - reqQty;
        }
        
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Advice No</span>,
      dataIndex: "adviceNo",
      render: (text) => <span className="text-amber-800 font-medium">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "poNo",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    
    {
      title: <span className="text-amber-700 font-semibold">Vendor</span>,
      dataIndex: "vendorName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant</span>,
      dataIndex: "plantName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
   {
  title: <span className="text-amber-700 font-semibold">Item</span>,
  render: (record) => (
    <span className="text-amber-800">
      {record.items?.[0]?.itemName || "-"}
    </span>
  ),
}
,
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width:160,
      render: (status) => {
        return <span className={getStatusClasses(status)}>{status}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500! hover:text-blue-700! text-lg!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue(mapRecordToFormValues(record));
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500! hover:text-red-700! text-lg!"
            onClick={() => {
              setSelectedRecord(record);
              setItems(record.items || []);
              editForm.setFieldsValue(mapRecordToFormValues(record));
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const renderVendorPlantDetails = (disabled = false) => {
    return (
      <>
        <div className="text-base font-semibold m-0 text-amber-600 mb-3">
          Vendor Details
        </div>
        <Row gutter={24}>
          <Col span={4}>
            <Form.Item
              label="Vendor Name"
              name="vendorName"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Address"
              name="vendorAddress"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="GSTIN"
              name="vendorGSTIN"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Contact Person"
              name="vendorContactPerson"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled/>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Phone Number"
              name="vendorPhoneNumber"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <div className="text-base font-semibold m-0 text-amber-600 mb-3 mt-4">
          Plant Details
        </div>
        <Row gutter={24}>
          <Col span={4}>
            <Form.Item
              label="Plant Name"
              name="plantName"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Plant Code"
              name="plantCode"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="GSTIN"
              name="plantGSTIN"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Address"
              name="plantAddress"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Contact Person"
              name="plantContactPerson"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Phone Number"
              name="plantPhoneNumber"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled/>
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

const renderTransportDetails = (disabled = false) => (
  <>
    <div className="text-base font-semibold m-0 text-amber-600 mb-3 mt-4">
      Transport Details
    </div>
    <Row gutter={24}>
      <Col span={4}>
        <Form.Item label="Vehicle No." name="vehicleNo">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Driver Name" name="driverName">
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Driver Contact" name="driverContact">
          <Input disabled />
        </Form.Item>
      </Col>
     
       <Col span={4}>
        <Form.Item label="PU Valid Upto" name="puValidUpto">
          <DatePicker format="DD-MM-YYYY" className="w-full" disabled />
        </Form.Item>
      </Col>
         <Col span={4}>
        <Form.Item label="Fitness Valid Upto" name="fitnessValidUpto">
          <DatePicker format="DD-MM-YYYY" className="w-full" disabled />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Delivery Date" name="delivery_date">
          <DatePicker format="DD-MM-YYYY" className="w-full" disabled />
        </Form.Item>
      </Col>
     
       </Row>
      <Row gutter={24}>
         <Col span={4}>
        <Form.Item label="Insurance Valid Upto" name="insuranceValidUpto">
          <DatePicker format="DD-MM-YYYY" className="w-full" disabled />
        </Form.Item>
      </Col>
       
      </Row>
      
   
  </>
);
const renderLoadingDetails = (disabled = false) => (
  <>
    <div className="text-base font-semibold m-0 text-amber-600 mb-3 mt-4">
      Loading Details
    </div>
    <Row gutter={24}>
     <Col span={4}>
        <Form.Item
          label="Vehicle In Time"
          name="vehicleInTime"
          rules={[
            { required: true, message: "Please enter Vehicle In Time" },
            {
              pattern: timeRegex,
              message: "Time must be in HH:MM format (24-hour)",
            },
          ]}
        >
          <Input disabled={disabled} placeholder="HH:MM" />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item
          label="Vehicle Out Time"
          name="vehicleOutTime"
          rules={[
            { required: true, message: "Please enter Vehicle Out Time" },
            {
              pattern: timeRegex,
              message: "Time must be in HH:MM format (24-hour)",
            },
          ]}
        >
          <Input disabled={disabled} placeholder="HH:MM" />
        </Form.Item>
      </Col>
      <Col span={4}>
  <Form.Item
    label="Tare Weight (KGs)"
    name="tareWeights"
    rules={[
      { required: true, message: "Please enter valid Tare Weight (eg:10kg)" },
     
      {
        validator: (_, value) =>
          value >= 0
            ? Promise.resolve()
            : Promise.reject(),
      },
    ]}
  >
    <Input
      type="number"
      min={0}
      disabled={disabled}
      placeholder="Enter weight"
    />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="Net Weight (KGs)"
    name="netWeight"
    rules={[
      { required: true, message: "Please enter valid  Net Weight (eg:10kg" },
      
      {
        validator: (_, value) =>
          value >= 0
            ? Promise.resolve()
            : Promise.reject(),
      },
    ]}
  >
    <Input
      type="number"
      min={0}
      disabled={disabled}
      placeholder="Enter weight"
    />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="Gross Weight "
    name="grossWeights"
    rules={[
      { required: true, message: "Please enter valid Gross  Weight (eg:10kg)" },
      
      {
        validator: (_, value) =>
          value >= 0
            ? Promise.resolve()
            : Promise.reject(),
      },
    ]}
  >
    <Input
      type="number"
      min={0}
      disabled={disabled}
      placeholder="Enter weight"
    />
  </Form.Item>
</Col>

        <Col span={4}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Required" }]}
              >
               <Select
  options={getAllowedStatusOptions(editForm.getFieldValue("status")).map(
    (status) => ({
      label: status,
      value: status,
    })
  )}
/>

              </Form.Item>
            </Col>
    </Row>
  </>
);

 const renderItemsTable = (disabled = false) => {
  const itemColumns = [
    {
      title: "SL No.",
      dataIndex: "slNo",
      width: 50,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
      width: 100,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Item Code",
      dataIndex: "itemCode",
      width: 100,
      render: (text) => <span>{text}</span>,
    },
   
    {
      title: "Required Qty",
      dataIndex: "reqQty",
      width: 50,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Actual Qty",
      dataIndex: "actualQty",
      width: 50,
      render: (text, record) =>
        disabled ? (
          <span>{text}</span>
        ) : (
          <Input
            type="number"
            value={text}
            onChange={(e) =>
              updateItem(record.key, "actualQty", e.target.value)
            }
            placeholder="0"
          />
        ),
    },
    {
      title: "Variance",
      dataIndex: "variance",
      width: 50,
      render: (text) => (
        <span
          className={`font-semibold ${
            text < 0 ? "text-red-600" : text > 0 ? "text-green-600" : ""
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "UOM",
      dataIndex: "uom",
      width: 50,
      render: (text, record) =>
        disabled ? (
          <span>{text}</span>
        ) : (
          <Select
            value={text}
            onChange={(value) => updateItem(record.key, "uom", value)}
            options={loadingAdviceJSON.uomOptions.map((uom) => ({
              label: uom,
              value: uom,
            }))}
            className="w-full"
          />
        ),
    },
  ];

  const dataSource = disabled ? selectedRecord?.items || [] : items;

  return (
    <>
      <div className="flex justify-between items-center mb-3 mt-4">
        <div className="text-base font-semibold text-amber-600">
          Item Details
        </div>
      </div>

      <Table
        columns={itemColumns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 1200 }}
        rowKey="key"
        bordered
        size="small"
      />
    </>
  );
};


  return (
    <div >
      <div  className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Loading Advice</h1>
          <p className="text-amber-600">
            Manage loading advice and transport details
          </p>
        </div>
        </div>
<div className="flex justify-between items-center mb-2">
   <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search Advice No, PO, Vendor..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Button
            icon={<FilterOutlined />}
            onClick={() => setSearchText("")}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
</div>
         <div className="flex gap-2">
                  <Button
                    icon={<DownloadOutlined />}
                    className="border-amber-400! text-amber-700! hover:bg-amber-100!"
                  >
                    Export
                  </Button>
                  </div>
        


       
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: 600 }}
          rowKey="key"
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            Edit Loading Advice
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setItems([]);
        }}
        footer={null}
        width={1000}
      >
        <Form layout="vertical" form={editForm} onFinish={handleFormSubmit}>
          <Row gutter={24}>
            <Col span={4}>
              <Form.Item label="Advice No" name="adviceNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="Advice Date"
                name="adviceDate"
                rules={[{ required: true, message: "Required" }]}
              >
                <DatePicker format="DD-MM-YYYY" className="w-full" disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="PO No" name="poNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="Way Bill"
                name="wayBill"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input disabled/>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Delivery Address" name="deliveryAddress">
                <Input disabled />
              </Form.Item>
            </Col>
          
          </Row>

         {renderLoadingDetails(false)}
{renderItemsTable(false)}
{renderTransportDetails(false)}
{renderVendorPlantDetails(false)}


          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setItems([]);
              }}
              className="border-amber-400 text-amber-700 hover:bg-amber-100"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 hover:bg-amber-600 border-none"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Loading Advice
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Form layout="vertical" form={viewForm}>
          <Row gutter={24}>
            <Col span={4}>
              <Form.Item label="Advice No" name="adviceNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Advice Date" name="adviceDate">
                <DatePicker format="DD-MM-YYYY" className="w-full" disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="PO No" name="poNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Way Bill" name="wayBill">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Status" name="status">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

         {renderLoadingDetails(false)}
{renderItemsTable(true)}
{renderTransportDetails(false)}
{renderVendorPlantDetails(false)}

        </Form>
      </Modal>
    </div>
  );
}