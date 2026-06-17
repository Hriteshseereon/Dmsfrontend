// SalesSouda.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import useSessionStore from "../../../../../store/sessionStore";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import { exportToExcel } from "../../../../../utils/exportToExcel";

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
  Divider,
  Card,
  message,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getCustomers,
  createsalesContract,
  getproductbyVendor,
  getVendors,
  getCompanies,
  getProductsByCompany,
  getSalescontractGroups,
  approvedSalesContract,
  getCustomersByOrganisation,
  getSalesContractById,
  updateSalesContract,
  getAllBrokerName,
  getAllPlantsName,
  getProductByplant,
  deleteSalesContract,
} from "../../../../../api/sales";
import { getAdminCustomerDetails } from "../../../../../api/customer";
import AppDatePicker from "../../../../../components/AppDatePicker";

/** trimmed/embedded seed data (same as you provided) */
const salesSoudaJSONModified2 = {
  statusOptions: ["Pending", "Approved", "Rejected"],

  typeOptions: ["Retail", "Wholesale"],

  locationOptions: ["Warehouse A", "Warehouse B", "Warehouse C"],

  depoOptions: ["Depo A", "Depo B", "Depo C"],

  billTypeOptions: ["Tax Invoice", "Retail Invoice"],

  billModeOptions: ["Credit", "Cash"],

  transporterOptions: ["Blue Transport", "Green Express", "Fast Logistics"],
};

export default function SalesSouda() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedCustomerMobile, setSelectedCustomerMobile] = useState("");
  // const [vendorItems, setVendorItems] = useState([]);
  const [vendorProductsMap, setVendorProductsMap] = useState({});
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [allSalesGroups, setAllSalesGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState(salesSoudaJSONModified2.initialData);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const { currentOrgId } = useSessionStore.getState();
  const selectedFY = useSelectedFinancialYear();
  const plantRef = useRef(null);
  const brokerRef = useRef(null);
  const contractDateRef = useRef(null);
  const validFromRef = useRef();
  const validToRef = useRef();
  const [plantDropdownOpen, setPlantDropdownOpen] = useState(false);
  const [brokerDropdownOpen, setBrokerDropdownOpen] = useState(false);
  const qtyRefs = useRef({});
  const contractRateRefs = useRef({});
  // Draft functions

  // Auto-save on form changes

  // get the all customer data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomersByOrganisation();
        // assume response = [{ id, name }]
        console.log("Fetched customers:", res);
        setCustomers(res || []);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchBrokerDetails = async () => {
      try {
        const res = await getAllBrokerName();
        console.log("Fetched Brokers:", res);
        setBrokers(res || []);
      } catch (err) {
        console.log("Failed to fetch brokers", err);
      }
    };

    fetchBrokerDetails();
  }, []);
  useEffect(() => {
    const fetchPlantDetails = async () => {
      try {
        const res = await getAllPlantsName();
        console.log("Fetched Plants:", res);
        setPlants(res || []);
      } catch (err) {
        console.log("Failed to fetch plants", err);
      }
    };

    fetchPlantDetails();
  }, []);
  // get all product by vendor id
  useEffect(() => {
    if (!selectedVendorId) return;

    const fetchVendorProducts = async () => {
      try {
        const res = await getProductsByCompany(selectedVendorId);
        // assume res = [{ id, name, code }]
        setVendorItems(res || []);
      } catch (err) {
        console.error("Failed to fetch vendor products", err);
      }
    };

    fetchVendorProducts();
  }, [selectedVendorId]);

  // get all vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await getCompanies();
        // expected: [{ id, name }]
        console.log("Fetched vendors:", res);
        setVendors(res || []);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      }
    };

    fetchVendors();
  }, []);
  // fetch all sales contract groups
  // Add this useEffect to fetch existing contracts on mount
  useEffect(() => {
    fetchSalesContracts();
  }, []);

  //delete function
  const handleDelete = async (record) => {
    try {
      await deleteSalesContract(record.key);

      setData((prev) => prev.filter((item) => item.key !== record.key));

      message.success("Sales Contract deleted successfully");
    } catch (error) {
      console.error("Delete Error:", error);

      message.error(
        error?.response?.data?.message || "Failed to delete Sales Contract",
      );
    }
  };
  // Helper to map contract API response → form values (reuse in both openView & openEdit)
  //
  const mapContractToForm = (contract) => {
    const calculatedTotalQty = (contract.items || []).reduce(
      (sum, item) =>
        sum + Number(item.net_qty || 0) + Number(item.free_qty || 0),
      0,
    );

    const calculatedTotalWeightTon = (contract.items || []).reduce(
      (sum, item) => sum + Number(item.total_net_wt_in_ton || 0),
      0,
    );
    return {
      key: contract.sale_contract_id,
      saleContractNumber: contract.sale_contract_number,
      customer: contract.customer_business_name,
      customerId: contract.customer_business_id || contract.customer_id,
      customerEmail: contract.customer_email,
      customerMobile: contract.customer_mobile,
      customerAddress: contract.location || "",

      status: contract.status,

      // ✅ NEW: map location, plant, broker
      location: contract.location || "",
      plantId: contract.plant_id || "",
      plantName: contract.plant_name || "",
      brokerId: contract.broker_id || "",
      brokerName: contract.broker_name || "",

      soudaDate: contract.created_at
        ? dayjs(contract.created_at, "DD-MM-YYYY HH:mm:ss")
        : undefined,
      startDate: contract.from_date
        ? dayjs(contract.from_date, "DD-MM-YYYY")
        : undefined,
      endDate: contract.to_date
        ? dayjs(contract.to_date, "DD-MM-YYYY")
        : undefined,

      items: (contract.items || []).map((it, idx) => ({
        lineKey: it.id || idx + 1,
        vendorId: it.company_group_id,
        vendorName: it.company_group_name,
        item: it.product?.product_id,
        itemName: it.product?.product_name,
        itemCode: it.hsn_code,
        uom: it.uom?.unit_name || "",

        qty: Number(it.net_qty || 0),
        freeQty: Number(it.free_qty || 0),
        totalQty: Number(it.gross_qty || 0),

        // ✅ NEW: correct field mappings
        contractRate: Number(it.contract_rate || it.contractRate || 0),
        rate: Number(it.mrp || 0),
        weightTon: Number(it.total_net_wt_in_ton || it.totalnetWtinTon || 0),
        gstPercent: Number(
          it.product?.gst_percentage || it.gst_percentage || 0,
        ),
        gstAmount: Number(it.gst_amount || it.gstAmount || 0),
        amount: Number(it.line_total || 0), // ex-GST amount
        totalAmount: Number(it.gross_amount || it.GrossAmount || 0), // total inc GST

        discountPercent: Number(it.discount_percent || 0),
        discountAmt: Number(it.discount_amount || 0),
        grossWt: Number(it.gross_weight || 0),
      })),

      orderTaxAndTotals: {
        sgstPercent: Number(contract.sgst || 0),
        cgstPercent: Number(contract.cgst || 0),
        igstPercent: Number(contract.igst || 0),
        tcsAmt: Number(contract.tcs_amount || 0),

        // ✅ NEW: correct summary field mappings
        totalGST: Number(
          contract.total_gst_amount || contract.totalGSTAmount || 0,
        ),
        grossAmountTotal: Number(
          contract.total_amount || contract.totalAmount || 0,
        ),
        grandTotal: Number(
          contract.grand_total || contract.totalGrossAmount || 0,
        ),
      },

      orderTotals: {
        totalQty: Number(contract.total_qty) || calculatedTotalQty,

        totalWeightTon:
          Number(contract.total_net_weight) || calculatedTotalWeightTon,

        totalAmount: Number(contract.total_amount || contract.totalAmount || 0),

        totalGSTAmount: Number(
          contract.total_gst_amount || contract.totalGSTAmount || 0,
        ),

        grossAmount: Number(
          contract.grand_total || contract.totalGrossAmount || 0,
        ),
      },
    };
  };
  const fetchSalesContracts = async () => {
    try {
      const res = await getSalescontractGroups(); // or whatever API fetches all contracts
      console.log("Fetched sales contracts:", res);

      // Map the API response to table format
      const mappedData = (res || []).map((contract) => ({
        key: contract.sale_contract_id,
        saleContractNumber: contract.sale_contract_number,
        customer: contract.customer_business_name,
        customerEmail: contract.customer_email, // Map email
        customerMobile: contract.customer_mobile, // Map mobile
        startDate: contract.from_date,
        endDate: contract.to_date,
        status: contract.status,
        items: contract.items,
        grandTotal: contract.grand_total,
        sgst: contract.sgst,
        cgst: contract.cgst,
        igst: contract.igst,
        tcs_amount: contract.tcs_amount,
      }));

      setData(mappedData);
    } catch (err) {
      console.error("Failed to fetch sales contracts", err);
    }
  };
  // payload for create sales contract
  const buildCreateContractPayload = (values) => {
    const items = (values.items || [])
      .filter(
        (it) =>
          it?.item &&
          Number(it?.qty || 0) > 0 &&
          Number(it?.contractRate || 0) > 0,
      )
      .map((it) => {
        const netQty = Number(it.qty || 0);
        const freeQty = Number(it.freeQty || 0);
        const grossQty = netQty + freeQty;
        const mrp = Number(it.rate || 0);
        const contractRate = Number(it.contractRate || 0);
        const discountPercent = Number(it.discountPercent || 0);
        const grossAmount = netQty * mrp;
        const discountAmount = (grossAmount * discountPercent) / 100;

        return {
          company_group_id: it.vendorId,
          product_id: it.item,
          uom: it.uom ? it.uom.toLowerCase() : null,
          net_qty: netQty,
          gross_qty: grossQty,
          free_qty: freeQty,
          mrp,
          contract_rate: contractRate, // ✅ was missing
          gst_percentage: Number(it.gstPercent || 0),
          discount_percent: discountPercent,
          discount_amount: Number(discountAmount.toFixed(2)),
          line_total: Number((grossAmount - discountAmount).toFixed(2)),
          gst_amount: Number(it.gstAmount || 0), // ✅ was missing
          gross_amount: Number(it.totalAmount || 0), // ✅ was missing
          total_net_wt_in_ton: Number(it.weightTon || 0), // ✅ was missing
        };
      });

    return {
      organisation: currentOrgId,
      customer_id: values.customerId,
      location: values.customerAddress || null, // ✅ NEW
      plant_id: values.plantId || null, // ✅ NEW
      broker_id: values.brokerId || null, // ✅ NEW (if you store broker id)
      broker_name: values.brokerName || null, // ✅ NEW
      from_date: values.startDate
        ? dayjs(values.startDate).format("YYYY-MM-DD")
        : null,
      to_date: values.endDate
        ? dayjs(values.endDate).format("YYYY-MM-DD")
        : null,
      customer_mobile: selectedCustomerMobile || values.customerMobile || "",
      customer_email: values.customerEmail || "",
      narration: "Admin created contract",
      sgst: Number(values.orderTaxAndTotals?.sgstPercent || 0),
      cgst: Number(values.orderTaxAndTotals?.cgstPercent || 0),
      igst: Number(values.orderTaxAndTotals?.igstPercent || 0),
      tcs_amount: Number(values.orderTaxAndTotals?.tcsAmt || 0),
      cash_discount: 0,
      round_off_amount: 0,

      items,
    };
  };

  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      fetchSalesContracts();
      return;
    }

    const filtered = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
    );

    setData(filtered);
  };
  const handleExport = () => {
    const exportData = [];

    data.forEach((contract) => {
      // Map through items to create a detailed row for each product
      if (contract.items && contract.items.length > 0) {
        contract.items.forEach((item, index) => {
          exportData.push({
            // --- Header Details ---
            "Contract No": contract.saleContractNumber || "N/A",
            Customer: contract.customer || "N/A",
            "Customer Email": contract.customerEmail || "-",
            "Customer Mobile": contract.customerMobile || "-",
            Status: contract.status || "Pending",
            "Start Date": contract.startDate
              ? dayjs(contract.startDate).format("DD-MM-YYYY")
              : "-",
            "End Date": contract.endDate
              ? dayjs(contract.endDate).format("DD-MM-YYYY")
              : "-",

            // --- Item Details ---
            "Item No": index + 1,
            "Vendor/Company": item.vendor_name || item.vendorName || "-",
            "Product Name":
              item.product?.product_name ||
              item.product_name ||
              item.itemName ||
              "-",
            "HSN Code": item.hsn_code || item.itemCode || "-",
            UOM: item.uom?.unit_name || item.uom || "-",
            "Net Qty": item.net_qty || item.qty || 0,
            "Free Qty": item.free_qty || item.freeQty || 0,
            "Gross Qty": item.gross_qty || item.totalQty || 0,
            "Rate (₹)": item.mrp || item.rate || 0,
            "Discount %": item.discount_percent || item.discountPercent || 0,
            "Discount Amt (₹)": item.discount_amount || item.discountAmt || 0,
            "Line Total (₹)": item.line_total || item.grossAmount || 0,

            // --- Tax & Grand Totals ---
            // --- Inside handleExport ---
            "SGST %":
              contract.sgst || contract.orderTaxAndTotals?.sgstPercent || 0,
            "CGST %":
              contract.cgst || contract.orderTaxAndTotals?.cgstPercent || 0,
            "IGST %":
              contract.igst || contract.orderTaxAndTotals?.igstPercent || 0,
            "TCS Amt (₹)":
              contract.tcs_amount || contract.orderTaxAndTotals?.tcsAmt || 0,
            "Grand Total (₹)": contract.grandTotal || 0,
          });
        });
      }
    });

    // Call the utility
    exportToExcel(
      exportData,
      `Sales_Contract_Report_${dayjs().format("YYYY-MM-DD")}`,
    );
  };

  // compute per-item + order totals
  const computeFromFormValues = (values) => {
    const items = (values.items || []).map((it, idx) => ({
      ...it,
      lineKey: it.lineKey || idx + 1,
    }));

    // Read directly from what recalculateRow already set on each item
    const qtyTotal = items.reduce((s, it) => s + Number(it.qty || 0), 0);
    const freeQtyTotal = items.reduce(
      (s, it) => s + Number(it.freeQty || 0),
      0,
    );
    const totalQty = qtyTotal + freeQtyTotal;

    const totalWeightTon = items.reduce(
      (s, it) => s + Number(it.weightTon || 0),
      0,
    );
    const totalAmount = items.reduce((s, it) => s + Number(it.amount || 0), 0); // ex-GST amount
    const totalGSTAmount = items.reduce(
      (s, it) => s + Number(it.gstAmount || 0),
      0,
    ); // GST portion
    const grossAmountTotal = items.reduce(
      (s, it) => s + Number(it.totalAmount || 0),
      0,
    ); // amount + gst

    const sgstPercent = Number(values.orderTaxAndTotals?.sgstPercent || 0);
    const cgstPercent = Number(values.orderTaxAndTotals?.cgstPercent || 0);
    const igstPercent = Number(values.orderTaxAndTotals?.igstPercent || 0);
    const tcsAmt = Number(values.orderTaxAndTotals?.tcsAmt || 0);

    // Grand total = sum of all item totals + TCS
    const grandTotal = grossAmountTotal + tcsAmt;

    return {
      items,
      orderTaxAndTotals: {
        sgstPercent,
        cgstPercent,
        igstPercent,
        tcsAmt,
        grossAmountTotal,
        totalGST: totalGSTAmount,
        grandTotal,
      },
      orderTotals: {
        qtyTotal,
        freeQtyTotal,
        totalQty,
        totalWeightTon,
        totalAmount, // ← ex-GST sum
        totalGSTAmount, // ← GST sum
        grossAmount: grossAmountTotal, // ← grand total of items
      },
    };
  };
  // Add these functions before the return statement
  const mapApiRecordToForm = (record) => {
    return {
      saleContractNumber: record.saleContractNumber,
      customer: record.customer_name,
      customerEmail: record.customerEmail,
      status: record.status,

      soudaDate: record.created_at ? dayjs(record.created_at) : undefined,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,

      items: (record.items || []).map((it, idx) => ({
        lineKey: it.id || idx + 1,

        vendorId: it.vendor_id,
        vendorName: it.vendor_name,

        item: it.product?.product_id || it.product_id,
        itemName: it.product?.product_name || it.product_name,

        uom: it.uom?.unit_name || "",
        qty: Number(it.net_qty),
        freeQty: Number(it.free_qty),
        totalQty: Number(it.gross_qty),

        rate: Number(it.mrp),
        discountPercent: Number(it.discount_percent),
        discountAmt: Number(it.discount_amount),

        grossAmount: Number(it.line_total),
        grossWt: 0,
        totalGrossWt: 0,
      })),

      orderTaxAndTotals: {
        sgstPercent: Number(record.sgst),
        cgstPercent: Number(record.cgst),
        igstPercent: Number(record.igst),
        tcsAmt: Number(record.tcs_amount),

        grossAmountTotal: Number(record.total_amount),
        discountTotal: Number(
          (record.items || []).reduce(
            (s, i) => s + Number(i.discount_amount || 0),
            0,
          ),
        ),
        totalGST:
          Number(record.sgst) + Number(record.cgst) + Number(record.igst),

        grandTotal: Number(record.grand_total),
      },
    };
  };

  const openView = async (record) => {
    try {
      const contract = await getSalesContractById(record.key);
      const mapped = mapContractToForm(contract);
      setSelectedRecord(mapped);
      viewForm.setFieldsValue(mapped);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch contract details", err);
    }
  };
  const openEdit = async (record) => {
    try {
      const contract = await getSalesContractById(record.key);

      const mapped = mapContractToForm(contract);

      // Load products for selected plant
      if (contract.plant_id) {
        const products = await getProductByplant(contract.plant_id);

        setSelectedPlantId(contract.plant_id);

        setVendorProductsMap({
          [contract.plant_id]: Array.isArray(products) ? products : [],
        });
      }

      setSelectedRecord(mapped);

      editForm.setFieldsValue(mapped);

      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch contract details", err);
    }
  };

  // reusalbe data format
  const parseShortDate = (value) => {
    if (!value || value.length !== 6) return null;

    const day = value.substring(0, 2);
    const month = value.substring(2, 4);
    const year = `20${value.substring(4, 6)}`;

    return dayjs(`${day}-${month}-${year}`, "DD-MM-YYYY");
  };
  // table columns: replace deliveryDate / company with startDate / endDate
  const columns = [
    // 🆕 Contract Number
    {
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
      dataIndex: "saleContractNumber",
      width: 160,
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Valid From</span>,
      dataIndex: "startDate",
      width: 110,
      render: (date) => (
        <span className="text-amber-800">
          {date ? dayjs(date, "DD-MM-YYYY").format("DD-MM-YYYY") : "-"}
        </span>
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customer",
      width: 160,
      render: (text) => <span className="text-amber-800">{text || "-"}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Items</span>,
      dataIndex: "items",
      width: 100,
      render: (items = []) => (
        <span className="text-amber-800">
          {items.length
            ? items
                .map((i) => i.product?.product_name || i.product_name)
                .join(" • ")
            : "-"}
        </span>
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        let colorClass = "";

        if (status === "Approved") {
          colorClass = "bg-green-100 text-green-700";
        } else if (status === "Pending") {
          colorClass = "bg-yellow-100 text-yellow-700";
        } else if (status === "Rejected") {
          colorClass = "bg-red-100 text-red-700";
        } else {
          colorClass = "bg-gray-100 text-gray-700";
        }

        return (
          <span
            className={`px-3 py-1 rounded-full font-semibold ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },

    {
      title: <span className="text-amber-700 font-semibold">Total (₹)</span>,
      dataIndex: "grandTotal",
      width: 130,
      render: (amt) => (
        <span className="text-amber-800 font-semibold">
          {amt !== undefined && amt !== null
            ? `₹ ${Number(amt).toFixed(2)}`
            : "-"}
        </span>
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="text-blue-500!"
            onClick={() => openView(record)}
          />
          {record.status !== "Approved" && (
            <>
              <EditOutlined
                className="cursor-pointer! text-red-500!"
                onClick={() => openEdit(record)}
              />

              <Popconfirm
                title="Are you sure to delete this Sales Contract?"
                onConfirm={() => handleDelete(record)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <DeleteOutlined className="text-grey-500! cursor-pointer! text-base! hover:text-grey-700!" />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  // ItemsTable (Form.List) — moved company selection into each item row
  const ItemsTable = ({ form, allowRemove = true, productList = [] }) => {
    const handleItemSelect = (productId, fieldName) => {
      const product = productList.find((p) => p.product_id === productId);
      if (!product) return;

      const items = form.getFieldValue("items") || [];
      const updatedItems = [...items];

      updatedItems[fieldName] = {
        ...updatedItems[fieldName],
        item: productId,
        uom: product.base_unit || "",
        gstPercent: product.gst_percentage || 0,
        grossWt: product.gross_weight || 0, // kg per unit
      };

      form.setFieldsValue({ items: updatedItems });

      // Trigger recalculation
      recalculateRow(fieldName, updatedItems);
      setTimeout(() => qtyRefs.current[fieldName]?.focus(), 100);
    };

    const recalculateRow = (index, itemsOverride) => {
      const items = itemsOverride || form.getFieldValue("items") || [];
      const it = items[index];
      if (!it) return;

      const qty = Number(it.qty || 0);
      const freeQty = Number(it.freeQty || 0);
      const grossWtPerUnit = Number(it.grossWt || 0); // in kg
      const gstPercent = Number(it.gstPercent || 0);
      const contractRate = Number(it.contractRate || 0);

      // Weight in ton: qty * gross_weight(kg) / 1000
      const weightTon = ((qty + freeQty) * grossWtPerUnit) / 1000;

      // Rate = contractRate - GST portion
      // contractRate is inclusive of GST, so: rate = contractRate / (1 + gst/100)
      const rate =
        gstPercent > 0 ? contractRate / (1 + gstPercent / 100) : contractRate;

      // Amount = qty * rate (excluding GST)
      const amount = qty * rate;

      // GST Amount = amount * gstPercent / 100
      const gstAmount = (amount * gstPercent) / 100;

      // Total Amount = amount + gstAmount
      const totalAmount = amount + gstAmount;

      const updatedItems = [...items];
      updatedItems[index] = {
        ...updatedItems[index],
        weightTon: Number(weightTon.toFixed(3)),
        rate: Number(rate.toFixed(2)),
        amount: Number(amount.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
      };

      form.setFieldsValue({ items: updatedItems });
    };

    const handleAutoAddRow = (add) => {
      const items = form.getFieldValue("items") || [];
      const lastItem = items[items.length - 1];
      const hasEmptyRow = items.some(
        (item) => !item?.item && !item?.qty && !item?.contractRate,
      );

      if (
        lastItem?.item &&
        Number(lastItem?.qty || 0) > 0 &&
        Number(lastItem?.contractRate || 0) > 0 &&
        !hasEmptyRow
      ) {
        add({
          lineKey: Date.now(),
          item: undefined,
          qty: null,
          freeQty: null,
          uom: "",
          weightTon: null,
          gstPercent: null,
          contractRate: null,
          rate: null,
          amount: null,
          gstAmount: null,
          totalAmount: null,
          grossWt: 0,
        });
      }
    };

    return (
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            <div className="mb-2">
              <h6 className="text-amber-500">Items</h6>
            </div>

            {/* Header Row */}
            <Row
              gutter={4}
              className="pb-2 mb-2 text-amber-800 font-semibold text-xs"
            >
              <Col span={6}>Item Name</Col>
              <Col span={2}>Quantity</Col>
              <Col span={1}>Free Qty</Col>
              <Col span={2}>Unit</Col>
              <Col span={1}>Gross wt</Col>
              <Col span={1}>GST %</Col>
              <Col span={2}>Contract Rate</Col>
              <Col span={2}>Rate</Col>
              <Col span={2}>Amount</Col>
              <Col span={2}>GST Amount</Col>
              <Col span={2}>Total Amount</Col>
              <Col span={1}></Col>
            </Row>

            {fields.map((field) => (
              <Row key={field.key} gutter={4} align="middle" className="mb-5">
                {/* Item Select — auto fills UOM + GST */}
                <Col span={6}>
                  <Form.Item
                    name={[field.name, "item"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      placeholder="Select Item"
                      showSearch
                      optionFilterProp="children"
                      onChange={(productId) =>
                        handleItemSelect(productId, field.name)
                      }
                    >
                      {productList.map((item) => (
                        <Select.Option
                          key={item.product_id}
                          value={item.product_id}
                        >
                          {item.product_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Qty — recalculate on change */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "qty"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      ref={(el) => (qtyRefs.current[field.name] = el)}
                      className="w-full!"
                      type="number"
                      controls={false}
                      maxLength={5}
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 5);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          e.preventDefault();
                          contractRateRefs.current[field.name]?.focus();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* Free Qty */}
                <Col span={1}>
                  <Form.Item
                    name={[field.name, "freeQty"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      type="number"
                      className="w-full!"
                      controls={false}
                      maxLength={5}
                      onInput={(e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 5);
                      }}
                      onChange={() => {
                        setTimeout(() => recalculateRow(field.name), 0); // ✅ was missing this
                      }}
                    />
                  </Form.Item>
                </Col>
                {/* UOM — auto filled */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "uom"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                {/* Weight in Ton — auto calculated */}
                <Col span={1}>
                  <Form.Item
                    name={[field.name, "weightTon"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                {/* GST % — auto filled */}
                <Col span={1}>
                  <Form.Item
                    name={[field.name, "gstPercent"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                {/* Contract Rate — user inputs this, triggers calculation */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "contractRate"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      ref={(el) => (contractRateRefs.current[field.name] = el)}
                      className="w-full!"
                      controls={false}
                      min={0}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? Number(value).toFixed(2)
                          : "0.00"
                      }
                      parser={(value) => value?.replace(/[^\d.]/g, "")}
                      onChange={() => {
                        setTimeout(() => recalculateRow(field.name), 0);
                      }}
                      onBlur={() => handleAutoAddRow(add)}
                    />
                  </Form.Item>
                </Col>

                {/* Rate — auto calculated (con.rate ex-GST) */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "rate"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className="w-full!"
                      disabled
                      precision={2}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? Number(value).toFixed(2)
                          : "0.00"
                      }
                    />
                  </Form.Item>
                </Col>

                {/* Amount — auto calculated */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "amount"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className="w-full!"
                      disabled
                      precision={2}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? Number(value).toFixed(2)
                          : "0.00"
                      }
                    />
                  </Form.Item>
                </Col>

                {/* GST Amount — auto calculated */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "gstAmount"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className="w-full!"
                      disabled
                      precision={2}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? Number(value).toFixed(2)
                          : "0.00"
                      }
                    />
                  </Form.Item>
                </Col>

                {/* Total Amount — auto calculated */}
                <Col span={2}>
                  <Form.Item
                    name={[field.name, "totalAmount"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className="w-full!"
                      disabled
                      precision={2}
                      formatter={(value) =>
                        value !== undefined && value !== null
                          ? Number(value).toFixed(2)
                          : "0.00"
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={1}>
                  {allowRemove && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  )}
                </Col>
              </Row>
            ))}
          </>
        )}
      </Form.List>
    );
  };

  // Add / Edit submit handlers - ensure startDate/endDate are saved (company moved into items)
  const handleAddFinish = async (values) => {
    try {
      const payload = buildCreateContractPayload(values);

      // 🔍 Debug logging
      console.log("=== PAYLOAD DEBUG ===");
      console.log("Tax values:", {
        cgst: payload.cgst,
        sgst: payload.sgst,
        igst: payload.igst,
      });
      console.log("Full payload:", JSON.stringify(payload, null, 2));

      // ✅ Capture the response from the API
      const response = await createsalesContract(payload);

      // ✅ The response contains the created contract data
      const contract = response; // or response.data depending on your API structure

      // ✅ Map the API response to your table row format
      const row = {
        key: contract.sale_contract_id, // AntD rowKey
        saleContractNumber: contract.sale_contract_number,
        customer: contract.customer_name,
        customerEmail: contract.customer_email,
        startDate: contract.from_date,
        endDate: contract.to_date,
        status: contract.status,
        items: contract.items,
        grandTotal: contract.grand_total,
      };

      // ✅ Add new row to the table data
      setData((prev) => [row, ...prev]);
      setIsAddModalOpen(false);
      addForm.resetFields();

      // ✅ Optional: Show success message
      console.log("Sales contract created successfully:", row);
    } catch (error) {
      console.error("Failed to create sales contract", error);
      // 🔍 Log: error response
      console.error("Error response:", error.response?.data);
    }
  };

  // Edit submit handler
  const handleEditFinish = async (values) => {
    try {
      // Re-calculate item totals to be safe
      const items = (values.items || [])
        .filter(
          (it) =>
            it?.item &&
            Number(it?.qty || 0) > 0 &&
            Number(it?.contractRate || 0) > 0,
        )
        .map((it) => {
          const netQty = Number(it.qty || 0);
          const freeQty = Number(it.freeQty || 0);
          const grossQty = netQty + freeQty;
          const mrp = Number(it.rate || 0);
          const contractRate = Number(it.contractRate || 0);
          const discountPercent = Number(it.discountPercent || 0);
          const grossAmount = netQty * mrp;
          const discountAmount = (grossAmount * discountPercent) / 100;

          return {
            company_group_id: it.vendorId,
            product_id: it.item,
            uom: it.uom ? it.uom.toLowerCase() : null,
            mrp,
            contract_rate: contractRate, // ✅
            gross_qty: grossQty,
            free_qty: freeQty,
            net_qty: netQty,
            discount_percent: discountPercent,
            discount_amount: Number(discountAmount.toFixed(2)),
            line_total: Number((grossAmount - discountAmount).toFixed(2)),
            gst_amount: Number(it.gstAmount || 0), // ✅
            gross_amount: Number(it.totalAmount || 0), // ✅
            total_net_wt_in_ton: Number(it.weightTon || 0), // ✅
            gst_percentage: Number(it.gstPercent || 0),
          };
        });
      const payload = {
        customer_id: selectedRecord.customerId, // Use ID from record
        customer_email: values.customerEmail,
        customer_mobile: values.customerMobile || 123456789,
        location: values.location || null, // ✅
        plant_id: values.plantId || null, // ✅
        broker_name: values.brokerName || null,
        status: values.status,
        from_date: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DD")
          : null,
        to_date: values.endDate
          ? dayjs(values.endDate).format("YYYY-MM-DD")
          : null,

        cash_discount: 0,
        round_off_amount: 0,
        narration: "Admin updated contract",

        cgst: Number(values.orderTaxAndTotals?.cgstPercent || 0),
        sgst: Number(values.orderTaxAndTotals?.sgstPercent || 0),
        igst: Number(values.orderTaxAndTotals?.igstPercent || 0),
        tcs_amount: Number(values.orderTaxAndTotals?.tcsAmt || 0),

        items,
      };

      console.log("Update Payload:", payload);

      const res = await updateSalesContract(selectedRecord.key, payload);

      // Update local state
      setData((prev) =>
        prev.map((d) =>
          d.key === selectedRecord.key
            ? {
                ...d,
                ...mapApiRecordToForm(res || {}), // reuse mapper if possible or manually map
                key: d.key,
                // Manually update core fields if mapper return structure differs slightly for table
                saleContractNumber: res.sale_contract_number,
                customer: res.customer_name,
                startDate: res.from_date,
                endDate: res.to_date,
                status: res.status,
                grandTotal: res.grand_total,
                items: res.items,
              }
            : d,
        ),
      );

      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedRecord(null);
      // message.success("Contract updated successfully"); // Optional
    } catch (err) {
      console.error("Failed to update contract", err);
    }
  };

  // reactive updates for both add and edit forms
  const handleAddValuesChange = (_changed, allValues) => {
    const computed = computeFromFormValues(allValues || {});
    addForm.setFieldsValue({
      items: computed.items,
      orderTaxAndTotals: {
        ...allValues.orderTaxAndTotals,
        ...computed.orderTaxAndTotals,
      },
      orderTotals: computed.orderTotals,
    });
  };

  const handleEditValuesChange = (_changed, allValues) => {
    const computed = computeFromFormValues(allValues || {});
    editForm.setFieldsValue({
      items: computed.items,
      orderTaxAndTotals: {
        ...allValues.orderTaxAndTotals,
        ...computed.orderTaxAndTotals,
      },
      orderTotals: computed.orderTotals,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <Button
            icon={<FilterOutlined />}
            onClick={() => {
              setSearchText("");
              fetchSalesContracts();
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
            onClick={() => {
              addForm.resetFields();
              addForm.setFieldsValue({
                status: "Pending",
                items: [
                  {
                    lineKey: new Date().getTime(),
                    // companyName: companyOptions[0] || undefined,
                    qty: 0,
                    freeQty: 0,
                    totalQty: 0,
                    rate: 0,
                    discountPercent: 0,
                    discountAmt: 0,
                    grossWt: 0,
                    totalGrossWt: 0,
                    grossAmount: 0,
                  },
                ],
                orderTaxAndTotals: {
                  sgstPercent: 0,
                  cgstPercent: 0,
                  igstPercent: 0,
                  tcsAmt: 0,
                },
                // make start/end visible in add form
                startDate: dayjs(),
                endDate: dayjs(),
                soudaDate: dayjs(),
              });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Sales Contract Records
        </h2>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ y: 220 }}
          rowKey="key"
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span className="text-amber-700 text-2xl font-semibold">
              Add Sales Contract
            </span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={1600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddFinish}
          onValuesChange={handleAddValuesChange}
        >
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "2px 12px" } }}
          >
            <h6 className="text-amber-500">Basic Information</h6>
            <Row gutter={4}>
              <Col span={4}>
                <Form.Item
                  label={<span className="text-amber-700">Customer Name</span>}
                  name="customerId"
                  rules={[{ required: true, message: "Select customer" }]}
                >
                  <Select
                    placeholder="Select Customer"
                    showSearch
                    optionFilterProp="children"
                    onChange={(customerId) => {
                      const selectedCustomer = customers.find(
                        (c) => c.customer_id === customerId,
                      );

                      if (selectedCustomer) {
                        // ✅ store mobile silently
                        setSelectedCustomerMobile(
                          selectedCustomer.mobile_number ||
                            selectedCustomer.phone_number ||
                            selectedCustomer.whatsapp_number ||
                            "",
                        );

                        addForm.setFieldsValue({
                          customerAddress: selectedCustomer.city || "",
                        });
                      }
                      setTimeout(() => {
                        plantRef.current?.focus();
                        setPlantDropdownOpen(true);
                      }, 100);
                    }}
                  >
                    {customers.map((c) => (
                      <Select.Option
                        key={c.customer_id}
                        value={c.customer_id}
                        label={c.business_name}
                      >
                        {c.business_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700">Customer Location</span>
                  }
                  name="customerAddress"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label="Plant Name"
                  name="plantId"
                  rules={[
                    {
                      required: true,
                      message: "Select Plant",
                    },
                  ]}
                >
                  <Select
                    ref={plantRef}
                    open={plantDropdownOpen}
                    onDropdownVisibleChange={(visible) =>
                      setPlantDropdownOpen(visible)
                    }
                    placeholder="Select Plant"
                    onChange={async (plantId) => {
                      setSelectedPlantId(plantId); // ← add this
                      try {
                        const products = await getProductByplant(plantId);
                        setVendorProductsMap({ [plantId]: products || [] });
                        addForm.setFieldsValue({ selectedPlantId: plantId });
                      } catch (err) {
                        console.error("Product API Error:", err);
                      }
                      setPlantDropdownOpen(false);
                      setTimeout(() => {
                        brokerRef.current?.focus();
                        setBrokerDropdownOpen(true);
                      }, 100);
                    }}
                  >
                    {plants.map((plant) => (
                      <Select.Option
                        key={plant.plant_id}
                        value={plant.plant_id}
                      >
                        {plant.plant_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Broker Name</span>}
                  name="brokerName"
                >
                  <Select
                    ref={brokerRef}
                    open={brokerDropdownOpen}
                    onDropdownVisibleChange={(visible) =>
                      setBrokerDropdownOpen(visible)
                    }
                    labelInValue
                    onChange={(option) => {
                      const firstWord = option.label?.split(" ")[0] || "";

                      addForm.setFieldsValue({
                        brokerId: option.value,
                        brokerName: firstWord,
                      });
                      setBrokerDropdownOpen(false);
                      setTimeout(() => {
                        contractDateRef.current?.focus();
                      }, 100);
                    }}
                  >
                    {brokers.map((broker) => (
                      <Select.Option key={broker.id} value={broker.id}>
                        {broker.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="brokerId" hidden>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Contract Date</span>}
                  name="soudaDate"
                  rules={[{ required: true }]}
                  initialValue={dayjs()}
                >
                  {/* <DatePicker
                  className="w-full"
                  disabled
                  format="DD-MM-YYYY"
                  disabledDate={createFinancialYearDisabledDate(selectedFY)}
                /> */}
                  <AppDatePicker
                    ref={contractDateRef}
                    onChange={() => {
                      setTimeout(() => validFromRef.current?.focus(), 100);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid From</span>}
                  name="startDate"
                >
                  {/* <DatePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  disabledDate={createFinancialYearDisabledDate(selectedFY)}
                /> */}
                  <AppDatePicker
                    ref={validFromRef}
                    onChange={() => {
                      setTimeout(() => validToRef.current?.focus(), 100);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid To</span>}
                  name="endDate"
                >
                  {/* <DatePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  disabledDate={createFinancialYearDisabledDate(selectedFY)}
                /> */}
                  <AppDatePicker ref={validToRef} />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item
                  label={<span className="text-amber-700">Status</span>}
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Status" disabled={isAddModalOpen}>
                    {salesSoudaJSONModified2.statusOptions.map((s) => (
                      <Select.Option key={s} value={s}>
                        {s}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Type</span>}
                name="type"
              >
                <Select placeholder="Select Type">
                  {salesSoudaJSONModified2.typeOptions.map((s) => (
                    <Select.Option key={s} value={s}>
                      {s}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
            </Row>
          </Card>
          {/* Items */}
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            <ItemsTable
              form={addForm}
              allowRemove={true}
              allowAdd={true}
              productList={vendorProductsMap[selectedPlantId] || []}
            />
          </Card>
          <Card
            size="small"
            style={{ border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            {/* Tax & totals */}
            <h6 className="text-amber-500">Summary</h6>

            <Row gutter={8}>
              <Col span={6}>
                <span className="text-amber-700 font-bold text-2xl">
                  Gross Total
                </span>
              </Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "totalQty"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={3}></Col>
              <Col span={1}>
                <Form.Item name={["orderTotals", "totalWeightTon"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={5}></Col>

              <Col span={2}>
                <Form.Item name={["orderTotals", "totalAmount"]}>
                  <InputNumber
                    className="w-full!"
                    disabled
                    precision={2}
                    formatter={(v) =>
                      v !== undefined && v !== null
                        ? Number(v).toFixed(2)
                        : "0.00"
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item name={["orderTotals", "totalGSTAmount"]}>
                  <InputNumber
                    className="w-full!"
                    disabled
                    precision={2}
                    formatter={(v) =>
                      v !== undefined && v !== null
                        ? Number(v).toFixed(2)
                        : "0.00"
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item name={["orderTotals", "grossAmount"]}>
                  <InputNumber
                    className="w-full!"
                    disabled
                    precision={2}
                    formatter={(v) =>
                      v !== undefined && v !== null
                        ? Number(v).toFixed(2)
                        : "0.00"
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500! hover:bg-amber-600! border-none!"
              type="primary"
              htmlType="submit"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Sales Souda"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={1600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFinish}
          onValuesChange={handleEditValuesChange}
        >
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "2px 12px" } }}
          >
            <h6 className="text-amber-500">Basic Information</h6>
            <Row gutter={4}>
              <Col span={4}>
                <Form.Item
                  label={<span className="text-amber-700">Customer Name</span>}
                  name="customerId"
                  rules={[{ required: true, message: "Select customer" }]}
                >
                  <Select
                    placeholder="Select Customer"
                    showSearch
                    optionFilterProp="children"
                    onChange={(customerId) => {
                      const selectedCustomer = customers.find(
                        (c) => c.customer_id === customerId,
                      );

                      if (selectedCustomer) {
                        addForm.setFieldsValue({
                          customerAddress: [
                            selectedCustomer.address ||
                              selectedCustomer.address_line1,
                            selectedCustomer.city,
                          ]
                            .filter(Boolean)
                            .join(", "),
                        });
                      }
                    }}
                  >
                    {customers.map((c) => (
                      <Select.Option
                        key={c.customer_id}
                        value={c.customer_id}
                        label={c.business_name}
                      >
                        {c.business_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700">Customer Location</span>
                  }
                  name="customerAddress"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Form.Item
                label={<span className="text-amber-700">Plant Name</span>}
                name="plantId"
                rules={[{ required: true, message: "Select Plant Name" }]}
              >
                <Select
                  placeholder="Select Plant"
                  showSearch
                  optionFilterProp="children"
                >
                  {plants.map((plant) => (
                    <Select.Option key={plant.plant_id} value={plant.plant_id}>
                      {plant.plant_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="text-amber-700">Broker Name</span>}
                name="brokerId"
                rules={[{ required: true, message: "Select Broker Name" }]}
              >
                <Select
                  placeholder="Select Broker"
                  showSearch
                  optionFilterProp="children"
                >
                  {brokers.map((broker) => (
                    <Select.Option key={broker.id} value={broker.id}>
                      {broker.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Contract Date</span>}
                  name="soudaDate"
                  rules={[{ required: true }]}
                >
                  {/* <DatePicker
                  className="w-full"
                  disabled
                  format="DD-MM-YYYY"
                  disabledDate={createFinancialYearDisabledDate(selectedFY)}
                /> */}
                  <AppDatePicker />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid From</span>}
                  name="startDate"
                >
                  {/* <DatePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  disabledDate={createFinancialYearDisabledDate(selectedFY)}
                /> */}
                  <AppDatePicker />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid To</span>}
                  name="endDate"
                >
                  {/* <DatePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  disabledDate={createFinancialYearDisabledDate(selectedFY)}
                /> */}
                  <AppDatePicker />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item
                  label={<span className="text-amber-700">Status</span>}
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Status">
                    {salesSoudaJSONModified2.statusOptions.map((s) => (
                      <Select.Option key={s} value={s}>
                        {s}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            <ItemsTable
              form={editForm}
              allowRemove={false}
              allowAdd={false}
              productList={vendorProductsMap[selectedPlantId] || []}
            />
          </Card>
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            <h6 className="text-amber-500">Summary</h6>

            <Row gutter={8}>
              <Col span={6}>
                <span className="text-amber-700 font-bold text-2xl">
                  Gross Total
                </span>
              </Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "totalQty"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={3}></Col>
              <Col span={1}>
                <Form.Item name={["orderTotals", "totalWeightTon"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={5}></Col>

              <Col span={2}>
                <Form.Item name={["orderTotals", "totalAmount"]}>
                  <InputNumber
                    className="w-full!"
                    disabled
                    precision={2}
                    formatter={(v) =>
                      v !== undefined && v !== null
                        ? Number(v).toFixed(2)
                        : "0.00"
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item name={["orderTotals", "totalGSTAmount"]}>
                  <InputNumber
                    className="w-full!"
                    disabled
                    precision={2}
                    formatter={(v) =>
                      v !== undefined && v !== null
                        ? Number(v).toFixed(2)
                        : "0.00"
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item name={["orderTotals", "grossAmount"]}>
                  <InputNumber
                    className="w-full!"
                    disabled
                    precision={2}
                    formatter={(v) =>
                      v !== undefined && v !== null
                        ? Number(v).toFixed(2)
                        : "0.00"
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setSelectedRecord(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Sales Contract
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={1600}
      >
        <Form layout="vertical" form={viewForm}>
          {/* Basic Information */}
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            <h6 className="text-amber-500">Basic Information</h6>
            <Row gutter={4}>
              <Col span={4}>
                <Form.Item
                  label={<span className="text-amber-700">Customer Name</span>}
                  name="customer"
                >
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700">Customer Address</span>
                  }
                  name="customerAddress"
                >
                  <Input disabled />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Plant Name</span>}
                  name="plantId"
                >
                  <Select disabled placeholder="Plant">
                    {plants.map((plant) => (
                      <Select.Option
                        key={plant.plant_id}
                        value={plant.plant_id}
                      >
                        {plant.plant_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Broker Name</span>}
                  name="brokerId"
                >
                  <Select disabled placeholder="Broker">
                    {brokers.map((broker) => (
                      <Select.Option key={broker.id} value={broker.id}>
                        {broker.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Contract Date</span>}
                  name="soudaDate"
                >
                  <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid From</span>}
                  name="startDate"
                >
                  <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid To</span>}
                  name="endDate"
                >
                  <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item
                  label={<span className="text-amber-700">Status</span>}
                  name="status"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          {/* Items Section — same header + rows as ItemsTable */}
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            <h6 className="text-amber-500">Items</h6>
            <Row
              gutter={4}
              className="pb-2 mb-2 text-amber-800 font-semibold text-xs"
            >
              <Col span={4}>Item Name</Col>
              <Col span={2}>Qty</Col>
              <Col span={2}>F.Qty</Col>
              <Col span={2}>Unit</Col>
              <Col span={2}>Wt (Ton)</Col>
              <Col span={1}>GST %</Col>
              <Col span={2}>Con. Rate</Col>
              <Col span={2}>Rate</Col>
              <Col span={2}>Amount</Col>
              <Col span={2}>GST Amt</Col>
              <Col span={2}>Total Amt</Col>
              <Col span={1}></Col>
            </Row>

            {(selectedRecord?.items || []).map((it, idx) => (
              <Row
                key={it.lineKey || idx}
                gutter={4}
                align="middle"
                className="mb-2"
              >
                <Col span={4}>
                  <Input disabled value={it.itemName || "-"} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.qty} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.freeQty} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.uom || "-"} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.weightTon} />
                </Col>
                <Col span={1}>
                  <Input disabled value={it.gstPercent} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.contractRate} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.rate} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.amount} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.gstAmount} />
                </Col>
                <Col span={2}>
                  <Input disabled value={it.totalAmount} />
                </Col>
                <Col span={1}></Col>
              </Row>
            ))}
          </Card>
          {/* Summary — identical to Add/Edit */}
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "0px 12px" } }}
          >
            <h6 className="text-amber-500 mt-2">Summary</h6>
            <Row gutter={8}>
              <Col span={4}>
                <span className="text-amber-700 font-bold text-2xl">
                  Gross Total
                </span>
              </Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "totalQty"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={4}></Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "totalWeightTon"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={5}></Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "totalAmount"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "totalGSTAmount"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item name={["orderTotals", "grossAmount"]}>
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    </div>
  );
}
