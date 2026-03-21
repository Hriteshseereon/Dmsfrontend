import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, message } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  getUnits,
  addUnit,
  updateUnitById,
} from "../../../../../../../api/product";

export default function UnitMaster() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();

  /* ---------------- FETCH UNITS ---------------- */

  const fetchUnits = async () => {
    try {
      setLoading(true);

      const res = await getUnits();

      const formatted = res.map((item, index) => ({
        key: item.id || index + 1,
        unitName: item.name,
        raw: item,
      }));

      setData(formatted);
    } catch (err) {
      message.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */

  const filteredData = data.filter((item) =>
    item.unitName.toLowerCase().includes(searchText.toLowerCase()),
  );

  /* ---------------- OPEN VIEW / EDIT ---------------- */

  const openUnit = (record, mode) => {
    setSelectedRecord(record);

    if (mode === "view") {
      viewForm.setFieldsValue({
        unitName: record.unitName,
      });
      setIsViewModalOpen(true);
    }

    if (mode === "edit") {
      form.setFieldsValue({
        unitName: record.unitName,
      });
      setIsEditModalOpen(true);
    }
  };

  /* ---------------- FORM SUBMIT ---------------- */

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        name: values.unitName,
      };

      if (isEditModalOpen && selectedRecord) {
        await updateUnitById(payload, selectedRecord.key);
        message.success("Unit updated successfully");
      } else {
        await addUnit(payload);
        message.success("Unit added successfully");
      }

      fetchUnits();

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);

      form.resetFields();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Unit Name</span>,
      dataIndex: "unitName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer text-red-500! hover:text-red-600!"
            onClick={() => openUnit(record, "view")}
          />

          <EditOutlined
            className="cursor-pointer text-blue-500! hover:text-blue-600!"
            onClick={() => openUnit(record, "edit")}
          />
        </div>
      ),
    },
  ];

  /* ---------------- FORM FIELD ---------------- */

  const renderFormFields = (disabled = false) => (
    <Form.Item
      label={<span className="text-amber-700 font-semibold">Unit Name</span>}
      name="unitName"
      rules={[{ required: true, message: "Please enter unit name" }]}
    >
      <Input
        placeholder="Enter Unit Name"
        disabled={disabled}
        className={`border-amber-400 focus:border-amber-600 placeholder:text-amber-400 ${
          disabled ? "bg-amber-50 text-amber-700" : "text-amber-800"
        }`}
      />
    </Form.Item>
  );

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}

      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search..."
            className="w-64 border-amber-400 text-amber-700 placeholder:text-amber-400"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsAddModalOpen(true);
          }}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add Unit
        </Button>
      </div>

      {/* ---------------- TABLE ---------------- */}

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Unit Records
        </h2>

        <p className="text-amber-600 mb-3">Manage your unit data</p>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={false}
          rowClassName="hover:bg-amber-50"
        />
      </div>

      {/* ---------------- ADD / EDIT MODAL ---------------- */}

      <Modal
        title={
          <span className="text-amber-700 font-semibold text-lg">
            {isEditModalOpen ? "Edit Unit" : "Add Unit"}
          </span>
        }
        open={isAddModalOpen || isEditModalOpen}
        footer={null}
        width={500}
        onCancel={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          form.resetFields();
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
          {renderFormFields(false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                form.resetFields();
              }}
              className="border-amber-500! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-600! hover:bg-amber-700! border-none! text-white!"
            >
              {isEditModalOpen ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------------- VIEW MODAL ---------------- */}

      <Modal
        title={<span className="text-amber-700 font-semibold">View Unit</span>}
        open={isViewModalOpen}
        footer={null}
        width={500}
        onCancel={() => setIsViewModalOpen(false)}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true)}
        </Form>
      </Modal>
    </div>
  );
}
