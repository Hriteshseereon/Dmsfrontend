import React, { useState ,useEffect} from "react";
import { Table, Input, Button, Modal, Form, DatePicker, Row, Col, Select } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined, EditOutlined, FilterOutlined, TruckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {getAllAssignedOrder,getAssignedOrderById,updateAssignedOrder} from '../api/risedStatus'
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);


export default function PurchaseOrderList() {
  const [modalState, setModalState] = useState({ open: false, mode: null }); 
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);
 const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
  fetchAssignedOrders();
}, []);

const fetchAssignedOrders = async () => {
  try {
    const res = await getAllAssignedOrder();
  

   const mappedData = res.map((item) => ({
      key: item.id,   
      id: item.id,
      invoice_number: item.invoice_number,
      invoiceDate: item.created_at ? dayjs(item.created_at) : null,
      status: item.status,

      vendorName: item.vendor_name,
      deliveryAddress: item.delivery_address,
      plantName: item.plant_name,

      products: [
        {
          productName: item.product_name,
          qty: item.total_qty,
          productId: item.invoice,
          uom: item.unit_name,   
        },
      ],

         }));

    setData(mappedData);
   


  } catch (error) {
    console.error("Error fetching assigned orders:", error);
  }
};
const handleAssignClick = async (id,mode) => {
  try {
    const res = await getAssignedOrderById(id);

    setSelectedRecord(res);
    setModalState({ open: true, mode });

  form.setFieldsValue({
  vehicleNo: res.vehicle_number,
  driverName: res.driver_name,
  driverContact: res.driver_contact,

  insuranceValidUpto: res.insurance_valid_upto ? dayjs(res.insurance_valid_upto) : null,
  puValidUpto: res.pu_valid_upto ? dayjs(res.pu_valid_upto) : null,
  fitnessValidUpto: res.fitness_valid_upto ? dayjs(res.fitness_valid_upto) : null,
  deliveryDate: res.delivery_date ? dayjs(res.delivery_date) : null,

  invoice_number: res.invoice_number,
  wayBill: res.way_bill,
  status: res.status === "Pending" ? "Pending Approval" : res.status,
  deliveryAddress: res.delivery_address,

  vendorName: res.vendor_details?.name,
vendorContactPerson: res.vendor_details?.contact_person,
vendorPhoneNumber: res.vendor_details?.contact_person_no,
vendorAddress: res.vendor_addresses?.[0]?.address_line1,
plantName: res.plant_details?.name,
plantAddress: res.plant_details?.address,
plantPhoneNumber: res.plant_details?.phone_number,

  // ✅ PRODUCT (FIX HERE)
  products: [
    {
      productName: res.product_name,
      qty: res.total_qty,   // ❗ you used res.qty (wrong)
      uom: res.invoice_items?.[0]?.uom_details?.unit_name,            // not in API
    },
  ],
});


  } catch (error) {
    console.error("Error fetching assigned order:", error);
  }
};


 



 const onFinish = async (values) => {
  try {
    const payload = {
      vehicle_number: values.vehicleNo,
      driver_name: values.driverName,
      driver_contact: values.driverContact,
      insurance_valid_upto: values.insuranceValidUpto?.format("YYYY-MM-DD"),
      pu_valid_upto: values.puValidUpto?.format("YYYY-MM-DD"),
      fitness_valid_upto: values.fitnessValidUpto?.format("YYYY-MM-DD"),
      delivery_date: values.deliveryDate?.format("YYYY-MM-DD"),
      status: "Pending", 
    };

    await updateAssignedOrder(selectedRecord.id, payload);

    fetchAssignedOrders(); // refresh table
    setModalState({ open: false, mode: null });
    form.resetFields();

  } catch (error) {
    console.error("Update failed:", error);
  }
};


  const getStatusClasses = (status) => {
    const base = "px-3 py-1 rounded-full font-semibold text-sm inline-block";
  if (status === "Pending Approval" || status === "Pending"  )return `${base} bg-green-100! text-green-700!`
      if (status === "Approved") return `${base} bg-green-100! text-green-700!`;
    return `${base} bg-yellow-100! text-yellow-700!`;
  };

  const columns = [
  
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
    { title: <span className="text-amber-700 font-semibold">Status</span>,width:180, dataIndex: "status", 
      render: (s) => {
  const displayStatus = s === "Pending" ? "Pending Approval" : s;
  return <span className={getStatusClasses(displayStatus)}>{displayStatus}</span>;
} },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,

      render: (record) => (
        <div className="flex gap-3">
        <EyeOutlined
  className="cursor-pointer! text-blue-500! text-lg!"
  onClick={() => handleAssignClick(record.id, "view")}
/>  {record.status !== "Approved" && (
          <EditOutlined
  className="cursor-pointer! text-red-500! text-lg!"
  onClick={() => handleAssignClick(record.id, "assign")}
/>   )}
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Assign</span>,
      render: (record) => (
        record.status === "Assigned" ? (
          <Button icon={<TruckOutlined />} size="small" className="text-amber-500! border-amber-500! hover:bg-amber-500! hover:text-white!" onClick={() => handleAssignClick(record.id, "assign")}
>Assign</Button>
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
         <Button
                    icon={<FilterOutlined />}
                    onClick={() => setSearchText("")}
                    className="border-amber-400! text-amber-700! hover:bg-amber-100!"
                  >
                    Reset
                  </Button>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <Table columns={columns}dataSource={data.filter(i =>
  (i.invoice_number || "")
    .toLowerCase()
    .includes(searchText.toLowerCase())
)}
 pagination={false} rowKey="id"/>
      </div>

      <Modal 
        title={<span className="text-amber-700 font-semibold">{modalState.mode?.toUpperCase()} Order</span>} 
        open={modalState.open} 
        onCancel={() => setModalState({ open: false, mode: null })} 
      footer={
  isReadonly
    ? null
    : [
        <Button key="1" onClick={() => setModalState({ open: false, mode: null })}>
          Cancel
        </Button>,
        <Button key="2" type="primary" className="bg-amber-600" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]
}   width={1000}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          
          {renderSection("Transport Detail", <>
           <Col span={6}>
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

<Col span={6}>
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

<Col span={6}>
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

<Col span={6}>
  <Form.Item
    label="Insurance Valid"
    name="insuranceValidUpto"
    rules={[{ required: true, message: "Please select the Insurance Validity Date" }]}
  >
    <DatePicker className="w-full" disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={6}>
  <Form.Item
    label="PU Valid"
    name="puValidUpto"
    rules={[{ required: true, message: "Please select the PU Validity Date" }]}
  >
    <DatePicker className="w-full" disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={6}>
  <Form.Item
    label="Fitness Valid"
    name="fitnessValidUpto"
    rules={[{ required: true, message: "Please select the Fitness Validity Date" }]}
  >
    <DatePicker className="w-full" disabled={isReadonly} />
  </Form.Item>
</Col>

<Col span={6}>
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
            <Col span={6}><Form.Item label="Assign No" name="invoice_number"><Input disabled /></Form.Item></Col>
             <Col span={6}><Form.Item label="Way Bill" name="wayBill"><Input disabled/></Form.Item></Col>
            <Col span={6}><Form.Item label="Status" name="status"><Select disabled={isReadonly || isAssigning} options={[{label: 'Pending', value: 'Pending'}, ]} /></Form.Item></Col>
            </>)}

          {renderSection("Supplier Detail", <>
            <Col span={6}><Form.Item label="Supplier Name" name="vendorName" ><Input disabled /></Form.Item></Col>
            <Col span={6}><Form.Item label="Address" name="vendorAddress" ><Input disabled /></Form.Item></Col>
            <Col span={6}><Form.Item label="Contact Person" name="vendorContactPerson"><Input disabled /></Form.Item></Col>
            <Col span={6}><Form.Item label="Phone" name="vendorPhoneNumber" ><Input disabled /></Form.Item></Col>
          </>)}

          {renderSection("Plant Detail", <>
            <Col span={6}><Form.Item label="Plant Name" name="plantName" ><Input disabled /></Form.Item></Col>
              <Col span={6}><Form.Item label="Address" name="plantAddress" ><Input disabled /></Form.Item></Col>
            <Col span={6}><Form.Item label="Contact Person" name="vendorContactPerson"><Input disabled /></Form.Item></Col>
             <Col span={6}><Form.Item label="Phone" name="plantPhoneNumber" ><Input disabled /></Form.Item></Col>
         
          </>)}


          <div className="text-base! font-semibold! text-amber-600! mb-2!">Product Details</div>
          <Form.List name="products">
            {(fields) => fields.map(({ key, name }) => (
              <Row gutter={24} key={key}>
                <Col span={6}><Form.Item name={[name, 'productName']} label="Product"><Input disabled /></Form.Item></Col>
                  <Col span={6}><Form.Item name={[name, 'qty']} label="Qty"><Input disabled /></Form.Item></Col>
                  <Col span={6}><Form.Item name={[name, 'uom']} label="UOM"><Input disabled /></Form.Item></Col>
              
                   </Row>
            ))}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}