// MasterTables.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import {
  DatabaseOutlined,
  ApartmentOutlined,
  UserOutlined,
  BranchesOutlined,
  TagOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import Organisation from "./Organisation"; 
import Branch from "./Branch";
import Depto from "./Depot";
// import Product from "./Product";
// import Business from "./Business";
import Location from "./Location";
import Series from "./Series";

import UseRole  from "./UserRole";
// import ProductGroupMaster from "./ProductGroupMaster";

export default function MasterTables() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  const componentsMap = {
    organisation: { component: <Organisation />, title: "Organisation Master", icon: <ApartmentOutlined className="text-amber-700 mr-2" /> },
    branch: { component: <Branch />, title: "Branch Master", icon: <BranchesOutlined className="text-amber-700 mr-2" /> },
    depto: { component: <Depto />, title: "Depto Master", icon: <DatabaseOutlined className="text-amber-700 mr-2" /> },
    location: { component: <Location />, title: "Location Master", icon: <EnvironmentOutlined className="text-amber-700 mr-2" /> },
    series: { component: <Series />, title: "Series Master", icon: <OrderedListOutlined className="text-amber-700 mr-2" /> },
    "user-role": { component: <UseRole />, title: "User & Role Master", icon: <UserOutlined className="text-amber-700 mr-2" /> },
  };

  const { component, title, icon } = componentsMap[currentPath] || componentsMap["organisation"];

  return (
    <div className="p-0 mt-4 h-[625px] w-full overflow-auto rounded">
      <h1 className="text-2xl font-bold text-amber-700 mb-0">Master Tables</h1>
      <p className="text-amber-500 mb-4">
        Manage all master data for your business operations
      </p>
      <h1 className="flex items-center text-xl font-semibold text-amber-700 border border-amber-300 p-2 bg-amber-100 rounded-md">
        {icon} {title}
      </h1>
      <div className="overflow-auto mt-4">
        {component}
      </div>
    </div>
  );
}
