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
} from "../../../../../api/sales";
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
      const res = await getContractpersonName();
      console.log("Contract persons fetched:", res);
      setContractPersonOptions(res);
    } catch (error) {
      console.error("Error fetching contract persons:", error);
    }
  };
  useEffect(() => {
    fetchContractPersons();
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
  const buildSalesOrderPayload = (values) => {
    return {
      customer_id: values.customer_id,

      order_date: values.orderDate
        ? dayjs(values.orderDate).format("YYYY-MM-DD")
        : null,

      expected_receiving_date: values.deliveryDate
        ? dayjs(values.deliveryDate).format("YYYY-MM-DD")
        : null,

      purchase_type: values.purchase_type || "Transit",
      bill_mode: values.bill_mode || "Cash",

      items: (values.contracts || []).map((contract) => ({
        sale_contract_id: contract.contract_id,

        products: (contract.items || []).map((item) => ({
          product_id: item.itemCode,
          product_name: item.item || "",
          uom_id: null,

          ordered_qty: Number(item.qty || 0),
          net_qty: Number(item.qty || 0),
          gross_qty: Number(item.totalQty || 0),
          free_qty: Number(item.freeQty || 0),

          rate: Number(item.rate || 0),
          mrp_per_unit: Number(item.rate || 0),

          discount_percent: Number(item.discountPercent || 0),

          total_amount: Number(item.amount || 0),
          line_total: Number(item.totalAmount || 0),

          hsn_code: item.hsn_code || 2312,
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
  useEffect(() => {
    if (isEditModalOpen && selectedRecord) {
      // prepare values with dayjs dates
      const pre = {
        ...selectedRecord,
        orderDate: selectedRecord.orderDate
          ? dayjs(selectedRecord.orderDate)
          : undefined,
        deliveryDate: selectedRecord.deliveryDate
          ? dayjs(selectedRecord.deliveryDate)
          : undefined,
      };
      editForm.setFieldsValue(pre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditModalOpen, selectedRecord]);

  const handleEditFinish = (values) => {
    const contracts = (values.contracts || []).map((c) => ({
      ...c,
      items: (c.items || []).map((it) => ({
        ...it,
        amount: Math.round(Number(it.qty || 0) * Number(it.rate || 0)),
        discountAmt: Math.round(
          (Number(it.qty || 0) *
            Number(it.rate || 0) *
            Number(it.discountPercent || 0)) /
            100,
        ),
        totalAmount: Math.round(
          Number(it.qty || 0) * Number(it.rate || 0) -
            (Number(it.qty || 0) *
              Number(it.rate || 0) *
              Number(it.discountPercent || 0)) /
              100,
        ),
        totalQty: Number(it.qty || 0) + Number(it.freeQty || 0),
      })),
    }));
    const { orderTaxAndTotals, orderTotals } = computeOrderTotalsFromContracts(
      contracts,
      values.orderTaxAndTotals || {},
    );
    const payload = {
      ...values,
      contracts,
      orderTaxAndTotals,
      orderTotals,
      orderDate: values.orderDate
        ? values.orderDate.format("YYYY-MM-DD")
        : undefined,
      deliveryDate: values.deliveryDate
        ? values.deliveryDate.format("YYYY-MM-DD")
        : undefined,
    };

    setData((prev) =>
      prev.map((d) =>
        d.key === selectedRecord.key ? { ...payload, key: d.key } : d,
      ),
    );
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedRecord(null);
  };

  /* ---------- View ---------- */
  const openView = (record) => {
    setSelectedRecord(record);
    const pre = {
      ...record,
      orderDate: record.orderDate ? dayjs(record.orderDate) : undefined,
      deliveryDate: record.deliveryDate
        ? dayjs(record.deliveryDate)
        : undefined,
    };
    viewForm.setFieldsValue(pre);
    setIsViewModalOpen(true);
  };

  /* ---------- Columns ---------- */
  const columns = [
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
      title: <span className="text-amber-700 font-semibold">Company</span>,
      dataIndex: "companyName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Customer</span>,
      dataIndex: "customerName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Contracts</span>,
      dataIndex: "contracts",
      render: (contracts = []) => (
        <span className="text-amber-800">
          {(contracts || []).map((c) => c.contractNo).join(", ")}
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
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              editForm.setFieldsValue({
                ...record,
                orderDate: record.orderDate
                  ? dayjs(record.orderDate)
                  : undefined,
                deliveryDate: record.deliveryDate
                  ? dayjs(record.deliveryDate)
                  : undefined,
              });
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  /* ---------- Contract & Items UI blocks (used in Add/Edit form) ---------- */
  const ContractsFormList = ({ form }) => (
    <Form.List name="contracts">
      {(contractFields, { add: addContract, remove: removeContract }) => (
        <>
          {/* HEADER */}
          <div className="mb-2 flex justify-between items-center">
            <h6 className="text-amber-500">Contracts</h6>
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
          </div>

          {contractFields.map((cf, ci) => {
            const contractItems = contractItemsMap[ci] || [];

            return (
              <div
                key={cf.key}
                className="mb-4 p-4 border rounded-lg shadow-sm bg-white"
              >
                {/* CONTRACT HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <Form.Item
                    label="Contract ID"
                    name={[cf.name, "contract_id"]}
                  >
                    <Select
                      placeholder="Select Contract"
                      onChange={async (contractId) => {
                        const items = await salesContractItems(contractId);

                        setContractItemsMap((prev) => ({
                          ...prev,
                          [ci]: items,
                        }));

                        const mappedItems = items.map((it) => ({
                          lineKey: Date.now() + Math.random(),
                          item: it.product_name,
                          itemCode: it.product_id,
                          uom: it.uom?.unit_name,
                          qty: Number(it.net_qty),
                          freeQty: Number(it.free_qty),
                          totalQty: Number(it.gross_qty),
                          grossWt: 0,
                          totalGrossWt: 0,
                          rate: Number(it.mrp),
                          amount: 0,
                          discountPercent: Number(it.discount_percent),
                          discountAmt: Number(it.discount_amount),
                          totalAmount: Number(it.line_total),
                        }));

                        const contracts = form.getFieldValue("contracts") || [];
                        contracts[ci] = {
                          ...(contracts[ci] || {}),
                          contract_id: contractId,
                          items: mappedItems,
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

                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeContract(cf.name)}
                  />
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
                                  onChange={(val) => {
                                    const sel = contractItems.find(
                                      (x) => x.product_name === val,
                                    );
                                    if (!sel) return;

                                    const contracts =
                                      form.getFieldValue("contracts") || [];
                                    const items = contracts[ci].items || [];

                                    items[ii] = {
                                      ...(items[ii] || {}),
                                      item: sel.product_name,
                                      itemCode: sel.product_id,
                                      uom: sel.uom?.unit_name,
                                      qty: Number(sel.net_qty),
                                      freeQty: Number(sel.free_qty),
                                      totalQty: Number(sel.gross_qty),
                                      rate: Number(sel.mrp),
                                      discountPercent: Number(
                                        sel.discount_percent,
                                      ),
                                      discountAmt: Number(sel.discount_amount),
                                      totalAmount: Number(sel.line_total),
                                    };

                                    contracts[ci].items = items;
                                    form.setFieldsValue({ contracts });
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    );
                                  }}
                                >
                                  {contractItems.map((it) => (
                                    <Select.Option
                                      key={it.product_id}
                                      value={it.product_name}
                                    >
                                      {it.product_name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>

                            {/* CODE */}
                            <Col span={4}>
                              <Form.Item
                                name={[itf.name, "itemCode"]}
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
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                            {/* GROSS WT */}
                            {/* <Col span={3}>
                              <Form.Item
                                name={[itf.name, "grossWt"]}
                                label="Gross Wt"
                              >
                                <InputNumber
                                  className="w-full"
                                  onChange={() =>
                                    onFormValuesChange(
                                      form,
                                      form.getFieldsValue(),
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col> */}

                            {/* TOTAL GROSS WT */}
                            {/* <Col span={3}>
                              <Form.Item
                                name={[itf.name, "totalGrossWt"]}
                                label="Total Gross Wt"
                              >
                                <InputNumber className="w-full" disabled />
                              </Form.Item>
                            </Col> */}

                            {/* DELETE BUTTON */}
                          </Row>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              removeItem(itf.name);
                              onFormValuesChange(form, form.getFieldsValue());
                            }}
                          />
                        </div>
                      ))}

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
          <Form.Item label="Customer Name" name="customer_id">
            <Select
              placeholder="Select Customer"
              onChange={async (customerId) => {
                const customer = contractPersonOptions.find(
                  (c) => c.customer_id === customerId,
                );

                // set customer name if needed elsewhere
                form.setFieldsValue({
                  customerName: customer?.name,
                });

                // fetch contracts for this customer
                const contracts = await getContractDetailsbyPerson(customerId);
                setContractOptions(contracts);

                // reset downstream data
                setContractItems([]);
                form.setFieldsValue({ contract_id: undefined });
              }}
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

        {/* <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Company</span>}
            name="companyName"
            rules={[{ required: true }]}
          >
            <Input placeholder="Company" disabled={disabled} />
          </Form.Item>
        </Col> */}
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

        {/* <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Depo Name</span>} name="depoName">
            <Select placeholder="Depo" disabled={disabled}>
              {salesOrderJSON.depoOptions.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col> */}

        {/* <Col span={6}>
          <Form.Item label={<span className="text-amber-700">Broker Name</span>} name="brokerName">
            <Select placeholder="Broker" disabled={disabled}>
              {salesOrderJSON.brokerOptions.map((b) => <Select.Option key={b} value={b}>{b}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col> */}
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Status</span>}
            name="status"
          >
            <Select placeholder="pending" disabled={disabled}></Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* contracts + items */}
      <ContractsFormList form={form} />

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
