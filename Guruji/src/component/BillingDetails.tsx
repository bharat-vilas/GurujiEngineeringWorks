import React from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Table,
  Typography,
  Space,
  DatePicker,
  Col,
  Row,
  Select,
  message,
} from "antd";
import { MailOutlined, DownloadOutlined } from "@ant-design/icons";
import type { DefaultOptionType } from "antd/es/select";
import { clients } from "../enums";
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/emailConfig';

type ClientOption = DefaultOptionType & {
  firm?: string;
  address?: string;
  email?: string;
};

export default function BillingDetails({
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
  sendEmail
}: any) {
  const columns = [
    {
      title: "S.No",
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: "Item",
      dataIndex: "item",
      render: (text: string, record: any) => (
        <Input
          value={text}
          onChange={(e) => handleCellChange(record.key, "item", e.target.value)}
          placeholder="Enter item description"
          allowClear
        />
      ),
      width: "20vw"
    },
    {
      title: "Rate",
      dataIndex: "rate",
      render: (text: any, record: any) => (
        <Input
          value={text}
          onChange={(e) => handleCellChange(record.key, "rate", e.target.value)}
          placeholder="₹0.00"
          prefix="₹"
          allowClear
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      render: (text: any, record: any) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleCellChange(record.key, "qty", e.target.value)}
          placeholder="0"
        />
      ),
    },
    {
      title: "Amount",
      render: (_: any, record: any) => (
        <span>₹{(record.rate * record.qty).toFixed(2)}</span>
      ),
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <Button danger onClick={() => handleDeleteItem(record.key)}>
          Delete
        </Button>
      ),
    },
  ];

  const totalAmount = items.reduce(
    (sum: any, item: any) => sum + item.rate * item.qty,
    0
  );

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      message.error("Please enter recipient email address");
      return;
    }

    // Initialize EmailJS using configuration
    const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = EMAIL_CONFIG;

    const templateParams = {
      to_email: recipientEmail,
      client_name: clientInfo.name,
      client_firm: clientInfo.firm,
      billing_date: quotationDate ? quotationDate.format("DD/MM/YYYY") : "",
      items: items.map((item: any, index: number) => 
        `${index + 1}. ${item.item} - Qty: ${item.qty}, Rate: ₹${item.rate}, Amount: ₹${(item.rate * item.qty).toFixed(2)}`
      ).join('\n'),
      total_amount: totalAmount.toFixed(2),
      from_name: "Guruji Engineering Works",
      message: `Dear ${clientInfo.name},\n\nPlease find attached your billing details from Guruji Engineering Works.\n\nTotal Amount: ₹${totalAmount.toFixed(2)}\n\nThank you for your business.`
    };

    try {
      message.loading({ content: 'Sending email...', key: 'sendEmail' });
      
      // Check if EmailJS is properly configured
      if (SERVICE_ID === 'your_service_id' || TEMPLATE_ID === 'your_template_id' || PUBLIC_KEY === 'your_public_key') {
        message.warning({ 
          content: 'Please configure EmailJS credentials in src/config/emailConfig.ts', 
          key: 'sendEmail', 
          duration: 4 
        });
        return;
      }
      
      // Send email using EmailJS
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      message.success({ content: 'Email sent successfully!', key: 'sendEmail', duration: 2 });
      
    } catch (error) {
      message.error({ content: 'Failed to send email. Please try again.', key: 'sendEmail' });
      console.error('Email sending error:', error);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: 10,
        background: "#fff",
        borderRadius: "6px",
        marginRight: 10,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: "#1890ff", margin: 0 }}>Billing Information</h3>
      </div>
      
      <div>
        <label style={{ fontWeight: "bold", fontSize: "15px" }}>Client</label>
        <Select
          style={{ width: "100%", marginBottom: "20px" }}
          placeholder="Select Client"
          options={clients}
          allowClear
          onChange={(value, option) => {
            const client = option as ClientOption;

            if (client) {
              setClientInfo((prev: any) => ({
                ...prev,
                name: client.value as string,
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

      <Form layout="vertical">
        <div>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Client Name">
                <Input
                  placeholder="Enter name"
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, name: e.target.value })
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Firm Name">
                <Input
                  value={clientInfo.firm}
                  placeholder="Enter company"
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, firm: e.target.value })
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Recipient Email">
                <Input
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  allowClear
                  placeholder="Enter email"
                  type="email"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={19}>
              <Form.Item label="Address">
                <Input
                  value={clientInfo.address}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, address: e.target.value })
                  }
                  allowClear
                  placeholder="Enter address"
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label="Billing Date">
                <DatePicker
                  onChange={(date) => setQuotationDate(date)}
                  value={quotationDate}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Table
            dataSource={items}
            columns={columns}
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <b>Total Amount</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <b style={{ color: "#1890ff", fontSize: "16px" }}>
                    ₹{totalAmount.toFixed(2)}
                  </b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )}
            rowKey="uniqueId"
            bordered
          />

          <Space style={{ marginTop: 20 }}>
            <Button type="primary" onClick={handleAddItem}>
              Add Item
            </Button>
            <Button 
              type="primary" 
              icon={<MailOutlined />}
              onClick={handleSendEmail}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Send Email
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={downloadPDF}
            >
              Download PDF
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
