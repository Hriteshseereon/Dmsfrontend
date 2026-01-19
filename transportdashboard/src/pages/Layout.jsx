import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Fixed Navbar on top spanning full width */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <Navbar />
      </div>

      {/* Sidebar fixed below navbar */}
      <div className="fixed top-[84px] left-0 bottom-0 w-[252px] z-10 overflow-auto">
        <Sidebar />
      </div>

      {/* Main content scrollable */}
      <div className="flex-1 ml-[252px] mt-[84px] p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
