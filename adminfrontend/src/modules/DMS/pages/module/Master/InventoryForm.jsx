import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
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
} from "../../../../../api/masterinventory";

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

  /* ---------------- TABLE ---------------- */
  const filteredData = data.filter((item) =>
    item?.vendorName?.toLowerCase()?.includes(searchText.toLowerCase()),
  );

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
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-500!" />}
            placeholder="Search..."
            className="w-64! border-amber-400!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined className="text-amber-800!" />}
            className="border-amber-400!"
          >
            <span className="text-amber-800!">Reset</span>
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

      {/* ---------------- TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-4 bg-white shadow-md">
        <Table columns={columns} dataSource={filteredData} rowKey="key" />
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Add Inventory
          </span>
        }
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        width={1000}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
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
