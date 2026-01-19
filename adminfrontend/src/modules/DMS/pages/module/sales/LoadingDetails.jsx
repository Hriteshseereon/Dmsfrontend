import React, { useState } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  Upload,
  DatePicker,
  Row,
  Col,
  Select,
  message,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

/* ============================
   ADMIN SALES INVOICE DATA
   (FROM BACKEND API IN REAL)
   ============================ */
const salesInvoiceJSON = {
  initialData: [
    {
      key: 1,
      adviceNo: "LA-2025-001",
      adviceDate: "2025-11-20",
      poNo: "PO-2025-001",
      deliveryAddress: "Plant Gate A, Manufacturing Hub 1",
      wayBill: "WB123",

      invoiceStatus: "In-transit",

      vendorName: "Global Suppliers Co.",
      vendorAddress: "456 Commerce St, NY",
      vendorGSTIN: "GSTEB001",
      vendorContactPerson: "Alice Johnson",
      vendorPhoneNumber: "9876543210",

      plantName: "Manufacturing Hub 1",
      plantCode: "P-MH1",
      plantGSTIN: "GSTMA001",
      plantAddress: "123 Industrial Rd, CA",
      plantContactPerson: "Bob Williams",
      plantPhoneNumber: "0123456789",

      vehicleNo: "MH12AB4567",
      driverName: "Ram Singh",
      driverContact: "9123456789",
      insuranceValidUpto: "2026-05-20",
      puValidUpto: "2026-06-01",
      fitnessValidUpto: "2026-07-15",
      vehicleInTime: "10:00",
      vehicleOutTime: "11:30",
      tareWeights: 5000,
      netWeight: 4500,
      grossWeights: 9500,

      items: [
        {
          key: "item-1",
          slNo: 1,
          itemCode: "ITEM-001",
          itemDescription: "Raw Material X",
          reqQty: 1000,
          actualQty: 950,
          variance: -50,
          uom: "Kgs",
        },
        {
          key: "item-2",
          slNo: 2,
          itemCode: "ITEM-002",
          itemDescription: "Component A",
          reqQty: 500,
          actualQty: 500,
          variance: 0,
          uom: "Pcs",
        },
      ],
    },
  ],
};

export default function LoadingDetails() {
  const [data, setData] = useState(salesInvoiceJSON.initialData);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  /* ============================
     UPDATE INVOICE STATUS
     ============================ */
  const handleApproveInvoice = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...selectedRecord,
        invoiceStatus: values.invoiceStatus,
        invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
        invoiceFile: values.invoiceFile,
      };

      setData((prev) =>
        prev.map((item) =>
          item.key === payload.key ? payload : item
        )
      );

      // 🔗 API CALL (ADMIN → CUSTOMER)
      // POST /api/admin/sales-invoice
      // payload

      message.success("Invoice updated and sent to customer");
      setIsModalOpen(false);
    });
  };

  /* ============================
     TABLE COLUMNS
     ============================ */
  const columns = [
    {
      title: "Advice No",
      dataIndex: "adviceNo",
      render: (t) => <strong>{t}</strong>,
    },
    { title: "PO No", dataIndex: "poNo" },
    { title: "Vendor", dataIndex: "vendorName" },
    { title: "Plant", dataIndex: "plantName" },
    {
      title: "Invoice Status",
      dataIndex: "invoiceStatus",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === "Approved"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      render: (record) => (
        <EditOutlined
          className="cursor-pointer! text-red-600! "
          onClick={() => {
            setSelectedRecord(record);
            form.setFieldsValue({
              invoiceStatus: record.invoiceStatus,
              invoiceDate: dayjs(),
            });
            setIsModalOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-amber-700">
        Loading Details
      </h1>
      <p className="text-amber-600 mb-4">
        Review loading advice and approve sales order
      </p>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        bordered
      />

      {/* ============================
          VIEW + APPROVE MODAL
          ============================ */}
      <Modal
        title="Sales Invoice Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1400}
        footer={null}
      >
        <Form layout="vertical" form={form}>
          {/* READ-ONLY LOADING ADVICE */}
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="Advice No">
                <Input value={selectedRecord?.adviceNo} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="PO No">
                <Input value={selectedRecord?.poNo} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Delivery Address">
                <Input
                  value={selectedRecord?.deliveryAddress}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Way Bill">
                <Input value={selectedRecord?.wayBill} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="Vehicle No">
                <Input value={selectedRecord?.vehicleNo} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Driver Name">
                <Input value={selectedRecord?.driverName} disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Driver Contact">
                <Input value={selectedRecord?.driverContact} disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* ITEMS */}
          <div className="text-lg font-semibold text-amber-600 mt-4">
            Item Details
          </div>

          <Table
            dataSource={selectedRecord?.items || []}
            rowKey="key"
            pagination={false}
            bordered
            size="small"
            columns={[
              { title: "SL", dataIndex: "slNo" },
              { title: "Item Code", dataIndex: "itemCode" },
              { title: "Description", dataIndex: "itemDescription" },
              { title: "Req Qty", dataIndex: "reqQty" },
              { title: "Actual Qty", dataIndex: "actualQty" },
              { title: "Variance", dataIndex: "variance" },
              { title: "UOM", dataIndex: "uom" },
            ]}
          />

          {/* INVOICE SECTION */}
          <div className="text-lg font-semibold text-amber-600 mt-4">
            Sales Invoice
          </div>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                label="Invoice Date"
                name="invoiceDate"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Invoice Status"
                name="invoiceStatus"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: "In-transit", value: "In-transit" },
                    { label: "Out-for-delivery", value: "Out-for-delivery" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Upload Invoice"
            name="invoiceFile"
            rules={[{ required: true }]}
          >
            <Upload beforeUpload={() => false}>
              <Button className="border-amber-400! text-amber-700! hover:bg-amber-100!" icon={<UploadOutlined />}>
                Upload Invoice
              </Button>
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button className="border-amber-400! text-amber-700! hover:bg-amber-100!" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button   className="bg-amber-500! hover:bg-amber-600! border-none!"
            type="primary" onClick={handleApproveInvoice}>
              Save & Send to Customer
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
