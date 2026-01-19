// DeliveryStatus.jsx
import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Checkbox,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Template orders (source of truth for available items per orderNo)
const deliveryStatusJSON = {
  records: [
    {
      key: 1,
      orderNo: "INV-PO-001",
      companyName: "ABC Traders",
      customer: "Tech World Pvt Ltd",
      items: [
        { lineKey: 1, itemName: "Laptop", itemCode: "ITM-LAP-001", quantity: 4, uom: "Nos", unitPrice: 10000, totalAmount: 4 * 10000 },
        { lineKey: 2, itemName: "Mouse", itemCode: "ITM-MOU-002", quantity: 10, uom: "Nos", unitPrice: 500, totalAmount: 10 * 500 },
        { lineKey: 3, itemName: "Keyboard", itemCode: "ITM-KEY-003", quantity: 6, uom: "Nos", unitPrice: 750, totalAmount: 6 * 750 },
      ],
      dispatchDate: "2025-10-10",
      deliveryDatePlanned: "2025-10-13",
      deliveredDate: "2025-10-19",
      transporter: "ABC Logistics",
      vehicleNo: "OD-05-AB-1234",
      driverName: "Rajesh Kumar",
      phoneNo: "9876543210",
      route: "Bhubaneswar to Cuttack",
      status: "In-Transit",
      orderTotals: { totalQuantity: 4 + 10 + 6, totalAmount: 4 * 10000 + 10 * 500 + 6 * 750 },
    },
    {
      key: 2,
      orderNo: "INV-PO-002",
      companyName: "XYZ Ltd",
      customer: "Compute Store",
      items: [
        { lineKey: 1, itemName: "Desktop", itemCode: "ITM-DESK-001", quantity: 3, uom: "Nos", unitPrice: 8000, totalAmount: 3 * 8000 },
        { lineKey: 2, itemName: "Monitor", itemCode: "ITM-MON-002", quantity: 5, uom: "Nos", unitPrice: 4000, totalAmount: 5 * 4000 },
      ],
      dispatchDate: "2025-10-12",
      deliveryDatePlanned: "2025-10-15",
      deliveredDate: "2025-10-20",
      transporter: "XYZ Logistics",
      vehicleNo: "OD-06-XY-4567",
      driverName: "Suresh Patel",
      phoneNo: "9876543211",
      route: "Cuttack to Puri",
      status: "Delivered",
      orderTotals: { totalQuantity: 3 + 5, totalAmount: 3 * 8000 + 5 * 4000 },
    },
  ],
  uomOptions: ["Nos", "Ltr", "Kg", "Ton"],
  statusOptions: ["In-Transit", "Delivered", "Loading"],
  routeOptions: [
    "Bhubaneswar to Cuttack",
    "Cuttack to Puri",
    "Puri to Bhubaneswar",
    "Bhubaneswar to Rourkela",
  ],
};

export default function DeliveryStatus() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [editform] = Form.useForm();
  const [addForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  // main data state: existing delivery records (initial sample)
  const [data, setData] = useState([
    // existing delivery records can be seeded here or loaded from server/localStorage
    // sample duplicates the template order structure for initial visibility
    {
      key: 1,
      orderNo: "INV-PO-001",
      companyName: "ABC Traders",
      customer: "Tech World Pvt Ltd",
      items: [
        { lineKey: 1, itemName: "Laptop", itemCode: "ITM-LAP-001", quantity: 4, uom: "Nos", unitPrice: 10000, totalAmount: 4 * 10000 },
      ],
      dispatchDate: "2025-10-10",
      deliveryDatePlanned: "2025-10-13",
      deliveredDate: "2025-10-19",
      transporter: "ABC Logistics",
      vehicleNo: "OD-05-AB-1234",
      driverName: "Rajesh Kumar",
      phoneNo: "9876543210",
      route: "Bhubaneswar to Cuttack",
      status: "In-Transit",
      orderTotals: { totalQuantity: 4, totalAmount: 4 * 10000 },
    },
  ]);

  const [searchText, setSearchText] = useState("");

  // items available for selection when an order is chosen
  const [availableOrderItems, setAvailableOrderItems] = useState([]);
  // currently checked item lineKeys in the modal checkbox group
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  // helper: find template order by orderNo
  const findOrderByNo = (orderNo) => deliveryStatusJSON.records.find((r) => r.orderNo === orderNo);

  // ---------- when "Order No" selected in Add modal ----------
  const handleOrderSelectInAdd = (orderNo) => {
    const found = findOrderByNo(orderNo);
    if (!found) {
      addForm.resetFields();
      setAvailableOrderItems([]);
      setSelectedItemKeys([]);
      return;
    }
    addForm.setFieldsValue({
      orderNo: found.orderNo,
      companyName: found.companyName,
      customer: found.customer,
      dispatchDate: found.dispatchDate ? dayjs(found.dispatchDate) : undefined,
      deliveryDate: found.deliveryDatePlanned ? dayjs(found.deliveryDatePlanned) : undefined,
      transporter: found.transporter,
      vehicleNo: found.vehicleNo,
      driverName: found.driverName,
      phoneNo: found.phoneNo,
      route: found.route,
      status: found.status,
    });

    // set items list and reset selection
    setAvailableOrderItems(found.items || []);
    setSelectedItemKeys([]); // no items preselected in Add (you can set all by default if desired)
    addForm.setFieldsValue({ selectedItems: [] });
  };

  // ---------- when "Edit" clicked: prepare edit modal with available items + preselected items ----------
  const prepareEditModal = (record) => {
    setSelectedRecord(record);

    // load existing delivery record fields into the edit form
    editform.setFieldsValue({
      ...record,
      dispatchDate: record.dispatchDate ? dayjs(record.dispatchDate) : undefined,
      deliveryDate: record.deliveryDatePlanned ? dayjs(record.deliveryDatePlanned) : undefined,
      deliveredDate: record.deliveredDate ? dayjs(record.deliveredDate) : undefined,
    });

    // set available items from the template order (if exists)
    const template = findOrderByNo(record.orderNo);
    const templateItems = template ? template.items || [] : [];

    // if template missing, we still allow editing using current record's items as available list
    const avail = templateItems.length ? templateItems : (record.items || []);

    setAvailableOrderItems(avail);

    // preselect items that are already assigned in this delivery record.
    // We match by itemCode: for each available item, if its itemCode exists in record.items -> preselect.
    const assignedCodes = (record.items || []).map((it) => it.itemCode);
    const preselectedKeys = (avail || []).filter((it) => assignedCodes.includes(it.itemCode)).map((it) => it.lineKey);

    setSelectedItemKeys(preselectedKeys);

    // set selectedItems form field to existing assigned items (so they show up on submit if unchanged)
    editform.setFieldsValue({ selectedItems: record.items || [] });

    setIsEditModalOpen(true);
  };

  // ---------- Checkbox change handler (Add/Edit) ----------
  const onItemsCheckboxChange = (checkedKeys, formInstance) => {
    setSelectedItemKeys(checkedKeys || []);
    const selectedItems = (availableOrderItems || []).filter((it) => (checkedKeys || []).includes(it.lineKey));
    // store selected items in whichever form is active (we don't pass form instance here — caller will call with appropriate form)
    if (formInstance) {
      formInstance.setFieldsValue({ selectedItems });
    }
  };

  // ---------- Table columns ----------
  const filteredData = data.filter((item) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.orderNo || "").toLowerCase().includes(q) ||
      (item.companyName || "").toLowerCase().includes(q) ||
      (item.customer || "").toLowerCase().includes(q) ||
      (item.route || "").toLowerCase().includes(q) ||
      (item.status || "").toLowerCase().includes(q)
    );
  });

  const columns = [
    { title: <span className="text-amber-700 font-semibold">Order No</span>, dataIndex: "orderNo", render: (t) => <span className="text-amber-800">{t}</span> },
    { title: <span className="text-amber-700 font-semibold">Company</span>, dataIndex: "companyName", render: (t) => <span className="text-amber-800">{t}</span> },
    { title: <span className="text-amber-700 font-semibold">Customer</span>, dataIndex: "customer", render: (t) => <span className="text-amber-800">{t}</span> },
    { title: <span className="text-amber-700 font-semibold">Qty</span>, render: (_, r) => <span className="text-amber-800">{(r.orderTotals && r.orderTotals.totalQuantity) || "-"}</span> },
    { title: <span className="text-amber-700 font-semibold">Total Amount</span>, render: (_, r) => <span className="text-amber-800">{(r.orderTotals && r.orderTotals.totalAmount) || "-"}</span> },
    { title: <span className="text-amber-700 font-semibold">Status</span>, dataIndex: "status", render: (status) => {
        const base = "px-2 py-1 rounded-full text-sm font-medium";
        const color = status === "Delivered" ? "bg-green-100 text-green-700" : status === "In-Transit" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700";
        return <span className={`${base} ${color}`}>{status}</span>;
      }
    },
    { title: <span className="text-amber-700 font-semibold">Actions</span>, render: (record) => (
      <div className="flex gap-3">
        <EyeOutlined className="cursor-pointer text-blue-500" onClick={() => {
          setSelectedRecord(record);
          viewForm.setFieldsValue({
            ...record,
            dispatchDate: record.dispatchDate ? dayjs(record.dispatchDate) : undefined,
            deliveryDate: record.deliveryDatePlanned ? dayjs(record.deliveryDatePlanned) : undefined,
            deliveredDate: record.deliveredDate ? dayjs(record.deliveredDate) : undefined,
          });
          setIsViewModalOpen(true);
        }} />
        <EditOutlined className="cursor-pointer text-red-500" onClick={() => prepareEditModal(record)} />
      </div>
    ) }
  ];

  // ---------- Add handler ----------
  const handleAdd = (values) => {
    const selectedItems = values.selectedItems || [];
    if (!selectedItems.length) {
      Modal.warning({ title: "No items selected", content: "Please select at least one item to assign transport." });
      return;
    }
    const newRecord = {
      key: data.length + 1,
      orderNo: values.orderNo,
      companyName: values.companyName,
      customer: values.customer,
      items: selectedItems,
      dispatchDate: values.dispatchDate ? values.dispatchDate.format("YYYY-MM-DD") : undefined,
      deliveryDatePlanned: values.deliveryDate ? values.deliveryDate.format("YYYY-MM-DD") : undefined,
      deliveredDate: values.deliveredDate ? values.deliveredDate.format("YYYY-MM-DD") : undefined,
      transporter: values.transporter,
      vehicleNo: values.vehicleNo,
      driverName: values.driverName,
      phoneNo: values.phoneNo,
      route: values.route,
      status: values.status || "In-Transit",
      orderTotals: { totalQuantity: selectedItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0), totalAmount: selectedItems.reduce((s, it) => s + (Number(it.totalAmount) || 0), 0) },
    };

    setData((prev) => [...prev, newRecord]);
    setIsAddModalOpen(false);
    addForm.resetFields();
    setAvailableOrderItems([]);
    setSelectedItemKeys([]);
  };

  // ---------- Edit submit (save updated items + other fields) ----------
  const handleEditSubmit = (values) => {
    const selectedItems = values.selectedItems || editform.getFieldValue("selectedItems") || [];
    if (!selectedItems.length) {
      Modal.warning({ title: "No items selected", content: "Please select at least one item to assign transport." });
      return;
    }

    const updated = {
      ...selectedRecord,
      orderNo: values.orderNo || selectedRecord.orderNo,
      companyName: values.companyName,
      customer: values.customer,
      items: selectedItems,
      dispatchDate: values.dispatchDate ? values.dispatchDate.format("YYYY-MM-DD") : undefined,
      deliveryDatePlanned: values.deliveryDate ? values.deliveryDate.format("YYYY-MM-DD") : undefined,
      deliveredDate: values.deliveredDate ? values.deliveredDate.format("YYYY-MM-DD") : undefined,
      transporter: values.transporter,
      vehicleNo: values.vehicleNo,
      driverName: values.driverName,
      phoneNo: values.phoneNo,
      route: values.route,
      status: values.status,
      orderTotals: { totalQuantity: selectedItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0), totalAmount: selectedItems.reduce((s, it) => s + (Number(it.totalAmount) || 0), 0) },
    };

    setData((prev) => prev.map((r) => (r.key === selectedRecord.key ? updated : r)));
    setIsEditModalOpen(false);
    editform.resetFields();
    setSelectedRecord(null);
    setAvailableOrderItems([]);
    setSelectedItemKeys([]);
  };

  // ---------- Render form fields (Add/Edit/View). showItemSelection toggles checkbox list ---------- 
  const renderFormFields = (disabled = false, formInstance, showItemSelection = false) => (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Order No" name="orderNo" rules={[{ required: !disabled, message: "Select Order No" }]}>
            <Select disabled={disabled} onChange={(v) => { if (!disabled && formInstance === addForm) handleOrderSelectInAdd(v); if (!disabled && formInstance === editform) { /* when user changes orderNo in edit, reload available items */ const t = findOrderByNo(v); setAvailableOrderItems(t ? t.items || [] : []); setSelectedItemKeys([]); editform.setFieldsValue({ selectedItems: [] }); } }}>
              {deliveryStatusJSON.records.map((r) => <Select.Option key={r.orderNo} value={r.orderNo}>{r.orderNo}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}><Form.Item label="Company" name="companyName"><Input disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Customer" name="customer"><Input disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Total Amount" name="totalAmount"><InputNumber className="w-full" disabled /></Form.Item></Col>
        <Col span={8}><Form.Item label="Delivery Date (Planned)" name="deliveryDate"><DatePicker className="w-full" disabled={disabled} /></Form.Item></Col>
      </Row>

      <Divider />

      {showItemSelection && (
        <>
          <h6 className="text-amber-500">Select Items to Assign</h6>
          <div className="mb-3">
            {availableOrderItems.length === 0 ? (
              <div className="text-sm text-gray-600">Select an Order No to load items.</div>
            ) : (
              <Checkbox.Group value={selectedItemKeys} onChange={(checked) => onItemsCheckboxChange(checked, formInstance)} style={{ width: "100%" }}>
                {availableOrderItems.map((it) => (
                  <div key={it.lineKey} className="p-2 border rounded mb-2 bg-white">
                    <Checkbox value={it.lineKey}>
                      <div className="ml-2">
                        <div className="text-amber-800 font-medium">{it.itemName} ({it.itemCode})</div>
                        <div className="text-sm text-gray-600">Qty: {it.quantity} {it.uom} • Unit: {it.unitPrice} • Total: {it.totalAmount}</div>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            )}
          </div>
          <Divider />
        </>
      )}

      <h6 className="text-amber-500">Transport Details</h6>
      <Row gutter={16}>
        <Col span={8}><Form.Item label="Dispatch Date" name="dispatchDate"><DatePicker className="w-full" disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Delivered Date" name="deliveredDate"><DatePicker className="w-full" disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Transporter" name="transporter"><Input disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Vehicle No" name="vehicleNo"><Input disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Driver Name" name="driverName"><Input disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Phone No" name="phoneNo"><InputNumber className="w-full" disabled={disabled} /></Form.Item></Col>
        <Col span={8}><Form.Item label="Route" name="route"><Select disabled={disabled}>{deliveryStatusJSON.routeOptions.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}</Select></Form.Item></Col>
        <Col span={8}><Form.Item label="Status" name="status"><Select disabled={disabled}>{deliveryStatusJSON.statusOptions.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}</Select></Form.Item></Col>
      </Row>
    </>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          prefix={<SearchOutlined className="text-amber-600" />}
          placeholder="Search..."
          className="w-64 border-amber-300 focus:border-amber-500"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex gap-2">
          <Button icon={<DownloadOutlined />} className="border-amber-400 text-amber-700 hover:bg-amber-100">Export</Button>
          <Button icon={<PlusOutlined />} type="primary" className="bg-amber-500 hover:bg-amber-600 border-none" onClick={() => { addForm.resetFields(); setAvailableOrderItems([]); setSelectedItemKeys([]); setIsAddModalOpen(true); }}>Add New</Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Sale Delivery Status</h2>
        <p className="text-amber-600 mb-3">Manage your Sale Delivery Status records</p>
        <Table columns={columns} dataSource={filteredData} pagination={false} scroll={{ y: 300 }} rowKey="key" />
      </div>

      {/* Add Modal */}
      <Modal title={<span className="text-amber-700 text-2xl font-semibold">Add Sale Delivery Status</span>} open={isAddModalOpen} onCancel={() => setIsAddModalOpen(false)} footer={null} width={900}>
        <Form layout="vertical" form={addForm} onFinish={handleAdd}>
          {renderFormFields(false, addForm, true)}
          {/* hidden field to keep selected items in form values */}
          <Form.Item name="selectedItems" style={{ display: "none" }}><Input /></Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500 hover:bg-amber-600 border-none">Add</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title={<span className="text-amber-700 font-semibold">Edit Sale Delivery Status</span>} open={isEditModalOpen} onCancel={() => { setIsEditModalOpen(false); editform.resetFields(); setSelectedRecord(null); setAvailableOrderItems([]); setSelectedItemKeys([]); }} footer={null} width={900}>
        <Form layout="vertical" form={editform} onFinish={handleEditSubmit}>
          {renderFormFields(false, editform, true) /* showItemSelection true so edit also gets checkboxes */}
          <Form.Item name="selectedItems" style={{ display: "none" }}><Input /></Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => { setIsEditModalOpen(false); editform.resetFields(); setSelectedRecord(null); setAvailableOrderItems([]); setSelectedItemKeys([]); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500 hover:bg-amber-600 border-none">Update</Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal title={<span className="text-amber-700 text-2xl font-semibold">View Sale Delivery Status</span>} open={isViewModalOpen} onCancel={() => { setIsViewModalOpen(false); viewForm.resetFields(); setSelectedRecord(null); }} footer={null} width={900}>
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true, viewForm, false)}
          <Divider />
          <h6 className="text-amber-500">Items</h6>
          <div className="space-y-2">
            {/* show items from the delivery record (selectedRecord) */}
            {(selectedRecord?.items || []).map((it) => (
              <div key={it.lineKey || it.itemCode} className="p-2 border rounded bg-white">
                <div className="text-amber-800 font-medium">{it.itemName} ({it.itemCode})</div>
                <div className="text-sm text-gray-600">Qty: {it.quantity} {it.uom} • Unit: {it.unitPrice} • Total: {it.totalAmount}</div>
              </div>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
