import React from 'react'
import "./ReportAnalyticsTabs.css";
import { Tabs } from 'antd'
import {
  BarChartOutlined,
  UnorderedListOutlined,  
  FileTextOutlined,
  ShoppingCartOutlined,
  RollbackOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,  
  TruckOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  
} from '@ant-design/icons'
import ReportsOverview from './tabs/ReportsOverview'
import AllRecords from './tabs/AllRecords'
import Contract from './tabs/Contract.jsx'
import Order from './tabs/Order.jsx'
import Return from './tabs/Return.jsx'
import Invoice from './tabs/Invoice.jsx';  
import DebitNotes from './tabs/DebitNotes';
import CreditNotes from './tabs/CreditNotes';
import ExpiredContract from './tabs/ExpiredContract.jsx'
import ContractRenewal from './tabs/ContractRenewal.jsx'
import ApprovedOrders from './tabs/ApprovedOrders'    
import PendingOrders from './tabs/PendingOrders'
import DeliveredOrder from './tabs/DeliveredOrder';
import PendingContract from './tabs/PendingContract.jsx';


const ReportAnaytics = () => {
  return (
   <div className="p-0">
     <div className="flex items-center justify-between m-0! p-0!">
        <div>
          <h1 className="text-2xl! font-bold! text-amber-800!">Reporting & Analytics</h1>
          <p className="text-sm! text-amber-600! mb-0!">
           Comprehensive insights into your business performance </p>
        </div>
      </div>
 <Tabs
  className="report-tabs"
  defaultActiveKey="reports"
  tabPosition="top"
  items={[
    { 
      key: "reports", 
      label: <span><BarChartOutlined /> Reports</span>, 
      children: <ReportsOverview /> 
    },
    { 
      key: "all", 
      label: <span><UnorderedListOutlined /> All Records</span>, 
      children: <AllRecords /> 
    },
    { 
      key: "sc", 
      label: <span><FileTextOutlined /> Contract</span>, 
      children: <Contract /> 
    },
    { 
      key: "si", 
      label: <span><ShoppingCartOutlined /> Order</span>, 
      children: <Order /> 
    },
    { 
      key: "sr", 
      label: <span><RollbackOutlined /> Return</span>, 
      children: <Return /> 
    },
    { 
      key: "sinv", 
      label: <span><FileDoneOutlined /> Invoice</span>, 
      children: <Invoice /> 
    },
    { 
      key: "esc", 
      label: <span><ClockCircleOutlined /> Expired Contract</span>, 
      children: <ExpiredContract /> 
    },
    { 
      key: "scr", 
      label: <span><ReloadOutlined /> Contract Renewal</span>, 
      children: <ContractRenewal /> 
    },
    { 
      key: "ppc", 
      label: <span><HourglassOutlined /> Pending Contract</span>, 
      children: <PendingContract /> 
    },
    { 
      key: "ao", 
      label: <span><CheckCircleOutlined /> Approved Orders</span>, 
      children: <ApprovedOrders /> 
    },
    { 
      key: "po", 
      label: <span><ExclamationCircleOutlined /> Pending Orders</span>, 
      children: <PendingOrders /> 
    },
    { 
      key: "do", 
      label: <span><TruckOutlined /> Delivered Orders</span>, 
      children: <DeliveredOrder /> 
    },
    { 
      key: "dn", 
      label: <span><MinusCircleOutlined /> Debit Notes</span>, 
      children: <DebitNotes /> 
    },
    { 
      key: "cn", 
      label: <span><PlusCircleOutlined /> Credit Notes</span>, 
      children: <CreditNotes /> 
    },
  ]}
/>



    </div>
  )
}

export default ReportAnaytics
