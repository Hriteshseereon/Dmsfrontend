// appModules.js
// SINGLE SOURCE OF TRUTH FOR ROLES + TABS + ROUTES

export const APP_MODULES = [
  /* =====================================================
     CORE SYSTEM
  ======================================================*/
//   {
//     id: "dashboard",
//     label: "Dashboard",
//     basePath: "/dashboard",
//     actions: ["view"],
//   },

//   {
//     id: "organization",
//     label: "Organization",
//     basePath: "/organizations",
//     actions: ["view", "create", "edit", "delete"],
//   },

  /* =====================================================
     DMS MODULE
  ======================================================*/
  {
    id: "dms",
    label: "DMS",
    basePath: "/dms",
    children: [
      // ---------- PURCHASE ----------
      {
        id: "purchase",
        label: "Purchase",
        basePath: "/dms/purchase",
        children: [
          { id: "dashboard", label: "Dashboard", actions: ["view"] },
          { id: "souda", label: "Souda", actions: ["view", "create", "edit"] },
          { id: "indent", label: "Indent", actions: ["view", "create", "edit"] },
          { id: "invoice", label: "Invoice", actions: ["view", "create", "edit"] },
          { id: "loading", label: "Loading Advice", actions: ["view", "edit"] },
          { id: "status", label: "Delivery Status", actions: ["view"] },
          { id: "return", label: "Return", actions: ["view", "create"] },
        ],
      },

      // ---------- SALES ----------
      {
        id: "sales",
        label: "Sales",
        basePath: "/dms/sales",
        children: [
          { id: "dashboard", label: "Dashboard", actions: ["view"] },
          { id: "souda", label: "Souda", actions: ["view", "create", "edit"] },
          { id: "orders", label: "Orders", actions: ["view", "create", "edit"] },
          { id: "status", label: "Delivery Status", actions: ["view"] },
          { id: "return", label: "Return", actions: ["view", "create"] },
          { id: "dispute", label: "Dispute", actions: ["view", "edit"] },
        ],
      },

      // ---------- MASTER ----------
      {
        id: "master",
        label: "Master",
        basePath: "/dms/master",
        children: [
          { id: "product", label: "Product", actions: ["view","create","edit","delete"] },
          { id: "business_partner", label: "Business Partner", actions: ["view","create","edit"] },
          { id: "inventory", label: "Inventory", actions: ["view","edit"] },
          { id: "hsn_sac", label: "HSN/SAC", actions: ["view","create","edit"] },
          { id: "unit_conversion", label: "Unit Conversion", actions: ["view","edit"] },
          { id: "price", label: "Price Manager", actions: ["view","edit"] },
          { id: "itemsprice", label: "Item Price", actions: ["view","edit"] },
        ],
      },

      // ---------- REPORTS ----------
      {
        id: "reports",
        label: "Reports",
        basePath: "/dms/reports",
        actions: ["view", "export"],
      },

      {
        id: "settings",
        label: "Profile Settings",
        basePath: "/dms/settings",
        actions: ["view", "edit"],
      },
    ],
  },

  /* =====================================================
     WMS (WEALTH MODULE)
  ======================================================*/
  {
    id: "wms",
    label: "Wealth Management",
    basePath: "/wms",
    children: [
      { id: "dashboard", actions: ["view"] },
      { id: "stock", actions: ["view","create","edit"] },
      { id: "etf", actions: ["view","create","edit"] },
      { id: "mutualfunds", actions: ["view","create","edit"] },
      { id: "bank", actions: ["view","create","edit"] },
      { id: "nps", actions: ["view","create","edit"] },
      { id: "ulip", actions: ["view","create","edit"] },
      { id: "privateequity", actions: ["view","create","edit"] },
      { id: "deposits", actions: ["view","create","edit"] },
      { id: "ppf", actions: ["view","edit"] },
      { id: "epf", actions: ["view","edit"] },
      { id: "fd", actions: ["view","create"] },
      { id: "postoffice", actions: ["view","create"] },
      { id: "gold", actions: ["view","create","edit"] },
      { id: "silver", actions: ["view","create","edit"] },
      { id: "platinum", actions: ["view","create","edit"] },
      { id: "property", actions: ["view","create","edit"] },
      { id: "art", actions: ["view","create","edit"] },
    ],
  },

  /* =====================================================
     AMS (ASSET MODULE)
  ======================================================*/
  {
    id: "ams",
    label: "Asset Management",
    basePath: "/ams",
    children: [
      { id: "dashboard", actions: ["view"] },
      { id: "assetcategory", actions: ["view","create","edit","delete"] },
      { id: "assetadd", actions: ["view","create","edit"] },
      { id: "assetallocation", actions: ["view","edit"] },
      { id: "assetmaintenance", actions: ["view","edit"] },
      { id: "assetdepreciation", actions: ["view"] },
      { id: "assetdisposal", actions: ["view","create"] },
    ],
  },
];