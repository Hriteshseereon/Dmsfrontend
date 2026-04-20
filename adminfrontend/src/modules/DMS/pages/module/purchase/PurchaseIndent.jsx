import React, { useState, useEffect, useRef } from "react";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import {
  getPurchaseOrder,
  getPurchaseContract,
  getSoudaByContractId,
  addPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  getAllSalesOrder,
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
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  savePurchaseDraft,
  deletePurchaseDraft,
  getAllPurchaseDrafts,
} from "../../../../../utils/purchaseDraftUtils";

const { Option } = Select;

export default function PurchaseIndent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [soudaContracts, setSoudaContracts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contractItems, setContractItems] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [activeDraftId, setActiveDraftId] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  const statusOptions = ["Pending", "Approved", "Rejected"];
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  useEffect(() => {
    fetchPurchaseOrder();
    fetchSoudaNoOptions();
    loadDraftsList();
  }, []);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const loadDraftsList = () => {
    const allDrafts = getAllPurchaseDrafts("order");
    setDrafts(allDrafts);
  };

  const handleManualSaveDraft = () => {
    const values = addForm.getFieldsValue(true);
    if (!values || Object.keys(values).length === 0) return;
    const draftId = activeDraftId || `purchase-order-${Date.now()}`;
    savePurchaseDraft(draftId, values, "order");
    setActiveDraftId(draftId);
    loadDraftsList();
  };

  const handleAutoSaveDraft = (allValues) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      const draftId = activeDraftId || `purchase-order-${Date.now()}`;
      savePurchaseDraft(draftId, allValues, "order");
      setActiveDraftId(draftId);
    }, 1500);
  };

  const handleContinueDraft = (draft) => {
    addForm.setFieldsValue(draft);
    setActiveDraftId(draft.id);
    setIsAddModalOpen(true);
    setShowDrafts(false);
  };

  const handleDeleteDraft = (draftId) => {
    deletePurchaseDraft(draftId, "order");
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
    loadDraftsList();
  };

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);

      const res = await getPurchaseOrder();

      // adjust if API response is wrapped (res.data)
      const list = res?.data || res;

      const formattedData = list.map((item, index) => ({
        key: item.id || index + 1,
        contract: item.contract,
        plant_name: item.plant_name,
        order_number: item.order_number,
        vendor_name: item.vendor_name,
        total_qty_all_items: item.total_qty_all_items || 0,
        grand_total: item.grand_total || item.total_amount || 0, // 🔥 ADD THIS
        status: item.status || "Pending",
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Failed to fetch purchase orders", error);
      message.error("Failed to load purchase indents");
    } finally {
      setLoading(false);
    }
  };
  const round2 = (num) => Number((num || 0).toFixed(2));

  const fetchSoudaNoOptions = async () => {
    try {
      const res = await getPurchaseContract();
      const list = res?.data || res;
      setSoudaContracts(list);
      console.log("Souda API Response:", list);
    } catch (err) {
      message.error("Failed to load souda numbers");
    }
  };

  const fetchSalesOrderOptions = async (vendorId) => {
    try {
      const res = await getAllSalesOrder(vendorId);
      const list = res?.data || res;
      setSalesOrders(list);
    } catch (err) {
      message.error("Failed to load sales orders");
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

  const handleSoudaSelect = async (
    contractId,
    formInstance,
    existingItems = [],
  ) => {
    if (!contractId) return;

    try {
      const res = await getSoudaByContractId(contractId);
      const data = res?.data || res;

      setContractItems(data.items || []);
      fetchSalesOrderOptions(data.vendor);
      // Merge existing items if provided
      const itemsToSet = existingItems.length
        ? existingItems.map((it) => ({
            ...it,
            uom: it.uom_details?.unit_name || it.uom,
          }))
        : [{}]; // keep one empty row

      formInstance.setFieldsValue({
        vendor: data.vendor,
        vendorName: data.vendor_name,
        plantName: data.plant_name,
        deliveryAddress: data.delivery_address,
        items: itemsToSet, // ✅ keep existing items
      });
    } catch (err) {
      message.error("Failed to load souda details");
    }
  };

  const recalcAll = (formInstance) => {
    if (!formInstance) return;

    const values = formInstance.getFieldsValue(true);
    const items = values.items || [];

    let totalIndentQty = 0;
    let taxableAmount = 0;

    const updatedItems = items.map((item) => {
      const qty = Number(item?.qty || 0);
      //  const freeQty = Number(item?.freeQty || 0);
      const rate = Number(item?.rate || 0);
      const discountPercent = Number(item?.discountPercent || 0);

      //  const totalQty = qty + freeQty;
      const totalQty = qty;
      const grossAmount = round2(qty * rate);
      const discountAmt = round2((grossAmount * discountPercent) / 100);
      const itemTaxable = round2(grossAmount - discountAmt);

      totalIndentQty += totalQty;
      taxableAmount += itemTaxable;

      return {
        ...item,
        totalQty,
        grossAmount,
        discountAmt,
      };
    });

    taxableAmount = round2(taxableAmount);

    const sgstPercent = Number(values.sgstPercent || 0);
    const cgstPercent = Number(values.cgstPercent || 0);
    const igstPercent = Number(values.igstPercent || 0);
    const tcsAmt = Number(values.tcsAmt || 0);

    const sgst = round2((taxableAmount * sgstPercent) / 100);
    const cgst = round2((taxableAmount * cgstPercent) / 100);
    const igst = round2((taxableAmount * igstPercent) / 100);

    const totalGST = round2(sgst + cgst + igst);
    const totalAmt = round2(taxableAmount + totalGST + tcsAmt);

    formInstance.setFieldsValue({
      items: updatedItems,
      totalQty: totalIndentQty,
      sgst,
      cgst,
      igst,
      totalGST,
      tcsAmt: round2(tcsAmt),
      totalAmt,
    });
  };

  const handleExport = async () => {
    try {
      const res = await getPurchaseOrder();
      const list = res?.data || res;

      const exportRows = [];

      for (const order of list) {
        // get full details for each order
        const detailRes = await getPurchaseOrderById(order.id || order.key);
        const data = detailRes?.data || detailRes;

        data.items?.forEach((item) => {
          exportRows.push({
            "Order No": data.order_number,
            "Plant Name": data.plant_name,
            "Supplier Name": data.vendor_name,

            "Order Date": data.order_date,
            "Expected Receiving Date": data.expected_receiving_date,
            Status: data.status,
            "Delivery Address": data.delivery_address,

            "Item Name": item.item_name,
            "Item Code": item.hsn_code,
            Qty: item.qty,
            "Free Qty": item.free_qty,
            "Total Qty": Number(item.qty || 0) + Number(item.free_qty || 0),
            UOM: item.uom_details?.unit_name,
            Rate: item.rate,
            "Discount %": item.discount_percent,
            "Discount Amt": item.discount_amount,
            "Gross Amount": item.gross_amount,
            "Gross Weight": item.gross_weight,

            "Total Qty (All Items)": data.total_qty_all_items,
            "SGST %": data.sgst,
            "CGST %": data.cgst,
            "IGST %": data.igst,
            "Total GST (₹)": data.total_gst_amount,
            "TCS Amt (₹)": data.tcs_amount,
            "Total Amount (₹)": data.grand_total || data.total_amount,
          });
        });
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

  const handleFormSubmit = async (values, type) => {
    try {
      const selectedSalesOrders = salesOrders.filter((so) =>
        values.saleorderNo?.includes(so.id),
      );

      const sales_orders = selectedSalesOrders.map((so) => so.id);

      const sales_order_details = [];

      selectedSalesOrders.forEach((so) => {
        so.matching_items?.forEach((item) => {
          sales_order_details.push({
            sales_order_id: so.id,
          });
        });
      });
      const selectedContract = soudaContracts.find(
        (c) => c.id === values.contract,
      );

      const taxableAmount =
        values.items?.reduce((sum, item) => {
          const gross = Number(item.grossAmount || 0);
          const discount = Number(item.discountAmt || 0);
          return sum + (gross - discount);
        }, 0) || 0;

      const sgst = round2(
        (taxableAmount * Number(values.sgstPercent || 0)) / 100,
      );
      const cgst = round2(
        (taxableAmount * Number(values.cgstPercent || 0)) / 100,
      );
      const igst = round2(
        (taxableAmount * Number(values.igstPercent || 0)) / 100,
      );

      const totalGST = round2(sgst + cgst + igst);
      const totalAmt = round2(
        taxableAmount + totalGST + Number(values.tcsAmt || 0),
      );

      const payload = {
        contract: values.contract,
        vendor: selectedContract?.vendor,
        souda_no: selectedContract?.contract_number,
        sales_orders: sales_orders, // ✅ ADD
        sales_order_details: sales_order_details, // ✅ ADD
        plant_name: values.plantName || "",
        plant_display_name: values.plantName || "",
        delivery_address: values.deliveryAddress || "",

        order_date: values.order_date?.format("YYYY-MM-DD"),
        expected_receiving_date:
          values.expected_receiving_date?.format("YYYY-MM-DD"),

        status: values.status || "Fresh",

        total_qty_all_items: Number(values.totalQty || 0),

        sgst: Number(values.sgstPercent || 0),
        cgst: Number(values.cgstPercent || 0),
        igst: Number(values.igstPercent || 0),

        total_gst_amount: totalGST,
        total_amount: totalAmt,
        grand_total: totalAmt,

        tcs_amount: Number(values.tcsAmt || 0),

        items: values.items.map((it) => ({
          product: it.product,
          item_name: it.item,
          item_code: it.hsn_code,
          rate: Number(it.rate),
          qty: Number(it.qty),
          // free_qty: Number(it.freeQty),
          discount_percent: Number(it.discountPercent),
          discount_amount: Number(it.discountAmt),
          gross_amount: Number(it.grossAmount),
          gross_weight: Number(it.grossWt),

          uom_details: {
            type: "base",
            unit_name: it.uom,
            factor_to_base: "1",
          },
        })),
      };
      console.log("Purchase Order Payload:", payload);
      // 🔥 API CALL
      if (type === "edit") {
        await updatePurchaseOrder(selectedRecord.id, payload);
        message.success("Purchase order updated successfully");
        setIsEditModalOpen(false);
      } else {
        await addPurchaseOrder(payload);
        if (activeDraftId) {
          deletePurchaseDraft(activeDraftId, "order");
          setActiveDraftId(null);
          loadDraftsList();
        }
        message.success("Purchase order created successfully");
        setIsAddModalOpen(false);
      }

      fetchPurchaseOrder();
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
    }
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "order_number",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Plant</span>,
      dataIndex: "plant_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Supplier</span>,
      dataIndex: "vendor_name",
      width: 150,
      render: (t) => <span className="text-amber-800">{t}</span>,
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
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved")
          return (
            <span className={`${base} bg-green-100 text-green-700`}>
              {status}
            </span>
          );
        if (status === "Pending")
          return (
            <span className={`${base} bg-yellow-100 text-yellow-700`}>
              {status}
            </span>
          );
        return (
          <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 120,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => handleView(record)}
          />
          {record.status !== "Approved" && (
            <EditOutlined
              className="cursor-pointer! text-red-500!"
              onClick={() => handleEdit(record)}
            />
          )}
        </div>
      ),
    },
  ];

  const handleView = async (record) => {
    try {
      setLoading(true);
      const res = await getPurchaseOrderById(record.key);
      const data = res?.data || res;

      // Load contract items
      await handleSoudaSelect(data.contract, viewForm, data.items);

      const formattedData = {
        contract: data.contract,
        vendorName: data.vendor_name,
        plantName: data.plant_name,
        deliveryAddress: data.delivery_address,
        status: data.status,
        saleorderNo: data.sales_orders || [],
        order_date: data.order_date ? dayjs(data.order_date) : null,
        expected_receiving_date: data.expected_receiving_date
          ? dayjs(data.expected_receiving_date)
          : null,
        items: data.items?.map((it) => ({
          product: it.product,
          hsn_code: it.hsn_code,
          rate: it.rate,
          qty: it.qty,
          // freeQty: it.free_qty,
          totalQty: Number(it.qty || 0) + Number(it.free_qty || 0),
          discountPercent: it.discount_percent,
          discountAmt: it.discount_amount,
          grossAmount: it.gross_amount,
          grossWt: it.gross_weight,
          uom: it.uom_details?.unit_name,
        })),
        totalQty: data.total_qty_all_items || 0,
        sgstPercent: data.sgst || 0,
        cgstPercent: data.cgst || 0,
        igstPercent: data.igst || 0,
        totalGST: data.total_gst_amount || 0,
        tcsAmt: data.tcs_amount || 0,
        totalAmt: data.grand_total || data.total_amount || 0,
      };

      viewForm.setFieldsValue(formattedData);

      // recalc just in case
      setTimeout(() => recalcAll(viewForm), 0);

      setSelectedRecord(data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase order details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);

      // 🔥 Ensure souda list is loaded first
      if (!soudaContracts.length) {
        await fetchSoudaNoOptions();
      }

      const res = await getPurchaseOrderById(record.key);
      const data = res?.data || res;
      // 🔥 ALSO load contract items for that souda, pass existing items
      await handleSoudaSelect(data.contract, editForm, data.items);

      const formattedData = {
        contract: data.contract,
        vendorName: data.vendor_name,
        vendorId: data.vendor, // ✅ Add vendor ID for API
        plantName: data.plant_name,
        deliveryAddress: data.delivery_address,
        status: data.status,
        saleorderNo: data.sales_orders || [],
        order_date: data.order_date ? dayjs(data.order_date) : null,
        expected_receiving_date: data.expected_receiving_date
          ? dayjs(data.expected_receiving_date)
          : null,
        items: data.items?.map((it) => ({
          product: it.product,
          hsn_code: it.hsn_code,
          rate: it.rate,
          qty: it.qty,
          maxQty: it.qty,
          //freeQty: it.free_qty,
          totalQty: Number(it.qty || 0) + Number(it.free_qty || 0),
          discountPercent: it.discount_percent,
          discountAmt: it.discount_amount,
          grossAmount: it.gross_amount,
          grossWt: it.gross_weight,
          uom: it.uom_details?.unit_name,
        })),
        // ✅ Add these for Tax & Charges
        totalQty: data.total_qty_all_items || 0,
        sgstPercent: data.sgst || 0,
        cgstPercent: data.cgst || 0,
        igstPercent: data.igst || 0,
        totalGST: data.total_gst_amount || 0,
        tcsAmt: data.tcs_amount || 0,
        totalAmt: data.grand_total || data.total_amount || 0,
      };

      editForm.setFieldsValue(formattedData);
      viewForm.setFieldsValue(formattedData);
      setTimeout(() => {
        console.log("FORM VALUES:", editForm.getFieldsValue());
      }, 500);

      setSelectedRecord(data);
      setIsEditModalOpen(true);
    } catch (err) {
      message.error("Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  };

  // Render form fields (used by Add/Edit/View). When soudaNo is selected, items are prefilled and user can add/remove entries.
  const renderFormFields = (formInstance, disabled = false) => (
    <>
      <h6 className=" text-amber-500 ">Basic Information</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label="Contract No"
            name="contract" // store contract ID
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Contract No"
              options={soudaContracts.map((c) => ({
                label: c.souda_number,
                value: c.id,
              }))}
              onChange={(contractId) =>
                handleSoudaSelect(contractId, formInstance)
              }
              disabled={disabled || isEditModalOpen || isViewModalOpen}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Plant Name" name="plantName">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Supplier Name" name="vendorName">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Order Date" name="order_date">
            <DatePicker className="w-full" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label="Expected Receiving Date"
            name="expected_receiving_date"
            rules={[{ required: true }]}
          >
            <DatePicker
              className="w-full"
              disabled={disabled}
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Status" name="status">
            <Select disabled={disabled}>
              {statusOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="CRN No" name="saleorderNo">
            <Select
              mode="multiple"
              placeholder="Select CRN No"
              allowClear
              showSearch
              disabled={disabled}
              listHeight={150}
              options={salesOrders.map((c) => ({
                label: c.order_number,
                value: c.id,
              }))}
            ></Select>
          </Form.Item>
        </Col>
      </Row>

      <h6 className=" text-amber-500 mt-4">Item & Pricing Details</h6>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div
                key={field.key}
                className="border border-amber-200 rounded-lg p-3 mb-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-amber-700">
                    Item {index + 1}
                  </span>
                  {/* {!disabled && (
                    <div>
                      {fields.length > 1 && (
                        <Button
                          type="link"
                          danger
                          onClick={() => {
                            remove(field.name);
                            setTimeout(() => recalcAll(formInstance), 0);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )} */}
                </div>

                <Row gutter={24}>
                  <Form.Item
                    {...field}
                    label="Item Name"
                    name={[field.name, "product"]} // store PRODUCT ID
                    rules={[{ required: true }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select Item"
                      disabled={disabled}
                      onChange={(productId) => {
                        const selected = contractItems.find(
                          (i) => i.product === productId,
                        );

                        if (!selected) return;

                        const currentItems =
                          formInstance.getFieldValue("items");

                        currentItems[field.name] = {
                          ...currentItems[field.name],
                          product: selected.product, // ID
                          item_name: selected.item_name, // name
                          hsn_code: selected.hsn_code, // HSN
                          rate: Number(selected.rate || 0),
                          qty: Number(selected.qty || 0),
                          maxQty: Number(selected.qty || 0), // ✅ ADD THIS

                          // freeQty: Number(selected.free_qty || 0),
                          uom: selected.uom_details?.unit_name,
                          discountPercent: Number(
                            selected.discount_percent || 0,
                          ),
                        };

                        formInstance.setFieldsValue({
                          items: currentItems,
                        });

                        setTimeout(() => recalcAll(formInstance), 0);
                      }}
                    >
                      {contractItems.map((it) => (
                        <Option key={it.product} value={it.product}>
                          {it.item_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Item Code"
                      name={[field.name, "hsn_code"]}
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Qty"
                      name={[field.name, "qty"]}
                      className="w-full"
                      rules={[
                        { required: true, message: "Quantity is required" },

                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              value === undefined ||
                              value === null ||
                              value === ""
                            ) {
                              return Promise.resolve();
                            }

                            // ✅ Check if NOT a number
                            if (isNaN(value)) {
                              return Promise.reject(
                                new Error("Enter valid positive number"),
                              );
                            }

                            const numericValue = Number(value);

                            // ✅ Negative check
                            if (numericValue < 0) {
                              return Promise.reject(
                                new Error("Enter valid positive number"),
                              );
                            }

                            const maxQty =
                              Number(
                                getFieldValue(["items", field.name, "maxQty"]),
                              ) || 0;

                            if (numericValue > maxQty) {
                              message.warning(
                                `You cannot enter more than ${maxQty}`,
                              );
                              return Promise.reject(
                                new Error(
                                  `Maximum allowed quantity is ${maxQty}`,
                                ),
                              );
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  {/* <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Free Qty"
                      name={[field.name, "freeQty"]}
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
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col> */}

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Total Qty"
                      name={[field.name, "totalQty"]}
                    >
                      <InputNumber className="w-full! bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="UOM"
                      name={[field.name, "uom"]} // ✅ match handleEdit mapping
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Rate"
                      name={[field.name, "rate"]}
                    >
                      <InputNumber
                        className="w-full! bg-gray-50"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Discount %"
                      name={[field.name, "discountPercent"]}
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
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Discount Amt"
                      name={[field.name, "discountAmt"]}
                    >
                      <InputNumber className="w-full! bg-gray-50" disabled />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Gross Amount"
                      name={[field.name, "grossAmount"]}
                    >
                      <InputNumber className="w-full! bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Gross Weight"
                      name={[field.name, "grossWt"]}
                      rules={[
                        { required: true, message: "Gross Weight is required" },
                        {
                          validator: (_, value) =>
                            value >= 0
                              ? Promise.resolve()
                              : Promise.reject("Enter valid positive number"),
                        },
                      ]}
                    >
                      <Input className="w-full" disabled={disabled} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}

            {/* {!disabled && (
              <Button
                type="dashed"
                onClick={() => {
                  add({});
                  setTimeout(() => recalcAll(formInstance), 0);
                }}
                block
                icon={<PlusOutlined />}
              >
                Add Another Item
              </Button>
            )} */}
          </>
        )}
      </Form.List>

      <h6 className=" text-amber-500 mt-4">Tax, Charges & Others</h6>
      <Row gutter={12}>
        <Col span={4}>
          <Form.Item label="Total Qty (All Items)" name="totalQty">
            <InputNumber className="w-full! bg-gray-50" disabled />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label="GST %"
            name="igstPercent"
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
              className="w-full"
              disabled={disabled}
              onChange={(e) => {
                const igst = Number(e.target.value || 0);
                const half = igst / 2;

                formInstance.setFieldsValue({
                  sgstPercent: half,
                  cgstPercent: half,
                });

                recalcAll(formInstance);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label="SGST %"
            name="sgstPercent"
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
              className="w-full"
              disabled
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label="CGST %"
            name="cgstPercent"
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
              className="w-full"
              disabled
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="Total GST (₹)" name="totalGST">
            <InputNumber className="w-full! bg-gray-50" disabled />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label="TCS Amt (₹)"
            name="tcsAmt"
            rules={[
              { required: true, message: "TCS Amount is required" },
              {
                validator: (_, value) =>
                  value >= 0
                    ? Promise.resolve()
                    : Promise.reject("Enter valid positive number"),
              },
            ]}
          >
            <Input
              className="w-full"
              disabled={disabled}
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="Total Amount (₹)" name="totalAmt">
            <InputNumber className="w-full! bg-gray-50" disabled />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600! " />}
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
              // addForm.setFieldsValue({ order_date: dayjs(), items: [] });
              addForm.setFieldsValue({ order_date: dayjs(), items: [{}] });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-amber-700">
            Purchase Order Drafts
          </h3>
          <Button
            type="primary"
            onClick={() => setShowDrafts(!showDrafts)}
            className="!bg-amber-500 !hover:bg-amber-600"
          >
            {showDrafts ? "Hide Drafts" : "Show Drafts"}
          </Button>
        </div>
        {showDrafts && (
          <div className="border border-amber-300 rounded-lg p-4 bg-white">
            {drafts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No drafts found</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {draft.vendorName || "Purchase Order Draft"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {draft.savedAt
                          ? new Date(draft.savedAt).toLocaleString()
                          : "Unknown time"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleContinueDraft(draft)}
                        className="bg-amber-500! hover:bg-amber-600!"
                      >
                        Continue
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => handleDeleteDraft(draft.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Purchase Order Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your purchase Order data</p>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 260 }}
          rowKey="key"
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span className="text-amber-700 text-2xl font-semibold">
              Add New Purchase Order{" "}
              {activeDraftId && (
                <span className="text-sm text-blue-500">(Draft)</span>
              )}
            </span>
            <Button
              size="small"
              onClick={handleManualSaveDraft}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Save Draft
            </Button>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setActiveDraftId(null);
          setIsAddModalOpen(false);
        }}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(vals) => handleFormSubmit(vals, "add")}
          onValuesChange={(_changed, allValues) => {
            if (isAddModalOpen) {
              handleAutoSaveDraft(allValues || {});
            }
          }}
        >
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(addForm, false)}
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500 border-none"
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
            Edit Purchase Order
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(vals) => handleFormSubmit(vals, "edit")}
        >
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(editForm, false)}
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
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
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            View Purchase Order
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}
