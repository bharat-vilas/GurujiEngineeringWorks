import { Card, Table, Typography } from "antd";
import React from "react";
import "./componentCSS.css";
import { COMPANY_CONFIG } from "../config/companyConfig";
import { formatSerialNumber } from "../utils/serialNumberFormatter";

function Preview({
  clientInfo,
  quotationDate,
  quotationRef,
  items,
  quotationSerial,
}: any) {
  const previewColumns = [
    {
      title: "S.No",
      render: (_: any, __: any, idx: number) => idx + 1,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#DBDEE9",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Item",
      dataIndex: "item",
      render: (text: string) => <span>{text}</span>,
      width: "25vw",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#DBDEE9",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      render: (text: string) => <span>{text}</span>,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#DBDEE9",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      render: (text: string) => <span>{text}</span>,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#DBDEE9",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Amount",
      render: (_: any, record: any) => (
        <span>{(record.rate * record.qty).toFixed(2)}</span>
      ),
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#DBDEE9",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
  ];
  const totalAmount = items.reduce(
    (sum: any, item: any) => sum + item.rate * item.qty,
    0
  );
  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <Card ref={quotationRef} style={{ paddingBottom: "10px" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: "15px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "black",
            borderBottom: "1px solid black",
            paddingBottom: "6px",
          }}
        >
          Quotation - #{quotationSerial || formatSerialNumber(0, "quotation")}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{ fontWeight: "bold", fontSize: "22px", color: "black" }}
            >
              GURUJI
            </div>
            <div
              style={{ fontWeight: "bold", fontSize: "22px", color: "black" }}
            >
              ENGINEERING
            </div>
            <div
              style={{ fontWeight: "bold", fontSize: "22px", color: "black" }}
            >
              WORKS
            </div>
          </div>
          <div>
            <img src="/GEWlogo2.png" alt="logo" style={{ height: "120px" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "0px" }}>
          <Card style={{ flex: 1, background: "#E6FFE6", padding: "0px" }}>
            {/* Left side content */}
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
              }}
            >
              FROM:{" "}
            </div>
            <div style={{ fontSize: "14px" }}>
              <strong>{COMPANY_CONFIG.name}</strong>
            </div>
            <div style={{ fontSize: "14px" }}>{COMPANY_CONFIG.company}</div>
            <div style={{ fontSize: "14px" }}>{COMPANY_CONFIG.address}</div>
          </Card>

          <Card style={{ flex: 1, background: "#E6FFE6", padding: "0px" }}>
            {/* Right side content */}
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
              }}
            >
              TO:{" "}
            </div>
            <div style={{ fontSize: "14px" }}>
              <strong>{clientInfo.name}</strong>
            </div>
            <div style={{ fontSize: "14px" }}>{clientInfo.firm}</div>
            <div style={{ fontSize: "14px" }}>{clientInfo.address}</div>
          </Card>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "15px",
            marginBottom: "15px",
            padding: "8px",
            backgroundColor: "#FAFAFA",
            borderRadius: "6px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            Quotation Date:{" "}
            {quotationDate ? quotationDate.format("DD/MM/YYYY") : ""}
          </div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            GSTIN: {COMPANY_CONFIG.gstin}
          </div>
        </div>

        <Table
          dataSource={items}
          columns={previewColumns}
          pagination={false}
          size="small"
          rowClassName={(record: any, index: number) =>
            index % 2 === 1 ? "#F8F9FA" : "white"
          }
          summary={() => (
            <Table.Summary.Row style={{ backgroundColor: "#E6FFE6" }}>
              <Table.Summary.Cell index={0} colSpan={4}>
                <b style={{ fontSize: "16px" }}>TOTAL AMOUNT</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b style={{ fontSize: "16px" }}>₹{totalAmount.toFixed(2)}</b>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
          bordered
        />
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "8px",
              color: "black",
            }}
          >
            Terms & Conditions:
          </div>
          <div style={{ marginBottom: "5px", fontSize: "12px" }}>
            <b>1. GST:</b> GST amount will be paid by you from the total amount
          </div>
          <div style={{ marginBottom: "5px", fontSize: "12px" }}>
            <b>2. Acceptance:</b> If you accept this quote then send us the
            confirmation
          </div>
          <div style={{ marginBottom: "8px", fontSize: "12px" }}>
            <b>3. Validity:</b> This quotation is valid for 30 days from the
            date of issue
          </div>
        </div>

        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            marginTop: "15px",
            marginBottom: "8px",
            textAlign: "center",
            color: "#52c41a",
          }}
        >
          Thank you for your business!
        </div>
        <div style={{ textAlign: "center", fontSize: "12px", color: "#666" }}>
          For any inquiries regarding this quotation, please contact us at:{" "}
          <b>{COMPANY_CONFIG.email}</b> or{" "}
          <b>{COMPANY_CONFIG.contact.split(",")[0]}</b>
        </div>

        <div
          style={{
            marginTop: "15px",
            padding: "8px",
            backgroundColor: "#FAFAFA",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "12px",
              marginBottom: "4px",
            }}
          >
            Additional Services Available:
          </div>
          <div style={{ fontSize: "11px" }}>
            • All types of sheet fabrication work
            <br />
            • Machinery parts manufacturing
            <br />
            • Gear cutting and manufacturing
            <br />• Machine maintenance and repair
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Preview;
