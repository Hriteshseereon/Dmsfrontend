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

const { Option } = Select;

const PurchaseIndent = () => {

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [file, setFile] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [viewModal, setViewModal] = useState(false);
const [viewRecord, setViewRecord] = useState(null);
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Generate Invoice Number
  const generateInvoiceNo = () => {
    const nextNumber = data.length + 1;
    return `INV-${String(nextNumber).padStart(4, "0")}`;
  };

  // ADD
  const openAddModal = () => {
    setVendor("");
    setFile(null);
    setEditRecord(null);
    setModalOpen(true);
  };

  // EDIT
  const openEditModal = (record) => {
    setVendor(record.vendor);
    setFile(record.file);
    setEditRecord(record);
    setModalOpen(true);
  };
const openViewModal = (record) => {
  setViewRecord(record);
  setViewModal(true);
};
const openDocument = (file) => {
  if (!file) return;

  const fileURL = URL.createObjectURL(file);
  window.open(fileURL, "_blank");
};

const handlePrint = (record) => {
  if (!record.file) {
    alert("No file uploaded");
    return;
  }

  const fileURL = URL.createObjectURL(record.file);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = fileURL;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
};
  // SAVE
  const handleSubmit = () => {

    if (editRecord) {

      const updated = data.map((item) =>
        item.key === editRecord.key
          ? { ...item, vendor, file }
          : item
      );

      setData(updated);

    } else {

      const invoiceNo = generateInvoiceNo();

      setData([
        ...data,
        {
          key: Date.now(),
          invoiceNo,
          vendor,
          file
        }
      ]);
    }

    setModalOpen(false);
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
    render: (text) => <span className="text-amber-800">{text}</span>
  },
  {
    title: <span className="text-amber-700 font-semibold">File</span>,
    render: (_, record) => (
      <span className="text-amber-800">
        {record.file ? record.file.name : "-"}
      </span>
    )
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
  title= {<span className="text-amber-600!"> {editRecord ? "Edit Invoice" : "Add Invoice"} </span>}
  open={modalOpen}
  onCancel={() => setModalOpen(false)}
  onOk={handleSubmit}
  okType="default"
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

            <Option value="vendor1">
              Supplier 1
            </Option>

            <Option value="vendor2">
              Supplier 2
            </Option>

            <Option value="vendor3">
              Supplier 3
            </Option>

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
            showUploadList
             disabled={editRecord ? true : false}
             className="ml-2!"
          >

            <Button  icon={<UploadOutlined />}>
              Upload File
            </Button>

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
        {viewRecord.file.name}
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