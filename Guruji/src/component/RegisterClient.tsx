import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Space, Popconfirm, Empty } from "antd";
import { SaveOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { api } from "../utils/api";
import ResizableSplitPane from "./ResizableSplitPane";

interface Client {
  _id?: string;
  name: string;
  firm: string;
  address: string;
  email?: string;
  phone?: string;
  gstin?: string;
}

const RegisterClient = () => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        message.error("Failed to load clients");
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      message.error("Error loading clients");
    }
  };

  const onFinish = async (values: Client) => {
    setLoading(true);
    try {
      if (editingId) {
        // Update existing client
        const response = await api.put(`/api/clients/${editingId}`, values);
        if (response.ok) {
          message.success("Client updated successfully!");
          form.resetFields();
          setEditingId(null);
          loadClients();
        } else {
          const errorData = await response.json();
          message.error(errorData.message || "Failed to update client");
        }
      } else {
        // Create new client
        const response = await api.post("/api/clients", values);
        if (response.ok) {
          message.success("Client registered successfully!");
          form.resetFields();
          loadClients();
        } else {
          const errorData = await response.json();
          message.error(errorData.message || "Failed to register client");
        }
      }
    } catch (error) {
      console.error("Error saving client:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    form.setFieldsValue(client);
    setEditingId(client._id || null);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/api/clients/${id}`);
      if (response.ok) {
        message.success("Client deleted successfully!");
        loadClients();
      } else {
        message.error("Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      message.error("Error deleting client");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingId(null);
  };

  return (
    <div className="h-full p-4 overflow-hidden">
      <ResizableSplitPane
        defaultLeftWidth={50}
        left={
          <div className="h-full overflow-y-auto custom-scrollbar">
            <Card className="h-full shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingId ? "Edit Client" : "Register New Client"}
              </h2>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="name"
                    label="Client Name"
                    rules={[{ required: true, message: "Please enter client name" }]}
                  >
                    <Input placeholder="Enter client name" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="firm"
                    label="Firm Name"
                    rules={[{ required: true, message: "Please enter firm name" }]}
                  >
                    <Input placeholder="Enter firm name" size="large" />
                  </Form.Item>
                </div>

                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input.TextArea
                    placeholder="Enter complete address"
                    rows={3}
                    size="large"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item name="email" label="Email">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item name="phone" label="Phone">
                    <Input placeholder="Enter phone number" size="large" />
                  </Form.Item>
                </div>

                <Form.Item name="gstin" label="GSTIN">
                  <Input placeholder="Enter GSTIN" size="large" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      size="large"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {editingId ? "Update Client" : "Register Client"}
                    </Button>
                    {editingId && (
                      <Button size="large" onClick={handleCancel}>
                        Cancel
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </div>
        }
        right={
          <div className="h-full overflow-y-auto custom-scrollbar">
            <Card 
              title="Registered Clients" 
              className="h-full shadow-sm"
            >
              {clients.length === 0 ? (
                <Empty description="No clients registered yet" />
              ) : (
                <div className="space-y-2">
                  {clients.map((client) => (
                    <Card
                      key={client._id}
                      className="shadow-sm hover:shadow-md transition-shadow bg-orange-50 border-orange-100"
                      size="small"
                      bodyStyle={{ padding: "12px", position: "relative" }}
                    >
                      {/* Action Buttons - Top Right */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          type="primary"
                          shape="circle"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(client)}
                          className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                          title="Edit"
                        />
                        <Popconfirm
                          title="Are you sure you want to delete this client?"
                          onConfirm={() => client._id && handleDelete(client._id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button
                            type="primary"
                            shape="circle"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            className="bg-red-500 hover:bg-red-600 border-red-500"
                            title="Delete"
                          />
                        </Popconfirm>
                      </div>
                      
                      <div className="space-y-1 pr-16">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Name:</span>
                          <span className="text-sm font-medium text-gray-800">{client.name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Firm:</span>
                          <span className="text-sm text-gray-700">{client.firm}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Address:</span>
                          <span className="text-sm text-gray-700">{client.address}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Email:</span>
                            <span className="text-sm text-gray-700">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">Phone:</span>
                            <span className="text-sm text-gray-700">{client.phone}</span>
                          </div>
                        )}
                        {client.gstin && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-500 min-w-[60px]">GSTIN:</span>
                            <span className="text-sm text-gray-700">{client.gstin}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        }
      />
    </div>
  );
};

export default RegisterClient;

