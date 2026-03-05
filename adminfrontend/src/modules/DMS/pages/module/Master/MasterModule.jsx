// MasterModule.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import MasterTab from "./MasterTab";

// actual components for each tab

import Product from "./Product";
import Business from "./Business/Business.jsx";
import ProductGroupMaster from "./ProductGroupMaster";
import InventoryForm from "./InventoryForm";
import HsnSacManager from "./HsnSacManager";
import UnitConversionManager from "./UnitConversionManager";
import AdminPriceManager from "./AdminPriceManager";
import ItemUnitPriceManager from "./ItemUnitPriceManager/index.jsx";
const MasterModule = ({ allowedTabs }) => {
  return (
    <Routes>
      {/* parent renders tabs and an Outlet */}
      <Route element={<MasterTab allowedTabs={allowedTabs} />}>
        {/* index -> default tab (organisation) */}
        <Route index element={<Product />} />

        <Route path="product" element={<Product />} />
        <Route path="unit-conversion" element={<UnitConversionManager />} />
        <Route path="price" element={<AdminPriceManager />} />
        <Route path="business-partner" element={<Business />} />
        <Route path="reason" element={<ProductGroupMaster />} />
        <Route path="inventory" element={<InventoryForm />} />
        <Route path="hsn_sac" element={<HsnSacManager />} />
        <Route path="itemsprice" element={<ItemUnitPriceManager />} />

        {/* add more nested routes if you extend tabs */}
      </Route>
    </Routes>
  );
};

export default MasterModule;
