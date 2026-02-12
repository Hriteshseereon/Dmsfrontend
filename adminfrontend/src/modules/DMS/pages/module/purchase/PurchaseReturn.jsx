
// PurchaseReturn.jsx 
import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getPurchaseReturn,addPurchaseReturn,getPurchaseReturnById,updatePurchaseReturn ,getPurchaseInvoice,getPurchaseInvoiceById} from "../../../../../api/purchase";
// 🔹 JSON Data
const purchaseReturnJSON = {
  records: [
    {
      key: 1,
      invoiceNo: "INV-001",
      item: "Sunflower Oil",
      itemCode: "It1",
      plantName: "Ramesh",
      plantCode: "P1",
      quantity: 50,
      freeQty: 10,
      uom: "Ltr",
      rate: 500,
      totalAmount: 25000,
      returnDate: "2024-04-01",
      returnReason: "Damaged Packaging",
      status: "Approved",
      companyName: "Odisha Edibles",
      branchName: "Cuttack",
      depo: "Cuttack Depot",
      grossAmount: 25000,
      discountPercent: 10,
      discountAmount: 10,
      sgstPercent: 9,
      cgstPercent: 1,
      igstPercent: 6,
      otherCharges: 7,
      roundOff: 8,
      grandTotal: 29500,
    },
    {
      key: 2,
      invoiceNo: "INV-002",
      item: "Soya",
      itemCode: "It2",
      plantName: "Suresh",
      plantCode: "P2",
      quantity: 150,
      freeQty: 1,
      uom: "kg",
      rate: 300,
      totalAmount: 2000,
      returnDate: "2025-05-09",
      returnReason: "Damaged Packaging",
      status: "Pending",
      companyName: "Kalinga Mills",
      branchName: "Bhubneswar",
      depo: "Bhubneswar Depot",
      grossAmount: 200,
      discountPercent: 11,
      discountAmount: 18,
      sgstPercent: 17,
      cgstPercent: 10,
      igstPercent: 19,
      otherCharges: 7,
      roundOff: 8,
      grandTotal: 29500,
    },
  ],
  options: {
    returnReasonOptions: [
      "Quality Issue",
      "Damaged Packaging",
      "Expired",
      "Wrong Item",
    ],
  },
};
const statusOptions = ["Pending", "Approved", "Reject"];

export default function PurchaseReturn() {
   const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isOtherReason, setIsOtherReason] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
const [selectedProductId, setSelectedProductId] = useState(null);
const [selectedVendorId, setSelectedVendorId] = useState(null);

  const [viewForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchPurchaseReturns();
}, []);

const fetchPurchaseReturns = async () => {
  try {
    setLoading(true);
    const res = await getPurchaseReturn();

    // if API returns { data: [...] }
    const records = res.data || res;

    setData(
  records.map((item, index) => ({
    key: item.id,
    return_number: item.return_number,
    return_date: item.return_date,
   status: item.status || "Pending",
    item_name: item.items?.[0]?.item_name,
    total_quantity: item.items?.[0]?.total_quantity,
    item_return_reason: item.items?.[0]?.item_return_reason,
  }))
);

  } catch (error) {
    console.error("Failed to fetch purchase returns", error);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (value) => {
  setSearchText(value);

  if (!value) {
    fetchPurchaseReturns();
    return;
  }

  const filtered = data.filter((item) =>
    Object.values(item).some((field) =>
      String(field).toLowerCase().includes(value.toLowerCase())
    )
  );

  setData(filtered);
};


  const calculateTotals = (values) => {
    const qty = parseFloat(values.quantity || 0);
    const freeQty = parseFloat(values.freeQty || 0);
    const rate = parseFloat(values.rate || 0);
    const discountPercent = parseFloat(values.discountPercent || 0);
    const sgstPercent = parseFloat(values.sgstPercent || 0);
    const cgstPercent = parseFloat(values.cgstPercent || 0);
    const igstPercent = parseFloat(values.igstPercent || 0);
    const otherCharges = parseFloat(values.otherCharges || 0);
    const roundOff = parseFloat(values.roundOff || 0);

    const totalQtyDisplay = qty + freeQty;
    const grossAmount = qty * rate;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const taxableAmount = grossAmount - discountAmount;
    const taxAmount =
      (taxableAmount * (sgstPercent + cgstPercent + igstPercent)) / 100;
    const grandTotal = taxableAmount + taxAmount + otherCharges + roundOff;

    return {
      totalQtyDisplay,
      grossAmount: Number(grossAmount.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
    };
  };

  const handleValuesChange = (_, allValues) => {
    const totals = calculateTotals(allValues);
    addForm.setFieldsValue(totals);
    editForm.setFieldsValue(totals);
  };

  const setFormValues = (record, targetForm, mode = "view") => {
    const base = {
      ...record,
      returnDate: record.returnDate ? dayjs(record.returnDate) : dayjs(),
      totalQtyDisplay: (record.quantity || 0) + (record.freeQty || 0),
      grossAmount:
        record.grossAmount || (record.quantity || 0) * (record.rate || 0),
      discountAmount:
        record.discountAmount ||
        ((record.grossAmount || (record.quantity || 0) * (record.rate || 0)) *
          (record.discountPercent || 0)) /
          100,
      grandTotal: record.grandTotal || record.totalAmount || 0,
    };

    if (mode === "add") {
      targetForm.setFieldsValue({
        ...base,
        status: "Pending",
        returnDate: dayjs(),
      });
    } else {
      targetForm.setFieldsValue(base);
    }
  };
 const handleSubmit = async (values, mode) => {
  if (mode === "add") {
    try {
      const payload = {
        invoice: values.invoiceNo,
         vendor: selectedVendorId,  
        status: values.status || "Pending",

        return_date: values.returnDate
          ? values.returnDate.format("YYYY-MM-DD")
          : null,
        reason: values.returnReason,
        plant_name: values.plantName,
        
       
        items: [
          {
            product: selectedProductId,
            quantity: Number(values.quantity),
            free_quantity: Number(values.freeQty || 0),
            total_quantity: Number(values.totalQtyDisplay || 0),
            rate: Number(values.rate),

            gross_amount: Number(values.grossAmount || 0),

            discount_percent: Number(values.discountPercent || 0),
            discount_amount: Number(values.discountAmount || 0),

            sgst_percent: Number(values.sgstPercent || 0),
            cgst_percent: Number(values.cgstPercent || 0),
            igst_percent: Number(values.igstPercent || 0),

            other_charges: 0,
            round_off: 0,

            total_amount: Number(values.grandTotal || 0),

            item_return_reason: values.returnReason,
          },
        ],
      };

      await addPurchaseReturn(payload);

      fetchPurchaseReturns();
      setIsAddModalOpen(false);
      addForm.resetFields();
    } catch (error) {
      console.error("Add failed", error);
    }
  }
  if (mode === "edit") {
  try {
    const payload = {
      invoice: values.invoiceNo,
      status: values.status,
      return_date: values.returnDate
        ? values.returnDate.format("YYYY-MM-DD")
        : null,
      reason: values.returnReason,
      items: [
        {
          product: selectedProductId,
          quantity: Number(values.quantity),
          free_quantity: Number(values.freeQty || 0),
          total_quantity: Number(values.totalQtyDisplay || 0),
          rate: Number(values.rate),
          gross_amount: Number(values.grossAmount || 0),
          discount_percent: Number(values.discountPercent || 0),
          discount_amount: Number(values.discountAmount || 0),
          sgst_percent: Number(values.sgstPercent || 0),
          cgst_percent: Number(values.cgstPercent || 0),
          igst_percent: Number(values.igstPercent || 0),
          total_amount: Number(values.grandTotal || 0),
          item_return_reason: values.returnReason,
        },
      ],
    };

    await updatePurchaseReturn(selectedRecord.id || selectedRecord.key, payload);

    // ✅ update table locally (IMPORTANT FIX)
    setData((prev) =>
      prev.map((item) =>
        item.key === (selectedRecord.id || selectedRecord.key)
          ? { ...item, status: values.status }
          : item
      )
    );

    setIsEditModalOpen(false);
    editForm.resetFields();

  } catch (error) {
    console.error("Update failed", error);
  }
}

};


const handleViewClick = async (record) => {
  try {
    setLoading(true);

    // ✅ call GET by id API
    const res = await getPurchaseReturnById(record.key);
    const data = res.data || res;

    const item = data.items?.[0] || {};

    // ✅ prefill view form
    viewForm.setFieldsValue({
      invoiceNo: data.invoice,
      companyName: data.vendor_name,
      plantName: data.plant_name,

      returnDate: data.return_date ? dayjs(data.return_date) : null,

      status: data.status,

      item: item.item_name,
      itemCode: item.hsn_code,

      quantity: item.quantity,
      freeQty: item.free_quantity,
      totalQtyDisplay: item.total_quantity,

      rate: item.rate,

      grossAmount: item.gross_amount,

      discountPercent: item.discount_percent,
      discountAmount: item.discount_amount,

      sgstPercent: item.sgst_percent,
      cgstPercent: item.cgst_percent,
      igstPercent: item.igst_percent,

      grandTotal: item.total_amount,

      uom: item.uom_details?.unit_name,

      returnReason: item.item_return_reason,
    });

    setSelectedRecord(data);

    setIsViewModalOpen(true);

  } catch (error) {
    console.error("View fetch failed", error);
  } finally {
    setLoading(false);
  }
};

const handleAddClick = async () => {
  try {
    const res = await getPurchaseInvoice();
    const invoices = res.data || res;

    setInvoiceList(invoices);

    addForm.resetFields();
    addForm.setFieldsValue({
      status: "Pending",
      return_date: dayjs(),
    });

    setIsAddModalOpen(true);
  } catch (error) {
    console.error("Failed to fetch invoices", error);
  }
};

const onInvoiceSelectForAdd = async (invoiceId) => {
  try {
    const res = await getPurchaseInvoiceById(invoiceId);
    const invoice = res.data || res;

    const firstItem = invoice.items?.[0] || {};

    setSelectedProductId(firstItem.product);

    // ✅ SAVE vendor id
    setSelectedVendorId(invoice.vendor);

    addForm.setFieldsValue({
      invoiceNo: invoice.id,
      companyName: invoice.vendor_name, // display only
      plantName: invoice.plant_name,
      returnDate: dayjs(),
      status: "Pending",

      item: firstItem.item_name,
      itemCode: firstItem.hsn_code,
      quantity: firstItem.qty,
      freeQty: firstItem.free_qty,
      rate: firstItem.rate,
      uom: firstItem?.uom_details?.unit_name,
      totalQtyDisplay: Number(invoice.total_qty),
      grossAmount: Number(firstItem.gross_amount),
      discountAmount: Number(firstItem.dis_amount),
      grandTotal: Number(invoice.total_amount),

      discountPercent: firstItem.dis_percent,
      sgstPercent: invoice.sgst_percent,
      cgstPercent: invoice.cgst_percent,
      igstPercent: invoice.igst_percent,
    });

  } catch (error) {
    console.error(error);
  }
};

const handleEditClick = async (record) => {
  try {
    setLoading(true);

    // call GET by id API
    const res = await getPurchaseReturnById(record.key);
    const data = res.data || res;

    const item = data.items?.[0] || {};

    // save product id for update
    setSelectedProductId(item.product);

    // prefill edit form
    editForm.setFieldsValue({
      invoiceNo: data.invoice,
      companyName: data.vendor_name,
      plantName: data.plant_name,
      returnDate: data.return_date ? dayjs(data.return_date) : null,
      status: data.status,

      item: item.item_name,
      itemCode: item.hsn_code,
      quantity: item.quantity,
      freeQty: item.free_quantity,
      totalQtyDisplay: item.total_quantity,
      rate: item.rate,

      grossAmount: item.gross_amount,
      discountPercent: item.discount_percent,
      discountAmount: item.discount_amount,

      sgstPercent: item.sgst_percent,
      cgstPercent: item.cgst_percent,
      igstPercent: item.igst_percent,

      grandTotal: item.total_amount,
      uom: item.uom_details?.unit_name,
      returnReason: item.item_return_reason,
    });

    setSelectedRecord(data);

    setIsEditModalOpen(true);

  } catch (error) {
    console.error("Edit fetch failed", error);
  } finally {
    setLoading(false);
  }
};


  const renderFormFields = (mode = "view") => {
    const isView = mode === "view";
    const isAdd = mode === "add";
    const isEdit = mode === "edit";

    const disabledFor = (field) => {
      if (isView) return true;
      if (isAdd)
        return !["invoiceNo", "quantity", "returnReason"].includes(field);
      if (isEdit)
        return !["invoiceNo", "quantity", "returnReason"].includes(field);
      return true;
    };

    return (
      <>
        <h6 className="text-amber-500">Invoice & Party Details</h6>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Invoice No"
              name="invoiceNo"
              rules={[{ required: true }]}
            >
             <Select
  onChange={(val) => onInvoiceSelectForAdd(val)}
  disabled={isView}
>

               {invoiceList.map((inv) => (
  <Select.Option key={inv.id} value={inv.id}>
    {inv.invoice_no || inv.invoice_number}
  </Select.Option>
))}

              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Company" name="companyName">
              <Select disabled />
            </Form.Item>
          </Col>

         
          <Col span={6}>
            <Form.Item label="Return Date" name="returnDate">
              <DatePicker className="w-full" disabled />
            </Form.Item>
          </Col>
         <Form.Item
  label="Status"
  name="status"
  rules={[{ required: true, message: "Please select status" }]}
>
  <Select disabled={mode === "view"}>
    {statusOptions.map((status) => (
      <Select.Option key={status} value={status}>
        {status}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

        </Row>

       
        <h6 className="text-amber-500">Item & Return Details</h6>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Item Name" name="item">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Item Code" name="itemCode">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="UOM" name="uom">
              <Select disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Quantity" name="quantity">
              <InputNumber
                className="w-full"
                disabled={disabledFor("quantity")}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Free Quantity" name="freeQty">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Total Quantity" name="totalQtyDisplay">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Rate" name="rate">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Gross Amount" name="grossAmount">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Return Reason"
              name="returnReason"
              rules={[{ required: true }]}
            >
              <Select
                disabled={disabledFor("returnReason")}
                onChange={(value) => {
                  setIsOtherReason(value === "Other");
                  if (value !== "Other") {
                    if (isAdd) addForm.setFieldsValue({ otherReasonText: "" });
                    if (isEdit)
                      editForm.setFieldsValue({ otherReasonText: "" });
                  }
                }}
              >
                {purchaseReturnJSON.options.returnReasonOptions.map((v) => (
                  <Select.Option key={v}>{v}</Select.Option>
                ))}
                <Select.Option key="Other" value="Other">
                  Other
                </Select.Option>
              </Select>
            </Form.Item>

            {isOtherReason && (
              <Form.Item
                label="Specify Other Reason"
                name="otherReasonText"
                rules={[{ required: true, message: "Please enter a reason" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Please describe the reason for return"
                  disabled={disabledFor("returnReason")}
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <h6 className="text-amber-500">Tax & Amount Details</h6>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Discount %" name="discountPercent">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Discount Amount" name="discountAmount">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="SGST %" name="sgstPercent">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="CGST %" name="cgstPercent">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="IGST %" name="igstPercent">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>


          <Col span={6}>
            <Form.Item label="Total Amount" name="grandTotal">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  // 🔹 Table columns
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Return No</span>,
      dataIndex: "return_number",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Item Name</span>,
      dataIndex: "item_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      width: 100,
     dataIndex: "total_quantity",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
  
    {
      title: <span className="text-amber-700 font-semibold">Return Date</span>,
      dataIndex: "return_date",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Reason</span>,
      dataIndex: "item_return_reason",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 100,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              {status}
            </span>
          );
        if (status === "Pending")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              {status}
            </span>
          );
        return (
          <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Action</span>,
      width: 80,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
  className="cursor-pointer! text-blue-500!"
  onClick={() => handleViewClick(record)}
/>

          <EditOutlined
  className="cursor-pointer! text-red-500!"
  onClick={() => handleEditClick(record)}
/>

        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined className="text-amber-600!" />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64! border-amber-300! focus:border-amber-500!"
          
          />
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={() => handleSearch("")}
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={handleAddClick}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Return
        </h2>
        <p className="text-amber-600 mb-3">
          Manage your purchase Return easily
        </p>

       <Table
  columns={columns}
  dataSource={data}
  loading={loading}
  rowKey="key"
  pagination={false}
/>
 </div>
      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit Purchase Return
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => {
          editForm
            .validateFields()
            .then((values) => handleSubmit(values, "edit"))
            .catch(() => {});
        }}
        width={1000}
      >
        <Form
          form={editForm}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          {renderFormFields("edit")}
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add New Purcase Return
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => {
          addForm
            .validateFields()
            .then((values) => handleSubmit(values, "add"))
            .catch(() => {});
        }}
        width={1000}
      >
        <Form
          form={addForm}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          {renderFormFields("add")}
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Return
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          {renderFormFields("view")}
        </Form>
      </Modal>
    </div>
  );
}