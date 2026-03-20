// StockEtf.jsx
import React, { useState, useEffect } from "react";
import {
  addWealthEntry,
  getWealthEntries,
  getWealthEntryById,
  updateWealthEntry,
} from "../../api/wealth";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
  message,
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

/**
 * StockEtf.jsx
 * - Table-first layout
 * - Top controls: Search / Reset / Export / Add New (amber theme)
 * - Add/Edit/View modals (width 920) with the fields you provided
 * - Auto-calculates Purchase Amount and Total Amount from inputs
 */

const initialData = [
  {
    key: 1,
    assetName: "Reliance Industries Ltd - ETF",
    purchaseQuantity: 100,
    purchasePrice: 2400,
    brokerage: 50,
    purchaseAmount: 240000, // qty * price
    stt: 48,
    stampCharges: 10,
    otherCharges: 25,
    gstAndSTax: 18,
    transactionalCharges: 5,
    totalAmount: 240161, // computed
    remarks: "Long term buy",
  },
];

export default function Etf() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const fetchData = async () => {
    try {
      const response = await getWealthEntries({ asset_category: "ETF" });
      const mappedData = response.map((item) => ({
        key: item.id,
        assetName: item.asset_name,
        purchaseQuantity: item.purchase_quantity,
        purchasePrice: item.purchase_price,
        brokerage: item.brokerage,
        stt: item.stt,
        stampCharges: item.stamp_charges,
        otherCharges: item.other_charges,
        gstAndSTax: item.gst_tax,
        transactionalCharges: item.transactional_charges,
        purchaseAmount: item.purchase_amount,
        totalAmount: item.total_amount,
        remarks: item.remarks,
      }));
      setData(mappedData);
    } catch (error) {
      console.error("Error fetching wealth entries:", error);
      message.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper: compute derived amounts from values
  const computeAmounts = (values) => {
    const qty = Number(values.purchaseQuantity || 0);
    const price = Number(values.purchasePrice || 0);
    const brokerage = Number(values.brokerage || 0);
    const stt = Number(values.stt || 0);
    const stampCharges = Number(values.stampCharges || 0);
    const otherCharges = Number(values.otherCharges || 0);
    const gstAndSTax = Number(values.gstAndSTax || 0);
    const transactionalCharges = Number(values.transactionalCharges || 0);

    const purchaseAmount = qty * price;
    // total amount = purchaseAmount + all charges (including brokerage & taxes)
    const totalAmount =
      purchaseAmount +
      brokerage +
      stt +
      stampCharges +
      otherCharges +
      gstAndSTax +
      transactionalCharges;

    return {
      purchaseAmount,
      totalAmount,
    };
  };

  const formatValue = (value) => {
    if (!value) return "";

    return value.toString();
  };

  const filteredData = data.filter((row) =>
    Object.entries(row).some(([key, value]) => {
      if (key === "key") return false; // skip internal key

      return formatValue(value)
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());
    }),
  );

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "assetName",
      width: 260,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Qty</span>,
      dataIndex: "purchaseQuantity",
      width: 90,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Price (₹)</span>,
      dataIndex: "purchasePrice",
      width: 110,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Purchase Amount (₹)
        </span>
      ),
      dataIndex: "purchaseAmount",
      width: 150,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Brokerage (₹)</span>
      ),
      dataIndex: "brokerage",
      width: 120,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">GST / S.Tax (₹)</span>
      ),
      dataIndex: "gstAndSTax",
      width: 140,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Total Amount (₹)</span>
      ),
      dataIndex: "totalAmount",
      width: 150,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 110,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={async () => {
              setSelectedRecord(record);
              try {
                const data = await getWealthEntryById(record.key);
                const mappedData = {
                  assetName: data.asset_name,
                  purchaseQuantity: data.purchase_quantity,
                  purchasePrice: data.purchase_price,
                  brokerage: data.brokerage,
                  stt: data.stt,
                  stampCharges: data.stamp_charges,
                  otherCharges: data.other_charges,
                  gstAndSTax: data.gst_tax,
                  transactionalCharges: data.transactional_charges,
                  purchaseAmount: data.purchase_amount,
                  totalAmount: data.total_amount,
                  remarks: data.remarks,
                };
                viewForm.setFieldsValue(mappedData);
                setIsViewModalOpen(true);
              } catch (error) {
                console.error("Error fetching entry details:", error);
                message.error("Failed to load details.");
              }
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={async () => {
              setSelectedRecord(record);
              try {
                const data = await getWealthEntryById(record.key);
                const mappedData = {
                  assetName: data.asset_name,
                  purchaseQuantity: data.purchase_quantity,
                  purchasePrice: data.purchase_price,
                  brokerage: data.brokerage,
                  stt: data.stt,
                  stampCharges: data.stamp_charges,
                  otherCharges: data.other_charges,
                  gstAndSTax: data.gst_tax,
                  transactionalCharges: data.transactional_charges,
                  purchaseAmount: data.purchase_amount,
                  totalAmount: data.total_amount,
                  remarks: data.remarks,
                };
                editForm.setFieldsValue(mappedData);
                setIsEditModalOpen(true);
              } catch (error) {
                console.error("Error loading for edit:", error);
                message.error("Failed to load details for editing.");
              }
            }}
          />
        </div>
      ),
    },
  ];

  const exportCSV = () => {
    if (!data.length) {
      message.info("No data to export");
      return;
    }
    const headers = [
      "Asset Name",
      "Purchase Quantity",
      "Purchase Price",
      "Brokerage",
      "Purchase Amount",
      "STT",
      "Stamp Charges",
      "Other charges",
      "GST / S.Tax",
      "Transactional Charges",
      "Total Amount",
      "Remarks",
    ];
    const rows = data.map((r) => [
      r.assetName,
      r.purchaseQuantity,
      r.purchasePrice,
      r.brokerage,
      r.purchaseAmount,
      r.stt,
      r.stampCharges,
      r.otherCharges,
      r.gstAndSTax,
      r.transactionalCharges,
      r.totalAmount,
      (r.remarks || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((e) =>
        e.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_etf_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Stock / ETF Purchase Details</h6>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Asset Name</span>}
            name="assetName"
            rules={[{ required: true, message: "Please enter Asset Name" }]}
          >
            <Input placeholder="Asset / ETF name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Quantity</span>}
            name="purchaseQuantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Price (₹)</span>}
            name="purchasePrice"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Brokerage (₹)</span>}
            name="brokerage"
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">STT (₹)</span>}
            name="stt"
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Stamp Charges (₹)</span>}
            name="stampCharges"
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Other charges (₹)</span>}
            name="otherCharges"
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">GST / S.Tax (₹)</span>}
            name="gstAndSTax"
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item
            label={
              <span className="text-amber-700">Transactional Charges (₹)</span>
            }
            name="transactionalCharges"
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Amount (₹)</span>}
            name="purchaseAmount"
          >
            <InputNumber className="w-full!" disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Total Amount (₹)</span>}
            name="totalAmount"
          >
            <InputNumber className="w-full!" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Remarks</span>}
            name="remarks"
          >
            <Input
              placeholder="Optional notes"
              className="w-full!"
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Top controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search by asset or remarks..."
            className="w-64! border-amber-300! focus:border-amber-500!"
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
            onClick={exportCSV}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              addForm.resetFields();
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          ETF Transactions
        </h2>
        <p className="text-amber-600 mb-3">
          Track exchange-traded fund investments and movements
        </p>
        <Table
          columns={columns}
          scroll={{ y: 300 }}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add ETF Transaction
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const calcs = computeAmounts(values);
              const payload = {
                asset_category: "ETF",
                asset_name: values.assetName,
                remarks: values.remarks,

                purchase_quantity: (values.purchaseQuantity || 0).toFixed(4),
                purchase_price: (values.purchasePrice || 0).toFixed(2),
                brokerage: (values.brokerage || 0).toFixed(2),
                stt: (values.stt || 0).toFixed(2),
                stamp_charges: (values.stampCharges || 0).toFixed(2),
                other_charges: (values.otherCharges || 0).toFixed(2),
                gst_tax: (values.gstAndSTax || 0).toFixed(2),
                transactional_charges: (
                  values.transactionalCharges || 0
                ).toFixed(2),

                purchase_amount: (calcs.purchaseAmount || 0).toFixed(2),
                total_amount: (calcs.totalAmount || 0).toFixed(2),
              };

              const response = await addWealthEntry(payload);

              // Update local state with the new record
              const newRecord = {
                key:
                  response.id ||
                  (data.length ? Math.max(...data.map((d) => d.key)) + 1 : 1),
                assetName: values.assetName,
                purchaseQuantity: values.purchaseQuantity,
                purchasePrice: values.purchasePrice,
                brokerage: values.brokerage,
                stt: values.stt,
                stampCharges: values.stampCharges,
                otherCharges: values.otherCharges,
                gstAndSTax: values.gstAndSTax,
                transactionalCharges: values.transactionalCharges,
                purchaseAmount: calcs.purchaseAmount,
                totalAmount: calcs.totalAmount,
                remarks: values.remarks,
              };

              setData((prev) => [newRecord, ...prev]);
              setIsAddModalOpen(false);
              addForm.resetFields();
              message.success("Purchase added successfully.");
              fetchData();
            } catch (error) {
              console.error("Error adding wealth entry:", error);
              message.error("Failed to add purchase.");
            }
          }}
          onValuesChange={(changed, allValues) => {
            const calcs = computeAmounts(allValues);
            addForm.setFieldsValue(calcs);
          }}
        >
          {renderFormFields(addForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              htmlType="submit"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit ETF Transaction
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={920}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const calcs = computeAmounts(values);
              const payload = {
                asset_category: "ETF",
                asset_name: values.assetName,
                remarks: values.remarks,

                purchase_quantity: Number(values.purchaseQuantity || 0).toFixed(
                  4,
                ),
                purchase_price: Number(values.purchasePrice || 0).toFixed(2),
                brokerage: Number(values.brokerage || 0).toFixed(2),
                stt: Number(values.stt || 0).toFixed(2),
                stamp_charges: Number(values.stampCharges || 0).toFixed(2),
                other_charges: Number(values.otherCharges || 0).toFixed(2),
                gst_tax: Number(values.gstAndSTax || 0).toFixed(2),
                transactional_charges: Number(
                  values.transactionalCharges || 0,
                ).toFixed(2),

                purchase_amount: (calcs.purchaseAmount || 0).toFixed(2),
                total_amount: (calcs.totalAmount || 0).toFixed(2),
              };

              await updateWealthEntry(selectedRecord.key, payload);

              setData((prev) =>
                prev.map((d) =>
                  d.key === selectedRecord.key
                    ? { ...selectedRecord, ...values, ...calcs }
                    : d,
                ),
              );
              setIsEditModalOpen(false);
              editForm.resetFields();
              setSelectedRecord(null);
              message.success("Purchase updated successfully.");
              fetchData();
            } catch (error) {
              console.error("Error updating wealth entry:", error);
              message.error("Failed to update purchase.");
            }
          }}
          onValuesChange={(changed, allValues) => {
            const calcs = computeAmounts(allValues);
            editForm.setFieldsValue(calcs);
          }}
        >
          {renderFormFields(editForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setSelectedRecord(null);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              htmlType="submit"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View ETF Transaction Details"
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={920}
      >
        <Form form={viewForm} layout="vertical">
          {renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}
