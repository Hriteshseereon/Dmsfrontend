import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Select, Form, message, Input } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

import {
  getHSNSACCodes,
  getSACCodes,
  getproductGroupHSNList,
  updateProductGroupById,
} from "../../../../../../../api/product";

import {
  getProductGroups,
  addProductgroupToHSN,
} from "../../../../../../../api/product";

/* ================= MODAL ================= */
const AddTaxModal = ({
  open,
  type,
  productGroups,
  onClose,
  onSuccess,
  initialValues,
  isEdit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        productGroup: initialValues.productGroupId,
        code: initialValues.code,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues]);

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

      if (isEdit) {
        // ✅ USE KEY (LIKE WORKING COMPONENT)
        await updateProductGroupById(payload, initialValues.key);
        message.success("Updated successfully");
      } else {
        await addProductgroupToHSN(payload, values.productGroup);
        message.success(`${type.toUpperCase()} added successfully`);
      }

      onSuccess();
      onClose();
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <span className="text-lg font-bold text-amber-800">
          {isEdit ? "Edit" : "Add"} {type.toUpperCase()}
        </span>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEdit ? "Update" : "Add"}
      okButtonProps={{
        className: "!bg-amber-500 !hover:bg-amber-600 !text-white !border-none",
      }}
      confirmLoading={loading}
      centered
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="productGroup"
          label={
            <span className="text-amber-700 font-semibold">Product Group</span>
          }
          rules={[{ required: true }]}
        >
          <Select placeholder="Select Product Group" disabled={isEdit}>
            {productGroups.map((pg) => (
              <Select.Option key={pg.id} value={pg.id}>
                {pg.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="code"
          label={
            <span className="text-amber-700 font-semibold">
              {type.toUpperCase()} Code
            </span>
          }
          rules={[
            { required: true },
            {
              pattern: type === "hsn" ? /^[0-9]{4,8}$/ : /^[0-9]{6}$/,
            },
          ]}
        >
          <Input maxLength={type === "hsn" ? 8 : 6} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* ================= MAIN ================= */
const HsnSacManager = () => {
  const [hsnList, setHsnList] = useState([]);
  const [sacList, setSacList] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [modalType, setModalType] = useState(null);

  const [editRecord, setEditRecord] = useState(null);
  const [editType, setEditType] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [_, __, groupData, mappedData] = await Promise.all([
        getHSNSACCodes(),
        getSACCodes(),
        getProductGroups(),
        getproductGroupHSNList(),
      ]);

      setProductGroups(groupData || []);

      const hsnMapped = (mappedData || [])
        .filter((item) => item.hsn_code)
        .map((item) => ({
          key: item.id, // ✅ ONLY ID
          productGroupId: item.id,
          productGroupName: item.name,
          code: item.hsn_code_value || item.hsn_code,
        }));

      const sacMapped = (mappedData || [])
        .filter((item) => item.sac_code)
        .map((item) => ({
          key: item.id, // ✅ ONLY ID
          productGroupId: item.id,
          productGroupName: item.name,
          code: item.sac_code_value || item.sac_code,
        }));

      setHsnList(hsnMapped);
      setSacList(sacMapped);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = (type) => [
    {
      title: "Product Group",
      dataIndex: "productGroupName",
    },
    {
      title: "Code",
      dataIndex: "code",
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => (
        <EditOutlined
          className="cursor-pointer !text-blue-500"
          onClick={() => {
            setEditRecord(record);
            setEditType(type);
          }}
        />
      ),
    },
  ];

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-4">
        <Card
          title="HSN Codes"
          extra={<Button onClick={() => setModalType("hsn")}>Add HSN</Button>}
        >
          <Table rowKey="key" columns={columns("hsn")} dataSource={hsnList} />
        </Card>

        <Card
          title="SAC Codes"
          extra={<Button onClick={() => setModalType("sac")}>Add SAC</Button>}
        >
          <Table rowKey="key" columns={columns("sac")} dataSource={sacList} />
        </Card>
      </div>

      {(modalType || editType) && (
        <AddTaxModal
          open={true}
          type={modalType || editType}
          productGroups={productGroups}
          initialValues={editRecord}
          isEdit={!!editRecord}
          onClose={() => {
            setModalType(null);
            setEditType(null);
            setEditRecord(null);
          }}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
};

export default HsnSacManager;
