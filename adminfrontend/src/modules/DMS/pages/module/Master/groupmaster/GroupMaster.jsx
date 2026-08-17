// Business.jsx
import React from "react";
import { Tabs } from "antd";
import WhatappGroup from "./WhatappGroup";
import VehicleMaster from "./VehicleMaster";
import VehicleOwnermaster from "./VehicleOwnermaster";
import VehicleDriverMaster from "./VehicleDriverMaster";
import FreightMaster from "./FreightMaster";

export default function GroupMaster() {
  const items = [
    {
      key: "whatsappgroup",
      label: "Whatapp Group",
      children: <WhatappGroup />,
    },
    {
      key: "vehicleowner",
      label: "Vehicle Owner",
      children: <VehicleOwnermaster />,
    },
    {
      key: "vehiclemaster",
      label: "Vehicle Master",
      children: <VehicleMaster />,
    },
    {
      key: "vehicledriver",
      label: "Vehicle Driver",
      children: <VehicleDriverMaster />,
    },
    {
      key: "freightmaster",
      label: "Freight Master",
      children: <FreightMaster />,
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
