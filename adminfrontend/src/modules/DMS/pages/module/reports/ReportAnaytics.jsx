import React from 'react'
import "./ReportAnalyticsTabs.css";
import {
  FaChartBar,          // Reports
  FaListAlt,           // All Records
  FaFileContract,      // Purchase / Sale Contract
  FaShoppingCart,      // Purchase / Sale Order
  FaUndoAlt,           // Purchase / Sale Return
  FaFileInvoice,       // Invoice
  FaTruckLoading,      // Loading Advice
  FaClock,             // Expired Contract
  FaSyncAlt,           // Contract Renewal
  FaCheckCircle,       // Approved Orders
  FaHourglassHalf,     // Pending Orders / Contracts
  FaTruck,             // Delivered Orders
  FaFileInvoiceDollar, // Debit Notes
  FaReceipt            // Credit Notes
} from "react-icons/fa";

import { Tabs } from 'antd'
import ReportsOverview from './tabs/ReportsOverview'
import AllRecords from './tabs/AllRecords'
import PurchaseContract from './tabs/PurchaseContract'
import PurchaseOrder from './tabs/PurchaseOrder'
import PurchaseReturn from './tabs/PurchaseReturn'
import PurchaseInvoice from './tabs/PurchaseInvoice'
import SaleContract from './tabs/SaleContract'
import SaleOrder from './tabs/SaleOrder.jsx'
import SaleReturn from './tabs/SaleReturn'
import SaleInvoice from './tabs/SaleInvoice';  
import DebitNotes from './tabs/DebitNotes';
import CreditNotes from './tabs/CreditNotes';
import LoadingAdvice from './tabs/LoadingAdvice'
import PurchaseExpiredContract from './tabs/PurchaseExpiredContract'
import SaleExpiredContract from './tabs/SaleExpiredContract'
import PurchaseContractRenewal from './tabs/PurchaseContractRenewal'
import SaleContractRenewal from './tabs/SaleContractRenewal'
import ApprovedOrders from './tabs/ApprovedOrders'    
import PendingOrders from './tabs/PendingOrders'
import DeliveredOrder from './tabs/DeliveredOrder';
import PendingPurchaseContract from './tabs/PendingPurchaseContract';
import PendingSaleContract from './tabs/PendingSaleContract';


const ReportAnaytics = () => {
  return (
   <div className="p-6">
      <h1 className="text-2xl font-bold text-amber-800 mb-2 ">
        Reporting & Analytics
      </h1>

      <Tabs
        className="report-tabs"
  defaultActiveKey="reports"
        items={[{
  key: "reports",
  label: (
    <span className="flex items-center gap-2">
      <FaChartBar /> Reports Overview
    </span>
  ),
  children: <ReportsOverview />
}
,
            { key: "all", label: (<span className="flex items-center gap-2"><FaListAlt /> All Records</span>), children: <AllRecords />,  },
            { key: "pc", label: (<span className="flex items-center gap-2"><FaFileContract /> Purchase Contract</span>), children: <PurchaseContract />,  },
            { key: "pi", label: (<span className="flex items-center gap-2"><FaShoppingCart /> Purchase Order</span>), children: <PurchaseOrder />,  },
            { key: "pr", label: (<span className="flex items-center gap-2"><FaUndoAlt /> Purchase Return</span>), children: <PurchaseReturn />,  },
            { key: "pinv", label: (<span className="flex items-center gap-2"><FaFileInvoice /> Purchase Invoice</span>), children: <PurchaseInvoice />, },
            { key: "sc", label: (<span className="flex items-center gap-2"><FaFileContract /> Sale Contract</span>), children: <SaleContract />, },
            { key: "si", label: (<span className="flex items-center gap-2"><FaShoppingCart /> Sale Order</span>), children: <SaleOrder />, },
            { key: "sr", label: (<span className="flex items-center gap-2"><FaUndoAlt /> Sale Return</span>), children: <SaleReturn />, },
            { key: "sinv", label: (<span className="flex items-center gap-2"><FaFileInvoice /> Sale Invoice</span>), children: <SaleInvoice />, },
            { key: "la", label: (<span className="flex items-center gap-2"><FaTruck /> Loading Advice</span>), children: <LoadingAdvice />, },
            { key: "ec", label: (<span className="flex items-center gap-2"><FaFileContract /> Purchase Expired Contract</span>), children: <PurchaseExpiredContract />, },
            { key: "esc", label: (<span className="flex items-center gap-2"><FaFileContract /> Sale Expired Contract</span>), children: <SaleExpiredContract />, },
            { key: "dn", label: (<span className="flex items-center gap-2"><FaFileInvoice /> Debit Notes</span>), children: <DebitNotes/>, },
            { key: "cn", label: (<span className="flex items-center gap-2"><FaFileInvoice /> Credit Notes</span>), children: <CreditNotes />, },
      
            // { key: "cr", label: (<span className="flex items-center gap-2"><FaFileContract /> Purchase Contract Renewal</span>), children: <PurchaseContractRenewal />, },
            // { key: "scr", label: (<span className="flex items-center gap-2"><FaFileContract /> Sale Contract Renewal</span>), children: <SaleContractRenewal />, },
            // { key: "ao", label: (<span className="flex items-center gap-2"><FaShoppingCart /> Approved Orders</span>), children: <ApprovedOrders />, },
            // { key: "po", label: (<span className="flex items-center gap-2"><FaShoppingCart /> Pending Orders</span>), children: <PendingOrders />, },
            // { key: "do", label: (<span className="flex items-center gap-2"><FaShoppingCart /> Delivered Orders</span>), children: <DeliveredOrder />, },
            // { key: "ppc", label: (<span className="flex items-center gap-2"><FaFileContract /> Pending Purchase Contract</span>), children: <PendingPurchaseContract />, },
            // { key: "psc", label: (<span className="flex items-center gap-2"><FaFileContract /> Pending Sale Contract</span>), children: <PendingSaleContract />, },
             ]}
        />

    </div>
  )
}

export default ReportAnaytics
