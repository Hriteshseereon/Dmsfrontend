import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Empty,
  Tag,
  Space,
  message,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getProductGroups,
  getHSNSACCodes,
  getVendors,
  addproduct,
  getProducts,
  getProductUnitConversions,
  addProductUnitConversion,
} from "../../../../../api/product";
const { Option } = Select;

// ==================== DUMMY DATA ====================
const HSN_CODES = [
  { code: "15159010", description: "Mustard Oil" },
  { code: "04012000", description: "Milk" },
  { code: "19053100", description: "Biscuits" },
  { code: "10063000", description: "Rice" },
  { code: "04090000", description: "Honey" },
];

const SAC_CODES = [
  { code: "995431", description: "Transport Service" },
  { code: "996511", description: "Packaging Service" },
  { code: "998599", description: "Other Services" },
];

const COMPANIES = [
  "RUCHI SOYA INDUSTRIES LIMITED",
  "AMUL DAIRY",
  "PARLE PRODUCTS",
  "ITC LIMITED",
  "BRITANNIA INDUSTRIES",
  "NESTLE INDIA",
  "HINDUSTAN UNILEVER",
];

const ITEMS_TYPES = ["CONSUMER", "BULK"];

const GROUPS = [
  "BLENDED MUSTARD OIL",
  "MILK",
  "BISCUITS",
  "RICE",
  "PULSES",
  "SPICES",
  "TEA & COFFEE",
  "SNACKS",
];

const BASE_UNITS = [
  "LTR",
  "KG",
  "PCS",
  "MTR",
  "GM",
  "ML",
  "BOX",
  "PACK",
  "DOZEN",
];

const INITIAL_ITEMS = [
  {
    id: 1,
    itemName: "RUCHI GOLD MUSTARD OIL",
    companyName: "RUCHI SOYA INDUSTRIES LIMITED",
    itemType: "Consumer",
    groupName: "BLENDED MUSTARD OIL",
    baseUnit: "LTR",
    hsnCode: "15159010",
    sacCode: "",
    gstPercent: 5,
    cstPercent: 2,
    currentStock: 120,
  },
  {
    id: 2,
    itemName: "AMUL TAZA MILK",
    companyName: "AMUL DAIRY",
    itemType: "Consumer",
    groupName: "MILK",
    baseUnit: "LTR",
    hsnCode: "04012000",
    sacCode: "",
    gstPercent: 0,
    cstPercent: 0,
    currentStock: 200,
  },
  {
    id: 3,
    itemName: "PARLE-G BISCUITS",
    companyName: "PARLE PRODUCTS",
    itemType: "Bulk",
    groupName: "BISCUITS",
    baseUnit: "PCS",
    hsnCode: "19053100",
    sacCode: "",
    gstPercent: 12,
    cstPercent: 2,
    currentStock: 500,
  },
];

const INITIAL_UNIT_CONVERSIONS = [
  {
    id: 1,
    itemId: 1,
    unitName: "CAN",
    multiplier: 5,
    baseUnitRef: "LTR",
    isDisplayUnit: false,
  },
  {
    id: 2,
    itemId: 1,
    unitName: "JAR",
    multiplier: 3,
    baseUnitRef: "CAN",
    isDisplayUnit: true,
  },
  {
    id: 3,
    itemId: 2,
    unitName: "PACKET",
    multiplier: 0.5,
    baseUnitRef: "LTR",
    isDisplayUnit: true,
  },
  {
    id: 4,
    itemId: 3,
    unitName: "PACK",
    multiplier: 10,
    baseUnitRef: "PCS",
    isDisplayUnit: false,
  },
  {
    id: 5,
    itemId: 3,
    unitName: "BOX",
    multiplier: 10,
    baseUnitRef: "PACK",
    isDisplayUnit: true,
  },
];

const INITIAL_PRICES = [
  { id: 1, itemId: 1, baseUnitPrice: 150 },
  { id: 2, itemId: 2, baseUnitPrice: 60 },
  { id: 3, itemId: 3, baseUnitPrice: 5 },
];

const ITEM_CATEGORY = ["GOODS", "SERVICE"];

// ==================== FORM COMPONENT ====================
function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          marginBottom: 4,
          fontWeight: 500,
          color: "#92400e",
        }}
      >
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ItemUnitPriceManager() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [unitConversions, setUnitConversions] = useState(
    INITIAL_UNIT_CONVERSIONS,
  );
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card className="shadow-md" bodyStyle={{ background: "#fffaf0" }}>
        <Tabs
          tabBarStyle={{ marginBottom: 16 }}
          items={[
            {
              key: "1",
              label: "📦 Item Master",
              children: (
                <ItemMasterTab
                  items={items}
                  setItems={setItems}
                  setSelectedItem={setSelectedItem}
                />
              ),
            },
            {
              key: "2",
              label: "🔄 Unit Conversions",
              children: (
                <UnitConversionTab
                  items={items}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  unitConversions={unitConversions}
                  setUnitConversions={setUnitConversions}
                />
              ),
            },
            {
              key: "3",
              label: "💰 Price Management",
              children: (
                <PriceManagementTab
                  items={items}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  unitConversions={unitConversions}
                  prices={prices}
                  setPrices={setPrices}
                />
              ),
            },
          ]}
          className="
            [&_.ant-tabs-tab]:font-semibold
            [&_.ant-tabs-tab]:text-amber-700
            [&_.ant-tabs-tab-active]:text-amber-800
            [&_.ant-tabs-ink-bar]:bg-amber-500
          "
        />
      </Card>
    </div>
  );
}

// ==================== ITEM MASTER TAB ====================
function ItemMasterTab({ items, setItems, setSelectedItem }) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [formData, setFormData] = useState({
    itemCategory: "",
    gstPercent: 0,
    cgstPercent: 0,
    sgstPercent: 0,
  });
  const [groups, setGroups] = useState([]);
  const [hsnSacCodes, setHsnSacCodes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [g, h, c] = await Promise.all([
          getProductGroups(),
          getHSNSACCodes(),
          getVendors(), // if you have it
        ]);
        setGroups(g);
        setHsnSacCodes(h);
        setCompanies(c);
        console.log("Fetched hsnsac code data", { h });
        console.log("Fetched companies data", { c });
        console.log("Fetched product groups data", { g });
      } catch (err) {
        message.error("Failed to load master data");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, []);
  const handleGstChange = (value = 0) => {
    const gst = value > 100 ? 100 : value < 0 ? 0 : value;

    setFormData((prev) => ({
      ...prev,
      gstPercent: gst,
      cgstPercent: gst / 2,
      sgstPercent: gst / 2,
    }));
  };

  const handleSave = async () => {
    if (
      !formData.itemName ||
      !formData.product_group ||
      !formData.hsn_code ||
      !formData.baseUnit ||
      !formData.itemType ||
      !formData.itemCategory ||
      !formData.company
    ) {
      message.error("Please fill all required fields");
      return;
    }

    const payload = {
      name: formData.itemName,
      product_group: formData.product_group, // UUID
      hsn_code: formData.hsn_code, // UUID
      base_unit: formData.baseUnit.toLowerCase(),
      product_type: formData.itemType.toUpperCase(), // CONSUMER / BULK
      category: formData.itemCategory.toUpperCase(), // GOODS / SERVICE
      gst_percentage: formData.gstPercent,
      cgst: formData.cgstPercent,
      sgst: formData.sgstPercent,
      current_stock: formData.currentStock || 0,
      vendor: formData.company, // vendor UUID
    };

    try {
      setLoading(true);

      const savedProduct = await addproduct(payload);

      message.success("Product added successfully");

      // Optional: refresh product list from backend
      const updatedProducts = await getProducts();
      setItems(updatedProducts);

      setOpen(false);
      setEditItem(null);
      setFormData({});
    } catch (error) {
      console.error(error);
      message.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        console.log("Loaded products:", data);
        setItems(data);
      } catch {
        message.error("Failed to load products");
      }
    };

    loadProducts();
  }, []);

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Item Name</span>,
      dataIndex: "itemName",
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">Item Type</span>,
      dataIndex: "itemType",
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">Company</span>,
      dataIndex: "companyName",
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">Group</span>,
      dataIndex: "groupName",
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">Base Unit</span>,
      dataIndex: "baseUnit",
      align: "center",
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">HSN / SAC</span>,
      render: (_, r) => r.hsnCode || r.sacCode,
    },
    {
      title: <span className="text-amber-700 font-semibold">GST %</span>,
      dataIndex: "gstPercent",
      align: "right",
      width: 80,
      render: (val) => `${val}%`,
    },
    {
      title: <span className="text-amber-700 font-semibold">Stock</span>,
      dataIndex: "currentStock",
      align: "right",
      width: 80,
    },
    {
      title: <span className="text-amber-700 font-semibold">Action</span>,
      align: "center",
      width: 100,
      render: (_, record) => (
        <Space>
          {/* 👁 View */}
          <EyeOutlined
            className="cursor-pointer! text-blue-600!"
            onClick={() => {
              setEditItem(record);
              setFormData(record);
              setViewMode(true);
              setOpen(true);
            }}
          />

          {/* ✏ Edit */}
          <EditOutlined
            className="cursor-pointer! text-red-600!"
            onClick={() => {
              setEditItem(record);
              setFormData(record);
              setViewMode(false);
              setOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditItem(null);
            setFormData({});
            setOpen(true);
          }}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add Item
        </Button>
      </div>

      <Table
        className="
          [&_.ant-table-thead_th]:bg-amber-100
          [&_.ant-table-thead_th]:text-amber-800
          [&_.ant-table-thead_th]:font-semibold
          [&_.ant-table-tbody_td]:text-amber-800
        "
        rowKey="id"
        columns={columns}
        pagination={{ pageSize: 10 }}
        dataSource={items.map((i) => ({
          ...i,
          itemName: i.name,
          itemType: i.product_type,
          companyName: i.organisation,
          groupName: i.product_group,
          baseUnit: i.base_unit?.toUpperCase(),
          gstPercent: i.gst_percentage,
          currentStock: i.current_stock,
          hsnCode: i.hsn_code,
          sacCode: i.sac_code,
        }))}
      />
      <Modal
        open={open}
        width={800}
        title={
          <span style={{ color: "#92400e", fontSize: "18px", fontWeight: 600 }}>
            {viewMode ? "View Item" : editItem ? "Edit Item" : "Add New Item"}
          </span>
        }
        onCancel={() => {
          setOpen(false);
          setEditItem(null);
          setFormData({});
          setViewMode(false);
        }}
        onOk={viewMode ? undefined : handleSave}
        okText={editItem ? "Update" : "Add Item"}
        okButtonProps={{
          disabled: viewMode,
          className: "bg-amber-600! hover:bg-amber-700!",
        }}
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
                  {ITEMS_TYPES.map((type) => (
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
                  options={companies.map((c) => ({
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

              {formData.itemCategory === "Service" && (
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
                  formatter={(value) => `${value}%`}
                  parser={(value) => value.replace("%", "")}
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
                  value={formData.baseUnit}
                  onChange={(value) =>
                    setFormData({ ...formData, baseUnit: value })
                  }
                >
                  {BASE_UNITS.map((u) => (
                    <Option key={u} value={u}>
                      {u}
                    </Option>
                  ))}
                </Select>
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

// ==================== UNIT CONVERSION TAB ====================
function UnitConversionTab({
  items,
  selectedItem,
  setSelectedItem,
  unitConversions,
  setUnitConversions,
}) {
  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [formData, setFormData] = useState({});

  const itemUnits = selectedItem
    ? unitConversions.filter((u) => u.itemId === selectedItem.id)
    : [];

  // Calculate total multiplier to base unit
  const calculateToBaseUnit = (unit) => {
    let totalMultiplier = unit.multiplier;
    let currentRef = unit.baseUnitRef;

    // Keep multiplying until we reach the base unit
    while (currentRef !== selectedItem.baseUnit) {
      const refUnit = itemUnits.find((u) => u.unitName === currentRef);
      if (!refUnit) break;
      totalMultiplier *= refUnit.multiplier;
      currentRef = refUnit.baseUnitRef;
    }

    return totalMultiplier;
  };

  // Get available units to reference (base unit + existing units)
  const getAvailableUnits = () => {
    const units = [{ name: selectedItem.baseUnit, isBase: true }];
    itemUnits.forEach((u) => {
      if (!editUnit || u.id !== editUnit.id) {
        units.push({ name: u.unitName, isBase: false });
      }
    });
    return units;
  };

  const handleSave = () => {
    if (!formData.unitName || !formData.multiplier || !formData.baseUnitRef) {
      message.error("Please fill all fields");
      return;
    }

    // Check for circular reference
    if (formData.baseUnitRef === formData.unitName) {
      message.error("Unit cannot reference itself!");
      return;
    }

    if (editUnit) {
      setUnitConversions((prev) =>
        prev.map((u) => (u.id === editUnit.id ? { ...u, ...formData } : u)),
      );
      message.success("Unit updated!");
    } else {
      const newUnit = {
        ...formData,
        id: Date.now(),
        itemId: selectedItem.id,
        isDisplayUnit: false,
      };
      setUnitConversions((prev) => [...prev, newUnit]);
      message.success("Unit added!");
    }
    setOpen(false);
    setEditUnit(null);
    setFormData({});
  };

  const handleDelete = (id) => {
    // Check if any other unit references this unit
    const isReferenced = itemUnits.some(
      (u) =>
        u.baseUnitRef === itemUnits.find((unit) => unit.id === id)?.unitName,
    );
    if (isReferenced) {
      message.error("Cannot delete! Other units reference this unit.");
      return;
    }

    setUnitConversions((prev) => prev.filter((u) => u.id !== id));
    message.success("Unit deleted!");
  };

  const handleSetDisplayUnit = (unitId) => {
    setUnitConversions((prev) =>
      prev.map((u) =>
        u.itemId === selectedItem.id
          ? { ...u, isDisplayUnit: u.id === unitId }
          : u,
      ),
    );
    message.success("Display unit updated!");
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Unit Name</span>,
      dataIndex: "unitName",
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Conversion Chain</span>
      ),
      render: (_, r) => `1 ${r.unitName} = ${r.multiplier} ${r.baseUnitRef}`,
    },
    {
      title: <span className="text-amber-700 font-semibold">To Base Unit</span>,
      render: (_, r) => {
        const toBase = calculateToBaseUnit(r);
        return `1 ${r.unitName} = ${toBase} ${selectedItem?.baseUnit}`;
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Display to Customer
        </span>
      ),
      align: "center",
      render: (_, r) => (
        <Button
          type={r.isDisplayUnit ? "primary" : "default"}
          size="small"
          onClick={() => handleSetDisplayUnit(r.id)}
          className={
            r.isDisplayUnit
              ? "bg-amber-600! hover:bg-amber-700! border-amber-600!"
              : "text-amber-700! border-amber-300! hover:text-amber-800! hover:border-amber-500!"
          }
        >
          {r.isDisplayUnit ? "✓ Display Unit" : "Set as Display"}
        </Button>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Action</span>,
      align: "center",
      render: (_, record) => (
        <Space>
          <EditOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setEditUnit(record);
              setFormData(record);
              setOpen(true);
            }}
          />
          <DeleteOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  if (!selectedItem) {
    return (
      <Card>
        <Empty description="Select an item below">
          <Select
            showSearch
            style={{ width: 400 }}
            placeholder="Search and select an item"
            optionFilterProp="children"
            onChange={(value) => {
              const item = items.find((i) => i.id === value);
              setSelectedItem(item);
            }}
          >
            {items.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.itemName} ({item.baseUnit})
              </Option>
            ))}
          </Select>
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <span style={{ color: "#92400e" }}>
              Unit Conversions for: {selectedItem.itemName}
            </span>
            <Tag color="orange">Base: {selectedItem.baseUnit}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              showSearch
              style={{ width: 300 }}
              value={selectedItem.id}
              optionFilterProp="children"
              onChange={(value) => {
                const item = items.find((i) => i.id === value);
                setSelectedItem(item);
              }}
            >
              {items.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.itemName}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setFormData({ baseUnitRef: selectedItem.baseUnit });
                setOpen(true);
              }}
              className="bg-amber-500! hover:bg-amber-600! border-none! "
            >
              Add Unit
            </Button>
          </Space>
        }
      >
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#fef3c7",
            borderRadius: 8,
          }}
        >
          <strong style={{ color: "#92400e" }}>💡 Tip:</strong>
          <span style={{ color: "#78350f", marginLeft: 8 }}>
            You can create a unit chain! Example: 1 BOX = 10 PCS, then 1 CARTON
            = 10 BOX. The system will automatically calculate that 1 CARTON =
            100 PCS.
          </span>
        </div>

        <Table
          className="
            [&_.ant-table-thead_th]:bg-amber-100
            [&_.ant-table-thead_th]:text-amber-800
            [&_.ant-table-thead_th]:font-semibold
            [&_.ant-table-tbody_td]:text-amber-800
          "
          rowKey="id"
          columns={columns}
          dataSource={itemUnits}
          pagination={false}
        />
      </Card>

      <Modal
        open={open}
        title={
          <span style={{ color: "#92400e", fontSize: "18px", fontWeight: 600 }}>
            {editUnit ? "Edit Unit Conversion" : "Add Unit Conversion"}
          </span>
        }
        onCancel={() => {
          setOpen(false);
          setEditUnit(null);
          setFormData({});
        }}
        onOk={handleSave}
        okText={editUnit ? "Update" : "Add Unit"}
        okButtonProps={{
          className:
            "bg-amber-600! hover:bg-amber-700! border-amber-600! hover:border-amber-700!",
        }}
        cancelButtonProps={{
          className:
            "text-amber-700! border-amber-300! hover:text-amber-800! hover:border-amber-500!",
        }}
      >
        <div style={{ paddingTop: 16 }}>
          <FormField label="Unit Name" required>
            <Input
              placeholder="e.g., BOX, PACK, CARTON, CAN"
              value={formData.unitName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitName: e.target.value.toUpperCase(),
                })
              }
            />
          </FormField>

          <FormField label="Reference Unit" required>
            <Select
              placeholder="Select reference unit"
              style={{ width: "100%" }}
              value={formData.baseUnitRef}
              onChange={(value) =>
                setFormData({ ...formData, baseUnitRef: value })
              }
            >
              {getAvailableUnits().map((unit) => (
                <Option key={unit.name} value={unit.name}>
                  {unit.name} {unit.isBase && "(Base Unit)"}
                </Option>
              ))}
            </Select>
          </FormField>

          <FormField
            label={`1 ${formData.unitName || "Unit"} = ? ${formData.baseUnitRef || "Reference Unit"}`}
            required
          >
            <InputNumber
              min={0.01}
              step={0.01}
              style={{ width: "100%" }}
              placeholder="Enter multiplier"
              value={formData.multiplier}
              onChange={(value) =>
                setFormData({ ...formData, multiplier: value })
              }
            />
          </FormField>

          {formData.baseUnitRef &&
            formData.baseUnitRef !== selectedItem.baseUnit &&
            formData.multiplier && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#fef3c7",
                  borderRadius: 8,
                }}
              >
                <strong style={{ color: "#92400e" }}>Preview:</strong>
                <div style={{ color: "#78350f", marginTop: 4 }}>
                  1 {formData.unitName || "Unit"} = {formData.multiplier}{" "}
                  {formData.baseUnitRef}
                </div>
              </div>
            )}
        </div>
      </Modal>
    </>
  );
}

// ==================== PRICE MANAGEMENT TAB ====================
function PriceManagementTab({
  items,
  selectedItem,
  setSelectedItem,
  unitConversions,
  prices,
  setPrices,
}) {
  const itemPrice = selectedItem
    ? prices.find((p) => p.itemId === selectedItem.id) || {
        itemId: selectedItem.id,
        baseUnitPrice: 0,
      }
    : null;

  const itemUnits = selectedItem
    ? unitConversions.filter((u) => u.itemId === selectedItem.id)
    : [];

  // Calculate total multiplier to base unit
  const calculateToBaseUnit = (unit) => {
    let totalMultiplier = unit.multiplier;
    let currentRef = unit.baseUnitRef;

    while (currentRef !== selectedItem.baseUnit) {
      const refUnit = itemUnits.find((u) => u.unitName === currentRef);
      if (!refUnit) break;
      totalMultiplier *= refUnit.multiplier;
      currentRef = refUnit.baseUnitRef;
    }

    return totalMultiplier;
  };

  const handlePriceChange = (value) => {
    const newPrice = value || 0;
    setPrices((prev) => {
      const exists = prev.find((p) => p.itemId === selectedItem.id);
      if (exists) {
        return prev.map((p) =>
          p.itemId === selectedItem.id ? { ...p, baseUnitPrice: newPrice } : p,
        );
      } else {
        return [
          ...prev,
          { id: Date.now(), itemId: selectedItem.id, baseUnitPrice: newPrice },
        ];
      }
    });
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Unit Name</span>,
      dataIndex: "unitName",
      width: 150,
    },
    {
      title: <span className="text-amber-700 font-semibold">To Base Unit</span>,
      width: 200,
      render: (_, r) => {
        if (r.id === "base") return "1 (Base)";
        const toBase = calculateToBaseUnit(r);
        return `${toBase} ${selectedItem.baseUnit}`;
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Calculated Price</span>
      ),
      width: 200,
      render: (_, r) => {
        if (r.id === "base") {
          return `₹${itemPrice.baseUnitPrice.toFixed(2)}`;
        }
        const toBase = calculateToBaseUnit(r);
        return `₹${(itemPrice.baseUnitPrice * toBase).toFixed(2)}`;
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Display to Customer
        </span>
      ),
      align: "center",
      render: (_, r) =>
        r.isDisplayUnit ? (
          <Tag color="green">✓ Customer Sees This</Tag>
        ) : (
          <Tag color="default">Internal Only</Tag>
        ),
    },
  ];

  if (!selectedItem) {
    return (
      <Card>
        <Empty description="Select an item to manage prices">
          <Select
            showSearch
            style={{ width: 400 }}
            placeholder="Search and select an item"
            optionFilterProp="children"
            onChange={(value) => {
              const item = items.find((i) => i.id === value);
              setSelectedItem(item);
            }}
          >
            {items.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.itemName}
              </Option>
            ))}
          </Select>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      title={
        <span style={{ color: "#92400e" }}>
          Price Management: {selectedItem.itemName}
        </span>
      }
      extra={
        <Select
          showSearch
          style={{ width: 300 }}
          value={selectedItem.id}
          optionFilterProp="children"
          onChange={(value) => {
            const item = items.find((i) => i.id === value);
            setSelectedItem(item);
          }}
        >
          {items.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.itemName}
            </Option>
          ))}
        </Select>
      }
    >
      <div
        style={{
          background: "#fef3c7",
          padding: 16,
          marginBottom: 24,
          borderRadius: 8,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#92400e" }}>
                Base Unit Price ({selectedItem.baseUnit})
              </strong>
            </div>
            <InputNumber
              prefix="₹"
              min={0}
              step={0.01}
              value={itemPrice.baseUnitPrice}
              onChange={handlePriceChange}
              style={{ width: "100%" }}
              size="large"
            />
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#92400e" }}>Tax Information</strong>
            </div>
            <div style={{ fontSize: 14, color: "#78350f" }}>
              GST: {selectedItem.gstPercent}% | CST: {selectedItem.cstPercent}%
            </div>
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>
              HSN: {selectedItem.hsnCode}
              {selectedItem.sacCode && ` | SAC: ${selectedItem.sacCode}`}
            </div>
          </Col>
        </Row>
      </div>

      <h4 style={{ color: "#92400e", marginBottom: 16 }}>
        All Unit Prices (Auto-calculated)
      </h4>
      <Table
        className="
          [&_.ant-table-thead_th]:bg-amber-100
          [&_.ant-table-thead_th]:text-amber-800
          [&_.ant-table-thead_th]:font-semibold
          [&_.ant-table-tbody_td]:text-amber-800
        "
        rowKey="id"
        columns={columns}
        dataSource={[
          {
            id: "base",
            unitName: selectedItem.baseUnit,
            multiplier: 1,
            isDisplayUnit: false,
          },
          ...itemUnits,
        ]}
        pagination={false}
      />
    </Card>
  );
}
