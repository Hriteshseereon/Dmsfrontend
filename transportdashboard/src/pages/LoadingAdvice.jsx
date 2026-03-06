import React, { useState, useEffect} from "react";
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
import { getLoadingAdvice ,getLoadingAdviceById,updateLoadingAdvice} from "../api/loadingAdvice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const dummySaleOrders = [
  {
    sale_order_no: "SO-001",
    customer_name: "ABC Retail",
    delivery_address: "Bhubaneswar",
    items: [
      { item: "Palm Oil", qty: 100 ,delivered_qty: 80},
      { item: "Sunflower Oil", qty: 50 ,delivered_qty: 40},
    ],
  },
  {
    sale_order_no: "SO-002",
    customer_name: "XYZ Traders",
    delivery_address: "Cuttack",
    items: [
      { item: "Coconut Oil", qty: 80 ,delivered_qty: 60},
    ],
  },
];

export default function LoadingAdvice() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState([]);
  const uomOptions = ["Kgs", "Liters", "Nos"];
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  

useEffect(() => {
  fetchLoadingAdvice();
}, []);

const fetchLoadingAdvice = async () => {
  try {
   const res = await getLoadingAdvice();
console.log(res); // 🔥 IMPORTANT
   const mapped = res.map((item, index) => ({
      key: item.id,

      adviceNo: item.advice_no,
      invoice_number:item.invoice_number,
      adviceDate: item.advice_date,
      poNo: item.po_no,
      wayBill: item.way_bill,
      deliveryAddress: item.delivery_address,
      status: item.status,

      vendorName: item.vendor_name,
      vendorAddress: item.vendor_addresses?.[0]?.address_line1,
      vendorContactPerson: item.vendor_details?.contact_person,
      vendorPhoneNumber: item.vendor_details?.contact_person_no,

      plantName: item.plant_name,
      plantAddress: item.plant_details?.address,
      plantPhoneNumber: item.plant_details?.phone_number,

      vehicleNo: item.vehicle_no,
      driverName: item.driver_name,
      driverContact: item.driver_contact,

      insuranceValidUpto: item.insurance_valid_upto,
      puValidUpto: item.pu_valid_upto,
      fitnessValidUpto: item.fitness_valid_upto,
      delivery_date: item.delivery_date,

      vehicleInTime: item.vehicle_in_time,
      vehicleOutTime: item.vehicle_out_time,

      tareWeights: item.tare_weight_kg,
      grossWeights: item.gross_weight_kg,
      netWeight: item.net_weight_kg,

      items: item.items?.map((i, idx) => ({
        key: i.id,
        slNo: idx + 1,
        itemName: i.product_name,
        itemCode: i.product,
        actualQty: parseFloat(i.actual_qty) || 0,
reqQty: parseFloat(i.required_qty) || 0,
variance: parseFloat(i.variance) || 0, uom: i.uom_details?.unit_name,
      })),
    }));

    setData(mapped);
  } catch (err) {
    console.log(err);
  }
};
const mapApiToForm = (item) => {
  return {
    key: item.id,

    adviceNo: item.advice_no,
    adviceDate: item.advice_date,
    invoice_number: item.invoice_number,
    wayBill: item.way_bill,
    deliveryAddress: item.delivery_address,
    status: item.status,

    vendorName: item.vendor_name,
    vendorAddress: item.vendor_addresses?.[0]?.address_line1,
    vendorContactPerson: item.vendor_details?.contact_person,
    vendorPhoneNumber: item.vendor_details?.contact_person_no,

    plantName: item.plant_name,
    plantAddress: item.plant_details?.address,
    plantPhoneNumber: item.plant_details?.phone_number,

    vehicleNo: item.vehicle_no,
    driverName: item.driver_name,
    driverContact: item.driver_contact,

    insuranceValidUpto: item.insurance_valid_upto,
    puValidUpto: item.pu_valid_upto,
    fitnessValidUpto: item.fitness_valid_upto,
    delivery_date: item.delivery_date,

    vehicleInTime: item.vehicle_in_time,
    vehicleOutTime: item.vehicle_out_time,

    tareWeights: item.tare_weight_kg,
    grossWeights: item.gross_weight_kg,
    netWeight: item.net_weight_kg,

    items: item.items?.map((i, idx) => ({
      key: i.id,
      slNo: idx + 1,
      itemName: i.product_name,
      itemCode: i.product,
     actualQty: parseFloat(i.actual_qty) || 0,
reqQty: parseFloat(i.required_qty) || 0,
variance: parseFloat(i.variance) || 0, uom: i.uom_details?.unit_name,
    })),
  };
};


const handleEdit = async (record) => {
  try {
   const res = await getLoadingAdviceById(record.key);
const data = res; // ✅ FIX

const mapped = mapApiToForm(data);

setSelectedRecord(mapped);
 setItems([...mapped.items]);
editForm.setFieldsValue(mapRecordToFormValues(mapped));

setIsEditModalOpen(true);
  } catch (err) {
    console.log(err);
  }
};
const handleView = async (record) => {
  try {
   const res = await getLoadingAdviceById(record.key);
const data = res; // ✅ FIX

const mapped = mapApiToForm(data);

setSelectedRecord(mapped);
viewForm.setFieldsValue(mapRecordToFormValues(mapped));

setIsViewModalOpen(true);
  } catch (err) {
    console.log(err);
  }
};

  const filteredData = data.filter(
    (item) =>
      item.adviceNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.poNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.vendorName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.plantName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchText.toLowerCase())
  );

 const handleFormSubmit = async () => {
  try {
    const values = await editForm.validateFields();
    console.log("FINAL ITEMS BEFORE PATCH", items); // ✅ HERE
    const currentRecord = selectedRecord;

    const payload = {
      // 🔥 map UI → API fields
      advice_date: values.adviceDate?.format("YYYY-MM-DD"),
      way_bill: values.wayBill,
      delivery_address: values.deliveryAddress,

      vehicle_no: values.vehicleNo,
      driver_name: values.driverName,
      driver_contact: values.driverContact,

      insurance_valid_upto: values.insuranceValidUpto?.format("YYYY-MM-DD"),
      pu_valid_upto: values.puValidUpto?.format("YYYY-MM-DD"),
      fitness_valid_upto: values.fitnessValidUpto?.format("YYYY-MM-DD"),
      delivery_date: values.delivery_date?.format("YYYY-MM-DD"),

      vehicle_in_time: values.vehicleInTime,
      vehicle_out_time: values.vehicleOutTime,

      tare_weight_kg: values.tareWeights,
      gross_weight_kg: values.grossWeights,
      net_weight_kg: values.netWeight,

      status: values.status,

      // 🔥 IMPORTANT: items mapping
     items: items.map((i) => ({
  id: i.key,
  actual_qty: Number(i.actualQty) || 0,
  required_qty: Number(i.reqQty) || 0,
})),
    };

    console.log("PATCH PAYLOAD", payload);

    // ✅ API CALL
    await updateLoadingAdvice(currentRecord.key, payload);

    // ✅ refresh table
    await fetchLoadingAdvice();

    setIsEditModalOpen(false);
    setSelectedRecord(null);
    setItems([]);

  } catch (err) {
    console.log(err);
  }
};
  const getStatusClasses = (status) => {
    const base = "px-3 py-1 rounded-full font-semibold inline-block text-sm";

    switch (status) {
      
      case "In-Transit":
        return `${base} bg-blue-100! text-blue-700!`;
      case "Out for delivery":
        return `${base} bg-yellow-100! text-yellow-700!`;
      case "Delivered":
        return `${base} bg-green-100! text-green-700!`;
      default:
        return `${base} bg-orange-100! text-orange-700!`;
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

 
const getAllowedStatusOptions = (currentStatus) => {
  const flow = {
    Approved: ["In-Transit", "Out for delivery", "Delivered"],
    "In-Transit": ["Out for delivery", "Delivered"],
    "Out for delivery": ["Delivered"],
    Delivered: ["Delivered"],
  };

  return flow[currentStatus] || [];
};

 const updateItem = (key, field, value) => {
  setItems((prev) =>
    prev.map((item) => {
      if (item.key === key) {
        const newValue = Number(value) || 0;

        const updatedItem = {
          ...item,
          [field]: newValue,
        };

        const actualQty =
          field === "actualQty" ? newValue : Number(item.actualQty) || 0;

        const reqQty =
          field === "reqQty" ? newValue : Number(item.reqQty) || 0;

        updatedItem.variance = actualQty - reqQty;

        return updatedItem;
      }
      return item;
    })
  );
};

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Advice No</span>,
      dataIndex: "adviceNo",
      render: (text) => <span className="text-amber-800 font-medium">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoice_number",
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
      {record.items?.map(i => i.itemName).join(", ") }
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
           onClick={() => handleView(record)}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500! hover:text-red-700! text-lg!"
            onClick={() => handleEdit(record)}
          />
        </div>
      ),
    },
  ];

const renderSaleOrderDetails = () => {
  if (!selectedRecord || selectedRecord.status !== "In-Transit") return null;

  const saleOrders = dummySaleOrders || [];

  if (!saleOrders.length) return null;

  return (
    <>
      <h6 className="text-amber-500 pb-2 font-semibold">
        Sale Order Details
      </h6>

      {saleOrders.map((order, index) => (
        <div
          key={index}
              className="border border-amber-200 rounded-lg p-3 mb-3"
       >
           <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                label="Sale Order No"
                name={[index, "sale_order_no"]}
                initialValue={order.sale_order_no}
              >
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Customer Name"
                name={[index, "customer_name"]}
                initialValue={order.customer_name}
              >
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Delivery Address"
                name={[index, "delivery_address"]}
                initialValue={order.delivery_address}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          {order.items?.map((item, i) => (
            <Row gutter={24} key={i}>
              <Col span={6}>
                <Form.Item
                  label="Item"
                  name={[index, "item"]}
                  initialValue={item.item}
                >
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Quantity"
                  name={[index, "qty"]}
                  initialValue={item.qty}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
               <Col span={6}>
                <Form.Item
                  label="Delivered Quantity"
                  name={[index, "delivered_qty"]}
                  initialValue={item.delivered_qty}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          ))}
        </div>
      ))}
    </>
  );
};
  const renderVendorPlantDetails = (disabled = false) => {
    return (
      <>
        <div className="text-base font-semibold m-2 text-amber-600 mt-2!">
          Vendor Details
        </div>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Vendor Name"
              name="vendorName"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Address"
              name="vendorAddress"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Contact Person"
              name="vendorContactPerson"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled/>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Phone Number"
              name="vendorPhoneNumber"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <div className="text-base font-semibold m-0 text-amber-600 mb-2">
          Plant Details
        </div>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Plant Name"
              name="plantName"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
         
          
          <Col span={6}>
            <Form.Item
              label="Address"
              name="plantAddress"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Contact Person"
              name="vendorContactPerson"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
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
    <div className="text-base font-semibold m-0 text-amber-600 mb-2 ">
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
    <div className="text-base font-semibold m-0 text-amber-600 mb-3">
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
                 disabled={disabled} 
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
        width:20,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Item Name",
      dataIndex: "itemName",
         width:20,
      render: (text) => <span>{text}</span>,
    },
   
   
    {
      title: "Required Qty",
      dataIndex: "reqQty",
           width:20,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Actual Qty",
      dataIndex: "actualQty",
         width:20,
    render: (_, record) => (
  <Input
    type="number"
    value={record.actualQty}
      disabled={disabled} 
    onChange={(e) =>
      updateItem(record.key, "actualQty", e.target.value)
    }
    placeholder="0"
  />
)
    },
    {
      title: "Variance",
      dataIndex: "variance",
      width:20,
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
           width:20,
      render: (text, record) =>
        disabled ? (
          <span>{text}</span>
        ) : (
          <Select
            value={text}
            onChange={(value) => updateItem(record.key, "uom", value)}
            options={uomOptions.map((uom) => ({
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
      <div className="flex justify-between items-center mb-2 ">
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
              <Form.Item label="Invoice No" name="invoice_number">
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
  {renderTransportDetails(false)}
         {renderLoadingDetails(false)}
       
{renderItemsTable(false)}

{renderVendorPlantDetails(false)}

{renderSaleOrderDetails()}
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
              <Form.Item label="Invoice No" name="invoice_number">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Way Bill" name="wayBill">
                <Input disabled />
              </Form.Item>
            </Col>
            
          </Row>
          
{renderTransportDetails(true)}
{renderLoadingDetails(true)}
{renderItemsTable(true)}
{renderVendorPlantDetails(true)}
{renderSaleOrderDetails()}

        </Form>
      </Modal>
    </div>
  );
}