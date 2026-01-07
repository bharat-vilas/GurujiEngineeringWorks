import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  Space,
  DatePicker,
  Col,
  Row,
  Select,
  message,
} from "antd";
import type { DefaultOptionType } from "antd/es/select";
import { MailOutlined, DownloadOutlined } from "@ant-design/icons";
import { api } from "../utils/api";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { sendEmail } from "../utils/email";

type ClientOption = DefaultOptionType & {
  firm?: string;
  address?: string;
  email?: string;
};

export default function Details({
  setClientInfo,
  clientInfo,
  setRecipientEmail,
  recipientEmail,
  setQuotationDate,
  quotationDate,
  handleAddItem,
  downloadPDF,
  handleCellChange,
  handleDeleteItem,
  items,
}: any) {
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const { isAuthenticated, authenticate } = useEmailAuth();

  // Fetch clients from backend
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const response = await api.get("/api/clients");
        if (response.ok) {
          const clients = await response.json();
          // Transform backend data to Select component format
          const options = clients.map((client: any) => ({
            label: `${client.name} - ${client.firm}`,
            value: client.name,
            firm: client.firm,
            address: client.address,
            email: client.email || "",
            phone: client.phone || "",
            gstin: client.gstin || "",
          }));
          setClientOptions(options);
        } else {
          message.error("Failed to load clients");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        message.error("Error loading clients");
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const totalAmount = items.reduce(
    (sum: any, item: any) => sum + item.rate * item.qty,
    0
  );

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      message.error("Please enter recipient email address");
      return;
    }

    if (!isAuthenticated) {
      message.warning({
        content: "Please authenticate with Google to send emails",
        duration: 3,
      });
      await authenticate();
      return;
    }

    try {
      message.loading({ content: "Sending email...", key: "sendEmail" });

      const emailBody = `Dear ${
        clientInfo.name || "Client"
      },\n\nPlease find attached your quotation from Guruji Engineering Works.\n\nThank you for your business.`;

      await sendEmail({
        to: recipientEmail,
        subject: "Quotation - Guruji Engineering Works",
        textBody: emailBody,
      });

      message.success({
        content: "Email sent successfully!",
        key: "sendEmail",
        duration: 2,
      });
    } catch (error: any) {
      message.error({
        content: error.message || "Failed to send email. Please try again.",
        key: "sendEmail",
      });
      console.error("Email sending error:", error);
    }
  };
  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <Card style={{ paddingBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Header Section */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ color: "#1890ff", margin: 0, textAlign: "center" }}>
              QUOTATION FORM
            </h2>
          </div>

          {/* Client Selection */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{ fontWeight: "bold", fontSize: "15px", color: "#333" }}
            >
              Select Client
            </label>
            <Select
              style={{ width: "100%", marginTop: "8px" }}
              placeholder="Choose a client"
              options={clientOptions}
              allowClear
              size="large"
              loading={loadingClients}
              onChange={(value, option) => {
                const client = option as ClientOption;

                if (client && value) {
                  setClientInfo((prev: any) => ({
                    ...prev,
                    name: value as string,
                    firm: client.firm ?? "",
                    address: client.address ?? "",
                  }));
                  setRecipientEmail(client.email ?? "");
                } else {
                  setClientInfo({ name: "", firm: "", address: "" });
                  setRecipientEmail("");
                }
              }}
            />
          </div>

          {/* Client Information */}
          <div
            style={{
              backgroundColor: "#d1ecf1",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "2px solid #17a2b8",
            }}
          >
            <h4 style={{ color: "#0c5460", marginBottom: "15px" }}>
              Client Information
            </h4>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Client Name
                  </label>
                  <Input
                    placeholder="Enter client name"
                    value={clientInfo.name}
                    onChange={(e) =>
                      setClientInfo({ ...clientInfo, name: e.target.value })
                    }
                    size="large"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Company/Firm
                  </label>
                  <Input
                    placeholder="Enter company name"
                    value={clientInfo.firm}
                    onChange={(e) =>
                      setClientInfo({ ...clientInfo, firm: e.target.value })
                    }
                    size="large"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Email Address
                  </label>
                  <Input
                    placeholder="Enter email address"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    type="email"
                    size="large"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: "5px",
                    }}
                  >
                    Quotation Date
                  </label>
                  <DatePicker
                    onChange={(date) => setQuotationDate(date)}
                    value={quotationDate}
                    size="large"
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Address
              </label>
              <Input
                placeholder="Enter complete address"
                value={clientInfo.address}
                onChange={(e) =>
                  setClientInfo({ ...clientInfo, address: e.target.value })
                }
                size="large"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* Items Section */}
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "2px solid #52c41a",
            }}
          >
            <h4 style={{ color: "#52c41a", marginBottom: "15px" }}>
              Quotation Items (Total: ₹{totalAmount.toFixed(2)})
            </h4>

            {items.map((item: any, index: number) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  alignItems: "center",
                  padding: "10px",
                  backgroundColor: "rgba(240, 248, 255, 0.8)",
                  borderRadius: "4px",
                }}
              >
                <span style={{ minWidth: "30px", fontWeight: "bold" }}>
                  {index + 1}.
                </span>
                <Input
                  placeholder="Item description"
                  value={item.item}
                  onChange={(e) =>
                    handleCellChange(item.key, "item", e.target.value)
                  }
                  style={{ flex: 3 }}
                />
                <Input
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) =>
                    handleCellChange(item.key, "rate", e.target.value)
                  }
                  prefix="₹"
                  style={{ flex: 1 }}
                />
                <Input
                  placeholder="Qty"
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    handleCellChange(item.key, "qty", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <span
                  style={{
                    minWidth: "80px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  ₹{(item.rate * item.qty).toFixed(2)}
                </span>
                <Button
                  danger
                  size="small"
                  onClick={() => handleDeleteItem(item.key)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ textAlign: "center" }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={handleAddItem}
                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
              >
                Add Item
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<MailOutlined />}
                onClick={handleSendEmail}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Send Email
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={downloadPDF}
                style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
              >
                Download PDF
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
}
