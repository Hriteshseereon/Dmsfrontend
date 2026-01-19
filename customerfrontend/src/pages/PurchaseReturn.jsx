import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
  DatePicker,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// 🔹 JSON DATA
const orderJSON = {
  records: [
    {
      orderNo: "ORD-1001",
      invoiceNo: "INV-055",
      customer: "Ramesh",
      companyName: "Odisha Edibles",
      itemName: "Almond Butter",
      itemCode: "AB-001",
      initialQuantity: 100,
      uom: "KG",
      invoiceAmount: 25000,
     
    },
    {
      orderNo: "ORD-1002",
      invoiceNo: "INV-056",
      customer: "Suresh",
      companyName: "Bihar Grocers",
      itemName: "Cashew Nuts",
      itemCode: "CN-002",
      initialQuantity: 50,
      uom: "Pack",
      invoiceAmount: 15000,
     
    },
  ],
};

const disputeJSON = {
  records: [
    {
      key: "DSP-001",
      orderNo: "ORD-1001",
      invoiceNo: "INV-055",
      customer: "Ramesh",
      amount: 25000, 
      disputedQuantity: 5, 
      uom: "KG",
      disputeReason: "Over Billing",
      description: "Charged extra 2000",
      disputeDate: "2024-04-01",
      status: "Pending",
      companyName: "Odisha Edibles",
    
      itemName: "Almond Butter",
      itemCode: "AB-001",
    },
    {
      key: "DSP-002",
      orderNo: "ORD-1002",
      invoiceNo: "INV-056",
      customer: "Suresh",
      amount: 15000,
      disputedQuantity: 10,
      uom: "Pack",
      disputeReason: "A very custom issue", 
      description: "A very custom issue", 
      disputeDate: "2024-04-05",
      status: "Resolved", 
      companyName: "Bihar Grocers",
     
      itemName: "Cashew Nuts",
      itemCode: "CN-002",
    },
  ],

  options: {
    statusOptions: ["Pending", "Resolved", "Rejected"],
    disputeReasonOptions: [
      "Over Billing",
      "Wrong Item",
      "Short Supply",
      "Quality Issue",
    ],
  },
};

export default function PurchaseReturn() {
  const [records, setRecords] = useState(disputeJSON.records);
  const [filtered, setFiltered] = useState(records);
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState(null);
  const [showOtherReason, setShowOtherReason] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  useEffect(() => {
    const val = searchText.toLowerCase();
    setFiltered(
      records.filter((item) =>
        Object.values(item).some((v) => String(v).toLowerCase().includes(val))
      )
    );
  }, [searchText, records]);

    const handleOrderSelect = (orderNo, form) => {
    const order = orderJSON.records.find((o) => o.orderNo === orderNo);
    if (order) {
      setSelectedOrder(order);
      
      form.setFieldsValue({
        invoiceNo: order.invoiceNo,
        customer: order.customer,
        companyName: order.companyName,
        itemName: order.itemName,
        itemCode: order.itemCode,
        uom: order.uom,
        amount: order.invoiceAmount,
        disputedQuantity: null,
        disputeReason: null,
        otherReason: null,
      });
      setShowOtherReason(false);
    } else {
      setSelectedOrder(null);
    }
  };

  const setFormValues = (record, form) => {
    setSelectedOrder(record); 

    form.setFieldsValue({
      ...record,
      disputeDate: dayjs(record.disputeDate),
      disputedQuantity: record.disputedQuantity, 
    });

    const isOtherReason = !disputeJSON.options.disputeReasonOptions.includes(record.disputeReason);

    if (isOtherReason) {
      setShowOtherReason(true);
      form.setFieldsValue({
        disputeReason: "Other",
        otherReason: record.disputeReason, 
      });
    } else {
      setShowOtherReason(false);
      form.setFieldsValue({
        disputeReason: record.disputeReason,
        otherReason: undefined,
      });
    }
  };

  const handleSubmit = (values, mode) => {
    let finalReason;
    let descriptionText = values.description || ""; 
    
    if (values.disputeReason === "Other") {
      finalReason = values.otherReason;
         descriptionText = values.otherReason;
    } else {
      finalReason = values.disputeReason;
          descriptionText = values.description;
    }

    const orderInfo = selectedOrder || {};

    const record = {
      ...orderInfo, 
      ...values,
      disputeReason: finalReason,
      disputedQuantity: values.disputedQuantity, 
      description: descriptionText, 
      disputeDate: values.disputeDate.format("YYYY-MM-DD"),
      status: values.status || "Pending", 
    };

    delete record.otherReason;

    if (mode === "add") {
      const newKey = `DSP-${String(records.length + 1).padStart(3, "0")}`;
      setRecords((prev) => [
        ...prev,
        {
          ...record,
          key: newKey, 
        },
      ]);
      setIsAddOpen(false);
      addForm.resetFields();
      setSelectedOrder(null);
      setShowOtherReason(false);
    }

    if (mode === "edit") {
      setRecords((prev) =>
        prev.map((item) =>
          item.key === selected.key ? { ...item, ...record } : item
        )
      );
      setIsEditOpen(false);
      editForm.resetFields();
      setSelectedOrder(null);
      setShowOtherReason(false);
    }
  };

  const renderForm = (mode, form) => {
    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isAdd = mode === "add";
    
     const readOnly = true; 

    return (
      <>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Order No"
              name="orderNo"
              rules={[{ required: true, message: "Please select Order No" }]}
            >
              {isAdd ? (
                <Select
                  onChange={(val) => handleOrderSelect(val, form)}
                  disabled={!isAdd} 
                >
                  {orderJSON.records.map((v) => (
                    <Select.Option key={v.orderNo} value={v.orderNo}>
                      {v.orderNo}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Input disabled={readOnly} />
              )}
            </Form.Item>
          </Col>

          

          <Col span={6}>
            <Form.Item label="Invoice No" name="invoiceNo">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>

           <Col span={6}>
            <Form.Item label="Customer" name="customer">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Company Name" name="companyName">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>

         

          <Col span={6}>
            <Form.Item label="Item Name" name="itemName">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>

         <Col span={6}>
            <Form.Item label="Item Code" name="itemCode">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="UOM" name="uom">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Invoice Amount" name="amount">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Disputed Quantity"
              name="disputedQuantity"
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <InputNumber min={1} className="w-full!" disabled={isView} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Dispute Date"
              name="disputeDate"
              rules={[{ required: true, message: "Please select date" }]}
            >
  <DatePicker className="w-full" disabled={isView || isEdit || isAdd} />
            </Form.Item>
          </Col>

         <Col span={6}>
            <Form.Item label="Status" name="status">
              <Input disabled={readOnly} /> 
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Dispute Reason"
              name="disputeReason"
              rules={[{ required: true, message: "Please select reason" }]}
            >
              <Select
                disabled={isView}
                onChange={(val) => {
                  setShowOtherReason(val === "Other");
                   if (val !== "Other" && form.getFieldValue('otherReason')) {
                    form.setFieldsValue({ otherReason: undefined });
                  }
                }}
              >
                {disputeJSON.options.disputeReasonOptions.map((v) => (
                  <Select.Option key={v}>{v}</Select.Option>
                ))}
                <Select.Option key="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
  {(showOtherReason || isView) && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                   label={isView && form.getFieldValue('disputeReason') !== 'Other' ? "Dispute Description" : "Write Your Dispute Reason"}
                name={isView && form.getFieldValue('disputeReason') !== 'Other' ? "description" : "otherReason"} 
                rules={
                  !isView && showOtherReason
                    ? [{ required: true, message: "Please enter dispute reason" }]
                    : []
                }
              >
                <Input.TextArea
                  rows={3}
                  disabled={isView}
                  placeholder={
                    isView
                      ? "Dispute description (if any)"
                      : "Write your custom dispute reason here"
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </>
    );
  };

   const columns = [
   
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "orderNo",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customer",
      width: 120,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Reason</span>,
      dataIndex: "disputeReason",
      width: 120,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Quantity</span>,
      dataIndex: "disputedQuantity",
      width: 100,
      render: (text, record) => (
        <span className="text-amber-800">
          {text} {record.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 100,
      render: (t) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (t === "Resolved")
          return <span className={`${base} bg-green-100 text-green-700`}>{t}</span>;
        if (t === "Pending")
          return <span className={`${base} bg-yellow-100 text-yellow-700`}>{t}</span>;
        return <span className={`${base} bg-red-100 text-red-700`}>{t}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Action</span>,
      width: 80,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-blue-500! cursor-pointer!"
            onClick={() => {
              setSelected(record);
              setFormValues(record, viewForm);
              setIsViewOpen(true);
            }}
          />

          {record.status === "Pending" && (
            <EditOutlined
              className="text-red-500! cursor-pointer!"
              onClick={() => {
                setSelected(record);
                setFormValues(record, editForm);
                setIsEditOpen(true);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div >
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Raise Dispute</h1>
          <p className="text-amber-600">Manage customer disputes easily</p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search all fields..."
            className="w-full! sm:w-80! border-amber-300! focus:border-amber-500! rounded-lg!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setSearchText("")}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none! shadow-md"
            onClick={() => {
              addForm.resetFields();
              addForm.setFieldsValue({
                status: "Pending",
                disputeDate: dayjs(), 
              });
              setSelectedOrder(null);
              setShowOtherReason(false);
              setIsAddOpen(true);
            }}
          >
            Raise Dispute
          </Button>
       

        </div>
      </div>
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table 
          columns={columns} 
          dataSource={filtered} 
          pagination={false} 
          rowKey="key"
       
        />
      </div>

      <Modal
        title={<span className="text-amber-700 font-semibold">Raise New Dispute</span>}
        open={isAddOpen}
        footer={null}
        width={1000}
        onCancel={() => {
          setIsAddOpen(false);
          setShowOtherReason(false);
          addForm.resetFields();
        }}
      >
        <Form form={addForm} layout="vertical">
          {renderForm("add", addForm)}

          <div className="flex justify-end gap-3 mt-4  pt-4">
            <Button
              onClick={() => {
                addForm.resetFields();
                setIsAddOpen(false);
                setShowOtherReason(false);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none! shadow-md"
              onClick={() =>
                addForm.validateFields().then((v) => handleSubmit(v, "add"))
              }
            >
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        open={isEditOpen}
        title={<span className="text-amber-700 font-semibold">Edit Dispute - {selected?.key}</span>}
        footer={null}
        width={1000}
        onCancel={() => {
          setIsEditOpen(false);
          setShowOtherReason(false);
          editForm.resetFields();
        }}
      >
        <Form form={editForm} layout="vertical">
          {renderForm("edit", editForm)}

          <div className="flex justify-end gap-3 mt-4  pt-4">
            <Button
              onClick={() => {
                editForm.resetFields();
                setIsEditOpen(false);
                setShowOtherReason(false);
              }}
              className="border-amber-400 text-amber-700 hover:bg-amber-100"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              className="bg-amber-600 hover:bg-amber-700 border-none shadow-md"
              onClick={() =>
                editForm.validateFields().then((v) => handleSubmit(v, "edit"))
              }
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={isViewOpen}
        title={<span className="text-amber-700 font-semibold">View Dispute - {selected?.key}</span>}
        onCancel={() => {
          setIsViewOpen(false);
          setShowOtherReason(false);
          viewForm.resetFields();
        }}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          {renderForm("view", viewForm)}
        </Form>
      </Modal>
     

    </div>
  );
}