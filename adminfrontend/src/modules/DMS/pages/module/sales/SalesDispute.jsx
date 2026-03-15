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
import { exportToExcel } from "../../../../../utils/exportToExcel";
import { getSaleDisputes,getSaleDisputeById ,createSaleDispute,updateSaleDispute,getDisputeById} from "../../../../../api/sales";
const reasonsList = [
  "Quality Issue",
  "Damaged Packaging",
  "Expired",
  "Wrong Item",
];



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

export default function SalesDispute() {
 const [records, setRecords] = useState([]);
const [filteredData, setFilteredData] = useState([]);
const [searchText, setSearchText] = useState(""); const [isModalOpen, setIsModalOpen] = useState(false);
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
useEffect(() => {
  loadDisputes();
}, []);

const loadDisputes = async () => {
  try {
    const res = await getSaleDisputes();

    const rows = res.map((r, index) => ({
      key: index,
       dispute_id: r.dispute_id,
      sale_invoice_id: r.sale_invoice_id,
      invoiceNo: r.sale_invoice_number,
      orderNo: r.order_number,
      plantName: r.plant_name,
      returnDate: r.return_date,
      disputeNo: r.dispute_no,
     status: r.status === "Dispute Raised" ? "Pending" : r.status,
      items: r.items?.map((i, idx) => ({
        id: idx,
        item: i
      })) || []
    }));

    setRecords(rows);
  } catch (error) {
    console.error(error);
  }
};
const openModal = async (record, mode = "view") => {
  try {

    let res;

    // 🔹 VIEW and EDIT → same API
    if (mode === "view" || mode === "edit") {
      res = await getDisputeById(record.dispute_id);
    }

    // 🔹 RAISE DISPUTE → invoice API
    if (mode === "dispute") {
      res = await getSaleDisputeById(record.sale_invoice_id);
    }

    const items = res.items.map((it) => ({
      id: it.invoice_item_id,
      item: it.item,
      itemCode: it.item_code,
      uom: it.uom_name,
      rate: it.rate,
      quantity: it.order_qty,
      returnQty: it.return_qty,
      returnReason: it.reason,
      otherReasonText: it.other_reason
    }));

    const modalData = {
      dispute_id: res.dispute_id,
      sale_invoice_id: res.sale_invoice_id,
      invoiceNo: res.invoice_no,
      orderNo: res.order_no,
      plantName: res.plant_name,
      disputeNo: res.dispute_number,
      date: res.date,
      status: res.status,
      items
    };

    setModalRecord(modalData);
    setModalMode(mode);

    const otherFlag = {};
    const qtyInit = {};

    items.forEach((it) => {
      otherFlag[it.id] = it.returnReason === "Other";
      qtyInit[it.id] = it.returnQty || 0;
    });

    form.setFieldsValue({
      status: res.status,
      ...items.reduce((acc, it) => {
        acc[`qty_${it.id}`] = it.returnQty;
        acc[`reason_${it.id}`] = it.returnReason;
        acc[`other_${it.id}`] = it.otherReasonText;
        return acc;
      }, {})
    });

    setIsOtherReason(otherFlag);
    setQtyState(qtyInit);
    setIsModalOpen(true);

  } catch (error) {
    console.error(error);
  }
};

const handleExport = async () => {
  const exportData = [];

  for (const record of filteredData) {
    try {
      // Fetch detailed item info for this invoice
      const res = await getDisputeById(record.dispute_id);
      
      const items = res.items.map(it => ({
        item: it.item,
        itemCode: it.item_code,
        uom: it.uom_name,
        rate: it.rate,
        quantity: it.order_qty,
        returnQty: it.return_qty,
        returnReason: it.reason,
        otherReasonText: it.other_reason
      }));

      // Flatten items for export
      items.forEach(item => {
        exportData.push({
          "Invoice No": record.invoiceNo,
          "Order No": record.orderNo,
          Plant: record.plantName || "N/A",
          Date: record.returnDate,
          "Dispute No": record.disputeNo || "N/A",
          Status: record.status,
          Item: item.item,
          "Item Code": item.itemCode || "",
          UOM: item.uom || "",
          Rate: item.rate || 0,
          "Order Qty": item.quantity || 0,
          "Return Qty": item.returnQty || 0,
          Reason: item.returnReason === "Other" ? item.otherReasonText : item.returnReason,
          Total: (item.returnQty || 0) * (item.rate || 0)
        });
      });

    } catch (error) {
      console.error(`Failed to fetch details for invoice ${record.invoiceNo}`, error);
    }
  }

  // Export to Excel
  exportToExcel(exportData, "Sales_Disputes");
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
        content: "Please provide a reason for all items with return quantity.",
      });
      return;
    }

    let disputeNo = modalRecord.disputeNo;
    if (modalMode === "dispute" && !disputeNo) {
      disputeNo = generateDisputeNo(records);
    }
if (modalMode === "edit") {

  const disputeItems = updatedItems
    .filter((i) => i.returnQty > 0)
    .map((i) => ({
      invoice_item_id: i.id,
      return_qty: i.returnQty,
      reason: i.returnReason,
      other_reason: i.otherReasonText
    }));

  const payload = {
    dispute_id: modalRecord.dispute_id,
    sale_invoice_id: modalRecord.sale_invoice_id,
    status: values.status,
    items: disputeItems
  };

  await updateSaleDispute(payload); // ✅ UPDATE API
}
    // 🔹 API CALL WHEN RAISE DISPUTE
    if (modalMode === "dispute") {
      const disputeItems = updatedItems
        .filter((i) => i.returnQty > 0)
        .map((i) => ({
          invoice_item_id: i.id,
          return_qty: i.returnQty,
          reason: i.returnReason,
          other_reason: i.otherReasonText,
        }));

   const payload = {
  sale_invoice_id: modalRecord.sale_invoice_id,
  dispute_no: disputeNo,
  status: values.status,
  items: disputeItems,
};

      await createSaleDispute(payload);
    }

    const newRecord = {
      ...modalRecord,
      disputeNo,
      itemsReturned: updatedItems.filter((i) => i.returnQty > 0),
      status: values.status,
    };

    setRecords((prev) =>
      prev.map((r) =>
        r.invoiceNo === newRecord.invoiceNo ? newRecord : r
      )
    );

    await loadDisputes(); // refresh table
    setIsModalOpen(false);

  } catch (error) {
    console.error(error);
  }
};

  const statusTag = (status) => {
    const map = {
      Approved: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Delivered: "bg-red-100 text-red-700",
      Rejected: "bg-red-100 text-red-700",
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

    {/* Approved → show credit note */}
    {record.status === "Approved" && (
      <span className="text-green-600 font-semibold text-xs">
        Credit Note Created
      </span>
    )}

    {/* Delivered → allow dispute */}
    {record.status === "Delivered" && (
      <Button
        className="bg-amber-500! text-white! text-xs! font-semibold! px-3! py-1! rounded-md!"
        onClick={() => openModal(record, "dispute")}
      >
        Raise Dispute
      </Button>
    )}
  </div>
)
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
  onClick={handleExport}
>
  Export
</Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
      <Table columns={columns} dataSource={filteredData} rowKey="sale_invoice_id" /> </div>

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
              <Col span={4}>
  <Form.Item label="Status" name="status"  rules={[{ required: true, message: "Please select status" }]}>
    <Select placeholder="Select Status" >
      <Select.Option value="Pending">Pending</Select.Option>
      <Select.Option value="Approved">Approved</Select.Option>
      <Select.Option value="Rejected">Rejected</Select.Option>
    </Select>
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
