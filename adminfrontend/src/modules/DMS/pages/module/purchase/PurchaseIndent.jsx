import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Table,
  Input,
  Button,
  Modal,
  Select,
  Row,
  Col,
  Card,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getPurchaseOrder,
  getPurchaseOrderById,
  createpurchaseOrder,
  updatePurchaseOrder,
} from "../../../../../api/purchase";
import { getSalescontractGroups } from "../../../../../api/sales"; // ← use this instead
import useSessionStore from "../../../../../store/sessionStore";

const { Option } = Select;

const statusOptions = ["Pending", "Approved", "Rejected"];

// shared pill badge
const renderStatusBadge = (status) => {
  const base = "px-3 py-1 rounded-full text-sm font-semibold";
  if (status === "Approved")
    return (
      <span className={`${base} bg-green-100 text-green-700`}>{status}</span>
    );
  if (status === "Pending")
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>
    );
  return (
    <span className={`${base} bg-red-100 text-red-700`}>{status || "-"}</span>
  );
};

const fmtDate = (d) => (d ? dayjs(d).format("DD-MM-YYYY") : "-");

export default function PurchaseIndent() {
  // ---------- main order list ----------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ---------- modal control ----------
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | "view" | null
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statusValue, setStatusValue] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  // ---------- available sale contracts (Add/Edit modal) ----------
  const [availableContracts, setAvailableContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // ---------- search text for the contracts table inside modal ----------
  const [contractSearch, setContractSearch] = useState("");

  useEffect(() => {
    fetchPurchaseOrder();
  }, []);

  // ---------------------------------------------------------------
  // Purchase order list
  // ---------------------------------------------------------------
  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseOrder();
      const list = res?.data || res || [];

      const formatted = list.map((item, index) => ({
        key: item.id || index + 1,
        id: item.id,
        order_number: item.order_number,
        plant_name: item.plant_name,
        vendor_name: item.vendor_name,
        contract_count:
          item.sales_contracts?.length ?? item.contract_count ?? 0,
        total_qty_all_items: item.total_qty_all_items || 0,
        grand_total: item.grand_total || item.total_amount || 0,
        status: item.status || "Pending",
      }));

      setData(formatted);
    } catch (error) {
      console.error("Failed to fetch purchase orders", error);
      message.error("Failed to load purchase indents");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      fetchPurchaseOrder();
      return;
    }
    const filtered = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleExport = async () => {
    try {
      const res = await getPurchaseOrder();
      const list = res?.data || res || [];
      const exportRows = [];

      for (const order of list) {
        const detailRes = await getPurchaseOrderById(order.id || order.key);
        const detail = detailRes?.data || detailRes;

        const contracts =
          detail.sales_contracts_details || detail.contracts || [];

        if (contracts.length) {
          contracts.forEach((c) => {
            exportRows.push({
              "Order No": detail.order_number,
              "Plant Name": detail.plant_name,
              "Supplier Name": detail.vendor_name,
              Status: detail.status,
              "Sale Contract No":
                c.sale_contract_number || c.saleContractNumber,
              Customer: c.customer_business_name || c.customer,
              Broker: c.broker_name || c.brokerName,
              "Contract Valid From": c.from_date || c.startDate,
              "Contract Valid To": c.to_date || c.endDate,
              "Total Qty (All Contracts)": detail.total_qty_all_items,
              "Total Amount (₹)": detail.grand_total || detail.total_amount,
            });
          });
        } else {
          exportRows.push({
            "Order No": detail.order_number,
            "Plant Name": detail.plant_name,
            "Supplier Name": detail.vendor_name,
            Status: detail.status,
            "Total Qty (All Contracts)": detail.total_qty_all_items,
            "Total Amount (₹)": detail.grand_total || detail.total_amount,
          });
        }
      }

      exportToExcel(
        exportRows,
        "All_Purchase_Indent_Details",
        "PurchaseIndent",
      );
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Export failed");
    }
  };

  // ---------------------------------------------------------------
  // Map a sales contract API record → row shape for the contracts table
  // Matches the actual API response shape from GET /sales/contracts/
  // ---------------------------------------------------------------
  const mapContractRecord = (contract, index) => {
    const items = contract.items || [];

    const quantity = items.reduce(
      (sum, item) => sum + Number(item.gross_qty || 0),
      0,
    );

    const grossWeightTon = items.reduce(
      (sum, item) =>
        sum + Number(item.total_net_wt_in_ton || item.totalnetWtinTon || 0),
      0,
    );

    return {
      key: contract.sale_contract_id || contract.id || index + 1,
      id: contract.sale_contract_id || contract.id,
      saleContractNumber: contract.sale_contract_number || "-",
      customer:
        contract.customer_business_name || contract.customer_name || "-",
      plantName: contract.plant_name || "-",
      brokerName: contract.broker_name || "-",
      contractDate: contract.created_at,
      startDate: contract.from_date,
      endDate: contract.to_date,
      quantity,
      grossWeightTon,
      status: contract.status,
      grandTotal: contract.grand_total,
    };
  };

  // ---------------------------------------------------------------
  // Fetch all sale contracts via getSalescontractGroups,
  // then keep ONLY status === "Approved"
  // ---------------------------------------------------------------
  const fetchAvailableContracts = async () => {
    try {
      setContractsLoading(true);
      const res = await getSalescontractGroups();
      const list = res?.data || res || [];

      // Only show Approved contracts for purchase order creation
      const approved = list.filter(
        (c) => (c.status || "").toLowerCase() === "approved",
      );

      const formatted = approved.map(mapContractRecord);
      setAvailableContracts(formatted);
      return formatted;
    } catch (err) {
      console.error(err);
      message.error("Failed to load available sale contracts");
      return [];
    } finally {
      setContractsLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Modal open/close
  // ---------------------------------------------------------------
  const closeModal = () => {
    setModalMode(null);
    setSelectedRecord(null);
    setSelectedRowKeys([]);
    setAvailableContracts([]);
    setContractSearch("");
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedRecord(null);
    setSelectedRowKeys([]);
    setStatusValue("Pending");
    setContractSearch("");
    fetchAvailableContracts();
  };

  const openViewModal = async (record) => {
    try {
      setLoading(true);
      const res = await getPurchaseOrderById(record.key);
      const detail = res?.data || res;
      setSelectedRecord(detail);
      setModalMode("view");
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (record) => {
    try {
      setLoading(true);
      const res = await getPurchaseOrderById(record.key);
      const detail = res?.data || res;
      setSelectedRecord(detail);
      setStatusValue(detail.status || "Pending");
      setContractSearch("");

      const linkedContracts =
        detail.sales_contracts_details || detail.contracts || [];
      const linkedIds = linkedContracts.map((c) =>
        typeof c === "object" ? c.sale_contract_id || c.id : c,
      );
      setSelectedRowKeys(linkedIds);

      // Fetch approved contracts, then merge in already-linked ones
      // (they might be Approved or previously linked Pending/Expired)
      const fetched = await fetchAvailableContracts();

      if (linkedContracts.length) {
        const existingIds = new Set(fetched.map((c) => c.id));
        const merged = [...fetched];
        linkedContracts.forEach((c, idx) => {
          if (
            typeof c === "object" &&
            !existingIds.has(c.sale_contract_id || c.id)
          ) {
            merged.push(mapContractRecord(c, idx));
          }
        });
        setAvailableContracts(merged);
      }

      setModalMode("edit");
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Create / Update
  // ---------------------------------------------------------------
  const handleSubmitSelection = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one sale contract");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        sales_contracts: selectedRowKeys,
      };

      if (modalMode === "edit") {
        payload.status = statusValue;
        await updatePurchaseOrder(selectedRecord.id, payload);
        message.success("Purchase order updated successfully");
      } else {
        await createpurchaseOrder(payload);
        message.success("Purchase order created successfully");
      }

      closeModal();
      fetchPurchaseOrder();
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------
  // Filtered contracts for in-modal search
  // ---------------------------------------------------------------
  const filteredContracts = contractSearch
    ? availableContracts.filter((c) =>
        JSON.stringify(c).toLowerCase().includes(contractSearch.toLowerCase()),
      )
    : availableContracts;

  // ---------------------------------------------------------------
  // Columns — purchase order list
  // ---------------------------------------------------------------
  const orderColumns = [
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "order_number",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant</span>,
      dataIndex: "plant_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Supplier</span>,
      dataIndex: "vendor_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Contracts</span>,
      dataIndex: "contract_count",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty_all_items",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Total Amount (₹)</span>
      ),
      dataIndex: "grand_total",
      width: 160,
      render: (t) => (
        <span className="text-amber-800">
          ₹{Number(t || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: renderStatusBadge,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer text-blue-500"
            onClick={() => openViewModal(record)}
          />
          {record.status !== "Approved" && (
            <EditOutlined
              className="cursor-pointer text-red-500"
              onClick={() => openEditModal(record)}
            />
          )}
        </div>
      ),
    },
  ];

  // ---------------------------------------------------------------
  // Columns — available sale contracts (mirrors SalesSouda table)
  // ---------------------------------------------------------------
  const contractColumns = [
    {
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
      dataIndex: "saleContractNumber",
      width: 120,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      width: 120,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Broker Name</span>,
      dataIndex: "brokerName",
      width: 120,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Contract Date</span>
      ),
      dataIndex: "contractDate",
      width: 120,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Valid From</span>,
      dataIndex: "startDate",
      width: 110,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Valid To</span>,
      dataIndex: "endDate",
      width: 110,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customer",
      width: 150,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Quantity</span>,
      dataIndex: "quantity",
      width: 100,
      render: (t) => (
        <span className="text-amber-800">{Number(t || 0).toFixed(3)}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Gross Weight (Ton)</span>
      ),
      dataIndex: "grossWeightTon",
      width: 140,
      render: (t) => (
        <span className="text-amber-800">{Number(t || 0).toFixed(3)}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 110,
      render: renderStatusBadge,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total (₹)</span>,
      dataIndex: "grandTotal",
      width: 130,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          {t !== undefined && t !== null ? `₹ ${Number(t).toFixed(2)}` : "-"}
        </span>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600" />}
            placeholder="Search..."
            className="w-64 border-amber-300"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
            onClick={() => {
              setSearchText("");
              fetchPurchaseOrder();
            }}
          >
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Export
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            onClick={openAddModal}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Purchase Order Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Order Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your purchase order data</p>

        <Table
          columns={orderColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 420 }}
          rowKey="key"
        />
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        title={
          <span className="!text-amber-700 !text-2xl !font-semibold">
            {modalMode === "edit"
              ? "Edit Purchase Order"
              : "Create Purchase Order"}
          </span>
        }
        open={modalMode === "add" || modalMode === "edit"}
        onCancel={closeModal}
        footer={null}
        width={1600}
      >
        {/* Status selector (edit only) */}
        {modalMode === "edit" && (
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            bodyStyle={{ padding: 12 }}
          >
            <Row gutter={16} align="bottom">
              <Col span={6}>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <Select
                  className="w-full"
                  value={statusValue}
                  onChange={setStatusValue}
                >
                  {statusOptions.map((opt) => (
                    <Option key={opt} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        )}

        {/* Available Approved Sale Contracts */}
        <Card
          size="small"
          style={{ border: "1px solid #FDE68A" }}
          bodyStyle={{ padding: 12 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h6 className="text-amber-500 mb-0">Approved Sale Contracts</h6>
            <div className="flex items-center gap-3">
              {/* in-modal search */}
              <Input
                prefix={<SearchOutlined className="text-amber-600" />}
                placeholder="Search contracts..."
                className="w-52 border-amber-300"
                value={contractSearch}
                onChange={(e) => setContractSearch(e.target.value)}
                allowClear
              />
              <span className="text-sm text-amber-700 font-semibold">
                {selectedRowKeys.length} selected
              </span>
            </div>
          </div>

          <Table
            rowSelection={rowSelection}
            columns={contractColumns}
            dataSource={filteredContracts}
            loading={contractsLoading}
            pagination={false}
            scroll={{ y: 360, x: 1200 }}
            rowKey="key"
          />
        </Card>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={closeModal}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={submitting}
            disabled={selectedRowKeys.length === 0}
            className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            onClick={handleSubmitSelection}
          >
            {modalMode === "edit"
              ? "Update Purchase Order"
              : "Create Purchase Order"}
          </Button>
        </div>
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Purchase Order
          </span>
        }
        open={modalMode === "view"}
        onCancel={closeModal}
        footer={null}
        width={1400}
      >
        {selectedRecord && (
          <>
            <Card
              size="small"
              style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
              bodyStyle={{ padding: 12 }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Order No</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.order_number}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Plant</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.plant_name}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Supplier</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.vendor_name}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Status</div>
                  <div>{renderStatusBadge(selectedRecord.status)}</div>
                </Col>
              </Row>
              <Row gutter={16} className="mt-3">
                <Col span={6}>
                  <div className="text-sm text-gray-500">Total Qty</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.total_qty_all_items || 0}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Total Amount (₹)</div>
                  <div className="text-amber-800 font-semibold">
                    ₹
                    {Number(
                      selectedRecord.grand_total ||
                        selectedRecord.total_amount ||
                        0,
                    ).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              size="small"
              style={{ border: "1px solid #FDE68A" }}
              bodyStyle={{ padding: 12 }}
            >
              <h6 className="text-amber-500 mb-2">Linked Sale Contracts</h6>
              <Table
                columns={contractColumns}
                dataSource={(
                  selectedRecord.sales_contracts_details ||
                  selectedRecord.contracts ||
                  []
                ).map(mapContractRecord)}
                pagination={false}
                scroll={{ y: 280, x: 1200 }}
                rowKey="key"
              />
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
}
