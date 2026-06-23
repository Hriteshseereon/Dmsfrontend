// PurchaseSouda.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  positiveNumberInputProps,
  percentageInputProps,
  blockNonNumericInput,
} from "../../../helpers/numberInput";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import { requiredPositiveNumber } from "../../../helpers/formValidation";
import useSessionStore from "../../../../../store/sessionStore";
import {
  createFinancialYearDisabledDate,
  useSelectedFinancialYear,
} from "../../../../../utils/financialYearValidation";
import {
  getPurchaseContract,
  getAllVendor,
  getCompanies,
  addPurchaseContract,
  getproductbyVendor,
  getProductsByCompany,
  getPlantsByVendor,
  getPurchaseContractById,
  updatePurchaseContract,
  getVendorDetails,
  getVendors,
  deletePurchaseContract,
} from "../../../../../api/purchase";
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
  Popconfirm,
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

import AppDatePicker from "../../../../../components/AppDatePicker";

const { Option } = Select;

export default function PurchaseSouda() {
  // forms
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [selectedCompanyGroupId, setSelectedCompanyGroupId] = useState(null);
  // vendors / companies
  const [plants, setPlants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const currentOrgId = useSessionStore.getState();
  const selectedFY = useSelectedFinancialYear();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const contractDateRef = useRef(null);
  const validFromRef = useRef(null);
  const validToRef = useRef(null);
  const qtyRefs = useRef({});
  const rateRefs = useRef({});
  const statusOptions = ["Pending", "Approved", "Rejected"];
  const itemRefs = useRef({});
  const [itemDropdownIndex, setItemDropdownIndex] = useState(null);
  useEffect(() => {
    fetchDropdownData();
    fetchPurchaseContracts();
    getPurchaseContract();
  }, []);
  // date helper
  const parseApiDate = (value) => {
    if (!value) return null;
    // Try native parsing first - handles "YYYY-MM-DD" and full ISO timestamps
    let d = dayjs(value);
    if (d.isValid()) return d;
    // Fallback - handles "DD-MM-YYYY" if some environment ever sends that shape
    d = dayjs(value, "DD-MM-YYYY");
    return d.isValid() ? d : null;
  };
  const renderDate = (value) => {
    const date = parseApiDate(value);
    return date ? date.format("DD-MM-YYYY") : "-";
  };
  // keep max 3 decimals, no trailing junk
  const round2 = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 0;
    return Number(Number(num).toFixed(2));
  };

  const fetchDropdownData = async () => {
    try {
      const vendorRes = await getVendors();

      console.log("VENDORS", vendorRes);

      setVendors(vendorRes || []);
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
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
    );

    setData(filtered);
  };

  const fetchPurchaseContracts = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseContract();

      const formattedData = res.map((item, index) => ({
        key: item.id || index + 1,
        vendor: res.vendor,
        company_group_name: res.company_group,
        name: item.name,
        souda_number: item.souda_number,
        contractDate: item.created_date,
        vendor_name: item.company_group || item.vendor_name,
        plant: res.plant,
        plant_name: item.plant_name,
        quantity: Number(item.total_qty || 0),
        netWeightTon: Number(item.totalNetWt || item.net_weight || 0),
        startDate: item.startDate,
        to_date: item.to_date,
        from_date: item.from_date,
        status: item.status,
      }));

      setData(formattedData.reverse());
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

      // setSelectedVendor(res.vendor);
      setSelectedVendor(res.vendor);
      setSelectedCompanyGroupId(res.company_group_id);

      const productRes = await getProductsByCompany(res.company_group_id);
      setProducts(productRes?.products || []);

      const plantRes = await getPlantsByVendor(res.vendor);
      setPlants(plantRes || []);

      const items =
        (res.items || [])
          .filter(
            (it) =>
              it.item_name &&
              Number(it.qty || 0) > 0 &&
              Number(it.rate || 0) > 0,
          )
          .map((it) => ({
            product_id: it.product,
            item_name: it.item_name || "",
            base_unit: it.uom_details?.unit_name || "",
            hsn_id: it.hsn_id || null,
            hsn_code: it.hsn_code || "",

            qty: Number(it.qty),
            //  freeQty: Number(it.free_qty),
            totalQty: Number(it.total_qty),
            netWt: Number(it.net_weight),
            rate: Number(it.rate),
            discountPercent: Number(it.discount_percent),
            discountAmt: Number(it.discount_amount),

            grossAmount: Number(it.gross_amount),

            sgstPercent: Number(it.sgst_percent),
            cgstPercent: Number(it.cgst_percent),
            igstPercent: Number(it.igst_percent),

            totalGST: Number(it.total_gst_amount),
            gstAmount: Number(it.gstAmount || 0),
            roundOff: Number(it.roundoff || 0),
            totalAmt: Number(it.total_amount),
          })) || [];

      // ✅ COMPUTE TOTALS HERE
      const computed = computeAllFromFormValues({ items });

      const formattedData = {
        vendor: res.vendor,

        company_group_name: res.company_group,

        plant: res.plant,
        plant_name: res.plant_name,
        soudaDate: parseApiDate(res.created_date || res.created_at),
        from_date: parseApiDate(res.from_date),
        to_date: parseApiDate(res.to_date),

        status: res.status,

        items: computed.items,
        orderTotals: computed.orderTotals,
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
      const validItems = (values.items || []).filter(
        (it) =>
          it?.item_name && Number(it.qty || 0) > 0 && Number(it.rate || 0) > 0,
      );
      const payload = {
        vendor: values.vendor,
        company_group_id: selectedCompanyGroupId,
        vendor_name: values.vendor_name,
        plant: values.plant,
        plant_name: values.plant_name,
        status: values.status,
        created_date: values.soudaDate
          ? dayjs(values.soudaDate).format("YYYY-MM-DD")
          : null,
        from_date: values.from_date
          ? dayjs(values.from_date).format("YYYY-MM-DD")
          : null,

        to_date: values.to_date
          ? dayjs(values.to_date).format("YYYY-MM-DD")
          : null,

        total_qty: round2(orderTotals.totalQty),
        gross_amount: round2(orderTotals.totalGrossAmount),
        total_discount: 0,
        total_gst_amount: 0,
        total_amount: round2(orderTotals.totalGrossAmount),
        grand_total: round2(orderTotals.totalGrossAmount),
        totalNetWt: round2(orderTotals.totalNetWt),
        items: validItems.map((it) => ({
          product: it.product_id,
          uom: it.base_unit,
          hsn_id: it.hsn_id || null,
          hsn_code: it.hsn_code || "",
          item_name: it.item_name || "",
          qty: round2(it.qty),
          //  free_qty: round2(it.freeQty),
          total_qty: round2(it.totalQty),
          net_weight: round2(it.netWt),
          rate: round2(it.rate),

          discount_percent: round2(it.discountPercent),
          discount_amount: round2(it.discountAmt),

          gross_amount: round2(it.grossAmount),

          sgst_percent: round2(it.sgstPercent),
          cgst_percent: round2(it.cgstPercent),
          igst_percent: round2(it.igstPercent),

          total_gst_amount: round2(it.totalGST),
          roundoff: round2(it.roundOff),
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
  // handle delete
  const handleDelete = async (record) => {
    try {
      await deletePurchaseContract(record.key);
      message.success("Purchase Contract deleted successfully");
      await fetchPurchaseContracts();
    } catch {
      message.error("Failed to delete purchase contract");
      alert(`Purchase Contract is linked with other model Status: ${status}`);
    }
  };
  const handleViewClick = async (record) => {
    try {
      setLoading(true);

      const res = await getPurchaseContractById(record.key);

      const items =
        (res.items || [])
          .filter(
            (it) =>
              it.item_name &&
              Number(it.qty || 0) > 0 &&
              Number(it.rate || 0) > 0,
          )
          .map((it) => ({
            product_id: it.product,
            item_name: it.item_name || "",
            base_unit: it.uom_details?.unit_name || "",
            hsn_id: it.hsn_id || null,
            hsn_code: it.hsn_code || "",

            qty: Number(it.qty),
            //  freeQty: Number(it.free_qty),
            totalQty: Number(it.total_qty),
            netWt: Number(it.net_weight),
            rate: Number(it.rate),
            discountPercent: Number(it.discount_percent),
            discountAmt: Number(it.discount_amount),

            grossAmount: Number(it.gross_amount),

            sgstPercent: Number(it.sgst_percent),
            cgstPercent: Number(it.cgst_percent),
            igstPercent: Number(it.igst_percent),

            totalGST: Number(it.total_gst_amount),
            roundOff: Number(it.roundoff || 0),
            totalAmt: Number(it.total_amount),
          })) || [];

      // ✅ ADD THIS BLOCK HERE
      const computed = computeAllFromFormValues({ items });

      const formattedData = {
        vendor: res.vendor,

        company_group_name: res.company_group,

        plant: res.plant,
        plant_name: res.plant_name,
        soudaDate: parseApiDate(res.created_date || res.created_at),
        from_date: parseApiDate(res.from_date),
        to_date: parseApiDate(res.to_date),

        status: res.status,

        items: computed.items,
        orderTotals: computed.orderTotals,
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
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
      dataIndex: "souda_number",

      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Contract Date</span>
      ),
      dataIndex: "contractDate",
      width: 100,
      render: (t) => <span className="text-amber-800">{renderDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Plant Name</span>,
      dataIndex: "plant_name",
      width: 100,
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Supplier Name</span>
      ),
      dataIndex: "vendor_name",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">Quantity</span>,
      dataIndex: "quantity",
      render: (t) => (
        <span className="text-amber-800">{Number(t || 0).toFixed(2)}</span>
      ),
      width: 100,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Net Weight (Ton)</span>
      ),
      dataIndex: "netWeightTon",
      render: (t) => (
        <span className="text-amber-800">{Number(t || 0).toFixed(3)}</span>
      ),
      width: 100,
    },
    {
      title: <span className="text-amber-700 font-semibold">Valid From</span>,
      dataIndex: "from_date",
      width: 100,
      render: (t) => <span className="text-amber-800">{renderDate(t)}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Valid To</span>,
      dataIndex: "to_date",
      width: 100,
      render: (t) => <span className="text-amber-800">{renderDate(t)}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 100,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              Approved
            </span>
          );
        if (status === "Pending")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              Pending
            </span>
          );
        return (
          <span className={`${base} bg-red-200 text-red-700`}>{status}</span>
        );
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
          {record.status !== "Approved" && (
            <>
              <EditOutlined
                className="cursor-pointer!  text-red-500!"
                onClick={() => handleEditClick(record)}
              />

              <Popconfirm
                title="Are you sure to delete this broker?"
                onConfirm={() => handleDelete(record)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <DeleteOutlined className="text-gray-500! cursor-pointer! text-base! hover:text-gray-700!" />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  // ---------- Calculation helpers ----------
  // compute per-item derived fields and order totals
  const computeAllFromFormValues = (values) => {
    const items = (values.items || []).map((it = {}, idx) => {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);

      const gstPercent = Number(it.igstPercent || 0);
      const netWt = Number(it.netWt || 0);
      const discountPercent = Number(it.discountPercent || 0);

      const totalQty = round2(qty);

      // Amount
      const grossAmount = round2(qty * rate);

      // Discount
      const discountAmt = round2((grossAmount * discountPercent) / 100);

      const taxableAmount = round2(grossAmount - discountAmt);

      // GST Amount
      const gstAmount = round2((taxableAmount * gstPercent) / 100);

      const subTotal = round2(taxableAmount + gstAmount);

      const roundedTotal = Math.round(subTotal);

      const roundOff = round2(roundedTotal - subTotal);

      const totalAmt = round2(subTotal + roundOff);

      // Final Total Amount

      return {
        ...it,
        lineKey: it.lineKey || idx + 1,

        totalQty,
        grossAmount,
        discountAmt,
        gstAmount,
        totalAmt,
        roundOff,
        totalNetWt: round2((netWt * qty) / 1000),
      };
    });

    const orderTotals = {
      // Total Quantity
      totalQty: round2(
        items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
      ),
      totalNetWt: round2(
        items.reduce((sum, item) => sum + Number(item.totalNetWt || 0), 0),
      ),
      totalAmount: round2(
        items.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0),
      ),
      totalGSTAmount: round2(
        items.reduce((sum, item) => sum + Number(item.gstAmount || 0), 0),
      ),
      // Total Gross Amount = Sum of all item Total Amounts
      totalGrossAmount: round2(
        items.reduce((sum, item) => sum + Number(item.totalAmt || 0), 0),
      ),
    };

    return {
      items,
      orderTotals,
    };
  };

  // on form values change, recompute derived fields and set them back

  const handleExport = async () => {
    try {
      const fullData = await getPurchaseContract();

      const exportRows = [];

      fullData.forEach((record) => {
        record.items?.forEach((item) => {
          exportRows.push({
            "Supplier Name": record.vendor_name,
            "Plant Name": record.plant_name,
            "Contract Date": record.created_at, // or contract_date if exists
            "Start Date": record.from_date,
            "End Date": record.to_date,

            "Item Name": item.item_name,
            "Item Code": item.hsn_code,
            Qty: item.qty,
            "Free Qty": item.free_qty,
            "Total Qty": item.total_qty,
            UOM: item.uom,
            Rate: item.rate,

            "Discount %": item.discount_percent,
            "Gross Amount (₹)": item.gross_amount,
            "Discount Amt (₹)": item.discount_amount,

            "SGST %": item.sgst_percent,
            "CGST %": item.cgst_percent,
            "IGST %": item.igst_percent,

            "Total Amount (₹)": item.total_amount,

            "Order Total Qty": record.total_qty,
            "Total Gross Amount": record.gross_amount,
            "Total Discount (₹)": record.total_discount,
            "Total GST (₹)": record.total_gst_amount,

            Status: record.status,
          });
        });
      });

      exportToExcel(exportRows, "All_Purchase_Contract_Details", "SoudaData");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // ---------- Form submit ----------
  const handleFormSubmit = async (values) => {
    console.log("FORM VALUES", JSON.stringify(values, null, 2));
    const orderTotals = values.orderTotals || {};
    const validItems = (values.items || []).filter(
      (it) =>
        it?.item_name && Number(it.qty || 0) > 0 && Number(it.rate || 0) > 0,
    );

    const payload = {
      organisation: currentOrgId,
      vendor: values.vendor,
      company_group_id: selectedCompanyGroupId, // assuming company group is same as vendor for now
      vendor_name: values.vendor_name,
      plant: values.plant,
      plant_name: values.plant_name,
      created_date: values.soudaDate
        ? dayjs(values.soudaDate).format("YYYY-MM-DD")
        : null,

      from_date: dayjs(values.from_date).format("YYYY-MM-DD"),
      to_date: dayjs(values.to_date).format("YYYY-MM-DD"),

      total_qty: round2(orderTotals.totalQty),
      gross_amount: round2(orderTotals.totalGrossAmount),
      total_discount: 0,
      total_gst_amount: 0,
      total_amount: round2(orderTotals.totalGrossAmount),
      grand_total: round2(orderTotals.totalGrossAmount),
      totalNetWt: round2(orderTotals.totalNetWt),
      items: validItems.map((it) => ({
        product: it.product_id,
        uom: it.base_unit || null,

        qty: round2(it.qty),
        // free_qty: round2(it.freeQty),
        total_qty: round2(it.totalQty),

        rate: round2(it.rate),
        item_name: it.item_name || "",
        hsn_id: it.hsn_id || null,
        hsn_code: it.hsn_code || "",

        discount_percent: round2(it.discountPercent),
        discount_amount: round2(it.discountAmt),

        gross_amount: round2(it.grossAmount),
        net_weight: round2(it.netWt),
        sgst_percent: round2(it.sgstPercent),
        cgst_percent: round2(it.cgstPercent),
        igst_percent: round2(it.igstPercent),

        total_gst_amount: round2(it.totalGST),
        roundoff: round2(it.roundOff),
        total_amount: round2(it.totalAmt),
      })),
    };

    console.log("FINAL PAYLOAD:", payload);
    await addPurchaseContract(payload);

    await fetchPurchaseContracts();
    setIsAddModalOpen(false);
  };

  const ItemsList = ({ form, disabled = false }) => (
    <Form.List name="items">
      {(fields, { add, remove }) => {
        const handleAutoAddRow = () => {
          const items = form.getFieldValue("items") || [];

          const lastItem = items[items.length - 1];
          const nextIndex = items.length;
          if (
            lastItem?.item_name &&
            Number(lastItem?.qty) > 0 &&
            Number(lastItem?.rate) > 0 &&
            items.filter((i) => !i?.item_name && !i?.qty && !i?.rate).length ===
              0
          ) {
            add({
              lineKey: Date.now(),

              qty: 0,
              rate: 0,

              grossAmount: 0,
              gstAmount: 0,
              totalAmt: 0,
            });
            setTimeout(() => {
              setItemDropdownIndex(nextIndex);
              itemRefs.current[nextIndex]?.focus();
            }, 150);
          }
        };
        return (
          <>
            <div className="mb-2 flex justify-between items-center">
              <h6 className="text-amber-500">Items</h6>
              {/* {!disabled && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      lineKey: new Date().getTime(),
                      item: undefined,

                      qty: 0,
                      // freeQty: 0,
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
              )} */}
            </div>
            <Row gutter={12} className=" pb-2 mb-2">
              <Col span={6}>Item Name</Col>
              <Col span={2}>Qty</Col>
              <Col span={2}>Unit</Col>
              <Col span={2}>Net Wet(Ton)</Col>
              <Col span={2}>GST %</Col>
              <Col span={2}>Rate</Col>
              <Col span={2}>Amount</Col>
              <Col span={2}>GST Amount</Col>
              <Col span={1}>Ro. Off</Col>
              <Col span={2}>Total Amount</Col>
              <Col span={1}></Col>
            </Row>
            {fields.map((field, index) => (
              <div
                key={field.key}
                className=""
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
                    <Form.Item {...field} name={[field.name, "item_name"]}>
                      <Select
                        ref={(el) => (itemRefs.current[field.name] = el)}
                        showSearch
                        open={itemDropdownIndex === field.name}
                        onFocus={() => setItemDropdownIndex(field.name)}
                        onDropdownVisibleChange={(visible) => {
                          if (!visible) setItemDropdownIndex(null);
                        }}
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.children ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        placeholder={
                          !selectedVendor
                            ? "Select supplier first"
                            : "Select Item"
                        }
                        disabled={
                          !selectedVendor || products.length === 0 || disabled
                        }
                        onChange={(productId) => {
                          const selected = products.find(
                            (p) => p.id === productId,
                          );
                          const gstPercent =
                            Number(selected?.cgst || 0) +
                            Number(selected?.sgst || 0);
                          form.setFields([
                            {
                              name: ["items", field.name, "product_id"],
                              value: selected?.id,
                            },
                            {
                              name: ["items", field.name, "item_name"],
                              value: selected?.name || "",
                            },
                            {
                              name: ["items", field.name, "base_unit"],
                              value: selected?.base_unit || "",
                            },
                            {
                              name: ["items", field.name, "igstPercent"],
                              value: gstPercent,
                            },

                            // optional
                            {
                              name: ["items", field.name, "netWt"],
                              value: selected?.net_weight || 0,
                            },

                            {
                              name: ["items", field.name, "hsn_code"],
                              value: selected?.hsn_code_value || "",
                            },
                            {
                              name: ["items", field.name, "hsn_id"],
                              value: selected?.hsn_code || null,
                            },
                          ]);
                          setTimeout(() => {
                            const qtyInput =
                              qtyRefs.current[field.name]?.input ||
                              qtyRefs.current[field.name];

                            qtyInput?.focus();

                            if (qtyInput?.select) {
                              qtyInput.select();
                            }
                          }, 100);
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

                  {/* FIX: Qty with proper validation */}
                  <Col span={2}>
                    <Form.Item
                      {...field}
                      name={[field.name, "qty"]}
                      rules={[
                        {
                          validator: (_, value) =>
                            value >= 0
                              ? Promise.resolve()
                              : Promise.reject("Enter valid positive number"),
                        },
                      ]}
                    >
                      <Input
                        ref={(el) => (qtyRefs.current[field.name] = el)}
                        disabled={disabled}
                        onChange={() => {
                          const all = form.getFieldsValue();

                          const computed = computeAllFromFormValues(all || {});

                          form.setFieldsValue({
                            items: computed.items,
                            orderTotals: computed.orderTotals,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Tab") {
                            e.preventDefault();

                            const rateInput =
                              rateRefs.current[
                                field.name
                              ]?.nativeElement?.querySelector("input");

                            rateInput?.focus();
                            rateInput?.select();
                          }
                        }}
                        className="w-full!"
                      />
                    </Form.Item>
                  </Col>
                  {/* FIX: Free Qty with proper validation */}
                  {/* <Col span={4}>
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
                </Col> */}

                  <Col span={2}>
                    <Form.Item {...field} name={[field.name, "base_unit"]}>
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item name={[field.name, "totalNetWt"]}>
                      <InputNumber
                        className="w-full!"
                        disabled
                        precision={3}
                        formatter={(value) =>
                          value !== undefined
                            ? Number(value).toFixed(3)
                            : "0.000"
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item name={[field.name, "igstPercent"]}>
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  {/* FIX: Rate with proper validation */}
                  <Col span={2}>
                    <Form.Item
                      {...field}
                      name={[field.name, "rate"]}
                      fieldKey={[field.fieldKey, "rate"]}
                    >
                      <InputNumber
                        ref={(el) => (rateRefs.current[field.name] = el)}
                        onFocus={(e) => e.target.select()}
                        {...positiveNumberInputProps}
                        disabled={disabled}
                        precision={2}
                        formatter={(value) =>
                          value !== undefined && value !== null
                            ? Number(value).toFixed(2)
                            : ""
                        }
                        parser={(value) => value?.replace(/[^\d.]/g, "")}
                        onChange={() => {
                          const all = form.getFieldsValue();

                          const computed = computeAllFromFormValues(all || {});

                          form.setFieldsValue({
                            items: computed.items,
                            orderTotals: computed.orderTotals,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Tab" || e.key === "Enter") {
                            e.preventDefault();

                            handleAutoAddRow();
                          }
                        }}
                        className="w-full!"
                      />
                    </Form.Item>
                  </Col>

                  {/* FIX: Discount% with proper validation */}
                  {/* <Col span={2}>
                  <Form.Item
                    {...field}
                    label="Dis%"
                    name={[field.name, "discountPercent"]}
                    fieldKey={[field.fieldKey, "discountPercent"]}
                    rules={[
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

                        form.setFieldsValue({
                          items: computed.items,
                          orderTotals: computed.orderTotals,
                        });
                      }}
                      className="w-full!"
                    />
                  </Form.Item>
                </Col> */}
                  {/* <Col span={2}>
                  <Form.Item
                    {...field}
                    label="Discount(₹)"
                    name={[field.name, "discountAmt"]}
                    fieldKey={[field.fieldKey, "discountAmt"]}
                  >
                    <InputNumber className="w-full!" disabled />
                  </Form.Item>
                </Col> */}

                  {/* FIX: SGST% with proper validation */}

                  {/* FIX: CGST% with proper validation */}

                  {/* FIX: IGST% with proper validation */}

                  <Col span={2}>
                    <Form.Item
                      {...field}
                      name={[field.name, "grossAmount"]}
                      fieldKey={[field.fieldKey, "grossAmount"]}
                    >
                      <InputNumber
                        className="w-full!"
                        disabled
                        formatter={(value) =>
                          value !== undefined
                            ? Number(value).toFixed(2)
                            : "0.00"
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item
                      {...field}
                      name={[field.name, "gstAmount"]}
                      fieldKey={[field.fieldKey, "gstAmount"]}
                    >
                      <InputNumber
                        className="w-full!"
                        disabled
                        formatter={(value) =>
                          value !== undefined
                            ? Number(value).toFixed(2)
                            : "0.00"
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={1}>
                    <Form.Item {...field} name={[field.name, "roundOff"]}>
                      <InputNumber
                        className="w-full!"
                        disabled
                        formatter={(value) =>
                          value !== undefined
                            ? Number(value).toFixed(2)
                            : "0.00"
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item
                      {...field}
                      name={[field.name, "totalAmt"]}
                      fieldKey={[field.fieldKey, "totalAmt"]}
                    >
                      <InputNumber
                        className="w-full!"
                        disabled
                        formatter={(value) =>
                          value !== undefined
                            ? Number(value).toFixed(2)
                            : "0.00"
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={1}>
                    <Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                        disabled={disabled}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}
          </>
        );
      }}
    </Form.List>
  );
  // ---------- Combined form content (Basic Info, Items, Tax) ----------
  const RenderFormBody = ({ form, disabled = false }) => (
    <>
      <Card
        size="small"
        style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
        bodyStyle={{ padding: 12 }}
      >
        <h6 className="text-amber-500">Basic Information</h6>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Supplier Name"
              name="vendor"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select Supplier"
                showSearch
                optionFilterProp="label"
                onChange={async (vendorId) => {
                  try {
                    setSelectedVendor(vendorId);

                    const detail = await getVendorDetails(vendorId);

                    console.log("VENDOR DETAILS", detail);

                    form.setFieldsValue({
                      company_group_name: detail?.company_group_name || "",

                      plant: detail?.plants?.[0]?.id || null,

                      plant_name: detail?.plants?.[0]?.plant_name || "",
                    });

                    setSelectedCompanyGroupId(detail?.company_group_id || null);

                    // Load products using COMPANY GROUP ID
                    const productRes = await getProductsByCompany(
                      detail?.company_group_id,
                    );

                    console.log("PRODUCT RESPONSE", productRes);

                    setProducts(productRes?.products || []);
                    setTimeout(() => {
                      contractDateRef.current?.focus();
                    }, 100);
                    form.setFieldsValue({
                      company_group_name: detail?.company_group_name || "",
                      plant: detail?.plants?.[0]?.id || null,
                      plant_name: detail?.plants?.[0]?.plant_name || "",

                      items: [
                        {
                          lineKey: Date.now(),
                          qty: 0,
                          rate: 0,
                        },
                      ],
                    });
                  } catch (error) {
                    console.error(error);
                  }
                }}
                disabled={isViewModalOpen}
              >
                {vendors.map((v) => (
                  <Select.Option key={v.id} value={v.id} label={v.name}>
                    {v.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Company Group" name="company_group_name">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Plant Name" name="plant_name">
              <Input disabled />
            </Form.Item>
          </Col>
          <Form.Item name="plant" hidden>
            <Input />
          </Form.Item>
          <Col span={3}>
            <Form.Item
              label="Contract Date"
              name="soudaDate"
              initialValue={dayjs()}
            >
              <AppDatePicker
                ref={contractDateRef}
                disabledDate={(current) => {
                  // ✅ Aaj ke baad ki date disable
                  if (current && current.isAfter(dayjs(), "day")) {
                    return true;
                  }
                  // ✅ Financial year ke bahar ki date bhi disable
                  return createFinancialYearDisabledDate(selectedFY)(current);
                }}
                onTabComplete={() => {
                  setTimeout(() => validFromRef.current?.focus(), 50);
                }}
              />
            </Form.Item>
          </Col>

          {/* REMOVED Delivery Date; ADDED Start / End */}
          <Col span={3}>
            <Form.Item
              label="Valid From"
              name="from_date"
              initialValue={dayjs()}
            >
              <AppDatePicker
                ref={validFromRef}
                disabledDate={createFinancialYearDisabledDate(selectedFY)}
                onTabComplete={() => {
                  setTimeout(() => validToRef.current?.focus(), 50); // ← was validFromRef
                }}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Valid To"
              name="to_date"
              initialValue={dayjs()}
              rules={[
                {
                  validator: (_, value) => {
                    const fromDate = form.getFieldValue("from_date");
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
                  const fromDate = form.getFieldValue("from_date");
                  if (
                    fromDate &&
                    current &&
                    current.isBefore(dayjs(fromDate), "day")
                  ) {
                    return true;
                  }
                  return createFinancialYearDisabledDate(selectedFY)(current);
                }}
                onTabComplete={() => {
                  setTimeout(() => {
                    setItemDropdownIndex(0);
                    itemRefs.current[0]?.focus();
                  }, 50);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select Status"
                disabled={disabled || isAddModalOpen}
              >
                {statusOptions.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        size="small"
        style={{ marginBottom: 12, border: "1px solid #FDE68A" }}
        bodyStyle={{ padding: 12 }}
      >
        <ItemsList form={form} disabled={disabled} />
      </Card>

      {/* Optional order-level totals display (read-only) */}
      <Card
        size="small"
        style={{ border: "1px solid #FDE68A" }}
        bodyStyle={{ padding: 12 }}
      >
        {/* <h6 className="text-amber-500">Totals</h6> */}
        <Row gutter={12}>
          <Col span={6}>
            <span className="text-amber-700 font-bold text-2xl">
              Gross Total
            </span>
          </Col>
          <Col span={2}>
            <Form.Item name={["orderTotals", "totalQty"]}>
              <InputNumber disabled className="w-full!" />
            </Form.Item>
          </Col>
          <Col span={2}></Col>
          <Col span={2}>
            <Form.Item name={["orderTotals", "totalNetWt"]}>
              <InputNumber
                className="w-full!"
                disabled
                precision={3}
                formatter={(value) =>
                  value !== undefined ? Number(value).toFixed(3) : "0.000"
                }
              />
            </Form.Item>
          </Col>
          <Col span={2}></Col>
          <Col span={2}></Col>

          <Col span={2}>
            <Form.Item name={["orderTotals", "totalAmount"]}>
              <InputNumber
                className="w-full!"
                disabled
                formatter={(value) =>
                  value !== undefined ? Number(value).toFixed(2) : "0.00"
                }
              />
            </Form.Item>
          </Col>

          <Col span={2}>
            <Form.Item name={["orderTotals", "totalGSTAmount"]}>
              <InputNumber
                className="w-full!"
                disabled
                formatter={(value) =>
                  value !== undefined ? Number(value).toFixed(2) : "0.00"
                }
              />
            </Form.Item>
          </Col>
          <Col span={1}></Col>

          <Col span={2}>
            <Form.Item name={["orderTotals", "totalGrossAmount"]}>
              <InputNumber
                className="w-full!"
                disabled
                formatter={(value) =>
                  value !== undefined ? Number(value).toFixed(2) : "0.00"
                }
              />
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
            onClick={handleExport}
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
              // initialize an empty item row
              addForm.setFieldsValue({
                status: "Pending",
                items: [
                  {
                    lineKey: new Date().getTime(),
                    item: undefined,

                    qty: 0,
                    // freeQty: 0,
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
                orderTotals: {
                  totalQty: 0,
                  totalGrossAmount: 0,
                },
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
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Contract Records
        </h2>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          rowKey="key"
          scroll={{ y: 300 }}
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span className="text-amber-700 text-2xl font-semibold">
              Add New Purchase Contract{" "}
            </span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          addForm.resetFields();

          setIsAddModalOpen(false);
        }}
        footer={null}
        width={1600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={(vals) => handleFormSubmit(vals, "add")}
        >
          <RenderFormBody form={addForm} disabled={false} />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => setIsAddModalOpen(false)}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! border-none!"
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
            Edit Purchase Contract
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          editForm.resetFields();
          setIsEditModalOpen(false);
        }}
        footer={null}
        width={1600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit} // ✅ THIS IS WHERE YOU ADD
        >
          <RenderFormBody form={editForm} disabled={false} />

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>

            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! border-none"
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
            View Purchase Contract
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => {
          viewForm.resetFields();
          setIsViewModalOpen(false);
        }}
        footer={null}
        width={1600}
      >
        <Form form={viewForm} layout="vertical">
          <RenderFormBody form={viewForm} disabled={true} />
        </Form>
      </Modal>
    </div>
  );
}
