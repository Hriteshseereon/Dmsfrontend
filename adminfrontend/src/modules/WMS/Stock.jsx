// StockEtf.jsx
import React, { useState } from "react";
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
import { createWmsStock,getWmsStocks,updateWmsStock } from "../../api/wms";


export default function StockEtf() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const fetchStocks = async () => {
    try {
      const stocks = await getWmsStocks();  
      // Transform stocks data if necessary
      setData(stocks);
      console.log("Fetched stocks:", stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      message.error("Failed to fetch stocks.");
    }
  };

  React.useEffect(() => {
    fetchStocks();
  }, []); 

  const handleAddStock = async (values) => {
  try {
    message.loading({ content: "Saving stock...", key: "stockAdd" });

    const calcs = computeAmounts(values);

    const payload = {
      asset_name: values.asset_name,
      purchase_quantity: values.purchase_quantity,
      purchase_price: values.purchase_price,

      brokerage: values.brokerage || 0,
      stt: values.stt || 0,
      stamp_charges: values.stamp_charges || 0,
      other_charges: values.other_charges || 0,
      gst_tax: values.gst_tax || 0,
      transactional_charges: values.transactional_charges || 0,

      purchase_amount: calcs.purchase_amount,
      total_amount: calcs.total_amount,
      remarks: values.remarks || "",
    };

    await createWmsStock(payload);

    message.success({ content: "Stock added successfully", key: "stockAdd" });

    setIsAddModalOpen(false);
    addForm.resetFields();

    // reload table data
    fetchStocks();
  } catch (error) {
    console.error(error);
    message.error({ content: "Failed to add stock", key: "stockAdd" });
  }
};

const handleUpdateStock = async (values) => {
  try {
    message.loading({ content: "Updating stock...", key: "stockUpdate" });

    const calcs = computeAmounts(values);

    const payload = {
      asset_name: values.asset_name,
      purchase_quantity: values.purchase_quantity,
      purchase_price: values.purchase_price,

      brokerage: values.brokerage || 0,
      stt: values.stt || 0,
      stamp_charges: values.stamp_charges || 0,
      other_charges: values.other_charges || 0,
      gst_tax: values.gst_tax || 0,
      transactional_charges: values.transactional_charges || 0,

      purchase_amount: calcs.purchase_amount,
      total_amount: calcs.total_amount,
      remarks: values.remarks || "",
    };

    // IMPORTANT: use backend ID
    await updateWmsStock(selectedRecord.id, payload);

    message.success({ content: "Stock updated successfully", key: "stockUpdate" });

    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedRecord(null);

    // refresh table
    fetchStocks();
  } catch (error) {
    console.error(error);
    message.error({ content: "Failed to update stock", key: "stockUpdate" });
  }
};

  // Helper: compute derived amounts from values
 const computeAmounts = (values) => {
  const qty = Number(values.purchase_quantity || 0);
  const price = Number(values.purchase_price || 0);

  const brokerage = Number(values.brokerage || 0);
  const stt = Number(values.stt || 0);
  const stampCharges = Number(values.stamp_charges || 0);
  const otherCharges = Number(values.other_charges || 0);
  const gstTax = Number(values.gst_tax || 0);
  const transactionalCharges = Number(values.transactional_charges || 0);

  const purchase_amount = qty * price;

  const total_amount =
    purchase_amount +
    brokerage +
    stt +
    stampCharges +
    otherCharges +
    gstTax +
    transactionalCharges;

  return {
    purchase_amount,
    total_amount,
  };
};


  const filteredData = data.filter((row) =>
    ["asset_name", "remarks"]
      .some((f) => (row[f] || "").toString().toLowerCase()
        .includes(searchText.trim().toLowerCase()))
  );

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Asset Name</span>,
      dataIndex: "asset_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Qty</span>,
      dataIndex: "purchase_quantity",
      width: 100,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Price (₹)</span>,
      dataIndex: "purchase_price",
      width: 100,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Purchase Amount (₹)</span>,
      dataIndex: "purchase_amount",
      width: 100,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Brokerage (₹)</span>,
      dataIndex: "brokerage",
      width: 100,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">GST / S.Tax (₹)</span>,
      dataIndex: "gst_tax",
      width: 100,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount (₹)</span>,
      dataIndex: "total_amount",
      width: 100,
      render: (v) => <span className="text-amber-800">{v ?? "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              // set view form values and open
              viewForm.setFieldsValue({ ...record });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              editForm.setFieldsValue({ ...record });
              setIsEditModalOpen(true);
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
      r.asset_name,
      r.purchase_quantity,
      r.purchase_price,
      r.brokerage,
      r.purchase_amount,
      r.stt,
      r.stamp_charges,
      r.other_charges,
      r.gst_tax,
      r.transactional_charges,
      r.total_amount,
      (r.remarks || "").replace(/[\n\r]/g, " "),
    ]);
    const csvContent = [headers, ...rows]
      .map((e) => e.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_etf_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "")}.csv`;
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
            name="asset_name"
            rules={[{ required: true, message: "Please enter Asset Name" }]}
          >
            <Input placeholder="Asset / ETF name" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Quantity</span>}
            name="purchase_quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Price (₹)</span>}
            name="purchase_price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
         <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Brokerage (₹)</span>} name="brokerage">
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

      </Row>

      <Row gutter={24}>
       
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">STT (₹)</span>} name="stt">
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Stamp Charges (₹)</span>} name="stamp_charges">
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Other charges (₹)</span>} name="other_charges">
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>
         <Col span={6}>
          <Form.Item label={<span className="text-amber-700">GST / S.Tax (₹)</span>} name="gst_tax">
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

       
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Transactional Charges (₹)</span>} name="transactional_charges">
            <InputNumber className="w-full!" min={0} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Purchase Amount (₹)</span>} name="purchase_amount">
            <InputNumber className="w-full!" disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Total Amount (₹)</span>} name="total_amount">
            <InputNumber className="w-full!" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Remarks</span>} name="remarks">
            <Input placeholder="Optional notes" className="w-full!" disabled={disabled} />
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
          <Button icon={<DownloadOutlined />} onClick={exportCSV} className="border-amber-400! text-amber-700! hover:bg-amber-100!">
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
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Stock Transactions</h2>
        <p className="text-amber-600 mb-3">Track equity trades, dividends, and portfolio performance</p>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 10 }} scroll={{ y: 300 }} />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add Stock Transaction</span>}
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
  onFinish={handleAddStock}
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
            <Button type="primary"   className="bg-amber-500! hover:bg-amber-600! border-none!"
           htmlType="submit">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Stock Transaction</span>}
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
  onFinish={handleUpdateStock}
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
            <Button type="primary"   className="bg-amber-500! hover:bg-amber-600! border-none!"
           htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="View Stock Transaction Details"
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
