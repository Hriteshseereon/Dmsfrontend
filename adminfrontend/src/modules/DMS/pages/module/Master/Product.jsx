import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;
const STORAGE_KEY = "item_master_core_v1";

/* ===== Master Data ===== */
const COMPANY_OPTIONS = [
  "RUCHI SOYA INDUSTRIES LIMITED",
  "AMUL DAIRY",
  "PARLE PRODUCTS",
];

const GROUP_OPTIONS = [
  "BLENDED MUSTARD OIL",
  "SUNFLOWER OIL",
  "MILK",
  "BISCUITS",
];

const UNIT_OPTIONS = ["LTR", "KG", "PCS"];

const HSN_CODES = [
  { code: "15159010", label: "Edible Oil" },
  { code: "04012000", label: "Milk Products" },
];

const SAC_CODES = [{ code: "998599", label: "Trading Services" }];

/* ===== Dummy Data ===== */
const DUMMY_ITEMS = [
  {
    key: 1,
    itemName: "RUCHI GOLD MUSTARD OIL",
    companyName: "RUCHI SOYA INDUSTRIES LIMITED",
    groupName: "BLENDED MUSTARD OIL",
    baseUnit: "LTR",
    hsnSacType: "HSN",
    hsnSacCode: "15159010",
    gstPercent: 5,
    cstPercent: 0,
    currentStock: 120,
  },
];

export default function ItemMaster() {
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DUMMY_ITEMS;
    try {
      const parsed = JSON.parse(raw);
      return parsed.length ? parsed : DUMMY_ITEMS;
    } catch {
      return DUMMY_ITEMS;
    }
  });

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleSave = (values) => {
    if (editItem) {
      setData((prev) =>
        prev.map((i) =>
          i.key === editItem.key ? { ...i, ...values } : i
        )
      );
    } else {
      setData((prev) => [...prev, { ...values, key: Date.now() }]);
    }
    setOpen(false);
    setEditItem(null);
    form.resetFields();
  };

  const columns = [
    { title: "Item Name", dataIndex: "itemName", width: 220 },
    { title: "Company", dataIndex: "companyName", width: 220 },
    { title: "Group", dataIndex: "groupName" },
    { title: "Base Unit", dataIndex: "baseUnit", align: "center" },
    {
      title: "HSN / SAC",
      render: (_, r) => `${r.hsnSacType} - ${r.hsnSacCode}`,
      align: "center",
    },
    { title: "GST %", dataIndex: "gstPercent", align: "right" },
    {
      title: "Stock",
      render: (_, r) => `${r.currentStock} ${r.baseUnit}`,
      align: "right",
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => (
        <EditOutlined
          className="cursor-pointer text-blue-600"
          onClick={() => {
            setEditItem(record);
            form.setFieldsValue(record);
            setOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <Card
      title="Item Master"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Add Item
        </Button>
      }
    >
      <Table
        rowKey="key"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        open={open}
        title={editItem ? "Edit Item" : "Add Item"}
        onCancel={() => setOpen(false)}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="itemName" label="Item Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="companyName" label="Company" rules={[{ required: true }]}>
                <Select>
                  {COMPANY_OPTIONS.map((c) => (
                    <Option key={c}>{c}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="groupName" label="Group" rules={[{ required: true }]}>
                <Select>
                  {GROUP_OPTIONS.map((g) => (
                    <Option key={g}>{g}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="baseUnit" label="Base Unit" rules={[{ required: true }]}>
                <Select>
                  {UNIT_OPTIONS.map((u) => (
                    <Option key={u}>{u}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="currentStock" label="Current Stock">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="hsnSacType" label="HSN / SAC Type">
                <Select>
                  <Option value="HSN">HSN</Option>
                  <Option value="SAC">SAC</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="hsnSacCode" label="HSN / SAC Code">
                <Select>
                  {[...HSN_CODES, ...SAC_CODES].map((c) => (
                    <Option key={c.code} value={c.code}>
                      {c.code} - {c.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="gstPercent" label="GST %">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="cstPercent" label="CST %">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}
