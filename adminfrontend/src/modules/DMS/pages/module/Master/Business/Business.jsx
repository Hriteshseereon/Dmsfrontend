// Business.jsx
import React from "react";
import { Tabs } from "antd";

import CustomerTab from "./tabs/CustomerTab";
import VendorTab from "./tabs/VendorTab";
import TransportTab from "./tabs/TransportTab";
import BrokerTab from "./tabs/BrokerTab";

export default function Business() {
  const items = [
    {
      key: "customer",
      label: "Customer",
      children: <CustomerTab />,
    },
    {
      key: "vendor",
      label: "Supplier",
      children: <VendorTab />,
    },
    {
      key: "transport",
      label: "Transport",
      children: <TransportTab />,
    },
    {
      key: "broker",
      label: "Broker",
      children: <BrokerTab />,
    },
  ];

  return (
    <div>
      <style>{`
        .business-tabs .ant-tabs-tab .ant-tabs-tab-btn {
          color: #d97706 !important; /* amber-600 */
          font-weight: 500;
        }

        .business-tabs .ant-tabs-tab:hover .ant-tabs-tab-btn {
          color: #b45309 !important; /* amber-700 on hover */
        }

        .business-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #b45309 !important; /* amber-700 active */
          font-weight: 600;
        }

        .business-tabs .ant-tabs-ink-bar {
          background-color: #d97706 !important; /* amber-600 underline */
        }
      `}</style>

      <Tabs
        className="business-tabs"
        defaultActiveKey="customer"
        items={items}
      />
    </div>
  );
}
