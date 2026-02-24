import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  Table,
  InputNumber,
  Tag,
  Button,
  Space,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useProductPrice } from "@/queries/useProductPrice";

export default function PriceManagementTab({
  items,
  selectedItem,
  setSelectedItem,
}) {
  const { priceData, isLoading, updatePrice, isUpdating } = useProductPrice(
    selectedItem?.id,
  );

  const [price, setPrice] = useState(null);

  /* ================= SYNC PRICE ================= */
  useEffect(() => {
    if (!priceData) return;
    setPrice(Number(priceData.rate));
  }, [priceData]);

  /* ================= UPDATE PRICE ================= */
  const handlePriceSubmit = () => {
    if (!price) {
      message.error("Please enter price");
      return;
    }

    updatePrice(
      {
        product: selectedItem.id,
        rate: price,
      },
      {
        onSuccess: () => {
          message.success("Price updated successfully ✅");
        },
        onError: () => {
          message.error("Failed to update price");
        },
      },
    );
  };

  /* ================= TABLE DATA ================= */
  const tableData =
    priceData?.uom_prices?.map((u, index) => ({
      key: index,
      unit_name: u.unit_name,
      price: Number(u.price),
      is_display: u.uom_id === null,
    })) || [];

  return (
    <>
      <style>
        {`
/* ================= CARD ================= */
.amber-price-card .ant-card-head {
  // background: #fffbeb;
  // border-bottom: 2px solid #f59e0b;
}

.amber-price-card .ant-card-head-title {
  color: #92400e;
  font-weight: 600;
}

/* ================= TABLE ================= */
.amber-price-table .ant-table {
  // border: 1px solid #f59e0b;
  // border-radius: 8px;
  overflow: hidden;
}

.amber-price-table .ant-table-thead > tr > th {
  background: #fffbeb;
  color: #92400e;
  // border-bottom: 2px solid #f59e0b;
  font-weight: 600;
}

.amber-price-table .ant-table-tbody > tr > td {
  color: #78350f;
  border-bottom: 1px solid #fde68a;
}

.amber-price-table .ant-table-tbody > tr:hover > td {
  background: #fffbeb;
}

/* ================= PRIMARY BUTTON ================= */
.amber-primary-btn {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
}

.amber-primary-btn:hover {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
}

/* ================= INPUT FOCUS ================= */
.ant-input-number-focused {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.2) !important;
}

/* ================= TAG COLORS ================= */
.converted-tag {
  background: #fffbeb !important;
  color: #92400e !important;
  border-color: #fde68a !important;
}
`}
      </style>
      <Card
        className="amber-price-card"
        title="Price Management"
        extra={
          <Space>
            {/* PRODUCT SEARCH */}
            <Select
              style={{ width: 320 }}
              placeholder="Search & select product"
              showSearch
              allowClear
              optionFilterProp="label"
              value={selectedItem?.id}
              onChange={(id) => {
                const item = items.find((i) => i.id === id);
                setSelectedItem(item || null);
              }}
              options={items.map((i) => ({
                value: i.id,
                label: `${i.name} (${i.vendor_name || "No Vendor"})`,
              }))}
            />

            {/* RESET BUTTON */}
            {selectedItem && (
              <Button
                className="amber-primary-btn"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => setSelectedItem(null)}
              >
                Reset
              </Button>
            )}
          </Space>
        }
        loading={isLoading}
      >
        {/* ================= EMPTY STATE ================= */}
        {!selectedItem ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#888",
            }}
          >
            Select a product to manage pricing
          </div>
        ) : (
          <>
            {/* BASE PRICE SECTION */}
            <Space>
              <InputNumber
                prefix="₹"
                style={{ width: 220 }}
                placeholder="Base Unit Price"
                value={price}
                min={0}
                onChange={setPrice}
              />

              <Button
                className="amber-primary-btn"
                type="primary"
                loading={isUpdating}
                onClick={handlePriceSubmit}
              >
                Update Price
              </Button>
            </Space>

            {/* UNIT PRICE TABLE */}
            <Table
              className="amber-price-table"
              style={{ marginTop: 24 }}
              pagination={false}
              rowKey="key"
              dataSource={tableData}
              columns={[
                { title: "Unit", dataIndex: "unit_name" },
                {
                  title: "Type",
                  render: (_, r) =>
                    r.is_display ? (
                      <Tag color="green">Base</Tag>
                    ) : (
                      <Tag className="converted-tag">Converted</Tag>
                    ),
                },
                {
                  title: "Calculated Price",
                  dataIndex: "price",
                  render: (v) => `₹ ${v}`,
                },
              ]}
            />
          </>
        )}
      </Card>
    </>
  );
}
