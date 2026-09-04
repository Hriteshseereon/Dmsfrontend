import React, { useState, useEffect, useRef } from "react";
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
  Tag,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  FileExcelOutlined,
  EditOutlined,
  SafetyOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getVehiclePlacements,
  updateVehiclePlacement,
  getAllTransport,
  updatePurchaseSalesContractOrder,
  getPurchaseSalesContractOrderById,
} from "../../../../../api/purchase";
import {
  getAllVehicles,
  getAllDrivers,
} from "../../../../../api/vehiclemaster";
import {
  getSalesContractById,
  updateSalesContract,
  getCustomersByOrganisation,
  getAllBrokerName,
  getAllPlantsName,
  getProductByplant,
  getAllPassingWeight,
} from "../../../../../api/sales";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import AppDatePicker from "../../../../../components/AppDatePicker";

dayjs.extend(customParseFormat);

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

const parseWeightToTon = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const str = String(val).trim().toLowerCase();
  const match = str.match(/[\d.]+/);
  if (!match) return null;
  const num = Number(match[0]);
  if (str.includes("kg")) {
    return num / 1000;
  }
  return num;
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
  // Cancelled placement IDs (frontend only)
  const [cancelledRecordIds, setCancelledRecordIds] = useState(new Set());

  // Extend Single Contract modal state on release
  const [extendSingleModal, setExtendSingleModal] = useState({
    open: false,
    contractId: null,
    contractNumber: "",
    customerName: "",
    extendedUpto: null,
    record: null,
    blockingContractIds: [],
  });
  const [extendingLoading, setExtendingLoading] = useState(false);

  // Bulk Selection and Contract View States
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);

  // Sales Contract Edit States & Refs
  const [customers, setCustomers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [vendorProductsMap, setVendorProductsMap] = useState({});
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [passingWeights, setPassingWeights] = useState([]);
  const selectedFY = useSelectedFinancialYear();

  const itemRefs = useRef({});
  const qtyRefs = useRef({});
  const contractRateRefs = useRef({});
  const contractDateRef = useRef(null);
  const validFromRef = useRef(null);
  const validToRef = useRef(null);

  const [isContractEditModalOpen, setIsContractEditModalOpen] = useState(false);
  const [contractEditingRecord, setContractEditingRecord] = useState(null);
  const [contractSubmitting, setContractSubmitting] = useState(false);
  const [contractForm] = Form.useForm();
  const [editItemDropdownIndex, setEditItemDropdownIndex] = useState(null);
  const [isContractReadOnly, setIsContractReadOnly] = useState(false);

  const statusOptions = ["Pending", "Approved", "Rejected"];

  // Fetch lookups for contract edit form
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

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllPassingWeight();
        const list = res?.data || res || [];
        const uniqueWeights = [
          ...new Set(
            list
              .map((item) => {
                if (item === null || item === undefined || item === "")
                  return null;
                const match = String(item).match(/[\d.]+/);
                if (!match) return null;
                const num = Number(match[0]);
                return Number.isNaN(num) ? null : String(num);
              })
              .filter(Boolean),
          ),
        ].sort((a, b) => Number(a) - Number(b));
        setPassingWeights(uniqueWeights);
      } catch (error) {
        console.error("Failed to fetch passing weights:", error);
        setPassingWeights([]);
      }
    })();
  }, []);

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

  // ---------------------------------------------------------------
  // Map full contract detail → the full edit-form shape (mirrors
  // SalesSouda.jsx's mapContractToForm exactly)
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
      brokerId: contract.broker_id || null,
      brokerName: contract.broker_id
        ? {
            value: contract.broker_id,
            label: (contract.broker_name || "").split(" ")[0] || "Direct",
          }
        : { value: "direct", label: "Direct" },

      soudaDate: parseApiDate(contract.created_date),
      startDate: parseApiDate(contract.from_date),
      endDate: parseApiDate(contract.to_date),
      contratGrossWeight:
        contract.contrat_gross_weight !== null &&
        contract.contrat_gross_weight !== undefined
          ? String(contract.contrat_gross_weight)
          : "loose",

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
        grossWt: Number(it.gross_weight || it.product?.gross_weight || 0),
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
        totalQty: calculatedTotalQty,

        totalWeightTon:
          calculatedTotalWeightTon || Number(contract.total_net_weight || 0),

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

  // Recalculation for full sales-contract edit form
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
    const latestValues = contractForm.getFieldsValue(true);
    const computed = computeFromFormValues({
      ...allValues,
      ...latestValues,
      items: latestValues.items || allValues.items,
      orderTaxAndTotals:
        latestValues.orderTaxAndTotals || allValues.orderTaxAndTotals,
    });

    contractForm.setFieldsValue({
      orderTaxAndTotals: {
        ...(latestValues.orderTaxAndTotals || allValues.orderTaxAndTotals),
        ...computed.orderTaxAndTotals,
      },
      orderTotals: computed.orderTotals,
    });
  };

  const validateContractGrossWeight = (contractGrossWeight, totalWeightTon) => {
    if (
      contractGrossWeight === undefined ||
      contractGrossWeight === null ||
      contractGrossWeight === ""
    ) {
      return {
        valid: false,
        message: "Please select Passing Weight.",
      };
    }

    if (String(contractGrossWeight).toLowerCase() === "loose") {
      return {
        valid: true,
        message: "",
      };
    }

    const selectedWeight = Number(
      String(contractGrossWeight).match(/[\d.]+/)?.[0],
    );
    const actualWeight = Number(totalWeightTon || 0);

    if (Number.isNaN(selectedWeight) || selectedWeight <= 0) {
      return {
        valid: false,
        message: "Invalid Passing Weight.",
      };
    }

    const maxAllowedWeight = selectedWeight * 1.05;

    if (actualWeight < selectedWeight) {
      return {
        valid: false,
        message: `Passing Weight cannot be less than ${selectedWeight.toFixed(3)} Ton. Current Gross Weight is ${actualWeight.toFixed(3)} Ton.`,
      };
    }

    if (actualWeight > maxAllowedWeight) {
      return {
        valid: false,
        message: `Passing Weight cannot exceed ${maxAllowedWeight.toFixed(3)} Ton (5% tolerance). Current Gross Weight is ${actualWeight.toFixed(3)} Ton.`,
      };
    }

    return {
      valid: true,
      message: "",
    };
  };

  // Open Edit / View Sales Contract Modal
  const openEditSalesContract = async (contractRecord) => {
    setIsContractReadOnly(false);
    const cId =
      contractRecord.sale_contract_id ||
      contractRecord.sale_contract ||
      contractRecord.id ||
      contractRecord;
    try {
      message.loading({
        content: "Loading contract details...",
        key: "load_contract",
      });
      const contract = await getSalesContractById(cId);
      const mapped = mapContractToForm(contract);

      if (contract.plant_id) {
        const products = await getProductByplant(contract.plant_id);
        const productList = Array.isArray(products) ? products : [];
        const productMap = Object.fromEntries(
          productList.map((p) => [p.product_id, p]),
        );

        mapped.items = (mapped.items || []).map((it) => ({
          ...it,
          grossWt:
            Number(it.grossWt || 0) ||
            Number(productMap[it.item]?.gross_weight || 0),
        }));

        setSelectedPlantId(contract.plant_id);
        setVendorProductsMap({
          [contract.plant_id]: productList,
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

  const openReadOnlySalesContract = async (contractRecord) => {
    setIsContractReadOnly(true);
    const cId =
      contractRecord.sale_contract_id ||
      contractRecord.sale_contract ||
      contractRecord.id ||
      contractRecord;
    try {
      message.loading({
        content: "Loading contract details...",
        key: "load_contract",
      });
      const contract = await getSalesContractById(cId);
      const mapped = mapContractToForm(contract);

      if (contract.plant_id) {
        const products = await getProductByplant(contract.plant_id);
        const productList = Array.isArray(products) ? products : [];
        const productMap = Object.fromEntries(
          productList.map((p) => [p.product_id, p]),
        );

        mapped.items = (mapped.items || []).map((it) => ({
          ...it,
          grossWt:
            Number(it.grossWt || 0) ||
            Number(productMap[it.item]?.gross_weight || 0),
        }));

        setSelectedPlantId(contract.plant_id);
        setVendorProductsMap({
          [contract.plant_id]: productList,
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

      const grossWeightValidation = validateContractGrossWeight(
        values.contratGrossWeight,
        values.orderTotals?.totalWeightTon,
      );

      if (!grossWeightValidation.valid) {
        message.error(grossWeightValidation.message);
        return;
      }

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

        broker_id: values.brokerId || null,
        broker_name: values.brokerId ? values.brokerName?.label || null : null,

        status: values.status,
        created_date: values.soudaDate
          ? dayjs(values.soudaDate).format("YYYY-MM-DD")
          : null,
        contrat_gross_weight:
          values.contratGrossWeight === "loose"
            ? null
            : Number(String(values.contratGrossWeight).match(/[\d.]+/)?.[0]),
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

      await updateSalesContract(contractEditingRecord.key, payload);
      message.success("Sales contract updated successfully!");
      setIsContractEditModalOpen(false);
      setContractEditingRecord(null);
      contractForm.resetFields();

      fetchPlacements();
    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.message || "Failed to update sales contract",
      );
    } finally {
      setContractSubmitting(false);
    }
  };

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

    const recalculateRow = (index, itemsOverride, patch = {}) => {
      const items = [...(itemsOverride || form.getFieldValue("items") || [])];
      const it = { ...items[index], ...patch };
      if (!items[index]) return;

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
        ...patch,
        qty,
        freeQty,
        totalQty: qty + freeQty,
        weightTon: Number(weightTon.toFixed(3)),
        rate: Number(rate.toFixed(2)),
        amount: Number(amount.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2)),
        roundOff: Number(roundOff.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
      };

      form.setFieldsValue({ items: updatedItems });

      const allValues = form.getFieldsValue(true);
      const computed = computeFromFormValues({
        ...allValues,
        items: updatedItems,
      });
      form.setFieldsValue({
        orderTotals: computed.orderTotals,
        orderTaxAndTotals: {
          ...allValues.orderTaxAndTotals,
          ...computed.orderTaxAndTotals,
        },
      });
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
                      onFocus={(e) => e?.target?.select?.()}
                      onInput={(e) => {
                        if (e?.target) {
                          e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 5);
                        }
                      }}
                      onChange={(value) => {
                        recalculateRow(field.name, undefined, { qty: value });
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
                        if (e?.target) {
                          e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 5);
                        }
                      }}
                      onChange={(value) => {
                        recalculateRow(field.name, undefined, {
                          freeQty: value,
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item name={[field.name, "grossWt"]} hidden>
                    <InputNumber />
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
                      onChange={(value) => {
                        recalculateRow(field.name, undefined, {
                          contractRate: value,
                        });
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

  const handleOpenContractView = async (record) => {
    const contractId = record.sale_contract_id || record.sale_contract;
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

  const getVehicleSerialNumber = (contractId, detail) => {
    if (!detail) return null;
    const scList = detail.sale_contracts || [];
    const matched = scList.find(
      (c) =>
        typeof c === "object" &&
        (c?.contract_id === contractId ||
          c?.sale_contract_id === contractId ||
          c?.id === contractId),
    );
    if (
      matched &&
      matched.vehicle_serial_number !== undefined &&
      matched.vehicle_serial_number !== null
    ) {
      return matched.vehicle_serial_number;
    }
    const detailsList =
      detail.sale_contract_details ||
      detail.sales_contract_details ||
      detail.sale_contracts_details ||
      detail.sales_contracts ||
      [];
    const matchedDetail = detailsList.find(
      (c) =>
        c?.contract_id === contractId ||
        c?.sale_contract_id === contractId ||
        c?.id === contractId,
    );
    if (
      matchedDetail &&
      matchedDetail.vehicle_serial_number !== undefined &&
      matchedDetail.vehicle_serial_number !== null
    ) {
      return matchedDetail.vehicle_serial_number;
    }
    return null;
  };

  const handleReleaseContract = async (record) => {
    const poId =
      typeof record.purchase_order === "object"
        ? record.purchase_order?.id || record.purchase_order?.purchase_order_id
        : record.purchase_order;

    const targetContractId =
      record.sale_contract_id ||
      (typeof record.sale_contract === "object"
        ? record.sale_contract?.sale_contract_id || record.sale_contract?.id
        : record.sale_contract);

    const targetContractNumber =
      record.sale_contract_number ||
      (typeof record.sale_contract === "object"
        ? record.sale_contract?.sale_contract_number
        : null);

    if (!poId || (!targetContractId && !targetContractNumber)) {
      message.warning("Missing purchase order or sale contract information.");
      return;
    }

    try {
      message.loading({
        content: "Releasing contract...",
        key: "release_contract",
      });

      // Fetch the full PO details to get its exact current list of sale contracts
      const poRes = await getPurchaseSalesContractOrderById(poId);
      const poDetail = poRes?.data || poRes;

      const getContractId = (c) => {
        if (!c) return null;
        if (typeof c === "string") return c;
        return c.contract_id || c.sale_contract_id || c.id || null;
      };

      const getContractNumber = (c) => {
        if (!c || typeof c !== "object") return null;
        return c.sale_contract_number || c.contract_number || c.saleContractNumber || null;
      };

      const rawContracts =
        poDetail.sale_contracts && poDetail.sale_contracts.length > 0
          ? poDetail.sale_contracts
          : poDetail.sale_contract_details ||
            poDetail.sales_contract_details ||
            poDetail.sale_contracts_details ||
            [];

      // Filter out:
      // 1. Current contract to release
      // 2. Any contract already released previously
      const remainingContracts = rawContracts.filter((c) => {
        const cId = getContractId(c);
        const cNumber = getContractNumber(c);

        const isMatchById =
          targetContractId &&
          cId &&
          String(cId).toLowerCase() === String(targetContractId).toLowerCase();

        const isMatchByNumber =
          targetContractNumber &&
          cNumber &&
          String(cNumber).toLowerCase() ===
            String(targetContractNumber).toLowerCase();

        const isAlreadyReleased =
          cId &&
          (releasedContractIds.has(cId) ||
            releasedContractIds.has(String(cId).toLowerCase()));

        return !(isMatchById || isMatchByNumber || isAlreadyReleased);
      });

      if (rawContracts.length <= 1 || remainingContracts.length === 0) {
        message.warning(
          "At least one sale contract is required. You cannot release the last contract of a purchase order.",
        );
        return;
      }

      if (remainingContracts.length === rawContracts.length) {
        message.warning("Contract not found in this purchase order.");
        return;
      }

      // Format remaining contracts as objects with contract_id and vehicle_serial_number
      const formattedSaleContracts = remainingContracts.map((c) => {
        const cId = getContractId(c);
        const srNo =
          (typeof c === "object" ? c.vehicle_serial_number : null) ??
          getVehicleSerialNumber(cId, poDetail);

        return {
          contract_id: cId,
          vehicle_serial_number: srNo ? Number(srNo) : null,
        };
      });

      // Update the PO on the backend
      await updatePurchaseSalesContractOrder(poId, {
        sale_contracts: formattedSaleContracts,
      });

      // Track released state locally using placement record's id and contract ID
      setReleasedContractIds((prev) => {
        const next = new Set(prev);
        if (record.id) next.add(record.id);
        if (targetContractId) {
          next.add(targetContractId);
          next.add(String(targetContractId).toLowerCase());
        }
        if (record.sale_contract) {
          next.add(record.sale_contract);
          next.add(String(record.sale_contract).toLowerCase());
        }
        return next;
      });

      message.success({
        content: "Contract released successfully",
        key: "release_contract",
      });
      fetchPlacements();
    } catch (err) {
      console.error("Release contract error:", err);
      message.destroy("release_contract");

      const errorData = err?.response?.data;
      let errorMsg = "";
      let isContractExpiredOrUnapproved = false;

      if (errorData) {
        if (typeof errorData === "string") {
          errorMsg = errorData;
        } else if (errorData.sale_contracts) {
          if (
            typeof errorData.sale_contracts === "object" &&
            !Array.isArray(errorData.sale_contracts)
          ) {
            errorMsg =
              errorData.sale_contracts.status ||
              Object.values(errorData.sale_contracts)
                .map((v) => (Array.isArray(v) ? v.join(", ") : String(v)))
                .join(" | ");
          } else if (Array.isArray(errorData.sale_contracts)) {
            errorMsg = errorData.sale_contracts.join(", ");
          } else if (typeof errorData.sale_contracts === "string") {
            errorMsg = errorData.sale_contracts;
          }
        } else if (errorData.message) {
          errorMsg =
            typeof errorData.message === "object"
              ? JSON.stringify(errorData.message)
              : String(errorData.message);
        } else if (errorData.detail) {
          errorMsg =
            typeof errorData.detail === "object"
              ? JSON.stringify(errorData.detail)
              : String(errorData.detail);
        } else if (errorData.error) {
          errorMsg =
            typeof errorData.error === "object"
              ? JSON.stringify(errorData.error)
              : String(errorData.error);
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(", ")
            : String(errorData.non_field_errors);
        } else if (typeof errorData === "object") {
          const parts = [];
          Object.entries(errorData).forEach(([k, v]) => {
            if (typeof v === "object" && v !== null) {
              Object.entries(v).forEach(([subK, subV]) => {
                parts.push(
                  `${subK}: ${Array.isArray(subV) ? subV.join(", ") : subV}`,
                );
              });
            } else {
              parts.push(`${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
            }
          });
          errorMsg = parts.join(" | ");
        }
      }

      if (!errorMsg) {
        errorMsg = err?.message || "Failed to release contract";
      }

      const lowerMsg = errorMsg.toLowerCase();
      if (
        lowerMsg.includes("only approved sale contracts") ||
        lowerMsg.includes("expired") ||
        lowerMsg.includes("expire") ||
        lowerMsg.includes("validity") ||
        lowerMsg.includes("not approved")
      ) {
        isContractExpiredOrUnapproved = true;
      }

      if (isContractExpiredOrUnapproved) {
        // Build contract number -> UUID map from PO details if available
        const contractNumberToIdMap = {};
        try {
          const poRes = await getPurchaseSalesContractOrderById(poId);
          const poDetail = poRes?.data || poRes;
          const allDetails = [
            ...(poDetail?.sale_contract_details || []),
            ...(poDetail?.sales_contract_details || []),
            ...(poDetail?.sale_contracts_details || []),
            ...(poDetail?.sales_contracts || []),
          ];
          allDetails.forEach((cd) => {
            const num = cd.sale_contract_number || cd.contract_number;
            const id = cd.sale_contract_id || cd.contract_id || cd.id;
            if (num && id) {
              contractNumberToIdMap[String(num).trim().toLowerCase()] = id;
            }
          });
        } catch (e) {
          console.warn("Could not load PO details for error mapping", e);
        }

        // Extract contract numbers mentioned in error (e.g. ['HA-26-0043', ...])
        const rawMatches = errorMsg.match(/['"]([A-Za-z0-9\-_/]+)['"]/g) || [];
        const extractedNumbers = rawMatches.map((m) =>
          m.replace(/['"]/g, "").trim(),
        );

        // Convert extracted numbers to valid UUIDs
        const resolvedBlockingIds = [];
        extractedNumbers.forEach((num) => {
          const mappedId = contractNumberToIdMap[num.toLowerCase()];
          if (mappedId) {
            resolvedBlockingIds.push(mappedId);
          } else if (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              num,
            )
          ) {
            resolvedBlockingIds.push(num);
          }
        });

        const effectiveContractId =
          targetContractId ||
          contractNumberToIdMap[
            String(record.sale_contract_number || "").toLowerCase()
          ] ||
          resolvedBlockingIds[0] ||
          null;

        setExtendSingleModal({
          open: true,
          contractId: effectiveContractId,
          contractNumber:
            record.sale_contract_number ||
            record.sale_contract ||
            effectiveContractId,
          customerName:
            record.customer_business_name || record.customer_name || "",
          extendedUpto: dayjs().add(1, "month"),
          record,
          blockingContractIds: resolvedBlockingIds,
        });
      } else {
        message.error({
          content: errorMsg,
          duration: 5,
        });
      }
    }
  };

  const handleExtendAndRelease = async () => {
    if (!extendSingleModal.extendedUpto) {
      message.warning("Please select a date to extend the contract.");
      return;
    }
    try {
      setExtendingLoading(true);
      const formattedDate = dayjs(extendSingleModal.extendedUpto).format(
        "YYYY-MM-DD",
      );

      message.loading({
        content: `Extending contract ${extendSingleModal.contractNumber}...`,
        key: "extend_release",
      });

      // 1. Extend this particular contract (if valid UUID)
      if (
        extendSingleModal.contractId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          String(extendSingleModal.contractId),
        )
      ) {
        try {
          await updateSalesContract(extendSingleModal.contractId, {
            extended_upto: formattedDate,
            status: "Approved",
          });
        } catch (e) {
          console.error("Failed to extend main contract", e);
        }
      }

      // 2. Also extend any other blocking contracts on this PO by their resolved UUIDs
      if (extendSingleModal.blockingContractIds?.length > 0) {
        for (const bId of extendSingleModal.blockingContractIds) {
          if (
            bId &&
            bId !== extendSingleModal.contractId &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              String(bId),
            )
          ) {
            try {
              await updateSalesContract(bId, {
                extended_upto: formattedDate,
                status: "Approved",
              });
            } catch (e) {
              console.error(`Failed to extend blocking contract ${bId}`, e);
            }
          }
        }
      }

      message.success({
        content: `Contract extended successfully! Releasing...`,
        key: "extend_release",
      });

      const rec = extendSingleModal.record;
      setExtendSingleModal((prev) => ({ ...prev, open: false }));

      // 3. Retry release
      if (rec) {
        setTimeout(() => {
          handleReleaseContract(rec);
        }, 400);
      }
    } catch (err) {
      console.error("Extend and release error:", err);
      message.error({
        content:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to extend contract",
        key: "extend_release",
      });
    } finally {
      setExtendingLoading(false);
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
          className="bg-blue-500 text-white font-semibold px-2 py-1 rounded cursor-pointer block text-center hover:bg-blue-600"
          onDoubleClick={() => openEditSalesContract(record)}
          title="Double click to edit contract"
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
      dataIndex: "customer_business_name",
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
      ellipsis: true,
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
          <span className={trans ? "text-amber-800" : "text-red-500 font-semibold"}>
            {trans ? trans.registered_name || trans.name : "Pending"}
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
          <span className={veh ? "text-amber-800" : "text-red-500 font-semibold"}>
            {veh ? veh.vehicle_number : "Pending"}
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
          <span className={drv ? "text-amber-800" : "text-red-500 font-semibold"}>
            {drv ? drv.driver_name : "Pending"}
          </span>
        );
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Passing Weight</span>
      ),
      dataIndex: "passing_weight",
      width: 80,
      render: (t) => (
        <span className={t ? "text-amber-800" : "text-red-500 font-semibold"}>
          {t || "Pending"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Min Guarantee</span>
      ),
      dataIndex: "min_guarantee_weight",
      width: 110,
      render: (t) => (
        <span className={t ? "text-amber-800 font-medium" : "text-red-500 font-semibold"}>
          {t || "Pending"}
        </span>
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
        if (docs.length === 0) return <span className="text-red-500 font-semibold">Pending</span>;
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
        const isReleased =
          releasedContractIds.has(record.id) ||
          (record.sale_contract_id &&
            releasedContractIds.has(record.sale_contract_id)) ||
          (record.sale_contract &&
            releasedContractIds.has(record.sale_contract));
        const isCancelled = cancelledRecordIds.has(record.id);
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
            {(!record.vehicle || isCancelled || isReleased) ? (
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
            ) : (
              <Button
                danger
                size="small"
                onClick={() => {
                  setCancelledRecordIds((prev) => {
                    const next = new Set(prev);
                    next.add(record.id);
                    return next;
                  });
                }}
                className="text-xs"
              >
                Cancel
              </Button>
            )}
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
          {/* <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExport}
            className="!bg-green-600 !hover:bg-green-700 !border-none rounded font-medium"
          >
            Export to Excel
          </Button> */}
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
                rules={[{ required: true, message: "Please select Transporter" }]}
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
                rules={[{ required: true, message: "Please select Vehicle" }]}
              >
                <Select
                  placeholder="Select Vehicle"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  onChange={(vehicleId) => {
                    const selectedVeh = vehicles.find(
                      (v) => v.id === vehicleId,
                    );
                    if (selectedVeh) {
                      const pw = parseWeightToTon(selectedVeh.passing_weight);
                      const mgw = parseWeightToTon(
                        selectedVeh.min_guarantee_weight,
                      );
                      editForm.setFieldsValue({
                        passing_weight: pw,
                        min_guarantee_weight: mgw,
                      });
                    } else {
                      editForm.setFieldsValue({
                        passing_weight: null,
                        min_guarantee_weight: null,
                      });
                    }
                  }}
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
                    render: (t) => (
                      <span className="text-amber-800">{t || "-"}</span>
                    ),
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        Company Group
                      </span>
                    ),
                    dataIndex: "company_group_name",
                    render: (t) => (
                      <span className="text-amber-800">{t || "-"}</span>
                    ),
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">
                        HSN Code
                      </span>
                    ),
                    dataIndex: "hsn_code",
                    render: (t) => (
                      <span className="text-amber-800">{t || "-"}</span>
                    ),
                  },
                  {
                    title: (
                      <span className="text-amber-700 font-semibold">UOM</span>
                    ),
                    dataIndex: ["uom", "unit_name"],
                    render: (t) => (
                      <span className="text-amber-800">{t || "-"}</span>
                    ),
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
                    render: (t) => (
                      <span className="text-amber-800">{t || 0}</span>
                    ),
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

      {/* ── Sales Contract Edit Modal — full form, same as SalesSouda.jsx ── */}
      <Modal
        zIndex={1100}
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            {isContractReadOnly
              ? "View Sales Contract"
              : "Edit Sales Contract (Double Click)"}
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
          disabled={isContractReadOnly}
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
                  name="brokerName"
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
                          brokerId: null,
                          brokerName: { value: "direct", label: "Direct" },
                        });
                      } else {
                        const firstWord = option.label?.split(" ")[0] || "";
                        contractForm.setFieldsValue({
                          brokerId: option.value,
                          brokerName: {
                            value: option.value,
                            label: firstWord,
                          },
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
                <Form.Item name="brokerId" hidden>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item
                  label={<span className="text-amber-700">Passing Weight</span>}
                  name="contratGrossWeight"
                  rules={[
                    {
                      required: true,
                      message: "Select Passing Weight",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select Passing Weight"
                    showSearch
                    optionFilterProp="children"
                  >
                    <Select.Option value="loose">Loose</Select.Option>
                    {passingWeights.map((weight) => (
                      <Select.Option key={weight} value={weight}>
                        {weight} Ton
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={2}>
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

              <Col span={2}>
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

              <Col span={2}>
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
              {isContractReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isContractReadOnly && (
              <Button
                type="primary"
                htmlType="submit"
                loading={contractSubmitting}
                className="!bg-amber-500 !hover:bg-amber-600 !border-none"
              >
                Save Contract Changes
              </Button>
            )}
          </div>
        </Form>
      </Modal>

      {/* Extend Particular Sale Contract Modal */}
      <Modal
        open={extendSingleModal.open}
        onCancel={() =>
          setExtendSingleModal((prev) => ({ ...prev, open: false }))
        }
        footer={[
          <Button
            key="cancel"
            onClick={() =>
              setExtendSingleModal((prev) => ({ ...prev, open: false }))
            }
            className="border-gray-300!"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={extendingLoading}
            className="bg-amber-500! hover:bg-amber-600! border-none! text-white! font-semibold"
            onClick={handleExtendAndRelease}
          >
            Extend & Release
          </Button>,
        ]}
        width={460}
        centered
        title={
          <div className="flex items-center gap-2">
            <span className="text-amber-700 text-lg font-bold">
              Extend Sale Contract
            </span>
            <Tag color="blue" className="font-bold">
              {extendSingleModal.contractNumber}
            </Tag>
          </div>
        }
      >
        <div className="py-2 space-y-4">
          <p className="text-xs text-gray-600">
            This sale contract requires a validity date extension before it can be released.
          </p>

          <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-xs space-y-1">
            <div className="text-amber-900">
              <span className="font-semibold text-gray-700">Contract No:</span>{" "}
              <span className="font-bold">
                {extendSingleModal.contractNumber}
              </span>
            </div>
            {extendSingleModal.customerName && (
              <div className="text-amber-900">
                <span className="font-semibold text-gray-700">Customer:</span>{" "}
                {extendSingleModal.customerName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Extend Validity Upto <span className="text-red-500">*</span>
            </label>
            <AppDatePicker
              className="w-full!"
              style={{ width: "100%" }}
              value={extendSingleModal.extendedUpto}
              onChange={(date) =>
                setExtendSingleModal((prev) => ({
                  ...prev,
                  extendedUpto: date,
                }))
              }
              placeholder="Select extended date"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
