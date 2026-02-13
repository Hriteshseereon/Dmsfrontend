// PurchaseSouda.jsx  
import React, { useState, useEffect, useMemo } from "react";
import {
  positiveNumberInputProps,
  percentageInputProps,
  blockNonNumericInput
} from "../../../helpers/numberInput";
import { requiredPositiveNumber, optionalPositiveNumber, percentageValidation } from "../../../helpers/formValidation";
import useSessionStore from "../../../../../store/sessionStore";
import { updateItemComputedFields } from "../../../helpers/calculation";
import { getPurchaseContract, getAllVendor, addPurchaseContract, getproductbyVendor, getPlantsByVendor ,getPurchaseContractById,updatePurchaseContract} from "../../../../../api/purchase";
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


export default function PurchaseSouda() {
  // forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  // vendors / companies
  const [plants, setPlants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const currentOrgId = useSessionStore.getState();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");


  useEffect(() => {
    fetchDropdownData();
    fetchPurchaseContracts();
    getPurchaseContract();
  }, []);



  // keep max 3 decimals, no trailing junk
  const round2 = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    return Number(Number(num).toFixed(2));
  };


  const fetchDropdownData = async () => {
    try {
      const [vendorRes, plantRes] = await Promise.all([
        getAllVendor(),   // vendor table


      ]);
      console.log("PLANT API DATA:", plantRes);
      setVendors(vendorRes);
    } catch (err) {
      console.error(err);
    }
  };




  // search (simple)
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      fetchPurchaseContracts();
      return;
    }

    const filtered = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );

    setData(filtered);
  };


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
        name: item.name,
        souda_number: item.souda_number,
        vendor_name: item.vendor_name,
        plant_name: item.plant_name,
        startDate: item.startDate,
        to_date: item.to_date,
        from_date: item.from_date,
        status: item.status,
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Failed to fetch purchase contracts", error);
    } finally {
      setLoading(false);
    }
  };
const handleEditClick = async (record) => {
  try {
    setLoading(true);

    const res = await getPurchaseContractById(record.key);

    setSelectedVendor(res.vendor);

    const productRes = await getproductbyVendor(res.vendor);
    setProducts(productRes?.products || []);

    const plantRes = await getPlantsByVendor(res.vendor);
    setPlants(plantRes || []);

    const items = res.items?.map((it) => ({
      product_id: it.product,
      item_name: it.item_name || "",
      base_unit: it.uom_details?.unit_name || "",
      hsn_id: it.hsn_id || null,
      hsn_code: it.hsn_code || "",

      qty: Number(it.qty),
      freeQty: Number(it.free_qty),
      totalQty: Number(it.total_qty),

      rate: Number(it.rate),
      discountPercent: Number(it.discount_percent),
      discountAmt: Number(it.discount_amount),

      grossAmount: Number(it.gross_amount),

      sgstPercent: Number(it.sgst_percent),
      cgstPercent: Number(it.cgst_percent),
      igstPercent: Number(it.igst_percent),

      totalGST: Number(it.total_gst_amount),
      totalAmt: Number(it.total_amount),
    })) || [];

    // ✅ COMPUTE TOTALS HERE
    const computed = computeAllFromFormValues({ items });

    const formattedData = {
      vendor: res.vendor,
      vendor_name: res.vendor_name,
      plant: res.plant,
      plant_name: res.plant_name,
      from_date: res.from_date ? dayjs(res.from_date) : null,
      to_date: res.to_date ? dayjs(res.to_date) : null,
      status: res.status,

      items: computed.items,
      orderTotals: computed.orderTotals,   // ✅ ADD THIS
    };

    editForm.setFieldsValue(formattedData);

    setSelectedRecord(res);
    setIsEditModalOpen(true);

  } finally {
    setLoading(false);
  }
};


const handleEditSubmit = async (values) => {
  try {
    const orderTotals = values.orderTotals || {};

    const payload = {
      vendor: values.vendor,
      vendor_name: values.vendor_name,
      plant: values.plant,
      plant_name: values.plant_name,

      from_date: values.from_date
        ? dayjs(values.from_date).format("YYYY-MM-DD")
        : null,

      to_date: values.to_date
        ? dayjs(values.to_date).format("YYYY-MM-DD")
        : null,

      total_qty: round2(orderTotals.totalQty),
      gross_amount: round2(orderTotals.totalGrossAmount),
      total_discount: round2(orderTotals.totalDiscount),
      total_gst_amount: round2(orderTotals.totalGST),
      total_amount: round2(orderTotals.grandTotal),

      items: values.items.map((it) => ({
        product: it.product_id,
        uom: it.base_unit,
        hsn_id: it.hsn_id || null,
        hsn_code: it.hsn_code || "",
        item_name: it.item_name || "",
        qty: round2(it.qty),
        free_qty: round2(it.freeQty),
        total_qty: round2(it.totalQty),

        rate: round2(it.rate),

        discount_percent: round2(it.discountPercent),
        discount_amount: round2(it.discountAmt),

        gross_amount: round2(it.grossAmount),

        sgst_percent: round2(it.sgstPercent),
        cgst_percent: round2(it.cgstPercent),
        igst_percent: round2(it.igstPercent),

        total_gst_amount: round2(it.totalGST),
        total_amount: round2(it.totalAmt),
      })),
    };

    console.log("UPDATE PAYLOAD:", payload);

    await updatePurchaseContract(selectedRecord.id, payload);

    setIsEditModalOpen(false);
    fetchPurchaseContracts(); // refresh table

  } catch (error) {
    console.error("Update failed:", error);
  }
};
const handleViewClick = async (record) => {
  try {
    setLoading(true);

    const res = await getPurchaseContractById(record.key);

    const items = res.items?.map((it) => ({
      product_id: it.product,
      item_name: it.item_name || "",
      base_unit: it.uom_details?.unit_name || "",
      hsn_id: it.hsn_id || null,
      hsn_code: it.hsn_code || "",

      qty: Number(it.qty),
      freeQty: Number(it.free_qty),
      totalQty: Number(it.total_qty),

      rate: Number(it.rate),
      discountPercent: Number(it.discount_percent),
      discountAmt: Number(it.discount_amount),

      grossAmount: Number(it.gross_amount),

      sgstPercent: Number(it.sgst_percent),
      cgstPercent: Number(it.cgst_percent),
      igstPercent: Number(it.igst_percent),

      totalGST: Number(it.total_gst_amount),
      totalAmt: Number(it.total_amount),
    })) || [];

    // ✅ ADD THIS BLOCK HERE
    const computed = computeAllFromFormValues({ items });

    const formattedData = {
      vendor: res.vendor,
      plant: res.plant,
      from_date: res.from_date ? dayjs(res.from_date) : null,
      to_date: res.to_date ? dayjs(res.to_date) : null,
      items: computed.items,                // ✅ use computed items
      orderTotals: computed.orderTotals,  
      status: res.status  // ✅ ADD THIS
    };

    viewForm.setFieldsValue(formattedData);

    setIsViewModalOpen(true);

  } finally {
    setLoading(false);
  }
};





  // ---------- Table columns ----------
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Souda No</span>,
      dataIndex: "souda_number",

      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plant_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vendor Name</span>,
      dataIndex: "vendor_name",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
      width: 100,
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
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">End Date</span>,
      dataIndex: "to_date",
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },



    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 100,
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
      width: 80,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
           onClick={() => handleViewClick(record)}

          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
           onClick={() => handleEditClick(record)}

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

      const totalQty = round2(qty + freeQty);

      const grossAmount = round2(qty * rate);

      const discountAmt = round2((grossAmount * discountPercent) / 100);

      const taxable = round2(grossAmount - discountAmt);

      const sgst = round2((taxable * sgstPercent) / 100);
      const cgst = round2((taxable * cgstPercent) / 100);
      const igst = round2((taxable * igstPercent) / 100);

      const totalGST = round2(sgst + cgst + igst);

      const totalAmt = round2(taxable + totalGST + tcsAmt);

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
      totalQty: round2(items.reduce((s, it) => s + Number(it.totalQty || 0), 0)),
      totalGrossAmount: round2(items.reduce((s, it) => s + Number(it.grossAmount || 0), 0)),
      totalDiscount: round2(items.reduce((s, it) => s + Number(it.discountAmt || 0), 0)),
      totalGST: round2(items.reduce((s, it) => s + Number(it.totalGST || 0), 0)),
      grandTotal: round2(items.reduce((s, it) => s + Number(it.totalAmt || 0), 0)),
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
    const orderTotals = values.orderTotals || {};

    const payload = {
      organisation: currentOrgId,
      vendor: values.vendor,
      vendor_name: values.vendor_name,
      plant: values.plant,
      plant_name: values.plant_name,

      from_date: dayjs(values.from_date).format("YYYY-MM-DD"),
      to_date: dayjs(values.to_date).format("YYYY-MM-DD"),

      total_qty: round2(orderTotals.totalQty),
      gross_amount: round2(orderTotals.totalGrossAmount),
      total_discount: round2(orderTotals.totalDiscount),
      total_gst_amount: round2(orderTotals.totalGST),
      total_amount: round2(orderTotals.grandTotal),
      grand_total: round2(orderTotals.grandTotal),

      items: values.items.map((it) => ({
        product: it.product_id,
        uom: it.base_unit || null,

        qty: round2(it.qty),
        free_qty: round2(it.freeQty),
        total_qty: round2(it.totalQty),

        rate: round2(it.rate),
        item_name: it.item_name || "",
        hsn_id: it.hsn_id || null,
        hsn_code: it.hsn_code || "",
        
        discount_percent: round2(it.discountPercent),
        discount_amount: round2(it.discountAmt),

        gross_amount: round2(it.grossAmount),

        sgst_percent: round2(it.sgstPercent),
        cgst_percent: round2(it.cgstPercent),
        igst_percent: round2(it.igstPercent),

        total_gst_amount: round2(it.totalGST),
        total_amount: round2(it.totalAmt),
      })),
    };


    console.log("FINAL PAYLOAD:", payload);
    await addPurchaseContract(payload);
    setIsAddModalOpen(false);
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

                    qty: 0,
                    freeQty: 0,
                    totalQty: 0,
                    rate: 0,
                    discountPercent: 0,
                    discountAmt: 0,
                    grossAmount: 0,
                    base_unit: null,
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
                <Col span={4}>
                  <Form.Item
                    {...field}
                    label="Item Name"
                    name={[field.name, "product_id"]}
                    rules={[{ required: true, message: "Item is required" }]}
                  >
                    <Select
                      placeholder={!selectedVendor ? "Select vendor first" : "Select Item"}
                      disabled={!selectedVendor || products.length === 0}
                      onChange={(productId) => {
                        const selected = products.find(p => p.id === productId);

                        form.setFields([
                          { name: ["items", field.name, "product_id"], value: productId },

                          // ✅ SHOW IN UI
                          { name: ["items", field.name, "hsn_code"], value: selected?.hsn_code_value || "" },

                          // ✅ SEND TO BACKEND (ID)
                          { name: ["items", field.name, "hsn_id"], value: selected?.hsn_code || null },

                          { name: ["items", field.name, "item_name"], value: selected?.name || "" },
                          { name: ["items", field.name, "base_unit"], value: selected?.base_unit || "" },
                          { name: ["items", field.name, "rate"], value: selected?.rate || 0 },
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
                  <Form.Item label="Item Code" name={[field.name, "hsn_code"]}>
                    <Input disabled />
                  </Form.Item>

                </Col>


                {/* FIX: Qty with proper validation */}
                <Col span={4}>
                  <Form.Item
                    {...field}
                    label="Qty"
                    name={[field.name, "qty"]}
                                    rules={[
                       { required: true, message: "Quantity is required" },
                       {
                         validator: (_, value) =>
                           value >= 0
                             ? Promise.resolve()
                             : Promise.reject("Enter valid positive number"),
                       },
                     ]}  >
                    <Input

                      disabled={disabled}
                      onChange={() => {
                        const all = form.getFieldsValue();
                        const computed = computeAllFromFormValues(all || {});
                        form.setFieldsValue({ items: computed.items });
                      }}
                      className="w-full!"
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
                                     rules={[
                        { required: true, message: " Free Quantity is required" },
                        {
                          validator: (_, value) =>
                            value >= 0
                              ? Promise.resolve()
                              : Promise.reject("Enter valid positive number"),
                        },
                      ]}
                  >
                    <Input
                      
                      disabled={disabled}
                      onChange={() => {
                        const all = form.getFieldsValue();
                        const computed = computeAllFromFormValues(all || {});
                        form.setFieldsValue({ items: computed.items });
                      }}
                      className="w-full!"
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
                    <InputNumber className="w-full!" disabled />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item {...field} label="UOM" name={[field.name, "base_unit"]}>
                    <Input disabled />
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
                      className="w-full!"
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
                                    rules={[
                       { required: true, message: "Discount % is required" },
                       {
                         validator: (_, value) =>
                           value >= 0
                             ? Promise.resolve()
                             : Promise.reject("Enter valid positive number"),
                       },
                     ]}  >
                    <Input
                     
                      max={100}
                      disabled={disabled}
                      onChange={() => {
                        const all = form.getFieldsValue();
                        const computed = computeAllFromFormValues(all || {});
                        form.setFieldsValue({ items: computed.items });
                      }}
                      className="w-full!"
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
                    <InputNumber className="w-full!" disabled />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item
                    {...field}
                    label="Discount Amt (₹)"
                    name={[field.name, "discountAmt"]}
                    fieldKey={[field.fieldKey, "discountAmt"]}
                  >
                    <InputNumber className="w-full!" disabled />
                  </Form.Item>
                </Col>

                {/* FIX: SGST% with proper validation */}
                <Col span={4}>
                  <Form.Item
                    {...field}
                    label="SGST %"
                    name={[field.name, "sgstPercent"]}
                    fieldKey={[field.fieldKey, "sgstPercent"]}
                                     rules={[
                        { required: true, message: "SGST % is required" },
                        {
                          validator: (_, value) =>
                            value >= 0
                              ? Promise.resolve()
                              : Promise.reject("Enter valid positive number"),
                        },
                      ]}
                  >
                    <Input
                     
                      max={100}
                      disabled={disabled}
                      onChange={() => {
                        const all = form.getFieldsValue();
                        const computed = computeAllFromFormValues(all || {});
                        form.setFieldsValue({ items: computed.items });
                      }}
                      className="w-full!"
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
                                    rules={[
                       { required: true, message: "CGST % is required" },
                       {
                         validator: (_, value) =>
                           value >= 0
                             ? Promise.resolve()
                             : Promise.reject("Enter valid positive number"),
                       },
                     ]}
                  >
                    <Input
                     
                      max={100}
                      disabled={disabled}
                      onChange={() => {
                        const all = form.getFieldsValue();
                        const computed = computeAllFromFormValues(all || {});
                        form.setFieldsValue({ items: computed.items });
                      }}
                      className="w-full!"
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
                    rules={[
                      { required: true, message: "IGST % is required" },
                      {
                        validator: (_, value) =>
                          value >= 0
                            ? Promise.resolve()
                            : Promise.reject("Enter valid positive number"),
                      },
                    ]}
                  >
                    <Input
                    
                      max={100}
                      disabled={disabled}
                      onChange={() => {
                        const all = form.getFieldsValue();
                        const computed = computeAllFromFormValues(all || {});
                        form.setFieldsValue({ items: computed.items });
                      }}
                      className="w-full!"
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
                    <InputNumber className="w-full!" disabled />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    {...field}
                    label="Total Amount (₹)"
                    name={[field.name, "totalAmt"]}
                    fieldKey={[field.fieldKey, "totalAmt"]}
                  >
                    <InputNumber className="w-full!" disabled />
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
          <Col span={4}>
            <Form.Item
              label="Vendor Name"
              name="vendor"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select Vendor"
                showSearch
                optionFilterProp="label"
                onChange={async (vendorId) => {
                  const selectedVendorObj = vendors.find(v => v.id === vendorId);

                  setSelectedVendor(vendorId);

                  // ✅ STORE VENDOR NAME
                  addForm.setFieldsValue({
                    vendor_name: selectedVendorObj?.name || "",
                  });

                  // fetch products
                  const productRes = await getproductbyVendor(vendorId);
                  setProducts(productRes?.products || []);

                  // fetch plants
                  const plantRes = await getPlantsByVendor(vendorId);
                  setPlants(plantRes || []);

                  // reset plant
                  addForm.setFieldsValue({ plant: undefined });
                }}
              >
                {vendors.map(v => (
                  <Select.Option key={v.id} value={v.id} label={v.name}>
                    {v.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>








          </Col>
          <Col span={4}>
            <Form.Item
              label="Plant Name"
              name="plant"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select Plant"
                showSearch
                optionFilterProp="label"
                onChange={(plantId) => {
                  const selectedPlantObj = plants.find(p => p.id === plantId);

                  // ✅ STORE PLANT NAME
                  addForm.setFieldsValue({
                    plant_name: selectedPlantObj?.name || "",
                  });
                }}
              >
                {plants.map(p => (
                  <Select.Option
                    key={p.id}
                    value={p.id}
                    label={p.name}
                  >
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>





          </Col>








          <Col span={4}>
            <Form.Item label="Souda Date" name="soudaDate" initialValue={dayjs()}>
              <DatePicker className="w-full" disabled />
            </Form.Item>
          </Col>

          {/* REMOVED Delivery Date; ADDED Start / End */}
          <Col span={4}>
            <Form.Item label="Start Date" name="from_date">
              <DatePicker className="w-full"  disabledDate={(current) =>
     current && current.isBefore(dayjs(), "day")
    } />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="End Date" name="to_date">
              <DatePicker className="w-full" disabledDate={(current) =>
      current &&
      addForm.getFieldValue("from_date") &&
      current < addForm.getFieldValue("from_date").startOf("day")
    } />
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
          <Col span={4}>
            <Form.Item label="Total Qty" name={["orderTotals", "totalQty"]}>
              <InputNumber className="w-full!" disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Total Gross Amount" name={["orderTotals", "totalGrossAmount"]}>
              <InputNumber className="w-full!" disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Total Discount (₹)" name={["orderTotals", "totalDiscount"]}>
              <InputNumber className="w-full!" disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Total GST (₹)" name={["orderTotals", "totalGST"]}>
              <InputNumber className="w-full!" disabled />
            </Form.Item>
          </Col>

          {/* <Col span={6}>
            <Form.Item label="Grand Total (₹)" name={["orderTotals", "grandTotal"]}>
              <InputNumber className="w-full" disabled />
            </Form.Item>
          </Col> */}

          <Col span={4}>
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

                    qty: 0,
                    freeQty: 0,
                    totalQty: 0,
                    rate: 0,
                    discountPercent: 0,
                    grossAmount: 0,
                    base_unit: null,
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
  <Form
    form={editForm}
    layout="vertical"
    onFinish={handleEditSubmit}   // ✅ THIS IS WHERE YOU ADD
    onValuesChange={handleFormValuesChangeFactory(editForm)}
  >
    <RenderFormBody form={editForm} disabled={false} />

    <div className="flex justify-end gap-2 mt-4">
      <Button onClick={() => setIsEditModalOpen(false)}>
        Cancel
      </Button>

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