import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  console.log("Layout:", collapsed);
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
