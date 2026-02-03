import React, { useEffect, useState } from "react";
import { Tabs, Card, message } from "antd";

import ItemMasterTab from "./itemmaster/ItemMasterTab";
import UnitConversionTab from "./UnitConversion/UnitConversionTab";
import PriceManagementTab from "./PriceManagement/PriceManagementTab";

import { getProducts } from "../../../../../../api/product";

export default function ItemUnitPriceManager() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [unitConversions, setUnitConversions] = useState([]);
  const [prices, setPrices] = useState([]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setItems(data);
    } catch {
      message.error("Failed to load products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card bodyStyle={{ background: "#fffaf0" }}>
        <Tabs
          items={[
            {
              key: "1",
              label: "📦 Item Master",
              children: (
                <ItemMasterTab
                  items={items}
                  setItems={setItems}
                  reloadProducts={loadProducts}
                />
              ),
            },
            {
              key: "2",
              label: "🔄 Unit Conversions",
              children: (
                <UnitConversionTab
                  items={items}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  unitConversions={unitConversions}
                  setUnitConversions={setUnitConversions}
                />
              ),
            },
            {
              key: "3",
              label: "💰 Price Management",
              children: (
                <PriceManagementTab
                  items={items}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  unitConversions={unitConversions}
                  prices={prices}
                  setPrices={setPrices}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
