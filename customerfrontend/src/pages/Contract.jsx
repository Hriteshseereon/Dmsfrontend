import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  Divider,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// --- Mock Data/JSON Extended ---
const contractJSON = {
  initialData: [
    {
      key: "C-0001",
      contractDate: "2025-10-01",
      startDate: "2025-10-05",
      endDate: "2025-10-31",
      orderNo: "1",
      items: [
        {
          companyName: "ABC Oils Ltd",
          item: "Palm Oil",
          itemCode: "IT23",
          qty: 2000,
          uom: "Ltrs",
          baseRate: 125.50,
          rate: 125.50,
          freeQty: 100,
          totalAmount: 251000.00
        },
      ],
      totalQty: 2000,
      uom: "Ltrs",
      location: "Warehouse A",
      status: "Approved",
      totalAmount: 251000.00,
      grossWt: 2100,
      type: "Retail",
      brokerName: "Broker 1",
      discountPercent: 5,
      discountAmt: 3354,
      deliveryDate: "2024-03-21",
      depoName: "Bhubaneswar Depo",
      totalGrossWt: 1020,
      grossAmount: 67080,
      sgstPercent: 5,
      cgstPercent: 5,
      igstPercent: 0,
      sgst: 3186,
      cgst: 3186,
      igst: 9,
      totalGST: 6372,
      tcsAmt: 500,
      itemGroup: "G1",
      hsnCode: "hsn1",
      netQty: 2,
      grossqty: 4,
      cust_phone: "4535467576",
      cust_email: "jaay@.com",
      deliveryAddress: "kdp",
      cashDiscounrt: 20,
      roundOffAmount: 340,
      naarration: "narrrr",
    },
    {
      key: "C-0002",
      contractDate: "2025-11-15",
      startDate: "2025-11-20",
      endDate: "2025-12-31",
      orderNo: "2",
      items: [
        {
          companyName: "XYZ Refineries",
          item: "Mustard Oil",
          itemCode: "MO101",
          qty: 500,
          uom: "Kg",
          baseRate: 180.00,
          rate: 180.00,
          freeQty: 0,
          totalAmount: 90000.00
        },
        {
          companyName: "XYZ Refineries",
          item: "Coconut Oil",
          itemCode: "CO202",
          qty: 1500,
          uom: "Ltrs",
          baseRate: 220.75,
          rate: 220.75,
          freeQty: 50,
          totalAmount: 331125.00
        },
      ],
      totalQty: 2000,
      uom: "Mixed",
      location: "Warehouse B",
      status: "Pending",
      totalAmount: 421125.00, // Updated Grand Total
      brokerName: "Broker 2",

    },
  ],
  companyOptions: ["ABC Oils Ltd", "XYZ Refineries", "PQR Traders"],
  uomOptions: ["Ltrs", "Kg", "Box", "Drum"], // Extended UOM options
  statusOptions: ["Approved", "Pending", "Rejected"],
  locationOptions: ["Warehouse A", "Warehouse B", "Warehouse C"],
};

// Mock data for item code and rate lookup
const itemDetailsByCompany = {
  "ABC Oils Ltd": {
    "Palm Oil": { itemCode: "IT23", rate: 125.50, uom: "Ltrs" },
    "Sunflower Oil": { itemCode: "SF45", rate: 140.00, uom: "Ltrs" },
  },
  "XYZ Refineries": {
    "Mustard Oil": { itemCode: "MO101", rate: 180.00, uom: "Kg" },
    "Coconut Oil": { itemCode: "CO202", rate: 220.75, uom: "Ltrs" },
  },
  "PQR Traders": {
    "Mustard Oil": { itemCode: "MO101", rate: 178.50, uom: "Kg" },
    "Palm Oil": { itemCode: "IT23", rate: 126.00, uom: "Ltrs" },
  }
};

// 🌟 Mock UOM Conversion Data (Simulates Backend)
const itemUomConversions = {
  "Sunflower Oil": {
    "Ltrs": { rateFactor: 1, qtyFactor: 1, baseUom: "Ltrs" },
    "Box": { rateFactor: 12, qtyFactor: 1 / 12, baseUom: "Ltrs" }, // Box is 12 Ltrs
    "Drum": { rateFactor: 200, qtyFactor: 1 / 200, baseUom: "Ltrs" }, // Drum is 200 Ltrs
  },
  "Mustard Oil": {
    "Kg": { rateFactor: 1, qtyFactor: 1, baseUom: "Kg" },
    "Box": { rateFactor: 15, qtyFactor: 1 / 15, baseUom: "Kg" }, // Box is 15 Kg
  },
  // Default to 1 for all others if no special conversion exists
};

// 1. Define Company to Location Mapping
const companyLocationMap = {
  "ABC Oils Ltd": "Warehouse A",
  "XYZ Refineries": "Warehouse B",
  "PQR Traders": "Warehouse C",
};


// Function to get item options for a specific company
const getItemOptionsForCompany = (companyName) => {
  return itemDetailsByCompany[companyName] ? Object.keys(itemDetailsByCompany[companyName]) : [];
};

const getCompanyNamesFromItems = (items) => {
  return (items || []).map(item => item.companyName).filter((value, index, self) => self.indexOf(value) === index).join(", ");
};

// 🌟 Helper function to calculate single item amount with conversion
const calculateItemAmount = (itemData) => {
  const qty = Number(itemData.qty || 0);
  const baseRate = Number(itemData.baseRate || 0); // Base rate is per base UOM (e.g., Ltr/Kg)
  const uom = itemData.uom;
  const itemName = itemData.item;

  if (!qty || qty <= 0 || baseRate <= 0) return 0;


  const conversions = itemUomConversions[itemName];
  let finalRate = baseRate;

  if (conversions && conversions[uom]) {
    // Rate Factor: How many base units are in one selected unit (e.g., 1 Box = 12 Ltrs)
    const rateFactor = conversions[uom].rateFactor || 1;
    finalRate = baseRate * rateFactor; // Rate per Box/Drum

    // Total quantity is the current Qty * Rate Factor (in base UOM)
    // The calculation is (QTY * Converted Rate)
    return qty * finalRate;
  }

  // If no conversion or using base UOM
  return qty * baseRate;
};


export default function Contract() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState(contractJSON.initialData);
  const [searchText, setSearchText] = useState("");
  const [totalAmount, setTotalAmount] = useState(0); // This is the GRAND TOTAL
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  // 🌟 Main logic to update the Grand Total
  const updateTotalAmount = useCallback((formInstance) => {
    const items = formInstance.getFieldValue("items") || [];
    let grandTotal = 0;

    // Use the calculated totalAmount from each item object
    items.forEach((it) => {
      grandTotal += Number(it.totalAmount || 0);
    });

    setTotalAmount(grandTotal);
    // Optionally, update the main form field for totalAmount if one existed
    // formInstance.setFieldsValue({ totalAmount: grandTotal });
  }, []);

  // Update total amount state when opening Edit modal
  useEffect(() => {
    if (isEditModalOpen && selectedRecord) {
      // Re-calculate the initial grand total when opening the edit modal
      const initialTotal = (selectedRecord.items || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      setTotalAmount(initialTotal);
    }
  }, [isEditModalOpen, selectedRecord]);


  const filteredData = data.filter(
    (item) => {
      const companyNames = getCompanyNamesFromItems(item.items);
      return item.key?.toLowerCase().includes(searchText.toLowerCase()) ||
        companyNames?.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.items || [])
          .map((it) => it.item?.toLowerCase())
          .join(" ")
          .includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase())
    }
  );

  const calculateTotals = (items) => {
    if (!items || items.length === 0) return { totalQty: 0, uom: "" };
    const uomSet = new Set(items.map((i) => i.uom));
    const totalQty = items.reduce((s, it) => s + Number(it.qty || 0), 0);
    return { totalQty, uom: uomSet.size === 1 ? items[0].uom : (uomSet.size > 1 ? "Mixed" : "") };
  };


  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Contract No</span>,
      dataIndex: "key",
      width: 100,
      render: (text) => <span className="text-amber-800 ">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vendor</span>,
      width: 100,
      render: (_, r) => <span className="text-amber-800">{getCompanyNamesFromItems(r.items)}</span>,
    },


    {
      title: <span className="text-amber-700 font-semibold">Items</span>,
      width: 250,
      render: (_, r) => {
        const short = (r.items || [])
          .slice(0, 2)
          .map((it) => `${it.item} (${it.qty}${it.uom ? ` ${it.uom}` : ""})`)
          .join(", ");
        return (
          <div className="text-amber-800">
            {short}
            {(r.items || []).length > 2 && <span>, ...</span>}
            <div className="text-xs text-amber-600">{(r.items || []).length} item(s)</div>
          </div>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      width: 100,
      render: (_, r) => {
        const totals = calculateTotals(r.items);
        return (
          <span className="text-amber-800">
            {totals.totalQty} {totals.uom}
          </span>
        );
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Grand Total</span>, // Changed title for clarity
      dataIndex: "totalAmount",
      width: 120,
      render: (value) => (
        <span className="text-amber-800 ">₹ {Number(value || 0).toFixed(2)}</span>
      ),
    },


    {
      title: <span className="text-amber-700 font-semibold">Status</span>,
      dataIndex: "status",
      width: 120,
      render: (status) => {
        const base = "px-3 py-1 rounded-full text-sm font-semibold";
        if (status === "Approved")
          return <span className={`${base} bg-green-100 text-green-700`}>Approved</span>;
        if (status === "Pending")
          return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
        return <span className={`${base} bg-red-100 text-red-700`}>{status}</span>;
      },
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              viewForm.setFieldsValue({
                ...record,
                contractDate: record.contractDate ? dayjs(record.contractDate) : undefined,
                startDate: record.startDate ? dayjs(record.startDate) : undefined,
                endDate: record.endDate ? dayjs(record.endDate) : undefined,
                deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
              });
              setIsViewModalOpen(true);
            }}
          />
          {record.status !== "Approved" && (
            <EditOutlined
              className="cursor-pointer! text-red-500!"
              onClick={() => {
                setSelectedRecord(record);
                editForm.setFieldsValue({
                  ...record,
                  contractDate: record.contractDate ? dayjs(record.contractDate) : undefined,
                  startDate: record.startDate ? dayjs(record.startDate) : undefined,
                  endDate: record.endDate ? dayjs(record.endDate) : undefined,
                  deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
                  items: record.items || [],
                });
                setIsEditModalOpen(true);
                updateTotalAmount(editForm);
              }}
            />
          )}
        </div>
      ),
    },
  ];

  // 🌟 Logic to update a single item's rate and total amount
  const updateItemCalculations = (formInstance, rowIndex) => {
    const items = formInstance.getFieldValue('items') || [];
    const item = items[rowIndex];

    if (!item) return;

    // 1. Get current values
    const qty = Number(item.qty || 0);
    const uom = item.uom;
    const itemName = item.item;
    const baseRate = Number(item.baseRate || 0);

    // 2. Check for conversion factor
    const conversions = itemUomConversions[itemName];
    let newRate = baseRate;

    if (conversions && conversions[uom]) {
      const rateFactor = conversions[uom].rateFactor || 1;
      newRate = baseRate * rateFactor;
    }

    // 3. Calculate new total amount
    const newTotalAmount = qty * newRate;

    // 4. Update the item in the list
    items[rowIndex] = {
      ...item,
      rate: Number(newRate.toFixed(2)),
      totalAmount: Number(newTotalAmount.toFixed(2)),
    };

    // 5. Push updated list back to form and update Grand Total
    formInstance.setFieldsValue({ items });
    updateTotalAmount(formInstance);
  };


  // Logic to handle item selection change for auto-fill (Rate and Item Code)
  const handleItemSelect = (form, companyName, itemName, rowIndex) => {
    const itemData = itemDetailsByCompany[companyName]?.[itemName];

    if (!itemData) return;

    // Get current list
    const items = form.getFieldValue('items') || [];

    // Base rate is the rate in the smallest/base UOM (Ltrs/Kg)
    const baseUom = itemData.uom;
    const baseRate = itemData.rate;

    // Update only selected row
    items[rowIndex] = {
      ...items[rowIndex],
      item: itemName,
      itemCode: itemData.itemCode,
      uom: baseUom, // Reset to base UOM initially
      baseRate: baseRate,
      rate: baseRate, // Initial rate is the base rate
      qty: items[rowIndex].qty || 0,
    };

    // Push updated list back to form
    form.setFieldsValue({ items });
    // Recalculate amount using the new base rate
    updateItemCalculations(form, rowIndex);
  };

  const handleCompanyChange = (form, companyName, fieldName, isEdit) => {

    const newLocation = companyLocationMap[companyName];

    // If first row → update location
    if (fieldName === 0 && newLocation) {
      form.setFieldsValue({ location: newLocation });
    }

    // Reset item details when company changes
    const items = form.getFieldValue("items") || [];
    const updatedItems = items.map((item, index) =>
      index === fieldName
        ? {
          ...item,
          item: undefined,
          itemCode: undefined,
          rate: undefined,
          baseRate: undefined, // Clear base rate
          uom: undefined,
          qty: 0,
          totalAmount: 0,
        }
        : item
    );

    form.setFieldsValue({ items: updatedItems });

    // 🔥 MOST IMPORTANT FIX → reset live grand total
    updateTotalAmount(form);
  };


  const handleFormSubmit = (values, isEdit) => {
    const formInstance = isEdit ? editForm : addForm;
    const finalValues = values || formInstance.getFieldsValue();
    const items = finalValues.items && finalValues.items.length > 0 ? finalValues.items : [];

    const totals = calculateTotals(items);

    // Calculate Final Grand Total from item totals
    const grandTotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

    // Determine the next contract number
    const newContractNo = `C-${String(data.length + 1).padStart(4, '0')}`;

    const payload = {
      // Use existing key or generated one
      key: isEdit ? selectedRecord.key : newContractNo,
      ...finalValues,
      items,
      totalQty: totals.totalQty,
      uom: totals.uom,
      status: finalValues.status || "Pending",
      contractDate: finalValues.contractDate
        ? finalValues.contractDate.format("YYYY-MM-DD")
        : undefined,
      startDate: finalValues.startDate ? finalValues.startDate.format("YYYY-MM-DD") : undefined,
      endDate: finalValues.endDate ? finalValues.endDate.format("YYYY-MM-DD") : undefined,
      deliveryDate: finalValues.deliveryDate
        ? finalValues.deliveryDate.format("YYYY-MM-DD")
        : undefined,
      totalAmount: grandTotal, // Use the calculated Grand Total
    };

    if (isEdit) {
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key ? { ...item, ...payload } : item
        )
      );
    } else {
      setData((prev) => [...prev, payload]);
    }

    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const renderBasicFields = (formInstance, disabled = false) => (
    <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
      <Row gutter={16}>

        <Col span={8}>
          <Form.Item
            name="contractDate"
            label="Contract Date"
            rules={[{ required: true, message: "Please select contract date" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
              disabled={true}
              disabledDate={() => true}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select Start Date" }]}
          >
            <DatePicker
              className="w-full"
              disabled={disabled}
              disabledDate={(current) => current && current.isBefore(dayjs().startOf("day"))}
              format="DD-MM-YYYY"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[
              { required: true, message: "Please select End Date" },
              {
                validator(_, value) {
                  const start = formInstance.getFieldValue("startDate");
                  if (start && value && value.isBefore(start, "day")) {
                    return Promise.reject(new Error("End Date cannot be before Start Date"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              className="w-full"
              disabled={disabled}
              disabledDate={(current) => current && current.isBefore(dayjs().startOf("day"))}
              format="DD-MM-YYYY"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please select Location" }]}
          >
            <Select placeholder="Select Location" disabled={disabled}>
              {contractJSON.locationOptions.map((loc) => (
                <Select.Option key={loc} value={loc}>
                  {loc}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Status" name="status">
            <Select disabled placeholder="Pending">
              {contractJSON.statusOptions.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>

  );

  const renderItemRow = (formInstance, field, remove, disabled) => {
    const items = formInstance.getFieldValue('items');
    const currentItem = items && items[field.name];
    const selectedCompany = currentItem?.companyName;
    const itemOptions = getItemOptionsForCompany(selectedCompany);
    const selectedItemName = currentItem?.item;

    // Get UOM options based on the selected item. If no specific conversion, use defaults.
    const uomOptions = itemUomConversions[selectedItemName]
      ? Object.keys(itemUomConversions[selectedItemName])
      : contractJSON.uomOptions.filter(uom => uom === currentItem?.uom); // Only allow current UOM if no conversion exists.

    // If item is not selected, only allow default options
    const finalUomOptions = selectedItemName ? uomOptions : contractJSON.uomOptions;

    return (
      <Row
        gutter={24} // Reduced gutter slightly for more columns
        key={field.key}
        align="middle"
        className="mb-2 border-b border-dashed pb-2"
      >

        {/* Company */}
        <Col span={4}>
          <label>Vendor</label>
          <Form.Item
            {...field}
            name={[field.name, "companyName"]}
            fieldKey={[field.fieldKey, "companyName"]}
            rules={[{ required: true, message: "Select vendor" }]}
          >
            <Select
              placeholder="Select Vendor"
              disabled={disabled}
              onChange={(companyName) =>
                handleCompanyChange(formInstance, companyName, field.name, isEditModalOpen)
              }
            >
              {contractJSON.companyOptions.map((c) => (
                <Select.Option key={c} value={c}>{c}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Item Name */}
        <Col span={4}>
          <label>Item Name</label>
          <Form.Item
            {...field}
            name={[field.name, "item"]}
            fieldKey={[field.fieldKey, "item"]}
            rules={[{ required: true, message: "Select item" }]}
          >
            <Select
              placeholder="Select Item"
              disabled={disabled || !selectedCompany}
              onChange={(value) =>
                handleItemSelect(
                  formInstance,
                  selectedCompany,
                  value,
                  field.name,
                  field.fieldKey
                )
              }
            >
              {itemOptions.map((it) => (
                <Select.Option key={it} value={it}>{it}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* UOM - 🌟 MADE SELECTABLE 🌟 */}
        <Col span={4}>
          <label>UOM</label>
          <Form.Item
            {...field}
            name={[field.name, "uom"]}
            fieldKey={[field.fieldKey, "uom"]}
            rules={[{ required: true, message: "Select UOM" }]}
          >
            <Select
              placeholder="UOM"
              disabled={disabled || !selectedItemName}
              onChange={() => updateItemCalculations(formInstance, field.name)}
            >
              {finalUomOptions.map((uom) => (
                <Select.Option key={uom} value={uom}>{uom}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* Quantity */}
        <Col span={4}>
          <label>Qty</label>
          <Form.Item
            {...field}
            name={[field.name, "qty"]}
            fieldKey={[field.fieldKey, "qty"]}
            rules={[
              { required: true, },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "") {
                    return Promise.reject(new Error("Quantity is required"));
                  }
                  if (Number(value) <= 0) {
                    return Promise.reject(new Error("Quantity must be greater than 0"));
                  }
                  return Promise.resolve();
                },
              },
            ]}

          >
            <InputNumber
             
              placeholder="Qty"
              disabled={disabled || !selectedItemName}
              onChange={() => updateItemCalculations(formInstance, field.name)}
            />

          </Form.Item>
        </Col>

        {/* Rate (Adjusted based on UOM/Conversion) */}
        <Col span={4}>
          <label>Rate (Per UOM)</label>
          <Form.Item
            {...field}
            name={[field.name, "rate"]}
            fieldKey={[field.fieldKey, "rate"]}
          >
            {/* Display final rate which is baseRate * conversionFactor */}
            <Input type="number" placeholder="Rate" disabled />
          </Form.Item>
        </Col>

        {/* Item Total Amount - 🌟 NEW FIELD 🌟 */}
        <Col span={4}>
          <label>Item Total Amount</label>
          <Form.Item
            {...field}
            name={[field.name, "totalAmount"]}
            fieldKey={[field.fieldKey, "totalAmount"]}
          >
            <Input
              placeholder="Item Total"
              disabled
              addonBefore="₹"
              value={currentItem?.totalAmount}
            />
          </Form.Item>
        </Col>

        {/* Remove Button */}
        <Col span={2}>
          {!disabled && (
            <MinusCircleOutlined className="text-red-500!"
              onClick={() => {
                remove(field.name);
                setTimeout(() => updateTotalAmount(formInstance), 0); 
              }}
            />
          )}
        </Col>
      </Row>

    );
  };

  const renderItemSection = (formInstance, disabled) => (
    <>
      <h3 className="text-lg font-semibold text-amber-600 mb-2">Items</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => renderItemRow(formInstance, field, remove, disabled))}

              {!disabled && (
                <Form.Item className="mt-4">
                  <Button
                    type="dashed"
                    onClick={() => {
                      add({
                        companyName: undefined,
                        item: undefined,
                        itemCode: undefined,
                        qty: undefined,
                        uom: "Ltrs",
                        rate: 0,
                        baseRate: 0,
                        totalAmount: 0
                      });
                      setTimeout(() => updateTotalAmount(formInstance), 0);
                    }}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Item
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </div>

      {/* 🌟 Display Grand Total below item list 🌟 */}
      <div className="flex justify-end p-2 bg-amber-50 rounded-lg">
        <Space size="large">
          <span className="text-lg font-semibold text-amber-700">Grand Total:</span>
          <span className="text-2xl font-semibold text-amber-700">
            ₹ {Number(totalAmount).toFixed(2)}
          </span>
        </Space>
      </div>
    </>
  );

  const renderApprovedView = () => (
    <div >
      {/* ... (renderApprovedView remains largely the same, but the totalAmount for the contract is correctly calculated) */}
      <h3 className="text-xl font-semibold text-amber-600 mb-4">Contract & Party Details</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Contract No.">
              <Input value={selectedRecord?.key} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Contract Date">
              <Input value={selectedRecord?.contractDate} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Start Date">
              <Input value={selectedRecord?.startDate} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="End Date">
              <Input value={selectedRecord?.endDate} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Date">
              <Input value={selectedRecord?.deliveryDate} disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Vendor(s)">
              <Input value={getCompanyNamesFromItems(selectedRecord?.items)} disabled />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Depo">
              <Input value={selectedRecord?.depoName} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Location">
              <Input value={selectedRecord?.location} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Broker">
              <Input value={selectedRecord?.brokerName} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Type">
              <Input value={selectedRecord?.type} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Address">
              <Input value={selectedRecord?.deliveryAddress} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Status">
              <Input value={selectedRecord?.status} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Naarration">
              <Input value={selectedRecord?.naarration} disabled />
            </Form.Item>
          </Col>
        </Row>
      </div>




      <h3 className="text-xl font-semibold text-amber-600 my-4">Item & Quantity Details</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        {(selectedRecord?.items || []).map((it, idx) => (
          <Row gutter={16} key={idx} className="mb-2 border-b border-dashed pb-2">
            <Col span={4}>
              <Form.Item label={`Vendor ${idx + 1}`}>
                <Input value={it.companyName} disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label={`Item ${idx + 1}`}>
                <Input value={it.item} disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label={`Item Code`}>
                <Input value={it.itemCode} disabled />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label="UOM">
                <Input value={it.uom} disabled />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label="Qty">
                <Input value={it.qty} disabled />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label="Rate (per UOM)">
                <Input value={it.rate} disabled />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label="Item Total Amount">
                <Input value={it.totalAmount} disabled />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Free Qty">
                <Input value={it.freeQty} disabled />
              </Form.Item>
            </Col>
          </Row>
        ))}

      </div>


      <h3 className="text-xl font-semibold text-amber-600 my-4">Pricing & Tax Details</h3>
      <div className="border! p-2! rounded! mb-2! border-amber-300! relative!">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Gross Amount (Estimate)">
              <Input value={selectedRecord?.grossAmount} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Discount %">
              <Input value={selectedRecord?.discountPercent} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Discount Amount">
              <Input value={selectedRecord?.discountAmt} disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Grand Total Amount">
              <Input value={selectedRecord?.totalAmount} disabled />
            </Form.Item>
          </Col>
        </Row>

      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">Contracts</h1>
          <p className="text-amber-600">Manage your contracts easily</p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search by Contract No, Vendor, Item, Status"
            className="w-96! border-amber-300! focus:border-amber-500!"
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
              // Reset Grand Total state
              setTotalAmount(0);

              addForm.setFieldsValue({
                key: `C-${String(data.length + 1).padStart(4, '0')}`,
                contractDate: dayjs(),
                startDate: dayjs(),
                endDate: dayjs().add(7, "day"),
                status: "Pending",
                // Set initial item with empty company/item/code/rate
                items: [{ companyName: undefined, item: undefined, itemCode: undefined, qty: undefined, uom: "Ltrs", rate: 0, baseRate: 0, totalAmount: 0 }],
                location: undefined, // Reset location
              });
              setSelectedRecord(null);
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <Table columns={columns} dataSource={filteredData} pagination={10} scroll={{ y: 150 }} rowKey="key" />
      </div>

      {/* Add Modal */}
      <Modal
        title={<span className="text-amber-700 font-semibold">Add New Contract</span>}
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={null}
        width={1200} // Increased width for more item columns
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(values) => handleFormSubmit(values, false)}
          initialValues={{
            key: `C-${String(data.length + 1).padStart(4, '0')}`,
            contractDate: dayjs(),
            startDate: dayjs(),
            endDate: dayjs().add(7, "day"),
            status: "Pending",
            items: [{ companyName: undefined, item: undefined, itemCode: undefined, qty: 0, uom: "Ltrs", rate: 0, baseRate: 0, totalAmount: 0 }],
          }}
        >
          {renderBasicFields(addForm, false)}
          {renderItemSection(addForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">
              Add
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            Edit Contract
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
        }}
        footer={null}
        width={1200} // Increased width for more item columns
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={() =>
            editForm
              .validateFields()
              .then(() => handleFormSubmit(null, true))
              .catch(() => { })
          }
        >
          {renderBasicFields(editForm, false)}
          {renderItemSection(editForm, false)}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
              }}
              className="border-amber-400! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={<span className="text-amber-700 text-xl font-semibold">View Contract</span>}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
        }}
        footer={null}
        width={1200} // Increased width
      >
        <Form layout="vertical" form={viewForm}>
          {selectedRecord?.status === "Approved" ? (
            renderApprovedView()
          ) : (
            <>
              {renderBasicFields(viewForm, true)}
              {renderItemSection(viewForm, true)}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}