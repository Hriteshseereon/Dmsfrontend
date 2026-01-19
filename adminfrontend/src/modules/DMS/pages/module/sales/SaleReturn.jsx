// SaleReturn.jsx
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
} from "@ant-design/icons";
import dayjs from "dayjs";

// 🔹 JSON Data
const saleReturnJSON = {
  records: [
    {
      key: 1,
      invoiceNo: "INV-001",
      item: "Sunflower Oil",
      itemCode: "It1",
      customer: "Ramesh",
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
      customer: "Suresh",
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
    uomOptions: ["Ltr", "Kg", "Ton"],
    statusOptions: ["Rejected", "Pending", "Approved"],
    returnReasonOptions: [
      "Quality Issue",
      "Damaged Packaging",
      "Expired",
      "Wrong Item",
    ],
    companyOptions: ["Kalinga Oil Mills", "Odisha Edibles"],
    branchOptions: ["Bhubaneswar", "Cuttack", "Puri"],
    depoOptions: ["Bhubaneswar Depot", "Cuttack Depot", "Puri Depot"],
  },
};

export default function SaleReturn() {
  const [records, setRecords] = useState(saleReturnJSON.records);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isOtherReason, setIsOtherReason] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  useEffect(() => {
    setFilteredData(records);
  }, [records]);

  useEffect(() => {
    const val = searchText.toLowerCase();
    setFilteredData(
      records.filter((item) =>
        Object.values(item).some((v) => String(v).toLowerCase().includes(val))
      )
    );
  }, [searchText, records]);

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
  const handleSubmit = (values, mode, targetForm) => {
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
      setRecords((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key ? { ...item, ...record } : item
        )
      );
      setIsEditModalOpen(false);
    } else if (mode === "add") {
      setRecords((prev) => [...prev, { ...record, key: prev.length + 1 }]);
      setIsAddModalOpen(false);
    }

    targetForm.resetFields();
  };

  const handleAddClick = () => {
    addForm.resetFields();
    addForm.setFieldsValue({ status: "Pending", returnDate: dayjs() });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setFormValues(record, editForm, "edit");
    setIsEditModalOpen(true);
    setIsOtherReason(record.returnReason === "Other");
  };

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setFormValues(record, viewForm, "view");
    setIsViewModalOpen(true);
    setIsOtherReason(record.returnReason === "Other");
  };

  const onInvoiceSelectForAdd = (invoiceNo) => {
    const source = records.find((r) => r.invoiceNo === invoiceNo);
    if (!source) return;

    const values = {
      ...source,

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

    addForm.setFieldsValue(values);
    addForm.setFieldValue(
      "returnDate",
      source.returnDate ? dayjs(source.returnDate) : dayjs()
    );
  };

  const renderFormFields = (formInstance, mode = "view") => {
    const isView = mode === "view";
    const isAdd = mode === "add";
    const isEdit = mode === "edit";

    const disabledFor = (field) => {
      if (isView) return true;
      if (isAdd)
        return !["invoiceNo", "quantity", "returnReason"].includes(field);
      if (isEdit) return !["quantity", "returnReason"].includes(field);
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
                {records.map((r) => (
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
            <Form.Item label="Customer Name" name="customer">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Return Date"
              name="returnDate"
              rules={[{ required: true }]}
            >
              <DatePicker
                className="w-full"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                disabled={disabledFor("returnDate")}
              />
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
              <Select disabled>
                {saleReturnJSON.options.statusOptions.map((v) => (
                  <Select.Option key={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <h6 className="text-amber-500">Item & Return Details</h6>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Item Name"
              name="item"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Item Code"
              name="itemCode"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="UOM" name="uom" rules={[{ required: true }]}>
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
                    formInstance.setFieldsValue({ otherReasonText: "" });
                  }
                }}
              >
                {saleReturnJSON.options.returnReasonOptions.map((v) => (
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
            className="cursor-pointer text-blue-500"
            onClick={() => handleViewClick(record)}
          />
          <EditOutlined
            className="cursor-pointer text-red-500"
            onClick={() => handleEditClick(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500 hover:bg-amber-600 border-none"
            onClick={handleAddClick}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Sales Return
        </h2>
        <p className="text-amber-600 mb-3">Manage your sales Return easily</p>
        <Table columns={columns} dataSource={filteredData} pagination={false} />
      </div>
      {/* 🔹 Add Modal */}
      <Modal
        title="Add New Sale Return"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => {
          addForm
            .validateFields()
            .then((values) => handleSubmit(values, "add", addForm))
            .catch(() => {});
        }}
        width={1000}
      >
        <Form
          form={addForm}
          layout="vertical"
          onValuesChange={(_, allValues) => {
            const totals = calculateTotals(allValues);
            addForm.setFieldsValue(totals);
          }}
        >
          {renderFormFields(addForm, "add")}
        </Form>
      </Modal>

      {/* 🔹 Edit Modal */}
      <Modal
        title="Edit Sale Return"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => {
          editForm
            .validateFields()
            .then((values) => handleSubmit(values, "edit", editForm))
            .catch(() => {});
        }}
        width={1000}
      >
        <Form
          form={editForm}
          layout="vertical"
          onValuesChange={(_, allValues) => {
            const totals = calculateTotals(allValues);
            editForm.setFieldsValue(totals);
          }}
        >
          {renderFormFields(editForm, "edit")}
        </Form>
      </Modal>

      {/* 🔹 View Modal */}
      <Modal
        title="View Return"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          {renderFormFields(viewForm, "view")}
        </Form>
      </Modal>
    </div>
  );
}
