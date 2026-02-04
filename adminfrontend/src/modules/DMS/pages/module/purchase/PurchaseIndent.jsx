import React, { useState,useEffect } from "react"; 
import { positiveNumberInputProps } from "../../../helpers/numberInput";
import {
  requiredPositiveNumber,
  optionalPositiveNumber,
  percentageValidation,
} from "../../../helpers/formValidation";
import { getPurchaseOrder,getPurchaseContract ,getSoudaByContractId,addPurchaseOrder} from "../../../../../api/purchase";
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
  total_amount: item.total_amount || 0,
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

const fetchSoudaNoOptions = async () => {
  try {
    const res = await getPurchaseContract();
    const list = res?.data || res;
    setSoudaContracts(list);
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


const handleSoudaSelect = async (contractId, formInstance) => {
  if (!contractId) return;

  try {
    const res = await getSoudaByContractId(contractId);
    const data = res?.data || res;

    // 🔑 SAVE ITEMS FOR ITEM DROPDOWN
    setContractItems(data.items || []);

    const itemsForForm = (data.items || []).map((it) => ({
      product: it.product,
      hsn_code: it.hsn_code,
      item: it.item_name,          // used for Select
      itemCode: it.product,        // or actual item_code if you have it
      qty: Number(it.qty || 0),
      freeQty: Number(it.free_qty || 0),
      totalQty: Number(it.qty || 0) + Number(it.free_qty || 0),
      uom: it.uom_details?.unit_name,
      rate: Number(it.rate || 0),
      discountPercent: Number(it.discount_percent || 0),
      discountAmt: 0,
      grossAmount: 0,
      grossWt: 0,
      totalGrossWt: 0,
      sgstPercent: Number(it.sgst_percent || 0),
      cgstPercent: Number(it.cgst_percent || 0),
      igstPercent: Number(it.igst_percent || 0),
    }));

formInstance.setFieldsValue({
  vendor: data.vendor,           // ID
  vendorName: data.vendor_name,  // UI only

  plantId: data.plant,
  plantName: data.plant_name,

  deliveryAddress: data.delivery_address,
  items: itemsForForm,
});


    setTimeout(() => recalcAll(formInstance), 0);
  } catch (err) {
    message.error("Failed to load souda details");
  }
  setSelectedVendor(data.vendor);

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
      const grossWt = Number(item?.grossWt || 0);

      const totalQty = qty + freeQty;
      const grossAmount = qty * rate;
      const discountAmt = (grossAmount * discountPercent) / 100;
      const itemTaxable = grossAmount - discountAmt;
      const totalGrossWt = grossWt;

      totalIndentQty += totalQty;
      taxableAmount += itemTaxable;

      return {
        ...item,
        totalQty,
        grossAmount,
        discountAmt,
        totalGrossWt,
      };
    });

    // taxes (kept simple; you can adjust to compute correctly per indent)
    const sgstPercent = Number(values.sgstPercent || 0);
    const cgstPercent = Number(values.cgstPercent || 0);
    const igstPercent = Number(values.igstPercent || 0);
    const tcsAmt = Number(values.tcsAmt || 0);

    const sgst = (taxableAmount * sgstPercent) / 100;
    const cgst = (taxableAmount * cgstPercent) / 100;
    const igst = (taxableAmount * igstPercent) / 100;
    const totalGST = sgst + cgst + igst;
    const totalAmt = taxableAmount + totalGST + tcsAmt;

    formInstance.setFieldsValue({
      items: updatedItems,
      totalQty: totalIndentQty,
      sgst,
      cgst,
      igst,
      totalGST,
      tcsAmt,
      totalAmt,
    });
  };


const handleFormSubmit = async (values) => {
  try {
    const selectedContract = soudaContracts.find(
      (c) => c.id === values.contract
    );

   const payload = {
  contract: values.contract,
  vendor: selectedContract?.vendor,
  souda_no: selectedContract?.contract_number,

  plant_name: values.plantName || "",
  plant_display_name: values.plantName || "",
  delivery_address: values.deliveryAddress || "",

  order_date: values.order_date?.format("YYYY-MM-DD"),
  expected_receiving_date: values.expected_receiving_date?.format("YYYY-MM-DD"),

  status: values.status || "Fresh",

  // 🔥 IMPORTANT — ADD THESE
  total_qty_all_items: Number(values.totalQty || 0),

  sgst: Number(values.sgst || 0),
  cgst: Number(values.cgst || 0),
  igst: Number(values.igst || 0),

  total_gst_amount: Number(values.totalGST || 0),
  tcs_amount: Number(values.tcsAmt || 0),

  total_amount: Number(values.totalAmt || 0),
  grand_total: Number(values.totalAmt || 0),

  items: values.items.map(it => ({
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
    total_gross_weight: Number(it.totalGrossWt),

    uom_details: {
      type: "base",
      unit_name: it.uom,
      factor_to_base: "1",
    }
  }))
};


    await addPurchaseOrder(payload);
    message.success("Purchase order created successfully");
  } catch (err) {
    message.error("Failed to create purchase order");
  }
  setIsAddModalOpen(false);
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
      dataIndex: "total_amount",
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

  const handleView = (record) => {
    setSelectedRecord(record);
    const convert = (v) => (v ? dayjs(v) : null);

    viewForm.setFieldsValue({
      ...record,
      order_date: convert(record.order_date),
      expected_receiving_date: convert(record.expected_receiving_date),
    });

    setIsViewModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    const convert = (v) => (v ? dayjs(v) : null);

    editForm.setFieldsValue({
      ...record,
      order_date: convert(record.order_date),
      expected_receiving_date: convert(record.expected_receiving_date),
    });

    setIsEditModalOpen(true);
  };

  // Render form fields (used by Add/Edit/View). When soudaNo is selected, items are prefilled and user can add/remove entries.
  const renderFormFields = (formInstance, disabled = false) => (
    <>
      <h6 className=" text-amber-500 ">Basic Information</h6>
      <Row gutter={16}>
        <Col span={6}>
         <Form.Item
  label="Souda No"
  name="contract"   // store CONTRACT ID
  rules={[{ required: true }]}
>
  <Select
    placeholder="Select Souda No"
    onChange={(contractId) =>
      handleSoudaSelect(contractId, addForm)
    }
  >
    {soudaContracts.map((c) => (
      <Option key={c.id} value={c.id}>
        {c.contract_number}
      </Option>
    ))}
  </Select>
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
                  <Col span={6}>
                  <Form.Item
  {...field}
  label="Item Name"
  name={[field.name, "product"]}
  rules={[{ required: true, message: "Please select item" }]}
>
  <Select
    showSearch
    disabled={disabled}
    placeholder="Select item"
   onChange={(productId) => {
  const item = contractItems.find((i) => i.product === productId);
  if (!item) return;

  formInstance.setFieldsValue({
    items: formInstance.getFieldValue("items").map((row, i) =>
      i === field.name
        ? {
            ...row,
            product: item.product,
            item: item.item_name,
            hsn_code: item.hsn_code,
            rate: Number(item.rate || 0),
            qty: Number(item.qty || 0),
            freeQty: Number(item.free_qty || 0),
            uom: item.uom_details?.unit_name,
            rate: Number(item.rate || 0),
            discountPercent: Number(item.discount_percent || 0),
            sgstPercent: Number(item.sgst_percent || 0),
            cgstPercent: Number(item.cgst_percent || 0),
            igstPercent: Number(item.igst_percent || 0),
          }
        : row
    ),
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

                  </Col>

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
                      name={[field.name, "uom"]}
                    >
                      <Select disabled={disabled}>
                        {purchaseIndentJSON.uomOptions.map((opt) => (
                          <Option key={opt} value={opt}>
                            {opt}
                          </Option>
                        ))}
                      </Select>
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

                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="Total Gross Weight"
                      name={[field.name, "totalGrossWt"]}
                    >
                      <InputNumber className="w-full bg-gray-50" disabled />
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
          {() => renderFormFields(viewForm, true)}
        </Form>
      </Modal>
    </div>
  );
}
