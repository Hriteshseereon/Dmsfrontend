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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  getHSNSACCodes,
  getSACCodes,
  getproductGroupHSNList,
} from "../../../../../../../api/product";

import {
  getProductGroups,
  addProductgroupToHSN,
} from "../../../../../../../api/product";

/* ================= ADD MODAL ================= */
const AddTaxModal = ({
  open,
  type,
  productGroups,
  codes,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const selectedGroup = productGroups.find(
        (p) => p.id === values.productGroup,
      );

      const selectedCode = codes.find((c) => c.id === values.code);

      const payload = {
        name: selectedGroup?.name,
        hsn_code: type === "hsn" ? selectedCode?.id : null,
        sac_code: type === "sac" ? selectedCode?.id : null,
      };

      await addProductgroupToHSN(payload, values.productGroup);

      message.success(`${type.toUpperCase()} added successfully`);

      onSuccess({
        key: `${values.productGroup}-${values.code}`,
        productGroupId: values.productGroup,
        productGroupName: selectedGroup?.name,
        code: selectedCode?.code,
        description: selectedCode?.description,
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

        {/* Code */}
        <Form.Item
          name="code"
          label={
            <span className="text-amber-700 font-semibold">
              {type.toUpperCase()} Code
            </span>
          }
          rules={[{ required: true }]}
        >
          <Select
            placeholder={`Select ${type.toUpperCase()} Code`}
            showSearch
            optionFilterProp="children"
          >
            {codes.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.code} - {c.description}
              </Select.Option>
            ))}
          </Select>
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

  /* ===== Fetch Data ===== */
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [hsnData, sacData, groupData, mappedData] = await Promise.all([
        getHSNSACCodes(),
        getSACCodes(),
        getProductGroups(),
        getproductGroupHSNList(), // ✅ NEW
      ]);

      /* ===== Normalize master codes ===== */
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

      setAvailableHsn(normalizedHsn);
      setAvailableSac(normalizedSac);
      setProductGroups(groupData || []);

      /* ===== ✅ MAP EXISTING DATA ===== */

      const hsnMapped = (mappedData || [])
        .filter((item) => item.hsn_code) // only mapped
        .map((item) => {
          const matched = normalizedHsn.find((h) => h.id === item.hsn_code);

          return {
            key: `${item.id}-${item.hsn_code}`,
            productGroupId: item.id,
            productGroupName: item.name,
            code: matched?.code || item.hsn_code_value, // fallback
            description: matched?.description || "",
          };
        });

      const sacMapped = (mappedData || [])
        .filter((item) => item.sac_code)
        .map((item) => {
          const matched = normalizedSac.find((s) => s.id === item.sac_code);

          return {
            key: `${item.id}-${item.sac_code}`,
            productGroupId: item.id,
            productGroupName: item.name,
            code: matched?.code || "",
            description: matched?.description || "",
          };
        });

      setHsnList(hsnMapped);
      setSacList(sacMapped);
    } catch (err) {
      console.error(err);
    }
  };

  const [availableHsn, setAvailableHsn] = useState([]);
  const [availableSac, setAvailableSac] = useState([]);

  /* ===== Table Columns ===== */
  const columns = (onDelete) => [
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
      title: <span className="text-amber-600">Description</span>,
      dataIndex: "description",
      render: (text) => <span className="text-amber-700">{text}</span>,
    },
    {
      title: <span className="text-amber-600">Action</span>,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete?"
          onConfirm={() => onDelete(record.key)}
        >
          <DeleteOutlined className="text-red-500 cursor-pointer" />
        </Popconfirm>
      ),
    },
  ];

  /* ===== Add Row ===== */
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

  /* ===== Render ===== */
  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold text-amber-700 mb-2">
        Easily manage your HSN and SAC code masters
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HSN CARD */}
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
            columns={columns((key) =>
              setHsnList((prev) => prev.filter((i) => i.key !== key)),
            )}
            dataSource={hsnList}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>

        {/* SAC CARD */}
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
            columns={columns((key) =>
              setSacList((prev) => prev.filter((i) => i.key !== key)),
            )}
            dataSource={sacList}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      </div>

      {/* MODAL */}
      {modalType && (
        <AddTaxModal
          open={!!modalType}
          type={modalType}
          productGroups={productGroups}
          codes={modalType === "hsn" ? availableHsn : availableSac}
          onClose={() => setModalType(null)}
          onSuccess={(item) => addItem(modalType, item)}
        />
      )}
    </div>
  );
};

export default HsnSacManager;
