// src/pages/Signup.jsx
import { useState } from "react";
import { Form, Input, Button, Alert, Row, Col, Tag, Space } from "antd";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import CompanyInfoModal from "../components/CompanyInfo";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // company state
  const [companyModal, setCompanyModal] = useState(false);
  const [companies, setCompanies] = useState([]);

  const onFinish = (values) => {
    setLoading(true);

    const finalValues = {
      ...values,
      companies: companies,
    };

    const res = signup(finalValues);
    setLoading(false);
    setAlert({ type: res.success ? "success" : "error", message: res.message });

    if (res.success) {
      navigate("/login", { state: { signupMessage: res.message } });
    }
  };

  const removeCompany = (index) => {
    setCompanies((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">

        <div className="flex justify-center mb-4">
          <div className="bg-amber-500 text-white p-3 rounded-full">
            <UserOutlined className="text-3xl" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-amber-700">Customer Registration</h2>
        <p className="text-amber-600 mb-6">Create your new customer account</p>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            className="mb-4"
            showIcon
            closable
            onClose={() => setAlert(null)}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
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
  </Form.Item>            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
                <Form.Item
    label="Password"
    name="password"
    rules={[
      { required: true, message: "Please enter password" },
      {
        pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        message:
          "Password must contain 1 uppercase, 1 number & 1 special character",
      },
    ]}
  >
    <Input.Password placeholder="Strong password" />
  </Form.Item>

            </Col>
            <Col span={12}>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Broker Associate (Optional)" name="broker_associate">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            className="mb-4! text-amber-700! border-amber-300!"
            onClick={() => setCompanyModal(true)}
          >
            Add Company (Optional)
          </Button>

          {companies.length > 0 && (
            <div className="mb-4">
              <h4 className="text-amber-700 font-semibold mb-2">Added Companies ({companies.length})</h4>
              <Space direction="vertical" className="w-full">
                {companies.map((c, i) => (
                  <Tag
                    key={i}
                    closable
                    onClose={() => removeCompany(i)}
                    className="bg-amber-100! text-amber-800! px-4! py-2! rounded-lg!"
                  >
                    {c.name} ({c.city})
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          <Button
            block
            htmlType="submit"
            loading={loading}
            className="bg-amber-500! hover:bg-amber-600! text-white! border-none!"
          >
            Sign Up
          </Button>
        </Form>

        <div className="text-center mt-4 text-sm text-gray-500">
          {/* Want to register as a broker?{" "}
          <Link to="/broker-signup" className="text-amber-600 hover:underline">Broker</Link>
          <br /> */}
          Already have an account?{" "}
          <Link to="/login" className="text-amber-600 hover:underline">Log In</Link>
        </div>
      </div>

      {/* Modal */}
      <CompanyInfoModal
        open={companyModal}
        onClose={() => setCompanyModal(false)}
        onSave={(companyArray) => setCompanies(prev => [...prev, ...companyArray])}
      />
    </div>
  );
}
