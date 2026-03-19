// DeliveryStatus.jsx
import React, { useState ,useEffect} from "react";
import { Table, Input, Button, Modal, Form, Row, Col } from "antd";
import { SearchOutlined, DownloadOutlined, EyeOutlined, FilterOutlined ,
  PrinterOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../api/axios";
import { getAllDeliveryStatus,getDeliveryStatusByOrderNo ,downloadInvoice,getInvoicePrintUrl} from "../api/deliveryStatus";
import { exportToExcel } from "../utils/exportToExcel";
export default function DeliveryStatus() {
  const [data,setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewForm] = Form.useForm();


useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const res = await getAllDeliveryStatus();

   const formattedData = res.flatMap((invoice) =>
  invoice.items.map((item) => ({
    key: item.id,
    sale_invoice_id: invoice.sale_invoice_id,

    order_no: invoice.order_no,
    invoice_date: invoice.invoice_date,

    item_name: item.item_name,
    quantity: item.quantity,
    uom: item.uom,
    total_amount: item.total_amount,
    company: item.company,

    deliveryDate: item.delivery_date,
    dispatchDate: item.dispatch_date,
    deliveredDate: item.delivered_date,

    vehicleNo: item.vehicle_no,
    driverName: item.driver_name,
    contactNo: item.phone_no,
    route: item.route,
    transporter: item.transporter,

    status: item.status || invoice.current_delivery_status,
  }))
);
    setData(formattedData);
  } catch (error) {
    console.error("Error fetching delivery status:", error);
  }
};

const handleSearch = (value) => {
  setSearchText(value);

  if (!value) {
    fetchData();
    return;
  }

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
  );

  setData(filtered);
};
  
  const handleView = async (record) => {
  try {
    // 🔥 Call API
    const res = await getDeliveryStatusByOrderNo({
      sale_invoice_id: record.sale_invoice_id,
    });

    // 🔥 Prepare data (take first item or handle multiple later)
    const item = res.items?.[0];

    const fullData = {
      order_no: res.order_no,
      invoice_date: res.invoice_date,

      item_name: item?.item_name,
      quantity: item?.quantity,
      uom: item?.uom,
      total_amount: item?.total_amount,
      company: item?.company,

      deliveryDate: item?.delivery_date,
      dispatchDate: item?.dispatch_date,
      deliveredDate: item?.delivered_date,

      vehicleNo: item?.vehicle_no,
      driverName: item?.driver_name,
      contactNo: item?.phone_no,
      route: item?.route,
      transporter: item?.transporter,
      status: item?.status || res.current_delivery_status,
    };

    // 🔥 Set state
    setSelectedRecord(fullData);

    // 🔥 Set form values
    viewForm.setFieldsValue({
      ...fullData,
      dispatchDate: fullData.dispatchDate ? dayjs(fullData.dispatchDate) : null,
      deliveryDate: fullData.deliveryDate ? dayjs(fullData.deliveryDate) : null,
      deliveredDate: fullData.deliveredDate ? dayjs(fullData.deliveredDate) : null,
    });

    // 🔥 Open modal
    setIsViewModalOpen(true);

  } catch (error) {
    console.error("Error fetching delivery details:", error);
  }
};
// ✅ Download handler
const handleDownload = async (record) => {
  try {
    const blob = await downloadInvoice({
      sale_invoice_id: record.sale_invoice_id,
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${record.order_no}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
  }
};

const handlePrint = async (record) => {
  try {
    const blob = await downloadInvoice({
      sale_invoice_id: record.sale_invoice_id,
    });

    const blobUrl = window.URL.createObjectURL(blob);

    const printWindow = window.open(blobUrl);

    if (!printWindow) {
      alert("Popup blocked! Please allow popups.");
      return;
    }

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (error) {
    console.error("Print error:", error);
  }
};


const handleExport = () => {
  const exportData = data.map((item) => ({
    Order_No: item.order_no,
    Invoice_Date: item.invoice_date,

    Item_Name: item.item_name,
    Quantity: item.quantity,
    UOM: item.uom,
    Total_Amount: item.total_amount,
    Company: item.company,
    Delivered_Date: item.deliveredDate,
    Vehicle_No: item.vehicleNo,
    Driver_Name: item.driverName,
    Phone_No: item.contactNo,
    Route: item.route,
    Transporter: item.transporter,
    Status: item.status,
  }));

  exportToExcel(exportData, "Delivery_Status");
};
  const columns = [
    { title: <span className="text-amber-700 font-semibold">Order No</span>, dataIndex: "order_no", width: 100, render: (text) => <span className="text-amber-800">{text}</span> },
    { title: <span className="text-amber-700 font-semibold">Company Name</span>, dataIndex: "company", width: 100, render: (text) => <span className="text-amber-800">{text}</span> },
    
    { title: <span className="text-amber-700 font-semibold">Item</span>, dataIndex: "item_name", width: 100, render: (text) => <span className="text-amber-800">{text || "—"}</span> },

    {
      title: (
        <span className="text-amber-700 font-semibold">Quantity</span>
      ),
      width: 100,
      render: (_, record) => (
        <span className="text-amber-800">
          {record.quantity} {record.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "total_amount",
      width: 100,
      render: (t) => <span className="text-amber-800">₹{t}</span>,
    }, {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 150,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        switch (status) {
          case "Delivered": return <span className={`${base} bg-green-100 text-green-700`}>{status}</span>;
          case "In-Transit": return <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>;
          case "Pending": return <span className={`${base} bg-amber-100 text-amber-700`}>{status}</span>;
          case "Out for Delivery": return <span className={`${base} bg-blue-100 text-blue-700`}>{status}</span>;
          default: return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
        }
      },
    },
   {
  title: <span className="text-amber-700 font-semibold">Actions</span>,
  width: 120,
  render: (record) => (
    <div className="flex gap-3">
      
      {/* View */}
      <EyeOutlined
        className="cursor-pointer! text-blue-500!"
        onClick={() => handleView(record)}
      />

      {/* Download */}
      <DownloadOutlined
        className="cursor-pointer! text-green-600!"
        onClick={() => handleDownload(record)}
      />

      {/* Print */}
      <PrinterOutlined
        className="cursor-pointer! text-purple-600!"
        onClick={() => handlePrint(record)}
      />

    </div>
  ),
}
  ];
  const renderViewFields = () => (
    <div>
      {/* 🔹 Order Details Section */}
      <h6 className=" text-amber-500 ">Order Details</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Order No">
            <Input value={selectedRecord?.order_no} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Item Name">
            <Input value={selectedRecord?.item_name} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Quantity">
            <Input value={selectedRecord?.quantity} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="UOM">
            <Input value={selectedRecord?.uom} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Total Amount">
            <Input
              value={`₹${selectedRecord?.total_amount?.toLocaleString()}`}
              disabled
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Company">
            <Input value={selectedRecord?.company} disabled />
          </Form.Item>
        </Col>
      
        <Col span={6}>
          <Form.Item label="Delivery Date">
            <Input value={selectedRecord?.deliveryDate} disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* 🔹 Transport Details Section */}
      <h6 className=" text-amber-500 ">Transport Details</h6>
      <Row gutter={16}>
       
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
          <Form.Item label="Phone No">
            <Input value={selectedRecord?.contactNo} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Route">
            <Input value={selectedRecord?.route || "—"} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Transporter">
            <Input value={selectedRecord?.transporter} disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Status">
            <Input value={selectedRecord?.status} disabled />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );


  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Delivery Status</h1>
          <p className="text-amber-600">Track your sales delivery progress</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => handleSearch(searchText)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
              onClick={handleExport} 
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table
          columns={columns}
          dataSource={data}
          pagination={10}
          scroll={{ y: 350 }}
        />
      </div>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700  text-2xl font-semibold">View Delivery Details</span>}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={900}
      >
        <Form layout="vertical" form={viewForm}>
          {renderViewFields()}
        </Form>
      </Modal>
    </div>
  );
}
