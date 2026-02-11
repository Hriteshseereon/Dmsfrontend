 import React, { useState,useEffect } from "react";  
import { positiveNumberInputProps } from "../../../helpers/numberInput";
import {
  requiredPositiveNumber,
  optionalPositiveNumber,
  percentageValidation,
} from "../../../helpers/formValidation";
import { getPurchaseOrder,getPurchaseContract ,getSoudaByContractId,addPurchaseOrder,getPurchaseOrderById,updatePurchaseOrder} from "../../../../../api/purchase";
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

const { Option } = Select;

// -----------------------
// Sample SOUDA master data (maps soudaNo -> list of items + basic info)
// In real app this will come from backend when soudaNo is selected.
const soudaMaster = {
  "SOUDA-001": {
    soudaNo: "SOUDA-001",
    plantName: "Kalinga Oils Pvt. Ltd.",
    plantCode: "PC1",
    companyName: "Jay Traders",
    depoName: "Bhubaneswar Depot",
    deliveryAddress: "Plot 12, Industrial Area, Bhubaneswar",
    items: [
      { item: "Mustard Oil", itemCode: "ITM-MUST-1", uom: "Litre", rate: 120 },
      { item: "Sunflower Oil", itemCode: "ITM-SUN-1", uom: "Litre", rate: 110 },
    ],
  },
  "SOUDA-002": {
    soudaNo: "SOUDA-002",
    plantName: "Oils Pvt. Ltd.",
    plantCode: "PC2",
    companyName: "Saheree Traders",
    depoName: "Aul Depot",
    deliveryAddress: "Sector 4, Aul Industrial, Jagatsinghpur",
    items: [
      { item: "Coconut Oil", itemCode: "ITM-COC-1", uom: "Litre", rate: 140 },
    ],
  },
};

const purchaseIndentJSON = {
  records: [
    {
      key: 1,
      soudaNo: "SOUDA-001",
      plantName: "Kalinga Oils Pvt. Ltd.",
      plantCode: "PC1",
      indentDate: "2024-10-01",
      deliveryDate: "2024-12-09",
      deliveryAddress: "Plot 12, Industrial Area, Bhubaneswar",
      companyName: "Jay Traders",
      depoName: "Bhubaneswar Depot",
      items: [
        {
          item: "Mustard Oil",
          itemCode: "ITM-MUST-1",
          qty: 5000,
          freeQty: 200,
          totalQty: 5200,
          uom: "Litre",
          rate: 120,
          discountPercent: 2,
          discountAmt: 12000,
          grossWt: 2100,
          totalGrossWt: 1020,
          grossAmount: 67080,
        },
      ],
      totalQty: 5200,
      totalAmt: 588000,
      status: "Approved",
    },
  ],
  uomOptions: ["Litre", "Kg", "Packet", "Box"],
  statusOptions: ["Approved", "Pending", "Rejected"],
  soudaNoOptions: ["SOUDA-001", "SOUDA-002", "SOUDA-003"],
};

export default function PurchaseIndent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
 const [soudaContracts, setSoudaContracts] = useState([]);
  const [data, setData] = useState([]);
 const [loading, setLoading] = useState(false);
 const [contractItems, setContractItems] = useState([]);
const [vendor, setVendor] = useState(null);
const [selectedVendor, setSelectedVendor] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  useEffect(() => {
  fetchPurchaseOrder();
  fetchSoudaNoOptions();
  
}, []);

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
  grand_total: item.grand_total || item.total_amount || 0,  // 🔥 ADD THIS
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



const handleSearch = (value) => {
  setSearchText(value);

  if (!value) {
    fetchPurchaseOrder();
    return;
  }

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
  );

  setData(filtered);
};


const handleSoudaSelect = async (contractId, formInstance, existingItems = []) => {
  if (!contractId) return;

  try {
    const res = await getSoudaByContractId(contractId);
    const data = res?.data || res;

    setContractItems(data.items || []);

    // Merge existing items if provided
    const itemsToSet = existingItems.length
      ? existingItems.map(it => ({
          ...it,
          uom: it.uom_details?.unit_name || it.uom, // ensure uom
        }))
      : [];

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
    const freeQty = Number(item?.freeQty || 0);
    const rate = Number(item?.rate || 0);
    const discountPercent = Number(item?.discountPercent || 0);

    const totalQty = qty + freeQty;
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



const handleFormSubmit = async (values, type) => {
  try {
    const selectedContract = soudaContracts.find(
      (c) => c.id === values.contract
    );

    const taxableAmount =
      values.items?.reduce((sum, item) => {
        const gross = Number(item.grossAmount || 0);
        const discount = Number(item.discountAmt || 0);
        return sum + (gross - discount);
      }, 0) || 0;

    const sgst = round2(
      (taxableAmount * Number(values.sgstPercent || 0)) / 100
    );
    const cgst = round2(
      (taxableAmount * Number(values.cgstPercent || 0)) / 100
    );
    const igst = round2(
      (taxableAmount * Number(values.igstPercent || 0)) / 100
    );

    const totalGST = round2(sgst + cgst + igst);
    const totalAmt = round2(
      taxableAmount + totalGST + Number(values.tcsAmt || 0)
    );

    const payload = {
      contract: values.contract,
      vendor: selectedContract?.vendor,
      souda_no: selectedContract?.contract_number,

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
        free_qty: Number(it.freeQty),
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

    // 🔥 API CALL
    if (type === "edit") {
      await updatePurchaseOrder(selectedRecord.id, payload);
      message.success("Purchase order updated successfully");
      setIsEditModalOpen(false);
    } else {
      await addPurchaseOrder(payload);
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
  title: <span className="text-amber-700 font-semibold">Vendor</span>,
  dataIndex: "vendor_name",
  width: 150,
  render: (t) => <span className="text-amber-800">{t}</span>,
},

    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty_all_items",
      width: 120,
     render: (t) => <span className="text-amber-800">{t}</span>
      
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
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleEdit(record)}
          />
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
      order_date: data.order_date ? dayjs(data.order_date) : null,
      expected_receiving_date: data.expected_receiving_date
        ? dayjs(data.expected_receiving_date)
        : null,
      items: data.items?.map((it) => ({
        product: it.product,
        hsn_code: it.hsn_code,
        rate: it.rate,
        qty: it.qty,
        freeQty: it.free_qty,
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
  plantName: data.plant_name,
  deliveryAddress: data.delivery_address,
  status: data.status,
  order_date: data.order_date ? dayjs(data.order_date) : null,
  expected_receiving_date: data.expected_receiving_date
    ? dayjs(data.expected_receiving_date)
    : null,
  items: data.items?.map((it) => ({
    product: it.product,
    hsn_code: it.hsn_code,
    rate: it.rate,
    qty: it.qty,
    freeQty: it.free_qty,
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
  label="Souda No"
  name="contract"   // store contract ID
  rules={[{ required: true }]}
>
<Select
  placeholder="Select Souda No"
  options={soudaContracts.map(c => ({
    label: c.souda_number,   // ✅ correct field
    value: c.id
  }))}
  onChange={(contractId) =>
    handleSoudaSelect(contractId, formInstance)
  }
/>


</Form.Item>


        </Col>

       <Form.Item label="Plant Name" name="plantName">
  <Input disabled />
</Form.Item>
<Form.Item label="Vendor Name" name="vendorName">
  <Input disabled />
</Form.Item>



        <Col span={6}>
          <Form.Item label="Status" name="status">
            <Select disabled={disabled}>
              {purchaseIndentJSON.statusOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Delivery Address"
            name="deliveryAddress"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} disabled={disabled} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Order Date" name="order_date">
            <DatePicker className="w-full" disabled />
          </Form.Item>
        </Col>

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
      </Row>

      <h6 className=" text-amber-500 mt-4">Item & Pricing Details</h6>

      <Form.List name="items" initialValue={[{}]}>
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
                  {!disabled && (
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
                  )}
                </div>

                <Row gutter={24}>
                 <Form.Item
  {...field}
  label="Item Name"
  name={[field.name, "product"]}   // store PRODUCT ID
  rules={[{ required: true }]}
>
  <Select
    showSearch
    placeholder="Select Item"
    disabled={disabled}
    onChange={(productId) => {

      const selected = contractItems.find(
        (i) => i.product === productId
      );

      if (!selected) return;

      const currentItems = formInstance.getFieldValue("items");

      currentItems[field.name] = {
        ...currentItems[field.name],
        product: selected.product,                 // ID
        item_name: selected.item_name,             // name
        hsn_code: selected.hsn_code,                // HSN
        rate: Number(selected.rate || 0),
        qty: Number(selected.qty || 0),
        freeQty: Number(selected.free_qty || 0),
        uom: selected.uom_details?.unit_name,
        discountPercent: Number(selected.discount_percent || 0),
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
                    >
                      <InputNumber
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Free Qty"
                      name={[field.name, "freeQty"]}
                    >
                      <InputNumber
                        className="w-full"
                        disabled={disabled}
                        onChange={() => recalcAll(formInstance)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      {...field}
                      label="Total Qty"
                      name={[field.name, "totalQty"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                   <Col span={4}>
                   <Form.Item
  {...field}
  label="UOM"
  name={[field.name, "uom"]}   // ✅ match handleEdit mapping
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
                        className="w-full"
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
                    >
                      <InputNumber
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
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      {...field}
                      label="Gross Amount"
                      name={[field.name, "grossAmount"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
                    </Form.Item>
                  </Col>
                </Row>

              
                <Row gutter={12}>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="Gross Weight"
                      name={[field.name, "grossWt"]}
                    >
                      <InputNumber className="w-full" disabled={disabled} />
                    </Form.Item>
                  </Col>

                 
                </Row>
              </div>
            ))}

            {!disabled && (
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
            )}
          </>
        )}
      </Form.List>

      <h6 className=" text-amber-500 mt-4">Tax, Charges & Others</h6>
      <Row gutter={12}>
        <Col span={4}>
          <Form.Item label="Total Qty (All Items)" name="totalQty">
            <InputNumber className="w-full bg-gray-50" disabled />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="SGST %" name="sgstPercent">
            <InputNumber
              className="w-full"
            
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="CGST %" name="cgstPercent">
            <InputNumber
              className="w-full"
            
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="IGST %" name="igstPercent">
            <InputNumber
              className="w-full"
             
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="Total GST (₹)" name="totalGST">
            <InputNumber className="w-full bg-gray-50" disabled />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="TCS Amt (₹)" name="tcsAmt">
            <InputNumber
              className="w-full"
             
              onChange={() => recalcAll(formInstance)}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item label="Total Amount (₹)" name="totalAmt">
            <InputNumber className="w-full bg-gray-50" disabled />
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
              addForm.setFieldsValue({ order_date: dayjs(), items: [] });
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
          Purchase Indent Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your purchase souda data</p>

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
          <span className="text-amber-700 text-2xl font-semibold">
            Add New Purchase Indent
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(vals) => handleFormSubmit(vals, "add")}
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
            Edit Purchase Indent
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
            View Purchase Indent
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