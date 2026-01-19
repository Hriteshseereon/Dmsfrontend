// Organisation.js
import React from "react";
import {
  ApartmentOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";

const organisationCards = [
  {
    title: "Organisation Master",
    path: "/dms/master/organisation",
    icon: <ApartmentOutlined />,
  },
  {
    title: "Profile & Settings",
    path: "/dms/settings",
    icon: <SettingOutlined />,
  },
  {
    title: "User & Role Master",
    path: "/dms/master/user-role",
    icon: <UserOutlined />,
  },
];

export default function Organisation() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 gap-10 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center">
        {organisationCards.map((card) => (
          <NavLink
            key={card.title}
            to={card.path}
            className="w-full sm:w-64 no-underline"
          >
            <div
              className="relative flex flex-col items-center justify-center text-center p-6
                bg-white rounded-[2rem_0_2rem_0] shadow-lg 
                overflow-hidden cursor-pointer "
            >
              <div className="absolute top-0 left-0 w-10 h-10 bg-amber-500 rounded-br-full"></div>
              <div className="mb-4 text-4xl text-amber-800">
                {React.cloneElement(card.icon)}
              </div>
              <h3 className="text-lg font-semibold text-amber-800">
                {card.title}
              </h3>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
