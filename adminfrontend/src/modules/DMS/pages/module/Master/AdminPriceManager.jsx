import React, { useState, useEffect } from "react";
import { Card, Table, InputNumber, Empty } from "antd";

/**
 * Props:
 * item = {
 *   itemName,
 *   baseUnit,
 *   mrp (optional)
 * }
 * unitConversions = [{ unitName, multiplier }]
 */
export default function AdminPriceManager({ item, unitConversions = [] }) {
  // 🛑 Guard: item not yet selected
  if (!item) {
    return (
      <Card title="Price Manager">
        <Empty description="Select an item to manage prices" />
      </Card>
    );
  }

  const [basePrice, setBasePrice] = useState(item.mrp ?? 0);

  // 🔄 Sync if item changes
  useEffect(() => {
    setBasePrice(item.mrp ?? 0);
  }, [item]);

  return (
    <Card title={`Price Manager – ${item.itemName}`} style={{ marginTop: 24 }}>
      {/* Base price input */}
      <div style={{ marginBottom: 16 }}>
        <strong>
          Base Price ({item.baseUnit})
        </strong>
        <InputNumber
          min={0}
          value={basePrice}
          onChange={(v) => setBasePrice(v ?? 0)}
          style={{ width: 200, marginLeft: 12 }}
        />
      </div>

      {/* Unit-wise prices */}
      <Table
        rowKey="unitName"
        pagination={false}
        dataSource={unitConversions}
        columns={[
          { title: "Unit", dataIndex: "unitName" },
          { title: "Multiplier", dataIndex: "multiplier" },
          {
            title: "Calculated Price",
            render: (_, r) =>
              `₹ ${(basePrice * r.multiplier).toFixed(2)}`,
          },
        ]}
      />
    </Card>
  );
}
