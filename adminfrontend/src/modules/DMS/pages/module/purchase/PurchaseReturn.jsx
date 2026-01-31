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
import { getPurchaseReturn } from "../../../../../api/purchase";
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

export default function PurchaseReturn() {
   const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isOtherReason, setIsOtherReason] = useState(false);

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
        key: item.id || index + 1,
        ...item,
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
  const handleSubmit = (values, mode) => {
    const record = {
      ...values,
      returnDate: values.returnDate
        ? values.returnDate.format("YYYY-MM-DD")
        : null,
    };

    if (record.returnReason === "Other") {
      record.returnReason = record.otherReasonText || "Other";
    }
    delete record.otherReasonText;

    if (mode === "edit") {
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key ? { ...item, ...record } : item
        )
      );
      setIsEditModalOpen(false);
    } else if (mode === "add") {
      setData((prev) => [...prev, { ...record, key: prev.length + 1 }]);
      setIsAddModalOpen(false);
    }
    addForm.resetFields();
    editForm.resetFields();
  };

  const handleAddClick = () => {
    addForm.resetFields();
    addForm.setFieldsValue({ status: "Pending", returnDate: dayjs() });
    setIsAddModalOpen(true);
  };

  const onInvoiceSelectForAdd = (invoiceNo, formType) => {
    const source = data.find((r) => r.invoiceNo === invoiceNo);
    if (!source) return;

    const values = {
      ...source,
      returnDate: dayjs(),
      status: "Pending",
      totalQtyDisplay: (source.quantity || 0) + (source.freeQty || 0),
      grossAmount: (source.quantity || 0) * (source.rate || 0),
      discountAmount:
        ((source.quantity || 0) *
          (source.rate || 0) *
          (source.discountPercent || 0)) /
        100,
      grandTotal: source.grandTotal || source.totalAmount || 0,
    };

    if (formType === "add") addForm.setFieldsValue(values);
    if (formType === "edit") editForm.setFieldsValue(values);
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
                onChange={(val) => {
                  if (mode === "add") onInvoiceSelectForAdd(val, "add");
                  if (mode === "edit") onInvoiceSelectForAdd(val, "edit");
                }}
                disabled={isView}
              >
                {data.map((r) => (
                  <Select.Option key={r.invoiceNo} value={r.invoiceNo}>
                    {r.invoiceNo}
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
            <Form.Item label="Plant Name" name="plantName">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Plant Code" name="plantCode">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Return Date" name="returnDate">
              <DatePicker className="w-full" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Branch Name" name="branchName">
              <Select disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Depo" name="depo">
              <Select disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Status" name="status">
              <Select disabled></Select>
            </Form.Item>
          </Col>
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
            <Form.Item label="Other Charges" name="otherCharges">
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Round Off" name="roundOff">
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
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoiceNo",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Item Name</span>,
      dataIndex: "item",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      width: 100,
      render: (_, record) => (
        <span className="text-amber-800">
          {(record.quantity || 0) + (record.freeQty || 0)} {record.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amt</span>,
      dataIndex: "grandTotal",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Return Date</span>,
      dataIndex: "returnDate",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Reason</span>,
      dataIndex: "returnReason",
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
            onClick={() => {
              setSelectedRecord(record);
              setFormValues(record, viewForm, "view");
              setIsViewModalOpen(true);
              setIsOtherReason(record.returnReason === "Other");
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              setFormValues(record, editForm, "edit");
              setIsEditModalOpen(true);
              setIsOtherReason(record.returnReason === "Other");
            }}
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
