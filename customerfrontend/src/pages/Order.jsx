
  // OrdersInvoice.jsx 
import React, { useState, useEffect,useMemo } from "react";
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
WalletOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Wallet from "./Wallet";
import dayjs from "dayjs";
import {
 
  salesContractItems,
  createSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  getContractById,
 // getCustomersByOrganisation,
  getAllSalesContracts,
} from "../api/order";
/* ------------------ data (use your salesOrderJSON) ------------------ */


/* ------------------ component ------------------ */
export default function SaleOrdersInvoice() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formMode, setFormMode] = useState(null); 
  const [customerId, setCustomerId] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [walletOpen, setWalletOpen] = useState(false);
  const [allData, setAllData] = useState([]);
 const [selectedStatus, setSelectedStatus] = useState("All");
  const [contractPersonOptions, setContractPersonOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  // const [contractItems, setContractItems] = useState([]);
  const [contractItemsMap, setContractItemsMap] = useState({});
  useEffect(() => {
    fetchContracts();
    fetchSalesOrders();

  }, []);
   
 const STATUS_FILTERS = [
  "All",
  "Fresh",
  "Approved",
  "Pending",
  "InTransit",
  "OutForDelivery",
  "Delivered",
];
 

  const fetchContracts = async () => {
    try {
      const res = await getAllSalesContracts();
         const filtered = res.filter((item) =>
      ["Approved"].includes(item.status)
    );
      console.log("Fetched All Sales Contracts:", filtered);
      setContractOptions(filtered || []);
    } catch (err) {
      console.error("Failed to fetch all sales contracts:", err);
    }
  };


const handleSearch = (value) => {
  setSearchText(value);

  if (!value) {
    fetchSalesOrders();
    return;
  }

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
  );

  setData(filtered);
};
  /* ---------- utilities: compute item and order totals ---------- */
 const computeOrderTotalsFromContracts = (contracts = []) => {
  const allItems = [];

  contracts.forEach((c) => {
    (c.items || []).forEach((it) => allItems.push(it));
  });

  const grossAmountTotal = allItems.reduce(
    (s, it) => s + Number(it.amount || 0),
    0
  );

  const discountTotal = allItems.reduce(
    (s, it) => s + Number(it.discountAmt || 0),
    0
  );

  return {
    orderTaxAndTotals: {
      grossAmountTotal,
      discountTotal,
      grandTotal: grossAmountTotal - discountTotal,
    },
  };
};


  
  /* ---------- when form values change (add/edit) ---------- */
const onFormValuesChange = (form, allValues) => {
  const contracts = allValues.contracts || [];

  // ✅ Only calculate when item is selected
  const hasItemSelected = contracts.some((c) =>
    (c.items || []).some((it) => it.itemCode)
  );

  // ❌ If no item → DO NOTHING (keep API values)
  if (!hasItemSelected) return;

  // ✅ Calculate only after item selection
  const updatedContracts = contracts.map((c) => {
    const items = (c.items || []).map((it) => {
      const orderQty = Number(it.orderQuantity || 0);
      const rate = Number(it.rate || 0);
      const discountPercent = Number(it.discountPercent || 0);

      const amount = Math.round(orderQty * rate);
      const discountAmt = Math.round((amount * discountPercent) / 100);
      const totalAmount = amount - discountAmt;

      return { ...it, amount, discountAmt, totalAmount };
    });

    return { ...c, items };
  });

  const { orderTaxAndTotals } =
    computeOrderTotalsFromContracts(updatedContracts);

  form.setFieldsValue({
    contracts: updatedContracts,
    orderTaxAndTotals,
  });
};
const handleStatusFilter = (value) => {
  setSelectedStatus(value);

  if (value === "All") {
    setData(allData); // ✅ restore original
    return;
  }

  const filtered = allData.filter(
    (item) => item.status === value
  );

  setData(filtered);
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
     setFormMode("add"); 
    addForm.resetFields();

    // initialize with one contract + one item row to help user
    addForm.setFieldsValue({
       status: "Pending", 
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
 

  const fetchSalesOrders = async () => {
    try {
      const res = await getSalesOrders();
      // ✅ SET CUSTOMER ID FROM SALES ORDERS
if (res && res.length > 0) {
  setCustomerId(res[0].customer?.customer_id);
}

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
        const { orderTaxAndTotals, orderTotals } =
  computeOrderTotalsFromContracts(contracts, {
    sgstPercent: Number(order.sgst || 0),
    cgstPercent: Number(order.cgst || 0),
    igstPercent: Number(order.igst || 0),
    tcsAmt: Number(order.tcs_amount || 0),
  });
        return {
  key: order.sales_order_id,
  orderNumber: order.order_number,
  orderDate: order.order_date,
  deliveryDate: order.expected_receiving_date,
  customerName: order.customer?.name || "-",
  status: order.status,
  contracts,
  orderTaxAndTotals,
  orderTotals,
          customerId: order.customer?.customer_id,
          customer_id: order.customer?.customer_id,
          customerEmail: order.customer?.email_id,
          deliveryAddress: order.customer?.address_line1,

        
          bill_mode: order.bill_mode,
          purchaseType: order.purchase_type,

         

          createdAt: order.created_at,
          companyName: "-",
        };
      });

      setData(mappedData);
      setAllData(mappedData); 
    } catch (error) {
      console.error("Failed to fetch sales orders", error);
      message.error("Failed to load sales orders");
    }
  };

  const buildSalesOrderPayload = (values) => {
    const { orderTaxAndTotals } = values;
console.log("PAYLOAD bill_mode 👉", values.bill_mode);
    return {

status: values.status, 
 purchase_type: values.purchaseType,   // ✅ NEW
 bill_mode: values.bill_mode,
  narration: values.narration || "", 
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
     console.log("ADD bill_mode 👉", values.bill_mode);
  if (!customerId) {
    message.error("Customer not loaded yet");
    return;
  }
    try {
      values.contracts.forEach((c, idx) => {
        console.log(`🧾 Contract[${idx}] ID:`, c.contract_id);

        (c.items || []).forEach((i, j) => {
          console.log(`   📦 Product[${j}] ID:`, i.itemCode);
        });
      });
      
      const payload = {
    ...buildSalesOrderPayload(values),
    customer_id: customerId, // ✅ ALWAYS from state
  };
      console.log("FINAL SALES ORDER PAYLOAD 🔥", payload);

      await createSalesOrder(payload);

      message.success("Sales Order created successfully");

      setIsAddModalOpen(false);
      addForm.resetFields();
      fetchSalesOrders();
    } catch (error) {
      console.error("❌ Sales Order API Error");

      if (error.response) {
        // Backend responded with error status (400, 401, 500 etc.)
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);
        console.log("bill_mode value 👉", values.bill_mode);
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



  const openEdit = async (record) => {
     setFormMode("edit");
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
      status: order.status,
        orderDate: order.order_date ? dayjs(order.order_date) : undefined,
        deliveryDate: order.expected_receiving_date
          ? dayjs(order.expected_receiving_date)
          : undefined,

      customer_id: order.customer?.customer_id,
        customerEmail: order.customer?.email_id,
        customerPhone: order.customer?.phone_number,
        deliveryAddress: order.customer?.address_line1,

      bill_mode: order.bill_mode || "Cash",
purchaseType: order.purchase_type,
 // NEW
narration: order.narration,      // NEW

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
     console.log("EDIT bill_mode 👉", values.bill_mode);
    try {
    const payload = {
  ...buildSalesOrderPayload(values),
  customer_id: selectedRecord.customer_id, // ✅ ADD THIS
};  console.log("FINAL UPDATE PAYLOAD 🔥", payload);

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
    setFormMode("view"); 
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

       customerName:
  order.customer?.name ||
  order.customer_name ||
 
  "-", customerId: order.customer?.customer_id,
        customer_id: order.customer?.customer_id,
        customerEmail: order.customer?.email_id,
         customerPhone: order.customer?.phone_number,
        deliveryAddress: order.customer?.address_line1,

        status: order.status,
     bill_mode: order.bill_mode || "Cash",
purchaseType: order.purchase_type,
narration: order.narration,      // NEW

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
          {record.status !== "Approved" && (
        <EditOutlined
          className="cursor-pointer! text-red-500!"
          onClick={() => openEdit(record)}
        />
      )}
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
  try {
    const contractDetails = await getContractById(contractId);

    // ✅ Fill TAX + TOTALS from API
    form.setFieldsValue({
      
      orderTaxAndTotals: {
        sgstPercent: Number(contractDetails.sgst || 0),
        cgstPercent: Number(contractDetails.cgst || 0),
        igstPercent: Number(contractDetails.igst || 0),
        tcsAmt: Number(contractDetails.tcs_amount || 0),

            },
    });

    // ✅ Load items
    const items =
      contractDetails.items?.length > 0
        ? contractDetails.items
        : await salesContractItems(contractId);

    setContractItemsMap((prev) => ({
      ...prev,
      [cf.key]: items,
    }));

    // reset items row
    const contracts = form.getFieldValue("contracts") || [];
    contracts[ci] = {
      ...(contracts[ci] || {}),
      contract_id: contractId,
      items: [{ lineKey: Date.now() }],
    };

    form.setFieldsValue({ contracts });

  } catch (err) {
    console.error(err);
  }
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

                           

                            <Col span={3}>
                              <Form.Item
                                name={[itf.name, "orderQuantity"]}
                                label="Order Qty"
                                 validateTrigger="onChange" 
                                   rules={[
                                     {
                                       required: true,
                                       message: "Please enter order quantity",
                                     },
                                     {
                                       validator: (_, value) => {
                                         const qty = form.getFieldValue([
                                           "contracts",
                                           ci,
                                           "items",
                                           itf.name,
                                           "qty",
                                         ]);
                                 
                                         // ❌ don't show error initially
                                         if (value === undefined || value === null) {
                                           return Promise.resolve();
                                         }
                                 
                                         if (isNaN(value)) {
                                           return Promise.reject(new Error("Enter a valid number"));
                                         }
                                 
                                         if (value <= 0) {
                                           return Promise.reject(
                                             new Error("Order quantity must be greater than zero")
                                           );
                                         }
                                 
                                         if (qty && value > qty) {
                                           return Promise.reject(
                                             new Error(
                                               "Order quantity cannot be greater than available quantity"
                                             )
                                           );
                                         }
                                 
                                         return Promise.resolve();
                                       },
                                     },
                                   ]}
                              >
                                <Input
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
          <Form.Item
            label={<span className="text-amber-700">Order Date</span>}
            name="orderDate"
            rules={[{ required: true }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" disabled/>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Delivery Date</span>}
            name="deliveryDate"
          >
          <DatePicker
  className="w-full"
  disabledDate={(current) =>
    current &&
    form.getFieldValue("orderDate") &&
    current < form.getFieldValue("orderDate").startOf("day")
  }
/>    </Form.Item>
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
  <Form.Item
    label="Purchase Type"
    name="purchaseType"
    rules={[{ required: true, message: "Select Purchase Type" }]}
  >
    <Select disabled={disabled}>
      <Select.Option value="Transit">Transit</Select.Option>
      <Select.Option value="Interstate">Interstate</Select.Option>
      <Select.Option value="Local">Local</Select.Option>
    </Select>
  </Form.Item>
</Col>

<Col span={6}>
 <Form.Item
  label="Bill Mode"
  name="bill_mode"
  rules={[{ required: true }]}
>
  <Select disabled={disabled}>
    <Select.Option value="Cash">Cash</Select.Option>
    <Select.Option value="Credit">Credit</Select.Option>
    <Select.Option value="Online">Online</Select.Option>
  </Select>
</Form.Item>
</Col>



<Col span={12}>
  <Form.Item
    label="Narration"
    name="narration"
  >
    <Input.TextArea
      rows={2}
      placeholder="Enter narration"
      disabled={disabled}
    />
  </Form.Item>
</Col>

        <Col span={6}>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Select status" }]}>
  <Select disabled={disabled} onChange={(val) => handleStatusChange(val, form)}>
     <Select.Option value="Pending">Pending</Select.Option>
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
             disabled  />
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
             disabled  />
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
             disabled    />
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
              disabled
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
            label={<span className="text-amber-700">Grand Total (₹)</span>}
            name={["orderTaxAndTotals", "grandTotal"]}
          >
            <InputNumber className="w-full" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

     
    </>
  );

  /* ---------- JSX ---------- */
  return (
    <div>


      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Orders</h1>
          <p className="text-amber-600">Manage your orders easily</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">

        {/* LEFT: Search */}
        <div className="flex gap-2">
             <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
           onChange={(e) => handleSearch(e.target.value)}   />
         <Button
  icon={<FilterOutlined />}
  onClick={() => {
    setSearchText("");
    fetchSalesOrders(); // ✅ reload original data
  }}
  className="border-amber-400! text-amber-700! hover:bg-amber-100!"
>
  Reset
</Button>
        </div>

        {/* RIGHT: Dropdown + Buttons */}
        <div className="flex gap-2 items-center">
          <Select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className="w-48! border-amber-400! text-amber-700!"
            suffixIcon={<FilterOutlined className="text-amber-600!" />}
          >
            {STATUS_FILTERS.map((status) => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>

          <Button
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            icon={<WalletOutlined />}
            onClick={() => setWalletOpen(true)}
          >
            Wallet
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
       <Table
          columns={columns}
          dataSource={data}
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
           onValuesChange={(_, allValues) => {
    if (formMode === "add") {
      onFormValuesChange(addForm, allValues);
    }
  }}
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
           onValuesChange={(_, allValues) => {
    if (formMode === "edit") {
      onFormValuesChange(editForm, allValues);
    }
  }}
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

        <Modal open={walletOpen} onCancel={() => setWalletOpen(false)} footer={null} width={1200}>
        <Wallet />
      </Modal>


    </div>
  );
    }
  