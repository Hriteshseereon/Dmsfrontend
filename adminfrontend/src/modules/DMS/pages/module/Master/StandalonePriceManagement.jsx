import React, { useEffect, useState } from "react";
import { Card, message } from "antd";
import { getProducts } from "../../../../../api/product";
import PriceManagementTab from "./ItemUnitPriceManager/PriceManagement/PriceManagementTab";

export default function StandalonePriceManagement() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setItems(data);
    } catch (err) {
      console.error("Failed to load products", err);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-4">
      <style>
        {`
          .amber-tabs .ant-tabs-tab:hover {
            color: #f59e0b !important;
          }

          .amber-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #f59e0b !important;
            font-weight: 600;
          }

          .amber-tabs .ant-card-head {
            background: #fffbeb;
          }

          .amber-tabs .ant-card-head-title {
            color: #92400e;
            font-weight: 600;
          }
        `}
      </style>

     
        <PriceManagementTab
          items={items}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
    
    </div>
  );
}

