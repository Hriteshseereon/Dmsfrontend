// LoadingAdvice.js
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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { exportToExcel } from "../../../../../utils/exportToExcel";
import { getLoadingAdvice, getLoadingAdviceById, updateLoadingAdvice, getAllVendor } from "../../../../../api/purchase";
const { Option } = Select;


const ALL_STATUS = [

  "Approved",
  "Dispatched",
  "In-Transit",
  "Out for Delivery",
  "Partially Delivered",
  "Delivered",
];
const SALE_ORDER_STATUS_FLOW = {
  "In-Transit": ["In-Transit", "Out for Delivery"],
  "Out for Delivery": ["Out for Delivery", "Delivered"],
  "Delivered": ["Delivered"],
};

const statusFlow = {
  Pending: ["Pending",],

  Approved: ["Approved", "Dispatched"],
  Dispatched: ["Dispatched", "In-Transit"],
  "In-Transit": ["In-Transit", "Out for Delivery"],
  "Out for Delivery": ["Out for Delivery", "Delivered"],
  "Partially Delivered": ["Partially Delivered", "Delivered"],
  Delivered: ["Delivered"],
};
export default function LoadingAdvice() {
  const [data, setData] = useState([]);
  const [deliveryMeta, setDeliveryMeta] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
   const [messageApi, contextHolder] = message.useMessage(); 

  const [form] = Form.useForm();
  const [viewForm] = Form.useForm();
  useEffect(() => {
    fetchLoadingAdvice();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);

    if (!value) {
      fetchLoadingAdvice();
      return;
    }

    const filtered = data.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value.toLowerCase())
    );

    setData(filtered);
  };
  const handleExport = async () => {
    try {
      const res = await getLoadingAdvice();
      const list = res || [];

      const exportRows = [];

      for (const advice of list) {
        const detail = await getLoadingAdviceById(advice.loading_id);

        detail.items?.forEach((item) => {
          exportRows.push({
            // Basic
            "Advice No": detail.advice_no,
            "Loading Advice Date": detail.advice_date,
            "Status": detail.status,

            // Company Details
            "Vendor Name": detail.vendor_name,
            "Vendor Address": detail.vendor_address,
            "Contact Person": detail.vendor_contact_person,
            "Vendor Phone": detail.vendor_phone,

            // Plant Details
            "Plant Name": detail.plant_name,
            "Plant Address": detail.plant_address,
            "Plant Contact Person": detail.plant_contact_person,

            // Item Details

            "Item Name": item.product_name,
            "Required Qty": item.required_qty,
            "Actual Qty": item.actual_qty,
            "Variance": item.variance,

            // Transport Details
            "Transporter": detail.transporter_name,
            "Vehicle No": detail.vehicle_no,
            "Driver Name": detail.driver_name,
            "Driver Contact": detail.driver_contact,
            "Insurance Valid Upto": detail.insurance_valid_upto,
            "PU Valid Upto": detail.pu_valid_upto,
            "Fitness Valid Upto": detail.fitness_valid_upto,

            // Loading Details
            "Vehicle In Time": detail.vehicle_in_time,
            "Vehicle Out Time": detail.vehicle_out_time,
            "Tare Weight (KG)": detail.tare_weight_kg,
            "Net Weight (KG)": detail.net_weight_kg,
            "Gross Weight (KG)": detail.gross_weight_kg,
          });
        });
      }

      exportToExcel(exportRows, "Loading_Advice_Details", "LoadingAdvice");

    } catch (error) {
      console.error("Export failed:", error);
      message.error("Export failed");
    }
  };

  const fetchLoadingAdvice = async () => {
    try {
      const res = await getLoadingAdvice();

      const formatted = res.map((item) => ({
        key: item.id,
        id: item.id,

        // Basic Info
        advice_no: item.advice_no || "-",
        lodingadvicedate: item.advice_date || "-",
        invoiceNo: item.invoice_number || "-",
        companyName: item.vendor_name || "-",
        plantName: item.plant_name || "-",
        status: item.status || "-",
        vendor_name: item.vendor_name,
        plant_name: item.plant_name,
        vendor_address: item.vendor_addresses?.[0]?.address_line1,
        plant_address: item.plant_details?.address,
        vendor_gstin: item.vendor_gstin,
        plant_gstin: item.plant_gstin,
        // Transport Details ✅ correct fields from API
        transporter: item.transporter_name || "-",
        vehicleNo: item.vehicle_number || "-",
        driverName: item.driver_name || "-",
        driverContact: item.driver_contact || "-",
        insuranceValidUpto: item.insurance_valid_upto || null,
        puValidUpto: item.pu_valid_upto || null,
        fitnessValidUpto: item.fitness_valid_upto || null,

        // Loading Details
        vehicleInTime: item.vehicle_in_time || "-",
        vehicleOutTime: item.vehicle_out_time || "-",
        tareWeight: item.tare_weight_kg || 0,
        netWeight: item.net_weight_kg || 0,
        grossWeight: item.gross_weight_kg || 0,


        itemCode: item.items?.[0]?.hsn_code || "-",   // 👈 HSN code
        itemName: item.items?.[0]?.product_name || "-",

        reqQty: item.items?.[0]?.required_qty || 0,
        actualQty: item.items?.[0]?.actual_qty || 0,
        variance: item.items?.[0]?.variance || 0,

        original: item,
      }));

      setData(formatted);
    } catch (error) {
      console.error("Failed to fetch loading advice:", error);
    }
  };



  const handleOpenEdit = async (record) => {
    try {
      const res = await getLoadingAdviceById(record.id);

      form.setFieldsValue({
        advice_no: res.advice_no,
        invoiceNo: res.invoice_number,
        lodingadvicedate: res.advice_date ? dayjs(res.advice_date) : null,
        status: res.status,

        companyName: res.vendor_name,
        companyAddress: res.vendor_addresses?.[0]?.address_line1 || "",
        contactPerson: res.vendor_details?.contact_person || "",
        contactNo: res.vendor_details?.contact_person_no || "",

        plantName: res.plant_name,
        plantAddress: res.plant_details?.address || "",
        plantContactPerson: res.vendor_details?.contact_person || "",
        plantPhone: res.plant_details?.phone_number || "",

        transporter: res.transporter_name,
        vehicleNo: res.vehicle_number,
        driverName: res.driver_name,
        driverContact: res.driver_contact,

        insuranceValidUpto: res.insurance_valid_upto
          ? dayjs(res.insurance_valid_upto)
          : null,

        puValidUpto: res.pu_valid_upto
          ? dayjs(res.pu_valid_upto)
          : null,

        fitnessValidUpto: res.fitness_valid_upto
          ? dayjs(res.fitness_valid_upto)
          : null,

        vehicleInTime: res.vehicle_in_time,
        vehicleOutTime: res.vehicle_out_time,
        tareWeight: res.tare_weight_kg,
        netWeight: res.net_weight_kg,

        items: res.items?.map((itm) => ({
          id: itm.id,
          product: itm.product,
          product_name: itm.product_name,
          required_qty: itm.required_qty,
          actual_qty: itm.actual_qty,
          variance: itm.variance,
        })),

        // ✅ SALES ORDER MAPPING
        sale_orders: res.deliveries?.map((delivery) => ({
          delivery_id: delivery.id,
          sale_order_no: delivery.sales_order_number,
          customer_name: delivery.customer_name,
          delivery_address: delivery.customer_delivery_address,
          delivery_date: delivery.delivery_date ? dayjs(delivery.delivery_date) : null,
          status: delivery.status,
          items: delivery.items?.map((itm) => ({
            item_id: itm.id,
            product_name: itm.item_name,
            qty: itm.order_qty,
            delivered_qty: itm.delivered_qty,
           
          })),
        })),
      });

      setSelectedRecord(res);
      setIsEditModalOpen(true);

    } catch (error) {
      console.error("Error fetching by ID:", error);
      message.error("Failed to load data");
    }
  };
const handleOpenView = async (record) => {
  try {
    const res = await getLoadingAdviceById(record.id);

    viewForm.setFieldsValue({
      advice_no: res.advice_no,
      invoiceNo: res.invoice_number,
      lodingadvicedate: res.advice_date ? dayjs(res.advice_date) : null,
      status: res.status,

      companyName: res.vendor_name,
      companyAddress: res.vendor_addresses?.[0]?.address_line1 || "",
      contactPerson: res.vendor_details?.contact_person || "",
      contactNo: res.vendor_details?.contact_person_no || "",

      plantName: res.plant_name,
      plantAddress: res.plant_details?.address || "",
      plantContactPerson: res.vendor_details?.contact_person || "",
      plantPhone: res.plant_details?.phone_number || "",

      transporter: res.transporter_name,
      vehicleNo: res.vehicle_number,
      driverName: res.driver_name,
      driverContact: res.driver_contact,

      insuranceValidUpto: res.insurance_valid_upto
        ? dayjs(res.insurance_valid_upto)
        : null,

      puValidUpto: res.pu_valid_upto
        ? dayjs(res.pu_valid_upto)
        : null,

      fitnessValidUpto: res.fitness_valid_upto
        ? dayjs(res.fitness_valid_upto)
        : null,

      vehicleInTime: res.vehicle_in_time,
      vehicleOutTime: res.vehicle_out_time,
      tareWeight: res.tare_weight_kg,
      netWeight: res.net_weight_kg,

      items: res.items?.map((itm) => ({
        id: itm.id,
        product: itm.product,
        product_name: itm.product_name,
        required_qty: itm.required_qty,
        actual_qty: itm.actual_qty,
        variance: itm.variance,
      })),

      sale_orders: res.deliveries?.map((delivery) => ({
        delivery_id: delivery.id,
        sale_order_no: delivery.sales_order_number,
        customer_name: delivery.customer_name,
        delivery_address: delivery.customer_delivery_address,
        delivery_date: delivery.delivery_date
          ? dayjs(delivery.delivery_date)
          : null,
        status: delivery.status,

        items: delivery.items?.map((itm) => ({
          item_id: itm.id,
          product_name: itm.item_name,
          qty: itm.order_qty,
          delivered_qty: itm.delivered_qty,
        })),
      })),
    });

    setSelectedRecord(res);
    setIsViewModalOpen(true);

  } catch (error) {
    console.error("Error fetching loading advice:", error);
    message.error("Failed to load data");
  }
};
  const handleEdit = async (values) => {
    try {
        if (
      ["Pending Approval", "Dispatched"].includes(selectedRecord.status) &&
      values.status === selectedRecord.status
    ) {
      messageApi.warning("Please change status to update");
      return;
    }

      const payload = {
        status: values.status,

        items: values.items?.map((itm) => ({
          id: itm.id,
          actual_qty: Number(itm.actual_qty).toFixed(2),
          required_qty: Number(itm.required_qty).toFixed(2),
        })),

        deliveries: values.sale_orders?.map((so) => ({
          id: so.delivery_id,
           status: so.status, 
          delivery_date: so.delivery_date
            ? dayjs(so.delivery_date).format("YYYY-MM-DD")
            : null,

          items: so.items?.map((itm) => ({
            id: itm.item_id,
            delivered_qty: itm.delivered_qty
              ? Number(itm.delivered_qty).toFixed(3)
              : "0.000"
          })),
        })),
      };

      await updateLoadingAdvice(selectedRecord.id, payload);

      message.success("Updated successfully");

      setIsEditModalOpen(false);
      form.resetFields();
      fetchLoadingAdvice();

    } catch (error) {
      console.error("Update failed:", error);
      message.error("Update failed");
    }
  };

 
const getSaleOrderAllowedStatus = (currentStatus) => {
  return SALE_ORDER_STATUS_FLOW[currentStatus] || ["In-Transit"];
};


  // Columns - removed Assign button; Admin can only approve pending ones
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">Advice No</span>,
      dataIndex: "advice_no",
      render: (t) => <span className="text-amber-800">{t}</span>,

    },
    {
      title: <span className="text-amber-700 font-semibold">Invoice No</span>,
      dataIndex: "invoiceNo",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },


    {
      title: <span className="text-amber-700 font-semibold">Loading Advice Date</span>,
      dataIndex: "lodingadvicedate",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },


    // transporter + vehicle/driver columns (display-only)
    {
      title: <span className="text-amber-700 font-semibold">Transporter</span>,
      dataIndex: "transporter",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Vehicle No</span>,
      dataIndex: "vehicleNo",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Driver</span>,
      dataIndex: "driverName",
      render: (t) => <span className="text-amber-800">{t || "-"}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Assignment</span>,
      width: 180,
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Pending: "bg-yellow-100 text-yellow-700",

          "Pending Approval": "bg-orange-100 text-orange-700",
          Approved: "bg-yellow-100 text-yellow-700",
          Delivered: " bg-green-100 text-green-700",
          Dispatched: "bg-blue-100 text-blue-700",
          "In-Transit": "bg-orange-100 text-orange-700",
          "Out for Delivery": "bg-purple-100 text-purple-700 ",
          "Partially Delivered": "bg-blue-100 text-blue-700"


        };

        return (
          <span className={`px-3 py-1 rounded-full font-semibold inline-block text-sm ${colorMap[status] || ""}`}>
            {status || "-"}
          </span>
        );
      }

    },
   {
  title: <span className="text-amber-700 font-semibold">Actions</span>,
  key: "actions",
  render: (_, record) => {

    const restrictedStatus = [
      "In-Transit",
      "Out for Delivery",
      "Partially Delivered",
      "Delivered",
    ];

    const showEdit =
      record.driverName &&
      record.vehicleNo &&
      record.driverName !== "-" &&
      record.vehicleNo !== "-" 
     // !restrictedStatus.includes(record.status); // 👈 hide edit

    return (
      <div className="flex gap-3">
        <EyeOutlined
          className="cursor-pointer! text-blue-500!"
          onClick={() => handleOpenView(record)}
        />

        {showEdit && (
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleOpenEdit(record)}
          />
        )}
      </div>
    );
  },
}
  ];
  const getAllowedStatus = (formInstance) => {
    const currentStatus = formInstance.getFieldValue("status");
    const driver = formInstance.getFieldValue("driverName");
    const vehicle = formInstance.getFieldValue("vehicleNo");
    const items = formInstance.getFieldValue("items") || [];

    const hasDriverVehicle =
      driver && vehicle && driver !== "-" && vehicle !== "-";

    const hasActualQty = items.some(
      (itm) => Number(itm.actual_qty) > 0
    );

    // ❌ No driver/vehicle → restrict
    if (!hasDriverVehicle) {
      return ["Pending"];
    }

    // ❌ Driver present but no actual qty → only till Approved
    if (hasDriverVehicle && !hasActualQty) {
      return ["Approved"];
    }

    // ✅ ⭐ SPECIAL CASE (your requirement)
    if (currentStatus === "Approved" && hasActualQty) {
      return ALL_STATUS; // allow everything
    }

    // ✅ Default flow
    return statusFlow[currentStatus] || [];
  };
 const renderFormFields = (disabled = false, formInstance) => {
  const status = formInstance.getFieldValue("status");

  const isSalesDisabled = ["In-Transit", "Out for Delivery","Partially Delivered", "Delivered"].includes(status);

  return (
    <>
     {contextHolder}

      {/* Date and Order */}
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="Advice No" name="advice_no">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Assign No" name="invoiceNo" >
            <Select
              placeholder="Select assign No"
              disabled
              showSearch
            >
              {data.map((item) => (
                <Option key={item.invoiceNo} value={item.invoiceNo}>
                  {item.invoiceNo}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Loading Advice Date" name="lodingadvicedate" rules={[{ required: true }]}>
            <DatePicker className="w-full" disabled format="YYYY-MM-DD" />
          </Form.Item>
        </Col>

        <Col span={6}>
         <Form.Item label="Status" name="status" rules={[{ required: true }]}>
  <Select
    placeholder="Select Status"
    disabled={
      ["In-Transit", "Out for Delivery", "Partially Delivered", "Delivered"]
        .includes(formInstance.getFieldValue("status"))
    }
  >     {getAllowedStatus(formInstance).map((status) => (<Option key={status} value={status}>
                {status}
              </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
         {/* Item Details */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 ">Items Details</h6>
        </Col>

        <Form.List name="items">
          {(fields) => (
            <>
              {fields.map(({ key, name }) => (
                <Row gutter={16} key={key} style={{ width: "100%" }} className="mt-2 ml-2! mr-2! border border-amber-200 rounded-lg p-2">


                  <Col span={6}>
                    <Form.Item label="Item Name" name={[name, "product_name"]}>
                      <Input disabled className="w-full!" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Req. Qty" name={[name, "required_qty"]}>
                      <Input disabled className="w-full!" />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="Actual Qty" name={[name, "actual_qty"]}>
                      <Input disabled className="w-full!" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Variance" name={[name, "variance"]}>
                      <Input disabled className="w-full!" />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </>
          )}
        </Form.List>

      </Row>
     {["Dispatched", "In-Transit", "Out for Delivery","Partially Delivered", "Delivered"].includes(
  formInstance.getFieldValue("status")
) && (  
    <>
          <h6 className="text-amber-500 pb-2 font-semibold">
            Sale Order Details
          </h6>

          <Form.List name="sale_orders">
            {(fields) => (
              <>
                {fields.map(({ key, name }) => (
                  <div
                    key={key}
                    className="border border-amber-200 rounded-lg p-3 mb-3"
                  >
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item label="Sale Order No" name={[name, "sale_order_no"]}>
                          <Input disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="Customer Name" name={[name, "customer_name"]}>
                          <Input disabled />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item label="Delivery Address" name={[name, "delivery_address"]}>
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item label="Delivery Date" name={[name, "delivery_date"]} rules={[{ required: true }]}>
                          <DatePicker className="w-full" disabled={isSalesDisabled} />
                        </Form.Item>
                      </Col>
                    <Col span={6}>
  <Form.Item label="Status" name={[name, "status"]} rules={[{ required: true }]}>
      <Select disabled={disabled}>
      {getSaleOrderAllowedStatus(
        formInstance.getFieldValue(["sale_orders", name, "status"])
      ).map((st) => (
        <Option key={st} value={st}>
          {st}
        </Option>
      ))}
      
    </Select>
  </Form.Item>
</Col>
                    </Row>

                    <Form.List name={[name, "items"]}>
                      {(itemFields) => (
                        <>
                          {itemFields.map(({ key: k, name: n }) => (
                            <Row gutter={24} key={k}>
                              <Col span={6}>
                                <Form.Item label="Item" name={[n, "product_name"]}>
                                  <Input disabled />
                                </Form.Item>
                              </Col>

                              <Col span={6}>
                                <Form.Item label="Quantity" name={[n, "qty"]}>
                                  <Input disabled />
                                </Form.Item>
                              </Col>

                              <Col span={6}>
                               <Form.Item
  label="Delivered Qty"
  name={[n, "delivered_qty"]}
  rules={[
    ({ getFieldValue }) => ({
      validator(_, value) {

        const orderQty = Number(
          getFieldValue(["sale_orders", name, "items", n, "qty"])
        );

        const actualItems = getFieldValue("items") || [];

        const actualQty = Number(actualItems[0]?.actual_qty || 0);

        const allOrders = getFieldValue("sale_orders") || [];

        let totalDelivered = 0;

        allOrders.forEach(so => {
          so.items?.forEach(it => {
            totalDelivered += Number(it.delivered_qty || 0);
          });
        });

        if (value && Number(value) > orderQty) {
          return Promise.reject(
            new Error(`Delivered qty cannot exceed order qty (${orderQty})`)
          );
        }

        if (totalDelivered > actualQty) {
          return Promise.reject(
            new Error(`Total delivered qty cannot exceed actual qty (${actualQty})`)
          );
        }

        return Promise.resolve();
      },
    }),
  ]}
>
  <Input disabled={isSalesDisabled}/>
</Form.Item>
                              </Col>

                            </Row>
                          ))}
                        </>
                      )}
                    </Form.List>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </>
      )}
      {/* Company Details */}
      <Row gutter={24}>
        <Col span={24}>
          <h6 className="text-amber-600 ">Vendor Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Vendor Name" name="companyName" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Address" name="companyAddress">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Phone" name="contactNo">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Contact Person" name="contactPerson">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* Plant */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600  "> Plant Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Plant Name" name="plantName">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Address" name="plantAddress">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Contact Person" name="plantContactPerson">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Phone" name="plantPhone">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>

   

      {/* Transport Details (display-only) */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 "> Transport Details </h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Transporter" name="transporter">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle No" name="vehicleNo">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Driver Name" name="driverName">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Driver Contact" name="driverContact">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Insurance Valid Upto" name="insuranceValidUpto">
            <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="PU Valid Upto" name="puValidUpto">
            <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Fitness Valid Upto" name="fitnessValidUpto">
            <DatePicker className="w-full" format="DD-MM-YYYY" disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* Loading Details */}
      <Row gutter={24} className="mt-2">
        <Col span={24}>
          <h6 className="text-amber-600 "> Loading Details</h6>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle In Time" name="vehicleInTime">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Vehicle Out Time" name="vehicleOutTime">
            <Input disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Tare Weight (KG)" name="tareWeight">
            <Input type="number" disabled />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item label="Net Weight (KG)" name="netWeight">
            <Input type="number" disabled />
          </Form.Item>
        </Col>
      </Row>
    </>
  );};

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined className="text-amber-600!" />}
            placeholder="Search..."
            className="w-64! border-amber-300! focus:border-amber-500!"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button icon={<FilterOutlined />} className="border-amber-400! text-amber-700! hover:bg-amber-100!" onClick={() => handleSearch("")}>
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

          {/* Add New removed as requested */}
        </div>
      </div>

      <div className="border border-amber-300 rounded-lg p-4 shadow-md bg-white">
        <h2 className="text-lg font-semibold text-amber-700 mb-0">Loading Advice</h2>
        <p className="text-amber-600 mb-3">Incoming loading advice; transporter details come from Purchase Indent</p>

        <Table columns={columns} dataSource={data} pagination={false} scroll={{ y: 300 }} rowKey="key" />
      </div>

      {/* Edit Modal (admin can view/edit admin-level fields incl. approve status) */}
      <Modal title={<span className="text-amber-700 text-2xl font-semibold">Edit Loading Advice</span>} open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null} width={1200}>
        <Form layout="vertical" form={form} onFinish={handleEdit}>
          {renderFormFields(false, form)}
          <div className="flex justify-end mt-4">
            <Button htmlType="submit" className="bg-amber-500 hover:bg-amber-600 text-white border-none">
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal title={<span className="text-amber-700 text-2xl font-semibold">View Loading Advice</span>} open={isViewModalOpen} onCancel={() => setIsViewModalOpen(false)} footer={null} width={1200}>
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(true, viewForm)}
        </Form>
      </Modal>
    </div>
  );
}