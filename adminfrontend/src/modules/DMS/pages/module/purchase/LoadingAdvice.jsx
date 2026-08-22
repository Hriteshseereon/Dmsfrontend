import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Card,
  message,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DownloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getFreightDetails,
  createFreightDetails,
  updateFreightDetails,
} from "../../../../../api/purchase";

const parseDateToDayjs = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split(" ")[0].split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return dayjs(dateStr);
    }
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return dayjs(new Date(y, m, d));
  }
  return dayjs(dateStr);
};

export default function LoadingAdvice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getFreightDetails();
      const list = res || [];
      setData(list.map((item) => ({ ...item, key: item.id })));
    } catch (error) {
      console.error("Failed to fetch freight details:", error);
      message.error("Failed to load transport freight details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleReset = () => {
    setSearchText("");
  };

  const handleExport = () => {
    const exportRows = filteredData.map((item) => ({
      "PO Number": item.purchase_order_number || "-",
      "Contract Number": item.sale_contract_number || "-",
      "Vehicle Details": item.vehicle_details || "-",
      "Transporter Name": item.transporter_name || "-",
      "Lorry Receipt No": item.lorry_receipt_no || "-",
      "Lorry Receipt Date": item.lorry_receipt_date || "-",
      "Gross Weight Loading Plan": item.gross_weight_loading_plan || "-",
      "Gross Weight Loaded": item.gross_weight_loaded || "-",
      "Min Guarantee Weight": item.min_guarantee_weight || "-",
      Place: item.place || "-",
      "Freight Rate Agreed": item.freight_rate_agreed || "-",
      "Freight Rate Placed": item.freight_rate_placed || "-",
      "Freight Amount": item.freight_amount || "-",
      "Advance Paid Amount": item.advance_paid_amount || "-",
      "Claim Shortage": item.claim_shortage || "-",
      "Claim Shortage Notes":
        item.claim_shortage_notes || item.claim_shortage_note || "-",
      "Other Charges": item.other_charges || "-",
      "Other Charges Notes":
        item.other_charges_notes || item.other_charges_note || "-",
      "Balance Payable": item.balance_payable || "-",
      "Balance Paid": item.balance_paid || "-",
      "Transport Commission": item.transport_commission || "-",
    }));
    exportToExcel(exportRows, "Transport_Freight_Details", "FreightDetails");
  };

  const handleOpenAddModal = (record) => {
    setSelectedRecord(record);
    setModalMode("add");
    form.setFieldsValue({
      lorry_receipt_no: undefined,
      lorry_receipt_date: record.lorry_receipt_date
        ? parseDateToDayjs(record.lorry_receipt_date)
        : dayjs(),
      gross_weight_loaded: record.gross_weight_loading_plan
        ? Number(record.gross_weight_loading_plan)
        : undefined,
      freight_rate_placed: record.freight_rate_agreed
        ? Number(record.freight_rate_agreed)
        : undefined,
      advance_paid_amount: undefined,
      claim_shortage: undefined,
      claim_shortage_notes: undefined,
      other_charges: undefined,
      other_charges_notes: undefined,
      transport_commission: undefined,
      balance_paid: undefined,
    });
  };

  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setModalMode("edit");
    form.setFieldsValue({
      lorry_receipt_no: record.lorry_receipt_no,
      lorry_receipt_date: record.lorry_receipt_date
        ? parseDateToDayjs(record.lorry_receipt_date)
        : null,
      gross_weight_loaded: record.gross_weight_loaded
        ? Number(record.gross_weight_loaded)
        : undefined,
      freight_rate_placed: record.freight_rate_placed
        ? Number(record.freight_rate_placed)
        : undefined,
      advance_paid_amount: record.advance_paid_amount
        ? Number(record.advance_paid_amount)
        : undefined,
      claim_shortage: record.claim_shortage
        ? Number(record.claim_shortage)
        : undefined,
      claim_shortage_notes:
        record.claim_shortage_notes || record.claim_shortage_note,
      other_charges: record.other_charges
        ? Number(record.other_charges)
        : undefined,
      other_charges_notes:
        record.other_charges_notes || record.other_charges_note,
      transport_commission: record.transport_commission
        ? Number(record.transport_commission)
        : undefined,
      balance_paid: record.balance_paid
        ? Number(record.balance_paid)
        : undefined,
    });
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedRecord(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        lorry_receipt_no: values.lorry_receipt_no,
        lorry_receipt_date: values.lorry_receipt_date
          ? values.lorry_receipt_date.format("DD-MM-YYYY")
          : null,
        gross_weight_loaded: values.gross_weight_loaded
          ? Number(values.gross_weight_loaded)
          : null,
        freight_rate_placed: values.freight_rate_placed
          ? Number(values.freight_rate_placed)
          : null,
        claim_shortage: values.claim_shortage
          ? Number(values.claim_shortage)
          : null,
        claim_shortage_notes: values.claim_shortage_notes || null,
        other_charges: values.other_charges
          ? Number(values.other_charges)
          : null,
        other_charges_notes: values.other_charges_notes || null,
      };

      if (modalMode === "edit") {
        payload.advance_paid_amount = values.advance_paid_amount
          ? Number(values.advance_paid_amount)
          : null;
        payload.transport_commission = values.transport_commission
          ? Number(values.transport_commission)
          : null;
        payload.balance_paid = values.balance_paid ? Number(values.balance_paid) : null;
      }

      if (modalMode === "add") {
        payload.purchase_order = selectedRecord.purchase_order;
        payload.sale_contract = selectedRecord.sale_contract;
        await createFreightDetails(payload);
        message.success("Freight details added successfully");
      } else {
        await updateFreightDetails(selectedRecord.id, payload);
        message.success("Freight details updated successfully");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Submission failed:", error);
      message.error("Failed to save freight details");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const lower = searchText.toLowerCase();
    return (
      item.purchase_order_number?.toLowerCase().includes(lower) ||
      item.sale_contract_number?.toLowerCase().includes(lower) ||
      item.vehicle_details?.toLowerCase().includes(lower) ||
      item.transporter_name?.toLowerCase().includes(lower) ||
      item.place?.toLowerCase().includes(lower) ||
      item.lorry_receipt_no?.toLowerCase().includes(lower)
    );
  });

  const columns = [
    // {
    //   title: <span className="text-amber-700 font-semibold">PO Number</span>,
    //   dataIndex: "purchase_order_number",
    //   width: 110,
    //   render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    // },
    // {
    //   title: (
    //     <span className="text-amber-700 font-semibold">Contract Number</span>
    //   ),
    //   dataIndex: "sale_contract_number",
    //   width: 110,
    //   render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    // },
    {
      title: (
        <span className="text-amber-700 font-semibold">Vehicle Details</span>
      ),
      dataIndex: "vehicle_details",
      width: 100,
      render: (t) => (
        <span className="text-amber-800 font-semibold">{t || "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Transport Name</span>
      ),
      dataIndex: "transporter_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Lorry Receipt No</span>
      ),
      dataIndex: "lorry_receipt_no",
      width: 110,
      render: (t) => (
        <span
          className={
            t
              ? "bg-green-50 text-green-800 px-1 py-0.5 rounded font-medium border border-green-200"
              : "text-red-500 font-semibold"
          }
        >
          {t || "Pending"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Lorry Receipt Date</span>
      ),
      dataIndex: "lorry_receipt_date",
      width: 100,
      render: (t) => {
        if (!t) return "-";
        if (t.includes("-") && t.split("-")[0].length === 2) {
          return <span className="text-amber-800">{t}</span>;
        }
        const parsed = parseDateToDayjs(t);
        return (
          <span className="text-amber-800">
            {parsed ? parsed.format("DD-MM-YYYY") : t}
          </span>
        );
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Gross Weight Loading Plan
        </span>
      ),
      dataIndex: "gross_weight_loading_plan",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">{t ? Number(t).toFixed(3) : "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Gross Weight Loaded
        </span>
      ),
      dataIndex: "gross_weight_loaded",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">{t ? Number(t).toFixed(3) : "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Min Guarantee Weight
        </span>
      ),
      dataIndex: "min_guarantee_weight",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">{t ? Number(t).toFixed(3) : "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Place</span>,
      dataIndex: "place",
      width: 90,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Freight Rate Agreed
        </span>
      ),
      dataIndex: "freight_rate_agreed",
      width: 100,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Freight Rate Placed
        </span>
      ),
      dataIndex: "freight_rate_placed",
      width: 100,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Freight Amount</span>
      ),
      dataIndex: "freight_amount",
      width: 100,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Advance Paid Amount
        </span>
      ),
      dataIndex: "advance_paid_amount",
      width: 100,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Claim / Shortage</span>
      ),
      dataIndex: "claim_shortage",
      width: 100,
      render: (t, r) => (
        <Tooltip
          title={r.claim_shortage_notes || r.claim_shortage_note || "No notes"}
        >
          <span className="text-amber-800 font-semibold cursor-pointer">
            ₹
            {t
              ? Number(t).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })
              : "0.00"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Other Charges</span>
      ),
      dataIndex: "other_charges",
      width: 100,
      render: (t, r) => (
        <Tooltip
          title={r.other_charges_notes || r.other_charges_note || "No notes"}
        >
          <span className="text-amber-800 font-semibold cursor-pointer">
            ₹
            {t
              ? Number(t).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })
              : "0.00"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Balance Payable</span>
      ),
      dataIndex: "balance_payable",
      width: 100,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Balance Paid</span>,
      dataIndex: "balance_paid",
      width: 100,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Transport Commission
        </span>
      ),
      dataIndex: "transport_commission",
      width: 100,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        const hasLorryReceipt = !!record.lorry_receipt_no;
        return (
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              if (hasLorryReceipt) {
                handleOpenEditModal(record);
              } else {
                handleOpenAddModal(record);
              }
            }}
            className={
              hasLorryReceipt
                ? "!bg-amber-500 !hover:bg-amber-600 !border-none text-xs"
                : "!bg-emerald-600 !hover:bg-emerald-700 !border-none text-xs"
            }
          >
            {hasLorryReceipt ? "Edit" : "Add Freight"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-full overflow-hidden">
      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 w-96">
          <Input
            prefix={<SearchOutlined className="text-amber-600" />}
            placeholder="Search by PO No, Vehicle, Transporter..."
            value={searchText}
            onChange={handleSearch}
            allowClear
            className="border-amber-300 hover:border-amber-400 focus:border-amber-500 rounded"
          />
          <Button
            onClick={handleReset}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Reset
          </Button>
        </div>
        <div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="!bg-emerald-600 !hover:bg-emerald-700 !border-none rounded font-medium"
          >
            Export to Excel
          </Button>
          <Tooltip title="Reload records">
            <Button
              icon={<SyncOutlined spin={loading} />}
              onClick={fetchData}
              className="ml-2 border-amber-300 hover:border-amber-400 text-amber-700 rounded"
            />
          </Tooltip>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white mt-4">
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={false}
          scroll={{ y: "calc(100vh - 250px)", x: 2000 }}
          rowKey="id"
          size="small"
          className="[&_.ant-table-cell]:!px-1 [&_.ant-table-cell]:!py-1 [&_.ant-table-thead_th]:!py-1.5"
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            {modalMode === "add"
              ? "Add Transport Freight Details"
              : "Update Transport Freight Details"}
          </span>
        }
        open={modalMode !== null}
        onCancel={handleCloseModal}
        footer={null}
        width={750}
        zIndex={1100}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          {selectedRecord && (
            <Card
              size="small"
              className="mb-4 border-amber-200 bg-amber-50/20"
              title="Record Context"
            >
              <Row gutter={12}>
                <Col span={8}>
                  <div className="text-xs text-gray-500">PO Number</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.purchase_order_number || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Contract Number</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.sale_contract_number || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Vehicle Details</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.vehicle_details || "-"}
                  </div>
                </Col>
              </Row>
              <Row gutter={12} className="mt-2">
                <Col span={8}>
                  <div className="text-xs text-gray-500">Transporter Name</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.transporter_name || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">
                    Freight Rate Agreed
                  </div>
                  <div className="text-amber-800 font-semibold">
                    ₹{selectedRecord.freight_rate_agreed || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">
                    Min Guarantee Weight
                  </div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.min_guarantee_weight || "-"}
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lorry_receipt_no"
                label="Lorry Receipt No"
                rules={[
                  {
                    required: true,
                    message: "Please input Lorry Receipt Number!",
                  },
                ]}
              >
                <Input placeholder="Enter Lorry Receipt Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lorry_receipt_date"
                label="Lorry Receipt Date"
                rules={[
                  {
                    required: true,
                    message: "Please select Lorry Receipt Date!",
                  },
                ]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gross_weight_loaded"
                label="Gross Weight Loaded (Ton)"
                rules={[
                  { required: true, message: "Please input loaded weight!" },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={3}
                  placeholder="Loaded Weight"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="freight_rate_placed"
                label="Freight Rate Placed (₹)"
                rules={[
                  {
                    required: true,
                    message: "Please input placed freight rate!",
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  placeholder="Agreed freight rate"
                />
              </Form.Item>
            </Col>
          </Row>

          {modalMode === "edit" && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="advance_paid_amount"
                  label="Advance Paid Amount (₹)"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Advance Amount"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="transport_commission"
                  label="Transport Commission (₹)"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Transport Commission"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Card
            size="small"
            title="Shortage & Deductions"
            className="mb-4 border-rose-200 bg-rose-50/5"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="claim_shortage" label="Claim Shortage (₹)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Deduction amount"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="claim_shortage_notes"
                  label="Claim Shortage Notes"
                >
                  <Input placeholder="Reason for deduction" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
            size="small"
            title="Other Charges"
            className="mb-4 border-amber-200 bg-amber-50/5"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="other_charges" label="Other Charges (₹)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Other charges"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="other_charges_notes"
                  label="Other Charges Notes"
                >
                  <Input placeholder="Notes for other charges" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {modalMode === "edit" && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="balance_paid" label="Balance Paid (₹)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Balance paid amount"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            >
              {modalMode === "add"
                ? "Save Freight Details"
                : "Update Freight Details"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
