import React, { useState, useEffect } from "react";
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
  message,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { exportToExcel } from "../../../../../utils/exportToExcel";
import { getPurchaseInvoice, getPurchaseOrder, addPurchaseInvoice, getPurchaseInvoiceById, updatePurchaseInvoice, getPurchaseOrderById, getAllTransport, addAssignment } from "../../../../../api/purchase";
const { Option } = Select;
const isAdmin = true; // <-- change to false to simulate non-admin


export default function PurchaseInvoice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [recordToAssign, setRecordToAssign] = useState(null);
  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [transportList, setTransportList] = useState([]);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [saleOrders, setSaleOrders] = useState([]);

  const formOptions = {
    purchaseTypeOptions: ["Local", "Import"],
    billTypeOptions: ["Tax Invoice", "Regular Invoice"],
    billModeOptions: ["Credit", "Cash"],
    statusOptions: ["Approved", "Pending", "Rejected"],
  };
  // Search handler
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      fetchPurchaseInvoices(); // reset to original data
      return;
    }

    const filtered = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );

    setData(filtered);
  };

  useEffect(() => {
    fetchPurchaseInvoices();
    fetchPurchaseOrders();
  }, []);


  const fetchPurchaseInvoices = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseInvoice();
      const list = res?.data || res;
      console.log("API DATA:", list);
      const formatted = list.map((item, index) => ({
        key: index + 1,
        ...item,
        assigned: item.is_transport_assigned,
        transport: item.transport_name,
      }));
      console.log("FORMATTED DATA:", formatted);  // 👈 check here

      setData(formatted);
    } catch (err) {
      message.error("Failed to load purchase invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransportList = async () => {
    try {
      const res = await getAllTransport();
      setTransportList(res); // your API returns array
    } catch (err) {
      message.error("Failed to load transport list");
      console.error(err);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const res = await getPurchaseOrder();
      setOrderList(res); // store full order objects
    } catch (err) {
      message.error("Failed to load purchase orders");
      console.error(err);
    }
  };


  const handleOrderSelect = async (orderId) => {
    try {
      const order = await getPurchaseOrderById(orderId);

      setSelectedOrder(order);
      setSaleOrders(order.sales_order_details || []);
      addForm.setFieldsValue({
        purchase_order: order.id,

        vendorName: order.vendor_name,
        plantName: order.plant_name,
        deliveryAddress: order.delivery_address,

        deliveryDate: order.expected_receiving_date
          ? dayjs(order.expected_receiving_date)
          : null,

        sgstPercent: Number(order.sgst),
        cgstPercent: Number(order.cgst),
        igstPercent: Number(order.igst),

        sgst: Number(order.total_gst_amount) ? Number(order.sgst) : 0,
        cgst: Number(order.total_gst_amount) ? Number(order.cgst) : 0,
        igst: Number(order.total_gst_amount) ? Number(order.igst) : 0,

        totalGST: Number(order.total_gst_amount),
        tcsAmt: Number(order.tcs_amount),

        totalQty: Number(order.total_qty_all_items),
        totalAmount: Number(order.grand_total),

        items: order.items.map((item) => ({
          product_id: item.product,
          itemName: item.item_name,
          itemCode: item.hsn_code,  // your API gives hsn_code not item_code
          qty: Number(item.qty),
          freeQty: Number(item.free_qty),
          uom: item.uom_details?.unit_name,
          rate: Number(item.rate),
          discountPercent: Number(item.discount_percent),
          discountAmount: Number(item.discount_amount),
          grossWt: Number(item.gross_weight),
          totalGrossWt: Number(item.total_gross_weight),
          grossAmount: Number(item.gross_amount),
          totalQty: Number(item.total_qty),
        })),
      });
      console.log("ORDER RESPONSE:", order);



      console.log(order)
      // calculate totals
    } catch (err) {
      message.error("Failed to fetch order details");
      console.error(err);
    }
  };


  const columns = [
   {
  title: <span className="text-amber-700 font-semibold">Assign No</span>,
  width: 120,
  render: (_, record) => (
    <span className="text-amber-800 font-medium">
      {record.trn_number || "-"}
    </span>
  ),
},

    {
      title: <span className="text-amber-700 font-semibold">Total Qty</span>,
      dataIndex: "total_qty",
      width: 100,
      render: (text, record) => (
        <span className="text-amber-800">
          {record.total_qty} {record.uom}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Total Amount</span>,
      dataIndex: "total_amount",
      width: 100,
      render: (text) => <span className="text-amber-800 ">{text}</span>,
    },

    {
      title: <span className="text-amber-700 font-semibold">Transporter</span>,
      dataIndex: "transporter_name",
      width: 100,
      render: (_, record) => (
        <span className="text-amber-800">{record.transporter_name || "-"}</span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Assigne</span>,
      width: 100,
      render: (_, record) => (
        record.is_transport_assigned ? (
          <Button disabled className="bg-green-200! border-none! text-green-800!">
            Assigned
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={() => openAssignModal(record)}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
          >
            Assign
          </Button>
        )
      ),
    },

    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 100,
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined className="cursor-pointer! text-blue-500!" onClick={() => openView(record)} />
          <EditOutlined className="cursor-pointer! text-red-500!" onClick={() => openEdit(record)} />
        </div>
      ),
    },
  ];

  // Open view modal
  const openView = async (record) => {
    try {
      setLoading(true);

      // 🔥 Call API by ID
      const invoice = await getPurchaseInvoiceById(record.id);

      setSelectedRecord(invoice);

      viewForm.setFieldsValue({
        purchase_order: invoice.order,

        invoiceDate: invoice.invoice_date
          ? dayjs(invoice.invoice_date)
          : null,

        deliveryDate: invoice.delivery_date
          ? dayjs(invoice.delivery_date)
          : null,

        deliveryAddress: invoice.delivery_address,
        vendorName: invoice.vendor_name,
        plantName: invoice.plant_name,

        purchaseType: invoice.purchase_type,
        billType: invoice.bill_type,
        billMode: invoice.bill_mode,
        waybillNo: invoice.waybill_no,
        status: invoice.status,

        sgstPercent: invoice.sgst_percent,
        cgstPercent: invoice.cgst_percent,
        igstPercent: invoice.igst_percent,

        sgst: invoice.sgst_amount,
        cgst: invoice.cgst_amount,
        igst: invoice.igst_amount,

        totalGST: invoice.total_gst_amount,
        tcsAmt: invoice.tcs_amount,
        totalQty: invoice.total_qty,
        totalAmount: invoice.total_amount,

        items: invoice.items.map((item) => ({
          product_id: item.product,
          itemName: item.item_name,
          itemCode: item.hsn_code,
          qty: item.qty,
          freeQty: item.free_qty,
          uom: item.uom_details?.unit_name,
          rate: item.rate,
          discountPercent: item.dis_percent,
          discountAmount: item.dis_amount,
          grossWt: item.gross_wt,
          totalGrossWt: item.total_gross_wt,
          grossAmount: item.gross_amount,
        })),
      });

      setIsViewModalOpen(true);

    } catch (err) {
      message.error("Failed to fetch invoice details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await getPurchaseInvoice();
      const list = res?.data || res;

      const exportRows = [];

      for (const invoice of list) {
        // get full details (important)
        const detail = await getPurchaseInvoiceById(invoice.id);

        detail.items?.forEach((item) => {
          exportRows.push({
            "Assigne No": detail.trn_number,

            "Purchase Type": detail.purchase_type,
            "Bill Type": detail.bill_type,
            "Bill Mode": detail.bill_mode,
            "Waybill No": detail.waybill_no,
            "Status": detail.status,

            "Delivery Date": detail.delivery_date,
            "Invoice Date": detail.invoice_date,

            "Supplier Name": detail.vendor_name,
            "Plant Name": detail.plant_name,
            "Delivery Address": detail.delivery_address,

            "Item Name": item.item_name,
            "Item Code": item.hsn_code,
            "Qty": item.qty,
            "Free Qty": item.free_qty,
            "Total Qty": Number(item.qty || 0) + Number(item.free_qty || 0),
            "UOM": item.uom_details?.unit_name,
            "Rate": item.rate,
            "Dis %": item.dis_percent,
            "Dis Amt": item.dis_amount,
            "Gross Wt": item.gross_wt,
            "Gross Amount (₹)": item.gross_amount,

            "Total Qty (All Items)": detail.total_qty,

            "SGST %": detail.sgst_percent,
            "CGST %": detail.cgst_percent,
            "IGST %": detail.igst_percent,

            "SGST (₹)": detail.sgst_amount,
            "CGST (₹)": detail.cgst_amount,
            "IGST (₹)": detail.igst_amount,

            "Total GST (₹)": detail.total_gst_amount,
            "TCS Amt (₹)": detail.tcs_amount,
            "Total Amount (₹)": detail.total_amount,
          });
        });
      }

      exportToExcel(exportRows, "Purchase_Invoice_Details", "InvoiceData");

    } catch (error) {
      console.error("Export failed:", error);
      message.error("Export failed");
    }
  };

  // Open edit modal
  const openEdit = async (record) => {
    try {
      setLoading(true);

      // 🔥 Call API by ID
      const invoice = await getPurchaseInvoiceById(record.id);

      setSelectedRecord(invoice);

      // Map backend response to form structure
      editForm.setFieldsValue({
        purchase_order: invoice.order,

        purchaseType: invoice.purchase_type,
        billType: invoice.bill_type,
        billMode: invoice.bill_mode,
        waybillNo: invoice.waybill_no,
        status: invoice.status,

        invoiceDate: invoice.invoice_date
          ? dayjs(invoice.invoice_date)
          : null,

        deliveryDate: invoice.delivery_date
          ? dayjs(invoice.delivery_date)
          : null,

        deliveryAddress: invoice.delivery_address,
        vendorName: invoice.vendor_name,
        plantName: invoice.plant_name,

        sgstPercent: invoice.sgst_percent,
        cgstPercent: invoice.cgst_percent,
        igstPercent: invoice.igst_percent,

        sgst: invoice.sgst_amount,
        cgst: invoice.cgst_amount,
        igst: invoice.igst_amount,

        totalGST: invoice.total_gst_amount,
        tcsAmt: invoice.tcs_amount,
        totalQty: invoice.total_qty,


        totalAmount: invoice.total_amount,

        items: invoice.items.map((item) => ({
          product_id: item.product,
          itemName: item.item_name,
          // adjust if needed
          itemCode: item.hsn_code,
          qty: item.qty,
          freeQty: item.free_qty,
          uom: item.uom_details?.unit_name,

          rate: item.rate,
          discountPercent: item.dis_percent,
          discountAmount: item.dis_amount,
          grossWt: item.gross_wt,
          totalGrossWt: item.total_gross_wt,
          grossAmount: item.gross_amount,
        })),
      });

      setIsEditModalOpen(true);

    } catch (err) {
      message.error("Failed to fetch invoice details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Open assign modal
  const openAssignModal = async (record) => {
    setRecordToAssign(record);
    assignForm.resetFields();
    await fetchTransportList();   // 👈 load transport here
    setIsAssignModalOpen(true);
  };


  // Assign submit handler
  const handleAssignSubmit = async (values) => {
    try {
      const selectedTransport = transportList.find(
        (t) => t.id === values.transporterName
      );

      const payload = {
        invoice: recordToAssign.id,      // ✅ must match backend
        transport: selectedTransport.id,
        invoice_number: recordToAssign.invoice_number,
        transport_name: selectedTransport.registered_name,
      };

      await addAssignment(payload);

      message.success("Transport assigned successfully");

      await fetchPurchaseInvoices();

      setIsAssignModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Assignment failed");
    }
  };




  const handleFormSubmit = async (values) => {
    try {
      const items = values.items || [];
      const payload = {
        order: values.purchase_order,

        vendor: isAddModalOpen
          ? selectedOrder?.vendor
          : selectedRecord?.vendor,
        plant: isAddModalOpen
          ? selectedOrder?.plant
          : selectedRecord?.plant,

        invoice_date: values.invoiceDate
          ? dayjs(values.invoiceDate).format("YYYY-MM-DD")
          : null,


        delivery_date: values.deliveryDate
          ? dayjs(values.deliveryDate).format("YYYY-MM-DD")
          : null,

        delivery_address: values.deliveryAddress || "",
        order_number: selectedOrder?.order_number || "", // optional, for reference
        purchase_type: values.purchaseType || "",
        bill_type: values.billType || "",
        bill_mode: values.billMode || "",
        waybill_no: values.waybillNo || "",
        status: values.status || "",
        sgst_percent: values.sgstPercent || 0,
        cgst_percent: values.cgstPercent || 0,
        igst_percent: values.igstPercent || 0,

        sgst_amount: values.sgst || 0,        // ✅ not sgst
        cgst_amount: values.cgst || 0,        // ✅ not cgst
        igst_amount: values.igst || 0,        // ✅ not igst

        total_gst_amount: values.totalGST || 0,  // ✅ not total_gst
        tcs_amount: values.tcsAmt || 0,

        total_qty: values.totalQty || 0,
        total_amount: values.totalAmount || 0,

        items: (values.items || []).map((item) => ({
          product: item.product_id,   // 👈 VERY IMPORTANT
          qty: item.qty,
          free_qty: item.freeQty,
          uom: item.uom,
          rate: item.rate,
          dis_percent: item.discountPercent || 0,
          dis_amount: item.discountAmount || 0,
          gross_wt: item.grossWt || 0,
          total_gross_wt: item.totalGrossWt || 0,
          gross_amount: item.grossAmount || 0,
        }))

      };
      console.log("PAYLOAD:", payload);



      // 🔹 ADD INVOICE
      if (isAddModalOpen) {
        await addPurchaseInvoice(payload);
        message.success("Invoice added successfully!");
        setIsAddModalOpen(false);
        addForm.resetFields();
        fetchPurchaseInvoices();
      }

      // 🔹 EDIT INVOICE
      if (isEditModalOpen && selectedRecord?.id) {
        await updatePurchaseInvoice(selectedRecord.id, payload);
        message.success("Invoice updated successfully!");
        setIsEditModalOpen(false);
        editForm.resetFields();
        fetchPurchaseInvoices();
      }

    } catch (error) {
      console.error(error);
      message.error("Something went wrong while saving invoice");
    }
  };


  // Render form fields - show only after indent selected (per request)
  const renderFormFields = (formInstance, disabled = false) => {
    const indentChosen = formInstance.getFieldValue("indentNo");

    return (
      <>
        <h6 className=" text-amber-500 ">Basic Information</h6>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Order No"
              name="purchase_order"
              rules={[{ required: true, message: "Please select Order No" }]}
            >
              <Select
                placeholder="Select Order No"
                onChange={(val) => handleOrderSelect(val)}
                disabled={disabled || isEditModalOpen || isViewModalOpen}

              >
                {orderList.map((order) => (
                  <Select.Option key={order.id} value={order.id}>
                    {order.order_number}

                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

          </Col>



          <Col span={6}>
            <Form.Item label="Purchase Type" name="purchaseType">
              <Select disabled={!isAdmin || disabled} placeholder="Select Type">
                {formOptions.purchaseTypeOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Bill Type" name="billType">
              <Select disabled={!isAdmin || disabled} placeholder="Select Bill Type">
                {formOptions.billTypeOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Bill Mode" name="billMode">
              <Select disabled={!isAdmin || disabled} placeholder="Select Bill Mode">
                {formOptions.billModeOptions.map((val) => (
                  <Option key={val} value={val}>
                    {val}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>


          <Col span={6}>
            <Form.Item label="Waybill No" name="waybillNo">
              <Input disabled={!isAdmin || disabled} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Status" name="status">
              <Select disabled={!isAdmin || disabled} placeholder="Select Status">
                {formOptions.statusOptions.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Date" name="deliveryDate">
              <DatePicker
                className="w-full"
                disabled
                format="YYYY-MM-DD"
              />

            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Supplier Name" name="vendorName">
              <Input disabled placeholder="Auto filled" />
            </Form.Item>
          </Col>
        </Row>

        <>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="Plant Name" name="plantName">
                <Input disabled placeholder="Auto filled" />
              </Form.Item>
            </Col>



            <Col span={6}>
              <Form.Item label="Assigne Date" name="invoiceDate">
                <DatePicker className="w-full" disabled format="YYYY-MM-DD" />
              </Form.Item>
            </Col>



          </Row>


          <h6 className=" text-amber-500 ">Item & Pricing Details</h6>

          {/* MULTI ITEM SECTION (auto-populated from indent) */}
          <Form.List name="items" initialValue={[{}]}>
            {(fields) => (
              <>
                {fields.map((field, index) => (
                  <div
                    key={field.key}

                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-amber-700">Item {index + 1}</span>
                    </div>

                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          label="Item Name"
                          name={[field.name, "itemName"]}
                          rules={[{ required: true }]}
                        >
                          <Input disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item {...field} label="Item Code" name={[field.name, "itemCode"]}>
                          <Input disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item {...field} label="Qty" name={[field.name, "qty"]}>
                          <InputNumber className="w-full!" disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item {...field} label="Free Qty" name={[field.name, "freeQty"]}>
                          <InputNumber className="w-full!" disabled />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item {...field} label="UOM" name={[field.name, "uom"]}>
                          <Input disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item {...field} label="Rate" name={[field.name, "rate"]}>
                          <InputNumber className="w-full!" disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item {...field} label="Dis%" name={[field.name, "discountPercent"]}>
                          <InputNumber className="w-full!" disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item {...field} label="Gross Wt" name={[field.name, "grossWt"]}>
                          <InputNumber className="w-full!" disabled />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24}>


                      <Col span={6}>
                        <Form.Item {...field} label="Dis Amt" name={[field.name, "discountAmount"]}>
                          <InputNumber className="w-full! " disabled />
                        </Form.Item>
                      </Col>


                      <Col span={6}>
                        <Form.Item {...field} label="Gross Amount (₹)" name={[field.name, "grossAmount"]}>
                          <InputNumber className="w-full!" disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}
              </>
            )}
          </Form.List>

          {/* COMMON TAX & TOTAL SECTION */}
          <h6 className=" text-amber-500 ">Tax, Charges & Others</h6>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="Total Qty (All Items)" name="totalQty">
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="SGST %" name="sgstPercent">
                <InputNumber className="w-full!" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="CGST %" name="cgstPercent">
                <InputNumber className="w-full!" disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="IGST %" name="igstPercent">
                <InputNumber className="w-full!" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="SGST (₹)" name="sgst">
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="CGST (₹)" name="cgst">
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="IGST (₹)" name="igst">
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Total GST (₹)" name="totalGST">
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="TCS Amt (₹)" name="tcsAmt">
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item label="Total Amount (₹)" name="totalAmount" rules={[{ required: true }]}>
                <InputNumber className="w-full! " disabled />
              </Form.Item>
            </Col>
          </Row>
          <h6 className="text-amber-500 pb-2">Sale Order Details</h6>

          {saleOrders.map((order, index) => (
            <div
              key={index}
              className="border border-amber-200 rounded-lg p-3 mb-3"
            >
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item label="Sale Order No">
                    <Input value={order.sales_order_number} disabled />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label="Customer Name">
                    <Input value={order.customer_name} disabled />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label="Delivery Address">
                    <Input value={order.customer_delivery_address} disabled />
                  </Form.Item>
                </Col>
              </Row>

              {order.items?.map((item, i) => (
                <Row gutter={24} key={i}>
                  <Col span={6}>
                    <Form.Item label="Item">
                      <Input value={item.item_name} disabled />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Item Quantity">
                      <InputNumber
                        className="w-full!"
                        value={item.order_qty}
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </div>
          ))}
        </>

      </>
    );
  };





  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
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
              addForm.setFieldsValue({ invoiceDate: dayjs(), items: [] });
              setIsAddModalOpen(true);
            }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-amber-300 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Transport Assignment Records</h2>
        <p className="text-amber-600 mb-3">Manage transport assignments for purchase orders</p>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ y: 240 }}
        />
      </div>

      {/* ➤ Add Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Add New Transport Assignment</span>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(vals) => handleFormSubmit(vals)}
          onFinishFailed={(err) => console.log("Add form validation failed:", err)}
        >
          {/* capture form instance for handlers */}
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(addForm, false)}
          </Form.Item>


          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAddModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">Add</Button>
          </div>
        </Form>
      </Modal>

      {/* ➤ Edit Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Edit Transport Assignment</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(vals) => handleFormSubmit(vals)}
          onFinishFailed={(err) => console.log("Edit form validation failed:", err)}
        >
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(editForm, false)}

          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsEditModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">Update</Button>
          </div>
        </Form>
      </Modal>

      {/* ➤ View Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">View Transport Assignment</span>}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Form layout="vertical" form={viewForm}>
          <Form.Item noStyle shouldUpdate>
            {() => renderFormFields(viewForm, true)}

          </Form.Item>
        </Form>
      </Modal>

      {/* ➤ Assign Modal */}
      <Modal
        title={<span className="text-amber-700 text-2xl font-semibold">Assign Transporter</span>}
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={assignForm}
          onFinish={(vals) => handleAssignSubmit(vals)}
        >
          <Form.Item
            label="Select Transporter"
            name="transporterName"
            rules={[{ required: true, message: "Please select transporter" }]}
          >
            <Select
              placeholder="Select transporter"
              onChange={(val) => setSelectedTransporter(val)}
            >
              {transportList.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.registered_name}
                </Option>
              ))}

            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAssignModalOpen(false)} className="border-amber-400! text-amber-700! hover:bg-amber-100!">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-amber-500! hover:bg-amber-600! border-none!">Submit</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}