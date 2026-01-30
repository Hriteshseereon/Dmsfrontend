// PurchaseSouda.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  positiveNumberInputProps,
  percentageInputProps,
  blockNonNumericInput
} from "../../../helpers/numberInput";
import { requiredPositiveNumber, optionalPositiveNumber, percentageValidation } from "../../../helpers/formValidation";
import { updateItemComputedFields } from "../../../helpers/calculation";
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
  message,
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
import { createPurchaseContract, getProductGroups, getProducts, getPurchaseContracts, getVendors, updatePurchaseContract } from "../../../../../api/purchase";
import useSessionStore from "../../../../../store/sessionStore";

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
  statusOptions: [
    { label: "Fresh", value: "Fresh" },
    { label: "Approved", value: "Approved" },
    { label: "Expired", value: "Expired" },
    { label: "Updated", value: "Updated" },
  ],
};


export default function PurchaseSouda() {

  const isEditInitializing = useRef(false);

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [productGroups, setProductGroups] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setVendors(await getVendors());
        setProducts(await getProducts());
        setProductGroups(await getProductGroups());
      } catch {
        message.error("Failed to load master data");
      }
    };
    load();
  }, []);

  const money = (n) => Number(Number(n || 0).toFixed(2));

  const buildAddContractPayload = (values) => ({
    contract_number: `PC-${Date.now()}`,
    vendor: values.vendor,
    product_group_name: values.product_group_name,
    status: values.status,

    from_date: dayjs(values.startDate).format("YYYY-MM-DD"),
    to_date: dayjs(values.endDate).format("YYYY-MM-DD"),

    customer_mobile: "NA",
    customer_email: "na@na.com",

    total_qty: money(values.orderTotals?.totalQty),
    gross_amount: money(values.orderTotals?.totalGrossAmount),
    total_discount: money(values.orderTotals?.totalDiscount),
    total_gst_amount: money(values.orderTotals?.totalGST),
    total_amount: money(values.orderTotals?.grandTotal),
    grand_total: money(values.orderTotals?.grandTotal),

    narration: "Purchase Contract",

    items: values.items.map((it) => ({
      product: it.product,
      hsn_code: it.hsn_code,

      qty: money(it.qty),
      free_qty: money(it.freeQty),
      total_qty: money(it.totalQty),

      rate: money(it.rate),

      discount_percent: money(it.discountPercent),
      discount_amount: money(it.discountAmt),

      gross_amount: money(it.grossAmount),

      sgst_percent: money(it.sgstPercent),
      cgst_percent: money(it.cgstPercent),
      igst_percent: money(it.igstPercent),

      sgst_amount: money(it.sgst),
      cgst_amount: money(it.cgst),
      igst_amount: money(it.igst),

      total_gst_amount: money(it.totalGST),
      total_amount: money(it.totalAmt),
    })),
  });


  const buildUpdateContractPayload = (values) => ({
    vendor: values.vendor,
    product_group_name: values.product_group_name,
    status: values.status,

    from_date: values.startDate
      ? dayjs(values.startDate).format("YYYY-MM-DD")
      : null,

    to_date: values.endDate
      ? dayjs(values.endDate).format("YYYY-MM-DD")
      : null,

    total_qty: money(values.orderTotals?.totalQty),
    gross_amount: money(values.orderTotals?.totalGrossAmount),
    total_discount: money(values.orderTotals?.totalDiscount),
    total_gst_amount: money(values.orderTotals?.totalGST),
    total_amount: money(values.orderTotals?.grandTotal),
    grand_total: money(values.orderTotals?.grandTotal),

    narration: "Updated Purchase Contract",

    items: values.items.map((it) => ({
      product: it.product,
      hsn_code: it.hsn_code,

      qty: money(it.qty),
      free_qty: money(it.freeQty),
      total_qty: money(it.totalQty),

      rate: money(it.rate),

      discount_percent: money(it.discountPercent),
      discount_amount: money(it.discountAmt),

      gross_amount: money(it.grossAmount),

      sgst_percent: money(it.sgstPercent),
      cgst_percent: money(it.cgstPercent),
      igst_percent: money(it.igstPercent),

      sgst_amount: money(it.sgst),
      cgst_amount: money(it.cgst),
      igst_amount: money(it.igst),

      total_gst_amount: money(it.totalGST),
      total_amount: money(it.totalAmt),
    })),
  });



  // forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseContracts();

      // normalize backend response
      const mapped = res.map((c) => ({
        id: c.id,
        key: c.id,
        plantName: c.product_group_name,
        companyName: vendorMap[c.vendor] || "",
        startDate: c.from_date,
        endDate: c.to_date,
        status: c.status,
        raw: c,
      }));

      setData(mapped);
    } catch (e) {
      message.error("Failed to load purchase contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendors.length) {
      loadContracts();
    }
  }, [vendors]);


  // product map
  const productMap = useMemo(() => {
    const m = {};
    products.forEach((p) => (m[p.id] = p));
    return m;
  }, [products]);

  const vendorMap = useMemo(() => {
    const map = {};
    vendors.forEach(v => {
      map[v.id] = v.name;
    });
    return map;
  }, [vendors]);


  // search
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      loadContracts();
      return;
    }

    const filtered = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );
    setData(filtered);
  };


  // ---------- Table columns ----------
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
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
      dataIndex: "startDate",
      width: 110,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">End Date</span>,
      dataIndex: "endDate",
      width: 110,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Company</span>,
      dataIndex: "companyName",
      width: 140,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Item(s)</span>,
    //   dataIndex: "items",
    //   width: 300,
    //   render: (items = []) => (
    //     <div className="text-amber-800">
    //       {items.map((it) => (
    //         <div key={it.lineKey} className="text-sm">
    //           <strong>{it.item}</strong> — {it.qty} {it.uom} @ ₹{it.rate} = ₹
    //           {Number(it.grossAmount || 0).toLocaleString()}
    //         </div>
    //       ))}
    //     </div>
    //   ),
    // },
    // {
    //   title: <span className="text-amber-700 font-semibold">Total Qty</span>,
    //   dataIndex: "items",
    //   width: 120,
    //   render: (items = []) => {
    //     const totalQty = items.reduce((s, it) => s + Number(it.totalQty || 0), 0);
    //     const uom = items[0]?.uom || "";
    //     return (
    //       <span className="text-amber-800">
    //         {totalQty} {uom}
    //       </span>
    //     );
    //   },
    // },
    // {
    //   title: (
    //     <span className="text-amber-700 font-semibold">Total Amount (₹)</span>
    //   ),
    //   dataIndex: "items",
    //   width: 140,
    //   render: (items = []) => {
    //     const total = items.reduce((s, it) => s + Number(it.totalAmt || 0), 0);
    //     return <span className="text-amber-800">₹{total.toLocaleString()}</span>;
    //   },
    // },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";

        if (status === "Fresh")
          return <span className={`${base} bg-yellow-100 text-yellow-700`}>Fresh</span>;

        if (status === "Approved")
          return <span className={`${base} bg-green-100 text-green-700`}>Approved</span>;

        if (status === "Updated")
          return <span className={`${base} bg-blue-100 text-blue-700`}>Updated</span>;

        if (status === "Expired")
          return <span className={`${base} bg-red-200 text-red-700`}>Expired</span>;

        return <span className={`${base} bg-gray-200 text-gray-700`}>{status}</span>;
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
              const c = record.raw;
              setSelectedRecord(c);

              viewForm.setFieldsValue({
                vendor: c.vendor,
                product_group_name: c.product_group_name,
                status: c.status,
                startDate: c.from_date ? dayjs(c.from_date) : null,
                endDate: c.to_date ? dayjs(c.to_date) : null,
                items: c.items || [],
              });

              setIsViewModalOpen(true);
            }}

          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              isEditInitializing.current = true;

              setSelectedRecord(record.raw);
              // preload edit form (convert dates)
              editForm.setFieldsValue({
                ...record.raw,
                startDate: record.raw.from_date ? dayjs(record.raw.from_date) : null,
                endDate: record.raw.to_date ? dayjs(record.raw.to_date) : null,
                product_group_name: record.raw.product_group_name,
                vendor: record.raw.vendor,
                status: record.raw.status,
                items: (record.raw.items || []).map(it => ({
                  product: it.product,
                  hsn_code: it.hsn_code,

                  qty: it.qty,
                  freeQty: it.free_qty,
                  totalQty: it.total_qty,

                  rate: it.rate,
                  discountPercent: it.discount_percent,
                  discountAmt: it.discount_amount,

                  grossAmount: it.gross_amount,

                  sgstPercent: it.sgst_percent,
                  cgstPercent: it.cgst_percent,
                  igstPercent: it.igst_percent,

                  sgst: it.sgst_amount,
                  cgst: it.cgst_amount,
                  igst: it.igst_amount,

                  totalGST: it.total_gst_amount,
                  totalAmt: it.total_amount,
                })),
              });

              setTimeout(() => {
                isEditInitializing.current = false;
              }, 0);

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
  const handleFormValuesChangeFactory = (form) => (changed, allValues) => {
    // prevent loops caused by setFieldsValue
    if (isEditInitializing.current) return;
    if (!changed?.items) return;
    if (!allValues?.items?.length) return;

    const computed = computeAllFromFormValues(allValues);

    form.setFieldsValue({
      items: computed.items,
      orderTotals: computed.orderTotals,
    });
  };


  // ---------- Form submit ----------
  const handleFormSubmit = async (values, mode) => {
    try {
      if (mode === "add") {
        const payload = buildAddContractPayload(values);

        await createPurchaseContract(payload);
        message.success("Purchase contract created");
      }

      if (mode === "edit") {
        const payload = buildUpdateContractPayload(values);

        await updatePurchaseContract(selectedRecord.id, payload);
        message.success("Purchase contract updated");
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      addForm.resetFields();
      editForm.resetFields();
      loadContracts();
    } catch (err) {
      message.error("Operation failed");
    }
  };



  // ---------- Render Form Sections ----------
  // render item list (Form.List)
  // const ItemsList = ({ form, disabled = false }) => (
  //   <Form.List name="items">
  //     {(fields, { add, remove }) => (
  //       <>
  //         <div className="mb-2 flex justify-between items-center">
  //           <h6 className="text-amber-500">Items</h6>
  //           {!disabled && (
  //             <Button
  //               type="dashed"
  //               icon={<PlusOutlined />}
  //               onClick={() =>
  //                 add({
  //                   lineKey: new Date().getTime(),
  //                   item: undefined,
  //                   itemCode: undefined,
  //                   qty: 0,
  //                   freeQty: 0,
  //                   totalQty: 0,
  //                   rate: 0,
  //                   discountPercent: 0,
  //                   discountAmt: 0,
  //                   grossAmount: 0,
  //                   uom: purchaseSoudaJSON.uomOptions[0],
  //                 })
  //               }
  //             >
  //               Add Item
  //             </Button>
  //           )}
  //         </div>

  //         {fields.map((field, index) => (
  //           <Card
  //             key={field.key}
  //             size="small"
  //             style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
  //             bodyStyle={{ padding: 12 }}
  //             extra={
  //               !disabled && (
  //                 <Button
  //                   type="text"
  //                   danger
  //                   icon={<DeleteOutlined />}
  //                   onClick={() => remove(field.name)}
  //                 />
  //               )
  //             }
  //           >
  //             <Row gutter={12} align="middle">
  //               <Col span={6}>
  //                 <Form.Item
  //                   {...field}
  //                   label="Item Name"
  //                   name={[field.name, "item"]}
  //                   fieldKey={[field.fieldKey, "item"]}
  //                   rules={[{ required: true }]}
  //                 >
  //                   <Select
  //                     placeholder="Select Item"
  //                     disabled={disabled}
  //                     onChange={(val) => {
  //                       // autofill itemCode, rate and uom when item selected
  //                       const selected = itemMap[val];
  //                       const baseForm = form;
  //                       baseForm.setFields([
  //                         { name: ["items", field.name, "itemCode"], value: selected?.code || "" },
  //                         { name: ["items", field.name, "rate"], value: selected?.rate ?? 0 },
  //                         { name: ["items", field.name, "uom"], value: selected?.uom ?? purchaseSoudaJSON.uomOptions[0] },
  //                       ]);
  //                       // after setting values, recompute derived fields
  //                       const all = baseForm.getFieldsValue();
  //                       const computed = computeAllFromFormValues(all || {});
  //                       baseForm.setFieldsValue({ items: computed.items });
  //                     }}
  //                   >
  //                     {purchaseSoudaJSON.itemOptions.map((opt) => (
  //                       <Option key={opt.name} value={opt.name}>
  //                         {opt.name}
  //                       </Option>
  //                     ))}
  //                   </Select>
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Item Code" name={[field.name, "itemCode"]} fieldKey={[field.fieldKey, "itemCode"]}>
  //                   <Input disabled />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Qty" name={[field.name, "qty"]} rules={requiredPositiveNumber("Quantity")}>
  //                   <InputNumber {...positiveNumberInputProps}className="w-full" disabled={disabled} onChange={() => {
  //                     // recompute when qty changes
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Free Qty" name={[field.name, "freeQty"]} fieldKey={[field.fieldKey, "freeQty"]}>
  //                   <InputNumber min={0} className="w-full" disabled={disabled} onChange={() => {
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Total Qty" name={[field.name, "totalQty"]} fieldKey={[field.fieldKey, "totalQty"]}>
  //                   <InputNumber className="w-full" disabled />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="UOM" name={[field.name, "uom"]} fieldKey={[field.fieldKey, "uom"]}>
  //                   <Select disabled={disabled}>
  //                     {purchaseSoudaJSON.uomOptions.map((u) => (
  //                       <Option key={u} value={u}>
  //                         {u}
  //                       </Option>
  //                     ))}
  //                   </Select>
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Rate" name={[field.name, "rate"]} fieldKey={[field.fieldKey, "rate"]}>
  //                   <InputNumber min={0} className="w-full" disabled={disabled} onChange={() => {
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Dis%" name={[field.name, "discountPercent"]} fieldKey={[field.fieldKey, "discountPercent"]}>
  //                   <InputNumber min={0} max={100} className="w-full" disabled={disabled} onChange={() => {
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Gross Amount (₹)" name={[field.name, "grossAmount"]} fieldKey={[field.fieldKey, "grossAmount"]}>
  //                   <InputNumber className="w-full" disabled />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Discount Amt (₹)" name={[field.name, "discountAmt"]} fieldKey={[field.fieldKey, "discountAmt"]}>
  //                   <InputNumber className="w-full" disabled />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="SGST %" name={[field.name, "sgstPercent"]} fieldKey={[field.fieldKey, "sgstPercent"]}>
  //                   <InputNumber min={0} max={100} className="w-full" disabled={disabled} onChange={() => {
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="CGST %" name={[field.name, "cgstPercent"]} fieldKey={[field.fieldKey, "cgstPercent"]}>
  //                   <InputNumber min={0} max={100} className="w-full" disabled={disabled} onChange={() => {
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="IGST %" name={[field.name, "igstPercent"]} fieldKey={[field.fieldKey, "igstPercent"]}>
  //                   <InputNumber min={0} max={100} className="w-full" disabled={disabled} onChange={() => {
  //                     const all = form.getFieldsValue();
  //                     const computed = computeAllFromFormValues(all || {});
  //                     form.setFieldsValue({ items: computed.items });
  //                   }} />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={4}>
  //                 <Form.Item {...field} label="Total GST (₹)" name={[field.name, "totalGST"]} fieldKey={[field.fieldKey, "totalGST"]}>
  //                   <InputNumber className="w-full" disabled />
  //                 </Form.Item>
  //               </Col>

  //               <Col span={6}>
  //                 <Form.Item {...field} label="Total Amount (₹)" name={[field.name, "totalAmt"]} fieldKey={[field.fieldKey, "totalAmt"]}>
  //                   <InputNumber className="w-full" disabled />
  //                 </Form.Item>
  //               </Col>
  //             </Row>
  //           </Card>
  //         ))}
  //       </>
  //     )}
  //   </Form.List>
  // );
  // ItemsList component with proper validation
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
                    key={field.key}
                    label="Item Name"
                    name={[field.name, "product"]}
                    fieldKey={[field.fieldKey, "product"]}
                    rules={[{ required: true, message: "Item is required" }]}
                  >
                    <Select
                      placeholder="Select Item"
                      disabled={disabled}
                      onChange={(productId) => {
                        const p = productMap[productId];
                        if (!p) return;

                        form.setFields([
                          { name: ["items", field.name, "product"], value: p.id },
                          { name: ["items", field.name, "hsn_code"], value: p.hsn_code_value },
                          { name: ["items", field.name, "sgstPercent"], value: p.sgst },
                          { name: ["items", field.name, "cgstPercent"], value: p.cgst },
                          { name: ["items", field.name, "rate"], value: p.mrp || 0 },
                        ]);
                      }}
                    >
                      {products.map((p) => (
                        <Option key={p.id} value={p.id}>
                          {p.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    key={field.key}
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
                    key={field.key}
                    label="Qty"
                    name={[field.name, "qty"]}
                    rules={requiredPositiveNumber("Quantity")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
                {/* FIX: Free Qty with proper validation */}
                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="Free Qty"
                    name={[field.name, "freeQty"]}
                    fieldKey={[field.fieldKey, "freeQty"]}
                    rules={optionalPositiveNumber("Free Qty")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      disabled={disabled}

                    />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="Total Qty"
                    name={[field.name, "totalQty"]}
                    fieldKey={[field.fieldKey, "totalQty"]}
                  >
                    <InputNumber className="w-full" disabled />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    key={field.key}
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
                    key={field.key}
                    label="Rate"
                    name={[field.name, "rate"]}
                    fieldKey={[field.fieldKey, "rate"]}
                    rules={requiredPositiveNumber("Rate")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      disabled={disabled}

                    />
                  </Form.Item>
                </Col>

                {/* FIX: Discount% with proper validation */}
                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="Dis%"
                    name={[field.name, "discountPercent"]}
                    fieldKey={[field.fieldKey, "discountPercent"]}
                    rules={percentageValidation("Discount")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      max={100}
                      disabled={disabled}

                    />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="Gross Amount (₹)"
                    name={[field.name, "grossAmount"]}
                    fieldKey={[field.fieldKey, "grossAmount"]}
                  >
                    <InputNumber className="w-full" disabled />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    key={field.key}
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
                    key={field.key}
                    label="SGST %"
                    name={[field.name, "sgstPercent"]}
                    fieldKey={[field.fieldKey, "sgstPercent"]}
                    rules={percentageValidation("SGST")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      max={100}
                      disabled={disabled}

                    />
                  </Form.Item>
                </Col>

                {/* FIX: CGST% with proper validation */}
                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="CGST %"
                    name={[field.name, "cgstPercent"]}
                    fieldKey={[field.fieldKey, "cgstPercent"]}
                    rules={percentageValidation("CGST")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      max={100}
                      disabled={disabled}

                    />
                  </Form.Item>
                </Col>

                {/* FIX: IGST% with proper validation */}
                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="IGST %"
                    name={[field.name, "igstPercent"]}
                    fieldKey={[field.fieldKey, "igstPercent"]}
                    rules={percentageValidation("IGST")}
                    validateTrigger="onBlur"
                  >
                    <InputNumber
                      {...positiveNumberInputProps}
                      max={100}
                      disabled={disabled}

                    />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    key={field.key}
                    label="Total GST (₹)"
                    name={[field.name, "totalGST"]}
                    fieldKey={[field.fieldKey, "totalGST"]}
                  >
                    <InputNumber className="w-full" disabled />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    key={field.key}
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
              name="vendor"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select Company" disabled={disabled}>
                {vendors.map((v) => (
                  <Select.Option key={v.id} value={v.id}>
                    {v.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Plant Name"
              name="product_group_name"
              rules={[{ required: true }]}>
              <Select
                placeholder="Select Plant"
                disabled={disabled}
              >
                {productGroups.map((pg) => (
                  <Option key={pg.id} value={pg.name}>
                    {pg.name}
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




          {/* <Col span={6}>
            <Form.Item label="Depo Name" name="depoName" rules={[{ required: true }]}>
              <Select placeholder="Select Depot" disabled={disabled}>
                {purchaseSoudaJSON.depoOptions.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
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
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  );


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
                status: "Fresh",
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
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          rowKey="id"
          scroll={{ y: 300 }} />
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
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(vals) => handleFormSubmit(vals, "edit")}
          onValuesChange={handleFormValuesChangeFactory(editForm)}
        >
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
