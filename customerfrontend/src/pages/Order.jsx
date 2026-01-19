import React, { useState, useMemo, useCallback } from "react";
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

const API_CONFIG = {
  fetchData: () => contractJSON.initialData,
  saveData: (data) => data,
  updateData: (data) => data,
  fetchContracts: () => contractJSON.contractOptions,
};

const STATUS_FILTERS = [
  "All",
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
      deliveryAddress:"BBSR",
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
      deliveryAddress:"BBSR",
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
      deliveryAddress:"BBSR",
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
      deliveryAddress:"BBSR",
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
      deliveryAddress:"BBSR",
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
      deliveryAddress:"BBSR",
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
const groupDataByOrderGroup = (flatData) => {
  const groups = flatData.reduce((acc, curr) => {
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
      NetQty,
      GrossQty,
      HSNCode,
      IGST,
      CashDiscount,
      PurchaseType,
      BillMode,
      ExpReceivingDate,
      deliveredDate,
      Narration,
      ...rest
    } = curr;

    if (!acc[orderGroupId]) {
      acc[orderGroupId] = {
        orderGroupId,
        key: orderGroupId,
        orderDate: rest.orderDate,
        deliveryDate: rest.deliveryDate,
         deliveryAddress: rest.deliveryAddress,
        status: rest.status,
        grandTotal: 0,
        contracts: {},
        flatKeys: [],
      };
    }
    const group = acc[orderGroupId];

    if (!group.contracts[contractNo]) {
      group.contracts[contractNo] = {
        contractNo,
        companyName: rest.companyName,
        items: [],
      };
    }
    group.contracts[contractNo].items.push({
      item,
      qty,
      uom,
      itemcode,
      rate,
      totalAmt: totalAmt || (rate || 0) * qty,
      key,
      NetQty,
      GrossQty,
      HSNCode,
      IGST,
      CashDiscount,
      PurchaseType,
      BillMode,
      ExpReceivingDate,
      deliveredDate,
      Narration,
    });
    group.grandTotal += totalAmt || (rate || 0) * qty;
    group.flatKeys.push(key);
    return acc;
  }, {});

  return Object.values(groups).map((g) => ({
    ...g,
    contracts: Object.values(g.contracts),
  }));
};

// UOM handlers for conversion
const useUOMHandlers = (form) => {
  const handleUOMChange = useCallback((uom, contractIndex, itemIndex) => {
    const contracts = form.getFieldValue("contracts") || [];
    const allItems = contractJSON.contractOptions.flatMap(c => c.items);
    const selectedItem = allItems.find(item =>
      item.item === contracts[contractIndex]?.items[itemIndex]?.item
    );

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
  }, [form]);



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

const useFormHandlers = (form, setContractItemsMap, setSelectedItemMaxMap, isEdit = false) => {
  const handleSelectContract = useCallback((contractNo, contractIndex) => {
    const c = contractJSON.contractOptions.find((x) => x.contractNo === contractNo);
    if (!c) return;
    setContractItemsMap((prev) => ({
      ...prev,
      [contractIndex]: c.items,
    }));
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
  }, [form, setContractItemsMap, setSelectedItemMaxMap]);

  const handleSelectItem = useCallback((itemName, contractIndex, itemIndex) => {
    const items = contractJSON.contractOptions.flatMap((c) => c.items);
    const sel = items.find((it) => it.item === itemName);
    if (!sel) {
      setSelectedItemMaxMap((p) => ({
        ...p,
        [`${contractIndex}-${itemIndex}`]: 0,
      }));
      return;
    }
    const contracts = form.getFieldValue("contracts") || [];
    const updatedContracts = contracts.map((c, ci) => {
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
  }, [form, setSelectedItemMaxMap]);

  return { handleSelectContract, handleSelectItem };
};

export default function Order() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState(null);
  const [data, setData] = useState(API_CONFIG.fetchData());
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [contractItemsMap, setContractItemsMap] = useState({});
  const [selectedItemMaxMap, setSelectedItemMaxMap] = useState({});
  const [walletOpen, setWalletOpen] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const addUOMHandlers = useUOMHandlers(addForm);
  const editUOMHandlers = useUOMHandlers(editForm);

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
        onClick={() => {
          setSelectedOrderGroup(record);
          setIsViewModalOpen(true);
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

  const handleAddSubmit = useCallback(
    (values) => {
      const deliveryDate = values.deliveryDate?.format("YYYY-MM-DD");
      const deliveryAddress = values.deliveryAddress;
      const orderGroupId = `ORD-${dayjs().format(
        "YYYYMMDD"
      )}-${String(Date.now()).slice(-5)}`;
      const newRows = [];
      let baseKey = data.length ? Math.max(...data.map((d) => d.key)) : 0;
      let idx = 1;

      (values.contracts || []).forEach((contract) => {
        const contractNo = contract.contractNo;
        const contractDetails = contractJSON.contractOptions.find(
          (c) => c.contractNo === contractNo
        );
        const companyName = contractDetails?.companyName;
        (contract.items || []).forEach((it) => {
          if (!it?.item || !it.qty || Number(it.qty) <= 0) return;
          newRows.push({
            key: baseKey + idx++,
            orderGroupId,
            contractNo,
            companyName,
            item: it.item,
            qty: Number(it.qty),
            uom: it.uom,
            itemcode: it.itemcode,
            rate: it.rate,
            orderDate: dayjs().format("YYYY-MM-DD"),
            deliveryDate,
              deliveryAddress,
            status: "Pending",
            totalAmt: it.totalAmt || (it.rate || 0) * Number(it.qty),
          });
        });
      });

      if (newRows.length) {
        setData((prev) => [...prev, ...newRows]);
      }
      addForm.resetFields();
      setContractItemsMap({});
      setSelectedItemMaxMap({});
      setIsAddModalOpen(false);
    },
    [data, addForm]
  );

  const handleEditSubmit = useCallback(
    (values) => {
      const { deliveryDate, deliveryAddress,orderGroupId, contracts } = values;
      const updatedDeliveryDate = deliveryDate?.format("YYYY-MM-DD");

      const otherFlatRows = data.filter(
        (item) => item.orderGroupId !== orderGroupId
      );
      let maxKey = data.length > 0 ? Math.max(...data.map((d) => d.key)) : 0;
      const updatedFlatRows = [];

      contracts.forEach((contract) => {
        const { contractNo, items } = contract;
        const contractDetails = contractJSON.contractOptions.find(
          (c) => c.contractNo === contractNo
        );
        const companyName = contractDetails?.companyName;
        items.forEach((item) => {
          if (!item?.item || !item.qty || Number(item.qty) <= 0) return;
          const isNewItem = item.key === undefined || item.key === null;
          const itemKey = isNewItem ? ++maxKey : item.key;
          updatedFlatRows.push({
            key: itemKey,
            orderGroupId,
            contractNo,
            companyName,
            item: item.item,
            qty: Number(item.qty),
            uom: item.uom,
            itemcode: item.itemcode,
            rate: item.rate,
            orderDate:
              selectedOrderGroup?.orderDate ||
              dayjs().format("YYYY-MM-DD"),
            deliveryDate: updatedDeliveryDate,
             deliveryAddress,
            status: "Pending",
            totalAmt: item.totalAmt || (item.rate || 0) * Number(item.qty),
          });
        });
      });

      if (updatedFlatRows.length) {
        const finalData = [...otherFlatRows, ...updatedFlatRows];
        setData(finalData);
      }
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedOrderGroup(null);
      setContractItemsMap({});
      setSelectedItemMaxMap({});
    },
    [data, selectedOrderGroup, editForm]
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
        const selectedItemConfig = contractJSON.contractOptions
          .flatMap((c) => c.items)
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
                    )) || contractJSON.uomOptions.map((uom) => (
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
                    {contractJSON.contractOptions.map((c) => (
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
      status === "Delivered";

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
                {contracts[0]?.items[0]?.PurchaseType || "N/A"}
              </div>
            </Col>
            <Col span={4}>
              <div className="font-semibold text-green-700 mb-1">Bill Mode:</div>
              <div className="text-green-500">
                {contracts[0]?.items[0]?.BillMode || "N/A"}
              </div>
            </Col>
            <Col span={5}>
              <div className="font-semibold text-green-700 mb-1">Narration:</div>
              <div className="text-green-500">
                {contracts[0]?.items[0]?.Narration || "N/A"}
              </div>
            </Col>
            <Col span={5}>
              <div className="font-semibold text-green-700 mb-1">
                Expected Receiving Date:
              </div>
              <div className="text-green-500">
                {contracts[0]?.items[0]?.ExpReceivingDate || "N/A"}
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
    setContractItemsMap,
    setSelectedItemMaxMap
  );
  const editHandlers = useFormHandlers(
    editForm,
    setContractItemsMap,
    setSelectedItemMaxMap,
    true
  );

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
        title={<span className="text-amber-600! font-semibold!">Create New Order No</span>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        okText="Create Order"
        onOk={addForm.submit}
        width={900}
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="deliveryDate"
                label={<span className="font-semibold text-amber-700">Expected Delivery Date</span>}
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={disablePastDates}
                  format="YYYY-MM-DD"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={16}>
    <Form.Item
      name="deliveryAddress"
      label={
        <span className="font-semibold text-amber-700">
          Delivery Address <span className="text-red-500">*</span>
        </span>
      }
      rules={[{ required: true, message: "Enter delivery address" }]}
    >
      <Input.TextArea
        rows={2}
        placeholder="Enter delivery address"
      />
    </Form.Item>
  </Col>
          </Row>
          <Form.List name="contracts">
            {(fields, operations) => (
              <>
                {RenderContractsList({
                  fields,
                  operations,
                  formInstance: addForm,
                  handleSelectContract: addHandlers.handleSelectContract,
                  handleSelectItem: addHandlers.handleSelectItem,
                })}

                {/* ✅ ADD CONTRACT BUTTON */}
                <Button
                  type="dashed"
                  onClick={() => operations.add(emptyContract)}
                  block
                  icon={<PlusOutlined />}
                  className="mt-4 border-2 border-amber-500 text-amber-700 hover:bg-amber-100 font-semibold h-12 text-lg"
                >
                  Add New Contract
                </Button>
              </>
            )}
          </Form.List>

        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span className="text-2xl font-bold text-amber-600">Edit Order No</span>}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedOrderGroup(null);
          setContractItemsMap({});
          setSelectedItemMaxMap({});
        }}
        okText="Save Changes"
        onOk={editForm.submit}
        width={900}
      >
        <Divider className="my-6" />
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Row gutter={24} className="mb-8">
            <Col span={6}>
              <Form.Item
                name="orderGroupId"
                label={<span className="font-semibold text-amber-700">Order No <span className="text-red-500">*</span></span>}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="orderDate"
                label={<span className="font-semibold text-amber-700">Order Date</span>}
              >
                <DatePicker style={{ width: "100%" }} disabled format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="deliveryDate"
                label={<span className="font-semibold text-amber-700">Expected Delivery Date <span className="text-red-500">*</span></span>}
                rules={[{ required: true }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={disablePastDates}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
             <Col span={18}>
    <Form.Item
      name="deliveryAddress"
      label={<span className="font-semibold text-amber-700">Delivery Address *</span>}
      rules={[{ required: true }]}
    >
      <Input.TextArea rows={2} />
    </Form.Item>
  </Col>
          </Row>
          <Form.List name="contracts">
            {(fields, operations) => (
              <>
                {RenderContractsList({
                  fields,
                  operations,
                  formInstance: editForm,
                  handleSelectContract: editHandlers.handleSelectContract,
                  handleSelectItem: editHandlers.handleSelectItem,
                  isEditMode: true,
                })}

                <Button
                  type="dashed"
                  onClick={() => operations.add(emptyContract)}
                  block
                  icon={<PlusOutlined />}
                  className="mt-4 border-2 border-amber-500 text-amber-700 hover:bg-amber-100 font-semibold h-12 text-lg"
                >
                  Add New Contract
                </Button>
              </>
            )}
          </Form.List>

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
