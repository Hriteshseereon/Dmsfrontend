import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  Divider,
  InputNumber,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getContracts, getContractById, createContract, updateContract, getVendors, getProductsByVendor } from "../api/contract";
import useSessionStore from "../store/sessionStore";

// --- Mock Data/JSON Extended ---
const contractJSON = {
  initialData: [
    {
      key: "C-0001",
      contractDate: "2025-10-01",
      startDate: "2025-10-05",
      endDate: "2025-10-31",
      orderNo: "1",
      items: [
        {
          companyName: "ABC Oils Ltd",
          item: "Palm Oil",
          itemCode: "IT23",
          qty: 2000,
          uom: "Ltrs",
          baseRate: 125.50,
          rate: 125.50,
          freeQty: 100,
          totalAmount: 251000.00
        },
      ],
      totalQty: 2000,
      uom: "Ltrs",
      location: "Warehouse A",
      status: "Approved",
      totalAmount: 251000.00,
      grossWt: 2100,
      type: "Retail",
      brokerName: "Broker 1",
      discountPercent: 5,
      discountAmt: 3354,
      deliveryDate: "2024-03-21",
      depoName: "Bhubaneswar Depo",
      totalGrossWt: 1020,
      grossAmount: 67080,
      sgstPercent: 5,
      cgstPercent: 5,
      igstPercent: 0,
      sgst: 3186,
      cgst: 3186,
      igst: 9,
      totalGST: 6372,
      tcsAmt: 500,
      itemGroup: "G1",
      hsnCode: "hsn1",
      netQty: 2,
      grossqty: 4,
      cust_phone: "4535467576",
      cust_email: "jaay@.com",
      deliveryAddress: "kdp",
      cashDiscounrt: 20,
      roundOffAmount: 340,
      naarration: "narrrr",
    },
    {
      key: "C-0002",
      contractDate: "2025-11-15",
      startDate: "2025-11-20",
      endDate: "2025-12-31",
      orderNo: "2",
      items: [
        {
          companyName: "XYZ Refineries",
          item: "Mustard Oil",
          itemCode: "MO101",
          qty: 500,
          uom: "Kg",
          baseRate: 180.00,
          rate: 180.00,
          freeQty: 0,
          totalAmount: 90000.00
        },
        {
          companyName: "XYZ Refineries",
          item: "Coconut Oil",
          itemCode: "CO202",
          qty: 1500,
          uom: "Ltrs",
          baseRate: 220.75,
          rate: 220.75,
          freeQty: 50,
          totalAmount: 331125.00
        },
      ],
      totalQty: 2000,
      uom: "Mixed",
      location: "Warehouse B",
      status: "Pending",
      totalAmount: 421125.00, // Updated Grand Total
      brokerName: "Broker 2",

    },
  ],
  companyOptions: ["ABC Oils Ltd", "XYZ Refineries", "PQR Traders"],
  uomOptions: ["Ltrs", "Kg", "Box", "Drum"], // Extended UOM options
  statusOptions: ["Approved", "Pending", "Rejected"],
  locationOptions: ["Warehouse A", "Warehouse B", "Warehouse C"],
};

// Mock data for item code and rate lookup
const itemDetailsByCompany = {
  "ABC Oils Ltd": {
    "Palm Oil": { itemCode: "IT23", rate: 125.50, uom: "Ltrs" },
    "Sunflower Oil": { itemCode: "SF45", rate: 140.00, uom: "Ltrs" },
  },
  "XYZ Refineries": {
    "Mustard Oil": { itemCode: "MO101", rate: 180.00, uom: "Kg" },
    "Coconut Oil": { itemCode: "CO202", rate: 220.75, uom: "Ltrs" },
  },
  "PQR Traders": {
    "Mustard Oil": { itemCode: "MO101", rate: 178.50, uom: "Kg" },
    "Palm Oil": { itemCode: "IT23", rate: 126.00, uom: "Ltrs" },
  }
};

// 🌟 Mock UOM Conversion Data (Simulates Backend)
const itemUomConversions = {
  "Sunflower Oil": {
    "Ltrs": { rateFactor: 1, qtyFactor: 1, baseUom: "Ltrs" },
    "Box": { rateFactor: 12, qtyFactor: 1 / 12, baseUom: "Ltrs" }, // Box is 12 Ltrs
    "Drum": { rateFactor: 200, qtyFactor: 1 / 200, baseUom: "Ltrs" }, // Drum is 200 Ltrs
  },
  "Mustard Oil": {
    "Kg": { rateFactor: 1, qtyFactor: 1, baseUom: "Kg" },
    "Box": { rateFactor: 15, qtyFactor: 1 / 15, baseUom: "Kg" }, // Box is 15 Kg
  },
  // Default to 1 for all others if no special conversion exists
};

// 1. Define Company to Location Mapping
const companyLocationMap = {
  "ABC Oils Ltd": "Warehouse A",
  "XYZ Refineries": "Warehouse B",
  "PQR Traders": "Warehouse C",
};


// Function to get item options for a specific company
const getItemOptionsForCompany = (companyName) => {
  return itemDetailsByCompany[companyName] ? Object.keys(itemDetailsByCompany[companyName]) : [];
};

const getCompanyNamesFromItems = (items) => {
  return (items || []).map(item => item.companyName).filter((value, index, self) => self.indexOf(value) === index).join(", ");
};

// 🌟 Helper function to calculate single item amount with conversion
const calculateItemAmount = (itemData) => {
  const qty = Number(itemData.qty || 0);
  const baseRate = Number(itemData.baseRate || 0); // Base rate is per base UOM (e.g., Ltr/Kg)
  const uom = itemData.uom;
  const itemName = itemData.item;

  if (!qty || qty <= 0 || baseRate <= 0) return 0;


  const conversions = itemUomConversions[itemName];
  let finalRate = baseRate;

  if (conversions && conversions[uom]) {
    // Rate Factor: How many base units are in one selected unit (e.g., 1 Box = 12 Ltrs)
    const rateFactor = conversions[uom].rateFactor || 1;
    finalRate = baseRate * rateFactor; // Rate per Box/Drum

    // Total quantity is the current Qty * Rate Factor (in base UOM)
    // The calculation is (QTY * Converted Rate)
    return qty * finalRate;
  }

  // If no conversion or using base UOM
  return qty * baseRate;
};


export default function Contract() {
  const { user, currentOrgId } = useSessionStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState(contractJSON.initialData);
  const [searchText, setSearchText] = useState("");
  const [totalAmount, setTotalAmount] = useState(0); // This is the GRAND TOTAL
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorProducts, setVendorProducts] = useState({}); // { vendorId: [products] }
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [contractsRes, vendorsRes] = await Promise.all([
        getContracts(),
        getVendors()
      ]);

      if (Array.isArray(contractsRes)) {
        setData(contractsRes);
      } else if (contractsRes?.results) {
        setData(contractsRes.results);
      }

      const vendorList = vendorsRes?.results || vendorsRes || [];
      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      message.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 🌟 Main logic to update the Grand Total
  const updateTotalAmount = useCallback((formInstance) => {
    const items = formInstance.getFieldValue("items") || [];
    let grandTotal = 0;

    // Use the calculated totalAmount from each item object
    items.forEach((it) => {
      grandTotal += Number(it.totalAmount || 0);
    });

    setTotalAmount(grandTotal);
    // Optionally, update the main form field for totalAmount if one existed
    // formInstance.setFieldsValue({ totalAmount: grandTotal });
  }, []);

  // Update total amount state when opening Edit modal
  useEffect(() => {
    if (isEditModalOpen && selectedRecord) {
      // Re-calculate the initial grand total when opening the edit modal
      const initialTotal = (selectedRecord.items || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      setTotalAmount(initialTotal);
    }
  }, [isEditModalOpen, selectedRecord]);


  const filteredData = data.filter(
    (item) => {
      const contractNo = item.sale_contract_number || "";
      const vendors = item.vendor_names?.join(" ") || "";
      const products = item.product_names?.join(" ") || "";
      const status = item.status || "";
      const search = searchText.toLowerCase();

      return contractNo.toLowerCase().includes(search) ||
        vendors.toLowerCase().includes(search) ||
        products.toLowerCase().includes(search) ||
        status.toLowerCase().includes(search);
    }
  );

  const calculateTotals = (items) => {
    if (!items || items.length === 0) return { totalQty: 0, uom: "" };
    const uomSet = new Set(items.map((i) => i.uom));
    const totalQty = items.reduce((s, it) => s + Number(it.qty || 0), 0);
    return { totalQty, uom: uomSet.size === 1 ? items[0].uom : (uomSet.size > 1 ? "Mixed" : "") };
  };


  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
      dataIndex: "sale_contract_number",
      width: 150,
      render: (text, record) => <span className="text-amber-800 ">{text || "N/A"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vendor</span>,
      width: 150,
      render: (_, r) => <span className="text-amber-800">{r.vendor_names?.join(", ") || "N/A"}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Items</span>,
      width: 250,
      render: (_, r) => {
        const productList = r.product_names || [];
        const short = productList.slice(0, 2).join(", ");
        return (
          <div className="text-amber-800">
            {short || "N/A"}
            {productList.length > 2 && <span>, ...</span>}
            <div className="text-xs text-amber-600">{r.items_count || 0} item(s)</div>
          </div>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Date Range</span>,
      width: 180,
      render: (_, r) => (
        <div className="text-xs text-amber-800">
          <div>From: {r.from_date || "N/A"}</div>
          <div>To: {r.to_date || "N/A"}</div>
        </div>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Grand Total</span>,
      dataIndex: "grand_total",
      width: 120,
      render: (value) => (
        <span className="text-amber-800 ">₹ {Number(value || 0).toFixed(2)}</span>
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved" || status === "Fresh")
          return <span className={`${base} bg-green-100 text-green-700`}>{status}</span>;
        if (status === "Pending")
          return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
        return <span className={`${base} bg-red-100 text-red-700`}>{status || "N/A"}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={async () => {
              try {
                setLoading(true);
                const contractDetails = await getContractById(record.sale_contract_id);
                // Map API response to UI model
                // Map API response STRICTLY to UI fields
                const mappedRecord = {
                  // Basic Contract Details
                  key: contractDetails.sale_contract_number,
                  contractDate: contractDetails.created_at ? dayjs(contractDetails.created_at).format("DD-MM-YYYY") : "",
                  startDate: contractDetails.from_date ? dayjs(contractDetails.from_date).format("DD-MM-YYYY") : "",
                  endDate: contractDetails.to_date ? dayjs(contractDetails.to_date).format("DD-MM-YYYY") : "",
                  deliveryDate: contractDetails.to_date ? dayjs(contractDetails.to_date).format("DD-MM-YYYY") : "",

                  location: contractDetails.location || "",
                  status: contractDetails.status,
                  customer_mobile: contractDetails.customer_mobile,
                  customer_email: contractDetails.customer_email,
                  totalAmount: Number(contractDetails.grand_total || 0).toFixed(2),
                  grossAmount: Number(contractDetails.total_amount || 0).toFixed(2),
                  sgstPercent: Number(contractDetails.sgst || 0),
  cgstPercent: Number(contractDetails.cgst || 0),
  igstPercent: Number(contractDetails.igst || 0),
  tcsAmt: Number(contractDetails.tcs_amount || 0),

  discountPercent: Number(contractDetails.items?.[0]?.discount_percent || 0),
  discountAmt: Number(contractDetails.items?.[0]?.discount_amount || 0),

                  // Fields not present in API response - mapped to empty string
                  depoName: "",
                  brokerName: contractDetails.broker || "",
                  type: "",
                  deliveryAddress: "",
                  naarration: contractDetails.narration || "",

                  items: (contractDetails.items || []).map(item => ({
                    companyName: item.vendor_name || vendors.find(v => v.id === item.vendor_id)?.name || "",
                    vendor_id: item.vendor_id,
                    item: item.product?.product_name || "",
                    product_id: item.product?.product_id,
                    itemCode: item.product?.product_code || item.product?.product_id || item.product?.id || "",
                    uom: item.uom?.unit_name || "",
                    uom_id: item.uom?.uom_id,
                    qty: Number(item.net_qty || item.gross_qty || 0),
                    rate: Number(item.mrp || 0).toFixed(2),
                    baseRate: Number(item.mrp || 0),
                    totalAmount: Number(item.line_total || 0).toFixed(2),
                    freeQty: Number(item.free_qty || 0),
                    discount_percent: item.discount_percent,
                    discount_amount: item.discount_amount
                  }))
                };

                setSelectedRecord(mappedRecord);

                viewForm.setFieldsValue({
                  ...mappedRecord,
                  contractDate: contractDetails.created_at ? dayjs(contractDetails.created_at) : undefined,
                  startDate: contractDetails.from_date ? dayjs(contractDetails.from_date) : undefined,
                  endDate: contractDetails.to_date ? dayjs(contractDetails.to_date) : undefined,
                });

                setIsViewModalOpen(true);
              } catch (error) {
                console.error("Error fetching contract details:", error);
                message.error("Failed to load contract details");
              } finally {
                setLoading(false);
              }
            }}
          />
          {record.status === "Fresh" && (
            <EditOutlined
              className="cursor-pointer! text-red-500!"
              onClick={async () => {
                try {
                  setLoading(true);
                  const contractDetails = await getContractById(record.sale_contract_id);
                  setSelectedRecord(contractDetails);

                  // Fetch products for all unique vendors in the contract
                  const uniqueVendorIds = [...new Set((contractDetails.items || []).map(i => i.vendor_id).filter(Boolean))];
                  for (const vId of uniqueVendorIds) {
                    if (!vendorProducts[vId]) {
                      const res = await getProductsByVendor(vId);
                      const products = res?.results || res || [];
                      setVendorProducts(prev => ({ ...prev, [vId]: products }));
                    }
                  }

                  const mappedItems = (contractDetails.items || []).map(item => ({
                    vendor_id: item.vendor_id,
                    companyName: item.vendor_name || vendors.find(v => v.id === item.vendor_id)?.name,
                    product_id: item.product?.product_id,
                    item: item.product?.product_name, // Name logic
                    itemCode: item.product?.product_code || item.product?.product_id || item.product?.id,
                    uom: item.uom?.unit_name,
                    uom_id: item.uom?.uom_id,
                    qty: Number(item.net_qty || item.gross_qty || 0),
                    rate: Number(item.mrp || 0),
                    baseRate: Number(item.mrp || 0),
                    totalAmount: Number(item.line_total || 0),
                    free_qty: Number(item.free_qty || 0),
                    discount_percent: item.discount_percent,
                    discount_amount: item.discount_amount
                  }));

                  // Calculate total amount from mapped items
                  const total = mappedItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
                  setTotalAmount(total);

                  editForm.setFieldsValue({
                    ...contractDetails,
                    key: contractDetails.sale_contract_number,
                    contractDate: contractDetails.created_at ? dayjs(contractDetails.created_at) : dayjs(),
                    startDate: contractDetails.from_date ? dayjs(contractDetails.from_date) : undefined,
                    endDate: contractDetails.to_date ? dayjs(contractDetails.to_date) : undefined,
                    items: mappedItems,
                  });
                  setIsEditModalOpen(true);
                } catch (error) {
                  console.error("Error fetching contract details for edit:", error);
                  message.error("Failed to load contract details");
                } finally {
                  setLoading(false);
                }
              }}
            />
          )}
        </div>
      ),
    },
  ];

  // 🌟 Logic to update a single item's rate and total amount
  const updateItemCalculations = (formInstance, rowIndex) => {
    const items = formInstance.getFieldValue('items') || [];
    const item = items[rowIndex];

    if (!item) return;

    // 1. Get current values
    const qty = Number(item.qty || 0);
    const selectedUomName = item.uom;
    const itemName = item.item;
    const baseRate = Number(item.baseRate || 0);
    const vendorId = item.vendor_id;
    const productId = item.product_id;

    let newRate = 0;
    let newUomId = item.uom_id;

    // 2. Always calculate default rate automatically
    const products = vendorProducts[vendorId] || [];
    const product = products.find(p => (p.product_id || p.id) === productId);
    const uomObj = product?.uoms?.find(u => u.unit_name === selectedUomName);

    if (uomObj) {
      // Use multiplier from API response
      const multiplier = Number(uomObj.multiplier || 1);
      newRate = baseRate * multiplier;
      newUomId = uomObj.uom_id !== undefined ? uomObj.uom_id : null;
    } else {
      // Fallback to legacy conversion if product uoms not found
      const conversions = itemUomConversions[itemName];
      if (conversions && conversions[selectedUomName]) {
        const rateFactor = conversions[selectedUomName].rateFactor || 1;
        newRate = baseRate * rateFactor;
      } else {
        newRate = baseRate;
      }
    }

    // 3. Calculate new total amount
    const newTotalAmount = qty * newRate;

    // 4. Update the item in the list
    items[rowIndex] = {
      ...item,
      rate: Number(newRate.toFixed(2)),
      totalAmount: Number(newTotalAmount.toFixed(2)),
      uom_id: newUomId,
    };

    // 5. Push updated list back to form and update Grand Total
    formInstance.setFieldsValue({ items });
    updateTotalAmount(formInstance);
  };


  // Logic to handle item selection change for auto-fill (Rate and Item Code)
 const handleItemSelect = (form, vendorId, productId, rowIndex) => {
  const products = vendorProducts[vendorId] || [];
  const product = products.find(p => (p.product_id || p.id) === productId);

  if (!product) return;

  const items = [...(form.getFieldValue('items') || [])];

  // ✅ Get BASE UOM
  const baseUomObj =
    product.uoms?.find(u => u.type === "base") || product.uoms?.[0];

  const baseUomName = baseUomObj?.unit_name || product.base_unit;
  const baseUomId = baseUomObj?.uom_id ?? null;

  // ✅ Get BASE PRICE from default_price
  const baseRate = Number(product.default_price?.base_price || 0);

  // ✅ Update row
  items[rowIndex] = {
    ...items[rowIndex],
    item: product.product_name,
    product_id: productId,
    itemCode: product.product_code || product.product_id,

    // 🔥 AUTO FILL
    uom: baseUomName,
    uom_id: baseUomId,
    baseRate: baseRate,
    rate: baseRate, // initial same as base

    qty: items[rowIndex]?.qty || 0,
    totalAmount: 0,
  };

  form.setFieldsValue({ items });

  // 🔥 Calculate total
  updateItemCalculations(form, rowIndex);
};
  const handleCompanyChange = async (form, vendorId, fieldName) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    // Fetch products for this vendor if not already fetched
    if (!vendorProducts[vendorId]) {
      try {
        const res = await getProductsByVendor(vendorId);
        const products = res?.results || res || [];
        setVendorProducts(prev => ({ ...prev, [vendorId]: products }));
      } catch (error) {
        console.error("Error fetching products:", error);
        message.error("Failed to load products for selected vendor");
      }
    }

    // Reset item details when company changes
    const items = form.getFieldValue("items") || [];
    const updatedItems = items.map((item, index) =>
      index === fieldName
        ? {
          ...item,
          companyName: vendor.name,
          vendor_id: vendor.id,
          item: undefined,
          product_id: undefined,
          itemCode: undefined,
          rate: undefined,
          baseRate: undefined, // Clear base rate
          uom: undefined,
          qty: 0,
          totalAmount: 0,
        }
        : item
    );

    form.setFieldsValue({ items: updatedItems });


    updateTotalAmount(form);
  };


  const handleFormSubmit = async (values, isEdit) => {
    const formInstance = isEdit ? editForm : addForm;
    const finalValues = values || formInstance.getFieldsValue();
    const items = finalValues.items && finalValues.items.length > 0 ? finalValues.items : [];

    const totals = calculateTotals(items);

    // Calculate Final Grand Total from item totals
    const grandTotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

    // Determine the next contract number
    const newContractNo = `C-${String(data.length + 1).padStart(4, '0')}`;

    const apiPayload = {
      location: finalValues.location || "N/A",
      product_group: null,
      from_date: finalValues.startDate ? finalValues.startDate.format("YYYY-MM-DD") : undefined,
      to_date: finalValues.endDate ? finalValues.endDate.format("YYYY-MM-DD") : undefined,
      broker: null,
      customer_mobile: finalValues.customer_mobile,
      customer_email: finalValues.customer_email,
      sgst: finalValues.sgst || 0,
      cgst: finalValues.cgst || 0,
      igst: finalValues.igst || 0,
      tcs_amount: finalValues.tcs_amount || 0,
      cash_discount: finalValues.cash_discount || 0,
      round_off_amount: finalValues.round_off_amount || 0,
      narration: finalValues.narration || "Customer created contract",
      items: items.map(item => ({
        vendor_id: item.vendor_id,
        product_id: item.product_id,
        uom_id: item.uom_id || null,
        net_qty: Number(item.qty || 0).toFixed(2),
        gross_qty: Number(item.qty || 0).toFixed(2),
        free_qty: Number(item.free_qty || 0).toFixed(2),
        mrp: Number(item.rate || 0).toFixed(2),
        discount_percent: Number(item.discount_percent || 0).toFixed(2),
        discount_amount: Number(item.discount_amount || 0).toFixed(2),
        line_total: Number(item.totalAmount || 0).toFixed(2)
      }))
    };

    try {
      if (isEdit) {
        await updateContract(selectedRecord.sale_contract_id, apiPayload);
        message.success("Contract updated successfully");
        fetchInitialData();
      } else {
        await createContract(apiPayload);
        message.success("Contract created successfully");
        fetchInitialData();
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Error submitting contract:", error);
      const errorData = error.response?.data;
      let errorMessage = "Failed to submit contract";

      if (errorData) {
        if (Array.isArray(errorData)) {
          errorMessage = errorData[0];
        } else if (typeof errorData === "object") {
          errorMessage = errorData.message || errorData.error || errorData.detail || JSON.stringify(errorData);
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      message.error(errorMessage);
    }
  };

  const renderBasicFields = (formInstance, disabled = false) => (
    <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
      <Row gutter={16}>

        <Col span={8}>
          <Form.Item
            name="contractDate"
            label="Contract Date"
            rules={[{ required: true, message: "Please select contract date" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
              disabled={true}
              disabledDate={() => true}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select Start Date" }]}
          >
            <DatePicker
              className="w-full"
              disabled={disabled}
              disabledDate={(current) => current && current.isBefore(dayjs().startOf("day"))}
              format="DD-MM-YYYY"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[
              { required: true, message: "Please select End Date" },
              {
                validator(_, value) {
                  const start = formInstance.getFieldValue("startDate");
                  if (start && value && value.isBefore(start, "day")) {
                    return Promise.reject(new Error("End Date cannot be before Start Date"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              className="w-full"
              disabled={disabled}
              disabledDate={(current) => current && current.isBefore(dayjs().startOf("day"))}
              format="DD-MM-YYYY"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please enter Location" }]}
          >
            <Input placeholder="Enter Location" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Status" name="status">
            <Select disabled placeholder="Pending">
              {contractJSON.statusOptions.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Customer Mobile"
            name="customer_mobile"
            rules={[{ required: true, message: "Please enter customer mobile" }]}
          >
            <Input placeholder="9999999999" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Customer Email"
            name="customer_email"
            rules={[
              { required: true, message: "Please enter customer email" },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="customer@test.com" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
    </div>

  );

  const renderItemRow = (formInstance, field, remove, disabled) => {
    const items = formInstance.getFieldValue('items');
    const currentItem = items && items[field.name];
    const vendorId = currentItem?.vendor_id;
    const productId = currentItem?.product_id;
    const product = vendorProducts[vendorId]?.find(p => (p.product_id || p.id) === productId);

    const selectedCompany = currentItem?.companyName;
    const itemOptions = getItemOptionsForCompany(selectedCompany);
    const selectedItemName = currentItem?.item;

    // Get UOM options based on the selected item. If no specific conversion, use defaults.
    const uomOptions = itemUomConversions[selectedItemName]
      ? Object.keys(itemUomConversions[selectedItemName])
      : contractJSON.uomOptions.filter(uom => uom === currentItem?.uom); // Only allow current UOM if no conversion exists.

    // If item is not selected, only allow default options
    const finalUomOptions = selectedItemName ? uomOptions : contractJSON.uomOptions;

    return (
      <Row
        gutter={24} // Reduced gutter slightly for more columns
        key={field.key}
        align="middle"
        className="mb-2 border-b border-dashed pb-2"
      >

        {/* Company */}
        <Col span={4}>
          <label>Vendor</label>
          <Form.Item
            {...field}
            name={[field.name, "vendor_id"]}
            fieldKey={[field.fieldKey, "vendor_id"]}
            rules={[{ required: true, message: "Select vendor" }]}
          >
            <Select
              placeholder="Select Vendor"
              disabled={disabled}
              onChange={(vendorId) =>
                handleCompanyChange(formInstance, vendorId, field.name)
              }
            >
              {(vendors || []).map((v) => (
                <Select.Option key={v.id} value={v.id}>{v.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Item Name */}
        <Col span={4}>
          <label>Item Name</label>
          <Form.Item
            {...field}
            name={[field.name, "product_id"]}
            fieldKey={[field.fieldKey, "product_id"]}
            rules={[{ required: true, message: "Select item" }]}
          >
            <Select
              placeholder="Select Item"
              disabled={disabled || !currentItem?.vendor_id}
              onChange={(value) =>
                handleItemSelect(
                  formInstance,
                  currentItem?.vendor_id,
                  value,
                  field.name
                )
              }
            >
              {(vendorProducts[currentItem?.vendor_id] || []).map((p) => (
                <Select.Option key={p.product_id || p.id} value={p.product_id || p.id}>{p.product_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* UOM - 🌟 MADE SELECTABLE 🌟 */}
        <Col span={4}>
          <label>UOM</label>
         <Form.Item
  {...field}
  name={[field.name, "uom"]}
  fieldKey={[field.fieldKey, "uom"]}
>
  <Select
    disabled
    value={formInstance.getFieldValue(["items", field.name, "uom"])}
  />
</Form.Item>
        </Col>

        {/* Quantity */}
        <Col span={4}>
          <label>Qty</label>
          <Form.Item
            {...field}
            name={[field.name, "qty"]}
            fieldKey={[field.fieldKey, "qty"]}
            rules={[
              { required: true, },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "") {
                    return Promise.reject(new Error("Quantity is required"));
                  }
                  if (Number(value) <= 0) {
                    return Promise.reject(new Error("Quantity must be greater than 0"));
                  }
                  return Promise.resolve();
                },
              },
            ]}

          >
            <InputNumber

              placeholder="Qty"
              disabled={disabled || !selectedItemName}
              onChange={() => updateItemCalculations(formInstance, field.name)}
            />

          </Form.Item>
        </Col>

        {/* Rate (Adjusted based on UOM/Conversion) */}
        <Col span={4}>
          <label>Rate (Per UOM)</label>
          <Form.Item
            {...field}
            name={[field.name, "rate"]}
            fieldKey={[field.fieldKey, "rate"]}
          >
            <InputNumber
              placeholder="Rate"
              className="w-full"
              disabled={disabled || !currentItem?.qty}
              readOnly
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\₹\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>

        {/* Item Total Amount - 🌟 NEW FIELD 🌟 */}
        <Col span={4}>
          <label>Item Total Amount</label>
          <Form.Item
            {...field}
            name={[field.name, "totalAmount"]}
            fieldKey={[field.fieldKey, "totalAmount"]}
          >
            <InputNumber
              placeholder="Item Total"
              className="w-full"
              disabled={disabled || !currentItem?.qty}
              readOnly
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\₹\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>

        {/* Remove Button */}
        <Col span={2}>
          {!disabled && (
            <MinusCircleOutlined className="text-red-500!"
              onClick={() => {
                remove(field.name);
                setTimeout(() => updateTotalAmount(formInstance), 0);
              }}
            />
          )}
        </Col>
      </Row>

    );
  };

  const renderItemSection = (formInstance, disabled) => (
    <>
      <h3 className="text-lg font-semibold text-amber-600 mb-2">Items</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => renderItemRow(formInstance, field, remove, disabled))}

              {!disabled && (
                <Form.Item className="mt-4">
                  <Button
                    type="dashed"
                    onClick={() => {
                      add({
                        companyName: undefined,
                        item: undefined,
                        itemCode: undefined,
                        qty: undefined,
                        uom: "Ltrs",
                        rate: 0,
                        baseRate: 0,
                        totalAmount: 0
                      });
                      setTimeout(() => updateTotalAmount(formInstance), 0);
                    }}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Item
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </div>

      {/* 🌟 Display Grand Total below item list 🌟 */}
      <div className="flex justify-end p-2 bg-amber-50 rounded-lg">
        <Space size="large">
          <span className="text-lg font-semibold text-amber-700">Grand Total:</span>
          <span className="text-2xl font-semibold text-amber-700">
            ₹ {Number(totalAmount).toFixed(2)}
          </span>
        </Space>
      </div>
    </>
  );

  const renderApprovedView = () => (
    <div >
      {/* ... (renderApprovedView remains largely the same, but the totalAmount for the contract is correctly calculated) */}
      <h3 className="text-xl font-semibold text-amber-600 mb-4">Contract & Party Details</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Contract No.">
              <Input value={selectedRecord?.key} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Contract Date">
              <Input value={selectedRecord?.contractDate} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Start Date">
              <Input value={selectedRecord?.startDate} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="End Date">
              <Input value={selectedRecord?.endDate} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Date">
              <Input value={selectedRecord?.deliveryDate} disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Vendor(s)">
              <Input value={getCompanyNamesFromItems(selectedRecord?.items)} disabled />
            </Form.Item>
          </Col>

         
          <Col span={6}>
            <Form.Item label="Status">
              <Input value={selectedRecord?.status} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Naarration">
              <Input value={selectedRecord?.naarration} disabled />
            </Form.Item>
          </Col>
        </Row>
      </div>




      <h3 className="text-xl font-semibold text-amber-600 my-4">Item & Quantity Details</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        {(selectedRecord?.items || []).map((it, idx) => (
         <Row gutter={16} key={idx} className="mb-2 border-b border-dashed pb-2">
  
  <Col span={6}>
    <Form.Item label={`Vendor ${idx + 1}`}>
      <Input value={it.companyName} disabled />
    </Form.Item>
  </Col>

  <Col span={6}>
    <Form.Item label={`Item ${idx + 1}`}>
      <Input value={it.item} disabled />
    </Form.Item>
  </Col>

  <Col span={6}>
    <Form.Item label="UOM">
      <Input value={it.uom} disabled />
    </Form.Item>
  </Col>

  <Col span={6}>
    <Form.Item label="Qty">
      <Input value={it.qty} disabled />
    </Form.Item>
  </Col>

  <Col span={6}>
    <Form.Item label="Rate (per UOM)">
      <Input value={it.rate} disabled />
    </Form.Item>
  </Col>

  <Col span={6}>
    <Form.Item label="Item Total Amount">
      <Input value={it.totalAmount} disabled />
    </Form.Item>
  </Col>

  <Col span={6}>
    <Form.Item label="Free Qty">
      <Input value={it.freeQty} disabled />
    </Form.Item>
  </Col>
 <Col span={6}>
      <Form.Item label="Discount %">
        <Input value={selectedRecord?.discountPercent} disabled />
      </Form.Item>
    </Col>

    <Col span={6}>
      <Form.Item label="Discount Amount">
        <Input value={selectedRecord?.discountAmt} disabled />
      </Form.Item>
    </Col>
</Row>
        ))}

      </div>


      <h3 className="text-xl font-semibold text-amber-600 my-4">Pricing & Tax Details</h3>
     <div className="border! p-2! rounded! mb-2! border-amber-300!">
  <Row gutter={16}>

    <Col span={6}>
      <Form.Item label="Gross Amount">
        <Input value={selectedRecord?.grossAmount} disabled />
      </Form.Item>
    </Col>

   

    {/* ✅ SGST */}
    <Col span={6}>
      <Form.Item label="SGST %">
        <Input value={selectedRecord?.sgstPercent} disabled />
      </Form.Item>
    </Col>

    {/* ✅ CGST */}
    <Col span={6}>
      <Form.Item label="CGST %">
        <Input value={selectedRecord?.cgstPercent} disabled />
      </Form.Item>
    </Col>

    {/* ✅ IGST */}
    <Col span={6}>
      <Form.Item label="IGST %">
        <Input value={selectedRecord?.igstPercent} disabled />
      </Form.Item>
    </Col>

    {/* ✅ TCS */}
    <Col span={6}>
      <Form.Item label="TCS Amount (₹)">
        <Input value={selectedRecord?.tcsAmt} disabled />
      </Form.Item>
    </Col>

    {/* ✅ FINAL TOTAL */}
    <Col span={6}>
      <Form.Item label="Grand Total">
        <Input value={selectedRecord?.totalAmount} disabled />
      </Form.Item>
    </Col>

  </Row>
</div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Contracts</h1>
          <p className="text-amber-600">Manage your contracts easily</p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search by Contract No, Vendor, Item, Status"
            className="w-96! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setSearchText("")}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
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
              // Reset Grand Total state
              setTotalAmount(0);

              addForm.setFieldsValue({
                key: `C-${String(data.length + 1).padStart(4, '0')}`,
                contractDate: dayjs(),
                startDate: dayjs(),
                endDate: dayjs().add(7, "day"),
                status: "Pending",
                // Set initial item with empty company/item/code/rate
                items: [{ companyName: undefined, item: undefined, itemCode: undefined, qty: undefined, uom: "Ltrs", rate: 0, baseRate: 0, totalAmount: 0 }],
                location: undefined, // Reset location
                customer_email: user?.email || user?.email_address,
                customer_mobile: user?.mobile || user?.phone || user?.mobile_number || user?.phone_number,
              });
              setSelectedRecord(null);
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table columns={columns} dataSource={filteredData} pagination={10} scroll={{ y: 250 }} rowKey="id" loading={loading} />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 font-semibold">Add New Contract</span>}
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={null}
        width={1200} // Increased width for more item columns
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(values) => handleFormSubmit(values, false)}
          initialValues={{
            key: `C-${String(data.length + 1).padStart(4, '0')}`,
            contractDate: dayjs(),
            startDate: dayjs(),
            endDate: dayjs().add(7, "day"),
            status: "Pending",
            items: [{ companyName: undefined, item: undefined, itemCode: undefined, qty: 0, uom: "Ltrs", rate: 0, baseRate: 0, totalAmount: 0 }],
            customer_email: user?.email || user?.email_address,
            customer_mobile: user?.mobile || user?.phone || user?.mobile_number || user?.phone_number,
          }}
        >
          {renderBasicFields(addForm, false)}
          {renderItemSection(addForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            Edit Contract
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
        }}
        footer={null}
        width={1200} // Increased width for more item columns
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={() =>
            editForm
              .validateFields()
              .then(() => handleFormSubmit(null, true))
              .catch(() => { })
          }
        >
          {renderBasicFields(editForm, false)}
          {renderItemSection(editForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">View Contract</span>}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
        }}
        footer={null}
        width={1200} // Increased width
      >
        <Form layout="vertical" form={viewForm}>
          {selectedRecord?.status === "Approved" ? (
            renderApprovedView()
          ) : (
            <>
              {renderBasicFields(viewForm, true)}
              {renderItemSection(viewForm, true)}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}