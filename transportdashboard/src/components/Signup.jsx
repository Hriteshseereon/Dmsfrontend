import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  Row,
  Col,
} from "antd";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { TruckOutlined } from "@ant-design/icons";

export default function Signup() {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      const res = signup(values);
      setLoading(false);
      setAlert({
        type: res.success ? "success" : "error",
        message: res.message,
      });
      if (res.success) {
        navigate("/login", { state: { signupMessage: res.message } });
      }
    }, 500);
  };

 return (
  <div className="flex items-center justify-center bg-amber-50">
    <div className="bg-white p-2 rounded-2xl shadow-lg w-full max-w-4xl">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <div className="bg-amber-500 text-white rounded-full p-3">
          <TruckOutlined className="text-3xl" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-amber-700 text-center">
        Create New Account
      </h2>
      <p className="text-amber-600 mb-6 text-center">
        Sign up to your new transport management account
      </p>

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

        {/* ROW 1 */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Registered Name" name="registeredName" rules={[{ required: true,message:"Please enter registered name"  }]}>
              <Input placeholder="ABC Transport Pvt Ltd" />
            </Form.Item>
          </Col>

        <Form.Item
  label="Email ID"
  name="email"
  rules={[
    { required: true, message: "Email is required" },
    { 
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
      message: "Invalid email (example@email.com)" 
    }
  ]}
>
  <Input placeholder="example@email.com" />
</Form.Item>



          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 ,message: "Please enter a valid 6-digit password" }]}>
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Contact Person Name" name="contactPerson" rules={[{ required: true }]}>
              <Input placeholder="John Doe" />
            </Form.Item>
          </Col>
        </Row>

        {/* ROW 2 */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
             <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: "Phone number required" },
                  { pattern: /^[0-9]{10}$/, message: "Enter 10 digit number" },
                ]}
              >
                <Input placeholder="9876543210" />
              </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item
                           label="Telephone Number"
                           name="telephone"
                           rules={[
                             { required: false },
                             { pattern: /^\d{10}$/, message: "Enter valid 10-digit telephone number" },
                           ]}
                         >
                           <Input />
                         </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Fax No" name="fax" rules={[{ required: true, message:"Please enter Fax No" }]}>
              <Input placeholder="033-87654321" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="PAN" name="pan" rules={[{ required: true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/ }]}>
              <Input placeholder="ABCDE1234F" />
            </Form.Item>
          </Col>
        </Row>

        {/* ROW 3 */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="GSTIN" name="gstin" rules={[{ required: true ,message:"Please enter GST No" }]}>
              <Input placeholder="22ABCDE1234F1Z5" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Address Line 1" name="address1" rules={[{ required: true , message: "Please enter address" }]}>
              <Input placeholder="Street / Area" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Address Line 2" name="address2" rules={[{ required: true , message: "Please enter address"}]}>
              <Input placeholder=" Locality" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="State" name="state" rules={[{ required: true , message: "Please enter state"}]}>
              <Input placeholder="Odisha" />
            </Form.Item>
          </Col>
        </Row>

        {/* ROW 4 */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="City" name="city" rules={[{ required: true , message: "Please enter city"}]}>
              <Input placeholder="Bhubnewar" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Form.Item label="District" name="district" rules={[{ required: true ,message: "Please enter district"}]}>
              <Input placeholder="Khorda" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6}>
              <Form.Item
                           label="PIN"
                           name="pin"
                           rules={[
                             { required: true, message: "Please enter PIN" },
                             { pattern: /^\d{6}$/, message: "Enter valid 6-digit PIN" },
                           ]}
                         >
                           <Input placeholder="700001"/>
                         </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mt-4">
          <Button
            htmlType="submit"
            block
            loading={loading}
            className="bg-amber-500! hover:bg-amber-600! text-white! border-none!"
          >
            Sign Up
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
         Already have an account?{" "}
          <Link to="/login" className="text-amber-600 hover:underline">Log In</Link>
        
      </div>
    </div>
  </div>
);

}
