import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  message,
  Space,
  Tooltip,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  FileExcelOutlined,
  EditOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getVehiclePlacements,
  updateVehiclePlacement,
  getAllTransport,
  updatePurchaseSalesContractOrder,
} from "../../../../../api/purchase";
import {
  getAllVehicles,
  getAllDrivers,
} from "../../../../../api/vehiclemaster";
import { getSalesContractById } from "../../../../../api/sales";

const parseApiDate = (value) => {
  if (!value) return null;

  let d = dayjs(value, "DD-MM-YYYY", true);
  if (d.isValid()) return d;

  d = dayjs(value, "DD-MM-YYYY HH:mm:ss", true);
  if (d.isValid()) return d;

  d = dayjs(value, "YYYY-MM-DD", true);
  if (d.isValid()) return d;

  d = dayjs(value);
  return d.isValid() ? d : null;
};

const fmtDate = (d) => {
  const parsed = parseApiDate(d);
  return parsed ? parsed.format("DD-MM-YYYY") : "-";
};

export default function VehiclePlacements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Lookups data
  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm] = Form.useForm();

  // Photo uploads
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [file4, setFile4] = useState(null);

  // Released contract IDs
  const [releasedContractIds, setReleasedContractIds] = useState(new Set());

  // Bulk Selection and Contract View States
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);

  const fetchLookups = async () => {
    try {
      const [transRes, vehicleRes, driverRes] = await Promise.all([
        getAllTransport(),
        getAllVehicles(),
        getAllDrivers(),
      ]);
      setTransporters(
        Array.isArray(transRes) ? transRes : transRes?.data || [],
      );
      setVehicles(
        Array.isArray(vehicleRes) ? vehicleRes : vehicleRes?.data || [],
      );
      setDrivers(Array.isArray(driverRes) ? driverRes : driverRes?.data || []);
    } catch (err) {
      console.error("Failed to load lookups:", err);
    }
  };

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await getVehiclePlacements();
      const list = Array.isArray(res) ? res : res?.data || [];
      setData(list);
    } catch (err) {
      console.error(err);
      message.error("Failed to load vehicle placements data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchPlacements();
  }, []);

  const handleOpenEdit = (record) => {
    setIsBulkEdit(false);
    setEditingRecord(record);
    editForm.setFieldsValue({
      transporter: record.transporter || undefined,
      vehicle: record.vehicle || undefined,
      driver: record.driver || undefined,
      passing_weight: record.passing_weight || null,
      min_guarantee_weight: record.min_guarantee_weight || null,
    });
    setFile1(null);
    setFile2(null);
    setFile3(null);
    setFile4(null);
    setIsEditModalOpen(true);
  };

  const handleOpenBulkEdit = () => {
    setIsBulkEdit(true);
    setEditingRecord(null);
    const firstSelected = data.find((item) => item.id === selectedRowKeys[0]);
    if (firstSelected) {
      editForm.setFieldsValue({
        transporter: firstSelected.transporter || undefined,
        vehicle: firstSelected.vehicle || undefined,
        driver: firstSelected.driver || undefined,
        passing_weight: firstSelected.passing_weight || null,
        min_guarantee_weight: firstSelected.min_guarantee_weight || null,
      });
    } else {
      editForm.resetFields();
    }
    setFile1(null);
    setFile2(null);
    setFile3(null);
    setFile4(null);
    setIsEditModalOpen(true);
  };

  const handleOpenContractView = async (record) => {
    const contractId = record.sale_contract;
    if (!contractId) {
      message.warning("No sales contract associated with this placement.");
      return;
    }
    try {
      message.loading({
        content: "Loading sales contract details...",
        key: "load_contract",
      });
      const res = await getSalesContractById(contractId);
      setContractDetails(res);
      setIsContractModalOpen(true);
      message.destroy("load_contract");
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to load contract details",
        key: "load_contract",
      });
    }
  };

  const handleEditFinish = async (values) => {
    try {
      setSubmitting(true);
      const targetIds = isBulkEdit ? selectedRowKeys : [editingRecord.id];
      message.loading({
        content: `Updating ${targetIds.length} placement(s)...`,
        key: "update_placement",
      });

      await Promise.all(
        targetIds.map(async (id) => {
          const formData = new FormData();
          if (values.transporter) {
            formData.append("transporter", values.transporter);
          }
          if (values.vehicle) {
            formData.append("vehicle", values.vehicle);
          }
          if (values.driver) {
            formData.append("driver", values.driver);
          }
          if (
            values.passing_weight !== undefined &&
            values.passing_weight !== null
          ) {
            formData.append("passing_weight", values.passing_weight);
          }
          if (
            values.min_guarantee_weight !== undefined &&
            values.min_guarantee_weight !== null
          ) {
            formData.append(
              "min_guarantee_weight",
              values.min_guarantee_weight,
            );
          }
          if (file1) formData.append("photo_1", file1);
          if (file2) formData.append("photo_2", file2);
          if (file3) formData.append("photo_3", file3);
          if (file4) formData.append("photo_4", file4);

          return updateVehiclePlacement(id, formData);
        }),
      );

      message.success({
        content: "Placements updated successfully!",
        key: "update_placement",
      });
      setIsEditModalOpen(false);
      setSelectedRowKeys([]);
      fetchPlacements();
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to update placement details",
        key: "update_placement",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseContract = async (record) => {
    // 1. Get all active placements for this PO in memory (not including released ones)
    const activeRelatedRows = data.filter(
      (item) =>
        item.purchase_order === record.purchase_order &&
        !releasedContractIds.has(item.id),
    );

    if (activeRelatedRows.length <= 1) {
      message.warning(
        "At least one sale contract is required. You cannot release the last contract of a purchase order.",
      );
      return;
    }

    try {
      message.loading({
        content: "Releasing contract...",
        key: "release_contract",
      });

      // 2. Extract UUIDs of all contract items for this PO except the one being released
      const updatedContractIds = activeRelatedRows
        .filter((item) => item.id !== record.id)
        .map((item) => item.sale_contract)
        .filter(Boolean);

      // 3. Patch the PO using existing api
      await updatePurchaseSalesContractOrder(record.purchase_order, {
        sale_contracts: updatedContractIds,
      });

      // 4. Track released state locally
      setReleasedContractIds((prev) => {
        const next = new Set(prev);
        next.add(record.id);
        return next;
      });

      message.success({
        content: "Contract released successfully!",
        key: "release_contract",
      });
      fetchPlacements();
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to release contract",
        key: "release_contract",
      });
    }
  };

  const handleExport = () => {
    exportToExcel(filteredData, columns, "Vehicle_Placements");
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const lower = searchText.toLowerCase();
    return (
      item.purchase_order_number?.toLowerCase().includes(lower) ||
      item.sale_contract_number?.toLowerCase().includes(lower) ||
      item.customer_name?.toLowerCase().includes(lower) ||
      item.plant_name?.toLowerCase().includes(lower) ||
      item.place?.toLowerCase().includes(lower)
    );
  });

  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">Purchase Order No.</span>
      ),
      dataIndex: "purchase_order_number",
      width: 110,
      render: (t) => (
        <span className="text-amber-800 font-medium">{t || "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Purchase Order Date
        </span>
      ),
      dataIndex: "purchase_order_date",
      width: 90,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Sale Contract No.</span>
      ),
      dataIndex: "sale_contract_number",
      width: 110,
      render: (t, record) => (
        <span
          className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-200 cursor-pointer block text-center hover:bg-blue-100"
          onDoubleClick={() => handleOpenContractView(record)}
          title="Double click to view contract"
        >
          {t || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Sale Contract Date</span>
      ),
      dataIndex: "sale_contract_date",
      width: 90,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plant_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Customer Name</span>
      ),
      dataIndex: "customer_name",
      width: 120,
      ellipsis: true,
      render: (t) => (
        <span className="text-amber-800" title={t}>
          {t || "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Place</span>,
      dataIndex: "place",
      width: 90,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Broker Name</span>,
      dataIndex: "broker_name",
      width: 90,
      render: (t) => <span className="text-amber-800">{t || "DIRECT"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">QTY</span>,
      dataIndex: "qty",
      width: 60,
      render: (t) => (
        <span className="text-amber-800 font-semibold">{t || "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Gross Weight(Ton)
          <br />
          Loading Plan
        </span>
      ),
      dataIndex: "gross_weight_ton",
      width: 90,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Transport Name</span>
      ),
      dataIndex: "transporter",
      width: 120,
      render: (t, record) => {
        const trans = transporters.find((x) => x.id === t);
        return (
          <span className="text-amber-800">
            {trans ? trans.registered_name || trans.name : "-"}
          </span>
        );
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Vehicle Details</span>
      ),
      dataIndex: "vehicle",
      width: 100,
      render: (t) => {
        const veh = vehicles.find((x) => x.id === t);
        return (
          <span className="text-amber-800">
            {veh ? veh.vehicle_number : "-"}
          </span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Driver Name</span>,
      dataIndex: "driver",
      width: 100,
      render: (t) => {
        const drv = drivers.find((x) => x.id === t);
        return (
          <span className="text-amber-800">{drv ? drv.driver_name : "-"}</span>
        );
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Passing Weight</span>
      ),
      dataIndex: "passing_weight",
      width: 80,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Min Guarantee</span>
      ),
      dataIndex: "min_guarantee_weight",
      width: 110,
      render: (t) => (
        <span className="text-amber-800 font-medium">{t || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Documents</span>,
      width: 90,
      render: (_, record) => {
        const docs = [];
        if (record.photo_1) docs.push({ name: "Doc 1", url: record.photo_1 });
        if (record.photo_2) docs.push({ name: "Doc 2", url: record.photo_2 });
        if (record.photo_3) docs.push({ name: "Doc 3", url: record.photo_3 });
        if (record.photo_4) docs.push({ name: "Doc 4", url: record.photo_4 });
        if (docs.length === 0) return <span className="text-gray-400">-</span>;
        return (
          <Space size="small">
            {docs.map((d, idx) => (
              <a
                key={idx}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline font-medium text-xs"
              >
                {d.name}
              </a>
            ))}
          </Space>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 150,
      render: (_, record) => {
        const isReleased = releasedContractIds.has(record.id);
        return (
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              disabled={isReleased}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none text-xs"
            >
              Edit
            </Button>
            <Button
              danger
              size="small"
              icon={<SafetyOutlined />}
              onClick={() => handleReleaseContract(record)}
              disabled={isReleased}
              className="text-xs"
            >
              {isReleased ? "Released" : "Release"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-full overflow-hidden">
      {/* Banner */}
      {/* <div className="bg-amber-500 text-white font-bold text-xl py-3.5 px-4 rounded-t-lg text-center uppercase tracking-wider shadow-sm mb-4">
        Vehicle Placement
      </div> */}

      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 w-96">
          <Input
            prefix={<SearchOutlined className="text-amber-600" />}
            placeholder="Search by PO No, Contract No, Customer, Plant..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="border-amber-300 hover:border-amber-400 focus:border-amber-500 rounded"
          />
        </div>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenBulkEdit}
            disabled={selectedRowKeys.length === 0}
            className="!bg-amber-500 !hover:bg-amber-600 !border-none rounded font-medium"
          >
            Bulk Edit ({selectedRowKeys.length})
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExport}
            className="!bg-green-600 !hover:bg-green-700 !border-none rounded font-medium"
          >
            Export to Excel
          </Button>
          <Tooltip title="Reload placement records">
            <Button
              icon={<SyncOutlined spin={loading} />}
              onClick={fetchPlacements}
              className="border-amber-300 hover:border-amber-400 text-amber-700 rounded"
            />
          </Tooltip>
        </Space>
      </div>

      {/* Placement Table */}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
          getCheckboxProps: (record) => ({
            disabled: releasedContractIds.has(record.id),
          }),
        }}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={false}
        scroll={{ y: "calc(100vh - 250px)" }}
        rowKey="id"
        size="small"
        rowClassName={(record) => {
          if (releasedContractIds.has(record.id)) {
            return "!bg-green-50";
          }
          return "";
        }}
        className="[&_.ant-table-cell]:!px-1.5 [&_.ant-table-cell]:!py-1 [&_.ant-table-thead_th]:!py-1.5 border border-gray-100 rounded-b-lg shadow-sm"
      />

      {/* Edit placement details modal */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Update Vehicle Placement
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFinish}
          className="mt-4"
        >
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="transporter"
                label="Transporter Name"
                className="!mb-3"
              >
                <Select
                  placeholder="Select Transporter"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {transporters.map((t) => (
                    <Select.Option
                      key={t.id}
                      value={t.id}
                      label={t.registered_name || t.name}
                    >
                      {t.registered_name || t.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vehicle"
                label="Vehicle Number"
                className="!mb-3"
              >
                <Select
                  placeholder="Select Vehicle"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {vehicles.map((v) => (
                    <Select.Option
                      key={v.id}
                      value={v.id}
                      label={v.vehicle_number}
                    >
                      {v.vehicle_number} ({v.vehicle_type || "Truck"})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="driver" label="Driver Name" className="!mb-3">
                <Select
                  placeholder="Select Driver"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {drivers.map((d) => (
                    <Select.Option
                      key={d.id}
                      value={d.id}
                      label={d.driver_name}
                    >
                      {d.driver_name} ({d.driver_mobile || "-"})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="passing_weight"
                label="Passing Weight (Ton)"
                className="!mb-3"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={3}
                  placeholder="Weight"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="min_guarantee_weight"
                label="Min Guarantee (Ton)"
                className="!mb-3"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={3}
                  placeholder="Guarantee"
                />
              </Form.Item>
            </Col>
          </Row>

          <Card
            size="small"
            title="Upload Documents / Photos"
            className="mb-4 mt-2 border-amber-200"
          >
            <Row gutter={8}>
              <Col span={12} className="mb-2">
                <div className="text-xs text-gray-500 mb-1">
                  Loading Photo 1
                </div>
                <input
                  type="file"
                  onChange={(e) => setFile1(e.target.files[0])}
                  accept="image/*"
                  className="text-xs"
                />
              </Col>
              <Col span={12} className="mb-2">
                <div className="text-xs text-gray-500 mb-1">
                  Loading Photo 2
                </div>
                <input
                  type="file"
                  onChange={(e) => setFile2(e.target.files[0])}
                  accept="image/*"
                  className="text-xs"
                />
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-500 mb-1">
                  Loading Photo 3
                </div>
                <input
                  type="file"
                  onChange={(e) => setFile3(e.target.files[0])}
                  accept="image/*"
                  className="text-xs"
                />
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-500 mb-1">
                  Loading Photo 4
                </div>
                <input
                  type="file"
                  onChange={(e) => setFile4(e.target.files[0])}
                  accept="image/*"
                  className="text-xs"
                />
              </Col>
            </Row>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            >
              Save Placement Details
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Read-Only Sales Contract Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Sales Contract ({contractDetails?.sale_contract_number || "-"})
          </span>
        }
        open={isContractModalOpen}
        onCancel={() => {
          setIsContractModalOpen(false);
          setContractDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsContractModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={1000}
      >
        {contractDetails ? (
          <div className="mt-4">
            <Card
              size="small"
              title="Basic Information"
              className="mb-4 border-amber-200"
              headStyle={{ backgroundColor: "#FEF3C7", color: "#B45309" }}
            >
              <Row gutter={12}>
                <Col span={8} className="mb-2">
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Customer Name
                  </div>
                  <Input
                    value={contractDetails.customer_name || "-"}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={8} className="mb-2">
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Plant Name
                  </div>
                  <Input
                    value={contractDetails.plant_name || "-"}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={8} className="mb-2">
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Broker Name
                  </div>
                  <Input
                    value={contractDetails.broker_name || "DIRECT"}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Passing Weight (Ton)
                  </div>
                  <Input
                    value={contractDetails.contrat_gross_weight || "Loose"}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Contract Date
                  </div>
                  <Input
                    value={fmtDate(contractDetails.created_date)}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Valid From
                  </div>
                  <Input
                    value={fmtDate(contractDetails.from_date)}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold mb-1">
                    Valid To
                  </div>
                  <Input
                    value={fmtDate(contractDetails.to_date)}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
              </Row>
            </Card>

            <Card
              size="small"
              title="Contract Items"
              className="mb-4 border-amber-200"
              headStyle={{ backgroundColor: "#FEF3C7", color: "#B45309" }}
            >
              <Table
                columns={[
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        Product Name
                      </span>
                    ),
                    dataIndex: ["product", "product_name"],
                    render: (t) => <span className="text-amber-800">{t || "-"}</span>,
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        Company Group
                      </span>
                    ),
                    dataIndex: "company_group_name",
                    render: (t) => <span className="text-amber-800">{t || "-"}</span>,
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        HSN Code
                      </span>
                    ),
                    dataIndex: "hsn_code",
                    render: (t) => <span className="text-amber-800">{t || "-"}</span>,
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">UOM</span>
                    ),
                    dataIndex: ["uom", "unit_name"],
                    render: (t) => <span className="text-amber-800">{t || "-"}</span>,
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">Qty</span>
                    ),
                    dataIndex: "net_qty",
                    align: "right",
                    render: (t) => (
                      <span className="text-amber-800 font-semibold">
                        {t || 0}
                      </span>
                    ),
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        Free Qty
                      </span>
                    ),
                    dataIndex: "free_qty",
                    align: "right",
                    render: (t) => <span className="text-amber-800">{t || 0}</span>,
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        Contract Rate (₹)
                      </span>
                    ),
                    dataIndex: "contract_rate",
                    align: "right",
                    render: (t) => (
                      <span className="text-amber-800 font-semibold">
                        ₹{Number(t || 0).toFixed(2)}
                      </span>
                    ),
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        MRP (₹)
                      </span>
                    ),
                    dataIndex: "mrp",
                    align: "right",
                    render: (t) => (
                      <span className="text-amber-800">
                        ₹{Number(t || 0).toFixed(2)}
                      </span>
                    ),
                  },
                ]}
                dataSource={contractDetails.items || []}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table-cell]:!px-2 [&_.ant-table-cell]:!py-1 border border-gray-100 rounded shadow-sm"
              />
            </Card>

            <Card
              size="small"
              title="Tax & Totals"
              className="border-amber-200"
              headStyle={{ backgroundColor: "#FEF3C7", color: "#B45309" }}
            >
              <Row gutter={12}>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold">
                    SGST (%)
                  </div>
                  <Input
                    value={`${contractDetails.sgst || 0}%`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold">
                    CGST (%)
                  </div>
                  <Input
                    value={`${contractDetails.cgst || 0}%`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6}>
                  <div className="text-xs text-amber-700 font-semibold">
                    IGST (%)
                  </div>
                  <Input
                    value={`${contractDetails.igst || 0}%`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={6} className="mb-2">
                  <div className="text-xs text-amber-700 font-semibold">
                    TCS Amount
                  </div>
                  <Input
                    value={`₹${Number(contractDetails.tcs_amount || 0).toFixed(2)}`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={8}>
                  <div className="text-xs text-amber-700 font-semibold">
                    Total Amount (Before Tax)
                  </div>
                  <Input
                    value={`₹${Number(contractDetails.total_amount || 0).toFixed(2)}`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={8}>
                  <div className="text-xs text-amber-700 font-semibold">
                    Total GST Amount
                  </div>
                  <Input
                    value={`₹${Number(contractDetails.total_gst_amount || 0).toFixed(2)}`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
                <Col span={8}>
                  <div className="text-xs text-amber-700 font-semibold">
                    Grand Total (After Tax)
                  </div>
                  <Input
                    value={`₹${Number(contractDetails.grand_total || 0).toFixed(2)}`}
                    disabled
                    className="!text-gray-800"
                  />
                </Col>
              </Row>
            </Card>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
