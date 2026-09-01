import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Card,
  message,
  Tooltip,
  Select,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DownloadOutlined,
  SyncOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getFreightDetails,
  createFreightDetails,
  updateFreightDetails,
} from "../../../../../api/purchase";
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

const parseDateToDayjs = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split(" ")[0].split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return dayjs(dateStr);
    }
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return dayjs(new Date(y, m, d));
  }
  return dayjs(dateStr);
};

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

export default function LoadingAdvice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  // ---------- sales contract edit modal state ----------
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
  const [passingWeights, setPassingWeights] = useState([]);
  const selectedFY = useSelectedFinancialYear();
  const [isContractReadOnly, setIsContractReadOnly] = useState(false);

  // refs used inside the ported ItemsTable
  const itemRefs = useRef({});
  const qtyRefs = useRef({});
  const contractRateRefs = useRef({});
  const contractDateRef = useRef(null);
  const validFromRef = useRef(null);
  const validToRef = useRef(null);

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
        freeQty: Number(it.freeQty || 0),
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

  const openEditSalesContract = async (contractId) => {
    setIsContractReadOnly(false);
    if (!contractId) {
      message.warning("Sale contract ID is not available for this record");
      return;
    }
    try {
      message.loading({
        content: "Loading contract details...",
        key: "load_contract",
      });
      const contract = await getSalesContractById(contractId);
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

      fetchData();
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
    form: cForm,
    allowRemove = true,
    allowAdd = true,
    productList = [],
    openItemIndex,
    setOpenItemIndex,
  }) => {
    const handleItemSelect = (productId, fieldName) => {
      const product = productList.find((p) => p.product_id === productId);
      if (!product) return;

      const items = cForm.getFieldValue("items") || [];
      const updatedItems = [...items];

      updatedItems[fieldName] = {
        ...updatedItems[fieldName],
        item: productId,
        uom: product.base_unit || "",
        gstPercent: product.gst_percentage || 0,
        grossWt: product.gross_weight || 0,
      };

      cForm.setFieldsValue({ items: updatedItems });
      recalculateRow(fieldName, updatedItems);

      setOpenItemIndex?.(null);
      setTimeout(() => {
        qtyRefs.current[fieldName]?.focus();
      }, 100);
    };

    const recalculateRow = (index, itemsOverride, patch = {}) => {
      const items = [...(itemsOverride || cForm.getFieldValue("items") || [])];
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

      cForm.setFieldsValue({ items: updatedItems });

      const allValues = cForm.getFieldsValue(true);
      const computed = computeFromFormValues({
        ...allValues,
        items: updatedItems,
      });
      cForm.setFieldsValue({
        orderTotals: computed.orderTotals,
        orderTaxAndTotals: {
          ...allValues.orderTaxAndTotals,
          ...computed.orderTaxAndTotals,
        },
      });
    };

    const handleAutoAddRow = (add) => {
      if (!allowAdd) return;

      const items = cForm.getFieldValue("items") || [];
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
                      filterOption={(input, option) =>
                        (option?.children ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      autoClearSearchValue={false}
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getFreightDetails();
      const list = res || [];
      setData(list.map((item) => ({ ...item, key: item.id })));
    } catch (error) {
      console.error("Failed to fetch freight details:", error);
      message.error("Failed to load transport freight details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleReset = () => {
    setSearchText("");
  };

  const handleExport = () => {
    const exportRows = filteredData.map((item) => ({
      "PO Number": item.purchase_order_number || "-",
      "Contract Number": item.sale_contract_number || "-",
      "Vehicle Details": item.vehicle_details || "-",
      "Transporter Name": item.transporter_name || "-",
      "Lorry Receipt No": item.lorry_receipt_no || "-",
      "Lorry Receipt Date": item.lorry_receipt_date || "-",
      "Gross Weight Loading Plan": item.gross_weight_loading_plan || "-",
      "Gross Weight Loaded": item.gross_weight_loaded || "-",
      "Min Guarantee Weight": item.min_guarantee_weight || "-",
      Place: item.place || "-",
      "Freight Rate Agreed": item.freight_rate_agreed || "-",
      "Freight Rate Placed": item.freight_rate_placed || "-",
      "Freight Amount": item.freight_amount || "-",
      "Advance Paid Amount": item.advance_paid_amount || "-",
      "Claim Shortage": item.claim_shortage || "-",
      "Claim Shortage Notes":
        item.claim_shortage_notes || item.claim_shortage_note || "-",
      "Other Charges": item.other_charges || "-",
      "Other Charges Notes":
        item.other_charges_notes || item.other_charges_note || "-",
      "Balance Payable": item.balance_payable || "-",
      "Balance Paid": item.balance_paid || "-",
      "Transport Commission": item.transport_commission || "-",
    }));
    exportToExcel(exportRows, "Transport_Freight_Details", "FreightDetails");
  };

  const handleOpenAddModal = (record) => {
    setSelectedRecord(record);
    setModalMode("add");
    form.setFieldsValue({
      lorry_receipt_no: undefined,
      lorry_receipt_date: record.lorry_receipt_date
        ? parseDateToDayjs(record.lorry_receipt_date)
        : dayjs(),
      gross_weight_loaded: record.gross_weight_loading_plan
        ? Number(record.gross_weight_loading_plan)
        : undefined,
      freight_rate_placed: record.freight_rate_agreed
        ? Number(record.freight_rate_agreed)
        : undefined,
      advance_paid_amount: undefined,
      claim_shortage: undefined,
      claim_shortage_notes: undefined,
      other_charges: undefined,
      other_charges_notes: undefined,
      transport_commission: undefined,
      balance_paid: undefined,
    });
  };

  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setModalMode("edit");
    form.setFieldsValue({
      lorry_receipt_no: record.lorry_receipt_no,
      lorry_receipt_date: record.lorry_receipt_date
        ? parseDateToDayjs(record.lorry_receipt_date)
        : null,
      gross_weight_loaded: record.gross_weight_loaded
        ? Number(record.gross_weight_loaded)
        : undefined,
      freight_rate_placed: record.freight_rate_placed
        ? Number(record.freight_rate_placed)
        : undefined,
      advance_paid_amount: record.advance_paid_amount
        ? Number(record.advance_paid_amount)
        : undefined,
      claim_shortage: record.claim_shortage
        ? Number(record.claim_shortage)
        : undefined,
      claim_shortage_notes:
        record.claim_shortage_notes || record.claim_shortage_note,
      other_charges: record.other_charges
        ? Number(record.other_charges)
        : undefined,
      other_charges_notes:
        record.other_charges_notes || record.other_charges_note,
      transport_commission: record.transport_commission
        ? Number(record.transport_commission)
        : undefined,
      balance_paid: record.balance_paid
        ? Number(record.balance_paid)
        : undefined,
    });
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedRecord(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        lorry_receipt_no: values.lorry_receipt_no,
        lorry_receipt_date: values.lorry_receipt_date
          ? values.lorry_receipt_date.format("DD-MM-YYYY")
          : null,
        gross_weight_loaded: values.gross_weight_loaded
          ? Number(values.gross_weight_loaded)
          : null,
        freight_rate_placed: values.freight_rate_placed
          ? Number(values.freight_rate_placed)
          : null,
        claim_shortage: values.claim_shortage
          ? Number(values.claim_shortage)
          : null,
        claim_shortage_notes: values.claim_shortage_notes || null,
        other_charges: values.other_charges
          ? Number(values.other_charges)
          : null,
        other_charges_notes: values.other_charges_notes || null,
      };

      if (modalMode === "edit") {
        payload.advance_paid_amount = values.advance_paid_amount
          ? Number(values.advance_paid_amount)
          : null;
        payload.transport_commission = values.transport_commission
          ? Number(values.transport_commission)
          : null;
        payload.balance_paid = values.balance_paid
          ? Number(values.balance_paid)
          : null;
      }

      if (modalMode === "add") {
        await updateFreightDetails(selectedRecord.id, payload);
        message.success("Freight details added successfully");
      } else {
        await updateFreightDetails(selectedRecord.id, payload);
        message.success("Freight details updated successfully");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Submission failed:", error);
      message.error("Failed to save freight details");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const lower = searchText.toLowerCase();
    return (
      item.purchase_order_number?.toLowerCase().includes(lower) ||
      item.sale_contract_number?.toLowerCase().includes(lower) ||
      item.vehicle_details?.toLowerCase().includes(lower) ||
      item.transporter_name?.toLowerCase().includes(lower) ||
      item.place?.toLowerCase().includes(lower) ||
      item.lorry_receipt_no?.toLowerCase().includes(lower)
    );
  });

  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">Contract Number</span>
      ),
      dataIndex: "sale_contract_number",
      width: 130,
      render: (t, record) => (
        <span
          className="bg-blue-500 text-white font-semibold px-2 py-1 rounded cursor-pointer hover:bg-blue-600 whitespace-nowrap"
          onDoubleClick={() => openEditSalesContract(record.sale_contract_id)}
          title="Double click to edit sale contract"
        >
          {t || "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Vehicle Details</span>
      ),
      dataIndex: "vehicle_details",
      width: 100,
      render: (t) => (
        <span className="text-amber-800 font-semibold">{t || "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Transport Name</span>
      ),
      dataIndex: "transporter_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Lorry Receipt No</span>
      ),
      dataIndex: "lorry_receipt_no",
      width: 110,
      render: (t) => (
        <span
          className={
            t
              ? "bg-green-50 text-green-800 px-1 py-0.5 rounded font-medium border border-green-200"
              : "text-red-500 font-semibold"
          }
        >
          {t || "Pending"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Lorry Receipt Date</span>
      ),
      dataIndex: "lorry_receipt_date",
      width: 100,
      render: (t) => {
        if (!t) return "-";
        if (t.includes("-") && t.split("-")[0].length === 2) {
          return <span className="text-amber-800">{t}</span>;
        }
        const parsed = parseDateToDayjs(t);
        return (
          <span className="text-amber-800">
            {parsed ? parsed.format("DD-MM-YYYY") : t}
          </span>
        );
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Gross Weight Loading Plan
        </span>
      ),
      dataIndex: "gross_weight_loading_plan",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">{t ? Number(t).toFixed(3) : "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Gross Weight Loaded
        </span>
      ),
      dataIndex: "gross_weight_loaded",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">{t ? Number(t).toFixed(3) : "-"}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Min Guarantee Weight
        </span>
      ),
      dataIndex: "min_guarantee_weight",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">{t ? Number(t).toFixed(3) : "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Place</span>,
      dataIndex: "place",
      width: 95,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Freight Rate Agreed
        </span>
      ),
      dataIndex: "freight_rate_agreed",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Freight Rate Placed
        </span>
      ),
      dataIndex: "freight_rate_placed",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Freight Amount</span>
      ),
      dataIndex: "freight_amount",
      width: 90,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Advance Paid Amount
        </span>
      ),
      dataIndex: "advance_paid_amount",
      width: 90,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Claim / Shortage</span>
      ),
      dataIndex: "claim_shortage",
      width: 80,
      render: (t, r) => (
        <Tooltip
          title={r.claim_shortage_notes || r.claim_shortage_note || "No notes"}
        >
          <span className="text-amber-800 font-semibold cursor-pointer">
            ₹
            {t
              ? Number(t).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })
              : "0.00"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Other Charges</span>
      ),
      dataIndex: "other_charges",
      width: 80,
      render: (t, r) => (
        <Tooltip
          title={r.other_charges_notes || r.other_charges_note || "No notes"}
        >
          <span className="text-amber-800 font-semibold cursor-pointer">
            ₹
            {t
              ? Number(t).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })
              : "0.00"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Balance Payable</span>
      ),
      dataIndex: "balance_payable",
      width: 90,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Balance Paid</span>,
      dataIndex: "balance_paid",
      width: 80,
      render: (t) => (
        <span className="text-amber-800">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Transport Commission
        </span>
      ),
      dataIndex: "transport_commission",
      width: 90,
      render: (t) => (
        <span className="text-amber-800 font-semibold">
          ₹
          {t
            ? Number(t).toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "-"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => {
        const hasLorryReceipt = !!record.lorry_receipt_no;
        return (
          <Button
            type="primary"
            onClick={() => {
              if (hasLorryReceipt) {
                handleOpenEditModal(record);
              } else {
                handleOpenAddModal(record);
              }
            }}
            className={
              hasLorryReceipt
                ? "!h-6 !px-2 !py-0 !text-[10px] !bg-amber-500 !hover:bg-amber-600 !border-none"
                : "!h-6 !px-2 !py-0 !text-[10px] !bg-emerald-600 !hover:bg-emerald-700 !border-none"
            }
          >
            {hasLorryReceipt ? "Edit" : "Add Freight"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-full overflow-hidden">
      {/* Controls Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 w-96">
          <Input
            prefix={<SearchOutlined className="text-amber-600" />}
            placeholder="Search by PO No, Vehicle, Transporter..."
            value={searchText}
            onChange={handleSearch}
            allowClear
            className="border-amber-300 hover:border-amber-400 focus:border-amber-500 rounded"
          />
          <Button
            onClick={handleReset}
            className="border-amber-400 text-amber-700 hover:bg-amber-100"
          >
            Reset
          </Button>
        </div>
        <div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="!bg-emerald-600 !hover:bg-emerald-700 !border-none rounded font-medium"
          >
            Export to Excel
          </Button>
          <Tooltip title="Reload records">
            <Button
              icon={<SyncOutlined spin={loading} />}
              onClick={fetchData}
              className="ml-2 border-amber-300 hover:border-amber-400 text-amber-700 rounded"
            />
          </Tooltip>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white mt-4">
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={false}
          scroll={{ y: "calc(100vh - 250px)", x: 1650 }}
          rowKey="id"
          size="small"
          className="[&_.ant-table-cell]:!px-1 [&_.ant-table-cell]:!py-1 [&_.ant-table-thead_th]:!py-1.5"
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-xl font-semibold">
            {modalMode === "add"
              ? "Add Transport Freight Details"
              : "Update Transport Freight Details"}
          </span>
        }
        open={modalMode !== null}
        onCancel={handleCloseModal}
        footer={null}
        width={750}
        zIndex={1100}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          {selectedRecord && (
            <Card
              size="small"
              className="mb-4 border-amber-200 bg-amber-50/20"
              title="Record Context"
            >
              <Row gutter={12}>
                <Col span={8}>
                  <div className="text-xs text-gray-500">PO Number</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.purchase_order_number || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Contract Number</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.sale_contract_number || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Vehicle Details</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.vehicle_details || "-"}
                  </div>
                </Col>
              </Row>
              <Row gutter={12} className="mt-2">
                <Col span={8}>
                  <div className="text-xs text-gray-500">Transporter Name</div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.transporter_name || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">
                    Freight Rate Agreed
                  </div>
                  <div className="text-amber-800 font-semibold">
                    ₹{selectedRecord.freight_rate_agreed || "-"}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">
                    Min Guarantee Weight
                  </div>
                  <div className="text-amber-800 font-semibold">
                    {selectedRecord.min_guarantee_weight || "-"}
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lorry_receipt_no"
                label="Lorry Receipt No"
                rules={[
                  {
                    required: true,
                    message: "Please input Lorry Receipt Number!",
                  },
                ]}
              >
                <Input placeholder="Enter Lorry Receipt Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lorry_receipt_date"
                label="Lorry Receipt Date"
                rules={[
                  {
                    required: true,
                    message: "Please select Lorry Receipt Date!",
                  },
                ]}
              >
                <DatePicker className="w-full" format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gross_weight_loaded"
                label="Gross Weight Loaded (Ton)"
                rules={[
                  { required: true, message: "Please input loaded weight!" },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={3}
                  placeholder="Loaded Weight"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="freight_rate_placed"
                label="Freight Rate Placed (₹)"
                rules={[
                  {
                    required: true,
                    message: "Please input placed freight rate!",
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  placeholder="Agreed freight rate"
                />
              </Form.Item>
            </Col>
          </Row>

          <Card
            size="small"
            title="Shortage & Deductions"
            className="mb-4 border-rose-200 bg-rose-50/5"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="claim_shortage" label="Claim Shortage (₹)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Deduction amount"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="claim_shortage_notes"
                  label="Claim Shortage Notes"
                >
                  <Input placeholder="Reason for deduction" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card
            size="small"
            title="Other Charges"
            className="mb-4 border-amber-200 bg-amber-50/5"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="other_charges" label="Other Charges (₹)">
                  <InputNumber
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="Other charges"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="other_charges_notes"
                  label="Other Charges Notes"
                >
                  <Input placeholder="Notes for other charges" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="!bg-amber-500 !hover:bg-amber-600 !border-none"
            >
              {modalMode === "add"
                ? "Save Freight Details"
                : "Update Freight Details"}
            </Button>
          </div>
        </Form>
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
                    {["Pending", "Approved", "Rejected"].map((s) => (
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
              allowRemove={!isContractReadOnly}
              allowAdd={!isContractReadOnly}
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
    </div>
  );
}
