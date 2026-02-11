import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Tag,
  Divider,
  message,
  Space,
} from "antd";
import * as XLSX from "xlsx";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Wallet from "./Wallet";
import { getOrders, getContracts, getContractById, createOrder, getOrderById } from "../api/order";
import useSessionStore from "../store/sessionStore";

const API_CONFIG = {
  fetchData: () => contractJSON.initialData,
  saveData: (data) => data,
  updateData: (data) => data,
  fetchContracts: () => contractJSON.contractOptions,
};


/* ---------- utilities: compute item and order totals ---------- */
const computeOrderTotalsFromContracts = (contracts = [], orderTax = {}) => {
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
    0
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

const ContractsFormList = ({ form, contractsOptions, contractItemsMap, setContractItemsMap, onFormValuesChange }) => (
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
                  label="Contract No"
                  name={[cf.name, "contract_id"]}
                >
                  <Select
                    placeholder="Select Contract"
                    onChange={async (contractId) => {
                      // Fetch contract details (API call)
                      const contract = contractsOptions.find(c => c.sale_contract_id === contractId);
                      if (!contract) return;

                      let items = [];
                      try {
                        const res = await getContractById(contractId);
                        // Map items response from getContractById to UI expected format
                        items = (res.items || []).map((it) => ({
                          product_name: it.product?.product_name || it.product_name,
                          product_id: it.product?.product_id || it.product_id,
                          hsn_code: it.hsn_code,
                          uom: { unit_name: it.uom?.unit_name },
                          net_qty: it.net_qty,
                          free_qty: it.free_qty,
                          gross_qty: it.gross_qty,
                          mrp: it.mrp,
                          discount_percent: it.discount_percent,
                          discount_amount: it.discount_amount,
                          line_total: it.line_total
                        }));
                      } catch (e) {
                        console.error("Error fetching contract items", e);
                      }

                      setContractItemsMap((prev) => ({
                        ...prev,
                        [ci]: items,
                      }));

                      const mappedItems = items.map((it) => ({
                        lineKey: Date.now() + Math.random(),
                        item: it.product_name,
                        itemCode: it.product_id,
                        hsnCode: it.hsn_code,
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
                    {contractsOptions.map((c) => (
                      <Select.Option
                        key={c.sale_contract_id}
                        value={c.sale_contract_id}
                      >
                        {c.contractNo} — {c.companyName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeContract(cf.name)}
                  className="ml-2"
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
                                showSearch
                                optionFilterProp="children"
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
                                    hsnCode: sel.hsn_code,
                                    uom: sel.uom?.unit_name,
                                    qty: Number(sel.net_qty),
                                    freeQty: Number(sel.free_qty),
                                    totalQty: Number(sel.gross_qty),
                                    rate: Number(sel.mrp),
                                    discountPercent: Number(
                                      sel.discount_percent || 0,
                                    ),
                                    discountAmt: Number(sel.discount_amount || 0),
                                    totalAmount: Number(sel.line_total || 0),
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

const STATUS_FILTERS = [
  "All",
  "Fresh",
  "Approved",
  "Pending",
  "InTransit",
  "OutForDelivery",
  "Delivered",
];

const contractJSON = {
  initialData: [
    {
      key: 1,
      orderGroupId: "ORD-2025-001",
      contractNo: "SC-001",
      orderDate: "2025-10-01",
      companyName: "ABC Oils Ltd",
      item: "Mustard Oil",
      qty: 2000,
      uom: "Ltrs",
      itemcode: "MO-001",
      deliveryDate: "2025-10-15",
      deliveryAddress: "BBSR",
      status: "Approved",
      totalAmt: 250000,
      rate: 125,
      NetQty: 10,
      GrossQty: 12,
      HSNCode: 1514,
      IGST: 12,
      CashDiscount: 5,
      PurchaseType: "Local",
      BillMode: "Online",
      ExpReceivingDate: "2025-10-18",
      Narration: "Standard delivery order",
    },
    {
      key: 2,
      orderGroupId: "ORD-2025-001",
      contractNo: "SC-002",
      orderDate: "2025-10-01",
      companyName: "XYZ Refineries",
      item: "Sunflower Oil",
      qty: 1000,
      uom: "Ltrs",
      itemcode: "SO-002",
      deliveryDate: "2025-10-15",
      deliveryAddress: "BBSR",
      status: "InTransit",
      totalAmt: 110000,
      rate: 110,
      NetQty: 8,
      GrossQty: 10,
      HSNCode: 1512,
      IGST: 18,
      CashDiscount: 3,
      PurchaseType: "Interstate",
      BillMode: "Offline",
      ExpReceivingDate: "2025-10-17",
      Narration: "Urgent interstate delivery",
    },
    {
      key: 3,
      orderGroupId: "ORD-2025-002",
      contractNo: "SC-003",
      orderDate: "2025-10-05",
      companyName: "PQR Traders",
      item: "Coconut Oil",
      qty: 500,
      uom: "Ltrs",
      itemcode: "CO-002",
      deliveryDate: "2025-10-20",
      deliveryAddress: "BBSR",
      status: "Pending",
      totalAmt: 65000,
      rate: 130,
      NetQty: 5,
      GrossQty: 6,
      HSNCode: 1513,
      IGST: 12,
      CashDiscount: 2,
      PurchaseType: "Local",
      BillMode: "Online",
      ExpReceivingDate: "2025-10-25",
      Narration: "Pending approval",
    },
    {
      key: 4,
      orderGroupId: "ORD-2025-002",
      contractNo: "SC-003",
      orderDate: "2025-10-05",
      companyName: "PQR Traders",
      item: "Palm Oil",
      qty: 300,
      uom: "Ltrs",
      itemcode: "PO-003",
      deliveryDate: "2025-10-20",
      deliveryAddress: "BBSR",
      status: "Pending",
      totalAmt: 39000,
      rate: 130,
      NetQty: 3,
      GrossQty: 4,
      HSNCode: 1511,
      IGST: 18,
      CashDiscount: 4,
      PurchaseType: "Local",
      BillMode: "Offline",
      ExpReceivingDate: "2025-10-22",
      Narration: "Standard order pending",
    },
    {
      key: 5,
      orderGroupId: "ORD-2025-003",
      contractNo: "SC-001",
      orderDate: "2025-10-10",
      companyName: "ABC Oils Ltd",
      item: "Mustard Oil",
      qty: 500,
      uom: "Ltrs",
      itemcode: "MO-001",
      deliveryDate: "2025-10-25",
      deliveryAddress: "BBSR",
      status: "Delivered",
      totalAmt: 62500,
      rate: 125,
      NetQty: 5,
      GrossQty: 6,
      HSNCode: 1514,
      IGST: 12,
      CashDiscount: 5,
      PurchaseType: "Local",
      BillMode: "Online",
      ExpReceivingDate: "2025-10-28",
      deliveredDate: "2025-10-25",
      Narration: "Delivered order",
    },
    {
      key: 6,
      orderGroupId: "ORD-2025-004",
      contractNo: "SC-002",
      orderDate: "2025-10-12",
      companyName: "XYZ Refineries",
      item: "Sunflower Oil",
      qty: 400,
      uom: "Ltrs",
      itemcode: "SO-002",
      deliveryDate: "2025-10-27",
      deliveryAddress: "BBSR",
      status: "OutForDelivery",
      totalAmt: 44000,
      rate: 110,
      NetQty: 4,
      GrossQty: 5,
      HSNCode: 1512,
      IGST: 18,
      CashDiscount: 3,
      PurchaseType: "Interstate",
      BillMode: "Offline",
      ExpReceivingDate: "2025-10-30",
      Narration: "Out for delivery",
    },
  ],
  contractOptions: [
    {
      contractNo: "SC-001",
      companyName: "ABC Oils Ltd",
      items: [
        {
          item: "Mustard Oil",
          uomOptions: ["Ltrs", "Box"],
          conversion: { Ltrs: 1, Box: 12 },
          rate: 125,
          itemcode: "MO-001",
          restQty: 5000,
        },
        {
          item: "Palm Oil",
          uomOptions: ["Ltrs", "Box"],
          conversion: { Ltrs: 1, Box: 10 },
          rate: 125,
          itemcode: "PO-001",
          restQty: 1500,
        },
      ],
    },
    {
      contractNo: "SC-002",
      companyName: "XYZ Refineries",
      items: [
        {
          item: "Sunflower Oil",
          uomOptions: ["Ltrs", "Box"],
          conversion: { Ltrs: 1, Box: 12 },
          rate: 110,
          itemcode: "SO-002",
          restQty: 3000,
        },
        {
          item: "Coconut Oil",
          uomOptions: ["Ltrs", "Box"],
          conversion: { Ltrs: 1, Box: 8 },
          rate: 140,
          itemcode: "CO-002",
          restQty: 800,
        },
      ],
    },
    {
      contractNo: "SC-003",
      companyName: "PQR Traders",
      items: [
        {
          item: "Coconut Oil",
          uomOptions: ["Ltrs", "Box"],
          conversion: { Ltrs: 1, Box: 8 },
          rate: 130,
          itemcode: "CO-003",
          restQty: 1200,
        },
        {
          item: "Palm Oil",
          uomOptions: ["Ltrs", "Box"],
          conversion: { Ltrs: 1, Box: 10 },
          rate: 130,
          itemcode: "PO-003",
          restQty: 1200,
        },
      ],
    },
  ],
  uomOptions: ["Ltrs", "Box", "Kg"],
};

const emptyItem = {
  item: undefined,
  uom: undefined,
  rate: 0,
  totalAmt: 0,
  key: undefined,
};

const emptyContract = {
  contractNo: undefined,
  companyName: undefined,
  items: [emptyItem],
};

const initialOrderGroup = {
  deliveryDate: dayjs().add(3, "day"),
  contracts: [emptyContract],
};

const downloadInvoiceExcel = (orderGroup) => {
  // Flatten data for Excel
  const rows = [];

  orderGroup.contracts.forEach((contract) => {
    contract.items.forEach((item) => {
      rows.push({
        OrderNo: orderGroup.orderGroupId,
        OrderDate: orderGroup.orderDate,
        DeliveryDate: orderGroup.deliveryDate,
        DeliveryAddress: orderGroup.deliveryAddress,
        Status: orderGroup.status,
        ContractNo: contract.contractNo,
        Vendor: contract.companyName,
        Item: item.item,
        ItemCode: item.itemcode,
        Qty: item.qty,
        UOM: item.uom,
        Rate: item.rate,
        Total: item.totalAmt,
        IGST: item.IGST,
        CashDiscount: item.CashDiscount,
        PurchaseType: item.PurchaseType,
        BillMode: item.BillMode,
        Narration: item.Narration,
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

  XLSX.writeFile(
    workbook,
    `${orderGroup.orderGroupId}_Invoice.xlsx`
  );
};
// pdated grouping with grandTotal
const groupDataByOrderGroup = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((order) => {
    // Check if it's the new format from API
    if (order.sales_order_id) {
      return {
        orderGroupId: order.order_number,
        key: order.sales_order_id,
        orderDate: order.order_date,
        deliveryDate: order.expected_receiving_date,
        deliveryAddress: order.delivery_address,
        status: order.status,
        grandTotal: Number(order.grand_total || 0),
        contracts: (order.summary || []).map((s) => ({
          contractNo: s.sale_contract_number,
          companyName: "", // The summary API doesn't provide vendor name
          items: (s.products || []).map((p, idx) => ({
            key: `${s.sale_contract_id}-${idx}`,
            item: p,
            // These missing fields will be 0/empty in the list view
            itemcode: "",
            qty: 0,
            uom: "",
            rate: 0
          })),
        })),
        flatKeys: [], // Not needed for new format
      };
    }

    // Fallback for any legacy data/format if it persists during transition
    const {
      orderGroupId,
      contractNo,
      item,
      qty,
      uom,
      itemcode,
      rate,
      totalAmt,
      key,
      ...rest
    } = order;

    // Simple check if this is already grouped or needs grouping
    if (order.contracts) return order;

    return {
      orderGroupId,
      key: orderGroupId,
      orderDate: rest.orderDate,
      deliveryDate: rest.deliveryDate,
      deliveryAddress: rest.deliveryAddress,
      status: rest.status,
      grandTotal: totalAmt || 0,
      contracts: [{
        contractNo,
        companyName: rest.companyName,
        items: [{
          item, qty, uom, itemcode, rate, totalAmt
        }]
      }]
    };
  });
};

// UOM handlers for conversion
// UOM handlers for conversion
const useUOMHandlers = (form, contractItemsMap) => {
  const handleUOMChange = useCallback((uom, contractIndex, itemIndex) => {
    const contracts = form.getFieldValue("contracts") || [];
    const items = contractItemsMap[contractIndex] || [];
    const currentItemName = contracts[contractIndex]?.items[itemIndex]?.item;
    const selectedItem = items.find(item => item.item === currentItemName);

    if (selectedItem?.conversion?.[uom]) {
      const baseRate = selectedItem.rate;
      const conversionFactor = selectedItem.conversion[uom];
      const newRate = baseRate / conversionFactor; // Rate per selected UOM

      const updatedContracts = contracts.map((c, ci) => {
        if (ci !== contractIndex) return c;
        const updatedItems = c.items.map((it, ii) => {
          if (ii !== itemIndex) return it;
          const qty = it.qty || 0;
          return {
            ...it,
            uom,
            rate: newRate,
            totalAmt: newRate * qty,
          };
        });
        return { ...c, items: updatedItems };
      });
      form.setFieldsValue({ contracts: updatedContracts });
    }
  }, [form, contractItemsMap]);

  const handleQtyChange = useCallback((qty, contractIndex, itemIndex) => {
    const contracts = form.getFieldValue("contracts") || [];
    const updatedContracts = contracts.map((c, ci) => {
      if (ci !== contractIndex) return c;
      const updatedItems = c.items.map((it, ii) => {
        if (ii !== itemIndex) return it;
        const rate = it.rate || 0;
        return {
          ...it,
          qty,
          totalAmt: rate * qty,
        };
      });
      return { ...c, items: updatedItems };
    });
    form.setFieldsValue({ contracts: updatedContracts });
  }, [form]);

  return { handleUOMChange, handleQtyChange };
};

const useFormHandlers = (form, contractItemsMap, setContractItemsMap, setSelectedItemMaxMap, contracts, isEdit = false) => {
  const handleSelectContract = useCallback(async (contractNo, contractIndex) => {
    const c = contracts.find((x) => x.contractNo === contractNo);
    if (!c) return;

    try {
      const contractDetails = await getContractById(c.sale_contract_id);
      const mappedItems = (contractDetails.items || []).map(item => ({
        item: item.product?.product_name || item.product_name || "Unknown",
        uomOptions: item.uom ? [item.uom.unit_name] : ["Ltrs"], // Fallback
        rate: Number(item.mrp || 0),
        itemcode: item.product?.product_code || item.product_code,
        restQty: Number(item.net_qty || 0),
        uom: item.uom?.unit_name,
        conversion: {} // Can try to map conversion if needed
      }));

      setContractItemsMap((prev) => ({
        ...prev,
        [contractIndex]: mappedItems,
      }));
    } catch (err) {
      console.error("Error fetching contract details:", err);
      message.error("Failed to fetch contract items");
      setContractItemsMap((prev) => ({
        ...prev,
        [contractIndex]: [],
      }));
    }

    const orders = form.getFieldValue("contracts") || [];
    const updated = orders.map((entry, idx) =>
      idx === contractIndex
        ? {
          ...entry,
          contractNo,
          companyName: c.companyName,
          items: [emptyItem],
        }
        : entry
    );
    form.setFieldsValue({ contracts: updated });
    setSelectedItemMaxMap((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(`${contractIndex}-`)) delete copy[k];
      });
      return copy;
    });
  }, [form, setContractItemsMap, setSelectedItemMaxMap, contracts]);

  const handleSelectItem = useCallback((itemName, contractIndex, itemIndex) => {
    const items = contractItemsMap[contractIndex] || [];
    const sel = items.find((it) => it.item === itemName);
    if (!sel) {
      setSelectedItemMaxMap((p) => ({
        ...p,
        [`${contractIndex}-${itemIndex}`]: 0,
      }));
      return;
    }
    const contractsVals = form.getFieldValue("contracts") || [];
    const updatedContracts = contractsVals.map((c, ci) => {
      if (ci !== contractIndex) return c;
      const updatedItems = (c.items || []).map((it, ii) =>
        ii === itemIndex
          ? {
            ...it,
            item: sel.item,
            uom: sel.uomOptions?.[0] || "Ltrs",
            itemcode: sel.itemcode,
            rate: sel.rate,
            qty: 0,
            totalAmt: 0,
          }
          : it
      );
      return { ...c, items: updatedItems };
    });
    form.setFieldsValue({ contracts: updatedContracts });
    setSelectedItemMaxMap((prev) => ({
      ...prev,
      [`${contractIndex}-${itemIndex}`]: sel.restQty || 0,
    }));
  }, [form, setSelectedItemMaxMap, contractItemsMap]);

  return { handleSelectContract, handleSelectItem };
};

export default function Order() {
  const { currentOrgId } = useSessionStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState(null);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [contractItemsMap, setContractItemsMap] = useState({});
  const [selectedItemMaxMap, setSelectedItemMaxMap] = useState({});
  const [walletOpen, setWalletOpen] = useState(false);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrgId) return;
      try {
        const [ordersRes, contractsRes] = await Promise.all([
          getOrders(),
          getContracts()
        ]);

        const orders = Array.isArray(ordersRes) ? ordersRes : ordersRes.results || [];
        setData(orders);

        const contractsData = Array.isArray(contractsRes) ? contractsRes : contractsRes.results || [];
        const mappedContracts = contractsData.map(c => ({
          contractNo: c.sale_contract_number,
          sale_contract_id: c.sale_contract_id,
          companyName: c.vendor_names ? c.vendor_names.join(", ") : (c.vendor_name || ""),
          items: []
        }));
        setContracts(mappedContracts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        message.error("Failed to fetch initial data");
      }
    };
    fetchData();
  }, [currentOrgId]);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const addUOMHandlers = useUOMHandlers(addForm, contractItemsMap);
  const editUOMHandlers = useUOMHandlers(editForm, contractItemsMap);

  const disablePastDates = (current) =>
    current && current < dayjs().startOf("day");

  const groupedData = useMemo(() => groupDataByOrderGroup(data), [data]);

  const filteredData = useMemo(() => {
    const searchFiltered = groupedData.filter((d) =>
      (d.orderGroupId || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (d.status || "").toLowerCase().includes(searchText.toLowerCase()) ||
      d.contracts.some(
        (c) =>
          c.contractNo.toLowerCase().includes(searchText.toLowerCase()) ||
          c.companyName.toLowerCase().includes(searchText.toLowerCase())
      )
    );

    if (selectedStatus === "All") {
      return searchFiltered;
    }
    return searchFiltered.filter((d) => d.status === selectedStatus);
  }, [groupedData, searchText, selectedStatus]);

  const handleStatusFilter = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  const getStatusTagProps = (status) => {
    const base = "px-3 py-1 rounded-full text-sm font-semibold";
    switch (status) {
      case "Approved":
        return {
          className: `${base} bg-green-100 text-green-700`,
          color: "green",
        };
      case "Fresh":
        return {
          className: `${base} bg-cyan-100 text-cyan-700`,
          color: "cyan",
        };
      case "Pending":
        return {
          className: `${base} bg-yellow-100 text-yellow-700`,
          color: "yellow",
        };
      case "InTransit":
        return {
          className: `${base} bg-blue-100 text-blue-700`,
          color: "blue",
        };
      case "OutForDelivery":
        return {
          className: `${base} bg-purple-100 text-purple-700`,
          color: "purple",
        };
      case "Delivered":
        return {
          className: `${base} bg-emerald-100 text-emerald-700`,
          color: "lime",
        };
      default:
        return {
          className: `${base} bg-gray-100 text-gray-700`,
          color: "default",
        };
    }
  };

  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Order No</span>,
      dataIndex: "orderGroupId",
      key: "orderGroupId",
      width: 120,
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Contract,Items & Vendor
        </span>
      ),
      key: "contractitems",
      width: 120,
      render: (_, record) => (
        <div className="space-y-2 text-amber-800">
          {record.contracts.map((contract) => (
            <div key={contract.contractNo}>
              {contract.contractNo} — {contract.companyName}
              {contract.items.map((item) => (
                <li key={item.key}>{item.item}</li>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Grand Total</span>
      ),
      key: "grandTotal",
      width: 120,
      render: (_, record) => (
        <span className="text-amber-800 ">
          ₹{record.grandTotal.toLocaleString()}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const { className } = getStatusTagProps(status);
        return <span className={className}>{status}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      key: "actions",
      width: 120,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={async () => {
              try {
                const res = await getOrderById(record.key);
                // Merge detail data with existing summary data
                const enriched = {
                  ...record,
                  purchaseType: res.purchase_type,
                  billMode: res.bill_mode,
                  narration: res.narration,
                  expReceivingDate: res.expected_receiving_date,
                };
                setSelectedOrderGroup(enriched);
                setIsViewModalOpen(true);
              } catch (e) {
                console.error("Error fetching order details", e);
                setSelectedOrderGroup(record);
                setIsViewModalOpen(true);
              }
            }}
          />

          {record.status === "Pending" && (
            <EditOutlined
              className="cursor-pointer! text-red-500!"
              onClick={() => openEditModal(record)}
            />
          )}

          {record.status === "Delivered" && (
            <Button
              size="small"
              className="bg-amber-500!  text-white! hover:bg-amber-600! border-none!"

              icon={<DownloadOutlined />}
              onClick={() => downloadInvoiceExcel(record)}
            >
              Invoice
            </Button>

          )}
        </div>
      ),
    }

  ];

  const openEditModal = useCallback(
    (record) => {
      if (record.status !== "Pending") return;
      const fullGroup = groupedData.find(
        (g) => g.orderGroupId === record.orderGroupId
      );
      if (!fullGroup) return;

      const initialContractItemsMap = {};
      const initialSelectedItemMaxMap = {};
      fullGroup.contracts.forEach((contract, contractIndex) => {
        const contractDetails = contractJSON.contractOptions.find(
          (c) => c.contractNo === contract.contractNo
        );
        if (contractDetails) {
          initialContractItemsMap[contractIndex] = contractDetails.items;
          contract.items.forEach((item, itemIndex) => {
            const contractItemDetail = contractDetails.items.find(
              (i) => i.item === item.item
            );
            const isExistingItem =
              item.key !== undefined && item.key !== null;
            const maxQty = contractItemDetail
              ? isExistingItem
                ? item.qty + (contractItemDetail.restQty || 0)
                : contractItemDetail.restQty || 0
              : 0;
            initialSelectedItemMaxMap[`${contractIndex}-${itemIndex}`] = maxQty;
          });
        }
      });

      setContractItemsMap(initialContractItemsMap);
      setSelectedItemMaxMap(initialSelectedItemMaxMap);
      const initialValues = {
        deliveryDate: fullGroup.deliveryDate
          ? dayjs(fullGroup.deliveryDate)
          : null,
        deliveryAddress: fullGroup.deliveryAddress,
        orderGroupId: fullGroup.orderGroupId,
        orderDate: fullGroup.orderDate ? dayjs(fullGroup.orderDate) : null,
        contracts: fullGroup.contracts.map((contract) => ({
          contractNo: contract.contractNo,
          companyName: contract.companyName,
          items: contract.items,
        })),
      };
      setSelectedOrderGroup(fullGroup);
      editForm.setFieldsValue(initialValues);
      setIsEditModalOpen(true);
    },
    [groupedData, editForm]
  );






  const RenderItemsList = useCallback(
    ({
      contractIndex,
      fields,
      operations,
      formInstance,
      handleSelectItem,
      uomHandlers,
      isEditMode = false,
    }) => {
      return fields.map((f) => {
        const itemDetails = formInstance.getFieldValue([
          "contracts",
          contractIndex,
          "items",
          f.name,
        ]);
        const maxQty = selectedItemMaxMap[`${contractIndex}-${f.name}`];
        const selectedItemConfig = (contractItemsMap[contractIndex] || [])
          .find((item) => item.item === itemDetails?.item);

        return (
          <div
            key={f.key}
            className="border! p-2! rounded! mb-2! relative! border-amber-300!"
          >
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item
                  name={[f.name, "item"]}
                  fieldKey={[f.fieldKey, "item"]}
                  label="Item"
                  rules={[{ required: true, message: "Select item" }]}
                >
                  <Select
                    placeholder="Select item"
                    onChange={(val) =>
                      handleSelectItem(val, contractIndex, f.name)
                    }
                  >
                    {(contractItemsMap[contractIndex] || []).map((it) => (
                      <Select.Option key={it.item} value={it.item}>
                        {it.item}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Form.Item
                name={[f.name, "qty"]}
                label="Qty"
                rules={[
                  {
                    required: true,
                    message: "Please enter quantity",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Value must be greater than or equal to 1",
                  },
                  {
                    validator: (_, value) => {
                      const maxQty =
                        selectedItemMaxMap[`${contractIndex}-${f.name}`];

                      if (
                        maxQty !== undefined &&
                        value !== undefined &&
                        value > maxQty
                      ) {
                        return Promise.reject(
                          new Error(`Qty cannot be greater than ${maxQty}`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber


                  controls
                  style={{ width: "100%" }}
                  placeholder="Enter Qty"
                  onChange={(val) =>
                    uomHandlers.handleQtyChange(val ?? 0, contractIndex, f.name)
                  }
                />
              </Form.Item>




              <Col span={4}>
                <Form.Item name={[f.name, "uom"]} label="UOM">
                  <Select
                    placeholder="Select UOM"
                    onChange={(val) => uomHandlers.handleUOMChange(val, contractIndex, f.name)}
                  >
                    {selectedItemConfig?.uomOptions?.map((uom) => (
                      <Select.Option key={uom} value={uom}>
                        {uom}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={[f.name, "itemcode"]} label="Item Code">
                  <Input
                    style={{ width: "100%" }}
                    disabled
                    value={itemDetails?.itemcode}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={[f.name, "rate"]} label="Rate">
                  <InputNumber
                    style={{ width: "100%" }}
                    disabled
                    value={itemDetails?.rate}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item name={[f.name, "totalAmt"]} label="Total">
                  <InputNumber
                    style={{ width: "100%" }}
                    disabled
                    value={itemDetails?.totalAmt}
                    formatter={(value) => `₹ ${value?.toLocaleString()}`}
                  />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => operations.remove(f.name)}
                />
              </Col>
              {isEditMode && <Form.Item name={[f.name, "key"]} hidden />}
            </Row>
          </div>
        );
      });
    },
    [contractItemsMap, selectedItemMaxMap, addUOMHandlers, editUOMHandlers]
  );

  const RenderContractsList = useCallback(
    ({
      fields,
      operations,
      formInstance,
      handleSelectContract,
      handleSelectItem,
      isEditMode = false,
    }) => {
      const uomHandlers = isEditMode ? editUOMHandlers : addUOMHandlers;
      return fields.map((field) => {
        const contractDetails = formInstance.getFieldValue([
          "contracts",
          field.name,
        ]);

        return (
          <div
            key={field.key}
            className="p-4 border border-amber-500 rounded-lg mb-4 relative"
          >
            <h3 className="text-amber-700 font-semibold mb-2">Contract Details</h3>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  name={[field.name, "contractNo"]}
                  fieldKey={[field.fieldKey, "contractNo"]}
                  label="Contract No"
                  rules={[{ required: true, message: "Select Contract" }]}
                >
                  <Select
                    placeholder="Select Contract"
                    onChange={(val) => handleSelectContract(val, field.name)}
                  >
                    {contracts.map((c) => (
                      <Select.Option key={c.contractNo} value={c.contractNo}>
                        {c.contractNo} — {c.companyName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={[field.name, "companyName"]}
                  fieldKey={[field.fieldKey, "companyName"]}
                  label="Vendor"
                >
                  <Input disabled value={contractDetails?.companyName} />
                </Form.Item>
              </Col>
            </Row>
            <Divider className="my-2" />
            <h4 className="text-amber-600 font-medium mb-2">Items</h4>
            <Form.List name={[field.name, "items"]}>
              {(itemsFields, itemsOps) => (
                <>
                  <RenderItemsList
                    contractIndex={field.name}
                    fields={itemsFields}
                    operations={itemsOps}
                    formInstance={formInstance}
                    handleSelectItem={handleSelectItem}
                    uomHandlers={uomHandlers}
                    isEditMode={isEditMode}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="dashed"
                      onClick={() => itemsOps.add(emptyItem)}
                      icon={<PlusOutlined />}
                      className="border-amber-400! text-amber-700! hover:bg-amber-100!"
                    >
                      Add Item
                    </Button>
                  </div>
                </>
              )}
            </Form.List>
            {fields.length > 1 && (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                className="absolute top-2 right-2 text-red-500"
                onClick={() => {
                  setContractItemsMap((prev) => {
                    const copy = { ...prev };
                    delete copy[field.name];
                    return copy;
                  });
                  setSelectedItemMaxMap((prev) => {
                    const copy = { ...prev };
                    Object.keys(copy).forEach((k) => {
                      if (k.startsWith(`${field.name}-`)) delete copy[k];
                    });
                    return copy;
                  });
                  operations.remove(field.name);
                }}
              >
                Remove Contract
              </Button>
            )}
          </div>
        );
      });
    },
    [RenderItemsList]
  );

  const renderOrderGroupView = useCallback((groupData) => {
    if (!groupData) return null;
    const {
      orderGroupId,
      orderDate,
      deliveryDate,
      status,
      grandTotal,
      contracts,
    } = groupData; const isApprovedStatus =
      status === "Approved" ||
      status === "OutForDelivery" ||
      status === "Delivered" ||
      status === "Fresh";

    const itemColumns = [
      { title: "Item", dataIndex: "item", key: "item", width: 120 },
      { title: "Item Code", dataIndex: "itemcode", key: "itemcode", width: 120 },
      {
        title: "Net Qty",
        dataIndex: "NetQty",
        key: "NetQty",
        width: 80,
        render: (val) => <span>{val}</span>,
      },
      {
        title: "Gross Qty",
        dataIndex: "GrossQty",
        key: "GrossQty",
        width: 90,
        render: (val) => <span>{val}</span>,
      },
      {
        title: "HSN Code",
        dataIndex: "HSNCode",
        key: "HSNCode",
        width: 90,
        render: (val) => <span>{val}</span>,
      },
      { title: "Qty", dataIndex: "qty", key: "qty", width: 70 },
      { title: "UOM", dataIndex: "uom", key: "uom", width: 60 },
      {
        title: "Rate",
        dataIndex: "rate",
        key: "rate",
        width: 80,
        render: (val) => <span>₹{val}</span>,
      },
      ...(isApprovedStatus
        ? [
          {
            title: "IGST",
            dataIndex: "IGST",
            key: "IGST",
            width: 70,
            render: (val) => <span>{val}%</span>,
          },
          {
            title: "Cash Disc",
            dataIndex: "CashDiscount",
            key: "CashDiscount",
            width: 80,
            render: (val) => <span>-{val}%</span>,
          },
        ]
        : []),
      {
        title: "Total",
        key: "total",
        width: 100,
        render: (_, record) => (
          <span>
            ₹
            {((record.qty || 0) * (record.rate || 0)).toLocaleString()}
          </span>
        ),
      },
    ];

    return (
      <div className="p-6">
        <Row
          gutter={24}
          className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6"
        >
          <Col span={4}>
            <div className="font-semibold text-amber-700 mb-1">Order No:</div>
            <div className="text-amber-500">{orderGroupId}</div>
          </Col>
          <Col span={4}>
            <div className="font-semibold text-amber-700 mb-1">Order Date:</div>
            <div className="text-amber-500">{orderDate}</div>
          </Col>
          <Col span={3}>
            <div className="font-semibold text-amber-700 mb-1">Status:</div>
            <Tag
              {...getStatusTagProps(status)}
              className="px-4 py-2"
            >
              {status}
            </Tag>
          </Col>
          <Col span={4}>
            <div className="font-semibold text-amber-700 mb-1">
              Expected Delivery Date
            </div>
            <div className="text-amber-500">{deliveryDate}</div>
          </Col>
          <Col span={4}>
            <div className="font-semibold text-amber-700 mb-1">Grand Total:</div>
            <div className="text-amber-500">
              ₹{grandTotal.toLocaleString()}
            </div>
          </Col>
          <Col span={4}>
            <div className="font-semibold text-amber-700 mb-1">
              Delivery Address:
            </div>
            <div className="text-amber-500">
              {groupData.deliveryAddress || "N/A"}
            </div>
          </Col>
        </Row>
        {isApprovedStatus && (
          <Row
            gutter={24}
            className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <Col span={4}>
              <div className="font-semibold text-green-700 mb-1">Purchase Type:</div>
              <div className="text-green-500">
                {groupData.purchaseType || contracts[0]?.items[0]?.PurchaseType || "N/A"}
              </div>
            </Col>
            <Col span={4}>
              <div className="font-semibold text-green-700 mb-1">Bill Mode:</div>
              <div className="text-green-500">
                {groupData.billMode || contracts[0]?.items[0]?.BillMode || "N/A"}
              </div>
            </Col>
            <Col span={5}>
              <div className="font-semibold text-green-700 mb-1">Narration:</div>
              <div className="text-green-500">
                {groupData.narration || contracts[0]?.items[0]?.Narration || "N/A"}
              </div>
            </Col>
            <Col span={5}>
              <div className="font-semibold text-green-700 mb-1">
                Expected Receiving Date:
              </div>
              <div className="text-green-500">
                {groupData.expReceivingDate || contracts[0]?.items[0]?.ExpReceivingDate || "N/A"}
              </div>
            </Col>
            <Col span={5}>
              <div className="font-semibold text-green-700 mb-1">Delivered Date:</div>
              <div className="text-green-500">
                {contracts[0]?.items[0]?.deliveredDate || "N/A"}
              </div>
            </Col>

          </Row>
        )}
        <Divider
          orientation="left"
          className="text-amber-700! font-bold! text-xl! mb-6!"
        >
          Contracts & Items Details
        </Divider>
        {contracts.map((contract) => (
          <div
            key={contract.contractNo}
            className="mb-8 p-4 border-1 border-amber-300 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50"
          >
            <h4 className="text-xl font-bold text-amber-700 mb-4 flex items-center">
              Contract No:{" "}
              <span className="ml-2">{contract.contractNo}</span>{" "}
              <span className="ml-4 text-lg font-semibold text-amber-700">
                — {contract.companyName}
              </span>
            </h4>
            <Table
              columns={itemColumns}
              dataSource={contract.items.map((item, i) => ({
                ...item,
                key: `${contract.contractNo}-${i}`,
              }))}
              pagination={false}
              size="middle"
              rowKey="key"
              scroll={{ x: 1400, y: 400 }}
            />
          </div>
        ))}
      </div>
    );
  }, []);

  const addHandlers = useFormHandlers(
    addForm,
    contractItemsMap,
    setContractItemsMap,
    setSelectedItemMaxMap,
    contracts,
    false
  );
  const editHandlers = useFormHandlers(
    editForm,
    contractItemsMap,
    setContractItemsMap,
    setSelectedItemMaxMap,
    contracts,
    true
  );

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
            label={<span className="text-amber-700">Delivery Address</span>}
            name="deliveryAddress"
          >
            <Input placeholder="Address" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Status</span>}
            name="status"
          >
            <Select placeholder="Pending" disabled={disabled}>
              <Select.Option value="Pending">Pending</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} className="mt-4">
        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Purchase Type</span>}
            name="purchaseType"
            rules={[{ required: true, message: 'Select Purchase Type' }]}
          >
            <Select placeholder="Select Type" disabled={disabled}>
              <Select.Option value="Transit">Transit</Select.Option>
              <Select.Option value="Local">Local</Select.Option>
              <Select.Option value="Interstate">Interstate</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Bill Mode</span>}
            name="billMode"
            rules={[{ required: true, message: 'Select Bill Mode' }]}
          >
            <Select placeholder="Select Bill Mode" disabled={disabled}>
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="Credit">Credit</Select.Option>
              <Select.Option value="Online">Online</Select.Option>
              <Select.Option value="Offline">Offline</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Exp. Receiving Date</span>}
            name="expReceivingDate"
            rules={[{ required: true, message: 'Select Date' }]}
          >
            <DatePicker className="w-full" disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label={<span className="text-amber-700">Narration</span>}
            name="narration"
          >
            <Input placeholder="Narration" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* contracts + items */}
      <ContractsFormList
        form={form}
        contractsOptions={contracts}
        contractItemsMap={contractItemsMap}
        setContractItemsMap={setContractItemsMap}
        onFormValuesChange={onFormValuesChange}
      />

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
    </>
  );



  /* ---------- handle submit (add/edit) ---------- */
  const handleAddSubmit = useCallback(
    async (values) => {
      try {
        const orderDate = values.orderDate?.format("YYYY-MM-DD");
        const deliveryDate = values.deliveryDate?.format("YYYY-MM-DD");
        const expReceivingDate = values.expReceivingDate?.format("YYYY-MM-DD");
        const deliveryAddress = values.deliveryAddress;

        // Construct items payload grouped by contract
        const payloadItems = [];
        (values.contracts || []).forEach((contract) => {
          const validProducts = [];
          (contract.items || []).forEach((it) => {
            const qty = Number(it.orderQuantity || 0);
            if (qty > 0) {
              validProducts.push({
                product_id: it.itemCode,
                uom: it.uom || null,
                net_qty: qty.toFixed(2),
                gross_qty: qty.toFixed(2), // Assuming gross=net if no specific logic
                free_qty: "0.00",
                mrp_per_unit: Number(it.rate || 0).toFixed(2),
                ordered_qty: qty.toString(),
                discount_percent: Number(it.discountPercent || 0).toFixed(2),
                discount_amount: Number(it.discountAmt || 0).toFixed(2),
                total_amount: (Number(it.rate || 0) * qty).toFixed(2)
              });
            }
          });

          if (validProducts.length > 0) {
            payloadItems.push({
              sale_contract_id: contract.contract_id,
              products: validProducts
            });
          }
        });

        if (payloadItems.length === 0) {
          message.error("Please add at least one item with quantity > 0");
          return;
        }

        const payload = {
          order_date: orderDate,
          purchase_type: values.purchaseType,
          bill_mode: values.billMode,
          expected_receiving_date: expReceivingDate,
          delivery_address: deliveryAddress,
          crn: null,
          sgst: values.orderTaxAndTotals?.sgst || 0,
          cgst: values.orderTaxAndTotals?.cgst || 0,
          igst: values.orderTaxAndTotals?.igst || 0,
          tcs_amount: values.orderTaxAndTotals?.tcsAmt || 0,
          cash_discount: 0,
          round_off_amount: 0,
          narration: values.narration || "Customer created order",
          items: payloadItems
        };

        // Call API
        await createOrder(payload);
        message.success("Order created successfully");

        // Refresh List
        const response = await getOrders();
        const orders = Array.isArray(response) ? response : response.results || [];
        setData(orders);

        // Reset and Close
        addForm.resetFields();
        setContractItemsMap({});
        setIsAddModalOpen(false);

      } catch (error) {
        console.error("Error creating order:", error);
        message.error("Failed to create order");
      }
    },
    [contracts, addForm]
  );

  const handleEditSubmit = (values) => {
    message.info("Edit functionality pending update to new structure");
    setIsEditModalOpen(false);
  };

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
            placeholder="Search"
            className="border-amber-300! w-64! focus:border-amber-500!"
            prefix={<SearchOutlined className="text-amber-600!" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Button
            icon={<FilterOutlined />}
            onClick={() => {
              setSearchText("");
              setSelectedStatus("All");   // ✅ Reset dropdown also
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
            onClick={() => {
              addForm.setFieldsValue(initialOrderGroup);
              setContractItemsMap({});
              setSelectedItemMaxMap({});
              setIsAddModalOpen(true);
            }}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
          >
            Add New Order
          </Button>
        </div>

      </div>


      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 130 }}
          rowKey="orderGroupId"
        />
      </div>

      {/* Add Modal */}
      <Modal
        title={
          <span className="text-amber-700 text-2xl font-semibold">
            Add New Order
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
          onFinish={handleAddSubmit}
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
            Edit Order
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setSelectedOrderGroup(null);
        }}
        footer={null}
        width={1000}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={handleEditSubmit}
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
                setSelectedOrderGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! hover:bg-amber-600! border-none!"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <span className="text-2xl font-bold text-amber-600">
            Order Details {selectedOrderGroup?.orderGroupId}
          </span>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1200}
      >
        {renderOrderGroupView(selectedOrderGroup)}
      </Modal>

      {/* Wallet Modal */}
      <Modal open={walletOpen} onCancel={() => setWalletOpen(false)} footer={null} width={1200}>
        <Wallet />
      </Modal>
    </div>
  );
}
