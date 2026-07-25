import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Table,
  Input,
  Button,
  Modal,
  Select,
  Row,
  Col,
  Card,
  message,
  Form,
  DatePicker,
  InputNumber,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  DownOutlined,
  SendOutlined,
  TruckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getPurchaseSalesContractOrders,
  getPurchaseSalesContractOrderById,
  createpurchaseOrder,
  getAllTransport,
  addAssignment,
  updatePurchaseSalesContractOrder,
} from "../../../../../api/purchase";
import {
  getSalesContractById,
  updateSalesContract,
  getSalescontractGroups,
  getCustomersByOrganisation,
  getAllBrokerName,
  getAllPlantsName,
  getProductByplant,
} from "../../../../../api/sales";
import {
  getAllWhatsappGroups,
  sendWhatsappMessage,
} from "../../../../../api/whatapgroup";
import { getAllVehicles } from "../../../../../api/vehiclemaster";
import useSessionStore from "../../../../../store/sessionStore";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import AppDatePicker from "../../../../../components/AppDatePicker";

dayjs.extend(customParseFormat);

const { Option } = Select;

const statusOptions = ["Pending", "Approved", "Rejected"];

// shared pill badge
const renderStatusBadge = (status) => {
  const base = "px-3 py-1 rounded-full text-sm font-semibold";
  if (status === "Approved")
    return (
      <span className={`${base} bg-green-100 text-green-700`}>{status}</span>
    );
  if (status === "Pending")
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>
    );
  return (
    <span className={`${base} bg-red-100 text-red-700`}>{status || "-"}</span>
  );
};

// strict multi-format date parser (matches SalesSouda.jsx) — needed because
// the API returns dates as "DD-MM-YYYY" (e.g. "14-07-2026"), which dayjs's
// default loose parser can misread as MM-DD-YYYY and mark invalid.
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

export default function PurchaseIndent() {
  // ---------- main order list ----------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ---------- modal control ----------
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | "view" | null
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statusValue, setStatusValue] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  // ---------- available sale contracts (Add/Edit modal) ----------
  const [availableContracts, setAvailableContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // ---------- search text for the contracts table inside modal ----------
  const [contractSearch, setContractSearch] = useState("");

  // ---------- new available contracts date range filter ----------
  const [contractDateRange, setContractDateRange] = useState(null);

  // ---------- sales contract edit modal state (full form, mirrors SalesSouda.jsx) ----------
  const [isContractEditModalOpen, setIsContractEditModalOpen] = useState(false);
  const [contractEditingRecord, setContractEditingRecord] = useState(null);
  const [contractSubmitting, setContractSubmitting] = useState(false);
  const [contractForm] = Form.useForm();
  const [editItemDropdownIndex, setEditItemDropdownIndex] = useState(null);

  // lookups needed by the full sales-contract edit form
  const [customers, setCustomers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [vendorProductsMap, setVendorProductsMap] = useState({});
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const selectedFY = useSelectedFinancialYear();

  // refs used inside the ported ItemsTable (item select / qty / contract rate navigation)
  const itemRefs = useRef({});
  const qtyRefs = useRef({});
  const contractRateRefs = useRef({});
  const contractDateRef = useRef(null);
  const validFromRef = useRef(null);
  const validToRef = useRef(null);

  // ---------- transport assignment modal state ----------
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedContractForAssign, setSelectedContractForAssign] =
    useState(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignForm] = Form.useForm();

  // ---------- whatsapp send modal state ----------
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [selectedContractForWhatsapp, setSelectedContractForWhatsapp] =
    useState(null);
  const [whatsappSubmitting, setWhatsappSubmitting] = useState(false);
  const [whatsappGroups, setWhatsappGroups] = useState([]);
  const [whatsappForm] = Form.useForm();

  // ---------------------------------------------------------------
  const [isPoContractsModalOpen, setIsPoContractsModalOpen] = useState(false);
  const [selectedPoForContracts, setSelectedPoForContracts] = useState(null);
  useEffect(() => {
    fetchPurchaseOrder();
  }, []);

  // lookups for the full sales-contract edit form
  useEffect(() => {
    (async () => {
      try {
        const res = await getCustomersByOrganisation();
        setCustomers(res || []);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllBrokerName();
        setBrokers(res || []);
      } catch (err) {
        console.error("Failed to fetch brokers", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllPlantsName();
        setPlants(res || []);
      } catch (err) {
        console.error("Failed to fetch plants", err);
      }
    })();
  }, []);

  // ---------------------------------------------------------------
  // Purchase order list
  // ---------------------------------------------------------------
  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseSalesContractOrders();
      const list = res?.data || res || [];

      const formatted = list.map((item, index) => {
        const contractDetails =
          item.sale_contract_details ||
          item.sales_contract_details ||
          item.sale_contracts_details ||
          [];

        const totalQty = contractDetails.reduce(
          (sum, c) => sum + Number(c.total_qty || 0),
          0,
        );
        const grandTotal = contractDetails.reduce(
          (sum, c) => sum + Number(c.grand_total || 0),
          0,
        );

        return {
          key: item.id || index + 1,
          id: item.id,
          order_number: item.order_number || item.order_no || item.id,
          order_date: item.order_date,
          plant_name: item.plant_name || contractDetails[0]?.plant_name || "-",
          // No true "vendor/supplier" field is returned by this API — each
          // purchase order links to sale contracts made with a customer, so
          // we surface that customer name here instead.
          vendor_name:
            item.customer_business_name ||
            contractDetails[0]?.customer_business_name ||
            "-",
          sales_contracts: contractDetails,
          contract_count:
            contractDetails.length || (item.sale_contracts || []).length,
          total_qty_all_items: item.total_qty_all_items ?? totalQty,
          grand_total: item.grand_total ?? item.total_amount ?? grandTotal,
          status: item.status || "Fresh",
        };
      });

      setData(formatted);
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
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleExport = async () => {
    try {
      const res = await getPurchaseSalesContractOrders();
      const list = res?.data || res || [];
      const exportRows = [];

      for (const order of list) {
        const detailRes = await getPurchaseSalesContractOrderById(
          order.id || order.key,
        );
        const detail = detailRes?.data || detailRes;

        const contracts =
          detail.sales_contracts_details ||
          detail.contracts ||
          detail.sale_contracts ||
          [];

        if (contracts.length) {
          contracts.forEach((c) => {
            exportRows.push({
              "Order No": detail.order_number || detail.id,
              "Plant Name": detail.plant_name,
              "Supplier Name": detail.vendor_name,
              Status: detail.status,
              "Sale Contract No":
                c.sale_contract_number ||
                c.saleContractNumber ||
                c.contract_number ||
                c,
              Customer: c.customer_business_name || c.customer || "-",
              Broker: c.broker_name || c.brokerName || "-",
              "Contract Valid From": c.from_date || c.startDate,
              "Contract Valid To": c.to_date || c.endDate,
              "Total Qty (All Contracts)": detail.total_qty_all_items,
              "Total Amount (₹)": detail.grand_total || detail.total_amount,
            });
          });
        } else {
          exportRows.push({
            "Order No": detail.order_number || detail.id,
            "Plant Name": detail.plant_name,
            "Supplier Name": detail.vendor_name,
            Status: detail.status,
            "Total Qty (All Contracts)": detail.total_qty_all_items,
            "Total Amount (₹)": detail.grand_total || detail.total_amount,
          });
        }
      }

      exportToExcel(
        exportRows,
        "All_Purchase_Indent_Details",
        "PurchaseIndent",
      );
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Export failed");
    }
  };

  // ---------------------------------------------------------------
  // Map a sales contract API record → row shape for the contracts table
  // (used for the checkbox-selectable list inside Add/Edit Purchase Order)
  // ---------------------------------------------------------------
  const mapContractRecord = (contract, index) => {
    const items = contract.items || [];
    const hasItems = items.length > 0;

    const quantity = hasItems
      ? items.reduce((sum, item) => sum + Number(item.gross_qty || 0), 0)
      : Number(contract.total_qty ?? contract.quantity ?? 0);

    const grossWeightTon = hasItems
      ? items.reduce(
          (sum, item) =>
            sum + Number(item.total_net_wt_in_ton || item.totalnetWtinTon || 0),
          0,
        )
      : Number(contract.total_net_weight ?? contract.grossWeightTon ?? 0);

    return {
      // Real API gives two different ids on this record: `id` is the
      // junction/link row, `sale_contract_id` is the actual contract —
      // sale_contract_id must win, or downstream calls (download/assign/
      // whatsapp/edit) hit the wrong record.
      key: contract.sale_contract_id || contract.id || index + 1,
      id: contract.sale_contract_id || contract.id,
      saleContractNumber:
        contract.sale_contract_number || contract.contract_number || "-",
      customer:
        contract.customer_business_name ||
        contract.customer_name ||
        contract.customer ||
        "-",
      plantName: contract.plant_name || "-",
      brokerName: contract.broker_name || "-",
      contractDate:
        contract.created_at || contract.contract_date || contract.created_date,
      startDate: contract.from_date || contract.start_date,
      endDate: contract.to_date || contract.end_date,
      extendedUpto: contract.extended_upto,
      quantity,
      grossWeightTon,
      status: contract.status || "Approved",
      grandTotal:
        contract.grand_total || contract.total_amount || contract.totalAmount,
    };
  };

  // ---------------------------------------------------------------
  // Map full contract detail → the full edit-form shape (mirrors
  // SalesSouda.jsx's mapContractToForm exactly, so the same PUT payload
  // builder can be reused for double-click edits from this page).
  // ---------------------------------------------------------------
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

      location: contract.location || "",
      plantId: contract.plant_id || "",
      plantName: contract.plant_name || "",
      brokerId: contract.broker_id || "direct",
      brokerName: contract.broker_name || "Direct",

      soudaDate: parseApiDate(contract.created_date),
      startDate: parseApiDate(contract.from_date),
      endDate: parseApiDate(contract.to_date),

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

        contractRate: Number(it.contract_rate || it.contractRate || 0),
        rate: Number(it.mrp || 0),
        weightTon: Number(it.total_net_wt_in_ton || it.totalnetWtinTon || 0),
        gstPercent: Number(
          it.product?.gst_percentage || it.gst_percentage || 0,
        ),
        gstAmount: Number(it.gst_amount || it.gstAmount || 0),
        amount: Number(it.line_total || 0),
        roundOff: Number(it.roundoff || 0),
        totalAmount: Number(it.gross_amount || it.GrossAmount || 0),

        discountPercent: Number(it.discount_percent || 0),
        discountAmt: Number(it.discount_amount || 0),
        grossWt: Number(it.gross_weight || 0),
      })),

      orderTaxAndTotals: {
        sgstPercent: Number(contract.sgst || 0),
        cgstPercent: Number(contract.cgst || 0),
        igstPercent: Number(contract.igst || 0),
        tcsAmt: Number(contract.tcs_amount || 0),

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

  // ---------------------------------------------------------------
  // Live totals recalculation for the sales-contract edit form
  // (mirrors SalesSouda.jsx's computeFromFormValues exactly)
  // ---------------------------------------------------------------
  const computeFromFormValues = (values) => {
    const items = (values.items || []).map((it, idx) => ({
      ...it,
      lineKey: it.lineKey || idx + 1,
    }));

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
    const totalAmount = items.reduce((s, it) => s + Number(it.amount || 0), 0);
    const totalGSTAmount = items.reduce(
      (s, it) => s + Number(it.gstAmount || 0),
      0,
    );
    const grossAmountTotal = items.reduce(
      (s, it) => s + Number(it.totalAmount || 0),
      0,
    );

    const sgstPercent = Number(values.orderTaxAndTotals?.sgstPercent || 0);
    const cgstPercent = Number(values.orderTaxAndTotals?.cgstPercent || 0);
    const igstPercent = Number(values.orderTaxAndTotals?.igstPercent || 0);
    const tcsAmt = Number(values.orderTaxAndTotals?.tcsAmt || 0);

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
        totalAmount,
        totalGSTAmount,
        grossAmount: grossAmountTotal,
      },
    };
  };

  const handleContractEditValuesChange = (_changed, allValues) => {
    const computed = computeFromFormValues(allValues || {});
    contractForm.setFieldsValue({
      items: computed.items,
      orderTaxAndTotals: {
        ...allValues.orderTaxAndTotals,
        ...computed.orderTaxAndTotals,
      },
      orderTotals: computed.orderTotals,
    });
  };

  // ---------------------------------------------------------------
  // Fetch selectable sale contracts: same list API used on the Sales
  // Contract page, filtered client-side to Approved + optional date range.
  // ---------------------------------------------------------------
  const fetchAvailableContracts = async (range = null) => {
    try {
      setContractsLoading(true);

      const res = await getSalescontractGroups();
      const list = res?.data || res || [];

      console.log("All Sale Contracts:", list);

      let currentRange = range;

      // Default range = oldest Valid From -> Today
      if (!currentRange && list.length > 0) {
        const validFromDates = list
          .map((c) => parseApiDate(c.from_date))
          .filter((date) => date && date.isValid());

        if (validFromDates.length > 0) {
          const oldestDate = validFromDates.reduce((oldest, current) =>
            current.isBefore(oldest) ? current : oldest,
          );

          currentRange = [oldestDate.startOf("day"), dayjs().endOf("day")];

          setContractDateRange(currentRange);
        }
      }

      const startDate = currentRange?.[0];
      const endDate = currentRange?.[1];

      // Approved + Valid From date filter
      const approved = list.filter((c) => {
        const isApproved = c.status?.toLowerCase() === "approved";

        if (!isApproved) return false;

        if (startDate && endDate) {
          // IMPORTANT: Valid From date
          const contractDate = parseApiDate(c.from_date);

          if (!contractDate || !contractDate.isValid()) {
            return false;
          }

          return (
            !contractDate.isBefore(startDate, "day") &&
            !contractDate.isAfter(endDate, "day")
          );
        }

        return true;
      });

      console.log("Approved Filtered Contracts:", approved);

      const formatted = approved.map(mapContractRecord);

      setAvailableContracts(formatted);

      return formatted;
    } catch (err) {
      console.error("Failed to load sale contracts:", err);
      message.error("Failed to load available sale contracts");
      return [];
    } finally {
      setContractsLoading(false);
    }
  };

  // Reactively fetch when dates or mode change
  // useEffect(() => {
  //   if (modalMode === "add" || modalMode === "edit") {
  //     fetchAvailableContracts();
  //   }
  // }, [contractDateRange, modalMode]);

  // ---------------------------------------------------------------
  // Modal open/close
  // ---------------------------------------------------------------
  const closeModal = () => {
    setModalMode(null);
    setSelectedRecord(null);
    setSelectedRowKeys([]);
    setAvailableContracts([]);
    setContractSearch("");
  };

  const openAddModal = async () => {
    setModalMode("add");
    setSelectedRecord(null);
    setSelectedRowKeys([]);
    setStatusValue("Fresh");
    setContractSearch("");
    setContractDateRange(null);
    await fetchAvailableContracts(null);
  };

  const openViewModal = async (record) => {
    try {
      setLoading(true);
      const res = await getPurchaseSalesContractOrderById(
        record.id || record.key,
      );
      const detail = res?.data || res;
      setSelectedRecord(detail);
      setModalMode("view");
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase order details");
    } finally {
      setLoading(false);
    }
  };
  const openPoContractsModal = (record) => {
    setSelectedPoForContracts(record);
    setIsPoContractsModalOpen(true);
  };
  const openEditModal = async (record) => {
    try {
      setLoading(true);
      const res = await getPurchaseSalesContractOrderById(
        record.id || record.key,
      );
      const detail = res?.data || res;
      setSelectedRecord(detail);
      setStatusValue(detail.status || "Fresh");
      setContractSearch("");

      const linkedContracts =
        detail.sale_contracts ||
        detail.sales_contracts ||
        detail.sales_contracts_details ||
        detail.contracts ||
        [];
      const linkedIds = linkedContracts.map((c) =>
        typeof c === "object" ? c.sale_contract_id || c.id : c,
      );
      setSelectedRowKeys(linkedIds);

      // Fetch available (Approved) contracts, then merge in already-linked ones
      // even if their status has since changed, so nothing silently disappears.
      const fetched = await fetchAvailableContracts();

      if (linkedContracts.length) {
        const existingIds = new Set(fetched.map((c) => c.id));
        const merged = [...fetched];
        linkedContracts.forEach((c, idx) => {
          if (
            typeof c === "object" &&
            !existingIds.has(c.sale_contract_id || c.id)
          ) {
            merged.push(mapContractRecord(c, idx));
          }
        });
        setAvailableContracts(merged);
      }

      setModalMode("edit");
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Create / Update Purchase Order — sends ONLY the selected sale
  // contract ids, never the full contract objects.
  // ---------------------------------------------------------------
  const handleSubmitSelection = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one sale contract");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        order_date: dayjs().format("YYYY-MM-DD"),
        status: modalMode === "edit" ? statusValue : "Fresh",
        sale_contracts: selectedRowKeys,
      };

      if (modalMode === "edit") {
        await updatePurchaseSalesContractOrder(selectedRecord.id, payload);
        message.success("Purchase order updated successfully");
      } else {
        await createpurchaseOrder(payload);
        message.success("Purchase order created successfully");
      }

      closeModal();
      fetchPurchaseOrder();
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------
  // Related contracts actions
  // ---------------------------------------------------------------
  const handleDownloadContractReport = async (contract) => {
    const cId = contract.sale_contract_id || contract.id || contract;
    const cNo =
      contract.sale_contract_number ||
      contract.contract_number ||
      `Contract_${cId}`;
    try {
      message.loading({
        content: `Fetching details for contract ${cNo}...`,
        key: "download_c",
      });
      const detail = await getSalesContractById(cId);

      const items = detail.items || [];
      const exportRows = items.map((it) => ({
        "Contract No":
          detail.sale_contract_number || detail.contract_number || cNo,
        "Customer Name":
          detail.customer_business_name || detail.customer_name || "-",
        "Plant Name": detail.plant_name || "-",
        "Broker Name": detail.broker_name || "-",
        "Contract Date":
          detail.created_at || detail.contract_date
            ? dayjs(detail.created_at || detail.contract_date).format(
                "DD-MM-YYYY",
              )
            : "-",
        "Valid From":
          detail.from_date || detail.start_date
            ? dayjs(detail.from_date || detail.start_date).format("DD-MM-YYYY")
            : "-",
        "Valid To":
          detail.to_date || detail.end_date
            ? dayjs(detail.to_date || detail.end_date).format("DD-MM-YYYY")
            : "-",
        Status: detail.status,
        Product: it.product_name || "-",
        Quantity: it.gross_qty || 0,
        Rate: it.rate || 0,
        "Line Total": it.line_total || it.total_amount || 0,
      }));

      if (exportRows.length === 0) {
        exportRows.push({
          "Contract No": detail.sale_contract_number || cNo,
          "Customer Name": detail.customer_business_name || "-",
          "Plant Name": detail.plant_name || "-",
          "Broker Name": detail.broker_name || "-",
          "Contract Date":
            detail.created_at || detail.contract_date
              ? dayjs(detail.created_at || detail.contract_date).format(
                  "DD-MM-YYYY",
                )
              : "-",
          "Valid From":
            detail.from_date || detail.start_date
              ? dayjs(detail.from_date || detail.start_date).format(
                  "DD-MM-YYYY",
                )
              : "-",
          "Valid To":
            detail.to_date || detail.end_date
              ? dayjs(detail.to_date || detail.end_date).format("DD-MM-YYYY")
              : "-",
          Status: detail.status,
          Product: "-",
          Quantity: 0,
          Rate: 0,
          "Line Total": detail.grand_total || detail.total_amount || 0,
        });
      }

      exportToExcel(exportRows, `Contract_Report_${cNo}`, `Contract_${cNo}`);
      message.success({
        content: `Contract report ${cNo} downloaded!`,
        key: "download_c",
      });
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to download contract report",
        key: "download_c",
      });
    }
  };

  const handleOpenAssignVehicle = async (contract) => {
    setSelectedContractForAssign(contract);
    assignForm.resetFields();

    try {
      message.loading({
        content: "Loading transport and vehicles...",
        key: "load_assign",
      });
      const transRes = await getAllTransport();
      const vehRes = await getAllVehicles();

      setTransporters(transRes?.data || transRes || []);
      setVehicles(vehRes?.data || vehRes || []);

      message.destroy("load_assign");
      setIsAssignModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to load transporters or vehicles",
        key: "load_assign",
      });
    }
  };

  const handleAssignSubmit = async (values) => {
    const cId =
      selectedContractForAssign.sale_contract_id ||
      selectedContractForAssign.id ||
      selectedContractForAssign;
    const cNo =
      selectedContractForAssign.sale_contract_number ||
      selectedContractForAssign.contract_number ||
      `Contract #${cId}`;

    try {
      setAssignSubmitting(true);

      const selectedTrans = transporters.find(
        (t) => t.id === values.transporterId,
      );
      const selectedVeh = vehicles.find((v) => v.id === values.vehicleId);

      const payload = {
        contract: cId,
        sale_contract: cId,
        transport: values.transporterId,
        transport_name:
          selectedTrans?.registered_name || selectedTrans?.name || "",
        vehicle: values.vehicleId,
        vehicle_number:
          selectedVeh?.vehicle_number || selectedVeh?.number || "",
      };

      await addAssignment(payload);
      message.success(
        `Transport vehicle assigned to contract ${cNo} successfully!`,
      );
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to assign transport vehicle");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleOpenWhatsappModal = async (contract) => {
    setSelectedContractForWhatsapp(contract);
    whatsappForm.resetFields();

    const cId = contract.sale_contract_id || contract.id || contract;
    const cNo =
      contract.sale_contract_number ||
      contract.contract_number ||
      `Contract #${cId}`;
    const customerName =
      contract.customer_business_name ||
      contract.customer_name ||
      contract.customer ||
      "-";

    whatsappForm.setFieldsValue({
      message: `Hello team,\n\nHere is the report for Sales Contract *${cNo}*.\nCustomer: ${customerName}\nStatus: Approved\n\nPlease check.`,
    });

    try {
      message.loading({
        content: "Loading WhatsApp groups...",
        key: "load_whatsapp",
      });
      const groupsRes = await getAllWhatsappGroups();
      setWhatsappGroups(groupsRes?.data || groupsRes || []);
      message.destroy("load_whatsapp");
      setIsWhatsappModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to load WhatsApp groups",
        key: "load_whatsapp",
      });
    }
  };

  const handleWhatsappSubmit = async (values) => {
    const cId =
      selectedContractForWhatsapp.sale_contract_id ||
      selectedContractForWhatsapp.id ||
      selectedContractForWhatsapp;

    try {
      setWhatsappSubmitting(true);
      const selectedGroup = whatsappGroups.find((g) => g.id === values.groupId);

      const payload = {
        message: values.message,
        contract: cId,
      };

      await sendWhatsappMessage(values.groupId, payload);
      message.success(
        `Report sent to WhatsApp group "${selectedGroup?.group_name || selectedGroup?.name}" successfully!`,
      );
      setIsWhatsappModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to send report to WhatsApp group");
    } finally {
      setWhatsappSubmitting(false);
    }
  };

  // ---------------------------------------------------------------
  // Sales Contract full edit (double-click a row in the Add/Edit
  // Purchase Order modal) — same form + same PUT payload as
  // SalesSouda.jsx's own edit modal.
  // ---------------------------------------------------------------
  const openEditSalesContract = async (contractRecord) => {
    const cId =
      contractRecord.sale_contract_id || contractRecord.id || contractRecord;
    try {
      message.loading({
        content: "Loading contract details...",
        key: "load_contract",
      });
      const contract = await getSalesContractById(cId);
      const mapped = mapContractToForm(contract);

      if (contract.plant_id) {
        const products = await getProductByplant(contract.plant_id);
        setSelectedPlantId(contract.plant_id);
        setVendorProductsMap({
          [contract.plant_id]: Array.isArray(products) ? products : [],
        });
      }

      setContractEditingRecord(mapped);
      contractForm.setFieldsValue(mapped);
      setEditItemDropdownIndex(null);

      message.destroy("load_contract");
      setIsContractEditModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error({
        content: "Failed to load contract details",
        key: "load_contract",
      });
    }
  };

  const handleEditSalesContractFinish = async (values) => {
    const round2 = (value) => Number(Number(value || 0).toFixed(2));

    try {
      setContractSubmitting(true);

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
            contract_rate: contractRate,
            gross_qty: grossQty,
            free_qty: freeQty,
            net_qty: netQty,
            discount_percent: discountPercent,
            discount_amount: round2(discountAmount),
            line_total: round2(grossAmount - discountAmount),
            gst_amount: round2(it.gstAmount),
            gross_amount: round2(it.totalAmount),
            roundoff: round2(it.roundOff),
            total_net_wt_in_ton: round2(it.weightTon),
            gst_percentage: Number(it.gstPercent || 0),
          };
        });

      const payload = {
        customer_id: contractEditingRecord.customerId,
        customer_email: values.customerEmail,
        customer_mobile:
          values.customerMobile ||
          contractEditingRecord.customerMobile ||
          123456789,
        location:
          values.customerAddress || contractEditingRecord.location || null,
        plant_id: values.plantId || null,

        broker_id:
          values.brokerId?.value === "direct"
            ? null
            : (values.brokerId?.value ?? contractEditingRecord.brokerId) ||
              null,
        broker_name:
          values.brokerId?.value === "direct"
            ? null
            : (values.brokerId?.label ?? contractEditingRecord.brokerName) ||
              null,

        status: values.status,
        created_date: values.soudaDate
          ? dayjs(values.soudaDate).format("YYYY-MM-DD")
          : null,
        from_date: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DD")
          : null,
        to_date: values.endDate
          ? dayjs(values.endDate).format("YYYY-MM-DD")
          : null,

        cash_discount: 0,
        round_off_amount: round2(
          (values.items || []).reduce(
            (sum, it) => sum + Number(it.roundOff || 0),
            0,
          ),
        ),
        narration: "Admin updated contract",

        cgst: Number(values.orderTaxAndTotals?.cgstPercent || 0),
        sgst: Number(values.orderTaxAndTotals?.sgstPercent || 0),
        igst: Number(values.orderTaxAndTotals?.igstPercent || 0),
        tcs_amount: Number(values.orderTaxAndTotals?.tcsAmt || 0),
        total_amount: round2(values.orderTotals.totalAmount),
        total_gst_amount: round2(values.orderTotals.totalGSTAmount),
        grand_total: round2(values.orderTotals.grossAmount),
        total_net_weight: round2(values.orderTotals.totalWeightTon),
        items,
      };

      // same PUT API SalesSouda.jsx uses
      await updateSalesContract(contractEditingRecord.key, payload);
      message.success("Sales contract updated successfully!");
      setIsContractEditModalOpen(false);
      setContractEditingRecord(null);
      contractForm.resetFields();

      // refresh the checkbox-selectable list in the Purchase Order modal
      fetchAvailableContracts();
    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.message || "Failed to update sales contract",
      );
    } finally {
      setContractSubmitting(false);
    }
  };

  // ---------------------------------------------------------------
  // ItemsTable — ported verbatim from SalesSouda.jsx so the sales
  // contract edit form behaves identically (auto-calc, keyboard nav,
  // auto-add row, etc).
  // ---------------------------------------------------------------
  const ItemsTable = ({
    form,
    allowRemove = true,
    allowAdd = true,
    productList = [],
    openItemIndex,
    setOpenItemIndex,
  }) => {
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
        grossWt: product.gross_weight || 0,
      };

      form.setFieldsValue({ items: updatedItems });
      recalculateRow(fieldName, updatedItems);

      setOpenItemIndex?.(null);
      setTimeout(() => {
        qtyRefs.current[fieldName]?.focus();
      }, 100);
    };

    const recalculateRow = (index, itemsOverride) => {
      const items = itemsOverride || form.getFieldValue("items") || [];
      const it = items[index];
      if (!it) return;

      const qty = Number(it.qty || 0);
      const freeQty = Number(it.freeQty || 0);
      const grossWtPerUnit = Number(it.grossWt || 0);
      const gstPercent = Number(it.gstPercent || 0);
      const contractRate = Number(it.contractRate || 0);

      const weightTon = ((qty + freeQty) * grossWtPerUnit) / 1000;

      const rate =
        gstPercent > 0 ? contractRate / (1 + gstPercent / 100) : contractRate;

      const amount = qty * rate;
      const gstAmount = (amount * gstPercent) / 100;
      const subTotal = amount + gstAmount;
      const roundedTotal = Math.round(subTotal);
      const roundOff = roundedTotal - subTotal;
      const totalAmount = subTotal + roundOff;

      const updatedItems = [...items];
      updatedItems[index] = {
        ...updatedItems[index],
        weightTon: Number(weightTon.toFixed(3)),
        rate: Number(rate.toFixed(2)),
        amount: Number(amount.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2)),
        roundOff: Number(roundOff.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
      };

      form.setFieldsValue({ items: updatedItems });
    };

    const handleAutoAddRow = (add) => {
      if (!allowAdd) return;

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
        const newIndex = items.length;

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

        setTimeout(() => {
          setOpenItemIndex?.(newIndex);
          const selectEl = itemRefs.current[newIndex];
          selectEl?.focus();
          const inputEl = selectEl?.nativeElement?.querySelector("input");
          inputEl?.focus();
        }, 150);
      }
    };

    return (
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            <div className="mb-2">
              <h6 className="text-amber-500">Items</h6>
            </div>

            <Row
              gutter={4}
              className="pb-2 mb-2 text-amber-800 font-semibold text-xs"
            >
              <Col span={5}>Item Name</Col>
              <Col span={2}>Quantity</Col>
              <Col span={1}>Free Qty</Col>
              <Col span={2}>Unit</Col>
              <Col span={1}>Gross wt</Col>
              <Col span={1}>GST %</Col>
              <Col span={2}>Contract Rate</Col>
              <Col span={2}>Rate</Col>
              <Col span={2}>Amount</Col>
              <Col span={2}>GST Amount</Col>
              <Col span={1}>Ro. Off</Col>
              <Col span={2}>Total Amount</Col>
              <Col span={1}></Col>
            </Row>

            {fields.map((field) => (
              <Row key={field.key} gutter={4} align="middle" className="mb-5">
                <Col span={5}>
                  <Form.Item
                    name={[field.name, "item"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      ref={(el) => (itemRefs.current[field.name] = el)}
                      placeholder="Select Item"
                      showSearch
                      optionFilterProp="children"
                      open={openItemIndex === field.name}
                      onFocus={() => setOpenItemIndex?.(field.name)}
                      onDropdownVisibleChange={(visible) => {
                        if (!visible) setOpenItemIndex?.(null);
                      }}
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
                      onFocus={(e) => e.target.select()}
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
                        setTimeout(() => {
                          const qtyInput =
                            qtyRefs.current[
                              field.name
                            ]?.nativeElement?.querySelector("input");

                          qtyInput?.focus();
                          qtyInput?.select();
                        }, 100);
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={2}>
                  <Form.Item
                    name={[field.name, "uom"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={1}>
                  <Form.Item
                    name={[field.name, "weightTon"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={1}>
                  <Form.Item
                    name={[field.name, "gstPercent"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

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
                      precision={2}
                      step={0.01}
                      defaultValue={0}
                      onFocus={(e) => {
                        setTimeout(() => e.target.select(), 0);
                      }}
                      onChange={() => {
                        setTimeout(() => recalculateRow(field.name), 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Tab") {
                          e.preventDefault();
                          handleAutoAddRow(add);
                        }
                      }}
                      onBlur={() => handleAutoAddRow(add)}
                    />
                  </Form.Item>
                </Col>

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
                <Col span={1}>
                  <Form.Item
                    name={[field.name, "roundOff"]}
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

  // ---------------------------------------------------------------
  // Filtered contracts for in-modal search
  // ---------------------------------------------------------------
  const filteredContracts = contractSearch
    ? availableContracts.filter((c) =>
        JSON.stringify(c).toLowerCase().includes(contractSearch.toLowerCase()),
      )
    : availableContracts;

  // ---------------------------------------------------------------
  // Columns — purchase order list
  // ---------------------------------------------------------------
  const orderColumns = [
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "order_number",
      width: 120,
      render: (t, record) => (
        <span
          className="text-amber-800 font-semibold cursor-pointer"
          onDoubleClick={() => openPoContractsModal(record)}
          title="Double click to view sale contracts"
        >
          {t}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Order Date</span>,
      dataIndex: "order_date",
      width: 110,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant</span>,
      dataIndex: "plant_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "vendor_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Contracts</span>,
      dataIndex: "contract_count",
      width: 100,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Related Contracts</span>
      ),
      width: 180,
      render: (_, record) => {
        const contracts = record.sales_contracts || [];
        if (contracts.length === 0) {
          return <span className="text-gray-400">None</span>;
        }

        const menuItems = contracts.map((c) => {
          // sale_contract_id is the real contract id; id on this record is
          // just the purchase-order-to-contract link row — never use it for
          // API calls.
          const cId = c.sale_contract_id || c.id || c;
          const cNo =
            c.sale_contract_number || c.contract_number || `Contract #${cId}`;
          const customer =
            c.customer_name || c.customer_business_name || c.customer || "-";
          const plant = c.plant_name || "-";
          const validFrom = fmtDate(c.from_date);
          const validTo = fmtDate(c.to_date);
          const qty = c.total_qty ?? c.quantity ?? 0;
          const amount = c.grand_total ?? c.total_amount ?? 0;

          return {
            key: cId,
            label: (
              <div style={{ minWidth: 240 }} className="py-1">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-semibold text-amber-800">{cNo}</span>
                  {renderStatusBadge(c.status)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {customer} • {plant}
                </div>
                <div className="text-xs text-gray-500">
                  Valid: {validFrom} to {validTo}
                  {c.extended_upto ? ` (ext. ${fmtDate(c.extended_upto)})` : ""}
                </div>
                <div className="text-xs text-gray-700 font-medium mt-1">
                  Qty: {Number(qty).toFixed(2)} &nbsp;|&nbsp; ₹
                  {Number(amount).toLocaleString()}
                </div>
              </div>
            ),
            children: [
              {
                key: `${cId}_download`,
                label: "Download Report",
                icon: <DownloadOutlined />,
                onClick: () => handleDownloadContractReport(c),
              },
              {
                key: `${cId}_assign`,
                label: "Assign Vehicle",
                icon: <TruckOutlined />,
                onClick: () => handleOpenAssignVehicle(c),
              },
              {
                key: `${cId}_whatsapp`,
                label: "Send to WhatsApp",
                icon: <SendOutlined />,
                onClick: () => handleOpenWhatsappModal(c),
              },
            ],
          };
        });

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Button
              size="small"
              className="border-amber-400 text-amber-700 hover:bg-amber-100 flex items-center gap-1"
            >
              {contracts.length} Contract{contracts.length > 1 ? "s" : ""}{" "}
              <DownOutlined style={{ fontSize: "10px" }} />
            </Button>
          </Dropdown>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty_all_items",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Total Amount (₹)</span>
      ),
      dataIndex: "grand_total",
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
      render: renderStatusBadge,
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      // render: (_, record) => (
      //   <div className="flex gap-3">
      //     <EyeOutlined
      //       className="cursor-pointer text-blue-500"
      //       onClick={() => openViewModal(record)}
      //     />
      //     {record.status !== "Approved" && (
      //       <EditOutlined
      //         className="cursor-pointer text-red-500"
      //         onClick={() => openEditModal(record)}
      //       />
      //     )}
      //   </div>
      // ),
    },
  ];

  // ---------------------------------------------------------------
  // Columns — available sale contracts (mirrors SalesSouda table)
  // ---------------------------------------------------------------
  const contractColumns = [
    {
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
      dataIndex: "saleContractNumber",
      width: 120,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plantName",
      width: 120,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Broker Name</span>,
      dataIndex: "brokerName",
      width: 120,
      render: (t) => (
        <span className="text-amber-800">
          {t && t !== "-" ? t.trim().split(/\s+/)[0] : "Direct"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Contract Date</span>
      ),
      dataIndex: "contractDate",
      width: 120,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Valid From</span>,
      dataIndex: "startDate",
      width: 110,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Valid To</span>,
      dataIndex: "endDate",
      width: 110,
      render: (t) => <span className="text-amber-800">{fmtDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customer",
      width: 150,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Quantity</span>,
      dataIndex: "quantity",
      width: 100,
      render: (t) => (
        <span className="text-amber-800">{Number(t || 0).toFixed(3)}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Gross Weight (Ton)</span>
      ),
      dataIndex: "grossWeightTon",
      width: 140,
      render: (t) => (
        <span className="text-amber-800">{Number(t || 0).toFixed(3)}</span>
      ),
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Status</span>,
    //   dataIndex: "status",
    //   width: 110,
    //   render: renderStatusBadge,
    // },
    // {
    //   title: <span className="text-amber-700 font-semibold">Total (₹)</span>,
    //   dataIndex: "grandTotal",
    //   width: 130,
    //   render: (t) => (
    //     <span className="text-amber-800 font-semibold">
    //       {t !== undefined && t !== null ? `₹ ${Number(t).toFixed(2)}` : "-"}
    //     </span>
    //   ),
    // },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600" />}
            placeholder="Search..."
            className="w-64 border-amber-300"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
            onClick={() => {
              setSearchText("");
              fetchPurchaseOrder();
            }}
          >
            Reset
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Export
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            onClick={openAddModal}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Purchase Order Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Order Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your purchase order data</p>

        <Table
          columns={orderColumns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 420 }}
          rowKey="key"
          size="small"
        />
      </div>

      {/* purchase order linked sale contract show */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Sale Contracts - {selectedPoForContracts?.order_number}
          </span>
        }
        open={isPoContractsModalOpen}
        onCancel={() => {
          setIsPoContractsModalOpen(false);
          setSelectedPoForContracts(null);
        }}
        footer={null}
        width={1600}
      >
        <Card
          size="small"
          style={{ border: "1px solid #FDE68A" }}
          bodyStyle={{ padding: 12 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h6 className="text-amber-500 mb-0">Linked Sale Contracts</h6>

            <span className="text-sm text-amber-700 font-semibold">
              {selectedPoForContracts?.sales_contracts?.length || 0} Contract(s)
            </span>
          </div>

          <Table
            columns={contractColumns}
            dataSource={(selectedPoForContracts?.sales_contracts || []).map(
              mapContractRecord,
            )}
            pagination={false}
            scroll={{ y: 360, x: 1200 }}
            rowKey="key"
            size="small"
          />
        </Card>
      </Modal>
      {/* ── Add / Edit Purchase Order Modal ── */}
      <Modal
        title={
          <span className="!text-amber-700 !text-2xl !font-semibold">
            {modalMode === "edit"
              ? "Edit Purchase Order"
              : "Create Purchase Order"}
          </span>
        }
        open={modalMode === "add" || modalMode === "edit"}
        onCancel={closeModal}
        footer={null}
        width={1600}
      >
        {modalMode === "edit" && (
          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            bodyStyle={{ padding: 12 }}
          >
            <Row gutter={16} align="bottom">
              <Col span={6}>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <Select
                  className="w-full"
                  value={statusValue}
                  onChange={setStatusValue}
                >
                  {statusOptions.map((opt) => (
                    <Option key={opt} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        )}

        <Card
          size="small"
          style={{ border: "1px solid #FDE68A" }}
          bodyStyle={{ padding: 12 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h6 className="text-amber-500 mb-0">Approved Sale Contracts</h6>
            <div className="flex items-center gap-3">
              <span className="text-sm text-amber-700 font-semibold">
                Dates:
              </span>
              <DatePicker.RangePicker
                value={contractDateRange}
                onChange={(dates) => {
                  if (dates) setContractDateRange(dates);
                }}
                className="border-amber-300"
                style={{ width: 240 }}
              />
              <Input
                prefix={<SearchOutlined className="text-amber-600" />}
                placeholder="Search contracts..."
                className="w-52 border-amber-300"
                value={contractSearch}
                onChange={(e) => setContractSearch(e.target.value)}
                allowClear
              />
              <span className="text-sm text-amber-700 font-semibold">
                {selectedRowKeys.length} selected
              </span>
            </div>
          </div>

          <Table
            rowSelection={rowSelection}
            columns={contractColumns}
            dataSource={filteredContracts}
            loading={contractsLoading}
            pagination={false}
            scroll={{ y: 360, x: 1200 }}
            rowKey="key"
            onRow={(record) => ({
              onDoubleClick: () => openEditSalesContract(record),
            })}
            rowClassName={() => "cursor-pointer"}
            size="small"
          />
        </Card>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={closeModal}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={submitting}
            disabled={selectedRowKeys.length === 0}
            className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            onClick={handleSubmitSelection}
          >
            {modalMode === "edit"
              ? "Update Purchase Order"
              : "Create Purchase Order"}
          </Button>
        </div>
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Purchase Order
          </span>
        }
        open={modalMode === "view"}
        onCancel={closeModal}
        footer={null}
        width={1400}
      >
        {selectedRecord && (
          <>
            <Card
              size="small"
              style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
              bodyStyle={{ padding: 12 }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Order No</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.order_number}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Plant</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.plant_name}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Supplier</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.vendor_name}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Status</div>
                  <div>{renderStatusBadge(selectedRecord.status)}</div>
                </Col>
              </Row>
              <Row gutter={16} className="mt-3">
                <Col span={6}>
                  <div className="text-sm text-gray-500">Total Qty</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.total_qty_all_items || 0}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-500">Total Amount (₹)</div>
                  <div className="text-amber-800 font-semibold">
                    ₹
                    {Number(
                      selectedRecord.grand_total ||
                        selectedRecord.total_amount ||
                        0,
                    ).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              size="small"
              style={{ border: "1px solid #FDE68A" }}
              bodyStyle={{ padding: 12 }}
            >
              <h6 className="text-amber-500 mb-2">Linked Sale Contracts</h6>
              <Table
                columns={contractColumns}
                dataSource={(
                  selectedRecord.sale_contracts ||
                  selectedRecord.sales_contracts ||
                  selectedRecord.sales_contracts_details ||
                  selectedRecord.contracts ||
                  []
                ).map(mapContractRecord)}
                pagination={false}
                scroll={{ y: 280, x: 1200 }}
                rowKey="key"
                onRow={(record) => ({
                  onDoubleClick: () => openEditSalesContract(record),
                })}
                rowClassName={() => "cursor-pointer"}
                size="small"
              />
            </Card>
          </>
        )}
      </Modal>

      {/* ── Sales Contract Edit Modal — full form, same as SalesSouda.jsx ── */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Edit Sales Contract (Double Click)
          </span>
        }
        open={isContractEditModalOpen}
        onCancel={() => {
          setIsContractEditModalOpen(false);
          contractForm.resetFields();
          setContractEditingRecord(null);
          setEditItemDropdownIndex(null);
        }}
        footer={null}
        width={1800}
      >
        <Form
          form={contractForm}
          layout="vertical"
          onFinish={handleEditSalesContractFinish}
          onValuesChange={handleContractEditValuesChange}
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
                        contractForm.setFieldsValue({
                          customerAddress: [selectedCustomer.city]
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
              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Plant Name</span>}
                  name="plantId"
                  rules={[{ required: true, message: "Select Plant Name" }]}
                >
                  <Select
                    placeholder="Select Plant"
                    showSearch
                    optionFilterProp="children"
                    onChange={async (plantId) => {
                      setSelectedPlantId(plantId);
                      try {
                        const products = await getProductByplant(plantId);
                        setVendorProductsMap({ [plantId]: products || [] });
                      } catch (err) {
                        console.error("Product API Error:", err);
                      }
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
                  name="brokerId"
                  rules={[{ required: true, message: "Select Broker Name" }]}
                >
                  <Select
                    placeholder="Select Broker"
                    showSearch
                    optionFilterProp="children"
                    labelInValue
                    onChange={(option) => {
                      if (option?.value === "direct") {
                        contractForm.setFieldsValue({
                          brokerId: { value: "direct", label: "Direct" },
                        });
                      } else {
                        const firstWord = option.label?.split(" ")[0] || "";
                        contractForm.setFieldsValue({
                          brokerId: { value: option.value, label: firstWord },
                        });
                      }
                    }}
                  >
                    <Select.Option key="direct" value="direct">
                      Direct
                    </Select.Option>
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
                  rules={[{ required: true }]}
                >
                  <AppDatePicker
                    ref={contractDateRef}
                    disabledDate={(current) => {
                      if (current && current.isAfter(dayjs(), "day"))
                        return true;
                      return createFinancialYearDisabledDate(selectedFY)(
                        current,
                      );
                    }}
                    onTabComplete={() => {
                      setTimeout(() => validFromRef.current?.focus(), 50);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid From</span>}
                  name="startDate"
                >
                  <AppDatePicker
                    ref={validFromRef}
                    disabledDate={createFinancialYearDisabledDate(selectedFY)}
                    onTabComplete={() => {
                      setTimeout(() => validToRef.current?.focus(), 50);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={<span className="text-amber-700">Valid To</span>}
                  name="endDate"
                  rules={[
                    {
                      validator: (_, value) => {
                        const fromDate =
                          contractForm.getFieldValue("startDate");
                        if (
                          value &&
                          fromDate &&
                          dayjs(value).isBefore(dayjs(fromDate), "day")
                        ) {
                          return Promise.reject(
                            "Valid To, Valid From se pehle nahi ho sakta!",
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <AppDatePicker
                    ref={validToRef}
                    disabledDate={(current) => {
                      const fromDate = contractForm.getFieldValue("startDate");
                      if (
                        fromDate &&
                        current &&
                        current.isBefore(dayjs(fromDate), "day")
                      ) {
                        return true;
                      }
                      return createFinancialYearDisabledDate(selectedFY)(
                        current,
                      );
                    }}
                    onTabComplete={() => {
                      setEditItemDropdownIndex(0);
                      setTimeout(() => {
                        const selectEl = itemRefs.current[0];
                        selectEl?.focus();
                        const inputEl =
                          selectEl?.nativeElement?.querySelector("input");
                        inputEl?.focus();
                      }, 100);
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item
                  label={<span className="text-amber-700">Status</span>}
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Status">
                    {statusOptions.map((s) => (
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
              form={contractForm}
              allowRemove={false}
              allowAdd={false}
              productList={vendorProductsMap[selectedPlantId] || []}
              openItemIndex={editItemDropdownIndex}
              setOpenItemIndex={setEditItemDropdownIndex}
            />
          </Card>

          <Card
            size="small"
            style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "6px 12px 0px 12px" } }}
          >
            <Row gutter={8}>
              <Col span={5}>
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
              <Col span={1}></Col>

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

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsContractEditModalOpen(false);
                contractForm.resetFields();
                setContractEditingRecord(null);
                setEditItemDropdownIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={contractSubmitting}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            >
              Save Contract Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Assign Transport Vehicle Modal ── */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Assign Transport Vehicle
          </span>
        }
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignSubmit}>
          <Form.Item
            label="Transporter"
            name="transporterId"
            rules={[{ required: true, message: "Please select a transporter" }]}
          >
            <Select
              placeholder="Select Transporter"
              showSearch
              optionFilterProp="children"
            >
              {transporters.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.registered_name || t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Vehicle"
            name="vehicleId"
            rules={[{ required: true, message: "Please select a vehicle" }]}
          >
            <Select
              placeholder="Select Vehicle"
              showSearch
              optionFilterProp="children"
            >
              {vehicles.map((v) => (
                <Option key={v.id} value={v.id}>
                  {v.vehicle_number || v.number}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={assignSubmitting}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            >
              Assign
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Send Report to WhatsApp Group Modal ── */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            Send Report to WhatsApp Group
          </span>
        }
        open={isWhatsappModalOpen}
        onCancel={() => setIsWhatsappModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={whatsappForm}
          layout="vertical"
          onFinish={handleWhatsappSubmit}
        >
          <Form.Item
            label="WhatsApp Group"
            name="groupId"
            rules={[
              { required: true, message: "Please select a WhatsApp group" },
            ]}
          >
            <Select
              placeholder="Select WhatsApp Group"
              showSearch
              optionFilterProp="children"
            >
              {whatsappGroups.map((g) => (
                <Option key={g.id} value={g.id}>
                  {g.group_name || g.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea rows={6} placeholder="Enter message to send..." />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsWhatsappModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={whatsappSubmitting}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            >
              Send Report
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
