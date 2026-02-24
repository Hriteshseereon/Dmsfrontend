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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ✅ Scoped Amber Tabs Styling */}
      <style>
        {`
          .amber-tabs .ant-tabs-tab:hover {
            color: #f59e0b !important;
          }

          .amber-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #f59e0b !important;
            font-weight: 600;
          }

          .amber-tabs .ant-tabs-ink-bar {
            background-color: #f59e0b !important;
            height: 3px;
          }
        `}
      </style>

      <Card className="bg-amber-50">
        <Tabs
          className="amber-tabs"
          items={[
            {
              key: "1",
              label: "Item Master",
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
              label: "Unit Conversions",
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
              label: "Price Management",
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
