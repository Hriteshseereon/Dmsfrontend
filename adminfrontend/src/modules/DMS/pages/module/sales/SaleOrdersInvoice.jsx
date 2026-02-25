// SaleOrdersInvoice.jsx
import React, { useState, useEffect } from "react";
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
  Space,
  message,
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
  getContractpersonName,
  getContractDetailsbyPerson,
  salesContractItems,
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  getCustomersByOrganisation,
  getAllSalesContracts,
} from "../../../../../api/sales";
import { getAdminCustomerDetails } from "../../../../../api/customer";
/* ------------------ data (use your salesOrderJSON) ------------------ */
const salesOrderJSON = {
  initialData: [
    {
      key: 1,
      soudaNo: "SOUDA-001",
      companyName: "ABC Oils Ltd",
      customerName: "Bhubaneswar Market",
      customerEmail: "contact@bhubaneswarmarket.com",
      orderDate: "2025-10-01",
      deliveryAddress: "Plot 12, Industrial Estate, Bhubaneswar, Odisha",
      deliveryDate: "2025-10-05",
      depoName: "Depo A",
      brokerName: "Broker 1",
      saleType: "Local",
      transporter: "Blue Transport",
      vehicleNo: "OD-05-AB-1234",
      driverName: "Rajesh Kumar",
      phoneNo: "9876543210",
      route: "Bhubaneswar to Cuttack",
      billType: "Tax Invoice",
      waybillNo: "WB-001",
      billMode: "Credit",
      uom: "Ltrs",
      status: "Approved",
      location: "Warehouse A",
      type: "Retail",
      contracts: [
        {
          contractNo: "CNT-001",
          items: [
            {
              lineKey: 1,
              item: "Mustard Oil",
              itemCode: "ITM001",
              uom: "Ltrs",
              qty: 2000,
              freeQty: 100,
              totalQty: 2100,
              grossWt: 2100,
              totalGrossWt: 2100,
              rate: 125,
              amount: 2000 * 125,
              discountPercent: 5,
              discountAmt: Math.round((2000 * 125 * 5) / 100),
              totalAmount: Math.round(2000 * 125 - (2000 * 125 * 5) / 100),
            },
            {
              lineKey: 2,
              item: "Sunflower Oil",
              itemCode: "ITM002",
              uom: "Ltrs",
              qty: 500,
              freeQty: 0,
              totalQty: 500,
              grossWt: 500,
              totalGrossWt: 500,
              rate: 95,
              amount: 500 * 95,
              discountPercent: 2,
              discountAmt: Math.round((500 * 95 * 2) / 100),
              totalAmount: Math.round(500 * 95 - (500 * 95 * 2) / 100),
            },
          ],
        },
        {
          contractNo: "CNT-002",
          items: [
            {
              lineKey: 3,
              item: "Coconut Oil",
              itemCode: "ITM003",
              uom: "Ltrs",
              qty: 300,
              freeQty: 0,
              totalQty: 300,
              grossWt: 300,
              totalGrossWt: 300,
              rate: 150,
              amount: 300 * 150,
              discountPercent: 0,
              discountAmt: 0,
              totalAmount: 45000,
            },
          ],
        },
      ],
      orderTaxAndTotals: {
        grossAmountTotal: 342500,
        discountTotal: 13450,
        taxableAmount: 329050,
        sgstPercent: 5,
        cgstPercent: 5,
        igstPercent: 0,
        sgst: 16452,
        cgst: 16452,
        igst: 0,
        totalGST: 32905,
        tcsAmt: 500,
        grandTotal: 362455,
      },
      orderTotals: {
        qtyTotal: 2800,
        freeQtyTotal: 100,
        totalQty: 2900,
      },
    },
  ],
  itemOptions: [
    { name: "Mustard Oil", code: "ITM001" },
    { name: "Sunflower Oil", code: "ITM002" },
    { name: "Coconut Oil", code: "ITM003" },
  ],
  uomOptions: ["Ltrs", "Kg"],
  statusOptions: ["Approved", "Pending", "Rejected"],
  typeOptions: ["Retail", "Wholesale"],
  locationOptions: ["Warehouse A", "Warehouse B", "Warehouse C"],
  depoOptions: ["Depo A", "Depo B", "Depo C"],
  brokerOptions: ["Broker 1", "Broker 2", "Broker 3"],
  saleTypeOptions: ["Local", "Interstate"],
  billTypeOptions: ["Tax Invoice", "Retail Invoice"],
  billModeOptions: ["Credit", "Cash"],
  transporterOptions: ["Blue Transport", "Green Express", "Fast Logistics"],
  routeOptions: [
    "Bhubaneswar to Cuttack",
    "Cuttack to Puri",
    "Puri to Bhubaneswar",
    "Bhubaneswar to Rourkela",
  ],
  soudaOptions: [
    {
      soudaNo: "SOUDA-001",
      companyName: "ABC Oils Ltd",
      customerName: "Bhubaneswar Market",
      items: [
        { item: "Mustard Oil", itemCode: "ITM001", rate: 125, uom: "Ltrs" },
      ],
    },
    {
      soudaNo: "SOUDA-002",
      companyName: "XYZ Oils Ltd",
      customerName: "Cuttack Market",
      items: [
        { item: "Sunflower Oil", itemCode: "ITM002", rate: 135, uom: "Ltrs" },
      ],
    },
  ],
};

/* ------------------ component ------------------ */
export default function SaleOrdersInvoice() {
  const [data, setData] = useState(salesOrderJSON.initialData);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [contractPersonOptions, setContractPersonOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  // const [contractItems, setContractItems] = useState([]);
  const [contractItemsMap, setContractItemsMap] = useState({});

  /* ---------- search filter ---------- */
  const fetchContractPersons = async () => {
    try {
      const res = await getCustomersByOrganisation();
      console.log("Contract persons (Customers) fetched:", res);
      setContractPersonOptions(res);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  useEffect(() => {
    fetchContractPersons();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await getAllSalesContracts();
      console.log("Fetched All Sales Contracts:", res);
      setContractOptions(res || []);
    } catch (err) {
      console.error("Failed to fetch all sales contracts:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // filtering keys (customerName rather than customer)
  const filteredData = data.filter((d) =>
    ["companyName", "customerName", "status"].some((k) =>
      (d[k] || "").toString().toLowerCase().includes(searchText.toLowerCase()),
    ),
  );

  /* ---------- utilities: compute item and order totals ---------- */
  const computeOrderTotalsFromContracts = (contracts = [], orderTax = {}) => {
    const allItems = [];
    contracts.forEach((c) => {
      (c.items || []).forEach((it) => allItems.push(it));
    });

    const grossAmountTotal = allItems.reduce(
      (s, it) => s + Number(it.amount || 0),
      0,
    );
    const discountTotal = allItems.reduce(
      (s, it) => s + Number(it.discountAmt || 0),
      0,
    );
    const taxableAmount = grossAmountTotal - discountTotal;

    const sgstPercent = Number(orderTax.sgstPercent || 0);
    const cgstPercent = Number(orderTax.cgstPercent || 0);
    const igstPercent = Number(orderTax.igstPercent || 0);
    const tcsAmt = Number(orderTax.tcsAmt || 0);

    const sgst = Math.round((taxableAmount * sgstPercent) / 100);
    const cgst = Math.round((taxableAmount * cgstPercent) / 100);
    const igst = Math.round((taxableAmount * igstPercent) / 100);
    const totalGST = sgst + cgst + igst;
    const grandTotal = Math.round(taxableAmount + totalGST + tcsAmt);

    const qtyTotal = allItems.reduce((s, it) => s + Number(it.qty || 0), 0);
    const freeQtyTotal = allItems.reduce(
      (s, it) => s + Number(it.freeQty || 0),
      0,
    );

    return {
      orderTaxAndTotals: {
        grossAmountTotal,
        discountTotal,
        taxableAmount,
        sgstPercent,
        cgstPercent,
        igstPercent,
        sgst,
        cgst,
        igst,
        totalGST,
        tcsAmt,
        grandTotal,
      },
      orderTotals: {
        qtyTotal,
        freeQtyTotal,
        totalQty: qtyTotal + freeQtyTotal,
      },
      items: allItems,
    };
  };

  /* ---------- when form values change (add/edit) ---------- */
  const onFormValuesChange = (form, allValues) => {
    // compute per-item fields for any item changed
    const contracts = (allValues.contracts || []).map((c, ci) => {
      const items = (c.items || []).map((it, ii) => {
        const qty = Number(it.qty || 0);
        const freeQty = Number(it.freeQty || 0);
        const rate = Number(it.rate || 0);
        const discountPercent = Number(it.discountPercent || 0);
        const amount = Math.round(qty * rate);
        const discountAmt = Math.round((amount * discountPercent) / 100);
        const totalAmount = Math.round(amount - discountAmt);
        const totalQty = qty + freeQty;
        const totalGrossWt = Number(it.grossWt || 0);
        return {
          ...it,
          amount,
          discountAmt,
          totalAmount,
          totalQty,
          totalGrossWt,
        };
      });
      return { ...c, items };
    });

    const { orderTaxAndTotals, orderTotals } = computeOrderTotalsFromContracts(
      contracts,
      allValues.orderTaxAndTotals || {},
    );

    // set computed fields back into the form
    form.setFieldsValue({
      contracts,
      orderTaxAndTotals,
      orderTotals,
    });
  };
const handleStatusChange = async (value, form) => {
  // call API
  const res = await getTaxByStatus(value); // your API

  form.setFieldsValue({
    orderTaxAndTotals: {
      sgstPercent: res.sgst,
      cgstPercent: res.cgst,
      igstPercent: res.igst,
      tcsAmt: res.tcs,
    },
  });
};
  /* ---------- Add handlers ---------- */
  const openAddModal = () => {
    addForm.resetFields();
    // initialize with one contract + one item row to help user
    addForm.setFieldsValue({
      contracts: [
        {
          contractNo: undefined,
          items: [
            {
              lineKey: Date.now(),
              item: undefined,
              itemCode: undefined,
              uom: undefined,
              qty: 0,
              freeQty: 0,
              totalQty: 0,
              grossWt: 0,
              totalGrossWt: 0,
              rate: 0,
              amount: 0,
              discountPercent: 0,
              discountAmt: 0,
              totalAmount: 0,
            },
          ],
        },
      ],
      orderTaxAndTotals: {
        sgstPercent: 0,
        cgstPercent: 0,
        igstPercent: 0,
        tcsAmt: 0,
      },
    });
    setIsAddModalOpen(true);
  };
  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const res = await getSalesOrders();

      const mappedData = res.map((order, index) => {
        // Group items by sale_contract_id
        const contractsMap = {};
        (order.items || []).forEach((item) => {
          const cId = item.sale_contract_id;
          if (!contractsMap[cId]) {
            contractsMap[cId] = {
              contract_id: cId,
              contractNo: item.sale_contract_number,
              items: [],
            };
          }
          contractsMap[cId].items.push({
            lineKey: item.id,
            item: item.product_name,
            itemCode: item.product_id,
            uom: item.uom?.unit_name,
            qty: Number(item.net_qty || 0),
            freeQty: Number(item.free_qty || 0),
            totalQty: Number(item.gross_qty || 0),
            rate: Number(item.rate || 0),
            discountPercent: Number(item.discount_percent || 0),
            amount: Number(item.total_amount || 0),
            // approximate discount amount if not directly provided
            discountAmt:
              Number(item.total_amount || 0) - Number(item.line_total || 0),
            totalAmount: Number(item.line_total || 0),
            hsnCode: item.hsn_code,
            orderQuantity: Number(item.ordered_qty || 0),
          });
        });

        const contracts = Object.values(contractsMap);

        return {
          key: order.sales_order_id, // REQUIRED by antd table

          orderNumber: order.order_number,
          orderDate: order.order_date,
          deliveryDate: order.expected_receiving_date,

          customerName: order.customer?.name || "-",
          customerId: order.customer?.customer_id,
          customer_id: order.customer?.customer_id,
          customerEmail: order.customer?.email_id,
          deliveryAddress: order.customer?.address_line1,

          status: order.status,
          billMode: order.bill_mode,
          purchaseType: order.purchase_type,

          totalAmount: order.total_amount,
          grandTotal: order.grand_total,

          contracts,
          orderTaxAndTotals: {
            sgstPercent: Number(order.sgst || 0),
            cgstPercent: Number(order.cgst || 0),
            igstPercent: Number(order.igst || 0),
            tcsAmt: Number(order.tcs_amount || 0),
            grandTotal: Number(order.grand_total || 0),
            grossAmountTotal: Number(order.total_amount || 0),
          },

          createdAt: order.created_at,
          companyName: "-",
        };
      });

      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch sales orders", error);
      message.error("Failed to load sales orders");
    }
  };

  const buildSalesOrderPayload = (values) => {
    const { orderTaxAndTotals } = values;

    return {
      customer_id: values.customerName || values.customer_id,
      order_date: values.orderDate
        ? dayjs(values.orderDate).format("YYYY-MM-DD")
        : null,
      expected_receiving_date: values.deliveryDate
        ? dayjs(values.deliveryDate).format("YYYY-MM-DD")
        : null,
      delivery_address: values.deliveryAddress || "",
      cash_discount: 0,
      cgst: Number(orderTaxAndTotals?.cgstPercent || 0),
      sgst: Number(orderTaxAndTotals?.sgstPercent || 0),
      igst: Number(orderTaxAndTotals?.igstPercent || 0),
      tcs_amount: Number(orderTaxAndTotals?.tcsAmt || 0),
      round_off_amount: 0,
      total_amount: Number(orderTaxAndTotals?.grossAmountTotal || 0),
      grand_total: Number(orderTaxAndTotals?.grandTotal || 0),

      items: (values.contracts || []).map((contract) => ({
        sale_contract_id: contract.contract_id,
        products: (contract.items || []).map((item) => ({
          product_id: item.itemCode,
          product_name: item.item || "",
          uom_id: null,
          hsn_code: item.hsnCode || 0,
          mrp_per_unit: Number(item.rate || 0),
          rate: Number(item.rate || 0),
          gross_qty: Number(item.totalQty || 0),
          free_qty: Number(item.freeQty || 0),
          net_qty: Number(item.qty || 0),
          ordered_qty: Number(item.orderQuantity || 0),
          discount_percent: Number(item.discountPercent || 0),
          line_total: Number(item.totalAmount || 0),
          total_amount: Number(item.amount || 0),
        })),
      })),
    };
  };

  const handleAddFinish = async (values) => {
    try {
      values.contracts.forEach((c, idx) => {
        console.log(`🧾 Contract[${idx}] ID:`, c.contract_id);

        (c.items || []).forEach((i, j) => {
          console.log(`   📦 Product[${j}] ID:`, i.itemCode);
        });
      });
      const payload = buildSalesOrderPayload(values);

      console.log("FINAL SALES ORDER PAYLOAD 🔥", payload);

      await createSalesOrder(payload);

      message.success("Sales Order created successfully");

      setIsAddModalOpen(false);
      addForm.resetFields();
    } catch (error) {
      console.error("❌ Sales Order API Error");

      if (error.response) {
        // Backend responded with error status (400, 401, 500 etc.)
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);

        message.error(error.response.data?.message || "Server error occurred");
      } else if (error.request) {
        // Request was sent but no response received
        console.error("No response received:", error.request);
        message.error("No response from server");
      } else {
        // Something else went wrong
        console.error("Error message:", error.message);
        message.error(error.message);
      }
    }
  };

  /* ---------- Edit handlers ---------- */
  // useEffect(() => {
  //   if (isEditModalOpen && selectedRecord) {
  //     // prepare values with dayjs dates
  //     const pre = {
  //       ...selectedRecord,
  //       customerName: selectedRecord.customer_id, // Ensure select shows correct value
  //       orderDate: selectedRecord.orderDate
  //         ? dayjs(selectedRecord.orderDate)
  //         : undefined,
  //       deliveryDate: selectedRecord.deliveryDate
  //         ? dayjs(selectedRecord.deliveryDate)
  //         : undefined,
  //     };
  //     editForm.setFieldsValue(pre);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isEditModalOpen, selectedRecord]);

  const openEdit = async (record) => {
    try {
      const order = await getSalesOrderById(record.key);

      // Ensure customer is in options list so Select displays name correctly
      if (order.customer) {
        setContractPersonOptions((prev) => {
          const exists = prev.find(
            (p) => String(p.customer_id) === String(order.customer.customer_id),
          );
          if (!exists) {
            return [
              ...prev,
              {
                customer_id: order.customer.customer_id, // ensure ID matches
                name: order.customer.name,
                email: order.customer.email_id,
                mobile: order.customer.mobile_number,
              },
            ];
          }
          return prev;
        });
      }

      // Group items by sale_contract_id
      const contractsMap = {};
      (order.items || []).forEach((item) => {
        const cId = item.sale_contract_id;
        if (!contractsMap[cId]) {
          contractsMap[cId] = {
            contract_id: cId,
            contractNo: item.sale_contract_number,
            items: [],
          };
        }
        contractsMap[cId].items.push({
          lineKey: item.id,
          item: item.product_name_master,
          itemCode: item.product_id,
          uom: item.uom?.unit_name,
          qty: Number(item.net_qty || 0),
          freeQty: Number(item.free_qty || 0),
          totalQty: Number(item.gross_qty || 0),
          rate: Number(item.rate || 0),
          discountPercent: Number(item.discount_percent || 0),
          amount: Number(item.total_amount || 0),
          discountAmt:
            Number(item.total_amount || 0) - Number(item.line_total || 0),
          totalAmount: Number(item.line_total || 0),
          hsnCode: item.hsn_code,
          orderQuantity: Number(item.ordered_qty || 0),
        });
      });

      const contracts = Object.values(contractsMap);

      const mappedData = {
        key: order.sales_order_id,
        orderNumber: order.order_number,
        orderDate: order.order_date ? dayjs(order.order_date) : undefined,
        deliveryDate: order.expected_receiving_date
          ? dayjs(order.expected_receiving_date)
          : undefined,

        customerName: order.customer?.customer_id, // For Select to show name
        customerId: order.customer?.customer_id,
        customer_id: order.customer?.customer_id,
        customerEmail: order.customer?.email_id,
        deliveryAddress: order.customer?.address_line1,

        status: order.status,
        billMode: order.bill_mode,
        purchaseType: order.purchase_type,

        contracts,
        orderTaxAndTotals: {
          sgstPercent: Number(order.sgst || 0),
          cgstPercent: Number(order.cgst || 0),
          igstPercent: Number(order.igst || 0),
          tcsAmt: Number(order.tcs_amount || 0),
          grandTotal: Number(order.grand_total || 0),
          grossAmountTotal: Number(order.total_amount || 0),
          discountTotal: (order.items || []).reduce(
            (acc, curr) =>
              acc + (Number(curr.total_amount) - Number(curr.line_total)),
            0,
          ),
          totalGST:
            Number(order.grand_total || 0) -
            Number(order.tcs_amount || 0) -
            (Number(order.total_amount || 0) -
              (order.items || []).reduce(
                (acc, curr) =>
                  acc + (Number(curr.total_amount) - Number(curr.line_total)),
                0,
              )),
        },
      };

      setSelectedRecord(mappedData);
      editForm.setFieldsValue(mappedData);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch order details for edit:", err);
      message.error("Failed to load order details for editing");
    }
  };

  const handleEditFinish = async (values) => {
    try {
      const payload = buildSalesOrderPayload(values);
      console.log("FINAL UPDATE PAYLOAD 🔥", payload);

      await updateSalesOrder(selectedRecord.key, payload);

      message.success("Sales Order updated successfully");
      setIsEditModalOpen(false);
      editForm.resetFields();
      fetchSalesOrders(); // Refresh list
    } catch (error) {
      console.error("❌ Sales Order Update Error", error);
      message.error("Failed to update sales order");
    }
  };

  /* ---------- View ---------- */
  const openView = async (record) => {
    try {
      const order = await getSalesOrderById(record.key);

      // Group items by sale_contract_id
      const contractsMap = {};
      (order.items || []).forEach((item) => {
        const cId = item.sale_contract_id;
        if (!contractsMap[cId]) {
          contractsMap[cId] = {
            contract_id: cId,
            contractNo: item.sale_contract_number,
            items: [],
          };
        }
        contractsMap[cId].items.push({
          lineKey: item.id,
          item: item.product_name,
          itemCode: item.product_id,
          uom: item.uom?.unit_name,
          qty: Number(item.net_qty || 0),
          freeQty: Number(item.free_qty || 0),
          totalQty: Number(item.gross_qty || 0),
          rate: Number(item.rate || 0),
          discountPercent: Number(item.discount_percent || 0),
          amount: Number(item.total_amount || 0),
          // approximate discount amount if not directly provided
          discountAmt:
            Number(item.total_amount || 0) -
            Number(item.line_total || 0),
          totalAmount: Number(item.line_total || 0),
          hsnCode: item.hsn_code,
          orderQuantity: Number(item.ordered_qty || 0),
        });
      });

      const contracts = Object.values(contractsMap);

      // Ensure customer is in options list so Select displays name correctly
      if (order.customer) {
        setContractPersonOptions((prev) => {
          const exists = prev.find(
            (p) => String(p.customer_id) === String(order.customer.customer_id),
          );
          if (!exists) {
            return [
              ...prev,
              {
                customer_id: order.customer.customer_id, // ensure ID matches
                name: order.customer.name,
                email: order.customer.email_id,
                mobile: order.customer.mobile_number,
              },
            ];
          }
          return prev;
        });
      }

      const mappedData = {
        key: order.sales_order_id,
        orderNumber: order.order_number,
        orderDate: order.order_date ? dayjs(order.order_date) : undefined,
        deliveryDate: order.expected_receiving_date
          ? dayjs(order.expected_receiving_date)
          : undefined,

        customerName: order.customer?.name || "-",
        customerId: order.customer?.customer_id,
        customer_id: order.customer?.customer_id,
        customerEmail: order.customer?.email_id,
        deliveryAddress: order.customer?.address_line1,

        status: order.status,
        billMode: order.bill_mode,
        purchaseType: order.purchase_type,

        contracts,
        orderTaxAndTotals: {
          sgstPercent: Number(order.sgst || 0),
          cgstPercent: Number(order.cgst || 0),
          igstPercent: Number(order.igst || 0),
          tcsAmt: Number(order.tcs_amount || 0),
          grandTotal: Number(order.grand_total || 0),
          grossAmountTotal: Number(order.total_amount || 0),
          // Calculate if missing
          discountTotal: (order.items || []).reduce(
            (acc, curr) =>
              acc + (Number(curr.total_amount) - Number(curr.line_total)),
            0,
          ),
          totalGST:
            Number(order.grand_total || 0) -
            Number(order.tcs_amount || 0) -
            (Number(order.total_amount || 0) -
              (order.items || []).reduce(
                (acc, curr) =>
                  acc + (Number(curr.total_amount) - Number(curr.line_total)),
                0,
              )),
        },
      };

      setSelectedRecord(mappedData);
      viewForm.setFieldsValue(mappedData);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      message.error("Failed to load order details");
    }
  };

  /* ---------- Columns ---------- */
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "orderNumber",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Order Date</span>,
      dataIndex: "orderDate",
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : ""}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Delivery Date</span>
      ),
      dataIndex: "deliveryDate",
      render: (d) => (
        <span className="text-amber-800">
          {d ? dayjs(d).format("YYYY-MM-DD") : ""}
        </span>
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customerName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
   
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
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
          <span className={`${base} bg-red-100 text-red-700`}>{status}</span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => openView(record)}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => openEdit(record)}
          />
        </div>
      ),
    },
  ];

  /* ---------- Contract & Items UI blocks (used in Add/Edit form) ---------- */
  const ContractsFormList = ({ form, disabled }) => (
    <Form.List name="contracts">
      {(contractFields, { add: addContract, remove: removeContract }) => (
        <>
          {/* HEADER */}
          <div className="mb-2 flex justify-between items-center">
            <h6 className="text-amber-500">Contracts</h6>
            {!disabled && (
              <Button
                className="bg-amber-500! hover:bg-amber-600! border-none! text-white!"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  addContract({
                    contractNo: `CNT-${Date.now()}`,
                    items: [
                      {
                        lineKey: Date.now(),
                        item: undefined,
                        itemCode: undefined,
                        uom: undefined,
                        qty: 0,
                        freeQty: 0,
                        totalQty: 0,
                        grossWt: 0,
                        totalGrossWt: 0,
                        rate: 0,
                        amount: 0,
                        discountPercent: 0,
                        discountAmt: 0,
                        totalAmount: 0,
                      },
                    ],
                  })
                }
              >
                Add Contract
              </Button>
            )}
          </div>

          {contractFields.map((cf, ci) => {
            const contractItems = contractItemsMap[ci] || [];

            return (
              <div
                key={cf.key}
                className="mb-4 p-4 border rounded-lg shadow-sm bg-white"
              >
                <div className="flex justify-between items-center mb-3">
                  <Form.Item
                    label="Contract ID"
                    name={[cf.name, "contract_id"]}
                  >
                    <Select
                      placeholder="Select Contract"
                      disabled={disabled}
                      onChange={async (contractId) => {
                        let items = [];

                        // Try to find items locally first
                        const selectedContract = contractOptions.find(
                          (c) => c.sale_contract_id === contractId,
                        );
                        console.log("Selected Contract:", selectedContract);

                        if (
                          selectedContract &&
                          selectedContract.items &&
                          selectedContract.items.length > 0
                        ) {
                          items = selectedContract.items;
                        } else {
                          // Fallback to API
                          items = await salesContractItems(contractId);
                        }

                        console.log("Contract Items for Dropdown:", items);

                        // Update options for this specific contract row (using stable key)
                        setContractItemsMap((prev) => ({
                          ...prev,
                          [cf.key]: items,
                        }));

                        // Reset items to a single empty row to allow user to select
                        const contracts = form.getFieldValue("contracts") || [];
                        contracts[ci] = {
                          ...(contracts[ci] || {}),
                          contract_id: contractId,
                          items: [
                            {
                              lineKey: Date.now(),
                              item: undefined,
                              itemCode: undefined,
                              uom: undefined,
                              qty: 0,
                              freeQty: 0,
                              totalQty: 0,
                              grossWt: 0,
                              totalGrossWt: 0,
                              rate: 0,
                              amount: 0,
                              discountPercent: 0,
                              discountAmt: 0,
                              totalAmount: 0,
                            },
                          ],
                        };

                        form.setFieldsValue({ contracts });
                        onFormValuesChange(form, form.getFieldsValue());
                      }}
                    >
                      {contractOptions.map((c) => (
                        <Select.Option
                          key={c.sale_contract_id}
                          value={c.sale_contract_id}
                        >
                          {c.sale_contract_number}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {!disabled && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeContract(cf.name)}
                    />
                  )}
                </div>

                {/* ITEMS LIST */}
                <Form.List name={[cf.name, "items"]}>
                  {(itemFields, { add: addItem, remove: removeItem }) => (
                    <>
                      {itemFields.map((itf, ii) => (
                        <div
                          key={itf.key}
                          className="mb-3 p-3 border rounded-md"
                        >
                          <Row gutter={12}>
                            {/* ITEM */}
                            <Col span={8}>
                              <Form.Item
                                name={[itf.name, "item"]}
                                label="Item"
                                rules={[{ required: true }]}
                              >
                                <Select
                                  placeholder="Item"
                                  disabled={disabled}
                                  onChange={(val) => {
                                    // Retrieve items using the stable key
                                    const availableItems =
                                      contractItemsMap[cf.key] || [];
                                    const sel = availableItems.find(
                                      (x) =>
                                        (x.product_name ||
                                          x.item_name ||
                                          (x.product &&
                                            x.product.product_name)) === val,
                                    );
                                    if (!sel) return;

                                    const contracts =
                                      form.getFieldValue("contracts") || [];
                                    const items = contracts[ci].items || [];

                                    items[ii] = {
                                      ...(items[ii] || {}),
                                      item:
                                        sel.product_name ||
                                        sel.item_name ||
                                        (sel.product &&
                                          sel.product.product_name),
                                      itemCode:
                                        sel.product_id ||
                                        sel.item_code ||
                                        (sel.product && sel.product.product_id),
                                      hsnCode: sel.hsn_code,
                                      uom: sel.uom?.unit_name || sel.uom,
                                      qty: Number(
                                        sel.net_qty || sel.qty || 0,
                                      ),
                                      freeQty: Number(
                                        sel.free_qty || sel.free_qty || 0,
                                      ),
                                      totalQty: Number(
                                        sel.gross_qty ||
                                        sel.total_qty ||
                                        0,
                                      ),
                                      rate: Number(sel.mrp || sel.rate || 0),
                                      discountPercent: Number(
                                        sel.discount_percent || 0,
                                      ),
                                      discountAmt: Number(
                                        sel.discount_amount || 0,
                                      ),
                                      totalAmount: Number(
                                        sel.line_total ||
                                        sel.total_amount ||
                                        0,
                                      ),
                                    };

                                    contracts[ci].items = items;
                                    form.setFieldsValue({ contracts });
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    );
                                  }}
                                >
                                  {(
                                    contractItemsMap[cf.key] || []
                                  ).map((it) => (
                                    <Select.Option
                                      key={
                                        it.product_id ||
                                        it.item_code ||
                                        (it.product && it.product.product_id)
                                      }
                                      value={
                                        it.product_name ||
                                        it.item_name ||
                                        (it.product && it.product.product_name)
                                      }
                                    >
                                      {
                                        it.product_name ||
                                        it.item_name ||
                                        (it.product && it.product.product_name)
                                      }
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            {/* CODE */}
                            <Col span={4}>
                              <Form.Item
                                name={[itf.name, "hsnCode"]}
                                label="Code"
                              >
                                <Input disabled />
                              </Form.Item>
                            </Col>

                            {/* UOM */}
                            <Col span={4}>
                              <Form.Item name={[itf.name, "uom"]} label="UOM">
                                <Input disabled />
                              </Form.Item>
                            </Col>

                            {/* QTY */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "qty"]}
                                label="Qty"
                                rules={[{ required: true }]}
                              >
                                <InputNumber
                                  min={0}
                                  className="w-full"
                                  disabled
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>

                            {/* FREE QTY */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "freeQty"]}
                                label="Free"
                              >
                                <InputNumber
                                  min={0}
                                  disabled
                                  className="w-full"
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>

                            {/* RATE */}
                            <Col span={4}>
                              <Form.Item
                                name={[itf.name, "rate"]}
                                label="Rate"
                                rules={[{ required: true }]}
                              >
                                <InputNumber
                                  min={0}
                                  className="w-full"
                                  disabled
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>

                            {/* DISCOUNT PERCENT */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "discountPercent"]}
                                label="Disc %"
                              >
                                <InputNumber
                                  min={0}
                                  max={100}
                                  className="w-full"
                                  disabled
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>

                            {/* AMOUNT */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "amount"]}
                                label="Amount"
                              >
                                <InputNumber className="w-full" disabled />
                              </Form.Item>
                            </Col>

                            {/* DISCOUNT AMOUNT */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "discountAmt"]}
                                label="Disc Amt"
                              >
                                <InputNumber className="w-full" disabled />
                              </Form.Item>
                            </Col>

                            {/* TOTAL AMOUNT */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "totalAmount"]}
                                label="Total Amount"
                              >
                                <InputNumber className="w-full" disabled />
                              </Form.Item>
                            </Col>

                            {/* TOTAL QTY */}
                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "totalQty"]}
                                label="Total Qty"
                              >
                                <InputNumber className="w-full" disabled />
                              </Form.Item>
                            </Col>

                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "orderQuantity"]}
                                label="Order Qty"
                              >
                                <InputNumber
                                  min={0}
                                  className="w-full"
                                  disabled={disabled}
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                           
                          </Row>
                          {!disabled && (
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                removeItem(itf.name);
                                onFormValuesChange(form, form.getFieldsValue());
                              }}
                            />
                          )}
                        </div>
                      ))}

                      {!disabled && (
                        <Button
                          className="bg-amber-500! hover:bg-amber-600! border-none! text-white!"
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            addItem({
                              lineKey: Date.now(),
                              item: undefined,
                              itemCode: undefined,
                              uom: salesOrderJSON.uomOptions[0],
                              qty: 0,
                              freeQty: 0,
                              totalQty: 0,
                              grossWt: 0,
                              totalGrossWt: 0,
                              rate: 0,
                              amount: 0,
                              discountPercent: 0,
                              discountAmt: 0,
                              totalAmount: 0,
                            })
                          }
                        >
                          Add Item
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            );
          })}
        </>
      )}
    </Form.List>
  );

  /* ---------- Render form fields (shared by add/edit/view with disabled flag) ---------- */
  const renderFormFields = (form, disabled = false) => (
    <>
      <h6 className="text-amber-500">Header</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Customer Name" name="customerName">
            <Select
              placeholder="Select Customer"
              onChange={async (customerId) => {
                const customer = contractPersonOptions.find(
                  (c) => c.customer_id === customerId,
                );

                if (customer) {
                  console.log("Selected User for Autofill:", customer);
                  form.setFieldsValue({
                    customerName: customer.name,
                    customerEmail:
                      customer.email_address || customer.email || "",
                    customerMobile:
                      customer.mobile_number || customer.mobile || "",
                  });
                }

              
                setContractItems([]);
                form.setFieldsValue({ contract_id: undefined });
              }}
              disabled={disabled}
            >
              {contractPersonOptions.map((c) => (
                <Select.Option key={c.customer_id} value={c.customer_id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Order Date</span>}
            name="orderDate"
            rules={[{ required: true }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Delivery Date</span>}
            name="deliveryDate"
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

       
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Customer Email</span>}
            name="customerEmail"
          >
            <Input placeholder="Email" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Delivery Address</span>}
            name="deliveryAddress"
          >
            <Input placeholder="Address" disabled={disabled} />
          </Form.Item>
        </Col>

       

        <Col span={6}>
          <Form.Item name="status" label="Status">
  <Select onChange={(val) => handleStatusChange(val, form)}>
    <Select.Option value="Approved">Approved</Select.Option>
    <Select.Option value="Pending">Pending</Select.Option>
     <Select.Option value="Rejected">Pending</Select.Option>
  </Select>
</Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* contracts + items */}
      <ContractsFormList form={form} disabled={disabled} />

      <Divider />

      {/* order-level taxes and totals */}
      <h6 className="text-amber-500">Tax & Totals</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">SGST %</span>}
            name={["orderTaxAndTotals", "sgstPercent"]}
          >
            <InputNumber
              min={0}
              max={100}
              className="w-full"
              disabled={disabled}
              onChange={() => onFormValuesChange(form, form.getFieldsValue())}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">CGST %</span>}
            name={["orderTaxAndTotals", "cgstPercent"]}
          >
            <InputNumber
              min={0}
              max={100}
              className="w-full"
              disabled={disabled}
              onChange={() => onFormValuesChange(form, form.getFieldsValue())}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">IGST %</span>}
            name={["orderTaxAndTotals", "igstPercent"]}
          >
            <InputNumber
              min={0}
              max={100}
              className="w-full"
              disabled={disabled}
              onChange={() => onFormValuesChange(form, form.getFieldsValue())}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">TCS Amt (₹)</span>}
            name={["orderTaxAndTotals", "tcsAmt"]}
          >
            <InputNumber
              min={0}
              className="w-full"
              disabled={disabled}
              onChange={() => onFormValuesChange(form, form.getFieldsValue())}
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Gross Total (₹)</span>}
            name={["orderTaxAndTotals", "grossAmountTotal"]}
          >
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Discount Total (₹)</span>}
            name={["orderTaxAndTotals", "discountTotal"]}
          >
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Total GST (₹)</span>}
            name={["orderTaxAndTotals", "totalGST"]}
          >
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Grand Total (₹)</span>}
            name={["orderTaxAndTotals", "grandTotal"]}
          >
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* <h6 className="text-amber-500">Transport & Status</h6>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Transporter</span>} name="transporter">
            <Select disabled={disabled}>
              {salesOrderJSON.transporterOptions.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Vehicle No</span>} name="vehicleNo">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Driver Name</span>} name="driverName">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Phone No</span>} name="phoneNo">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Route</span>} name="route">
            <Select disabled={disabled}>
              {salesOrderJSON.routeOptions.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Bill Type</span>} name="billType">
            <Select disabled={disabled}>
              {salesOrderJSON.billTypeOptions.map((b) => <Select.Option key={b} value={b}>{b}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Waybill No</span>} name="waybillNo">
            <Input disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Status</span>} name="status">
            <Select disabled={disabled}>
              {salesOrderJSON.statusOptions.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row> */}
    </>
  );

  /* ---------- JSX ---------- */
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
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
            onClick={openAddModal}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">
          Sales Order & Invoice Records
        </h2>
        <p className="text-amber-600 mb-3">
          Manage your sales Order & Invoice data
        </p>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: 300 }}
          rowKey="key"
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add New Sales Order & Invoice
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={1000}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddFinish}
          onValuesChange={() =>
            onFormValuesChange(addForm, addForm.getFieldsValue())
          }
        >
          {renderFormFields(addForm)}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                addForm.resetFields();
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
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
            Edit Sales Order & Invoice
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={1000}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={handleEditFinish}
          onValuesChange={() =>
            onFormValuesChange(editForm, editForm.getFieldsValue())
          }
        >
          {renderFormFields(editForm)}
          <div className="flex justify-end gap-2 mt-4">
            <Button
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
              className="bg-amber-500 hover:bg-amber-600 border-none"
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
            View Sales Order & Invoice
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
          setSelectedRecord(null);
        }}
        footer={null}
        width={1000}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}
