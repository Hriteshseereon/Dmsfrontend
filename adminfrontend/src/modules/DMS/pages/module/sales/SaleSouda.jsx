// SalesSouda.jsx
import React, { useState, useEffect, useMemo } from "react";
import useSessionStore from "../../../../../store/sessionStore";
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
  getSalescontractGroups,
} from "../../../../../api/sales";
/** trimmed/embedded seed data (same as you provided) */
const salesSoudaJSONModified2 = {
  statusOptions: ["Approved", "Pending", "Rejected"],

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
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  // const [vendorItems, setVendorItems] = useState([]);
  const [vendorProductsMap, setVendorProductsMap] = useState({});
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [allSalesGroups, setAllSalesGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState(salesSoudaJSONModified2.initialData);
  const { currentOrgId } = useSessionStore.getState();
  // get the all customer data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        // assume response = [{ id, name }]
        console.log("Fetched customers:", res);
        setCustomers(res || []);
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    };

    fetchCustomers();
  }, []);

  // get all product by vendor id
  useEffect(() => {
    if (!selectedVendorId) return;

    const fetchVendorProducts = async () => {
      try {
        const res = await getproductbyVendor(selectedVendorId);
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
        const res = await getVendors();
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
    const fetchSalesContracts = async () => {
      try {
        const res = await getSalescontractGroups(); // or whatever API fetches all contracts
        console.log("Fetched sales contracts:", res);

        // Map the API response to table format
        const mappedData = (res || []).map((contract) => ({
          key: contract.sale_contract_id,
          saleContractNumber: contract.sale_contract_number,
          customer: contract.customer_name,
          startDate: contract.from_date,
          endDate: contract.to_date,
          status: contract.status,
          items: contract.items,
          grandTotal: contract.grand_total,
        }));

        setData(mappedData);
      } catch (err) {
        console.error("Failed to fetch sales contracts", err);
      }
    };

    fetchSalesContracts();
  }, []);

  // payload for create sales contract
  const buildCreateContractPayload = (values) => {
    // First, build items to calculate taxable amount
    const items = (values.items || []).map((it) => {
      const netQty = Number(it.qty || 0);
      const freeQty = Number(it.freeQty || 0);
      const grossQty = netQty + freeQty;
      const mrp = Number(it.rate || 0);
      const discountPercent = Number(it.discountPercent || 0);
      const grossAmount = netQty * mrp;
      const discountAmount = (grossAmount * discountPercent) / 100;

      return {
        vendor_id: it.vendorId,
        product_id: it.item,
        uom: it.uom ? it.uom.toLowerCase() : null,
        net_qty: netQty,
        gross_qty: grossQty,
        free_qty: freeQty,
        mrp,
        discount_percent: discountPercent,
        discount_amount: Number(discountAmount.toFixed(2)), // ✅ Round to 2 decimals
        line_total: Number((grossAmount - discountAmount).toFixed(2)), // ✅ Round to 2 decimals
      };
    });

    // Calculate taxable amount from items

    // Calculate tax amounts and round to 2 decimal places

    return {
      organisation: currentOrgId,
      customer_id: values.customerId,
      from_date: values.startDate
        ? dayjs(values.startDate).format("YYYY-MM-DD")
        : null,
      to_date: values.endDate
        ? dayjs(values.endDate).format("YYYY-MM-DD")
        : null,
      customer_mobile: values.customerMobile || "",
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

  // derive company options (from seed and existing data)
  // const companyOptions = useMemo(() => {
  //   const fromData = Array.from(
  //     new Set(
  //       data
  //         .flatMap((d) => (d.items || []).map((it) => it.companyName))
  //         .filter(Boolean),
  //     ),
  //   );
  //   const topLevel = Array.from(
  //     new Set(data.map((d) => d.companyName).filter(Boolean)),
  //   );
  //   return Array.from(
  //     new Set([
  //       ...fromData,
  //       ...topLevel,
  //       "ABC Oils Ltd",
  //       "RUCHI SOYA INDUSTRIES LIMITED",
  //     ]),
  //   );
  // }, [data]);

  // const filteredData = data.filter((d) =>
  //   ["customer", "status"].some((field) =>
  //     (d[field] || "")
  //       .toString()
  //       .toLowerCase()
  //       .includes(searchText.toLowerCase()),
  //   ),
  // );

  // compute per-item + order totals
  const computeFromFormValues = (values) => {
    const items = (values.items || []).map((it, idx) => {
      const qty = Number(it.qty || 0);
      const freeQty = Number(it.freeQty || 0);
      const rate = Number(it.rate || 0);
      const discountPercent = Number(it.discountPercent || 0);
      const grossWt = Number(it.grossWt || 0);

      const totalQty = qty + freeQty;
      const grossAmount = qty * rate;
      const discountAmt = (grossAmount * discountPercent) / 100;

      return {
        ...it,
        lineKey: it.lineKey || idx + 1,
        totalQty,
        grossAmount,
        discountAmt,
        totalGrossWt: grossWt,
      };
    });

    const grossAmountTotal = items.reduce(
      (s, it) => s + Number(it.grossAmount || 0),
      0,
    );
    const discountTotal = items.reduce(
      (s, it) => s + Number(it.discountAmt || 0),
      0,
    );
    const taxableAmount = grossAmountTotal - discountTotal;

    const sgstPercent = Number(values.orderTaxAndTotals?.sgstPercent || 0);
    const cgstPercent = Number(values.orderTaxAndTotals?.cgstPercent || 0);
    const igstPercent = Number(values.orderTaxAndTotals?.igstPercent || 0);
    const tcsAmt = Number(values.orderTaxAndTotals?.tcsAmt || 0);

    const sgst = (taxableAmount * sgstPercent) / 100;
    const cgst = (taxableAmount * cgstPercent) / 100;
    const igst = (taxableAmount * igstPercent) / 100;
    const totalGST = sgst + cgst + igst;

    const grandTotal = taxableAmount + totalGST + tcsAmt;

    const qtyTotal = items.reduce((s, it) => s + Number(it.qty || 0), 0);
    const freeQtyTotal = items.reduce(
      (s, it) => s + Number(it.freeQty || 0),
      0,
    );
    const totalQty = qtyTotal + freeQtyTotal;

    return {
      items,
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
        totalQty,
      },
    };
  };

  // Add these functions before the return statement
  const mapApiRecordToForm = (record) => {
    return {
      saleContractNumber: record.saleContractNumber,
      customer: record.customer,
      status: record.status,

      soudaDate: record.created_at ? dayjs(record.created_at) : undefined,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,

      items: (record.items || []).map((it, idx) => ({
        lineKey: it.id || idx + 1,

        vendorId: it.vendor_id,
        vendorName: it.vendor_name,

        item: it.product_id,
        itemName: it.product_name,

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

  const openView = (record) => {
    const mapped = mapApiRecordToForm(record);

    setSelectedRecord(record);
    viewForm.setFieldsValue(mapped);
    setIsViewModalOpen(true);
  };

  const openEdit = (record) => {
    const mapped = mapApiRecordToForm(record);

    setSelectedRecord(record);
    editForm.setFieldsValue(mapped);
    setIsEditModalOpen(true);
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
      title: <span className="text-amber-700 font-semibold">Start Date</span>,
      dataIndex: "startDate",
      width: 110,
      render: (date) => (
        <span className="text-amber-800">
          {date ? dayjs(date).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },

    // {
    //   title: <span className="text-amber-700 font-semibold">End Date</span>,
    //   dataIndex: "endDate",
    //   width: 110,
    //   render: (date) => dayjs(date).format("YYYY-MM-DD"),
    // },

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
          {items.length ? items.map((i) => i.product_name).join(" • ") : "-"}
        </span>
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
          {status}
        </span>
      ),
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
          <EyeOutlined onClick={() => openView(record)} />
          <EditOutlined onClick={() => openEdit(record)} />
        </div>
      ),
    },
  ];

  // ItemsTable (Form.List) — moved company selection into each item row
  const ItemsTable = ({ form, allowRemove = true, allowAdd = true }) => {
    return (
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            <div className="mb-2 flex justify-between items-center">
              <h6 className="text-amber-500">Items</h6>
              {allowAdd && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      lineKey: Date.now(),
                      vendorId: undefined,
                      item: undefined,
                      itemCode: undefined,
                      uom: undefined,
                      qty: 0,
                      freeQty: 0,
                      totalQty: 0,
                      rate: 0,
                      discountPercent: 0,
                      discountAmt: 0,
                      grossWt: 0,
                      totalGrossWt: 0,
                      grossAmount: 0,
                    })
                  }
                >
                  Add Item
                </Button>
              )}
            </div>

            {fields.map((field, idx) => {
              // ✅ vendorId PER ROW
              const vendorId = form.getFieldValue([
                "items",
                field.name,
                "vendorId",
              ]);

              // ✅ products PER ROW
              const productList = Array.isArray(vendorProductsMap[vendorId])
                ? vendorProductsMap[vendorId]
                : [];

              return (
                <div
                  key={field.key}
                  className="mb-4 p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-amber-700 font-semibold">
                      Item #{idx + 1}
                    </div>
                    {allowRemove && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </div>

                  <Row gutter={16}>
                    {/* COMPANY / VENDOR */}
                    <Col span={6}>
                      <Form.Item
                        label={<span className="text-amber-700">Company</span>}
                        name={[field.name, "vendorId"]}
                        rules={[{ required: true, message: "Select company" }]}
                      >
                        <Select
                          placeholder="Select Company"
                          onChange={async (vendorId) => {
                            if (!vendorProductsMap[vendorId]) {
                              const res = await getproductbyVendor(vendorId);

                              setVendorProductsMap((prev) => ({
                                ...prev,
                                [vendorId]: Array.isArray(res?.products)
                                  ? res.products
                                  : [],
                              }));
                            }

                            // reset dependent fields
                            form.setFields([
                              {
                                name: ["items", field.name, "item"],
                                value: undefined,
                              },
                              {
                                name: ["items", field.name, "itemCode"],
                                value: undefined,
                              },
                              {
                                name: ["items", field.name, "uom"],
                                value: undefined,
                              },
                            ]);
                          }}
                        >
                          {vendors.map((v) => (
                            <Select.Option key={v.id} value={v.id}>
                              {v.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* ITEM */}
                    <Col span={6}>
                      <Form.Item
                        label={<span className="text-amber-700">Item</span>}
                        name={[field.name, "item"]}
                        rules={[{ required: true, message: "Select item" }]}
                      >
                        <Select
                          placeholder="Select Item"
                          disabled={!vendorId}
                          onChange={(productId) => {
                            const selected = productList.find(
                              (p) => p.id === productId,
                            );

                            form.setFields([
                              {
                                name: ["items", field.name, "itemCode"],
                                value: selected?.hsn_code_value,
                              },
                              {
                                name: ["items", field.name, "uom"],
                                value: selected?.base_unit,
                              },
                            ]);
                          }}
                        >
                          {productList.map((p) => (
                            <Select.Option key={p.id} value={p.id}>
                              {p.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* CODE */}
                    <Col span={4}>
                      <Form.Item
                        label={<span className="text-amber-700">Code</span>}
                        name={[field.name, "itemCode"]}
                      >
                        <Input disabled />
                      </Form.Item>
                    </Col>

                    {/* UOM */}
                    <Col span={4}>
                      <Form.Item
                        label={<span className="text-amber-700">UOM</span>}
                        name={[field.name, "uom"]}
                      >
                        <Input disabled />
                      </Form.Item>
                    </Col>

                    {/* QTY */}
                    <Col span={4}>
                      <Form.Item
                        label={<span className="text-amber-700">Qty</span>}
                        name={[field.name, "qty"]}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* FREE QTY */}
                    <Col span={4}>
                      <Form.Item
                        label={<span className="text-amber-700">Free Qty</span>}
                        name={[field.name, "freeQty"]}
                      >
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* TOTAL QTY */}
                    <Col span={4}>
                      <Form.Item
                        label={
                          <span className="text-amber-700">Total Qty</span>
                        }
                        name={[field.name, "totalQty"]}
                      >
                        <InputNumber disabled className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* RATE */}
                    <Col span={4}>
                      <Form.Item
                        label={<span className="text-amber-700">Rate (₹)</span>}
                        name={[field.name, "rate"]}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* DISCOUNT */}
                    <Col span={4}>
                      <Form.Item
                        label={
                          <span className="text-amber-700">Discount %</span>
                        }
                        name={[field.name, "discountPercent"]}
                      >
                        <InputNumber min={0} max={100} className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* GROSS */}
                    <Col span={4}>
                      <Form.Item
                        label={
                          <span className="text-amber-700">Gross Amount</span>
                        }
                        name={[field.name, "grossAmount"]}
                      >
                        <InputNumber disabled className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* GROSS WT */}
                    <Col span={6}>
                      <Form.Item
                        label={<span className="text-amber-700">Gross Wt</span>}
                        name={[field.name, "grossWt"]}
                      >
                        <InputNumber min={0} className="w-full" />
                      </Form.Item>
                    </Col>

                    {/* TOTAL GROSS WT */}
                    <Col span={6}>
                      <Form.Item
                        label={
                          <span className="text-amber-700">Total Gross Wt</span>
                        }
                        name={[field.name, "totalGrossWt"]}
                      >
                        <InputNumber disabled className="w-full" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              );
            })}
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

      // ✅ Add the new row to the table data
      setData((prev) => [row, ...prev]);
      setIsAddModalOpen(false);
      addForm.resetFields();

      // ✅ Optional: Show success message
      console.log("Sales contract created successfully:", row);
    } catch (error) {
      console.error("Failed to create sales contract", error);
      // 🔍 Log the error response
      console.error("Error response:", error.response?.data);
    }
  };
  const handleEditFinish = (values) => {
    const computed = computeFromFormValues(values);
    const payload = {
      ...values,
      items: computed.items,
      orderTaxAndTotals: computed.orderTaxAndTotals,
      orderTotals: computed.orderTotals,
      key: selectedRecord.key,
      soudaDate: values.soudaDate
        ? dayjs(values.soudaDate).format("YYYY-MM-DD")
        : undefined,
      startDate: values.startDate
        ? dayjs(values.startDate).format("YYYY-MM-DD")
        : undefined,
      endDate: values.endDate
        ? dayjs(values.endDate).format("YYYY-MM-DD")
        : undefined,
    };

    setData((prev) => prev.map((d) => (d.key === payload.key ? payload : d)));
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedRecord(null);
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

  // when opening edit modal, preload startDate/endDate (dayjs) + items
  // useEffect(() => {
  //   if (isEditModalOpen && selectedRecord) {
  //     const preloaded = {
  //       ...selectedRecord,
  //       soudaDate: selectedRecord.soudaDate
  //         ? dayjs(selectedRecord.soudaDate)
  //         : undefined,
  //       startDate: selectedRecord.startDate
  //         ? dayjs(selectedRecord.startDate)
  //         : undefined,
  //       endDate: selectedRecord.endDate
  //         ? dayjs(selectedRecord.endDate)
  //         : undefined,
  //     };
  //     editForm.setFieldsValue(preloaded);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isEditModalOpen, selectedRecord]);

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
            onClick={() => {
              addForm.resetFields();
              addForm.setFieldsValue({
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
                startDate: dayjs().startOf("month"),
                endDate: dayjs().endOf("month"),
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
          <span className="text-amber-700 text-2xl font-semibold">
            Add Sales Contract
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddFinish}
          onValuesChange={handleAddValuesChange}
        >
          <h6 className="text-amber-500">Basic Information</h6>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Souda Date</span>}
                name="soudaDate"
                rules={[{ required: true }]}
                initialValue={dayjs()}
              >
                <DatePicker className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Start Date</span>}
                name="startDate"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">End Date</span>}
                name="endDate"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={6}>
              {/* <Form.Item
                label={<span className="text-amber-700">Customer Name</span>}
                name="customer"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter Customer Name" />
              </Form.Item> */}
              <Form.Item
                label={<span className="text-amber-700">Customer Name</span>}
                name="customerId"
                rules={[{ required: true, message: "Select customer" }]}
              >
                <Select
                  placeholder="Select Customer"
                  onChange={(value, option) => {
                    // store vendor/customer id
                    setSelectedVendorId(value);

                    // OPTIONAL: also store customer name if needed
                    addForm.setFieldsValue({
                      customer: option.label,
                    });
                  }}
                >
                  {customers.map((c) => (
                    <Select.Option
                      key={c.id}
                      value={c.customer_id}
                      label={c.name}
                    >
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Customer Email</span>}
                name="customerEmail"
              >
                <Input placeholder="Customer Email" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Customer Mobile</span>}
                name="customerMobile"
              >
                <Input placeholder="Customer Mobile" />
              </Form.Item>
            </Col>
            <Col span={6}>
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

            {/* <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Location</span>}
                name="location"
              >
                <Select placeholder="Select Location">
                  {salesSoudaJSONModified2.locationOptions.map((s) => (
                    <Select.Option key={s} value={s}>
                      {s}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}

            <Col span={6}>
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
            </Col>
          </Row>

          <Divider />

          {/* Items */}
          <ItemsTable form={addForm} allowRemove={true} allowAdd={true} />

          <Divider />

          {/* Tax & totals */}
          <h6 className="text-amber-500">Tax, Charges & Others</h6>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">SGST %</span>}
                name={["orderTaxAndTotals", "sgstPercent"]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">CGST %</span>}
                name={["orderTaxAndTotals", "cgstPercent"]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">IGST %</span>}
                name={["orderTaxAndTotals", "igstPercent"]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">TCS Amt (₹)</span>}
                name={["orderTaxAndTotals", "tcsAmt"]}
              >
                <InputNumber className="w-full" min={0} />
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
                label={
                  <span className="text-amber-700">Discount Total (₹)</span>
                }
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
        width={920}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFinish}
          onValuesChange={handleEditValuesChange}
        >
          <h6 className="text-amber-500">Basic Information</h6>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Souda Date</span>}
                name="soudaDate"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Start Date</span>}
                name="startDate"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">End Date</span>}
                name="endDate"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Customer Name</span>}
                name="customer"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter Customer Name" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Customer Email</span>}
                name="customer_email"
              >
                <Input placeholder="Customer Email" />
              </Form.Item>
            </Col>

            <Col span={6}>
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

          <Divider />

          <ItemsTable form={editForm} allowRemove={false} allowAdd={false} />

          <Divider />

          <h6 className="text-amber-500">Tax, Charges & Others</h6>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">SGST %</span>}
                name={["orderTaxAndTotals", "sgstPercent"]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">CGST %</span>}
                name={["orderTaxAndTotals", "cgstPercent"]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">IGST %</span>}
                name={["orderTaxAndTotals", "igstPercent"]}
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">TCS Amt (₹)</span>}
                name={["orderTaxAndTotals", "tcsAmt"]}
              >
                <InputNumber className="w-full" min={0} />
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
                label={
                  <span className="text-amber-700">Discount Total (₹)</span>
                }
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
        title="View Sales Souda"
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          viewForm.resetFields();
        }}
        footer={null}
        width={920}
      >
        <Form layout="vertical" form={viewForm} initialValues={{}}>
          <h6 className="text-amber-500">Basic Information</h6>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Souda Date</span>}
                name="soudaDate"
              >
                <DatePicker className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Start Date</span>}
                name="startDate"
              >
                <DatePicker className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">End Date</span>}
                name="endDate"
              >
                <DatePicker className="w-full" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Customer Name</span>}
                name="customerEmail"
              >
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Customer Email</span>}
                name="customer_email"
              >
                <Input disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Status</span>}
                name="status"
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <h6 className="text-amber-500">Items</h6>
          <div className="mb-2 text-sm font-semibold text-amber-700 grid grid-cols-12 gap-2">
            <div className="col-span-3">Company</div>
            <div className="col-span-3">Item</div>
            <div className="col-span-1">UOM</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-1">Free</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1">Rate</div>
            <div className="col-span-1">Gross</div>
          </div>

          {(selectedRecord?.items || []).map((it) => (
            <div
              key={it.lineKey}
              className="grid grid-cols-12 gap-2 items-center py-2 border-b"
            >
              <div className="col-span-3 text-amber-800">{it.vendor_name}</div>
              <div className="col-span-3 text-amber-800">{it.product_name}</div>
              <div className="col-span-1 text-amber-800">
                {it.uom?.unit_name || "-"}
              </div>
              <div className="col-span-1 text-amber-800">{it.net_qty}</div>
              <div className="col-span-1 text-amber-800">{it.free_qty}</div>
              <div className="col-span-1 text-amber-800">{it.gross_qty}</div>
              <div className="col-span-1 text-amber-800">{it.mrp}</div>
              <div className="col-span-1 text-amber-800">{it.grossAmount}</div>
            </div>
          ))}

          <Divider />

          <h6 className="text-amber-500">Tax, Charges & Others</h6>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">SGST %</span>}
                name={["orderTaxAndTotals", "sgstPercent"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.sgstPercent}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">CGST %</span>}
                name={["orderTaxAndTotals", "cgstPercent"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.cgstPercent}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">IGST %</span>}
                name={["igst"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.igstPercent}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">TCS Amt (₹)</span>}
                name={["orderTaxAndTotals", "tcsAmt"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.tcsAmt}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Gross Total (₹)</span>}
                name={["orderTaxAndTotals", "grossAmountTotal"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.grossAmountTotal}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span className="text-amber-700">Discount Total (₹)</span>
                }
                name={["orderTaxAndTotals", "discountTotal"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.discountTotal}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Total GST (₹)</span>}
                name={["orderTaxAndTotals", "totalGST"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.totalGST}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={<span className="text-amber-700">Grand Total (₹)</span>}
                name={["orderTaxAndTotals", "grandTotal"]}
              >
                <Input
                  disabled
                  value={selectedRecord?.orderTaxAndTotals?.grandTotal}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
