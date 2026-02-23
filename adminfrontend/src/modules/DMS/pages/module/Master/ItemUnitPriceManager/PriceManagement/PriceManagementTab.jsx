import React from "react";
import { Card, Select, Table, InputNumber, Tag } from "antd";

export default function PriceManagementTab({
  items,
  selectedItem,
  setSelectedItem,
  unitConversions,
  prices,
  setPrices,
}) {
  if (!selectedItem) {
    return (
      <Select
        style={{ width: 300 }}
        placeholder="Select item"
        onChange={(id) => setSelectedItem(items.find((i) => i.id === id))}
        options={items.map((i) => ({
          value: i.id,
          label: `${i.name} (${i.vendor_name})`,
        }))}
      />
    );
  }

  return (
    <Card title={`Pricing for ${selectedItem.name}`}>
      <InputNumber
        prefix="₹"
        style={{ width: 300 }}
        placeholder="Base Unit Price"
      />

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
