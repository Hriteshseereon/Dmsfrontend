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
    <Card
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
              type="primary"
              loading={isUpdating}
              onClick={handlePriceSubmit}
            >
              Update Price
            </Button>
          </Space>

          {/* UNIT PRICE TABLE */}
          <Table
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
                    <Tag>Converted</Tag>
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
  );
}
