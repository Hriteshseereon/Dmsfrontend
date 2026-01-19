import { Routes, Route } from "react-router-dom";
import AssetCategory from "./AssetCategory";
import AssetDashboard from "./AssetDashboard";
import AssetAdd from "./AssetAdd";
import AssetAllocation from "./AssetAllocation";
import AssetMaintenance from "./AssetMaintenance";
import AssetDepreciation from "./AssetDepreciation";
import AssetDisposal from "./AssetDisposal";

export default function AMS() {
    return (
    <Routes>
      <Route index element={<AssetDashboard />} />
      <Route path="dashboard" element={<AssetDashboard />} />
      <Route path="assetcategory" element={<AssetCategory />} />
      <Route path="assetadd" element={<AssetAdd />} />
      <Route path="assetallocation" element={<AssetAllocation />} />
      <Route path="assetmaintenance" element={<AssetMaintenance />} />
      <Route path="assetdepreciation" element={<AssetDepreciation />} />
      <Route path="assetdisposal" element={<AssetDisposal />} />
    </Routes>
  );
}
