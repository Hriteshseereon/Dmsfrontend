import React, { useState } from "react";
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
import { productPriceUpdate } from "@/api/product";

export default function PriceManagementTab({
  items,
  selectedItem,
  setSelectedItem,
  unitConversions,
  prices,
  setPrices,
}) {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= PRICE SUBMIT ================= */
  const handlePriceSubmit = async () => {
    if (!price) {
      message.error("Please enter price");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        product: selectedItem.id,
        rate: price,
      };

      await productPriceUpdate(payload);

      message.success("Price updated successfully ✅");
    } catch (error) {
      console.error("❌ Price update failed:", error);
      message.error("Failed to update price");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ITEM SELECT ================= */
  if (!selectedItem) {
    return (
      <Select
        style={{ width: 300 }}
        placeholder="Select item"
        showSearch
        optionFilterProp="label"
        onChange={(id) => setSelectedItem(items.find((i) => i.id === id))}
        options={items.map((i) => ({
          value: i.id,
          label: `${i.name} (${i.vendor_name || "No Vendor"})`,
        }))}
      />
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <Card title={`Pricing for ${selectedItem.name}`}>
      {/* PRICE INPUT + SUBMIT */}
      <Space>
        <InputNumber
          prefix="₹"
          style={{ width: 220 }}
          placeholder="Base Unit Price"
          value={price}
          min={0}
          onChange={(v) => setPrice(v)}
        />

        <Button type="primary" loading={loading} onClick={handlePriceSubmit}>
          Submit
        </Button>
      </Space>

      {/* UNIT TABLE */}
      <Table
        style={{ marginTop: 24 }}
        columns={[
          { title: "Unit", dataIndex: "unit_name" },
          {
            title: "Display",
            render: (_, r) =>
              r.set_as_display ? (
                <Tag color="green">Customer</Tag>
              ) : (
                <Tag>Internal</Tag>
              ),
          },
        ]}
        dataSource={unitConversions}
        rowKey="id"
      />
    </Card>
  );
}
