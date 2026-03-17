import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Space,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

import {
  getProductGroups,
  getHSNSACCodes,
  getVendors,
  addproduct,
  getProducts, // ✅ FIX 1
  getProductById,
  updateProductById,
  getUnits,
} from "../../../../../../../api/product";

const { Option } = Select;

const ITEM_TYPES = ["CONSUMER", "BULK"];
const ITEM_CATEGORY = ["GOODS", "SERVICE"];
// const BASE_UNITS = ["LTR", "KG", "PCS", "GM", "ML", "BOX", "PACK"];

/* ================= FORM FIELD ================= */
function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 500, color: "#92400e" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ItemMasterTab({ items, setItems }) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [groups, setGroups] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [hsnSacCodes, setHsnSacCodes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    gstPercent: 0,
    cgstPercent: 0,
    sgstPercent: 0,
  });

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    Promise.all([
      getProductGroups(),
      getVendors(),
      getHSNSACCodes(),
      getUnits(),
    ])
      .then(([g, v, h, u]) => {
        setGroups(g);
        setVendors(v);
        setHsnSacCodes(h);
        setUnits(u);
      })
      .catch(() => message.error("Failed to load master data"));
  }, []);

  /* ================= GST SPLIT ================= */
  const handleGstChange = (value = 0) => {
    const gst = Math.min(100, Math.max(0, value));
    setFormData((p) => ({
      ...p,
      gstPercent: gst,
      cgstPercent: gst / 2,
      sgstPercent: gst / 2,
    }));
  };

  /* ================= SAFE EDIT MAPPING ================= */
  const openEdit = async (record, view = false) => {
    try {
      setLoading(true);

      const data = await getProductById(record.id);

      setEditingId(record.id);

      setFormData({
        itemName: data.name,
        itemType: data.product_type,
        company: data.vendor,
        product_group: data.product_group,
        itemCategory: data.category,
        hsn_code: data.hsn_code,
        sac_code: data.sac_code || null,
        base_unit_group: data.base_unit_group,
        gstPercent: Number(data.gst_percentage),
        cgstPercent: Number(data.gst_percentage) / 2,
        sgstPercent: Number(data.gst_percentage) / 2,
        currentStock: Number(data.current_stock),
      });

      setViewMode(view);
      setOpen(true);
    } catch (err) {
      message.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (
      !formData.itemName ||
      !formData.product_group ||
      !formData.hsn_code ||
      !formData.base_unit_group ||
      !formData.itemType ||
      !formData.itemCategory ||
      !formData.company
    ) {
      message.error("Please fill all required fields");
      return;
    }

    const payload = {
      name: formData.itemName,
      product_group: formData.product_group,
      hsn_code: formData.hsn_code,
      sac_code: formData.itemCategory === "SERVICE" ? formData.sac_code : null,
      base_unit_group: formData.base_unit_group,
      product_type: formData.itemType,
      category: formData.itemCategory,
      gst_percentage: formData.gstPercent,
      cgst: formData.cgstPercent,
      sgst: formData.sgstPercent,
      current_stock: formData.currentStock || 0,
      vendor: formData.company,
    };

    try {
      setLoading(true);

      if (editingId) {
        // ✅ UPDATE
        await updateProductById(payload, editingId);
        message.success("Product updated successfully");
      } else {
        // ✅ ADD
        await addproduct(payload);
        message.success("Product added successfully");
      }

      const updated = await getProducts();
      setItems(updated);

      setOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (err) {
      console.error(err);
      message.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "Item Name", dataIndex: "name" },
    { title: "Type", dataIndex: "product_type" },
    { title: "Company", dataIndex: "vendor_name" },
    { title: "Base Unit", dataIndex: "base_unit" },
    {
      title: "Action",
      render: (_, r) => (
        <Space>
          <EyeOutlined
            className="action-view"
            onClick={() => openEdit(r, true)}
          />
          <EditOutlined className="action-edit" onClick={() => openEdit(r)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>
        {`
/* ===== TABLE BORDER ===== */
// .amber-table .ant-table {
//   border: 1px solid #f59e0b;
//   border-radius: 8px;
//   overflow: hidden;
// }

/* header */
.amber-table .ant-table-thead > tr > th {
  background: #fffbeb;
  color: #92400e;
  // border-bottom: 2px solid #f59e0b;
  font-weight: 600;
}

/* body cells */
.amber-table .ant-table-tbody > tr > td {
  border-bottom: 1px solid #fde68a;
  color: #78350f;
}

/* row hover */
.amber-table .ant-table-tbody > tr:hover > td {
  background: #fffbeb;
}

/* pagination active */
.amber-table .ant-pagination-item-active {
  border-color: #f59e0b;
}
.amber-table .ant-pagination-item-active a {
  color: #f59e0b;
}

/* ===== ADD BUTTON ===== */
.amber-add-btn {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
}

.amber-add-btn:hover {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
}

/* ===== ACTION ICONS ===== */
.action-view {
  color: #2151f0;
  font-size: 16px;
  cursor: pointer;
}

.action-view:hover {
  color: #15803d;
}

.action-edit {
  color: #ed0b0b;
  font-size: 16px;
  cursor: pointer;
}

.action-edit:hover {
  color: #1d4ed8;
}
`}
      </style>
      <Button
        className="amber-add-btn"
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setFormData({ gstPercent: 0, cgstPercent: 0, sgstPercent: 0 });
          setEditingId(null);
          setViewMode(false);
          setOpen(true);
        }}
      >
        Add Item
      </Button>

      <Table
        className="amber-table"
        rowKey="id"
        columns={columns}
        dataSource={items}
        style={{ marginTop: 16 }}
      />

      <Modal
        open={open}
        width={800}
        onCancel={() => setOpen(false)}
        onOk={viewMode ? null : handleSave}
        okButtonProps={{ disabled: viewMode, loading }}
        title={viewMode ? "View Item" : "Add / Edit Item"}
      >
        <div style={{ paddingTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              {" "}
              <FormField label="Item Name" required>
                <Input
                  disabled={viewMode}
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Item Type" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select item type"
                  style={{ width: "100%" }}
                  value={formData.itemType}
                  onChange={(value) =>
                    setFormData({ ...formData, itemType: value })
                  }
                >
                  {ITEM_TYPES.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Company Name" required>
                <Select
                  disabled={viewMode}
                  showSearch
                  placeholder="Select company"
                  style={{ width: "100%" }}
                  value={formData.company}
                  onChange={(value) =>
                    setFormData({ ...formData, company: value })
                  }
                  optionFilterProp="label"
                  options={vendors.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Product Group" required>
                <Select
                  showSearch
                  placeholder="Select product group"
                  loading={loading}
                  style={{ width: "100%" }}
                  value={formData.product_group}
                  onChange={(value) =>
                    setFormData({ ...formData, product_group: value })
                  }
                  optionFilterProp="label"
                  options={groups.map((g) => ({
                    value: g.id, // UUID goes to backend
                    label: g.name, // Name shown to user
                  }))}
                />
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FormField label="Category" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select category"
                  value={formData.itemCategory}
                  style={{ width: "100%" }}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      itemCategory: value,
                      hsnCode: "",
                      sacCode: "",
                    })
                  }
                >
                  {ITEM_CATEGORY.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </FormField>
            </Col>

            <Col span={12}>
              <FormField label="HSN Code" required>
                <Select
                  showSearch
                  placeholder="Select HSN code"
                  value={formData.hsn_code || undefined}
                  style={{ width: "100%" }}
                  loading={!hsnSacCodes.length}
                  optionFilterProp="label"
                  onChange={(value) =>
                    setFormData({ ...formData, hsn_code: value })
                  }
                  options={hsnSacCodes.map((h) => ({
                    value: h.id, // UUID sent to backend
                    label: `${h.hsn_code} - ${h.description}`,
                  }))}
                />
              </FormField>

              {formData.itemCategory === "services" && (
                <FormField label="SAC Code" required>
                  <Select
                    showSearch
                    placeholder="Select SAC code"
                    value={formData.sac_code}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      setFormData({ ...formData, sac_code: value })
                    }
                    optionFilterProp="label"
                    options={hsnSacCodes
                      .filter((i) => i.type === "SAC")
                      .map((i) => ({
                        value: i.id,
                        label: `${i.code} - ${i.description}`,
                      }))}
                  />
                </FormField>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <FormField label="GST %" required>
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: "100%" }}
                  value={formData.gstPercent}
                  onChange={handleGstChange}
                  formatter={(value) => `${value}`}
                  parser={(value) => value.replace("%", "")}
                  placeholder="%"
                />
              </FormField>
            </Col>
            <Col span={8}>
              <FormField label="CGST %">
                <InputNumber
                  style={{ width: "100%" }}
                  value={formData.cgstPercent}
                  disabled
                  formatter={(value) => `${value}%`}
                />
              </FormField>
            </Col>

            <Col span={8}>
              <FormField label="SGST %">
                <InputNumber
                  style={{ width: "100%" }}
                  value={formData.sgstPercent}
                  disabled
                  formatter={(value) => `${value}%`}
                />
              </FormField>
            </Col>

            <Col span={12}>
              <FormField label="Base Unit" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select unit"
                  style={{ width: "100%" }}
                  value={formData.base_unit_group}
                  onChange={(value) =>
                    setFormData({ ...formData, base_unit_group: value })
                  }
                  optionFilterProp="label"
                  options={units.map((u) => ({
                    value: u.id,
                    label: u.name,
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              {" "}
              <FormField label="Current Stock">
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  step={1}
                  placeholder="0"
                  style={{ width: "100%" }}
                  value={formData.currentStock}
                  onChange={(value) =>
                    setFormData({ ...formData, currentStock: value || 0 })
                  }
                />
              </FormField>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
}
