
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
const returnReasons = [
  "Quality Issue",
  "Damaged Packaging",
  "Expired",
  "Wrong Item",
  "Other",
];

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



 const handleValuesChange = (_, allValues) => {
  const items = allValues.items || [];

  let grandTotalWithoutRound = 0;

  const updatedItems = items.map((item) => {
    const qty = Number(item.quantity || 0);
    const freeQty = Number(item.free_quantity || 0);
    const rate = Number(item.rate || 0);
    const discountPercent = Number(item.discount_percent || 0);
    const sgst = Number(item.sgst_percent || 0);
    const cgst = Number(item.cgst_percent || 0);
    const igst = Number(item.igst_percent || 0);

    const totalQty = qty + freeQty;
    const gross = qty * rate;
    const discountAmt = (gross * discountPercent) / 100;
    const taxable = gross - discountAmt;
    const taxAmt = (taxable * (sgst + cgst + igst)) / 100;
    const totalAmount = taxable + taxAmt;

    grandTotalWithoutRound += totalAmount;

    return {
      ...item,
      total_quantity: Number(totalQty.toFixed(2)),
      gross_amount: Number(gross.toFixed(2)),
      discount_amount: Number(discountAmt.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
    };
  });

  const roundOff = Number(allValues.roundOff || 0);
  const finalGrandTotal = grandTotalWithoutRound + roundOff;

  // ✅ update form values
 addForm.setFieldsValue({
  items: updatedItems,
});


  editForm.setFieldsValue({
    items: updatedItems,
  });
};

 const handleSubmit = async (values, mode) => {
if (mode === "add") {
  try {
    const totalAmount = values.items.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    );

    const payload = {
      invoice: values.invoiceNo,
      vendor: selectedVendorId,
      status: values.status || "Pending",
      return_date: values.returnDate
        ? values.returnDate.format("YYYY-MM-DD")
        : null,

      round_off: Number(values.roundOff || 0),

      total_amount: Number(totalAmount.toFixed(2)),

      items: values.items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity || 0),
        free_quantity: Number(item.free_quantity || 0),
        total_quantity:
          Number(item.quantity || 0) + Number(item.free_quantity || 0),
        rate: Number(item.rate || 0),
        gross_amount: Number(item.gross_amount || 0),
        discount_percent: Number(item.discount_percent || 0),
        discount_amount: Number(item.discount_amount || 0),
        sgst_percent: Number(item.sgst_percent || 0),
        cgst_percent: Number(item.cgst_percent || 0),
        igst_percent: Number(item.igst_percent || 0),
        total_amount: Number(item.total_amount || 0),
       item_return_reason:
  item.item_return_reason === "Other"
    ? item.other_reason
    : item.item_return_reason,

      })),
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
    const totalAmount = values.items.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    );

    const payload = {
      invoice: values.invoiceNo,
      status: values.status,
      return_date: values.returnDate
        ? values.returnDate.format("YYYY-MM-DD")
        : null,

      round_off: Number(values.roundOff || 0),
      total_amount: Number(totalAmount.toFixed(2)),

      items: values.items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity || 0),
        free_quantity: Number(item.free_quantity || 0),
        total_quantity:
          Number(item.quantity || 0) + Number(item.free_quantity || 0),
        rate: Number(item.rate || 0),
        gross_amount: Number(item.gross_amount || 0),
        discount_percent: Number(item.discount_percent || 0),
        discount_amount: Number(item.discount_amount || 0),
        sgst_percent: Number(item.sgst_percent || 0),
        cgst_percent: Number(item.cgst_percent || 0),
        igst_percent: Number(item.igst_percent || 0),
        total_amount: Number(item.total_amount || 0),
       item_return_reason:
  item.item_return_reason === "Other"
    ? item.other_reason
    : item.item_return_reason,

      })),
    };
await updatePurchaseReturn(
  selectedRecord.id,
  payload
);

await updatePurchaseReturn(selectedRecord.id, payload);

// 🔥 Update table instantly without API refetch
setData((prev) =>
  prev.map((item) =>
    item.key === selectedRecord.id
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

    const res = await getPurchaseReturnById(record.key);
    const data = res.data || res;

    const mappedItems = data.items?.map((item) => ({
      product: item.product,
      item_name: item.item_name,
      hsn_code: item.hsn_code,
      uom: item.uom_details?.unit_name,

      quantity: Number(item.quantity),
      free_quantity: Number(item.free_quantity),
      total_quantity: Number(item.total_quantity),

      rate: Number(item.rate),
      gross_amount: Number(item.gross_amount),

      discount_percent: Number(item.discount_percent),
      discount_amount: Number(item.discount_amount),

      sgst_percent: Number(item.sgst_percent),
      cgst_percent: Number(item.cgst_percent),
      igst_percent: Number(item.igst_percent),

      total_amount: Number(item.total_amount),

      item_return_reason: item.item_return_reason,
    })) || [];

    viewForm.setFieldsValue({
      invoiceNo: data.invoice_number || data.invoice,

      companyName: data.vendor_name,
      returnDate: data.return_date ? dayjs(data.return_date) : null,
      status: data.status,
      roundOff: Number(data.round_off || 0),
      items: mappedItems,  // 🔥 FIX HERE ALSO
    });

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

    // ✅ save vendor id
    setSelectedVendorId(invoice.vendor);

    // ✅ map ALL invoice items
    const items = invoice.items?.map((it) => ({
      product: it.product,
      item_name: it.item_name,
      hsn_code: it.hsn_code,
      uom: it?.uom_details?.unit_name,

      quantity: it.qty,
      free_quantity: it.free_qty,
      total_quantity: Number(it.qty || 0) + Number(it.free_qty || 0),

      rate: it.rate,
      gross_amount: it.gross_amount,

      discount_percent: it.dis_percent,
      discount_amount: it.dis_amount,

      sgst_percent: invoice.sgst_percent,
      cgst_percent: invoice.cgst_percent,
      igst_percent: invoice.igst_percent,

      total_amount: it.total_amount,

      item_return_reason: "",
    })) || [];

    // ✅ set form values
    addForm.setFieldsValue({
      invoiceNo: invoice.id,
      companyName: invoice.vendor_name,
      plantName: invoice.plant_name,
      returnDate: dayjs(),
      status: "Pending",
      items: items, // 🔥 THIS IS IMPORTANT
    });

  } catch (error) {
    console.error("Invoice fetch failed", error);
  }
};


const handleEditClick = async (record) => {
  try {
    setLoading(true);

    const res = await getPurchaseReturnById(record.key);
    const data = res.data || res;

    const mappedItems = data.items?.map((item) => ({
      product: item.product,
      item_name: item.item_name,
      hsn_code: item.hsn_code,
      uom: item.uom_details?.unit_name,

      quantity: Number(item.quantity),
      free_quantity: Number(item.free_quantity),
      total_quantity: Number(item.total_quantity),

      rate: Number(item.rate),
      gross_amount: Number(item.gross_amount),

      discount_percent: Number(item.discount_percent),
      discount_amount: Number(item.discount_amount),

      sgst_percent: Number(item.sgst_percent),
      cgst_percent: Number(item.cgst_percent),
      igst_percent: Number(item.igst_percent),

      total_amount: Number(item.total_amount),

      item_return_reason: item.item_return_reason,
    })) || [];

    editForm.setFieldsValue({
    invoiceNo: data.invoice_number || data.invoice,

      companyName: data.vendor_name,
      returnDate: data.return_date ? dayjs(data.return_date) : null,
      status: data.status,
      roundOff: Number(data.round_off || 0),
      items: mappedItems,   // 🔥 THIS IS THE IMPORTANT LINE
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
  onChange={(val) => isAdd && onInvoiceSelectForAdd(val)}
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
      <Select.Option key={status} value={status} disabled={isView}>
        {status}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

        </Row>

       
       <h6 className="text-amber-500">Item & Return Details</h6>

<Form.List name="items">
  {(fields) => (
    <>
      {fields.map(({ key, name, ...restField }) => (
        <div key={key} className="border p-3 mb-3 rounded">

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item {...restField} name={[name, "item_name"]} label="Item Name">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "hsn_code"]} label="Item Code">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "uom"]} label="UOM">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
             <Form.Item {...restField} name={[name, "quantity"]} label="Quantity">
  <InputNumber
    className="w-full"
    disabled={isView}
  />
</Form.Item>

            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "free_quantity"]} label="Free Qty">
               <InputNumber
  className="w-full"
  disabled={isView}
/>

              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "total_quantity"]} label="Total Qty">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "rate"]} label="Rate">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "gross_amount"]} label="Gross Amount">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>
          </Row>

          <h6 className="text-amber-500 mt-2">Tax & Amount Details</h6>

          <Row gutter={16}>
           <Form.Item {...restField} name={[name, "discount_percent"]} label="Discount %">
  <InputNumber
    className="w-full"
    disabled  // 🔥 IMPORTANT
  />
</Form.Item>


            <Col span={6}>
              <Form.Item {...restField} name={[name, "discount_amount"]} label="Discount Amount">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "sgst_percent"]} label="SGST %">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "cgst_percent"]} label="CGST %">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "igst_percent"]} label="IGST %">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item {...restField} name={[name, "total_amount"]} label="Total Amount">
                <InputNumber className="w-full" disabled />
              </Form.Item>
            </Col>

           <Col span={6}>
 <Form.Item
  {...restField}
  name={[name, "item_return_reason"]}
  label="Return Reason"
>
  <Select disabled={isView }>
    {returnReasons.map((reason) => (
      <Select.Option key={reason} value={reason} disabled={isView}>
        {reason}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  noStyle
  shouldUpdate={(prev, curr) =>
    prev.items?.[name]?.item_return_reason !==
    curr.items?.[name]?.item_return_reason
  }
>
  {({ getFieldValue }) =>
    getFieldValue(["items", name, "item_return_reason"]) === "Other" ? (
      <Form.Item
        {...restField}
        name={[name, "other_reason"]}
        label="Enter Reason"
        rules={[{ required: true, message: "Please enter reason" }]}
      >
        <Input />
      </Form.Item>
    ) : null
  }
</Form.Item>


 
</Col>

          </Row>

        </div>
      ))}
    </>
  )}
</Form.List>



        <Row gutter={16}>
  <Col span={6}>
    <Form.Item label="Round Off" name="roundOff" disabled={isView}>
      <InputNumber className="w-full"  disabled={isView}/>
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