import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, DatePicker, Row, Col, Select } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined, EditOutlined, FilterOutlined, TruckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const poJSON = {
  initialData: [
    {
      key: 1, orderNo: "PO-2025-001", orderDate: "2025-10-01", wayBill: "WB123", estimateDeliveryDate: "2025-10-15", status: "Pending",
      vendorName: "Global Suppliers Co.", vendorAddress: "456 Commerce St, NY", deliveryAddress: " Manufacturing Hub 1",
      vendorGSTIN: "GSTEB001", vendorContactPerson: "Alice Johnson", vendorPhoneNumber: "9876543210",
      plantName: "Manufacturing Hub 1", plantCode: "P-MH1", plantGSTIN: "GSTMA001", plantAddress: "123 Industrial Rd, CA",
      plantContactPerson: "Bob Williams", plantPhoneNumber: "0123456789",
      products: [{ productId: "PROD-A", productName: "Raw Material X", qty: 1000,  uom: "Kgs" }],
      vehicleNo: "", driverName: "", driverContact: "", insuranceValidUpto: "", puValidUpto: "", fitnessValidUpto: "",deliveryDate: "",
        },
    {
        key: 2, orderNo: "PO-2025-002", orderDate: "2025-11-05", wayBill: "WB456", estimateDeliveryDate: "2025-11-20", status: "Approved",
        vendorName: "Local Steel Traders", vendorAddress: "789 Main Ave, TX", deliveryAddress: "Plant Gate B",
        vendorGSTIN: "GSTLT002", vendorContactPerson: "Charles Davis", vendorPhoneNumber: "9988776655",
        plantName: "Assembly Unit 2", plantCode: "P-AU2", plantGSTIN: "GSTAS002", plantAddress: "55 Logistics Pkwy, FL",
        plantContactPerson: "Diana Prince", plantPhoneNumber: "0987654321",
        products: [{ productId: "PROD-B", productName: "Component Y", qty: 500, uom: "Pcs" }],
        vehicleNo: "MH12AB4567", driverName: "Ram Singh", driverContact: "9123456789", insuranceValidUpto: "2026-05-20", puValidUpto: "2026-06-01", fitnessValidUpto: "2026-07-15" ,deliveryDate: "2025-11-18",
    }
  ]
};

export default function PurchaseOrderList() {
  const [modalState, setModalState] = useState({ open: false, mode: null }); 
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState(poJSON.initialData);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const mapRecordToFormValues = (record) => {
    if (!record) return {};
    const dateFields = ["orderDate", "estimateDeliveryDate", "insuranceValidUpto", "puValidUpto", "fitnessValidUpto", "deliveryDate"];
    const formatted = { ...record };
    dateFields.forEach(field => {
        if (record[field]) formatted[field] = dayjs(record[field]);
    });
    return formatted;
  };

  const openModal = (record, mode) => {
    setSelectedRecord(record);
    setModalState({ open: true, mode });
    form.setFieldsValue(mapRecordToFormValues(record));
  };

  const onFinish = (values) => {
    const isAssign = modalState.mode === 'assign';
    const updatedData = data.map((item) => {
      if (item.key === selectedRecord.key) {
        return {
          ...item,
          ...values,
          status: isAssign ? "Pending Approval" : (values.status || item.status),
          orderDate: values.orderDate?.format("YYYY-MM-DD"),
          estimateDeliveryDate: values.estimateDeliveryDate?.format("YYYY-MM-DD"),
          insuranceValidUpto: values.insuranceValidUpto?.format("YYYY-MM-DD"),
          puValidUpto: values.puValidUpto?.format("YYYY-MM-DD"),
          fitnessValidUpto: values.fitnessValidUpto?.format("YYYY-MM-DD"),
          deliveryDate: values.deliveryDate?.format("YYYY-MM-DD"),
        };
      }
      return item;
    });
    setData(updatedData);
    setModalState({ open: false, mode: null });
  };

  const getStatusClasses = (status) => {
    const base = "px-3 py-1 rounded-full font-semibold text-sm inline-block";
    if (status === "Pending Approval") return `${base} bg-orange-100 text-orange-700`;
    if (status === "Approved") return `${base} bg-green-100 text-green-700`;
    return `${base} bg-yellow-100 text-yellow-700`;
  };

  const columns = [
    { title: <span className="text-amber-700 font-semibold">Order No</span>, dataIndex: "orderNo",  width:100, render: (t) => <span className="text-amber-800 font-medium">{t}</span> },
    { title: <span className="text-amber-700 font-semibold">Vendor</span>, dataIndex: "vendorName", render: (t) => <span className="text-amber-800">{t}</span> },
    {
  title: <span className="text-amber-700 font-semibold">Product Name</span>,
  render: (record) => (
    <span className="text-amber-800">
      {record.products?.[0]?.productName || "-"}
    </span>
  ),
},
{
  title: <span className="text-amber-700 font-semibold">Quantity</span>,
  render: (record) => (
    <span className="text-amber-800">
      {record.products?.[0]?.qty || "-"}
    </span>
  ),
},
 { title: <span className="text-amber-700 font-semibold">Delivery Address</span>, dataIndex: "deliveryAddress", render: (d) => <span className="text-amber-800">{d}</span> },
    { title: <span className="text-amber-700 font-semibold">Status</span>, dataIndex: "status", width:180, render: (s) => <span className={getStatusClasses(s)}>{s}</span> },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,

      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined className="cursor-pointer! text-blue-500! text-lg!" onClick={() => openModal(record, 'view')} />
          {record.status !== "Approved" && (
            <EditOutlined className="cursor-pointer! text-red-500! text-lg!" onClick={() => openModal(record, 'edit')} />
          )}
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Assign</span>,
      render: (record) => (
        record.status === "Pending" ? (
          <Button icon={<TruckOutlined />} size="small" className="text-amber-500! border-amber-500! hover:bg-amber-500! hover:text-white!" onClick={() => openModal(record, 'assign')}>Assign</Button>
        ) : record.status === "Approved" ? null : <span className="text-orange-600 font-semibold">Assigned</span>
      )
    }
  ];

  const renderSection = (title, content) => (
    <>
      <div className="text-base! font-semibold! m-0! text-amber-600! mb-2!">{title}</div>
      <Row gutter={24}>{content}</Row>
    </>
  );

  const isReadonly = modalState.mode === 'view';
  const isAssigning = modalState.mode === 'assign';

  return (
   <div className="p-4">
      {/* Search Bar placed directly below the paragraph on the left */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-amber-700">Orders Assign</h1>
        <p className="text-amber-600 mb-2">Manage your pending and approved assign requests.</p>
        <Input 
          prefix={<SearchOutlined className="text-amber-600!" />} 
          placeholder="Search by Order No..." 
          className="w-64! border-amber-300! focus:border-amber-500!" 
          value={searchText} 
          onChange={e => setSearchText(e.target.value)} 
        />
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <Table columns={columns} dataSource={data.filter(i => i.orderNo.toLowerCase().includes(searchText.toLowerCase()))} pagination={false} rowKey="key" />
      </div>

      <Modal 
        title={<span className="text-amber-700 font-semibold">{modalState.mode?.toUpperCase()} Order</span>} 
        open={modalState.open} 
        onCancel={() => setModalState({ open: false, mode: null })} 
        footer={isReadonly ? null : [<Button key="1" onClick={() => setModalState({ open: false, mode: null })}>Cancel</Button>, <Button key="2" type="primary" className="bg-amber-600" onClick={() => form.submit()}>Submit</Button>]} 
        width={1000}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          
          {renderSection("Transport Detail", <>
           <Col span={4}>
  <Form.Item
    label="Vehicle No."
    name="vehicleNo"
    rules={[
      { required: true, message: "Please enter the Vehicle Number" },
      { pattern: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, message: "Enter valid Vehicle No. (e.g., MH12AB1234)" }
    ]}
  >
    <Input disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="Driver Name"
    name="driverName"
    rules={[
      { required: true, message: "Please enter the Driver Name" },
        ]}
  >
    <Input disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="Driver Contact"
    name="driverContact"
    rules={[
      { required: true, message: "Please enter the Driver Contact" },
      { pattern: /^[0-9]{10}$/, message: "Enter a valid 10-digit mobile number" }
    ]}
  >
    <Input disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="Insurance Valid"
    name="insuranceValidUpto"
    rules={[{ required: true, message: "Please select the Insurance Validity Date" }]}
  >
    <DatePicker className="w-full" disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="PU Valid"
    name="puValidUpto"
    rules={[{ required: true, message: "Please select the PU Validity Date" }]}
  >
    <DatePicker className="w-full" disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={4}>
  <Form.Item
    label="Fitness Valid"
    name="fitnessValidUpto"
    rules={[{ required: true, message: "Please select the Fitness Validity Date" }]}
  >
    <DatePicker className="w-full" disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={4}>
 <Form.Item
  label="Delivery Date"
  name="deliveryDate"
  rules={[{ required: true, message: "Please select the Delivery Date" }]}
>
  <DatePicker
    className="w-full"
    disabled={isReadonly}
    disabledDate={(current) => current && current < dayjs().startOf("day")}
  />
</Form.Item>
</Col>
   </>)}
          {renderSection("Order Details", <>
            <Col span={4}><Form.Item label="Order No" name="orderNo"><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Order Date" name="orderDate" rules={[{required: true}]}><DatePicker className="w-full" disabled/></Form.Item></Col>
            <Col span={4}><Form.Item label="Est. Delivery Date" name="estimateDeliveryDate" rules={[{required: true}]}><DatePicker className="w-full" disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Way Bill" name="wayBill" rules={[{required: true}]}><Input disabled/></Form.Item></Col>
            <Col span={4}><Form.Item label="Status" name="status"><Select disabled={isReadonly || isAssigning} options={[{label: 'Pending', value: 'Pending'}, {label: 'Pending Approval', value: 'Pending Approval'}]} /></Form.Item></Col>
            <Col span={4}><Form.Item label="Delivery Address" name="deliveryAddress"><Input disabled /></Form.Item></Col>
          </>)}

          {renderSection("Vendor Detail", <>
            <Col span={4}><Form.Item label="Vendor Name" name="vendorName" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Address" name="vendorAddress" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="GSTIN" name="vendorGSTIN" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Contact Person" name="vendorContactPerson" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Phone" name="vendorPhoneNumber" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
          </>)}

          {renderSection("Plant Detail", <>
            <Col span={4}><Form.Item label="Plant Name" name="plantName" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Plant Code" name="plantCode" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="GSTIN" name="plantGSTIN" rules={[{required: true}]}><Input disabled/></Form.Item></Col>
            <Col span={4}><Form.Item label="Address" name="plantAddress" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
            <Col span={4}><Form.Item label="Contact Person" name="plantContactPerson" rules={[{required: true}]}><Input disabled /></Form.Item></Col>
          </>)}


          <div className="text-base! font-semibold! text-amber-600! mb-2!">Product Details</div>
          <Form.List name="products">
            {(fields) => fields.map(({ key, name }) => (
              <Row gutter={24} key={key}>
                <Col span={6}><Form.Item name={[name, 'productName']} label="Product"><Input disabled /></Form.Item></Col>
                <Col span={6}><Form.Item name={[name, 'productId']} label="Product ID"><Input disabled /></Form.Item></Col>
                 <Col span={4}><Form.Item name={[name, 'qty']} label="Qty"><Input disabled /></Form.Item></Col>
                  <Col span={4}><Form.Item name={[name, 'uom']} label="UOM"><Input disabled /></Form.Item></Col>
              
                   </Row>
            ))}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}