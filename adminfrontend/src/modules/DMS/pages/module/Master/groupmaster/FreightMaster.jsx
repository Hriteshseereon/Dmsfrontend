import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Card,
  Popconfirm,
  message,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  getAllFreightRates,
  addFreightRate,
  updateFreightRate,
  deleteFreightRate,
} from "../../../../../../api/freightmaster";

import {
  getCountryOptions,
  getStateOptions,
  getDistrictOptions,
  getCityOptions,
} from "../../../../../../utils/locationHelper";

export default function FreightMaster() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Cascading location states
  const [selCountryIso, setSelCountryIso] = useState("IN");
  const [selState, setSelState] = useState("Odisha");
  const [selDispatchDistrict, setSelDispatchDistrict] = useState(null);
  const [selDeliveryDistrict, setSelDeliveryDistrict] = useState(null);

  const handleCountryChange = (isoCode) => {
    setSelCountryIso(isoCode);
    setSelState(null);
    setSelDispatchDistrict(null);
    setSelDeliveryDistrict(null);
    addForm.setFieldsValue({
      state: undefined,
      dispatch_district: undefined,
      dispatch_from: undefined,
      delivery_district: undefined,
      city: undefined,
    });
  };

  const handleStateChange = (isoCode, option) => {
    setSelState(option.label);
    setSelDispatchDistrict(null);
    setSelDeliveryDistrict(null);
    addForm.setFieldsValue({
      dispatch_district: undefined,
      dispatch_from: undefined,
      delivery_district: undefined,
      city: undefined,
    });
  };

  const handleDispatchDistrictChange = (val) => {
    setSelDispatchDistrict(val);
    addForm.setFieldsValue({
      dispatch_from: undefined,
    });
  };

  const handleDeliveryDistrictChange = (val) => {
    setSelDeliveryDistrict(val);
    addForm.setFieldsValue({
      city: undefined,
    });
  };

  const fetchFreightRates = async () => {
    try {
      setLoading(true);
      const res = await getAllFreightRates();
      const list = Array.isArray(res) ? res : res?.data || [];
      setData(list);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch freight rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreightRates();
  }, []);

  const handleAddFinish = async (values) => {
    try {
      await addFreightRate({
        location: values.city,
        dispatch_from: values.dispatch_from,
        freight_rate_per_mt: Number(values.freight_rate_per_mt),
      });
      message.success("Freight rate added successfully");
      setAddOpen(false);
      addForm.resetFields();
      setSelCountryIso("IN");
      setSelState("Odisha");
      setSelDispatchDistrict(null);
      setSelDeliveryDistrict(null);
      fetchFreightRates();
    } catch (err) {
      console.error(err);
      message.error("Failed to add freight rate");
    }
  };

  const handleEditFinish = async (values) => {
    try {
      await updateFreightRate(selectedRow.id, {
        dispatch_from: values.dispatch_from,
        freight_rate_per_mt: Number(values.freight_rate_per_mt),
      });
      message.success("Freight rate updated successfully");
      setEditOpen(false);
      editForm.resetFields();
      fetchFreightRates();
    } catch (err) {
      console.error(err);
      message.error("Failed to update freight rate");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFreightRate(id);
      message.success("Freight rate deleted successfully");
      fetchFreightRates();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete freight rate");
    }
  };

  const handleViewClick = (record) => {
    setSelectedRow(record);
    viewForm.setFieldsValue({
      location: record.location,
      dispatch_from: record.dispatch_from,
      freight_rate_per_mt: record.freight_rate_per_mt,
    });
    setViewOpen(true);
  };

  const handleOpenEdit = (record) => {
    setSelectedRow(record);
    editForm.setFieldsValue({
      location: record.location,
      dispatch_from: record.dispatch_from,
      freight_rate_per_mt: record.freight_rate_per_mt,
    });
    setEditOpen(true);
  };

  const handleReset = () => {
    setSearchText("");
    fetchFreightRates();
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    return (
      item.location?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.dispatch_from?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">Dispatch From</span>
      ),
      dataIndex: "dispatch_from",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Location</span>,
      dataIndex: "location",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Freight Rate per MT
        </span>
      ),
      dataIndex: "freight_rate_per_mt",
      align: "center",
      render: (t) => (
        <span className="text-amber-800 font-medium">
          ₹ {Number(t || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <EyeOutlined
            className="cursor-pointer !text-red-500 hover:text-red-600"
            onClick={() => handleViewClick(record)}
          />
          <EditOutlined
            className="cursor-pointer !text-blue-500 hover:text-blue-600"
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this freight rate?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="cursor-pointer !text-gray-500 hover:text-gray-700" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search location..."
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
          onClick={() => {
            setAddOpen(true);

            addForm.setFieldsValue({
              country: "IN",
              state: "Odisha",
            });

            setSelCountryIso("IN");
            setSelState("Odisha");
            setSelDispatchDistrict(null);
            setSelDeliveryDistrict(null);
          }}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add New
        </Button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-3 bg-white shadow-md">
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ pageSize: 15 }}
          rowKey="id"
          size="small"
          className="[&_.ant-table-cell]:!px-2 [&_.ant-table-cell]:!py-1 [&_.ant-table-thead_th]:!py-1.5"
        />
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Add Freight Rate
          </span>
        }
        open={addOpen}
        onCancel={() => {
          setAddOpen(false);
          addForm.resetFields();
          setSelCountryIso("IN");
          setSelState("Odisha");
          setSelDispatchDistrict(null);
          setSelDeliveryDistrict(null);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddFinish}
          className="mt-4"
        >
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Freight Details</h6>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select country" }]}
              className="!mb-3"
            >
              <Select
                placeholder="Select country"
                showSearch
                optionFilterProp="label"
                options={getCountryOptions()}
                onChange={handleCountryChange}
              />
            </Form.Item>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "Please select state" }]}
              className="!mb-3"
            >
              <Select
                placeholder={
                  selCountryIso ? "Select state" : "Select country first"
                }
                showSearch
                optionFilterProp="label"
                disabled={!selCountryIso}
                options={getStateOptions(selCountryIso)}
                onChange={handleStateChange}
              />
            </Form.Item>
            <Form.Item
              name="dispatch_district"
              label="Dispatch From District"
              rules={[{ required: true, message: "Please select dispatch district" }]}
              className="!mb-3"
            >
              <Select
                placeholder={selState ? "Select dispatch district" : "Select state first"}
                showSearch
                optionFilterProp="label"
                disabled={!selState}
                options={getDistrictOptions(selState)}
                onChange={handleDispatchDistrictChange}
              />
            </Form.Item>
            <Form.Item
              name="dispatch_from"
              label="Dispatch From (City)"
              rules={[{ required: true, message: "Please select dispatch city" }]}
              className="!mb-3"
            >
              <Select
                placeholder={
                  selDispatchDistrict ? "Select dispatch city" : "Select dispatch district first"
                }
                showSearch
                optionFilterProp="label"
                disabled={!selDispatchDistrict}
                options={getCityOptions(selState, selDispatchDistrict)}
              />
            </Form.Item>

            <Form.Item
              name="district"
              label="Delivery District"
              rules={[{ required: true, message: "Please select delivery district" }]}
              className="!mb-3"
            >
              <Select
                placeholder={
                  selState ? "Select delivery district" : "Select state first"
                }
                showSearch
                optionFilterProp="label"
                disabled={!selState}
                options={getDistrictOptions(selState)}
                onChange={handleDeliveryDistrictChange}
              />
            </Form.Item>
            <Form.Item
              name="city"
              label="Delivered To (City)"
              rules={[{ required: true, message: "Please select city" }]}
              className="!mb-3"
            >
              <Select
                placeholder={
                  selDeliveryDistrict ? "Select city" : "Select delivery district first"
                }
                showSearch
                optionFilterProp="label"
                disabled={!selDeliveryDistrict}
                options={getCityOptions(selState, selDeliveryDistrict)}
              />
            </Form.Item>
            <Form.Item
              name="freight_rate_per_mt"
              label="Freight Rate per MT (₹)"
              rules={[{ required: true, message: "Please input rate!" }]}
              className="!mb-3"
            >
              <InputNumber
                className="w-full"
                min={0}
                precision={2}
                placeholder="Enter rate per metric ton"
              />
            </Form.Item>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setAddOpen(false);
                addForm.resetFields();
                setSelCountryIso("IN");
                setSelState("Odisha");
                setSelDispatchDistrict(null);
                setSelDeliveryDistrict(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
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
            View Freight Rate
          </span>
        }
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={viewForm} layout="vertical" className="mt-4">
          <Card bordered className="border-amber-300 bg-amber-50">
            <h6 className="text-amber-600 mb-3">Freight Details</h6>
            <Form.Item name="location" label="Location" className="!mb-3">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="dispatch_from"
              label="Dispatch From"
              className="!mb-3"
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="freight_rate_per_mt"
              label="Freight Rate per MT (₹)"
              className="!mb-3"
            >
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      {/* ---------------- EDIT MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Edit Freight Rate
          </span>
        }
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFinish}
          className="mt-4"
        >
          <Card bordered className="border-amber-300">
            <h6 className="text-amber-500 mb-3">Freight Details</h6>
            <Form.Item name="location" label="Location" className="!mb-3">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="dispatch_from"
              label="Dispatch From"
              className="!mb-3"
            >
              <Input placeholder="Enter dispatch from location" />
            </Form.Item>
            <Form.Item
              name="freight_rate_per_mt"
              label="Freight Rate per MT (₹)"
              rules={[{ required: true, message: "Please input rate!" }]}
              className="!mb-3"
            >
              <InputNumber
                className="w-full"
                min={0}
                precision={2}
                placeholder="Enter rate per metric ton"
              />
            </Form.Item>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setEditOpen(false);
                editForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
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
