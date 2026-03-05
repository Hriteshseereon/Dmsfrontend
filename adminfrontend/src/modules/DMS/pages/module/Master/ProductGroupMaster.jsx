import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, message } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  addProductGroup,
  getProductGroups,
  getProductGroupById,
  updateProductGroupById,
} from "../../../../../api/product";

export default function ProductGroupMaster() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [data, setData] = useState([]);

  // mapper function
  const openProductGroup = async (record, mode) => {
    try {
      setLoading(true);

      const data = await getProductGroupById(record.key);

      const formatted = {
        key: data.id,
        productGroupName: data.name,
        raw: data,
      };

      setSelectedRecord(formatted);

      if (mode === "view") {
        viewForm.setFieldsValue({
          productGroupName: data.name,
        });
        setIsViewModalOpen(true);
      }

      if (mode === "edit") {
        form.setFieldsValue({
          productGroupName: data.name,
        });
        setIsEditModalOpen(true);
      }
    } catch (error) {
      message.error("Failed to load product group details");
    } finally {
      setLoading(false);
    }
  };
  //  /* ---------------- FETCH PRODUCT GROUPS ---------------- */
  const fetchProductGroups = async () => {
    try {
      setLoading(true);
      const res = await getProductGroups();

      // adapt API response to table format
      const formatted = res.map((item, index) => ({
        key: item.id || index + 1,
        productGroupName: item.name,
        raw: item,
      }));

      setData(formatted);
    } catch (err) {
      message.error("Failed to load product groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductGroups();
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredData = data.filter((item) =>
    item.productGroupName.toLowerCase().includes(searchText.toLowerCase()),
  );

  /* ---------------- DELETE (LOCAL ONLY) ---------------- */
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Product Group",
      content: `Are you sure you want to delete "${record.productGroupName}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        // TODO: integrate delete API here when backend is ready
        setData((prev) => prev.filter((i) => i.key !== record.key));
        message.success("Product group deleted");
      },
    });
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">Product Group Name</span>
      ),
      dataIndex: "productGroupName",
      width: 900,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 140,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-red-500! hover:text-red-600!"
            onClick={() => openProductGroup(record, "view")}
          />
          <EditOutlined
            className="cursor-pointer! text-blue-500! hover:text-blue-600!"
            onClick={() => openProductGroup(record, "edit")}
          />
          {/* <DeleteOutlined
            className="cursor-pointer text-gray-600 hover:text-red-600"
            onClick={() => handleDelete(record)}
          /> */}
        </div>
      ),
    },
  ];

  /* ---------------- ADD / EDIT SUBMIT ---------------- */
  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        name: values.productGroupName,
      };

      if (isEditModalOpen && selectedRecord) {
        await updateProductGroupById(payload, selectedRecord.key);
        message.success("Product group updated successfully");
      } else {
        await addProductGroup(payload);
        message.success("Product group added successfully");
      }

      fetchProductGroups(); // always refresh

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error("Operation failed");
    }
  };

  const renderFormFields = (disabled = false) => (
    <Form.Item
      label={
        <span className="text-amber-700 font-semibold">Product Group Name</span>
      }
      name="productGroupName"
      rules={[{ required: true, message: "Please enter product group name" }]}
    >
      <Input
        placeholder="Enter Product Group Name"
        disabled={disabled}
        className={`border-amber-400 focus:border-amber-600 focus:ring-amber-600 placeholder:text-amber-400 ${
          disabled ? "bg-amber-50 text-amber-700" : "text-amber-800"
        }`}
      />
    </Form.Item>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search..."
            className="w-64! border-amber-400! focus:border-amber-600! text-amber-700! placeholder:text-amber-400!"
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
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsAddModalOpen(true);
            }}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
          >
            Add New
          </Button>
        </div>
      </div>

      <div className=" border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Product Group Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your product group data</p>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          rowClassName="hover:bg-amber-50"
          loading={loading}
        />
      </div>

      <Modal
        title={
          <span className="text-amber-700 font-semibold text-lg">
            {isEditModalOpen ? "Edit Product Group" : "Add New Product Group"}
          </span>
        }
        open={isAddModalOpen || isEditModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
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

      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            View Product Group
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true)}
        </Form>
      </Modal>
    </div>
  );
}
