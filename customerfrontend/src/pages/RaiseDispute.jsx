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
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const reasonsList = [
  "Quality Issue",
  "Damaged Packaging",
  "Expired",
  "Wrong Item",
];

const saleReturnJSON = {
  records: [
    {
      key: 1,
      invoiceNo: "INV-001",
      orderNo: "ORD-1001",
      plantName: "Plant1",
      returnDate: "2024-04-01",
      status: "Approved",
      disputeNo: "DISP-20240401-0001",
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
          returnReason: "Other",
        },
      ],
    },
    {
      key: 2,
      invoiceNo: "INV-002",
      orderNo: "ORD-1002",
      plantName: "Plant2",
      returnDate: "2025-05-15",
      status: "Delivered",
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
};

// generate dispute number like DISP-20241213-0001
const generateDisputeNo = (existingRecords) => {
  const today = dayjs().format("YYYYMMDD");
  const prefix = `DISP-${today}-`;
  const todayNos = existingRecords
    .map((r) => r.disputeNo)
    .filter((n) => typeof n === "string" && n.startsWith(prefix));
  const maxSeq =
    todayNos
      .map((n) => parseInt(n.replace(prefix, ""), 10))
      .filter((n) => !isNaN(n))
      .reduce((m, n) => (n > m ? n : m), 0) || 0;
  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
};

export default function RaiseDispute() {
  const [records, setRecords] = useState(saleReturnJSON.records);
  const [filteredData, setFilteredData] = useState(records);
  const [searchText, setSearchText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRecord, setModalRecord] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit" | "dispute"
  const [form] = Form.useForm();
  const [isOtherReason, setIsOtherReason] = useState({});
  const [qtyState, setQtyState] = useState({}); // store live quantities

  useEffect(() => {
    const val = searchText.toLowerCase();
    setFilteredData(
      records.filter((r) =>
        `${r.invoiceNo} ${r.orderNo} ${r.plantName}`
          .toLowerCase()
          .includes(val)
      )
    );
  }, [searchText, records]);

  const openModal = (record, mode = "view") => {
    setModalRecord(record);
    setModalMode(mode);

    if (mode !== "view") {
      const items = (record.itemsReturned || record.items || []).map(
        (it) => ({
          ...it,
          returnQty: it.returnQty || 0,
          returnReason: it.returnReason || null,
          otherReasonText: it.otherReasonText || "",
        })
      );

      const otherFlag = {};
      const qtyInit = {};
      items.forEach((it) => {
        otherFlag[it.id] = it.returnReason === "Other";
        qtyInit[it.id] = it.returnQty || 0;
      });

      form.setFieldsValue(
        items.reduce((acc, it) => {
          acc[`qty_${it.id}`] = it.returnQty;
          acc[`reason_${it.id}`] = it.returnReason;
          acc[`other_${it.id}`] = it.otherReasonText;
          return acc;
        }, {})
      );

      setIsOtherReason(otherFlag);
      setQtyState(qtyInit);
    }

    setIsModalOpen(true);
  };

  const updateOtherReason = (id, value) => {
    setIsOtherReason((prev) => ({ ...prev, [id]: value === "Other" }));
  };

  const handleQtyChange = (id, value) => {
    setQtyState((prev) => ({ ...prev, [id]: value || 0 }));
    form.setFieldsValue({ [`qty_${id}`]: value });
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      const updatedItems = (modalRecord.items || []).map((it) => ({
        ...it,
        returnQty: values[`qty_${it.id}`] || 0,
        returnReason: values[`reason_${it.id}`] || "",
        otherReasonText: values[`other_${it.id}`] || "",
        totalAmount: (values[`qty_${it.id}`] || 0) * it.rate,
      }));

      const hasReturn = updatedItems.some((i) => i.returnQty > 0);
      if (!hasReturn) {
        Modal.error({
          title: "Validation Error",
          content: "Please enter return quantity for at least one item.",
        });
        return;
      }

      const invalidReason = updatedItems.some(
        (i) =>
          i.returnQty > 0 &&
          (!i.returnReason ||
            (i.returnReason === "Other" && !i.otherReasonText))
      );
      if (invalidReason) {
        Modal.error({
          title: "Validation Error",
          content:
            "Please provide a reason for all items with return quantity.",
        });
        return;
      }

      // if this is coming from "Raise Dispute", make sure there is a disputeNo
      let disputeNo = modalRecord.disputeNo;
      if (modalMode === "dispute" && !disputeNo) {
        disputeNo = generateDisputeNo(records);
      }

      const newRecord = {
        ...modalRecord,
        disputeNo,
        itemsReturned: updatedItems.filter((i) => i.returnQty > 0),
        status: "Pending",
      };

      setRecords((prev) =>
        prev.map((r) =>
          r.invoiceNo === newRecord.invoiceNo ? newRecord : r
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      // validation errors handled above
    }
  };

  const statusTag = (status) => {
    const map = {
      Approved: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Delivered: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status]}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      title: <span className="text-amber-700!">Invoice No</span>,
      dataIndex: "invoiceNo",
      render: (text) => <span className="text-amber-700!">{text}</span>,
    },
    {
      title: <span className="text-amber-700!">Order No</span>,
      dataIndex: "orderNo",
      render: (text) => <span className="text-amber-700!">{text}</span>,
    },
    {
      title: <span className="text-amber-700!">Dispute No</span>,
      dataIndex: "disputeNo",
      render: (text) => (
        <span className="text-amber-700!">{text || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700!">Return Date</span>,
      dataIndex: "returnDate",
      render: (text) => <span className="text-amber-700!">{text}</span>,
    },
    {
      title: <span className="text-amber-700!">Plant</span>,
      dataIndex: "plantName",
      render: (text) => <span className="text-amber-700!">{text}</span>,
    },
    {
      title: <span className="text-amber-700!">Items</span>,
      render: (_, r) => (
        <span className="text-amber-700!">
          {(r.itemsReturned || r.items || [])
            .map((x) => x.item)
            .join(", ")}
        </span>
      ),
    },
    
    {
      title: <span className="text-amber-700!">Status</span>,
      dataIndex: "status",
      render: statusTag,
    },
    {
      title: <span className="text-amber-700!">Actions</span>,
      width: 180,
      render: (record) => (
        <div className="flex gap-3 items-center">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => openModal(record, "view")}
          />
          {record.status === "Pending" && (
            <EditOutlined
              className="cursor-pointer! text-orange-500!"
              onClick={() => openModal(record, "edit")}
            />
          )}
          {record.status === "Delivered" && (
            <Button
              className="bg-amber-500! text-white! text-xs! font-semibold! px-3! py-1! rounded-md! hover:bg-amber-600!"
              onClick={() => openModal(record, "dispute")}
            >
              Raise Dispute
            </Button>
          )}
        </div>
      ),
    },
  ];

  const modalColumns = [
    {
      title: <span className="text-amber-700!">Item</span>,
      dataIndex: "item",
    },
    {
      title: <span className="text-amber-700!">Item Code</span>,
      dataIndex: "itemCode",
    },
    {
      title: <span className="text-amber-700!">UOM</span>,
      dataIndex: "uom",
    },
    {
      title: <span className="text-amber-700!">Rate</span>,
      dataIndex: "rate",
    },
    {
      title: <span className="text-amber-700!">Order Qty</span>,
      dataIndex: "quantity",
    },
    {
      title: <span className="text-amber-700!">Return Qty</span>,
      render: (_, row) =>
        modalMode === "view" ? (
          row.returnQty
        ) : (
        <Form.Item
  name={`qty_${row.id}`}
  style={{ margin: 0 }}
  rules={[
    { required: true, message: "Return quantity is required" },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (value == null) return Promise.resolve();

        if (value > row.quantity) {
          return Promise.reject(
            new Error(
              `Return quantity cannot be greater than order quantity (${row.quantity})`
            )
          );
        }

        return Promise.resolve();
      },
    }),
  ]}
>
  <InputNumber
    min={0}
    value={qtyState[row.id]}
    onChange={(v) => handleQtyChange(row.id, v)}
    style={{ width: "100%" }}
  />
</Form.Item>

        ),
    },
    {
      title: <span className="text-amber-700!">Reason</span>,
      render: (_, row) => {
        if (modalMode === "view") {
          return row.returnReason === "Other"
            ? row.otherReasonText || ""
            : row.returnReason;
        } else {
          return (
            <Form.Item name={`reason_${row.id}`} style={{ margin: 0 }}>
              <Select
                placeholder="Select reason"
                onChange={(v) => updateOtherReason(row.id, v)}
                value={form.getFieldValue(`reason_${row.id}`)}
              >
                {reasonsList.map((r) => (
                  <Select.Option key={r}>{r}</Select.Option>
                ))}
                <Select.Option value="Other">Other</Select.Option>
              </Select>
              {isOtherReason[row.id] && (
                <Form.Item
                  name={`other_${row.id}`}
                  style={{ marginTop: 5 }}
                >
                  <Input
                    placeholder="Other reason"
                    value={form.getFieldValue(`other_${row.id}`)}
                    onChange={(e) =>
                      form.setFieldsValue({
                        [`other_${row.id}`]: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              )}
            </Form.Item>
          );
        }
      },
    },
    {
      title: <span className="text-amber-700!">Total</span>,
      render: (_, row) => {
        const qty =
          modalMode === "view"
            ? row.returnQty || 0
            : qtyState[row.id] || 0;
        return (qty * row.rate).toFixed(2);
      },
    },
  ];

  const modalTitle =
    modalMode === "view"
      ? <span className="text-amber-600!" >View Dispute</span>
      : modalMode === "edit"
      ? <span className="text-amber-600!" >Edit Dispute</span>
      : "Dispute Items";

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-700">Raise Dispute</h1>
      <p className="text-amber-600 mb-3">
        Manage your dispute easily
      </p>

      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search"
            className="border-amber-300! w-64! focus:border-amber-500!"
            prefix={<SearchOutlined className="text-amber-600!" />}
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
        <Table columns={columns} dataSource={filteredData} rowKey="key" />
      </div>

      <Modal
        title={
          <div className="flex justify-between items-center">
            <span>{modalTitle}</span>
           
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={modalMode !== "view" ? handleSave : () => setIsModalOpen(false)}
        okText={modalMode === "view" ? "Close" : "Save"}
        width={1000}
      >
        {modalRecord && (
          <Form form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={4}>
                <Form.Item label="Invoice No">
                  <Input value={modalRecord.invoiceNo} disabled />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Order No">
                  <Input value={modalRecord.orderNo} disabled />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Plant">
                  <Input value={modalRecord.plantName} disabled />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Date">
                  <Input
                    value={dayjs().format("YYYY-MM-DD")}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Dispute No">
                  <Input
                    value={
                      modalRecord.disputeNo ||
                      (modalMode === "dispute"
                        ? "N/A"
                        : "N/A")
                    }
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>

            

            <h6 className="text-amber-500 my-3">
              {modalMode === "view"
                ? "Items"
                : "Enter qty & reason"}
            </h6>

            <Table
              size="small"
              dataSource={modalRecord.itemsReturned || modalRecord.items}
              columns={modalColumns}
              pagination={false}
              scroll={{y:300}}
              rowKey="id"
            />
          </Form>
        )}
      </Modal>
    </div>
  );
}
