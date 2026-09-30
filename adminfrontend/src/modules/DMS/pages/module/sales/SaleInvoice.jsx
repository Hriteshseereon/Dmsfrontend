import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  message,
  Modal,
  Form,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Upload,
  Typography,
  Tag,
  Divider,
  Space,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getNextSaleInvoiceNumber,
  getSaleInvoiceCustomers,
  getSaleInvoicePlants,
  getSaleInvoiceBrokers,
  getSaleInvoiceIntransitVehicles,
  getSaleInvoiceCustomerContractItems,
  createSaleInvoice,
  getSaleInvoices,
  updateSaleInvoice,
  deleteSaleInvoice,
  fetchSaleInvoicePDF,
} from "../../../../../api/sales";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import AppDatePicker from "../../../../../components/AppDatePicker";
import useSessionStore from "../../../../../store/sessionStore";

dayjs.extend(customParseFormat);

const { Option } = Select;
const { Text } = Typography;

const parseApiDate = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  const str = String(value).trim();
  if (!str) return null;

  // Try standard known formats first
  const formats = [
    "DD-MM-YYYY",
    "YYYY-MM-DD",
    "DD-MM-YYYY HH:mm:ss",
    "YYYY-MM-DD HH:mm:ss",
    "DD/MM/YYYY",
    "YYYY/MM/DD",
    "DD/MM/YYYY HH:mm:ss",
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DDTHH:mm:ss.SSSZ",
  ];
  for (const f of formats) {
    const d = dayjs(str, f, true);
    if (d.isValid()) return d;
  }

  // Fallback to relaxed dayjs parsing
  const d = dayjs(str);
  return d.isValid() ? d : null;
};

const fmtDate = (value) => {
  if (!value) return "-";
  const d = parseApiDate(value);
  if (d && d.isValid()) {
    return d.format("DD-MM-YYYY");
  }
  const str = String(value).trim();
  if (/^\d{2}-\d{2}-\d{4}/.test(str)) {
    return str.substring(0, 10);
  }
  return str || "-";
};

// Helper to extract array from any DRF response structure
const extractArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.results)) return res.results;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

// GST Helper: Checks if customer GST starts with "21" (Odisha - Intra State)
const isIntraStateGst = (gstNo) => {
  if (!gstNo) return true; // default to intra-state if not specified
  const cleanGst = String(gstNo).trim();
  return cleanGst.startsWith("21");
};

const ITEM_GRID_TEMPLATE =
  "3.4fr 1.0fr 0.9fr 1.0fr 0.8fr 0.7fr 0.9fr 0.9fr 1.0fr 0.7fr 0.8fr 0.9fr 1.25fr 0.95fr 0.95fr 0.95fr 1.4fr 64px";

export default function SaleInvoice() {
  const [form] = Form.useForm();
  const selectedFY = useSelectedFinancialYear();
  const currentOrgId = useSessionStore((state) => state.currentOrgId);

  // Main list states
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Master Dropdown Data
  const [customers, setCustomers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [intransitVehicles, setIntransitVehicles] = useState([]);
  const [contractItems, setContractItems] = useState([]);

  // Selected Customer metadata
  const [selectedCustomerGst, setSelectedCustomerGst] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [editingDocUrl, setEditingDocUrl] = useState(null);

  // Form field focus and navigation refs
  const invoiceDateRef = useRef(null);
  const customerSelectRef = useRef(null);
  const plantSelectRef = useRef(null);
  const brokerSelectRef = useRef(null);
  const vehicleSelectRef = useRef(null);
  const ewaybillNoRef = useRef(null);
  const ewaybillDateRef = useRef(null);
  const einvoiceNoRef = useRef(null);
  const paymentDueDateRef = useRef(null);

  // Items table row refs
  const itemSelectRefs = useRef([]);
  const itemQtyRefs = useRef([]);
  const itemFreeQtyRefs = useRef([]);
  const itemNetWtRefs = useRef([]);
  const itemGrossWtRefs = useRef([]);
  const itemRateRefs = useRef([]);
  const itemDiscPercentRefs = useRef([]);

  // Bottom card refs
  const dispatchFromRef = useRef(null);
  const shipToRef = useRef(null);
  const distanceKmRef = useRef(null);
  const roundOffRef = useRef(null);

  const focusItemField = (index, fieldType) => {
    setTimeout(() => {
      let targetEl = null;
      if (fieldType === "item_name") {
        targetEl = itemSelectRefs.current[index];
      } else if (fieldType === "qty") {
        targetEl = itemQtyRefs.current[index];
      } else if (fieldType === "free_qty") {
        targetEl = itemFreeQtyRefs.current[index];
      } else if (fieldType === "net_weight_kg") {
        targetEl = itemNetWtRefs.current[index];
      } else if (fieldType === "gross_weight_kg") {
        targetEl = itemGrossWtRefs.current[index];
      } else if (fieldType === "rate") {
        targetEl = itemRateRefs.current[index];
      } else if (fieldType === "discount_percent") {
        targetEl = itemDiscPercentRefs.current[index];
      }

      if (targetEl) {
        if (targetEl.focus) {
          targetEl.focus();
        }
        const input = targetEl.nativeElement
          ? targetEl.nativeElement.querySelector("input")
          : targetEl.querySelector
          ? targetEl.querySelector("input")
          : null;
        if (input) {
          input.focus();
          input.select?.();
        }
      }
    }, 40);
  };

  /* ---------------- FETCH INITIAL DATA ---------------- */
  useEffect(() => {
    fetchInvoices();
    loadMasterDropdowns();
  }, [selectedFY, currentOrgId]);

  const loadMasterDropdowns = async () => {
    try {
      const [custRes, plantRes, brokerRes] = await Promise.allSettled([
        getSaleInvoiceCustomers(),
        getSaleInvoicePlants(),
        getSaleInvoiceBrokers(),
      ]);

      if (custRes.status === "fulfilled" && custRes.value) {
        const custList = extractArray(custRes.value);
        setCustomers(custList);
      }

      if (plantRes.status === "fulfilled" && plantRes.value) {
        const plantList = extractArray(plantRes.value);
        setPlants(plantList);
      }

      if (brokerRes.status === "fulfilled" && brokerRes.value) {
        const brokerList = extractArray(brokerRes.value);
        setBrokers(brokerList);
      }
    } catch (err) {
      console.error("Error loading master dropdowns:", err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getSaleInvoices();
      const list = extractArray(res);
      setInvoices(list);
    } catch (err) {
      console.error("Error fetching sale invoices:", err);
      message.error("Failed to load sale invoices");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CUSTOMER CHANGE HANDLER ---------------- */
  const handleCustomerChange = async (customerId) => {
    const cust = customers.find(
      (c) => String(c.id || c.customer_id || c.pk) === String(customerId)
    );
    if (!cust) return;

    const custName = cust.name || cust.customer_name || cust.company_name || "";
    const custGst = cust.gst_number || cust.gst || cust.customer_gst || "";
    const place = cust.place || cust.city || cust.billing_city || cust.address_city || "";

    setSelectedCustomerGst(custGst);

    form.setFieldsValue({
      customer_id: customerId,
      customer_name: custName,
      customer_gst: custGst,
      place: place,
      ship_to: place,
      vehicle_no: undefined,
      transport_name: undefined,
      lr_no: undefined,
      lr_date: null,
      payment_due_date: null,
      dispatch_from: undefined,
    });

    // Load in-transit vehicles and contract items for this customer
    try {
      const [vehRes, itemRes] = await Promise.allSettled([
        getSaleInvoiceIntransitVehicles(customerId),
        getSaleInvoiceCustomerContractItems(customerId),
      ]);

      if (vehRes.status === "fulfilled" && vehRes.value) {
        const vList = extractArray(vehRes.value);
        setIntransitVehicles(vList);
      } else {
        setIntransitVehicles([]);
      }

      if (itemRes.status === "fulfilled" && itemRes.value) {
        const iList = extractArray(itemRes.value);
        setContractItems(iList);

        // Auto populate all contract items into the items table
        if (iList && iList.length > 0) {
          const isIntra = isIntraStateGst(custGst);
          const mappedItems = iList.map((ci) => {
            const actualQty = Number(ci.qty || ci.actual_qty || 0);
            const freeQty = Number(ci.free_qty || 0);
            const rate = Number(ci.rate || 0);
            const gstPercent = Number(ci.gst_percent || 0);
            const discPercent = Number(ci.discount_percent || 0);
            const netWeightKg = Number(ci.net_weight_kg || 0);
            const grossWeightKg = Number(ci.gross_weight_kg || netWeightKg);

            const invoiceQty = actualQty; // Default billing quantity to contract quantity
            const discAmt = Number(((invoiceQty * rate * discPercent) / 100).toFixed(2));
            const taxableAmt = Number((invoiceQty * rate - discAmt).toFixed(2));

            let sgst = 0;
            let cgst = 0;
            let igst = 0;

            if (isIntra) {
              sgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
              cgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
            } else {
              igst = Number(((taxableAmt * gstPercent) / 100).toFixed(2));
            }

            const totalAmt = Number((taxableAmt + sgst + cgst + igst).toFixed(2));

            return {
              sale_contract_id: ci.sale_contract_id,
              sale_contract_uuid: ci.sale_contract_uuid,
              sale_contract_item_id: ci.sale_contract_item_id,
              product_id: ci.product_id,
              item_name: ci.item_name || ci.product_name,
              product_name: ci.product_name || ci.item_name,
              souda_no: ci.souda_no || "-",
              unit: ci.unit || "PACKATE",
              actual_qty: actualQty,
              qty: invoiceQty,
              free_qty: freeQty,
              rate: rate,
              gst_percent: gstPercent,
              discount_percent: discPercent,
              discount_amount: discAmt,
              taxable_amount: taxableAmt,
              sgst_amount: sgst,
              cgst_amount: cgst,
              igst_amount: igst,
              total_amount: totalAmt,
              net_weight_kg: netWeightKg,
              gross_weight_kg: grossWeightKg,
            };
          });

          form.setFieldsValue({ items: mappedItems });
          setTimeout(() => recalculateAllTotals(), 50);
        } else {
          form.setFieldsValue({
            items: [
              {
                actual_qty: 0,
                qty: 1,
                free_qty: 0,
                discount_percent: 0,
                discount_amount: 0,
                taxable_amount: 0,
                sgst_amount: 0,
                cgst_amount: 0,
                igst_amount: 0,
                total_amount: 0,
              },
            ],
          });
          recalculateAllTotals();
        }
      } else {
        setContractItems([]);
      }
    } catch (err) {
      console.error("Error loading customer dependent data:", err);
    }
  };

  /* ---------------- VEHICLE CHANGE HANDLER ---------------- */
  const handleVehicleChange = (vehicleNo) => {
    const veh = intransitVehicles.find(
      (v) => String(v.vehicle_no || v.vehicle_number) === String(vehicleNo)
    );
    if (!veh) return;

    const custGst = form.getFieldValue("customer_gst") || selectedCustomerGst;
    const isIntra = isIntraStateGst(custGst);

    const vehicleUpdate = {
      vehicle_no: vehicleNo,
      transport_name: veh.transport_name || veh.transporter_name || "",
      lr_no: veh.lr_no || "",
      lr_date: parseApiDate(veh.lr_date),
      payment_due_date: parseApiDate(veh.payment_due_date),
      dispatch_from: veh.dispatch_from || veh.source_location || "Haldia",
    };

    if (veh.ewaybill_no) vehicleUpdate.ewaybill_no = veh.ewaybill_no;
    if (veh.ewaybill_date) vehicleUpdate.ewaybill_date = parseApiDate(veh.ewaybill_date);
    if (veh.plant_id) vehicleUpdate.plant_id = veh.plant_id;
    if (veh.plant_name) vehicleUpdate.plant_name = veh.plant_name;
    if (veh.broker_id) vehicleUpdate.broker_id = veh.broker_id;
    if (veh.broker_name) vehicleUpdate.broker_name = veh.broker_name;

    // If the selected vehicle includes its matched items array, populate them into the Items Table!
    if (Array.isArray(veh.items) && veh.items.length > 0) {
      const mappedVehicleItems = veh.items.map((ci) => {
        const actualQty = Number(ci.contract_qty || ci.actual_qty || ci.qty || 0);
        const freeQty = Number(ci.free_qty || 0);
        const rate = Number(ci.rate || 0);
        const gstPercent = Number(ci.gst_percent || ci.gst || 0);
        const discPercent = Number(ci.discount_percent || 0);
        const netWeightKg = Number(ci.net_weight_kg || ci.net_weight || 0);
        const grossWeightKg = Number(
          ci.gross_weight_kg || ci.gross_weight || ci.unit_gross_wt || netWeightKg
        );

        const invoiceQty = Number(ci.invoice_qty || ci.qty || actualQty || 0);
        const discAmt = Number(((invoiceQty * rate * discPercent) / 100).toFixed(2));
        const taxableAmt = Number((invoiceQty * rate - discAmt).toFixed(2));

        let sgst = 0;
        let cgst = 0;
        let igst = 0;

        if (isIntra) {
          sgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
          cgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
        } else {
          igst = Number(((taxableAmt * gstPercent) / 100).toFixed(2));
        }

        const totalAmt = Number((taxableAmt + sgst + cgst + igst).toFixed(2));

        return {
          sale_contract_id: ci.sale_contract_id || ci.contract_id,
          sale_contract_uuid: ci.sale_contract_uuid,
          sale_contract_item_id: ci.sale_contract_item_id || ci.id,
          product_id: ci.product_id || ci.product,
          item_name: ci.item_name || ci.product_name,
          product_name: ci.product_name || ci.item_name,
          souda_no: ci.souda_no || ci.contract_number || "-",
          unit: ci.unit || "PACKATE",
          actual_qty: actualQty,
          qty: invoiceQty,
          free_qty: freeQty,
          rate: rate,
          gst_percent: gstPercent,
          discount_percent: discPercent,
          discount_amount: discAmt,
          taxable_amount: taxableAmt,
          sgst_amount: sgst,
          cgst_amount: cgst,
          igst_amount: igst,
          total_amount: totalAmt,
          net_weight_kg: netWeightKg,
          gross_weight_kg: grossWeightKg,
        };
      });

      vehicleUpdate.items = mappedVehicleItems;
    }

    form.setFieldsValue(vehicleUpdate);
    setTimeout(() => recalculateAllTotals(), 50);
  };

  /* ---------------- ITEM SELECTION & CALCULATIONS ---------------- */
  const handleItemSelect = (rowIndex, selectedValue) => {
    const selectedContractItem = contractItems.find(
      (ci) =>
        String(ci.id || ci.sale_contract_item_id || ci.sale_contract_id) ===
          String(selectedValue) ||
        String(ci.product_id || ci.product) === String(selectedValue) ||
        String(ci.souda_no) === String(selectedValue)
    );

    const items = form.getFieldValue("items") || [];
    const currentItem = items[rowIndex] || {};

    if (selectedContractItem) {
      const actualQty = Number(selectedContractItem.qty || selectedContractItem.actual_qty || 0);
      const rate = Number(selectedContractItem.rate || 0);
      const gstPercent = Number(
        selectedContractItem.gst_percent || selectedContractItem.gst || 5
      );
      const qty = Number(
        currentItem.qty !== undefined && currentItem.qty !== null
          ? currentItem.qty
          : actualQty || 1
      );
      const freeQty = Number(currentItem.free_qty || 0);
      const discPercent = Number(
        currentItem.discount_percent !== undefined
          ? currentItem.discount_percent
          : selectedContractItem.discount_percent || 0
      );

      const netWeightKg = Number(
        selectedContractItem.net_weight_kg ||
          selectedContractItem.net_weight ||
          selectedContractItem.unit_net_wt ||
          0
      );
      const grossWeightKg = Number(
        selectedContractItem.gross_weight_kg ||
          selectedContractItem.gross_weight ||
          selectedContractItem.unit_gross_wt ||
          netWeightKg
      );

      const discAmt = Number(((qty * rate * discPercent) / 100).toFixed(2));
      const taxableAmt = Number((qty * rate - discAmt).toFixed(2));

      const custGst = form.getFieldValue("customer_gst") || selectedCustomerGst;
      const isIntra = isIntraStateGst(custGst);

      let sgst = 0;
      let cgst = 0;
      let igst = 0;

      if (isIntra) {
        sgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
        cgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
      } else {
        igst = Number(((taxableAmt * gstPercent) / 100).toFixed(2));
      }

      const totalAmt = Number((taxableAmt + sgst + cgst + igst).toFixed(2));

      items[rowIndex] = {
        ...currentItem,
        sale_contract_id:
          selectedContractItem.sale_contract_id ||
          selectedContractItem.contract_id,
        sale_contract_uuid: selectedContractItem.sale_contract_uuid,
        sale_contract_item_id:
          selectedContractItem.sale_contract_item_id ||
          selectedContractItem.id,
        product_id:
          selectedContractItem.product_id || selectedContractItem.product,
        item_name:
          selectedContractItem.item_name || selectedContractItem.product_name,
        product_name:
          selectedContractItem.product_name || selectedContractItem.item_name,
        souda_no:
          selectedContractItem.souda_no ||
          selectedContractItem.contract_number ||
          "-",
        unit: selectedContractItem.unit || "PACKATE",
        actual_qty: actualQty,
        qty: qty,
        free_qty: freeQty,
        rate: rate,
        gst_percent: gstPercent,
        discount_percent: discPercent,
        discount_amount: discAmt,
        taxable_amount: taxableAmt,
        sgst_amount: sgst,
        cgst_amount: cgst,
        igst_amount: igst,
        total_amount: totalAmt,
        net_weight_kg: netWeightKg,
        gross_weight_kg: grossWeightKg,
      };

      form.setFieldsValue({ items: [...items] });
      recalculateAllTotals();
    }
  };

  const handleItemFieldChange = (rowIndex) => {
    const items = form.getFieldValue("items") || [];
    const item = items[rowIndex];
    if (!item) return;

    const qty = Number(item.qty || 0);
    const freeQty = Number(item.free_qty || 0);
    const rate = Number(item.rate || 0);
    const discPercent = Number(item.discount_percent || 0);
    const gstPercent = Number(item.gst_percent || 0);

    const discAmt = Number(((qty * rate * discPercent) / 100).toFixed(2));
    const taxableAmt = Number((qty * rate - discAmt).toFixed(2));

    const custGst = form.getFieldValue("customer_gst") || selectedCustomerGst;
    const isIntra = isIntraStateGst(custGst);

    let sgst = 0;
    let cgst = 0;
    let igst = 0;

    if (isIntra) {
      sgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
      cgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
    } else {
      igst = Number(((taxableAmt * gstPercent) / 100).toFixed(2));
    }

    const totalAmt = Number((taxableAmt + sgst + cgst + igst).toFixed(2));

    items[rowIndex] = {
      ...item,
      discount_amount: discAmt,
      taxable_amount: taxableAmt,
      sgst_amount: sgst,
      cgst_amount: cgst,
      igst_amount: igst,
      total_amount: totalAmt,
    };

    form.setFieldsValue({ items: [...items] });
    recalculateAllTotals();
  };

  const recalculateAllItemTaxes = (custGst) => {
    const isIntra = isIntraStateGst(custGst);
    const items = form.getFieldValue("items") || [];

    const updatedItems = items.map((item) => {
      const taxableAmt = Number(item.taxable_amount || 0);
      const gstPercent = Number(item.gst_percent || 0);

      let sgst = 0;
      let cgst = 0;
      let igst = 0;

      if (isIntra) {
        sgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
        cgst = Number(((taxableAmt * gstPercent) / 200).toFixed(2));
      } else {
        igst = Number(((taxableAmt * gstPercent) / 100).toFixed(2));
      }

      const totalAmt = Number((taxableAmt + sgst + cgst + igst).toFixed(2));

      return {
        ...item,
        sgst_amount: sgst,
        cgst_amount: cgst,
        igst_amount: igst,
        total_amount: totalAmt,
      };
    });

    form.setFieldsValue({ items: updatedItems });
    recalculateAllTotals();
  };

  const recalculateAllTotals = () => {
    const items = form.getFieldValue("items") || [];

    let totalQty = 0;
    let totalFreeQty = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalSgst = 0;
    let totalCgst = 0;
    let totalIgst = 0;
    let totalAmt = 0;
    let totalGrossWtTon = 0;
    let totalNetWtTon = 0;

    items.forEach((it) => {
      const q = Number(it.qty || 0);
      const fq = Number(it.free_qty || 0);
      const disc = Number(it.discount_amount || 0);
      const tax = Number(it.taxable_amount || 0);
      const sg = Number(it.sgst_amount || 0);
      const cg = Number(it.cgst_amount || 0);
      const ig = Number(it.igst_amount || 0);
      const tot = Number(it.total_amount || 0);

      const netKg = Number(it.net_weight_kg || 0);
      const grossKg = Number(it.gross_weight_kg || netKg);

      totalQty += q;
      totalFreeQty += fq;
      totalDiscount += disc;
      totalTaxable += tax;
      totalSgst += sg;
      totalCgst += cg;
      totalIgst += ig;
      totalAmt += tot;

      totalGrossWtTon += ((q + fq) * grossKg) / 1000;
      totalNetWtTon += (q * netKg) / 1000;
    });

    const roundOff = Number(form.getFieldValue("round_off_amount") || 0);
    const grandTotal = Number((totalAmt + roundOff).toFixed(2));

    form.setFieldsValue({
      total_qty: Number(totalQty.toFixed(3)),
      total_free_qty: Number(totalFreeQty.toFixed(2)),
      total_discount_amount: Number(totalDiscount.toFixed(2)),
      total_taxable_amount: Number(totalTaxable.toFixed(2)),
      total_sgst: Number(totalSgst.toFixed(2)),
      total_cgst: Number(totalCgst.toFixed(2)),
      total_igst: Number(totalIgst.toFixed(2)),
      total_amount: Number(totalAmt.toFixed(2)),
      total_gross_weight_ton: Number(totalGrossWtTon.toFixed(3)),
      total_net_weight_ton: Number(totalNetWtTon.toFixed(3)),
      grand_total: grandTotal,
    });
  };

  /* ---------------- OPEN CREATE MODAL ---------------- */
  const handleAddNew = async () => {
    form.resetFields();
    setEditingId(null);
    setFileList([]);
    setEditingDocUrl(null);
    setIntransitVehicles([]);
    setContractItems([]);
    setSelectedCustomerGst("");

    // Refresh master dropdowns to guarantee latest options
    loadMasterDropdowns();

    try {
      // Auto-fetch next invoice number
      const nextInvRes = await getNextSaleInvoiceNumber();
      const nextNo =
        nextInvRes?.invoice_number ||
        nextInvRes?.next_invoice_number ||
        nextInvRes?.data?.invoice_number ||
        "";

      form.setFieldsValue({
        sale_invoice_number: nextNo,
        invoice_date: dayjs(),
        items: [
          {
            qty: 1,
            free_qty: 0,
            discount_percent: 0,
            discount_amount: 0,
            taxable_amount: 0,
            sgst_amount: 0,
            cgst_amount: 0,
            igst_amount: 0,
            total_amount: 0,
          },
        ],
        round_off_amount: 0,
        grand_total: 0,
      });
    } catch (err) {
      console.error("Error generating next invoice number:", err);
      form.setFieldsValue({
        invoice_date: dayjs(),
        items: [{}],
      });
    }

    setModalOpen(true);
    setTimeout(() => {
      customerSelectRef.current?.focus();
    }, 150);
  };

  /* ---------------- OPEN EDIT MODAL ---------------- */
  const handleEdit = async (record) => {
    form.resetFields();
    setEditingId(record.id || record.sale_invoice_id);
    setFileList([]);
    setEditingDocUrl(record.einvoice_pdf || record.invoice_copy_url || null);

    const custId = record.customer_id;
    const custGst = record.customer_gst || "";
    setSelectedCustomerGst(custGst);

    // Refresh master dropdowns
    loadMasterDropdowns();

    if (custId) {
      try {
        const [vehRes, itemRes] = await Promise.allSettled([
          getSaleInvoiceIntransitVehicles(custId),
          getSaleInvoiceCustomerContractItems(custId),
        ]);

        if (vehRes.status === "fulfilled" && vehRes.value) {
          const vList = Array.isArray(vehRes.value)
            ? vehRes.value
            : vehRes.value.data || vehRes.value.results || [];
          setIntransitVehicles(vList);
        }

        if (itemRes.status === "fulfilled" && itemRes.value) {
          const iList = Array.isArray(itemRes.value)
            ? itemRes.value
            : itemRes.value.data || itemRes.value.results || [];
          setContractItems(iList);
        }
      } catch (e) {
        console.error("Error fetching dependencies on edit:", e);
      }
    }

    form.setFieldsValue({
      sale_invoice_number: record.sale_invoice_number || record.invoice_no,
      invoice_date: parseApiDate(record.invoice_date),
      customer_id: record.customer_id,
      customer_name: record.customer_name,
      customer_gst: record.customer_gst,
      place: record.place,
      plant_id: record.plant_id,
      plant_name: record.plant_name,
      broker_id: record.broker_id,
      broker_name: record.broker_name,
      vehicle_no: record.vehicle_no || record.vehicle_number,
      transport_name: record.transport_name,
      lr_no: record.lr_no,
      lr_date: parseApiDate(record.lr_date),
      ewaybill_no: record.ewaybill_no,
      ewaybill_date: parseApiDate(record.ewaybill_date),
      einvoice_no: record.einvoice_no,
      payment_due_date: parseApiDate(record.payment_due_date),
      items: (record.items || []).map((it) => ({
        ...it,
        qty: Number(it.qty || 0),
        free_qty: Number(it.free_qty || 0),
        rate: Number(it.rate || 0),
        gst_percent: Number(it.gst_percent || 0),
        discount_percent: Number(it.discount_percent || 0),
        discount_amount: Number(it.discount_amount || 0),
        taxable_amount: Number(it.taxable_amount || 0),
        sgst_amount: Number(it.sgst_amount || 0),
        cgst_amount: Number(it.cgst_amount || 0),
        igst_amount: Number(it.igst_amount || 0),
        total_amount: Number(it.total_amount || 0),
      })),
      total_qty: Number(record.total_qty || 0),
      total_free_qty: Number(record.total_free_qty || 0),
      total_taxable_amount: Number(record.total_taxable_amount || 0),
      total_sgst: Number(record.total_sgst || 0),
      total_cgst: Number(record.total_cgst || 0),
      total_igst: Number(record.total_igst || 0),
      total_amount: Number(record.total_amount || 0),
      total_gross_weight_ton: Number(
        record.total_gross_weight_ton || record.gross_weight || 0
      ),
      total_net_weight_ton: Number(
        record.total_net_weight_ton || record.net_weight || 0
      ),
      dispatch_from: record.dispatch_from,
      ship_to: record.ship_to,
      distance_km: record.distance_km,
      round_off_amount: Number(record.round_off_amount || 0),
      grand_total: Number(record.grand_total || 0),
    });

    setModalOpen(true);
  };

  /* ---------------- FORM SUBMIT HANDLER ---------------- */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!values.items || values.items.length === 0) {
        message.warning("Please add at least one item");
        return;
      }

      setSubmitting(true);

      const payload = {
        invoice_date: values.invoice_date
          ? values.invoice_date.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        customer_id: values.customer_id,
        customer_name: values.customer_name,
        customer_gst: values.customer_gst,
        place: values.place,
        plant_id: values.plant_id,
        plant_name:
          plants.find((p) => String(p.id) === String(values.plant_id))?.name ||
          values.plant_name,
        broker_id: values.broker_id,
        broker_name:
          brokers.find((b) => String(b.id) === String(values.broker_id))
            ?.name || values.broker_name,
        vehicle_no: values.vehicle_no,
        transport_name: values.transport_name,
        lr_no: values.lr_no,
        lr_date: values.lr_date ? values.lr_date.format("YYYY-MM-DD") : null,
        ewaybill_no: values.ewaybill_no,
        ewaybill_date: values.ewaybill_date
          ? values.ewaybill_date.format("YYYY-MM-DD")
          : null,
        einvoice_no: values.einvoice_no,
        payment_due_date: values.payment_due_date
          ? values.payment_due_date.format("YYYY-MM-DD")
          : null,
        items: values.items.map((it) => ({
          sale_contract_id: it.sale_contract_id,
          sale_contract_item_id: it.sale_contract_item_id,
          product_id: it.product_id,
          item_name: it.item_name,
          souda_no: it.souda_no,
          qty: String(it.qty || 0),
          free_qty: String(it.free_qty || 0),
          unit: it.unit || "BAG",
          gst_percent: String(it.gst_percent || 0),
          rate: String(it.rate || 0),
          discount_percent: String(it.discount_percent || 0),
          discount_amount: String(it.discount_amount || 0),
          taxable_amount: String(it.taxable_amount || 0),
          sgst_amount: String(it.sgst_amount || 0),
          cgst_amount: String(it.cgst_amount || 0),
          igst_amount: String(it.igst_amount || 0),
          total_amount: String(it.total_amount || 0),
          net_weight_kg: String(it.net_weight_kg || 0),
          gross_weight_kg: String(it.gross_weight_kg || 0),
        })),
        total_qty: String(values.total_qty || 0),
        total_free_qty: String(values.total_free_qty || 0),
        total_taxable_amount: String(values.total_taxable_amount || 0),
        total_sgst: String(values.total_sgst || 0),
        total_cgst: String(values.total_cgst || 0),
        total_igst: String(values.total_igst || 0),
        total_amount: String(values.total_amount || 0),
        total_gross_weight_ton: String(values.total_gross_weight_ton || 0),
        total_net_weight_ton: String(values.total_net_weight_ton || 0),
        dispatch_from: values.dispatch_from,
        ship_to: values.ship_to,
        distance_km: values.distance_km ? String(values.distance_km) : null,
        round_off_amount: String(values.round_off_amount || 0),
        grand_total: String(values.grand_total || 0),
      };

      let finalRequestData = payload;

      // Handle PDF upload
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          if (key === "items") {
            formData.append("items", JSON.stringify(payload.items));
          } else if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
          }
        });
        formData.append("einvoice_pdf", fileList[0].originFileObj);
        finalRequestData = formData;
      }

      if (editingId) {
        await updateSaleInvoice(editingId, finalRequestData);
        message.success("Sale Invoice updated successfully");
      } else {
        await createSaleInvoice(finalRequestData);
        message.success("Sale Invoice created successfully");
      }

      setModalOpen(false);
      setEditingId(null);
      fetchInvoices();
    } catch (err) {
      console.error("Error saving sale invoice:", err);
      message.error(
        err?.response?.data?.message || "Failed to save sale invoice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- DELETE HANDLER ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteSaleInvoice(id);
      message.success("Sale Invoice deleted successfully");
      fetchInvoices();
    } catch (err) {
      console.error("Error deleting sale invoice:", err);
      message.error("Failed to delete sale invoice");
    }
  };

  /* ---------------- PRINT / PDF HANDLER ---------------- */
  const handlePrint = async (record) => {
    const invId =
      record?.id ||
      record?.sale_invoice_id ||
      record?.pk ||
      record?.sale_invoice_uuid ||
      record?.invoice_id;

    if (!invId) {
      message.error("Invoice ID not found");
      return;
    }

    try {
      message.loading({
        content: `Preparing Invoice PDF...`,
        key: "print",
      });
      const pdfBlob = await fetchSaleInvoicePDF(invId);
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const printWindow = window.open(blobUrl, "_blank");

      // If browser blocked popup, trigger direct download
      if (!printWindow) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `Sale_Invoice_${record.sale_invoice_number || record.invoice_no || invId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      message.success({
        content: "Invoice PDF ready / opened successfully",
        key: "print",
      });
    } catch (err) {
      console.error("Error downloading/printing invoice PDF:", err);
      message.error({
        content: err?.response?.data?.message || "Failed to download PDF",
        key: "print",
      });
    }
  };

  /* ---------------- SEARCH & EXCEL EXPORT ---------------- */
  const filteredInvoices = useMemo(() => {
    if (!searchText) return invoices;
    const q = searchText.toLowerCase().trim();
    return invoices.filter((inv) => {
      const invNo = String(
        inv.sale_invoice_number || inv.invoice_no || ""
      ).toLowerCase();
      const cust = String(inv.customer_name || "").toLowerCase();
      const veh = String(
        inv.vehicle_no || inv.vehicle_number || ""
      ).toLowerCase();
      const plant = String(inv.plant_name || "").toLowerCase();
      return (
        invNo.includes(q) ||
        cust.includes(q) ||
        veh.includes(q) ||
        plant.includes(q)
      );
    });
  }, [invoices, searchText]);

  const handleExport = () => {
    const exportData = filteredInvoices.map((inv) => ({
      "Invoice Date": fmtDate(inv.invoice_date),
      "Invoice No": inv.sale_invoice_number || inv.invoice_no || "-",
      "Customer Name": inv.customer_name || "-",
      "Customer GST": inv.customer_gst || "-",
      Place: inv.place || "-",
      "Plant Name": inv.plant_name || "-",
      "Broker Name": inv.broker_name || "-",
      "Vehicle No": inv.vehicle_no || inv.vehicle_number || "-",
      "Transport Name": inv.transport_name || "-",
      "Total Qty": inv.total_qty || 0,
      "Grand Total (₹)": inv.grand_total || 0,
      "Total Gr. Wt. (Ton)": inv.total_gross_weight_ton || "-",
      "Net Wt. (Ton)": inv.total_net_weight_ton || "-",
    }));
    exportToExcel(exportData, "Sale_Invoices_List", "SaleInvoices");
  };

  /* ---------------- TABLE COLUMNS (MATCHING IMAGE 2) ---------------- */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Invoice Date</span>,
      dataIndex: "invoice_date",
      render: (val) => fmtDate(val),
      width: 110,
    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "sale_invoice_number",
      render: (val, r) => (
        <span className="font-bold text-gray-900">
          {val || r.invoice_no || "-"}
        </span>
      ),
      width: 140,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer Name</span>,
      dataIndex: "customer_name",
      render: (val, r) => (
        <div>
          <span className="font-semibold text-amber-900">{val || "-"}</span>
          {r.customer_gst && (
            <div className="text-[11px] text-gray-500 font-mono">
              GST: {r.customer_gst}
            </div>
          )}
        </div>
      ),
      width: 180,
    },
    {
      title: <span className="text-amber-700 font-semibold">Place</span>,
      dataIndex: "place",
      render: (val) => val || "-",
      width: 110,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plant_name",
      render: (val) => val || "-",
      width: 130,
    },
    {
      title: <span className="text-amber-700 font-semibold">Broker Name</span>,
      dataIndex: "broker_name",
      render: (val) => val || "-",
      width: 130,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vehicle No</span>,
      dataIndex: "vehicle_no",
      render: (val, r) => (
        <span className="font-semibold text-gray-900">
          {val || r.vehicle_number || "-"}
        </span>
      ),
      width: 130,
    },
    {
      title: <span className="text-amber-700 font-semibold">Transport Name</span>,
      dataIndex: "transport_name",
      render: (val) => val || "-",
      width: 140,
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty",
      render: (val) => (
        <span className="font-bold text-gray-800">{val ?? "-"}</span>
      ),
      width: 90,
      align: "center",
    },
    {
      title: <span className="text-amber-700 font-semibold">Grand Total</span>,
      dataIndex: "grand_total",
      render: (val) => (
        <span className="font-extrabold text-amber-900">
          ₹
          {Number(val || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
      width: 130,
      align: "right",
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          E-Invoice Upload Status
        </span>
      ),
      dataIndex: "einvoice_pdf",
      render: (val, r) => {
        const hasDoc = val || r.invoice_copy_url;
        return hasDoc ? (
          <Tag color="success" className="font-semibold">
            Uploaded
          </Tag>
        ) : (
          <Tag color="default">Pending</Tag>
        );
      },
      width: 140,
      align: "center",
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Total Gr. Wt.(Ton)</span>
      ),
      dataIndex: "total_gross_weight_ton",
      render: (val, r) => val || r.gross_weight || "-",
      width: 130,
      align: "center",
    },
    {
      title: <span className="text-amber-700 font-semibold">Net Wt.(Ton)</span>,
      dataIndex: "total_net_weight_ton",
      render: (val, r) => val || r.net_weight || "-",
      width: 120,
      align: "center",
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      fixed: "right",
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              className="text-blue-500 hover:text-blue-700 border-blue-300!"
              onClick={() => {
                setViewRecord(record);
                setViewModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Sale Invoice">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              className="bg-amber-500! hover:bg-amber-600! border-none! text-white!"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Print / Download PDF">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              className="text-amber-700 hover:text-amber-900 border-amber-300!"
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Sale Invoice"
            description="Are you sure you want to delete this sale invoice?"
            onConfirm={() => handleDelete(record.id || record.sale_invoice_id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="border-red-300!"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* FILTER AND ACTION BAR */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Input
              placeholder="Search invoice no, customer, vehicle..."
              value={searchText}
              prefix={<SearchOutlined className="text-amber-600!" />}
              style={{ width: 280 }}
              className="border-amber-300! focus:border-amber-500!"
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              icon={<FilterOutlined />}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
              onClick={() => setSearchText("")}
            >
              Reset
            </Button>
          </Space>
        </Col>
        <Col>
          <Space>
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
              className="bg-amber-500! hover:bg-amber-600! border-none! font-semibold"
              onClick={handleAddNew}
            >
              Add New Sale Invoice
            </Button>
          </Space>
        </Col>
      </Row>

      {/* TABLE VIEW (MATCHING IMAGE 2) */}
      <div className="border border-amber-300 rounded-lg p-3 shadow-md bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-amber-800 m-0">
                SALE INVOICE FOR GOODS
              </h2>
              <Tag
                color="orange"
                className="font-bold text-xs uppercase px-2 py-0.5 border-amber-400"
              >
                CREDIT INVOICE
              </Tag>
            </div>
            <p className="text-amber-600 text-xs mt-1 mb-0">
              List View of Sale Invoices — Manage, track and print credit
              invoices
            </p>
          </div>
          <Tag color="gold" className="text-xs px-2.5 py-1 font-bold">
            FY: {selectedFY || "All"}
          </Tag>
        </div>

        <Table
          size="small"
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          rowKey={(r) => r.id || r.sale_invoice_id || r.sale_invoice_number}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="border-amber-100"
          scroll={{ x: 1600 }}
        />
      </div>

      {/* CREATE / EDIT SALE INVOICE MODAL (MATCHING IMAGE 1) */}
      <Modal
        title={
          <div className="flex items-center gap-2 pr-6">
            <Tag
              color="orange"
              className="font-extrabold text-xs px-2.5 py-1 bg-amber-500 text-white border-none"
            >
              CREDIT INVOICE
            </Tag>
            <span className="text-amber-900 font-bold text-base">
              {editingId ? "Edit Sale Invoice" : "Create New Sale Invoice"}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalOpen(false);
              setEditingId(null);
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            className="bg-amber-500! hover:bg-amber-600! border-none! font-semibold"
          >
            {editingId ? "Update Sale Invoice" : "Save Sale Invoice"}
          </Button>,
        ]}
        width="99vw"
        style={{ maxWidth: "98vw", top: 10 }}
        styles={{
          body: {
            padding: "14px 18px",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
          },
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            round_off_amount: 0,
            grand_total: 0,
            dispatch_from: "Haldia",
          }}
        >
          {/* HEADER DETAILS CARD (ROW 1 & 2) */}
          <Card
            size="small"
            style={{ marginBottom: 16, border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "16px 20px" } }}
          >
            {/* ROW 1 */}
            <Row gutter={[14, 14]}>
              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Invoice No
                    </span>
                  }
                  name="sale_invoice_number"
                >
                  <Input
                    disabled
                    placeholder="Auto generated"
                    className="bg-gray-50! font-bold text-gray-900"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      fontWeight: 700,
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Invoice Date
                    </span>
                  }
                  name="invoice_date"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <AppDatePicker
                    ref={invoiceDateRef}
                    className="w-full font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onTabComplete={() => {
                      setTimeout(() => customerSelectRef.current?.focus(), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        customerSelectRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={5}>
                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-amber-800 font-bold text-xs">
                        Customer Name
                      </span>
                      {selectedCustomerGst && (
                        <span className="text-[11px] text-amber-700 font-mono font-bold">
                          GST: {selectedCustomerGst}
                        </span>
                      )}
                    </div>
                  }
                  name="customer_id"
                  rules={[{ required: true, message: "Select Customer" }]}
                >
                  <Select
                    ref={customerSelectRef}
                    placeholder="Select Customer"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCustomerChange}
                    onSelect={() => {
                      setTimeout(() => plantSelectRef.current?.focus(), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        plantSelectRef.current?.focus();
                      }
                    }}
                    className="font-semibold"
                    style={{ height: "38px" }}
                  >
                    {customers.map((c) => {
                      const cId = c.id || c.customer_id;
                      const cName = c.name || c.customer_name;
                      const cGst = c.gst_number || c.gst || c.customer_gst;
                      return (
                        <Option key={cId} value={cId}>
                          {cName} {cGst ? `(${cGst})` : ""}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item name="customer_name" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="customer_gst" hidden>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Place
                    </span>
                  }
                  name="place"
                >
                  <Input
                    disabled
                    placeholder="Auto (Place)"
                    className="bg-gray-50! font-bold text-gray-900"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      fontWeight: 700,
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Plant Name
                    </span>
                  }
                  name="plant_id"
                  rules={[{ required: true, message: "Select Plant" }]}
                >
                  <Select
                    ref={plantSelectRef}
                    placeholder="Select Plant"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    className="font-semibold"
                    style={{ height: "38px" }}
                    onSelect={() => {
                      setTimeout(() => brokerSelectRef.current?.focus(), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        brokerSelectRef.current?.focus();
                      }
                    }}
                    onChange={(val) => {
                      const p = plants.find(
                        (item) =>
                          String(
                            item.id || item.plant_id || item.vendor_id || item.pk
                          ) === String(val)
                      );
                      if (p) {
                        form.setFieldsValue({
                          plant_name:
                            p.name || p.plant_name || p.vendor_name || "",
                        });
                      } else {
                        form.setFieldsValue({ plant_name: undefined });
                      }
                    }}
                  >
                    {plants.map((p, idx) => {
                      const pId = p.id || p.plant_id || p.vendor_id || p.pk || idx;
                      const pName =
                        p.name || p.plant_name || p.vendor_name || `Plant #${pId}`;
                      const vName =
                        p.vendor_name && p.vendor_name !== pName
                          ? ` (${p.vendor_name})`
                          : "";
                      return (
                        <Option key={pId} value={pId}>
                          {pName}{vName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item name="plant_name" hidden>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Broker Name
                    </span>
                  }
                  name="broker_id"
                >
                  <Select
                    ref={brokerSelectRef}
                    placeholder="Select Broker"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    className="font-semibold"
                    style={{ height: "38px" }}
                    onSelect={() => {
                      setTimeout(() => vehicleSelectRef.current?.focus(), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        vehicleSelectRef.current?.focus();
                      }
                    }}
                    onChange={(val) => {
                      if (val === "direct") {
                        form.setFieldsValue({ broker_name: "Direct" });
                        return;
                      }
                      const b = brokers.find(
                        (item) =>
                          String(item.id || item.broker_id || item.pk) ===
                          String(val)
                      );
                      if (b) {
                        form.setFieldsValue({
                          broker_name:
                            b.name || b.broker_name || b.full_name || "",
                        });
                      } else {
                        form.setFieldsValue({ broker_name: undefined });
                      }
                    }}
                  >
                    <Option key="direct" value="direct">
                      Direct
                    </Option>
                    {brokers.map((b, idx) => {
                      const bId = b.id || b.broker_id || b.pk || idx;
                      const bName =
                        b.name || b.broker_name || b.full_name || `Broker #${bId}`;
                      return (
                        <Option key={bId} value={bId}>
                          {bName}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item name="broker_name" hidden>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Vehicle No
                    </span>
                  }
                  name="vehicle_no"
                  rules={[{ required: true, message: "Select Vehicle" }]}
                >
                  <Select
                    ref={vehicleSelectRef}
                    placeholder={
                      !form.getFieldValue("customer_id")
                        ? "Select Customer First"
                        : intransitVehicles.length === 0
                        ? "No In-transit Vehicles"
                        : "Select In-Transit Vehicle"
                    }
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    onChange={handleVehicleChange}
                    onSelect={() => {
                      setTimeout(() => ewaybillNoRef.current?.focus(), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        ewaybillNoRef.current?.focus();
                      }
                    }}
                    disabled={!form.getFieldValue("customer_id")}
                    className="font-semibold"
                    style={{ height: "38px" }}
                  >
                    {intransitVehicles.map((v, idx) => {
                      const vNo =
                        v.vehicle_no || v.vehicle_number || v.number || `Veh-${idx}`;
                      return (
                        <Option key={vNo} value={vNo}>
                          {vNo} {v.transport_name ? `(${v.transport_name})` : ""}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* ROW 2 */}
            <Row gutter={[12, 12]} style={{ marginTop: 6 }}>
              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      Transport Name
                    </span>
                  }
                  name="transport_name"
                >
                  <Input
                    disabled
                    placeholder="Auto (Transport)"
                    className="bg-gray-50! font-bold text-gray-900"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      fontWeight: 700,
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      LR No
                    </span>
                  }
                  name="lr_no"
                >
                  <Input
                    disabled
                    placeholder="Auto (LR No)"
                    className="bg-gray-50! font-bold text-gray-900"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      fontWeight: 700,
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      LR Date
                    </span>
                  }
                  name="lr_date"
                >
                  <AppDatePicker
                    disabled
                    className="w-full font-bold"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      E-waybill No
                    </span>
                  }
                  name="ewaybill_no"
                >
                  <Input
                    ref={ewaybillNoRef}
                    placeholder="Enter E-waybill No"
                    className="font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        ewaybillDateRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      E-waybill Date
                    </span>
                  }
                  name="ewaybill_date"
                >
                  <AppDatePicker
                    ref={ewaybillDateRef}
                    className="w-full font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onTabComplete={() => {
                      setTimeout(() => einvoiceNoRef.current?.focus(), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        einvoiceNoRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      E-Invoice No
                    </span>
                  }
                  name="einvoice_no"
                >
                  <Input
                    ref={einvoiceNoRef}
                    placeholder="Enter E-Invoice No"
                    className="font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        paymentDueDateRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      Payment Due Date
                    </span>
                  }
                  name="payment_due_date"
                >
                  <AppDatePicker
                    ref={paymentDueDateRef}
                    className="w-full font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    disabledDate={(current) =>
                      createFinancialYearDisabledDate(selectedFY)(current)
                    }
                    onTabComplete={() => {
                      setTimeout(() => focusItemField(0, "qty"), 50);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        focusItemField(0, "qty");
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ITEMS TABLE CARD */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              border: "1px solid #FDE68A",
              overflowX: "auto",
            }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div style={{ minWidth: 2150 }}>
              <div className="flex items-center justify-between mb-3">
                <h6 className="text-amber-800 font-bold m-0 text-sm tracking-wider uppercase">
                  Items Table
                </h6>
                <span className="text-xs text-gray-500 font-medium">
                  Auto-populated from approved customer contracts. Edit invoice qty, rates or remove rows as needed.
                </span>
              </div>

              {/* TABLE HEADER */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: ITEM_GRID_TEMPLATE,
                  gap: "8px",
                  alignItems: "center",
                  paddingBottom: "8px",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#92400E",
                  borderBottom: "2px solid #FDE68A",
                }}
              >
                <div className="text-left">Item Name</div>
                <div className="text-center">Souda No</div>
                <div className="text-center">Contract Qty</div>
                <div className="text-center">Invoice Qty</div>
                <div className="text-center">Free Qty</div>
                <div className="text-center">Unit</div>
                <div className="text-center">Net Wt (Kg)</div>
                <div className="text-center">Gr. Wt (Kg)</div>
                <div className="text-center">Rate (₹)</div>
                <div className="text-center">GST %</div>
                <div className="text-center">Disc. %</div>
                <div className="text-center">Disc. Amt</div>
                <div className="text-center">Taxable Amt</div>
                <div className="text-center">SGST</div>
                <div className="text-center">CGST</div>
                <div className="text-center">IGST</div>
                <div className="text-center">Total Amount (₹)</div>
                <div className="text-center">Action</div>
              </div>

              {/* ITEMS FORM LIST */}
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <div
                        key={field.key}
                        style={{
                          display: "grid",
                          gridTemplateColumns: ITEM_GRID_TEMPLATE,
                          gap: "8px",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        {/* 1. Item Name Dropdown */}
                        <div>
                          <Form.Item
                            name={[field.name, "item_name"]}
                            style={{ marginBottom: 0 }}
                            rules={[{ required: true, message: "Select Item" }]}
                          >
                            <Select
                              ref={(el) => (itemSelectRefs.current[field.name] = el)}
                              placeholder="Select Item / Product"
                              showSearch
                              optionFilterProp="children"
                              className="w-full font-bold"
                              style={{ height: "36px" }}
                              onChange={(val) => {
                                handleItemSelect(field.name, val);
                                setTimeout(() => focusItemField(field.name, "qty"), 50);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusItemField(field.name, "qty");
                                }
                              }}
                            >
                              {contractItems.map((ci) => {
                                const keyVal =
                                  ci.sale_contract_item_id ||
                                  ci.id ||
                                  ci.product_id ||
                                  ci.souda_no;
                                return (
                                  <Option key={keyVal} value={keyVal}>
                                    {ci.item_name || ci.product_name} - {ci.souda_no || "Contract"} (₹{ci.rate})
                                  </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "sale_contract_id"]}
                            hidden
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "sale_contract_uuid"]}
                            hidden
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, "sale_contract_item_id"]}
                            hidden
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item name={[field.name, "product_id"]} hidden>
                            <Input />
                          </Form.Item>
                          <Form.Item name={[field.name, "product_name"]} hidden>
                            <Input />
                          </Form.Item>
                        </div>

                        {/* 2. Souda No */}
                        <div>
                          <Form.Item
                            name={[field.name, "souda_no"]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input
                              disabled
                              className="w-full bg-gray-50! text-center font-bold text-gray-900"
                              style={{
                                color: "#111827",
                                WebkitTextFillColor: "#111827",
                                fontWeight: 700,
                                height: "36px",
                                fontSize: "13px",
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 3. Contract Qty (Actual Qty) */}
                        <div>
                          <Form.Item
                            name={[field.name, "actual_qty"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              precision={2}
                              className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-200!"
                              style={{
                                color: "#78350F",
                                WebkitTextFillColor: "#78350F",
                                fontWeight: 700,
                                height: "36px",
                                fontSize: "13px",
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 4. Invoice Qty */}
                        <div>
                          <Form.Item
                            name={[field.name, "qty"]}
                            style={{ marginBottom: 0 }}
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber
                              ref={(el) => (itemQtyRefs.current[field.name] = el)}
                              min={0.001}
                              precision={2}
                              className="w-full border-amber-400! font-bold text-center text-gray-900"
                              placeholder="Invoice Qty"
                              style={{ height: "36px", fontSize: "13px" }}
                              onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                              onChange={() => handleItemFieldChange(field.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusItemField(field.name, "free_qty");
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 5. Free Qty */}
                        <div>
                          <Form.Item
                            name={[field.name, "free_qty"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              ref={(el) => (itemFreeQtyRefs.current[field.name] = el)}
                              min={0}
                              precision={2}
                              className="w-full text-center font-semibold"
                              placeholder="0"
                              style={{ height: "36px", fontSize: "13px" }}
                              onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                              onChange={() => handleItemFieldChange(field.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusItemField(field.name, "net_weight_kg");
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 6. Unit */}
                        <div>
                          <Form.Item
                            name={[field.name, "unit"]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input
                              disabled
                              className="w-full bg-gray-50! text-center px-1 font-bold text-gray-900"
                              style={{
                                color: "#111827",
                                WebkitTextFillColor: "#111827",
                                fontWeight: 700,
                                height: "36px",
                                fontSize: "13px",
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 7. Net Wt (Kg) */}
                        <div>
                          <Form.Item
                            name={[field.name, "net_weight_kg"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              ref={(el) => (itemNetWtRefs.current[field.name] = el)}
                              precision={3}
                              className="w-full text-center font-semibold"
                              placeholder="0.000"
                              style={{ height: "36px", fontSize: "13px" }}
                              onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                              onChange={() => handleItemFieldChange(field.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusItemField(field.name, "gross_weight_kg");
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 8. Gr. Wt (Kg) */}
                        <div>
                          <Form.Item
                            name={[field.name, "gross_weight_kg"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              ref={(el) => (itemGrossWtRefs.current[field.name] = el)}
                              precision={3}
                              className="w-full text-center font-semibold"
                              placeholder="0.000"
                              style={{ height: "36px", fontSize: "13px" }}
                              onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                              onChange={() => handleItemFieldChange(field.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusItemField(field.name, "rate");
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 9. Rate */}
                        <div>
                          <Form.Item
                            name={[field.name, "rate"]}
                            style={{ marginBottom: 0 }}
                            rules={[{ required: true, message: "Rate" }]}
                          >
                            <InputNumber
                              ref={(el) => (itemRateRefs.current[field.name] = el)}
                              min={0}
                              precision={2}
                              className="w-full text-center font-bold"
                              placeholder="Rate"
                              style={{ height: "36px", fontSize: "13px" }}
                              onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                              onChange={() => handleItemFieldChange(field.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  focusItemField(field.name, "discount_percent");
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 10. GST % */}
                        <div>
                          <Form.Item
                            name={[field.name, "gst_percent"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              controls={false}
                              className="w-full bg-gray-50! text-center p-0 font-bold text-gray-900"
                              style={{
                                color: "#111827",
                                WebkitTextFillColor: "#111827",
                                fontWeight: 700,
                                height: "36px",
                                fontSize: "13px",
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 11. Disc. % */}
                        <div>
                          <Form.Item
                            name={[field.name, "discount_percent"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              ref={(el) => (itemDiscPercentRefs.current[field.name] = el)}
                              min={0}
                              max={100}
                              step={0.1}
                              precision={2}
                              className="w-full text-center font-semibold"
                              placeholder="0%"
                              style={{ height: "36px", fontSize: "13px" }}
                              onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                              onChange={() => handleItemFieldChange(field.name)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const allItems = form.getFieldValue("items") || [];
                                  if (field.name < allItems.length - 1) {
                                    focusItemField(field.name + 1, "qty");
                                  } else {
                                    dispatchFromRef.current?.focus();
                                  }
                                }
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 12. Disc. Amt */}
                        <div>
                          <Form.Item
                            name={[field.name, "discount_amount"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              precision={2}
                              className="w-full bg-gray-50! text-center text-gray-800 font-semibold"
                              placeholder="0.00"
                              style={{ height: "36px", fontSize: "13px" }}
                            />
                          </Form.Item>
                        </div>

                        {/* 13. Taxable Amt */}
                        <div>
                          <Form.Item
                            name={[field.name, "taxable_amount"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              className="w-full bg-gray-50! text-center font-bold text-gray-900"
                              precision={2}
                              style={{
                                width: "100%",
                                color: "#111827",
                                WebkitTextFillColor: "#111827",
                                fontWeight: 700,
                                height: "36px",
                                fontSize: "13px",
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 14. SGST */}
                        <div>
                          <Form.Item
                            name={[field.name, "sgst_amount"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              controls={false}
                              className="w-full bg-gray-50! text-center px-1 font-semibold"
                              precision={2}
                              placeholder="0.00"
                              style={{ height: "36px", fontSize: "13px" }}
                            />
                          </Form.Item>
                        </div>

                        {/* 15. CGST */}
                        <div>
                          <Form.Item
                            name={[field.name, "cgst_amount"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              controls={false}
                              className="w-full bg-gray-50! text-center px-1 font-semibold"
                              precision={2}
                              placeholder="0.00"
                              style={{ height: "36px", fontSize: "13px" }}
                            />
                          </Form.Item>
                        </div>

                        {/* 16. IGST */}
                        <div>
                          <Form.Item
                            name={[field.name, "igst_amount"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              controls={false}
                              className="w-full bg-gray-50! text-center px-1 font-semibold"
                              precision={2}
                              placeholder="0.00"
                              style={{ height: "36px", fontSize: "13px" }}
                            />
                          </Form.Item>
                        </div>

                        {/* 17. Total Amount */}
                        <div>
                          <Form.Item
                            name={[field.name, "total_amount"]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              disabled
                              className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                              precision={2}
                              style={{
                                width: "100%",
                                color: "#78350F",
                                WebkitTextFillColor: "#78350F",
                                fontWeight: 800,
                                fontSize: "14px",
                                height: "36px",
                              }}
                            />
                          </Form.Item>
                        </div>

                        {/* 18. Actions (Add / Remove) */}
                        <div className="text-center flex justify-center items-center gap-1">
                          <Tooltip title="Add Row">
                            <Button
                              type="text"
                              size="middle"
                              icon={
                                <PlusOutlined
                                  style={{
                                    color: "#d97706",
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                  }}
                                />
                              }
                              onClick={() =>
                                add({
                                  actual_qty: 0,
                                  qty: 1,
                                  free_qty: 0,
                                  rate: 0,
                                  discount_percent: 0,
                                  discount_amount: 0,
                                  taxable_amount: 0,
                                  sgst_amount: 0,
                                  cgst_amount: 0,
                                  igst_amount: 0,
                                  total_amount: 0,
                                  net_weight_kg: 0,
                                  gross_weight_kg: 0,
                                })
                              }
                            />
                          </Tooltip>
                          <Tooltip title="Remove Row">
                            <Button
                              type="text"
                              danger
                              size="middle"
                              icon={<DeleteOutlined style={{ fontSize: "15px" }} />}
                              onClick={() => {
                                if (fields.length > 1) {
                                  remove(field.name);
                                  setTimeout(() => recalculateAllTotals(), 50);
                                }
                              }}
                              disabled={fields.length <= 1}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Form.List>

              {/* TABLE "TOTAL" ROW */}
              <Divider style={{ margin: "12px 0 8px 0" }} />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: ITEM_GRID_TEMPLATE,
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                {/* 1. Item Name / Total Label */}
                <div className="flex items-center h-[36px]">
                  <span className="font-extrabold text-amber-950 text-sm tracking-wide">
                    Total:
                  </span>
                </div>

                {/* 2. Souda Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 3. Contract Qty Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 4. Total Invoice Qty */}
                <div>
                  <Form.Item name="total_qty" style={{ marginBottom: 0 }}>
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 5. Total Free Qty */}
                <div>
                  <Form.Item name="total_free_qty" style={{ marginBottom: 0 }}>
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 6. Unit Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 7. Net Wt Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 8. Gr Wt Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 9. Rate Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 10. GST Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 11. Disc % Spacer */}
                <div className="flex items-center justify-center text-gray-400 font-bold">-</div>

                {/* 12. Total Disc Amt */}
                <div>
                  <Form.Item
                    name="total_discount_amount"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 13. Total Taxable Amount */}
                <div>
                  <Form.Item
                    name="total_taxable_amount"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 14. Total SGST */}
                <div>
                  <Form.Item name="total_sgst" style={{ marginBottom: 0 }}>
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 15. Total CGST */}
                <div>
                  <Form.Item name="total_cgst" style={{ marginBottom: 0 }}>
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 16. Total IGST */}
                <div>
                  <Form.Item name="total_igst" style={{ marginBottom: 0 }}>
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-50! font-bold text-center text-amber-950 border-amber-300!"
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 700,
                        fontSize: "13px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 17. Total Amount */}
                <div>
                  <Form.Item name="total_amount" style={{ marginBottom: 0 }}>
                    <InputNumber
                      disabled
                      precision={2}
                      className="w-full bg-amber-100! font-black text-amber-950 text-center border-2 border-amber-400!"
                      style={{
                        width: "100%",
                        color: "#78350F",
                        WebkitTextFillColor: "#78350F",
                        fontWeight: 800,
                        fontSize: "14px",
                        height: "36px",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* 18. Action Spacer */}
                <div></div>
              </div>
            </div>
          </Card>

          {/* BOTTOM SUMMARY CARD (FOOTER - WEIGHTS, SHIPMENT & GRAND TOTAL) */}
          <Card
            size="small"
            style={{ border: "1px solid #FDE68A" }}
            styles={{ body: { padding: "14px 18px" } }}
          >
            <Row gutter={[14, 14]} align="middle">
              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Total Gr. Wt.(Ton)
                    </span>
                  }
                  name="total_gross_weight_ton"
                >
                  <InputNumber
                    disabled
                    precision={3}
                    placeholder="0.000"
                    className="w-full bg-gray-50! font-bold text-gray-900"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      fontWeight: 700,
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Net Wt.(Ton)
                    </span>
                  }
                  name="total_net_weight_ton"
                >
                  <InputNumber
                    disabled
                    precision={3}
                    placeholder="0.000"
                    className="w-full bg-gray-50! font-bold text-gray-900"
                    style={{
                      color: "#111827",
                      WebkitTextFillColor: "#111827",
                      fontWeight: 700,
                      height: "38px",
                      fontSize: "13px",
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      Despatch From
                    </span>
                  }
                  name="dispatch_from"
                >
                  <Input
                    ref={dispatchFromRef}
                    placeholder="Origin location"
                    className="font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        shipToRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      Ship To
                    </span>
                  }
                  name="ship_to"
                >
                  <Input
                    ref={shipToRef}
                    placeholder="Destination city"
                    className="font-semibold"
                    style={{ height: "38px", fontSize: "13px" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        distanceKmRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-800 font-bold text-xs">
                      Distance (KM) <span className="text-red-500">*</span>
                    </span>
                  }
                  name="distance_km"
                  rules={[
                    { required: true, message: "Distance (KM) is mandatory" },
                  ]}
                >
                  <InputNumber
                    ref={distanceKmRef}
                    placeholder="Enter Distance (KM)"
                    className="w-full font-semibold border-amber-300!"
                    min={0}
                    style={{ height: "38px", fontSize: "13px" }}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        roundOffRef.current?.focus();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      E-Invoice Upload
                    </span>
                  }
                >
                  <Upload
                    beforeUpload={(file) => {
                      setFileList([file]);
                      return false;
                    }}
                    onRemove={() => setFileList([])}
                    fileList={fileList}
                    maxCount={1}
                  >
                    <Button
                      size="middle"
                      icon={<UploadOutlined />}
                      className="w-full border-amber-300! font-semibold"
                      style={{ height: "38px", fontSize: "13px" }}
                    >
                      {editingDocUrl && !fileList.length
                        ? "Change PDF"
                        : "Upload"}
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-700 font-semibold text-xs">
                      Round up
                    </span>
                  }
                  name="round_off_amount"
                >
                  <InputNumber
                    ref={roundOffRef}
                    className="w-full font-semibold border-amber-300!"
                    onChange={() => recalculateAllTotals()}
                    precision={2}
                    step={0.01}
                    placeholder="0.00"
                    style={{ height: "38px", fontSize: "13px" }}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Form.Item
                  label={
                    <span className="text-amber-950 font-extrabold text-xs tracking-wide">
                      Grand Total (₹)
                    </span>
                  }
                  name="grand_total"
                >
                  <InputNumber
                    disabled
                    className="w-full bg-amber-100! font-black text-amber-950 text-center border-2 border-amber-500!"
                    precision={2}
                    style={{
                      width: "100%",
                      color: "#78350F",
                      WebkitTextFillColor: "#78350F",
                      fontWeight: 900,
                      fontSize: "17px",
                      height: "40px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6">
            <span className="text-amber-800 text-xl font-bold">
              Sale Invoice Details:{" "}
              {viewRecord?.sale_invoice_number || viewRecord?.invoice_no}
            </span>
            <Tag color="orange" className="text-xs font-bold px-2 py-0.5">
              CREDIT INVOICE
            </Tag>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            onClick={() => handlePrint(viewRecord)}
          >
            Print / PDF
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setViewModalOpen(false)}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
          >
            Close
          </Button>,
        ]}
        width="85vw"
        style={{ maxWidth: 1200, top: 20 }}
        destroyOnClose
      >
        {viewRecord && (
          <div className="space-y-4">
            {/* TOP HEADER GRID */}
            <Card size="small" className="bg-amber-50/40 border-amber-200">
              <Row gutter={[16, 12]}>
                <Col span={6}>
                  <Text type="secondary">Customer Name:</Text>
                  <div className="font-bold text-amber-950 text-sm">
                    {viewRecord.customer_name || "-"}
                  </div>
                  {viewRecord.customer_gst && (
                    <div className="text-xs text-gray-500 font-mono">
                      GST: {viewRecord.customer_gst}
                    </div>
                  )}
                </Col>
                <Col span={6}>
                  <Text type="secondary">Invoice Date & No:</Text>
                  <div className="font-bold text-gray-900">
                    {viewRecord.sale_invoice_number || viewRecord.invoice_no} (
                    {fmtDate(viewRecord.invoice_date)})
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Plant:</Text>
                  <div className="font-semibold">
                    {viewRecord.plant_name || "-"}
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Broker:</Text>
                  <div className="font-semibold">
                    {viewRecord.broker_name || "-"}
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Vehicle No:</Text>
                  <div className="font-semibold text-gray-900">
                    {viewRecord.vehicle_no ||
                      viewRecord.vehicle_number ||
                      "-"}
                  </div>
                </Col>

                <Col span={6}>
                  <Text type="secondary">Transport Name:</Text>
                  <div className="font-semibold">
                    {viewRecord.transport_name || "-"}
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">LR No & Date:</Text>
                  <div className="font-semibold">
                    {viewRecord.lr_no || "-"} ({fmtDate(viewRecord.lr_date)})
                  </div>
                </Col>
                <Col span={5}>
                  <Text type="secondary">E-waybill No & Date:</Text>
                  <div className="font-semibold">
                    {viewRecord.ewaybill_no || "-"}{" "}
                    {viewRecord.ewaybill_date
                      ? `(${fmtDate(viewRecord.ewaybill_date)})`
                      : ""}
                  </div>
                </Col>
                <Col span={5}>
                  <Text type="secondary">Payment Due Date:</Text>
                  <div className="font-semibold text-amber-900">
                    {fmtDate(viewRecord.payment_due_date)}
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Despatch / Ship To:</Text>
                  <div className="font-semibold">
                    {viewRecord.dispatch_from || "-"} ➔{" "}
                    {viewRecord.ship_to || viewRecord.place || "-"}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* ITEMS TABLE */}
            <h5 className="text-amber-800 font-bold mb-2">Invoice Items</h5>
            <Table
              dataSource={viewRecord.items || []}
              rowKey={(r, i) => r.id || i}
              pagination={false}
              size="small"
              className="border border-amber-100"
              columns={[
                { title: "Item Name", dataIndex: "item_name" },
                { title: "Souda No", dataIndex: "souda_no" },
                {
                  title: "Qty",
                  dataIndex: "qty",
                  render: (val, r) => `${val} ${r.unit || ""}`,
                },
                {
                  title: "Free Qty",
                  dataIndex: "free_qty",
                  render: (val) => val || "0",
                },
                {
                  title: "GST %",
                  dataIndex: "gst_percent",
                  render: (val) => `${val}%`,
                },
                {
                  title: "Rate",
                  dataIndex: "rate",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
                {
                  title: "Disc %",
                  dataIndex: "discount_percent",
                  render: (val) => `${val || 0}%`,
                },
                {
                  title: "Taxable Amt",
                  dataIndex: "taxable_amount",
                  render: (val) => `₹${Number(val || 0).toFixed(2)}`,
                },
                {
                  title: "SGST",
                  dataIndex: "sgst_amount",
                  render: (val) =>
                    Number(val) > 0 ? `₹${Number(val).toFixed(2)}` : "-",
                },
                {
                  title: "CGST",
                  dataIndex: "cgst_amount",
                  render: (val) =>
                    Number(val) > 0 ? `₹${Number(val).toFixed(2)}` : "-",
                },
                {
                  title: "IGST",
                  dataIndex: "igst_amount",
                  render: (val) =>
                    Number(val) > 0 ? `₹${Number(val).toFixed(2)}` : "-",
                },
                {
                  title: "Total Amount",
                  dataIndex: "total_amount",
                  render: (val) => (
                    <span className="font-bold text-amber-950">
                      ₹{Number(val || 0).toFixed(2)}
                    </span>
                  ),
                },
              ]}
            />

            {/* TOTALS & SUMMARY */}
            <Card size="small" className="bg-amber-50/60 border-amber-200">
              <Row gutter={16} align="middle">
                <Col span={4}>
                  <Text type="secondary">Total Qty:</Text>
                  <div className="font-bold text-base">
                    {viewRecord.total_qty || 0}
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Total Gr. Wt:</Text>
                  <div className="font-bold text-base">
                    {viewRecord.total_gross_weight_ton ||
                      viewRecord.gross_weight ||
                      "-"}{" "}
                    Ton
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Net Wt:</Text>
                  <div className="font-bold text-base">
                    {viewRecord.total_net_weight_ton ||
                      viewRecord.net_weight ||
                      "-"}{" "}
                    Ton
                  </div>
                </Col>
                <Col span={4}>
                  <Text type="secondary">Round Off:</Text>
                  <div className="font-bold text-base">
                    ₹{Number(viewRecord.round_off_amount || 0).toFixed(2)}
                  </div>
                </Col>
                <Col span={8} className="text-right">
                  <Text type="secondary">Grand Total:</Text>
                  <div className="font-extrabold text-2xl text-amber-900">
                    ₹
                    {Number(viewRecord.grand_total || 0).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 }
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* DOCUMENT LINK */}
            {(viewRecord.einvoice_pdf || viewRecord.invoice_copy_url) && (
              <div className="p-2.5 bg-gray-50 rounded border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FilePdfOutlined className="text-red-500 text-lg" />
                  <span className="font-semibold text-gray-800 text-xs">
                    Uploaded E-Invoice Copy:
                  </span>
                </div>
                <a
                  href={viewRecord.einvoice_pdf || viewRecord.invoice_copy_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-bold hover:underline text-xs"
                >
                  View / Download Document
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
