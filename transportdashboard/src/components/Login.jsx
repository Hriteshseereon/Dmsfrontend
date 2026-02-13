import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Alert } from "antd";
// import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { TruckOutlined } from "@ant-design/icons";
import useSessionStore from "../store/sessionStrore";
import { login } from "../api/authService";
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSessionStore((state) => state.setSession);
  useEffect(() => {
    if (location.state && location.state.signupMessage) {
      setAlert({ type: "success", message: location.state.signupMessage });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setAlert(null);

      const res = await login(values.email, values.password);

      // Save session in zustand
      setSession({
        accessToken: res.tokens.access,
        refreshToken: res.tokens.refresh,
        transporterId: res.transporter_id,
        transportId: res.transport_id,
        registeredName: res.registered_name,
        organisationIds: res.organisation_ids,
      });

      setAlert({ type: "success", message: res.message });

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      setAlert({
        type: "error",
        message: error?.response?.data?.detail || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        {/* Logo */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-amber-500 text-white rounded-full p-3">
            <TruckOutlined className="text-3xl" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-amber-700">Transport Portal</h2>
        <p className="text-amber-600 mb-6">
          Sign in to your transport management account .
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
            label="Email ID"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email (example@email.com)",
              },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-amber-700 font-semibold">Password</span>
            }
            name="password"
            rules={[
              {
                required: true,
                min: 6,
                message: "Please enter a valid 6-digit password",
              },
            ]}
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

        <div className="text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-amber-600  hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
