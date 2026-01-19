import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Alert } from "antd";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons"
export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.signupMessage) {
      setAlert({ type: "success", message: location.state.signupMessage });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      const res = login(values);
      setLoading(false);

      if (res.success) {
        setAlert({ type: "success", message: res.message });
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setAlert({ type: "warning", message: res.message });
      }
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        {/* Logo */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-amber-500 text-white rounded-full p-3">
            <UserOutlined className="text-3xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-amber-700">Customer Portal</h2>
        <p className="text-amber-600 mb-6">
          Sign in to your Customer management account
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
          <Form.Item
            label={<span className="text-amber-700 font-semibold">Email</span>}
            name="email"
            rules={[{ required: true, },
              {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email (example@gmail.com)",
      },
            ]}
          >
            <Input placeholder="example@gmail.com" />
          </Form.Item>
          <Form.Item
            label={<span className="text-amber-700 font-semibold">Password</span>}
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              htmlType="submit"
              block
              loading={loading}
              className="
                bg-amber-500!
                hover:!bg-amber-600! 
                text-white! 
                border-none! 
                rounded-lg! 
                h-10! 
                transition-all duration-300!
              "
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-sm text-gray-500 ">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-amber-600  hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
