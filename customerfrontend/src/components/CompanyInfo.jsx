// src/components/CompanyInfoModal.jsx
import { Modal, Form, Input, Row, Col, Button, Select } from "antd";
import { PlusOutlined, CloseCircleOutlined } from "@ant-design/icons";

export default function CompanyInfoModal({ open, onClose, onSave }) {
  const [form] = Form.useForm();

  const saveCompanies = () => {
    form.validateFields().then((values) => {
      onSave(values.companyList);   // return all companies
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={saveCompanies}
      okText="Save Companies"
      title={<span className="text-amber-700 font-semibold text-lg">Company Information</span>}
      width={1000}
    >
      <Form form={form} layout="vertical">
        <Form.List name="companyList" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <div key={key} className="border border-amber-200 p-4 rounded-xl mb-4 bg-amber-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-amber-700 font-semibold">Company {name + 1}</h3>

                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Row gutter={24}>
                    <Col span={6}>
                      <Form.Item label="Company Name" name={[name, "name"]} rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[
                          { required: true, message: "Please enter phone number" },
                          {
                            pattern: /^[6-9]\d{9}$/,
                            message: "Enter valid 10-digit mobile number",
                          },
                        ]}
                      >
                        <Input maxLength={10} placeholder="9876543210" />
                      </Form.Item>

                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Please enter your email" },
                          {
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email (example@gmail.com)",
                          },
                        ]}
                      >
                        <Input placeholder="example@gmail.com" />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="Country" name={[name, "country"]}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>


                  <Row gutter={24}>

                    <Col span={6}>
                      <Form.Item label="State" name={[name, "state"]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="City" name={[name, "city"]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="PIN"
                        name={[name, "pin"]}
                        rules={[
                          { required: true, message: "Please enter PIN code" },
                          {
                            pattern: /^[1-9][0-9]{5}$/,
                            message: "Enter valid 6-digit PIN code",
                          },
                        ]}
                      >
                        <Input
                          maxLength={6}
                          placeholder="560001"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="TDC Applicable" name={[name, "tdc_applicable"]}>
                        <Select
                          options={[
                            { label: "Yes", value: "Yes" },
                            { label: "No", value: "No" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>


                    <Col span={6}>
                      <Form.Item
                        label="GSTIN"
                        name={[name, "gst_in"]}
                        rules={[
                          { required: true, message: "Please enter GSTIN" },
                          {
                            pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                            message: "Enter valid GSTIN (e.g. 22ABCDE1234F1Z5)",
                          },
                        ]}
                      >
                        <Input
                          maxLength={15}
                          placeholder="22ABCDE1234F1Z5"
                          style={{ textTransform: "uppercase" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        label="TIN"
                        name={[name, "tin"]}
                        rules={[
                          { required: true, message: "Please enter TIN number" },
                          {
                            pattern: /^\d{11}$/,
                            message: "TIN must be 11 digits",
                          },
                        ]}
                      >
                        <Input
                          maxLength={11}
                          placeholder="12345678901"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        label="License No"
                        name={[name, "license_no"]}
                        rules={[
                          { required: true, message: "Please enter License number" },
                          {
                            pattern: /^[A-Za-z0-9\-\/]{5,20}$/,
                            message: "License must be 5–20 characters",
                          },
                        ]}
                      >
                        <Input placeholder="LIC-12345" />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        label="FSSAI No"
                        name={[name, "fassai_no"]}
                        rules={[
                          { required: true, message: "Please enter FSSAI number" },
                          {
                            pattern: /^\d{14}$/,
                            message: "FSSAI number must be 14 digits",
                          },
                        ]}
                      >
                        <Input
                          maxLength={14}
                          placeholder="12345678901234"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="Billing Type" name={[name, "billing_type"]}>
                        <Select
                          options={[
                            { label: "Online", value: "online" },
                            { label: "Offline", value: "offline" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Aadhaar No"
                        name={[name, "adhhar_no"]}
                        rules={[
                          { required: true, message: "Please enter Aadhaar number" },
                          {
                            pattern: /^\d{12}$/,
                            message: "Aadhaar number must be 12 digits",
                          },
                        ]}
                      >
                        <Input
                          maxLength={12}
                          placeholder="123412341234"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        label="PAN No"
                        name={[name, "pan_no"]}
                        rules={[
                          { required: true, message: "Please enter PAN number" },
                          {
                            pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                            message: "Enter valid PAN (ABCDE1234F)",
                          },
                        ]}
                      >
                        <Input
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          style={{ textTransform: "uppercase" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item label="Address" name={[name, "address"]}>
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </Col>
                  </Row>






                </div>
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => add({})}
                className="text-amber-700! border-amber-300!"
              >
                Add More Company
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
