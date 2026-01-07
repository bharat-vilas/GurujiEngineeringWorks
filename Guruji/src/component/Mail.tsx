import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tabs,
  List,
  Avatar,
  Typography,
  Space,
  message,
  Empty,
  Spin,
  Form,
  Input,
  Upload,
  Switch,
} from "antd";
import {
  MailOutlined,
  SendOutlined,
  InboxOutlined,
  ReloadOutlined,
  PlusOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { getSentEmails, getInboxEmails, GmailEmail, sendEmail, disconnectGmail } from "../utils/email";
import ResizableSplitPane from "./ResizableSplitPane";
import { Popconfirm } from "antd";

const { Text, Paragraph } = Typography;

const Mail = () => {
  const { isAuthenticated, authenticate, userEmail, refreshStatus } = useEmailAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxEmails, setInboxEmails] = useState<GmailEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [composeVisible, setComposeVisible] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [composeForm] = Form.useForm();
  const [composeLoading, setComposeLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<"compose" | "details">("compose");

  useEffect(() => {
    if (isAuthenticated) {
      loadEmails();
    }
  }, [isAuthenticated, activeTab]);

  const loadEmails = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      if (activeTab === "inbox") {
        const emails = await getInboxEmails(50);
        setInboxEmails(emails);
      } else {
        const emails = await getSentEmails(50);
        setSentEmails(emails);
      }
    } catch (error: any) {
      message.error(error.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    await authenticate();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getEmailInitials = (email: string) => {
    const name = email.split("@")[0];
    return name.substring(0, 2).toUpperCase();
  };

  const handleComposeSend = async (values: any) => {
    setComposeLoading(true);
    try {
      await sendEmail({
        to: values.to,
        subject: values.subject,
        textBody: values.body,
        htmlBody: values.body.replace(/\n/g, "<br>"),
      });

      message.success("Email sent successfully!");
      composeForm.resetFields();
      setAttachedFiles([]);
      loadEmails();
    } catch (error: any) {
      message.error(error.message || "Failed to send email");
    } finally {
      setComposeLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setAttachedFiles((prev) => [...prev, file]);
    return false; // Prevent auto upload
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDisconnectGmail = async () => {
    try {
      await disconnectGmail();
      message.success("Gmail account disconnected successfully");
      // Refresh auth status
      if (refreshStatus) {
        await refreshStatus();
      }
      // Clear email lists
      setInboxEmails([]);
      setSentEmails([]);
      setSelectedEmail(null);
      setComposeVisible(true);
      setViewMode("compose");
    } catch (error: any) {
      message.error(error.message || "Failed to disconnect Gmail account");
    }
  };

  const currentEmails = activeTab === "inbox" ? inboxEmails : sentEmails;

  // Left side: Email List
  const renderLeftPanel = () => {
    if (!isAuthenticated) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8">
          <MailOutlined className="text-6xl text-gray-300 mb-4" />
          <Text className="text-lg text-gray-500 mb-4">
            Connect your Gmail account to send and receive emails
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<MailOutlined />}
            onClick={handleConnectGmail}
            className="bg-primary hover:bg-primary/90"
          >
            Connect Gmail
          </Button>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Emails</h3>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadEmails}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={handleConnectGmail}
              title="Connect another Gmail account"
              size="small"
            >
              Connect Another
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                setComposeVisible(true);
                setSelectedEmail(null);
                setViewMode("compose");
              }}
              className="bg-primary hover:bg-primary/90"
              size="small"
            >
              Compose
            </Button>
          </Space>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="flex flex-col h-full"
          items={[
            {
              key: "inbox",
              label: (
                <span>
                  <InboxOutlined /> Inbox ({inboxEmails.length})
                </span>
              ),
              children: (
                <div className="overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Spin size="large" />
                    </div>
                  ) : inboxEmails.length === 0 ? (
                    <Empty description="No emails found" />
                  ) : (
                    <List
                      dataSource={inboxEmails}
                      renderItem={(email) => (
                        <List.Item
                          className="hover:bg-gray-50 cursor-pointer transition-colors border-b"
                          onClick={() => {
                            setSelectedEmail(email);
                            setComposeVisible(false);
                            setViewMode("details");
                          }}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                style={{
                                  backgroundColor: "#486A47",
                                }}
                              >
                                {getEmailInitials(email.from)}
                              </Avatar>
                            }
                            title={
                              <div className="flex justify-between items-start">
                                <div>
                                  <Text strong>
                                    {email.from.split("<")[0].trim() || email.from}
                                  </Text>
                                  <Text type="secondary" className="ml-2 text-xs">
                                    {email.from.includes("<")
                                      ? email.from.match(/<(.+)>/)?.[1]
                                      : ""}
                                  </Text>
                                </div>
                                <Text type="secondary" className="text-xs">
                                  {formatDate(email.date)}
                                </Text>
                              </div>
                            }
                            description={
                              <div>
                                <Text strong className="block mb-1">
                                  {email.subject || "(No Subject)"}
                                </Text>
                                <Paragraph
                                  ellipsis={{ rows: 1 }}
                                  className="text-sm text-gray-600 mb-0"
                                >
                                  {email.snippet || email.body.substring(0, 100)}
                                </Paragraph>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              ),
            },
            {
              key: "sent",
              label: (
                <span>
                  <SendOutlined /> Sent ({sentEmails.length})
                </span>
              ),
              children: (
                <div className="overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Spin size="large" />
                    </div>
                  ) : sentEmails.length === 0 ? (
                    <Empty description="No sent emails found" />
                  ) : (
                    <List
                      dataSource={sentEmails}
                      renderItem={(email) => (
                        <List.Item
                          className="hover:bg-gray-50 cursor-pointer transition-colors border-b"
                          onClick={() => {
                            setSelectedEmail(email);
                            setComposeVisible(false);
                            setViewMode("details");
                          }}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                style={{
                                  backgroundColor: "#486A47",
                                }}
                              >
                                {getEmailInitials(email.to)}
                              </Avatar>
                            }
                            title={
                              <div className="flex justify-between items-start">
                                <div>
                                  <Text strong>To: {email.to}</Text>
                                </div>
                                <Text type="secondary" className="text-xs">
                                  {formatDate(email.date)}
                                </Text>
                              </div>
                            }
                            description={
                              <div>
                                <Text strong className="block mb-1">
                                  {email.subject || "(No Subject)"}
                                </Text>
                                <Paragraph
                                  ellipsis={{ rows: 1 }}
                                  className="text-sm text-gray-600 mb-0"
                                >
                                  {email.snippet || email.body.substring(0, 100)}
                                </Paragraph>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
        </div>
      </div>
    );
  };

  // Right side: Compose/Email Details / Document Attachment
  const renderRightPanel = () => {
    if (!isAuthenticated) {
      return null;
    }

    if (selectedEmail && !composeVisible) {
      // Email details view
      return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                type="text"
                onClick={() => {
                  setSelectedEmail(null);
                  setComposeVisible(true);
                  setViewMode("compose");
                }}
              >
                ← Back
              </Button>
              <Switch
                checked={viewMode === "details"}
                onChange={(checked) => {
                  setViewMode(checked ? "details" : "compose");
                  if (!checked) {
                    setComposeVisible(true);
                    setSelectedEmail(null);
                  }
                }}
                checkedChildren={<EyeOutlined />}
                unCheckedChildren={<EditOutlined />}
                title={viewMode === "details" ? "Switch to Compose" : "Switch to Email Details"}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            <div className="mb-4">
              <Text strong className="text-lg block mb-2">
                {selectedEmail.subject || "(No Subject)"}
              </Text>
              <Text type="secondary" className="text-sm">
                From: {selectedEmail.from}
              </Text>
              <br />
              <Text type="secondary" className="text-sm">
                To: {selectedEmail.to}
              </Text>
              <br />
              <Text type="secondary" className="text-sm">
                Date: {formatDate(selectedEmail.date)}
              </Text>
            </div>
            <div className="border-t pt-4">
              <Paragraph className="whitespace-pre-wrap">
                {selectedEmail.body}
              </Paragraph>
            </div>
          </div>
        </div>
      );
    }

    // Compose email view
    return (
      <div className="h-full flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">Compose Email</h3>
            <Switch
              checked={viewMode === "compose"}
              onChange={(checked) => {
                setViewMode(checked ? "compose" : "details");
                if (!checked && selectedEmail) {
                  setComposeVisible(false);
                } else if (checked) {
                  setComposeVisible(true);
                  setSelectedEmail(null);
                }
              }}
              checkedChildren={<EditOutlined />}
              unCheckedChildren={<EyeOutlined />}
              title={viewMode === "compose" ? "Switch to Email Details" : "Switch to Compose"}
            />
          </div>
          <Button
            type="text"
            onClick={() => {
              setComposeVisible(false);
              setSelectedEmail(null);
              composeForm.resetFields();
              setAttachedFiles([]);
              setViewMode("compose");
            }}
          >
            Cancel
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <Form
          form={composeForm}
          layout="vertical"
          onFinish={handleComposeSend}
          className="flex flex-col"
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

          {/* Document Attachment Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <PaperClipOutlined />
                <span>Attachments</span>
              </div>
            }
            className="mb-4"
            size="small"
          >
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              multiple
            >
              <Button icon={<PlusOutlined />} block>
                Add Document
              </Button>
            </Upload>
            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <Text className="text-sm truncate flex-1 mr-2">
                      {file.name}
                    </Text>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFile(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setComposeVisible(false);
                composeForm.resetFields();
                setAttachedFiles([]);
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={composeLoading}
                className="bg-primary hover:bg-primary/90"
              >
                Send
              </Button>
            </div>
          </Form.Item>
        </Form>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full p-4 overflow-hidden">
      <Card className="h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Mail</h2>
            {isAuthenticated && userEmail && (
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-sm">
                  Connected as: {userEmail}
                </Text>
                <Popconfirm
                  title="Disconnect Gmail"
                  description="Are you sure you want to disconnect this Gmail account?"
                  onConfirm={handleDisconnectGmail}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DisconnectOutlined />}
                    title="Disconnect Gmail account"
                  >
                    Disconnect
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="h-full flex flex-col items-center justify-center">
            <MailOutlined className="text-6xl text-gray-300 mb-4" />
            <Text className="text-lg text-gray-500 mb-4">
              Connect your Gmail account to send and receive emails
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<MailOutlined />}
              onClick={handleConnectGmail}
              className="bg-primary hover:bg-primary/90"
            >
              Connect Gmail
            </Button>
          </div>
        ) : (
          <div className="h-full" style={{ height: "calc(100% - 80px)" }}>
            <ResizableSplitPane
              left={renderLeftPanel()}
              right={renderRightPanel()}
              defaultLeftWidth={50}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Mail;

