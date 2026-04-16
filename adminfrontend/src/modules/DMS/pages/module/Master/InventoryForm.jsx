import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Card,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  ReloadOutlined,
  SaveOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
// import {
//   getAllVendor,
//   getproductbyVendor,
//   getAllInventory,
//   addInventory,
//   getInventoryById,
//   updateInventory,
// } from "../../../../../api/inventory";

import {
  getproductbyVendor,
  getAllInventory,
  addInventory,
  getInventoryById,
  updateInventory,
  getAllVendor,
} from "../../../../../api/masterinventory";
import {
  createInventoryDraft,
  saveInventoryDraft,
  loadInventoryDraft,
  deleteInventoryDraft,
  deserialiseInventoryDraft,
  getAllInventoryDrafts,
} from "../../../../../utils/inventoryDraftUtils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Option } = Select;

export default function InventoryForm() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [vendorList, setVendorList] = useState([]);
  const [productList, setProductList] = useState([]);

  // Draft state
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [draftTableKey, setDraftTableKey] = useState(0);
  const autosaveTimer = useRef(null);

  useEffect(() => {
    fetchVendors();
    fetchInventory();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const fetchInventory = async () => {
    try {
      const res = await getAllInventory();
      const formattedData = (res || []).map((item) => ({
        key: item.id,
        vendorName: item.vendor_name,
        productName: item.product_name,
        productType: item.product_type,
        totalStock: item.current_stock,
        minStockBalance: item.minimum_stock_balance,
      }));
      setData(formattedData);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await getAllVendor();
      setVendorList(res);
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- HANDLERS ---------------- */
  const handleVendorChange = async (vendorId, form) => {
    form.setFieldsValue({
      product: undefined,
      productGroup: "",
      productType: "",
      hsnCode: "",
      mrp: null,
      totalStock: null,
    });
    const res = await getproductbyVendor(vendorId);
    setProductList(res?.products || []);
  };

  const handleProductChange = (productId, form) => {
    const selectedProduct = productList.find((item) => item.id === productId);
    if (selectedProduct) {
      form.setFieldsValue({
        productGroup: selectedProduct.product_group_name,
        productType: selectedProduct.product_type,
        hsnCode: selectedProduct.hsn_code_value,
        totalStock: selectedProduct.current_stock,
        mrp: selectedProduct.mrp,
      });
    }
  };

  const handleAdd = async (values) => {
    try {
      const payload = {
        vendor: values.vendor,
        product: values.product,
        product_group_name: values.productGroup,
        product_type: values.productType,
        hsn_code: values.hsnCode,
        mrp: values.mrp,
        current_stock: values.totalStock
          ? Number(values.totalStock).toFixed(2)
          : 0,
        minimum_stock_balance: values.minStockBalance,
      };
      await addInventory(payload);
      setAddOpen(false);
      addForm.resetFields();
      fetchInventory();

      // Delete draft on successful save
      if (activeDraftId) {
        discardActiveDraft();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (values) => {
    try {
      const payload = {
        vendor: values.vendor,
        product: values.product,
        product_group_name: values.productGroup,
        product_type: values.productType,
        hsn_code: values.hsnCode,
        mrp: values.mrp,
        current_stock: values.totalStock
          ? Number(values.totalStock).toFixed(2)
          : 0,
        minimum_stock_balance: values.minStockBalance,
      };
      await updateInventory(selectedRow.id, payload);
      setEditOpen(false);
      fetchInventory();
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewClick = async (id) => {
    try {
      const res = await getInventoryById(id);
      setSelectedRow(res);

      viewForm.setFieldsValue({
        vendor: res.vendor,
        product: res.product,
        productGroup: res.product_group_name,
        productType: res.product_type,
        hsnCode: res.hsn_code,
        mrp: res.mrp || null,
        totalStock: res.current_stock,
        minStockBalance: res.minimum_stock_balance,
      });

      setViewOpen(true);
    } catch (error) {
      console.log(error);
    }
  };
  const handleEditClick = async (id) => {
    try {
      const res = await getInventoryById(id);
      setSelectedRow(res);
      const productRes = await getproductbyVendor(res.vendor);
      const products = productRes?.products || [];
      setProductList(products);
      editForm.setFieldsValue({
        vendor: res.vendor,
        product: res.product, // This ID must exist in the products array
        productGroup: res.product_group_name,
        productType: res.product_type,
        hsnCode: res.hsn_code,
        mrp: res.mrp,
        totalStock: res.current_stock,
        minStockBalance: res.minimum_stock_balance,
      });

      setEditOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getFilteredData = () => {
    if (!searchText) return data;

    const value = searchText.toLowerCase();

    return data.filter((item) => {
      return Object.values(item).some((val) => {
        if (!val) return false;
        return JSON.stringify(val).toLowerCase().includes(value);
      });
    });
  };

  const handleReset = () => {
    setSearchText("");
  };

  // ================= DRAFT FUNCTIONALITY =================
  const handleFormValuesChange = useCallback(
    (changedValues, allValues) => {
      if (addOpen) {
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

        autosaveTimer.current = setTimeout(() => {
          const meta = {
            vendorName: vendorList.find((v) => v.id === allValues.vendor)?.name,
            productName: productList.find((p) => p.id === allValues.product)
              ?.name,
            productType: allValues.productType,
          };

          setActiveDraftId((prevId) => {
            const id = prevId || createInventoryDraft(allValues, meta);
            saveInventoryDraft(id, allValues, meta);
            setDraftSavedAt(new Date());
            setDraftTableKey((k) => k + 1);
            return id;
          });
        }, 1500);
      }
    },
    [addOpen, vendorList, productList],
  );

  const handleManualSave = () => {
    if (!addOpen) return;

    const values = addForm.getFieldsValue(true);
    const meta = {
      vendorName: vendorList.find((v) => v.id === values.vendor)?.name,
      productName: productList.find((p) => p.id === values.product)?.name,
      productType: values.productType,
    };

    setActiveDraftId((prevId) => {
      const id = prevId || createInventoryDraft(values, meta);
      saveInventoryDraft(id, values, meta);
      setDraftSavedAt(new Date());
      setDraftTableKey((k) => k + 1);
      message.success("Draft saved");
      return id;
    });
  };

  const handleContinueDraft = (draftId) => {
    const draft = loadInventoryDraft(draftId);
    if (!draft) {
      message.error("Draft not found");
      return;
    }

    const restored = deserialiseInventoryDraft(draft.values);
    addForm.setFieldsValue(restored);
    setActiveDraftId(draftId);
    setDraftSavedAt(new Date(draft.savedAt));

    // Load products for the vendor
    if (restored.vendor) {
      handleVendorChange(restored.vendor, addForm);
    }

    setAddOpen(true);
  };

  const discardActiveDraft = () => {
    if (activeDraftId) {
      deleteInventoryDraft(activeDraftId);
      setActiveDraftId(null);
      setDraftSavedAt(null);
      setDraftTableKey((k) => k + 1);
    }
  };

  const filteredData = getFilteredData();

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Vendor Name</span>,
      dataIndex: "vendorName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Product Name</span>,
      dataIndex: "productName",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Product Type</span>,
      dataIndex: "productType",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Stock</span>,
      dataIndex: "totalStock",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Min Stock</span>,
      dataIndex: "minStockBalance",
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (_, record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-red-500! hover:text-red-600!"
            onClick={() => handleViewClick(record.key)}
          />
          <EditOutlined
            className="cursor-pointer! text-blue-500! hover:text-blue-600!"
            onClick={() => handleEditClick(record.key)}
          />
        </div>
      ),
    },
  ];

  // Draft Table Component
  function InventoryDraftTable({ refreshKey, onContinue, onDelete }) {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
      setDrafts(getAllInventoryDrafts());
    }, [refreshKey]);

    if (!drafts.length) return null;

    const handleDelete = (id) => {
      deleteInventoryDraft(id);
      onDelete?.();
      setDrafts(getAllInventoryDrafts());
    };

    const columns = [
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">
            Vendor Name
          </span>
        ),
        dataIndex: "vendorName",
        render: (t) => <span className="text-amber-800 font-medium">{t}</span>,
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">
            Product Name
          </span>
        ),
        dataIndex: "productName",
        render: (t) => <span className="text-amber-700 text-sm">{t}</span>,
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">
            Product Type
          </span>
        ),
        dataIndex: "productType",
        render: (t) => <span className="text-amber-700 text-sm">{t}</span>,
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">
            Last Saved
          </span>
        ),
        dataIndex: "savedAt",
        render: (v) => (
          <Tag
            icon={<ClockCircleOutlined />}
            color="gold"
            className="text-xs font-normal"
          >
            {v ? dayjs(v).fromNow() : "Not saved"}
          </Tag>
        ),
      },
      {
        title: (
          <span className="text-amber-700 font-semibold text-xs">Actions</span>
        ),
        render: (_, record) => (
          <div className="flex gap-2">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              className="bg-amber-500! hover:bg-amber-600! border-none! text-xs!"
              onClick={() => onContinue(record.id)}
            >
              Continue
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="text-xs!"
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="border border-amber-200 rounded-lg p-4 bg-white shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileTextOutlined className="text-amber-500 text-lg" />
          <h2 className="text-base font-semibold text-amber-700 m-0">
            Saved Drafts
          </h2>
          <Tag color="gold" className="ml-1">
            {drafts.length}
          </Tag>
        </div>
        <Table
          columns={columns}
          dataSource={drafts}
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          rowClassName="hover:bg-amber-50"
        />
      </div>
    );
  }

  /* ---------------- COMMON FORM FIELDS ---------------- */
  const InventoryFields = ({
    form,
    disabled = false,
    disableVendor = false,
    disableProduct = false,
  }) => (
    <Row gutter={16}>
      <Col span={6}>
        <Form.Item
          label="Vendor Name"
          name="vendor"
          rules={[{ required: !disabled }]}
        >
          <Select
            placeholder="Select Vendor"
            onChange={(value) => handleVendorChange(value, form)}
            disabled={disabled || disableVendor}
          >
            {vendorList.map((vendor) => (
              <Option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Product Name"
          name="product"
          rules={[{ required: !disabled }]}
        >
          <Select
            placeholder="Select Product"
            onChange={(value) => handleProductChange(value, form)}
            disabled={disabled || disableProduct}
          >
            {productList.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Product Group" name="productGroup">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Product Type" name="productType">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="HSN Code" name="hsnCode">
          <Input disabled />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item label="Total Stock Available" name="totalStock">
          <InputNumber disabled className="w-full!" />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="MRP"
          name="mrp"
          rules={[
            { required: true, message: "MRP is required" },
            {
              validator: (_, value) => {
                if (value === undefined || value === null) {
                  return Promise.resolve();
                }
                if (isNaN(value)) {
                  return Promise.reject("Only numbers are allowed");
                }
                if (value <= 0) {
                  return Promise.reject("MRP must be greater than 0");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input disabled={disabled} className="w-full!" />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Minimum Stock Balance"
          name="minStockBalance"
          rules={[
            { required: true, message: "Minimum Stock Balance is required" },
            {
              validator: (_, value) => {
                if (value === undefined || value === null) {
                  return Promise.resolve();
                }
                if (isNaN(value)) {
                  return Promise.reject("Only numbers are allowed");
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <Input disabled={disabled} className="w-full!" />
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search inventory..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddOpen(true)}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add New
        </Button>
      </div>

      {/* Draft Table */}
      <InventoryDraftTable
        refreshKey={draftTableKey}
        onContinue={handleContinueDraft}
        onDelete={() => setDraftTableKey((k) => k + 1)}
      />

      {/* ---------------- TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-4 bg-white shadow-md">
        <Table columns={columns} dataSource={filteredData} rowKey="key" />
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <span className="text-amber-700 text-xl font-semibold">
              Add Inventory
            </span>

            {/* Draft indicator */}
            <div className="flex items-center gap-2 ml-2">
              {activeDraftId ? (
                <Tag
                  color="gold"
                  icon={<SaveOutlined />}
                  className="cursor-default select-none"
                >
                  Draft saved
                </Tag>
              ) : (
                <Tag
                  color="default"
                  className="cursor-default select-none text-xs"
                >
                  Not saved yet
                </Tag>
              )}

              {/* Manual save button */}
              <Button
                size="small"
                icon={<SaveOutlined />}
                className="border-amber-400! text-amber-700! hover:bg-amber-100! text-xs!"
                onClick={handleManualSave}
              >
                Save Draft
              </Button>
            </div>
          </div>
        }
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAdd}
          onValuesChange={handleFormValuesChange}
        >
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Inventory Details</h6>
            <InventoryFields form={addForm} />
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              className="bg-amber-500! border-none! text-white"
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------------- VIEW MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            View Inventory
          </span>
        }
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          <Card bordered className="border-amber-300 bg-amber-50">
            <h6 className="text-amber-600 mb-3">Inventory Details</h6>
            <InventoryFields form={viewForm} disabled />
          </Card>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Edit Inventory
          </span>
        }
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Inventory Details</h6>
            <InventoryFields form={editForm} disableVendor disableProduct />
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              className="bg-amber-500! border-none! text-white"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
