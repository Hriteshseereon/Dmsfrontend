import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Popconfirm,
  Select,
  Form,
  message,
  Input, // ✅ added
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  getHSNSACCodes,
  getSACCodes,
  getproductGroupHSNList,
  deleteProductGroup,
} from "../../../../../../../api/product";

import {
  getProductGroups,
  addProductgroupToHSN,
} from "../../../../../../../api/product";

/* ================= ADD MODAL ================= */
const AddTaxModal = ({ open, type, productGroups, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const selectedGroup = productGroups.find(
        (p) => p.id === values.productGroup,
      );

      const payload = {
        name: selectedGroup?.name,
        hsn_code: type === "hsn" ? values.code : null,
        sac_code: type === "sac" ? values.code : null,
      };

      await addProductgroupToHSN(payload, values.productGroup);

      message.success(`${type.toUpperCase()} added successfully`);

      onSuccess({
        key: `${values.productGroup}-${values.code}`,
        productGroupId: values.productGroup,
        productGroupName: selectedGroup?.name,
        code: values.code,
        description: "",
      });

      form.resetFields();
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to add");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <span className="text-lg font-bold text-amber-800">
          Add {type.toUpperCase()}
        </span>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Add"
      okButtonProps={{
        className: "!bg-amber-500 !hover:bg-amber-600 !text-white !border-none",
      }}
      confirmLoading={loading}
      centered
    >
      <Form form={form} layout="vertical" className="pt-4">
        {/* Product Group */}
        <Form.Item
          name="productGroup"
          label={
            <span className="text-amber-700 font-semibold">Product Group</span>
          }
          rules={[{ required: true }]}
        >
          <Select placeholder="Select Product Group" className="rounded">
            {productGroups.map((pg) => (
              <Select.Option key={pg.id} value={pg.id}>
                {pg.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* ✅ MANUAL CODE INPUT */}
        <Form.Item
          name="code"
          label={
            <span className="text-amber-700 font-semibold">
              {type.toUpperCase()} Code
            </span>
          }
          rules={[
            { required: true, message: "Code is required" },
            {
              pattern: type === "hsn" ? /^[0-9]{4,8}$/ : /^[0-9]{6}$/,
              message:
                type === "hsn"
                  ? "HSN must be 4 to 8 digits"
                  : "SAC must be 6 digits",
            },
          ]}
        >
          <Input
            placeholder={`Enter ${type.toUpperCase()} Code`}
            maxLength={type === "hsn" ? 8 : 6}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* ================= MAIN COMPONENT ================= */
const HsnSacManager = () => {
  const [hsnList, setHsnList] = useState([]);
  const [sacList, setSacList] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [hsnData, sacData, groupData, mappedData] = await Promise.all([
        getHSNSACCodes(),
        getSACCodes(),
        getProductGroups(),
        getproductGroupHSNList(),
      ]);

      const normalizedHsn = (hsnData || []).map((i) => ({
        id: i.id,
        code: i.hsn_code,
        description: i.description,
      }));

      const normalizedSac = (sacData || []).map((i) => ({
        id: i.id,
        code: i.sac_code,
        description: i.description,
      }));

      setProductGroups(groupData || []);

      const hsnMapped = (mappedData || [])
        .filter((item) => item.hsn_code)
        .map((item) => ({
          key: `${item.id}-${item.hsn_code}`,
          productGroupId: item.id,
          productGroupName: item.name,
          code: item.hsn_code_value || item.hsn_code,
          description: "",
        }));

      const sacMapped = (mappedData || [])
        .filter((item) => item.sac_code)
        .map((item) => ({
          key: `${item.id}-${item.sac_code}`,
          productGroupId: item.id,
          productGroupName: item.name,
          code: item.sac_code_value || item.sac_code,
          description: "",
        }));

      setHsnList(hsnMapped);
      setSacList(sacMapped);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (type, record) => {
    try {
      await deleteProductGroup(record.productGroupId);

      message.success("Deleted successfully");

      if (type === "hsn") {
        setHsnList((prev) => prev.filter((item) => item.key !== record.key));
      } else {
        setSacList((prev) => prev.filter((item) => item.key !== record.key));
      }
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    }
  };

  const columns = (type) => [
    {
      title: <span className="text-amber-600">Product Group</span>,
      dataIndex: "productGroupName",
      render: (text) => (
        <span className="text-amber-700 font-semibold">{text}</span>
      ),
    },
    {
      title: <span className="text-amber-600">Code</span>,
      dataIndex: "code",
      render: (text) => <span className="text-amber-700">{text}</span>,
    },
    {
      title: <span className="text-amber-600">Action</span>,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete?"
          onConfirm={() => handleDelete(type, record)} // ✅ FIXED
        >
          <DeleteOutlined className="text-red-500 cursor-pointer" />
        </Popconfirm>
      ),
    },
  ];

  const addItem = (type, item) => {
    const setter = type === "hsn" ? setHsnList : setSacList;

    setter((prev) => {
      const exists = prev.some(
        (p) => p.productGroupId === item.productGroupId && p.code === item.code,
      );
      if (exists) return prev;
      return [...prev, item];
    });
  };

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold text-amber-700 mb-2">
        Easily manage your HSN and SAC code masters
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HSN */}
        <Card
          title={<span className="text-amber-700">HSN Codes</span>}
          extra={
            <Button
              icon={<PlusOutlined />}
              className="bg-amber-500 hover:bg-amber-600 border-none text-white"
              onClick={() => setModalType("hsn")}
            >
              Add HSN
            </Button>
          }
        >
          <Table
            rowKey="key"
            columns={columns("hsn")}
            dataSource={hsnList}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>

        {/* SAC */}
        <Card
          title={<span className="text-amber-700">SAC Codes</span>}
          extra={
            <Button
              icon={<PlusOutlined />}
              className="bg-amber-500 hover:bg-amber-600 border-none text-white"
              onClick={() => setModalType("sac")}
            >
              Add SAC
            </Button>
          }
        >
          <Table
            rowKey="key"
            columns={columns("sac")}
            dataSource={sacList}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      </div>

      {modalType && (
        <AddTaxModal
          open={!!modalType}
          type={modalType}
          productGroups={productGroups}
          onClose={() => setModalType(null)}
          onSuccess={(item) => addItem(modalType, item)}
        />
      )}
    </div>
  );
};

export default HsnSacManager;
