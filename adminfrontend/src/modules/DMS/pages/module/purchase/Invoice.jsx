import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Select,
  Upload,
  Input,
  Row,
  Col
} from "antd";

import {
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PlusOutlined,PrinterOutlined
} from "@ant-design/icons";
import { addInvoice ,getAllInvoice,getInvoiceById,getAllVendor,updateInvoice} from "../../../../../api/purchase";
const { Option } = Select;

const PurchaseIndent = () => {

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [file, setFile] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [viewModal, setViewModal] = useState(false);
const [viewRecord, setViewRecord] = useState(null);
 useEffect(() => {
  fetchInvoices();
   fetchVendors();
}, []);
const fetchVendors = async () => {
  try {
    const res = await getAllVendor();

    setVendors(res); // store full vendor list

  } catch (error) {
    console.error("Error fetching vendors", error);
  }
};
const fetchInvoices = async () => {
  try {
    const res = await getAllInvoice();

    const formatted = res.map((item) => ({
      key: item.id,
      invoiceNo: item.invoice_number,
      vendor: item.vendor,
     file: item.document_url
    }));

    setData(formatted);
    setFilteredData(formatted);
  } catch (error) {
    console.error("Error fetching invoices", error);
  }
};
const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("vendor", vendor);
   formData.append("document", file);
    await addInvoice(formData);

    fetchInvoices(); // reload table

    setModalOpen(false);
    setVendor("");
    setFile(null);

  } catch (error) {
    console.error("Error adding invoice", error);
  }
};
const handleUpdate = async () => {
  try {
    const formData = new FormData();

    formData.append("vendor", vendor);

    if (file) {
      formData.append("document", file);
    }

    await updateInvoice(editRecord.key, formData);

    fetchInvoices(); // reload table

    setModalOpen(false);
    setVendor("");
    setFile(null);
    setEditRecord(null);

  } catch (error) {
    console.error("Error updating invoice", error);
  }
};

const openViewModal = async (record) => {
  try {
    const res = await getInvoiceById(record.key);

    const vendorName =
      vendors.find((v) => v.id === res.vendor)?.name || res.vendor;

    setViewRecord({
      vendor: vendorName,
      file: res.document_url
    });

    setViewModal(true);

  } catch (error) {
    console.error("Error fetching invoice", error);
  }
};
2
  // ADD
  const openAddModal = () => {
    setVendor("");
    setFile(null);
    setEditRecord(null);
    setModalOpen(true);
  };
const openDocument = (file) => {
  if (!file) return;
  window.open(file, "_blank");
};
const handlePrint = async (record) => {
  if (!record.file) {
    alert("No file uploaded for this invoice");
    return;
  }

  try {
    const response = await fetch(record.file, { mode: "cors" }); // make sure CORS is enabled
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url);
    if (!printWindow) throw new Error("Popup blocked");

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } catch (err) {
    console.error("Failed to print invoice:", err);
    alert("Failed to print invoice. Try opening in a new tab.");
  }
};
const openEditModal = async (record) => {
  try {
    const res = await getInvoiceById(record.key);

    setVendor(res.vendor);

    setFile({
      url: res.document_url,
      name: res.document_url.split("/").pop()
    });

    setEditRecord(record);

    setModalOpen(true);

  } catch (error) {
    console.error("Error fetching invoice", error);
  }
};

  // SEARCH
  const handleSearch = (value) => {

    const filtered = data.filter((item) =>
      item.vendor.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);

  };

  const handleReset = () => {
    setFilteredData(data);
  };

 const columns = [
  {
    title: <span className="text-amber-700 font-semibold">Invoice No</span>,
    dataIndex: "invoiceNo",
    render: (text) => <span className="text-amber-800">{text}</span>
  },
 {
  title: <span className="text-amber-700 font-semibold">Supplier</span>,
  dataIndex: "vendor",
  render: (vendorId) => {
    const vendorName = vendors.find(v => v.id === vendorId)?.name;
    return <span className="text-amber-800">{vendorName || "-"}</span>;
  }
},
  {
  title: <span className="text-amber-700 font-semibold">Document</span>,
  render: (_, record) => {
    if (!record.file) return "-";

    const fileName = record.file.split("/").pop(); // extract name

    return (
      <span
        className="text-blue-600 cursor-pointer hover:underline"
        onClick={() => openDocument(record.file)}
      >
        {fileName}
      </span>
    );
  }
},
  {
    title: <span className="text-amber-700 font-semibold">Actions</span>,
    render: (_, record) => (
      <div style={{ display: "flex", gap: 15 }}>

        <EyeOutlined
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => openViewModal(record)}
        />

        <EditOutlined
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => openEditModal(record)}
        />

      </div>
    )
  },
  {
    title: <span className="text-amber-700 font-semibold">Print</span>,
    render: (_, record) => (
      <Button
        type="primary"
        icon={<PrinterOutlined />}
        className="bg-amber-500! hover:bg-amber-600! border-none!"
        onClick={() => handlePrint(record)}
      >
        Print
      </Button>
    )
  }
];

  return (

    <div >

      {/* HEADER */}

      <Row justify="space-between" style={{ marginBottom: 16}}>

        <Col>

          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-amber-600!" />}
            style={{ width: 220, marginRight: 10 }}
             className="w-64! border-amber-300! focus:border-amber-500!"
         
            onChange={(e) =>
              handleSearch(e.target.value)
            }
          />

          <Button icon={<FilterOutlined />}   className="border-amber-400! text-amber-700! hover:bg-amber-100!"
    onClick={handleReset}>
            Reset
          </Button>

        </Col>

        <Col>

          <Button   icon={<DownloadOutlined /> }
           style={{ marginRight: 10 }}   className="border-amber-400! text-amber-700! hover:bg-amber-100!"
      >
            Export
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={openAddModal}
          >
            Add New
          </Button>

        </Col>

      </Row>

      {/* TABLE */}
  <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Purchase Invoice Records</h2>
        <p className="text-amber-600 mb-3">Manage your purchase invoice data</p>
  
      <Table
        columns={columns}
        dataSource={filteredData}
      />
</div>
      {/* MODAL */}

     <Modal
  title={
    <span className="text-amber-600!">
      {editRecord ? "Edit Invoice" : "Add Invoice"}
    </span>
  }
  open={modalOpen}
  onCancel={() => setModalOpen(false)}
  onOk={editRecord ? handleUpdate : handleSubmit}
  okText={editRecord ? "Update" : "Save"}
  okButtonProps={{
    className: "bg-amber-500! hover:bg-amber-600! text-white! border-none"
  }}
  cancelButtonProps={{
    className: "border border-amber-400! text-amber-700! hover:bg-amber-100!"
  }}
>

        {/* Vendor */}

        <div style={{ marginBottom: 10 }}>

          <label className="text-amber-600! " >Supplier</label>

        <Select
  value={vendor}
  style={{ width: "100%", marginTop: 8 }}
  onChange={(val) => setVendor(val)}
  placeholder="Select Supplier"
  disabled={editRecord ? true : false}
>
  {vendors.map((v) => (
    <Option key={v.id} value={v.id}>
      {v.name}
    </Option>
  ))}
</Select>

        </div>

        {/* Upload */}

        <div>

          <label className="text-amber-600! " >Upload File</label>

        <Upload
  beforeUpload={(file) => {
    setFile(file);
    return false;
  }}
  fileList={
    file
      ? [
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url: file.url
          }
        ]
      : []
  }
>
  <Button icon={<UploadOutlined />}>Upload File</Button>
</Upload>

        </div>

      </Modal>
<Modal
  title={<span className="text-amber-600  text-lg">View Invoice</span>}
  open={viewModal}
  footer={null}
  onCancel={() => setViewModal(false)}
>
  <div className="mb-4">
    <label className="text-amber-600 ">Supplier</label>
    <Input value={viewRecord?.vendor} readOnly className="mt-2!" />
  </div>

  <div>
    <label className="text-amber-600 ">Uploaded Document</label>

  {viewRecord?.file ? (
  <p
    className="text-blue-600 cursor-pointer mt-1 hover:underline"
    onClick={() => openDocument(viewRecord.file)}
  >
    {viewRecord.file.split("/").pop()}
  </p>
) : (
  <p className="text-gray-500 mt-1">No File Uploaded</p>
)}
  </div>
</Modal>

    </div>
  );
};

export default PurchaseIndent;