import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { authUtils } from "../../utils/auth";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: values.email,
        password: values.password,
      });

      if (!response.ok) {
        const errorData = await response.json();
        message.error(errorData.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Save tokens and user info
      authUtils.setTokens(data.accessToken, data.refreshToken, data.user);

      message.success("Login successful!");
      navigate("/"); // Redirect to main app page
    } catch (error) {
      console.error("Login error:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url("/Repair_image.jpg")`, // 👈 Replace with your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card
        style={{ width: 450, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        bordered={false}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ marginBottom: "20px" }}>
            <img
              src="/GEWlogo2.png"
              alt="Guruji Engineering Works Logo"
              style={{
                height: "70px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>
          <Title
            level={3}
            style={{ margin: "0 0 5px 0", color: "#486A47", fontSize: "18px" }}
          >
            Welcome to
          </Title>
          <Title
            level={2}
            style={{ margin: "0 0 20px 0", color: "#486A47", fontSize: "24px" }}
          >
            Guruji Engineering Works
          </Title>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                backgroundColor: "#486A47",
                borderColor: "#486A47",
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
