import { useState } from "react";
import { Form, Input, Button, Alert, Row, Col, Tag, Space } from "antd";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import CompanyInfoModal from "../components/CompanyInfo";

export default function BrokerSignup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Company modal state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      const res = signup({
        ...values,
        role: "broker",
        companies,
      });

      setLoading(false);
      setAlert({ type: res.success ? "success" : "error", message: res.message });

      if (res.success) {
        navigate("/login", { state: { signupMessage: res.message } });
      }
    }, 500);
  };

  const removeCompany = (index) => {
    setCompanies((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-amber-500 text-white rounded-full p-3">
            <UserOutlined className="text-3xl" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-amber-700">Broker Registration</h2>
        <p className="text-amber-600 mb-6">Create your new broker account</p>

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

        {/* Broker Signup Form */}
        <Form layout="vertical" onFinish={onFinish}>

          {/* Row 1 */}
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
  </Form.Item> 
            </Col>
          </Row>

          {/* Row 2 */}
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

          {/* Row 3 */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Broker Associate (Optional)"
                name="broker_associate"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Add Company Button */}
          <Button
            type="dashed"
            block
            className="mb-4! text-amber-700! border-amber-300!"
            icon={<PlusOutlined />}
            onClick={() => setCompanyModalOpen(true)}
          >
            Add Company (Optional)
          </Button>

          {/* Show Added Companies */}
          {companies.length > 0 && (
            <div className="mb-4">
              <h4 className="text-amber-700 font-semibold mb-2">
                Added Companies ({companies.length})
              </h4>

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

          {/* Submit */}
          <Form.Item>
            <Button
              className="bg-amber-500! hover:bg-amber-600! text-white! border-none!"
              htmlType="submit"
              block
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        {/* Footer */}
        <div className="text-sm text-gray-500 mt-2">
          Want to register as a customer?{" "}
          <Link to="/signup" className="text-amber-600 hover:underline">
            Customer
          </Link>
        </div>

        <div className="text-sm text-gray-500 mt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>

      {/* Reusable Company Info Modal */}
      <CompanyInfoModal
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onSave={(list) => setCompanies((prev) => [...prev, ...list])}
      />
    </div>
  );
}
