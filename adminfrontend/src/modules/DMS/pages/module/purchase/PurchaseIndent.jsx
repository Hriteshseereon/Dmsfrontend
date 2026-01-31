import React, { useState,useEffect } from "react";
import { positiveNumberInputProps } from "../../../helpers/numberInput";
import {
  requiredPositiveNumber,
  optionalPositiveNumber,
  percentageValidation,
} from "../../../helpers/formValidation";
import { getPurchaseOrder } from "../../../../../api/purchase";
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
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

// -----------------------
// Sample SOUDA master data (maps soudaNo -> list of items + basic info)
// In real app this will come from backend when soudaNo is selected.
const soudaMaster = {
  "SOUDA-001": {
    soudaNo: "SOUDA-001",
    plantName: "Kalinga Oils Pvt. Ltd.",
    plantCode: "PC1",
    companyName: "Jay Traders",
    depoName: "Bhubaneswar Depot",
    deliveryAddress: "Plot 12, Industrial Area, Bhubaneswar",
    items: [
      { item: "Mustard Oil", itemCode: "ITM-MUST-1", uom: "Litre", rate: 120 },
      { item: "Sunflower Oil", itemCode: "ITM-SUN-1", uom: "Litre", rate: 110 },
    ],
  },
  "SOUDA-002": {
    soudaNo: "SOUDA-002",
    plantName: "Oils Pvt. Ltd.",
    plantCode: "PC2",
    companyName: "Saheree Traders",
    depoName: "Aul Depot",
    deliveryAddress: "Sector 4, Aul Industrial, Jagatsinghpur",
    items: [
      { item: "Coconut Oil", itemCode: "ITM-COC-1", uom: "Litre", rate: 140 },
    ],
  },
};

const purchaseIndentJSON = {
  records: [
    {
      key: 1,
      soudaNo: "SOUDA-001",
      plantName: "Kalinga Oils Pvt. Ltd.",
      plantCode: "PC1",
      indentDate: "2024-10-01",
      deliveryDate: "2024-12-09",
      deliveryAddress: "Plot 12, Industrial Area, Bhubaneswar",
      companyName: "Jay Traders",
      depoName: "Bhubaneswar Depot",
      items: [
        {
          item: "Mustard Oil",
          itemCode: "ITM-MUST-1",
          qty: 5000,
          freeQty: 200,
          totalQty: 5200,
          uom: "Litre",
          rate: 120,
          discountPercent: 2,
          discountAmt: 12000,
          grossWt: 2100,
          totalGrossWt: 1020,
          grossAmount: 67080,
        },
      ],
      totalQty: 5200,
      totalAmt: 588000,
      status: "Approved",
    },
  ],
  uomOptions: ["Litre", "Kg", "Packet", "Box"],
  statusOptions: ["Approved", "Pending", "Rejected"],
  soudaNoOptions: ["SOUDA-001", "SOUDA-002", "SOUDA-003"],
};

export default function PurchaseIndent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
 
  const [data, setData] = useState([]);
 const [loading, setLoading] = useState(false);
 
  const [searchText, setSearchText] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  useEffect(() => {
  fetchPurchaseOrder();
}, []);

const fetchPurchaseOrder = async () => {
  try {
    setLoading(true);

    const res = await getPurchaseOrder();

    // adjust if API response is wrapped (res.data)
    const list = res?.data || res;

    const formattedData = list.map((item, index) => ({
      key: item.id || index + 1,
      contract: item.contract,
      plant_name: item.plant_name,
      company_name: item.company_name,
      total_qty_all_items: item.total_qty_all_items || 0,
      total_amount: item.total_amount || 0,
      status: item.status || "Pending",
    }));

    setData(formattedData);
  } catch (error) {
    console.error("Failed to fetch purchase orders", error);
    message.error("Failed to load purchase indents");
  } finally {
    setLoading(false);
  }
};

const handleSearch = (value) => {
  setSearchText(value);

  if (!value) {
    fetchPurchaseOrder();
    return;
  }

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
  );

  setData(filtered);
};


  // when souda selected - populate basic info AND items list (user can add/remove items)
  const handleSoudaSelect = (soudaNo, formInstance) => {
    if (!soudaNo) return;
    const souda = soudaMaster[soudaNo];
    if (!souda) return;

    // map items into form list entries (qty/free qty blank so user can fill)
    const itemsForForm = souda.items.map((it) => ({
      item: it.item,
      itemCode: it.itemCode,
      qty: undefined,
      freeQty: 0,
      totalQty: undefined,
      uom: it.uom || purchaseIndentJSON.uomOptions[0],
      rate: it.rate || 0,
      discountPercent: 0,
      discountAmt: 0,
      grossWt: 0,
      totalGrossWt: 0,
      grossAmount: 0,
    }));

    formInstance.setFieldsValue({
      soudaNo: souda.soudaNo,
      plantName: souda.plantName,
      plantCode: souda.plantCode,
      companyName: souda.companyName,
      depoName: souda.depoName,
      deliveryAddress: souda.deliveryAddress || "",
      items: itemsForForm,
    });

    // recalc after a tick
    setTimeout(() => recalcAll(formInstance), 50);
  };

  // recalc same as before, but for multi items
  const recalcAll = (formInstance) => {
    if (!formInstance) return;
    const values = formInstance.getFieldsValue(true);
    const items = values.items || [];

    let totalIndentQty = 0;
    let taxableAmount = 0;

    const updatedItems = items.map((item) => {
      const qty = Number(item?.qty || 0);
      const freeQty = Number(item?.freeQty || 0);
      const rate = Number(item?.rate || 0);
      const discountPercent = Number(item?.discountPercent || 0);
      const grossWt = Number(item?.grossWt || 0);

      const totalQty = qty + freeQty;
      const grossAmount = qty * rate;
      const discountAmt = (grossAmount * discountPercent) / 100;
      const itemTaxable = grossAmount - discountAmt;
      const totalGrossWt = grossWt;

      totalIndentQty += totalQty;
      taxableAmount += itemTaxable;

      return {
        ...item,
        totalQty,
        grossAmount,
        discountAmt,
        totalGrossWt,
      };
    });

    // taxes (kept simple; you can adjust to compute correctly per indent)
    const sgstPercent = Number(values.sgstPercent || 0);
    const cgstPercent = Number(values.cgstPercent || 0);
    const igstPercent = Number(values.igstPercent || 0);
    const tcsAmt = Number(values.tcsAmt || 0);

    const sgst = (taxableAmount * sgstPercent) / 100;
    const cgst = (taxableAmount * cgstPercent) / 100;
    const igst = (taxableAmount * igstPercent) / 100;
    const totalGST = sgst + cgst + igst;
    const totalAmt = taxableAmount + totalGST + tcsAmt;

    formInstance.setFieldsValue({
      items: updatedItems,
      totalQty: totalIndentQty,
      sgst,
      cgst,
      igst,
      totalGST,
      tcsAmt,
      totalAmt,
    });
  };


  const handleFormSubmit = (values, type) => {
    const payloadBase = {
      ...values,
      indentDate: values.indentDate
        ? values.indentDate.format("YYYY-MM-DD")
        : null,
      deliveryDate: values.deliveryDate
        ? values.deliveryDate.format("YYYY-MM-DD")
        : null,
    };

    const items = values.items || [];

    const payload = {
      ...payloadBase,
      items,
      totalQty: values.totalQty,
      totalAmt: values.totalAmt,
      status: values.status || "Pending",
    };

    if (type === "edit" && selectedRecord) {
      setData((prev) =>
        prev.map((i) =>
          i.key === selectedRecord.key ? { ...payload, key: i.key } : i
        )
      );
      setIsEditModalOpen(false);
      editForm.resetFields();
      message.success("Indent updated");
    } else {
      setData((prev) => [...prev, { ...payload, key: Date.now() }]);
      setIsAddModalOpen(false);
      addForm.resetFields();
      message.success("Indent added");
    }
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Souda No</span>,
      dataIndex: "contract",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant</span>,
      dataIndex: "plant_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Company</span>,
      dataIndex: "company_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Delivery Date</span>,
    //   dataIndex: "deliveryDate",
    //   width: 120,
    //   render: (t) => <span className="text-amber-800">{t}</span>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty_all_items",
      width: 120,
      render: (_, record) => (
        <span className="text-amber-800">{record.
total_qty_all_items
} </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Total Amount (₹)</span>
      ),
      dataIndex: "total_amount",
      width: 160,
      render: (t) => (
        <span className="text-amber-800">
          ₹{Number(t || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              {status}
            </span>
          );
        if (status === "Pending")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              {status}
            </span>
          );
        return (
          <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => handleView(record)}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleEdit(record)}
          />
        </div>
      ),
    },
  ];

  const handleView = (record) => {
    setSelectedRecord(record);
    const convert = (v) => (v ? dayjs(v) : null);

    viewForm.setFieldsValue({
      ...record,
      indentDate: convert(record.indentDate),
      deliveryDate: convert(record.deliveryDate),
    });

    setIsViewModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    const convert = (v) => (v ? dayjs(v) : null);

    editForm.setFieldsValue({
      ...record,
      indentDate: convert(record.indentDate),
      deliveryDate: convert(record.deliveryDate),
    });

    setIsEditModalOpen(true);
  };

  // Render form fields (used by Add/Edit/View). When soudaNo is selected, items are prefilled and user can add/remove entries.
  const renderFormFields = (formInstance, disabled = false) => (
    <>
      <h6 className=" text-amber-500 ">Basic Information</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label="Souda No"
            name="soudaNo"
            rules={[{ required: true }]}
          >
            <Select
              disabled={disabled}
              onChange={(v) => handleSoudaSelect(v, formInstance)}
            >
              {purchaseIndentJSON.soudaNoOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Plant Name" name="plantName">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Company Name" name="companyName">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Status" name="status">
            <Select disabled={disabled}>
              {purchaseIndentJSON.statusOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Delivery Address"
            name="deliveryAddress"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Indent Date" name="indentDate">
            <DatePicker className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label="Delivery Date"
            name="deliveryDate"
            rules={[{ required: true }]}
          >
            <DatePicker
              className="w-full"
              disabled={disabled}
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>
        </Col>
      </Row>

      <h6 className=" text-amber-500 mt-4">Item & Pricing Details</h6>

      <Form.List name="items" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div
                key={field.key}
                className="border border-amber-200 rounded-lg p-3 mb-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-amber-700">
                    Item {index + 1}
                  </span>
                  {!disabled && (
                    <div>
                      {fields.length > 1 && (
                        <Button
                          type="link"
                          danger
                          onClick={() => {
                            remove(field.name);
                            setTimeout(() => recalcAll(formInstance), 0);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="Item Name"
                      name={[field.name, "item"]}
                      rules={[
                        { required: true, message: "Please select item" },
                      ]}
                    >
                      {/* item selection is populated from the souda's item list if available */}
                      <Select
                        showSearch
                        disabled={disabled}
                        placeholder="Select item"
                        onChange={() =>
                          setTimeout(() => recalcAll(formInstance), 50)
                        }
                      >
                        {/* if souda selected, prefer those items */}
                        {(() => {
                          const soudaNo = formInstance.getFieldValue("soudaNo");
                          const souda = soudaMaster[soudaNo];
                          const opts = souda ? souda.items : [];
                          return (opts.length ? opts : []).map((it) => (
                            <Option key={it.itemCode} value={it.item}>
                              {it.item}
                            </Option>
                          ));
                        })()}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Item Code"
                      name={[field.name, "itemCode"]}
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Qty"
                      name={[field.name, "qty"]}
                      className="w-full"
                    >
                      <InputNumber
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Free Qty"
                      name={[field.name, "freeQty"]}
                    >
                      <InputNumber
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Total Qty"
                      name={[field.name, "totalQty"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                   <Col span={4}>
                    <Form.Item
                      {...field}
                      label="UOM"
                      name={[field.name, "uom"]}
                    >
                      <Select disabled={disabled}>
                        {purchaseIndentJSON.uomOptions.map((opt) => (
                          <Option key={opt} value={opt}>
                            {opt}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Rate"
                      name={[field.name, "rate"]}
                    >
                      <InputNumber
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Discount %"
                      name={[field.name, "discountPercent"]}
                    >
                      <InputNumber
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Discount Amt"
                      name={[field.name, "discountAmt"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      {...field}
                      label="Gross Amount"
                      name={[field.name, "grossAmount"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                </Row>

              
                <Row gutter={12}>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="Gross Weight"
                      name={[field.name, "grossWt"]}
                    >
                      <InputNumber className="w-full" disabled={disabled} />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="Total Gross Weight"
                      name={[field.name, "totalGrossWt"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}

            {!disabled && (
              <Button
                type="dashed"
                onClick={() => {
                  add({});
                  setTimeout(() => recalcAll(formInstance), 0);
                }}
                block
                icon={<PlusOutlined />}
              >
                Add Another Item
              </Button>
            )}
          </>
        )}
      </Form.List>

      <h6 className=" text-amber-500 mt-4">Tax, Charges & Others</h6>
      <Row gutter={12}>
        <Col span={4}>
          <Form.Item label="Total Qty (All Items)" name="totalQty">
            <InputNumber className="w-full bg-gray-50" disabled />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="SGST %" name="sgstPercent">
            <InputNumber
              className="w-full"
              disabled
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="CGST %" name="cgstPercent">
            <InputNumber
              className="w-full"
              disabled
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="IGST %" name="igstPercent">
            <InputNumber
              className="w-full"
              disabled
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="Total GST (₹)" name="totalGST">
            <InputNumber className="w-full bg-gray-50" disabled />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="TCS Amt (₹)" name="tcsAmt">
            <InputNumber
              className="w-full"
              disabled
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="Total Amount (₹)" name="totalAmt">
            <InputNumber className="w-full bg-gray-50" disabled />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600! " />}
            placeholder="Search..."
            className="w-64! border-amber-300!"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={() => handleSearch("")}
          >
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              addForm.resetFields();
              addForm.setFieldsValue({ indentDate: dayjs(), items: [] });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Indent Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your purchase souda data</p>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 260 }}
          rowKey="key"
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add New Purchase Indent
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(vals) => handleFormSubmit(vals, "add")}
        >
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(addForm, false)}
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 border-none"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit Purchase Indent
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(vals) => handleFormSubmit(vals, "edit")}
        >
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(editForm, false)}
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 border-none"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Purchase Indent
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form layout="vertical" form={viewForm}>
          {() => renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}
