import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { sendEmail } from "../utils/email";

interface ComposeEmailProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const ComposeEmail = ({ visible, onCancel, onSuccess }: ComposeEmailProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSend = async (values: any) => {
    setLoading(true);
    try {
      await sendEmail({
        to: values.to,
        subject: values.subject,
        textBody: values.body,
        htmlBody: values.body.replace(/\n/g, "<br>"),
      });

      message.success("Email sent successfully!");
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      message.error(error.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Compose Email"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSend}
        className="mt-4"
      >
        <Form.Item
          name="to"
          label="To"
          rules={[
            { required: true, message: "Please enter recipient email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="recipient@example.com" size="large" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: "Please enter subject" }]}
        >
          <Input placeholder="Email subject" size="large" />
        </Form.Item>

        <Form.Item
          name="body"
          label="Message"
          rules={[{ required: true, message: "Please enter message" }]}
        >
          <Input.TextArea
            rows={10}
            placeholder="Write your message here..."
            className="custom-scrollbar"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
              className="bg-primary hover:bg-primary/90"
            >
              Send
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComposeEmail;

