import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Space,
  Tag,
  DatePicker,
  message,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

// ---------------------------
// Mock data from Customer Dashboard
// ---------------------------
const salesDisputeJSON = {
  records: [
    {
      key: 1,
      invoiceNo: "INV-001",
      orderNo: "ORD-1001",
      plantName: "Plant1",
      customerName: "Ramesh Kumar",
      returnDate: "2024-04-01",
      status: "Approved",
      creditNoteMessage: "CN-001 to be issued for damaged/quality items.",
      items: [
        {
          id: "it-1",
          item: "Sunflower Oil",
          itemCode: "code1",
          uom: "Ltr",
          rate: 500,
          quantity: 50,
          returnQty: 10,
          returnReason: "Quality Issue",
        },
        {
          id: "it-2",
          item: "Mustard Oil",
          itemCode: "code2",
          uom: "Ltr",
          rate: 600,
          quantity: 20,
          returnQty: 5,
          otherReasonText: "Xyz",
        },
      ],
    },
    {
      key: 2,
      invoiceNo: "INV-002",
      orderNo: "ORD-1002",
      plantName: "Plant2",
      customerName: "Suresh Rao",
      returnDate: "2025-05-15",
      status: "Delivered",
      creditNoteMessage: "",
      items: [
        {
          id: "it-1",
          item: "Rice",
          itemCode: "r1",
          uom: "Kg",
          rate: 40,
          quantity: 100,
        },
        {
          id: "it-2",
          item: "Sunflower Oil",
          itemCode: "code1",
          uom: "Ltr",
          rate: 500,
          quantity: 50,
        },
        {
          id: "it-3",
          item: "Mustard Oil",
          itemCode: "code2",
          uom: "Ltr",
          rate: 600,
          quantity: 20,
        },
      ],
    },
  ],
  options: {
    statusOptions: ["Pending", "Approved", "Rejected", "Delivered"],
  },
};

export default function SalesDispute() {
  const [records, setRecords] = useState(salesDisputeJSON.records);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [selected, setSelected] = useState(null); // selected invoice (one dispute)
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();

  const disputedItems = (rec) =>
    rec.items.filter(
      (it) => it.returnQty || it.returnReason || it.otherReasonText
    );

  const disputeSummary = (rec) => {
    const dItems = disputedItems(rec);
    if (!dItems.length) return "No dispute lines";
    const totalReturnQty = dItems.reduce(
      (acc, it) => acc + (it.returnQty || 0),
      0
    );
    return `${dItems.length} item(s) disputed • Total Dispute Qty: ${totalReturnQty}`;
  };

  // derived filtered data (one row per invoice / dispute)
  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return records.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;

      const inHeader =
        r.invoiceNo.toLowerCase().includes(q) ||
        r.orderNo.toLowerCase().includes(q) ||
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.plantName || "").toLowerCase().includes(q);

      const inItems = r.items.some(
        (it) =>
          it.item.toLowerCase().includes(q) ||
          (it.itemCode || "").toLowerCase().includes(q)
      );

      return inHeader || inItems;
    });
  }, [records, searchText, statusFilter]);

  useEffect(() => {
    if (!isEditOpen) editForm.resetFields();
  }, [isEditOpen, editForm]);

  const statusColor = (s) => {
    if (s === "Approved") return "green";
    if (s === "Pending") return "gold";
    if (s === "Delivered") return "blue";
    return "red";
  };

  const openView = (rec) => {
    setSelected(rec);
    setIsViewOpen(true);
  };

  const openEdit = (rec) => {
    setSelected(rec);
    editForm.setFieldsValue({
      ...rec,
      returnDate: rec.returnDate ? dayjs(rec.returnDate) : null,
    });
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const vals = await editForm.validateFields();

      const payload = {
        ...selected,
        ...vals,
        returnDate: vals.returnDate
          ? vals.returnDate.format("YYYY-MM-DD")
          : null,
      };

      setRecords((prev) =>
        prev.map((r) => (r.key === selected.key ? payload : r))
      );
      setIsEditOpen(false);
      message.success("Dispute updated");
    } catch (e) {
      // validation errors are already handled by antd
    }
  };

  const changeStatusInline = (key, newStatus) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.key === key
          ? {
              ...r,
              status: newStatus,
            }
          : r
      )
    );
    message.success("Status changed");
  };

  const exportCSV = () => {
    const headers = [
      "InvoiceNo",
      "OrderNo",
      "CustomerName",
      "Plant",
      "ReturnDate",
      "Status",
      "CreditNoteMessage",
      "DisputeSummary",
    ];

    const rows = records.map((r) => [
      r.invoiceNo,
      r.orderNo,
      r.customerName || "",
      r.plantName || "",
      r.returnDate || "",
      r.status || "",
      r.creditNoteMessage || "",
      disputeSummary(r),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_disputes_${dayjs().format("YYYYMMDD_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("CSV exported");
  };

  const columns = [
    {
      title: "Invoice / Order",
      dataIndex: "invoiceNo",
      key: "invoiceOrder",
      width: 180,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.invoiceNo}</span>
          <span className="text-xs text-gray-500">{r.orderNo}</span>
        </div>
      ),
    },
    {
      title: "Customer / Plant",
      dataIndex: "customerName",
      key: "customerName",
      width: 220,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.customerName}</span>
          <span className="text-xs text-gray-500">{r.plantName}</span>
        </div>
      ),
    },
    {
      // MAIN: show item name, code, actual qty & dispute qty
      title: "Dispute Item",
      key: "disputeItem",
      width: 280,
      render: (_, r) => {
        const dItems = disputedItems(r);
        if (!dItems.length) {
          return <span className="text-xs text-gray-400">No dispute lines</span>;
        }
        const first = dItems[0];
        const extraCount = dItems.length - 1;

        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {first.item} ({first.itemCode})
            </span>
            <span className="text-xs text-gray-600">
              Dispute Qty: {first.returnQty || 0} / Actual Qty: {first.quantity || 0} {first.uom || ""}
            </span>
            {extraCount > 0 && (
              <span className="text-xs text-amber-600">
                + {extraCount} more item(s) disputed
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (s, rec) => (
        <Space>
          <Tag color={statusColor(s)}>{s}</Tag>
          <Select
            size="small"
            value={s}
            onChange={(val) => changeStatusInline(rec.key, val)}
            style={{ width: 110 }}
          >
            {salesDisputeJSON.options.statusOptions.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, rec) => (
        <Space>
          <EyeOutlined
            className="cursor-pointer! text-blue-600!"
            onClick={() => openView(rec)}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => openEdit(rec)}
          />
        </Space>
      ),
    },
  ];

  // columns for items inside View modal
  const itemColumns = [
    {
      title: "Item",
      dataIndex: "item",
      key: "item",
    },
    {
      title: "Code",
      dataIndex: "itemCode",
      key: "itemCode",
    },
    {
      title: "UOM",
      dataIndex: "uom",
      key: "uom",
      width: 80,
    },
    {
      title: "Actual Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Dispute Qty",
      dataIndex: "returnQty",
      key: "returnQty",
      width: 100,
      render: (val) => val || 0,
    },
    {
      title: "Dispute Reason",
      key: "reason",
      render: (_, it) => it.returnReason || it.otherReasonText || "-",
    },
  ];

  return (
    <div>
      {/* Header filters */}
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Input
            placeholder="Search invoice / order / customer / item"
            prefix={<SearchOutlined />}
            value={searchText}
             className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 360 }}
            allowClear
          />

          <Select
            placeholder="Filter by status"
            
            allowClear
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
          className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            {salesDisputeJSON.options.statusOptions.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>

          <Button icon={<DownloadOutlined />}  className="border-amber-400! text-amber-700! hover:bg-amber-100!" onClick={exportCSV}>
            Export
          </Button>
        </Space>

        <div />
      </div>

      {/* Table card (DMS-style) */}
      <div className="border rounded-lg p-4 shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-1">
          Sales Disputes
        </h2>
        <p className="text-sm text-amber-600 mb-4">
          View disputes from customer dashboard and manage status & single credit note per dispute.
        </p>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(r) => r.key}
          pagination={{ pageSize: 8 }}
          bordered
          size="middle"
        />
      </div>

      {/* View Modal */}
      <Modal
        title={
          selected
            ? `View Dispute: ${selected.invoiceNo} (${selected.orderNo})`
            : "View Dispute"
        }
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={null}
        width={900}
      >
        {selected && (
          <div className="space-y-4">
            <Row gutter={12}>
              <Col span={12}>
                <div className="font-semibold">Invoice / Order</div>
                <div>
                  {selected.invoiceNo} / {selected.orderNo}
                </div>
              </Col>
              <Col span={12}>
                <div className="font-semibold">Customer / Plant</div>
                <div>
                  {selected.customerName} / {selected.plantName}
                </div>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={8}>
                <div className="font-semibold">Return Date</div>
                <div>{selected.returnDate}</div>
              </Col>
              <Col span={8}>
                <div className="font-semibold">Status</div>
                <Tag color={statusColor(selected.status)}>
                  {selected.status}
                </Tag>
              </Col>
              <Col span={8}>
                <div className="font-semibold">Dispute Summary</div>
                <div>{disputeSummary(selected)}</div>
              </Col>
            </Row>

            <div>
              <div className="font-semibold mb-2">Items</div>
              <Table
                columns={itemColumns}
                dataSource={selected.items}
                rowKey={(it) => it.id}
                pagination={false}
                size="small"
                bordered
              />
            </div>

            <Row gutter={12}>
              <Col span={24}>
                <div className="font-semibold">Credit Note (for whole dispute)</div>
                <div>{selected.creditNoteMessage || "-"}</div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          selected
            ? `Edit Dispute: ${selected.invoiceNo} (${selected.orderNo})`
            : "Edit Dispute"
        }
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={saveEdit}
        width={900}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Invoice No" name="invoiceNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Order No" name="orderNo">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Plant" name="plantName">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Customer" name="customerName">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Return Date" name="returnDate">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  {salesDisputeJSON.options.statusOptions.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Credit Note Message (for whole dispute)"
                name="creditNoteMessage"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Single credit note for this invoice (e.g. CN number, amount, remarks)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {selected && (
                <>
                  <div className="font-semibold mb-1">Dispute Summary</div>
                  <div className="text-sm text-gray-600">
                    {disputeSummary(selected)}
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
