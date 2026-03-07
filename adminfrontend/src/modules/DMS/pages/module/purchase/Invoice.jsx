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
  PlusOutlined
} from "@ant-design/icons";

const { Option } = Select;

const PurchaseIndent = () => {

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [file, setFile] = useState(null);

  const [editRecord, setEditRecord] = useState(null);

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

  // VIEW FILE
  const openFilePreview = (file) => {

    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");

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
        render: (text) => <span className="text-amber-800 ">{text}</span>,
 
    },
    {
      title: <span className="text-amber-700 font-semibold">Vendor</span>,
      dataIndex: "vendor",
      render: (text) => <span className="text-amber-800 ">{text}</span>
    },
    {
      title: <span className="text-amber-700 font-semibold">File</span>,
      render: (_, record) =>
        record.file ? record.file.name : "-"
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 15 }}>

          <EyeOutlined
            style={{ color: "#1677ff", cursor: "pointer" }}
            onClick={() => openFilePreview(record.file)}
          />

          <EditOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => openEditModal(record)}
          />

        </div>
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
        title={editRecord ? "Edit Invoice" : "Add Invoice"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >

        {/* Vendor */}

        <div style={{ marginBottom: 15 }}>

          <label>Vendor</label>

          <Select
            value={vendor}
            style={{ width: "100%" }}
            onChange={(val) => setVendor(val)}
            placeholder="Select Vendor"
          >

            <Option value="vendor1">
              Vendor 1
            </Option>

            <Option value="vendor2">
              Vendor 2
            </Option>

            <Option value="vendor3">
              Vendor 3
            </Option>

          </Select>

        </div>

        {/* Upload */}

        <div>

          <label>Upload File</label>

          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            showUploadList
          >

            <Button icon={<UploadOutlined />}>
              Upload File
            </Button>

          </Upload>

        </div>

      </Modal>

    </div>
  );
};

export default PurchaseIndent;