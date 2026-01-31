// PurchaseSouda.jsx
import React, { useState, useEffect, useMemo } from "react";
import { positiveNumberInputProps, 
  percentageInputProps,
  blockNonNumericInput  } from "../../../helpers/numberInput";
import { requiredPositiveNumber,optionalPositiveNumber,percentageValidation } from "../../../helpers/formValidation";
import { updateItemComputedFields } from "../../../helpers/calculation";
import { getPurchaseContract ,getAllCompany,getAllVendor,getAllProduct,addPurchaseContract} from "../../../../../api/purchase";
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
  Card,
  Divider,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const purchaseSoudaJSON = {
  records: [
    {
      key: 1,
      plantName: "Kalinga Oils Pvt. Ltd.",
      plantCode: "PLT001",
      soudaDate: "2024-10-01",
      deliveryDate: "2024-12-09",
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      companyName: "Jay Traders",
      depoName: "Bhubaneswar Depot",
      // previously single item; now items array
      items: [
        {
          lineKey: 1,
          item: "Mustard Oil",
          itemCode: "It1",
          qty: 5000,
          freeQty: 200,
          totalQty: 5200,
          uom: "Litre",
          rate: 120,
          discountPercent: 2,
          discountAmt: 12000,
          grossAmount: 5000 * 120,
          grossWt: 2100,
          totalGrossWt: 1020,
          sgstPercent: 5,
          cgstPercent: 5,
          igstPercent: 0,
          sgst: 3186,
          cgst: 3186,
          igst: 0,
          totalGST: 6372,
          tcsAmt: 500,
          totalAmt: 588000,
        },
      ],
      status: "Approved",
    },
  ],
  plantOptions: [
    { name: "Kalinga Oils Pvt. Ltd.", code: "PA" },
    { name: "Odisha Edibles", code: "Sunrise Foods" },
  ],
  depoOptions: ["Bhubaneswar Depot", "Cuttack Depot", "Sambalpur Depot"],
  itemOptions: [
    { name: "Mustard Oil", code: "It1", rate: 120, uom: "Litre" },
    { name: "Refined Oil", code: "It2", rate: 115, uom: "Litre" },
    { name: "Sunflower Oil", code: "It3", rate: 100, uom: "Litre" },
  ],
  uomOptions: ["Litre", "Kg", "Packet", "Box"],
  statusOptions: ["Approved", "Pending", "Rejected"],
};
const companyOptions = ["Jay Traders", "Another Co", "RUCHI SOYA INDUSTRIES LIMITED"];


export default function PurchaseSouda() {
  // forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [vendors, setVendors] = useState([]);
const [companies, setCompanies] = useState([]);
const [products, setProducts] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

 const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
 const [searchText, setSearchText] = useState("");


 useEffect(() => {
  fetchDropdownData();
}, []);

const fetchDropdownData = async () => {
  try {
    const [vendorRes, companyRes, productRes] = await Promise.all([
      getAllVendor(),
      getAllCompany(),
      getAllProduct(),
    ]);

    setVendors(vendorRes);
    setCompanies(companyRes);
    setProducts(productRes);
  } catch (err) {
    console.error("Dropdown API failed", err);
  }
};

  // helper: map of itemOptions for quick lookup
  const itemMap = useMemo(() => {
    const m = {};
    purchaseSoudaJSON.itemOptions.forEach((it) => (m[it.name] = it));
    return m;
  }, []);

  // search (simple)
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setData(purchaseSoudaJSON.records);
      return;
    }
    const filtered = purchaseSoudaJSON.records.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );
    setData(filtered);
  };
useEffect(() => {
  fetchPurchaseContracts();
}, []);

const fetchPurchaseContracts = async () => {
  try {
    setLoading(true);
    const res = await getPurchaseContract();

    /**
     * Adjust mapping based on backend response structure
     * Assuming API returns array of purchase contracts
     */
    const formattedData = res.map((item, index) => ({
      key: item.id || index + 1,
      plant: item.plant,
      vendor: item.vendor,
      startDate: item.startDate,
      to_date: item.to_date,
      from_date:item.from_date,
      status: item.status,
    }));

    setData(formattedData);
  } catch (error) {
    console.error("Failed to fetch purchase contracts", error);
  } finally {
    setLoading(false);
  }
};

  
  // ---------- Table columns ----------
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plant",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Souda Date</span>,
    //   dataIndex: "soudaDate",
    //   width: 110,
    //   render: (t) => <span className="text-amber-800">{t}</span>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Start Date</span>,
      dataIndex: "from_date",
      width: 110,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">End Date</span>,
      dataIndex: "to_date",
      width: 110,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Company</span>,
      dataIndex: "vendor",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
 
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved")
          return <span className={`${base} bg-green-100 text-green-700`}>Approved</span>;
        if (status === "Pending")
          return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
        return <span className={`${base} bg-red-200 text-red-700`}>{status}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              // prepare view form values
              viewForm.setFieldsValue({
                ...record,
                soudaDate: record.soudaDate ? dayjs(record.soudaDate) : undefined,
                startDate: record.startDate ? dayjs(record.startDate) : undefined,
                endDate: record.endDate ? dayjs(record.endDate) : undefined,
              });
              setIsViewModalOpen(true);
            }}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              // preload edit form (convert dates)
              editForm.setFieldsValue({
                ...record,
                soudaDate: record.soudaDate ? dayjs(record.soudaDate) : undefined,
                startDate: record.startDate ? dayjs(record.startDate) : undefined,
                endDate: record.endDate ? dayjs(record.endDate) : undefined,
              });
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  // ---------- Calculation helpers ----------
  // compute per-item derived fields and order totals
  const computeAllFromFormValues = (values) => {
    const items = (values.items || []).map((it = {}, idx) => {
      const qty = Number(it.qty || 0);
      const freeQty = Number(it.freeQty || 0);
      const rate = Number(it.rate || 0);
      const discountPercent = Number(it.discountPercent || 0);
      const sgstPercent = Number(it.sgstPercent || 0);
      const cgstPercent = Number(it.cgstPercent || 0);
      const igstPercent = Number(it.igstPercent || 0);
      const tcsAmt = Number(it.tcsAmt || 0);
      const grossWt = Number(it.grossWt || 0);

      const totalQty = qty + freeQty;
      const grossAmount = qty * rate;
      const discountAmt = (grossAmount * discountPercent) / 100;
      const taxable = grossAmount - discountAmt;
      const sgst = (taxable * sgstPercent) / 100;
      const cgst = (taxable * cgstPercent) / 100;
      const igst = (taxable * igstPercent) / 100;
      const totalGST = sgst + cgst + igst;
      const totalAmt = taxable + totalGST + tcsAmt;

      return {
        ...it,
        lineKey: it.lineKey || idx + 1,
        totalQty,
        grossAmount,
        discountAmt,
        taxable,
        sgst,
        cgst,
        igst,
        totalGST,
        totalAmt,
        totalGrossWt: grossWt,
      };
    });

    const orderTotals = {
      totalQty: items.reduce((s, it) => s + Number(it.totalQty || 0), 0),
      totalGrossAmount: items.reduce((s, it) => s + Number(it.grossAmount || 0), 0),
      totalDiscount: items.reduce((s, it) => s + Number(it.discountAmt || 0), 0),
      totalGST: items.reduce((s, it) => s + Number(it.totalGST || 0), 0),
      grandTotal: items.reduce((s, it) => s + Number(it.totalAmt || 0), 0),
    };

    return { items, orderTotals };
  };

  // on form values change, recompute derived fields and set them back
  const handleFormValuesChangeFactory = (form) => (_changed, allValues) => {
    const computed = computeAllFromFormValues(allValues || {});
    // write back per-item computed fields
    form.setFieldsValue({
      items: computed.items,
      // optionally set order-level fields if you have those
      orderTotals: computed.orderTotals,
    });
  };

  // ---------- Form submit ----------
const handleFormSubmit = async (values) => {
  const payload = {
    organisation: values.organisation,
    plant: values.plant,
    from_date: dayjs(values.startDate).format("YYYY-MM-DD"),
    to_date: dayjs(values.endDate).format("YYYY-MM-DD"),
    items: values.items.map(it => ({
      product: it.item,
      quantity: it.qty,
      free_qty: it.freeQty,
      rate: it.rate,
      sgst_percent: it.sgstPercent,
      cgst_percent: it.cgstPercent,
      igst_percent: it.igstPercent,
    })),
  };

  await addPurchaseContract(values.organisation, payload);
};

  const ItemsList = ({ form, disabled = false }) => (
  <Form.List name="items">
    {(fields, { add, remove }) => (
      <>
        <div className="mb-2 flex justify-between items-center">
          <h6 className="text-amber-500">Items</h6>
          {!disabled && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  lineKey: new Date().getTime(),
                  item: undefined,
                  itemCode: undefined,
                  qty: 0,
                  freeQty: 0,
                  totalQty: 0,
                  rate: 0,
                  discountPercent: 0,
                  discountAmt: 0,
                  grossAmount: 0,
                  uom: purchaseSoudaJSON.uomOptions[0],
                })
              }
            >
              Add Item
            </Button>
          )}
        </div>

        {fields.map((field, index) => (
          <Card
            key={field.key}
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            bodyStyle={{ padding: 12 }}
            extra={
              !disabled && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                />
              )
            }
          >
            <Row gutter={12} align="middle">
              <Col span={6}>
                <Form.Item
                  {...field}
                  label="Item Name"
                  name={[field.name, "item"]}
                  fieldKey={[field.fieldKey, "item"]}
                  rules={[{ required: true, message: "Item is required" }]}
                >
                 <Select
  placeholder="Select Item"
  disabled={disabled}
  onChange={(productId) => {
    const selected = products.find(p => p.id === productId);

    addForm.setFields([
      { name: ["items", field.name, "rate"], value: selected?.rate || 0 },
      { name: ["items", field.name, "uom"], value: selected?.uom || "Litre" },
      { name: ["items", field.name, "sgstPercent"], value: selected?.sgst || 0 },
      { name: ["items", field.name, "cgstPercent"], value: selected?.cgst || 0 },
      { name: ["items", field.name, "igstPercent"], value: selected?.igst || 0 },
    ]);
  }}
>

                  {products.map((p) => (
  <Select.Option key={p.id} value={p.id}>
    {p.name}
  </Select.Option>
))}

                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Item Code" 
                  name={[field.name, "itemCode"]} 
                  fieldKey={[field.fieldKey, "itemCode"]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>

              {/* FIX: Qty with proper validation */}
               <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Qty" 
                  name={[field.name, "qty"]} 
                  rules={requiredPositiveNumber("Quantity")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>
              {/* FIX: Free Qty with proper validation */}
              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Free Qty" 
                  name={[field.name, "freeQty"]} 
                  fieldKey={[field.fieldKey, "freeQty"]}
                  rules={optionalPositiveNumber("Free Qty")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Total Qty" 
                  name={[field.name, "totalQty"]} 
                  fieldKey={[field.fieldKey, "totalQty"]}
                >
                  <InputNumber className="w-full" disabled />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="UOM" 
                  name={[field.name, "uom"]} 
                  fieldKey={[field.fieldKey, "uom"]}
                >
                  <Select disabled={disabled}>
                    {purchaseSoudaJSON.uomOptions.map((u) => (
                      <Option key={u} value={u}>
                        {u}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* FIX: Rate with proper validation */}
              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Rate" 
                  name={[field.name, "rate"]} 
                  fieldKey={[field.fieldKey, "rate"]}
                  rules={requiredPositiveNumber("Rate")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>

              {/* FIX: Discount% with proper validation */}
              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Dis%" 
                  name={[field.name, "discountPercent"]} 
                  fieldKey={[field.fieldKey, "discountPercent"]}
                  rules={percentageValidation("Discount")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    max={100}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Gross Amount (₹)" 
                  name={[field.name, "grossAmount"]} 
                  fieldKey={[field.fieldKey, "grossAmount"]}
                >
                  <InputNumber className="w-full" disabled />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Discount Amt (₹)" 
                  name={[field.name, "discountAmt"]} 
                  fieldKey={[field.fieldKey, "discountAmt"]}
                >
                  <InputNumber className="w-full" disabled />
                </Form.Item>
              </Col>

              {/* FIX: SGST% with proper validation */}
              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="SGST %" 
                  name={[field.name, "sgstPercent"]} 
                  fieldKey={[field.fieldKey, "sgstPercent"]}
                  rules={percentageValidation("SGST")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    max={100}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>

              {/* FIX: CGST% with proper validation */}
              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="CGST %" 
                  name={[field.name, "cgstPercent"]} 
                  fieldKey={[field.fieldKey, "cgstPercent"]}
                  rules={percentageValidation("CGST")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    max={100}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>

              {/* FIX: IGST% with proper validation */}
              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="IGST %" 
                  name={[field.name, "igstPercent"]} 
                  fieldKey={[field.fieldKey, "igstPercent"]}
                  rules={percentageValidation("IGST")}
                >
                  <InputNumber 
                    {...positiveNumberInputProps}
                    max={100}
                    disabled={disabled} 
                    onChange={() => {
                      const all = form.getFieldsValue();
                      const computed = computeAllFromFormValues(all || {});
                      form.setFieldsValue({ items: computed.items });
                    }} 
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item 
                  {...field} 
                  label="Total GST (₹)" 
                  name={[field.name, "totalGST"]} 
                  fieldKey={[field.fieldKey, "totalGST"]}
                >
                  <InputNumber className="w-full" disabled />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item 
                  {...field} 
                  label="Total Amount (₹)" 
                  name={[field.name, "totalAmt"]} 
                  fieldKey={[field.fieldKey, "totalAmt"]}
                >
                  <InputNumber className="w-full" disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
      </>
    )}
  </Form.List>
);
  // ---------- Combined form content (Basic Info, Items, Tax) ----------
  const RenderFormBody = ({ form, disabled = false }) => (
    <>
      <Card size="small" style={{ marginBottom: 12, border: "1px solid #FDE68A" }} bodyStyle={{ padding: 12 }}>
        <h6 className="text-amber-500">Basic Information</h6>
        <Row gutter={16}>
           <Col span={6}>
       <Form.Item
  label="Company Name"
  name="organisation"
  rules={[{ required: true }]}
>
  <Select placeholder="Select Company" disabled={disabled}>
    {companies.map((c) => (
      <Select.Option key={c.id} value={c.id}>
        {c.name}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

        </Col>
          <Col span={6}>
           <Form.Item
  label="Plant Name"
  name="plant"
  rules={[{ required: true }]}
>
  <Select placeholder="Select Plant" disabled={disabled}>
    {companies.map((p) => (
      <Option key={p.id} value={p.id}>
        {p.name}
      </Option>
    ))}
  </Select>
</Form.Item>

          </Col>

          {/* <Col span={4}>
            <Form.Item label="Plant Code" name="plantCode">
              <Input disabled />
            </Form.Item>
          </Col> */}

         


       

          <Col span={6}>
            <Form.Item label="Souda Date" name="soudaDate" initialValue={dayjs()}>
              <DatePicker className="w-full" disabled />
            </Form.Item>
          </Col>

          {/* REMOVED Delivery Date; ADDED Start / End */}
          <Col span={6}>
            <Form.Item label="Start Date" name="startDate">
              <DatePicker className="w-full" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="End Date" name="endDate">
              <DatePicker className="w-full" disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card size="small" style={{ marginBottom: 12, border: "1px solid #FDE68A" }} bodyStyle={{ padding: 12 }}>
        <ItemsList form={form} disabled={disabled} />
      </Card>

      {/* Optional order-level totals display (read-only) */}
      <Card size="small" style={{ border: "1px solid #FDE68A" }} bodyStyle={{ padding: 12 }}>
        <h6 className="text-amber-500">Order Totals</h6>
        <Row gutter={12}>
          <Col span={6}>
            <Form.Item label="Total Qty" name={["orderTotals", "totalQty"]}>
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total Gross Amount (₹)" name={["orderTotals", "totalGrossAmount"]}>
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total Discount (₹)" name={["orderTotals", "totalDiscount"]}>
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Total GST (₹)" name={["orderTotals", "totalGST"]}>
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Grand Total (₹)" name={["orderTotals", "grandTotal"]}>
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Status" name="status" rules={[{ required: true }]}>
              <Select placeholder="Select Status" disabled={disabled}>
                {purchaseSoudaJSON.statusOptions.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  );

  // ---------- Add / Edit / View modals + wiring ----------
  useEffect(() => {
    // when opening edit modal, ensure computed fields exist
    if (isEditModalOpen && selectedRecord) {
      // convert dates to dayjs for DatePicker
      const pre = {
        ...selectedRecord,
        soudaDate: selectedRecord.soudaDate ? dayjs(selectedRecord.soudaDate) : undefined,
        startDate: selectedRecord.startDate ? dayjs(selectedRecord.startDate) : undefined,
        endDate: selectedRecord.endDate ? dayjs(selectedRecord.endDate) : undefined,
      };
      editForm.setFieldsValue(pre);
    }
  }, [isEditModalOpen, selectedRecord, editForm]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300!"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button icon={<FilterOutlined />} className="border-amber-400! text-amber-700! hover:bg-amber-100!" onClick={() => handleSearch("")}>
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button icon={<DownloadOutlined />} className="border-amber-400! text-amber-700! hover:bg-amber-100!">
            Export
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              addForm.resetFields();
              // initialize an empty item row
              addForm.setFieldsValue({
                items: [
                  {
                    lineKey: new Date().getTime(),
                    item: undefined,
                    itemCode: undefined,
                    qty: 0,
                    freeQty: 0,
                    totalQty: 0,
                    rate: 0,
                    discountPercent: 0,
                    grossAmount: 0,
                    uom: purchaseSoudaJSON.uomOptions[0],
                    sgstPercent: 0,
                    cgstPercent: 0,
                    igstPercent: 0,
                    tcsAmt: 0,
                  },
                ],
                orderTotals: {},
                soudaDate: dayjs(),
              });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Purchase Contract Records</h2>
        <Table columns={columns} dataSource={data} loading={loading} pagination={false} rowKey="key" scroll={{ y: 300 }} />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add New Purchase Contract</span>}
        open={isAddModalOpen}
        onCancel={() => {
          addForm.resetFields();
          setIsAddModalOpen(false);
        }}
        footer={null}
        width={1000}
      >
        <Form form={addForm} layout="vertical" onFinish={(vals) => handleFormSubmit(vals, "add")} onValuesChange={handleFormValuesChangeFactory(addForm)}>
          <RenderFormBody form={addForm} disabled={false} />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! border-none!">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Purchase Souda</span>}
        open={isEditModalOpen}
        onCancel={() => {
          editForm.resetFields();
          setIsEditModalOpen(false);
        }}
        footer={null}
        width={1000}
      >
        <Form form={editForm} layout="vertical" onFinish={(vals) => handleFormSubmit(vals, "edit")} onValuesChange={handleFormValuesChangeFactory(editForm)}>
          <RenderFormBody form={editForm} disabled={false} />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500 border-none">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">View Purchase Souda</span>}
        open={isViewModalOpen}
        onCancel={() => {
          viewForm.resetFields();
          setIsViewModalOpen(false);
        }}
        footer={null}
        width={1000}
      >
        <Form form={viewForm} layout="vertical">
          <RenderFormBody form={viewForm} disabled={true} />
        </Form>
      </Modal>
    </div>
  );
}
