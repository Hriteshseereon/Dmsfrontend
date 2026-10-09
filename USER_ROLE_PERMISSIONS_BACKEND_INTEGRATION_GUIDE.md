# User & Role Master (Permissions Management) - Backend API & Integration Guide

This guide details all API endpoints, database schema recommendations, request/response JSON payloads, middleware authorization logic, and business validation rules for the **User & Role Master & Granular Permissions System**.

---

## 1. Architecture & Business Requirements Overview

1. **User Credentials & Contact Details**:
   - User Name / Full Name (`userName`)
   - Email Address (`email`) — Unique identifier for login
   - Password (`password`) — Securely hashed (bcrypt / Argon2 / PBKDF2)
   - Phone Number (`phone`) — 10-digit numeric mobile
   - Address / Location (`address`) — Branch / Plant location
2. **Privilege Access Types**:
   - **`Permanent`**: User has unlimited validity without any expiry date.
   - **`Temporary`**: User has a bounded validity period (`start_date` to `end_date`). Once expired, access is blocked or restricted.
3. **Granular Action Permissions (CRUD Matrix)**:
   - Every system screen supports 4 discrete permissions:
     - `view` (Read / List access)
     - `add` (Create / Submit new entry)
     - `edit` (Update / Modify existing record)
     - `delete` (Delete / Void record)
4. **Role Template Presets**:
   - `admin` (Full superuser access across all modules)
   - `purchase_manager` (Complete Purchase module + Vendor/Stock masters + Reports)
   - `sales_manager` (Complete Sales module + Customer masters + Ledgers)
   - `accountant` (Accounts & Finance + Invoices + Ledgers & Registers)
   - `auditor` (Read-only `view` access across all modules)
   - `custom` (Custom user-defined checkboxes)

---

## 2. Recommended Database Schema Design

### 2.1 User Master Table (`users` / `custom_user`)
| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `BigInt` | Primary Key | Unique user identifier |
| `organisation_id` | `UUID` | Foreign Key (Nullable) | Associated organization/tenant |
| `username` | `VARCHAR(150)` | Not Null | User full name or display name |
| `email` | `VARCHAR(255)` | Unique, Not Null | Login email address |
| `password` | `VARCHAR(255)` | Not Null | Hashed password |
| `phone` | `VARCHAR(15)` | Nullable | 10-digit phone number |
| `address` | `TEXT` | Nullable | Physical/branch address |
| `privilege_type` | `VARCHAR(20)` | Default `'Permanent'` | `'Permanent'` or `'Temporary'` |
| `role_preset` | `VARCHAR(50)` | Default `'custom'` | Preset role template key |
| `start_date` | `DATE` | Nullable | Valid from date (Required if Temporary) |
| `end_date` | `DATE` | Nullable | Valid to date (Required if Temporary) |
| `is_active` | `BOOLEAN` | Default `True` | Account active status |
| `created_at` | `TIMESTAMP` | Auto Now Add | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | Auto Now | Last modified timestamp |

### 2.2 User Permissions Table (`user_permissions`)
Option A: **JSON Column (Recommended for flexible performance)**
- Store in a `JSONB` column on the user record: `permissions JSONB NOT NULL DEFAULT '{}'::jsonb`.

Option B: **Relational Mapping Table**
| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `BigInt` | Primary Key | |
| `user_id` | `UUID` / `BigInt` | Foreign Key (`users.id`) | Cascading delete |
| `module_key` | `VARCHAR(50)` | Not Null | e.g. `'purchase'`, `'sales'`, `'accounts'` |
| `submodule_key` | `VARCHAR(50)` | Not Null | e.g. `'purchase_contract'`, `'sales_invoice'` |
| `can_view` | `BOOLEAN` | Default `False` | View permission |
| `can_add` | `BOOLEAN` | Default `False` | Add/Create permission |
| `can_edit` | `BOOLEAN` | Default `False` | Edit/Update permission |
| `can_delete` | `BOOLEAN` | Default `False` | Delete permission |

---

## 3. Complete Module & Submodule Hierarchy Reference

```json
[
  {
    "module": "purchase",
    "name": "Purchase Module",
    "submodules": [
      { "key": "purchase_dashboard", "name": "Purchase Dashboard" },
      { "key": "purchase_contract", "name": "Purchase Contract (Souda)" },
      { "key": "purchase_indent", "name": "Purchase Order (Indent)" },
      { "key": "vehicle_placement", "name": "Vehicle Placement" },
      { "key": "transport_freight", "name": "Transport Freight Details" },
      { "key": "purchase_invoice", "name": "Purchase Invoice Entry" },
      { "key": "purchase_intransit", "name": "Purchase In-Transit (Return)" },
      { "key": "stock_status", "name": "Stock Status & Summary Report" }
    ]
  },
  {
    "module": "sales",
    "name": "Sales Module",
    "submodules": [
      { "key": "sales_dashboard", "name": "Sales Dashboard" },
      { "key": "sales_contract", "name": "Sale Contracts (Souda)" },
      { "key": "sales_orders", "name": "Sale Orders" },
      { "key": "sales_invoice", "name": "Sale Invoice (Credit / Cash)" },
      { "key": "sales_loading", "name": "Transport / Loading Details" },
      { "key": "delivery_status", "name": "Delivery Status" },
      { "key": "sales_dispute", "name": "Sales Dispute" },
      { "key": "customer_wallet", "name": "Customer Wallet" }
    ]
  },
  {
    "module": "accounts",
    "name": "Accounting & Finance",
    "submodules": [
      { "key": "cash_bank_book", "name": "Cash / Bank Book" },
      { "key": "day_book", "name": "Day Book" },
      { "key": "sales_register", "name": "Sales Register" },
      { "key": "purchase_register", "name": "Purchase Register" },
      { "key": "customer_ledger", "name": "Customer Ledger" },
      { "key": "broker_commission", "name": "Broker Commission" },
      { "key": "balance_sheet", "name": "Balance Sheet & P&L" },
      { "key": "receipts_payments", "name": "Receipts & Payments" },
      { "key": "gst_summary", "name": "GST Summary" },
      { "key": "receivables_ageing", "name": "Receivables Ageing" },
      { "key": "stock_movement", "name": "Stock Movement / Summary" }
    ]
  },
  {
    "module": "master",
    "name": "Master Data Management",
    "submodules": [
      { "key": "product_master", "name": "Product Master" },
      { "key": "product_group_master", "name": "Product Group Master" },
      { "key": "customer_master", "name": "Customer Master" },
      { "key": "vendor_master", "name": "Vendor / Supplier Master" },
      { "key": "transport_master", "name": "Transport & Vehicle Master" },
      { "key": "broker_master", "name": "Broker Master" },
      { "key": "inventory_master", "name": "Master Inventory" },
      { "key": "business_master", "name": "Business Partner Master" },
      { "key": "organisation_master", "name": "Organisation & Branch Master" },
      { "key": "user_role_master", "name": "User & Role Master" }
    ]
  },
  {
    "module": "reports",
    "name": "Reports & Analytics",
    "submodules": [
      { "key": "reports_overview", "name": "Reports Overview" },
      { "key": "sales_reports", "name": "Sales Reports" },
      { "key": "purchase_reports", "name": "Purchase Reports" },
      { "key": "inventory_reports", "name": "Inventory Reports" }
    ]
  },
  {
    "module": "ams",
    "name": "Asset Management (AMS)",
    "submodules": [
      { "key": "asset_dashboard", "name": "Asset Dashboard" },
      { "key": "asset_master", "name": "Asset Master" },
      { "key": "asset_register", "name": "Asset Register" }
    ]
  },
  {
    "module": "wms",
    "name": "Wealth Management (WMS)",
    "submodules": [
      { "key": "wealth_dashboard", "name": "Wealth Dashboard" },
      { "key": "wealth_master", "name": "Wealth Master" },
      { "key": "wealth_portfolio", "name": "Wealth Portfolio" }
    ]
  }
]
```

---

## 4. REST API Endpoints Specification

| Action | HTTP Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **List Users** | `GET` | `/users/` | List all users with filtering, search & pagination |
| **Get User Details** | `GET` | `/users/{id}/` | Get user profile and complete permissions JSON |
| **Create User** | `POST` | `/users/` | Create new user with credentials & permissions |
| **Update User** | `PUT` / `PATCH` | `/users/{id}/` | Update user details & permission assignments |
| **Delete User** | `DELETE` | `/users/{id}/` | Delete user record |
| **Current User Perms**| `GET` | `/users/me/permissions/` | Returns permissions of currently logged-in user |

---

## 5. API Request & Response Payload Examples

### 5.1 Create User Request (`POST /users/`)

#### Example 1: Permanent User (Full Admin Access)
```json
{
  "organisation": "1306c8f4-e0ee-4fdb-8115-a2ea82ecc70e",
  "userName": "Ramesh Kumar",
  "email": "ramesh@aumagro.com",
  "password": "StrongPassword@123",
  "phone": "9876543210",
  "address": "Indore Headquarters",
  "privilegeType": "Permanent",
  "rolePreset": "admin",
  "startDate": null,
  "endDate": null,
  "permissions": {
    "purchase_dashboard": { "view": true, "add": true, "edit": true, "delete": true },
    "purchase_contract": { "view": true, "add": true, "edit": true, "delete": true },
    "purchase_indent": { "view": true, "add": true, "edit": true, "delete": true },
    "vehicle_placement": { "view": true, "add": true, "edit": true, "delete": true },
    "transport_freight": { "view": true, "add": true, "edit": true, "delete": true },
    "purchase_invoice": { "view": true, "add": true, "edit": true, "delete": true },
    "purchase_intransit": { "view": true, "add": true, "edit": true, "delete": true },
    "stock_status": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_dashboard": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_contract": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_orders": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_invoice": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_loading": { "view": true, "add": true, "edit": true, "delete": true },
    "delivery_status": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_dispute": { "view": true, "add": true, "edit": true, "delete": true },
    "customer_wallet": { "view": true, "add": true, "edit": true, "delete": true },
    "cash_bank_book": { "view": true, "add": true, "edit": true, "delete": true },
    "day_book": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_register": { "view": true, "add": true, "edit": true, "delete": true },
    "purchase_register": { "view": true, "add": true, "edit": true, "delete": true },
    "customer_ledger": { "view": true, "add": true, "edit": true, "delete": true },
    "broker_commission": { "view": true, "add": true, "edit": true, "delete": true },
    "balance_sheet": { "view": true, "add": true, "edit": true, "delete": true },
    "receipts_payments": { "view": true, "add": true, "edit": true, "delete": true },
    "gst_summary": { "view": true, "add": true, "edit": true, "delete": true },
    "receivables_ageing": { "view": true, "add": true, "edit": true, "delete": true },
    "stock_movement": { "view": true, "add": true, "edit": true, "delete": true },
    "product_master": { "view": true, "add": true, "edit": true, "delete": true },
    "product_group_master": { "view": true, "add": true, "edit": true, "delete": true },
    "customer_master": { "view": true, "add": true, "edit": true, "delete": true },
    "vendor_master": { "view": true, "add": true, "edit": true, "delete": true },
    "transport_master": { "view": true, "add": true, "edit": true, "delete": true },
    "broker_master": { "view": true, "add": true, "edit": true, "delete": true },
    "inventory_master": { "view": true, "add": true, "edit": true, "delete": true },
    "business_master": { "view": true, "add": true, "edit": true, "delete": true },
    "organisation_master": { "view": true, "add": true, "edit": true, "delete": true },
    "user_role_master": { "view": true, "add": true, "edit": true, "delete": true },
    "reports_overview": { "view": true, "add": true, "edit": true, "delete": true },
    "sales_reports": { "view": true, "add": true, "edit": true, "delete": true },
    "purchase_reports": { "view": true, "add": true, "edit": true, "delete": true },
    "inventory_reports": { "view": true, "add": true, "edit": true, "delete": true },
    "asset_dashboard": { "view": true, "add": true, "edit": true, "delete": true },
    "asset_master": { "view": true, "add": true, "edit": true, "delete": true },
    "asset_register": { "view": true, "add": true, "edit": true, "delete": true },
    "wealth_dashboard": { "view": true, "add": true, "edit": true, "delete": true },
    "wealth_master": { "view": true, "add": true, "edit": true, "delete": true },
    "wealth_portfolio": { "view": true, "add": true, "edit": true, "delete": true }
  }
}
```

#### Example 2: Temporary User (Sales Role with Date Expiry)
```json
{
  "organisation": "1306c8f4-e0ee-4fdb-8115-a2ea82ecc70e",
  "userName": "Priya Sharma",
  "email": "priya.sales@aumagro.com",
  "password": "TempPassword@123",
  "phone": "9811223344",
  "address": "Pune Branch",
  "privilegeType": "Temporary",
  "rolePreset": "sales_manager",
  "startDate": "2026-10-01",
  "endDate": "2026-12-31",
  "permissions": {
    "sales_dashboard": { "view": true, "add": true, "edit": true, "delete": false },
    "sales_contract": { "view": true, "add": true, "edit": true, "delete": false },
    "sales_orders": { "view": true, "add": true, "edit": true, "delete": false },
    "sales_invoice": { "view": true, "add": true, "edit": true, "delete": false },
    "customer_master": { "view": true, "add": true, "edit": false, "delete": false },
    "customer_ledger": { "view": true, "add": false, "edit": false, "delete": false },
    "sales_reports": { "view": true, "add": false, "edit": false, "delete": false }
  }
}
```

---

### 5.2 Create / Update User Response (`201 Created` / `200 OK`)
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "e7b1bc01-9a74-4b5f-9e66-41f237ebcf88",
    "userName": "Ramesh Kumar",
    "email": "ramesh@aumagro.com",
    "phone": "9876543210",
    "address": "Indore Headquarters",
    "privilegeType": "Permanent",
    "rolePreset": "admin",
    "startDate": null,
    "endDate": null,
    "isActive": true,
    "permissionsSummary": {
      "totalActions": 188,
      "view": 47,
      "add": 47,
      "edit": 47,
      "delete": 47
    },
    "createdAt": "2026-10-05T18:30:00Z"
  }
}
```

---

### 5.3 List Users Response (`GET /users/?organisation=<org_id>&search=ramesh&privilege=Permanent`)
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "e7b1bc01-9a74-4b5f-9e66-41f237ebcf88",
      "userName": "Ramesh Kumar",
      "email": "ramesh@aumagro.com",
      "phone": "9876543210",
      "address": "Indore Headquarters",
      "privilegeType": "Permanent",
      "rolePreset": "admin",
      "startDate": null,
      "endDate": null,
      "isActive": true,
      "permissions": {
        "purchase_dashboard": { "view": true, "add": true, "edit": true, "delete": true },
        "sales_dashboard": { "view": true, "add": true, "edit": true, "delete": true }
      },
      "permissionsCount": {
        "total": 188,
        "view": 47,
        "add": 47,
        "edit": 47,
        "delete": 47
      },
      "createdAt": "2026-10-05"
    }
  ]
}
```

---

## 6. Backend Validation & Authorization Rules

1. **Email Uniqueness**:
   - `email` must be unique per organization/tenant.
2. **Temporary Privilege Validation**:
   - If `privilegeType === 'Temporary'`:
     - Both `startDate` and `endDate` must be provided.
     - `startDate` must be $\le$ `endDate`.
3. **Password Security**:
   - On `POST` (create), `password` is required and must be minimum 6-8 characters.
   - On `PUT`/`PATCH` (update), if `password` is omitted or blank, preserve existing hashed password without re-hashing empty strings.
4. **Temporary Expiry Middleware Check**:
   - When a user makes an API request:
     ```python
     import datetime

     def is_user_privilege_valid(user):
         if not user.is_active:
             return False
         if user.privilege_type == "Permanent":
             return True
         if user.privilege_type == "Temporary":
             today = datetime.date.today()
             if user.start_date and user.end_date:
                 return user.start_date <= today <= user.end_date
             return False
         return False
     ```
5. **Granular Action Permission Check**:
   - Helper method on User model:
     ```python
     def has_module_permission(self, submodule_key, action):
         """
         action in ['view', 'add', 'edit', 'delete']
         """
         if self.is_superuser or self.role_preset == 'admin':
             return True
         if not self.is_user_privilege_valid():
             return False
         
         submodule_perms = self.permissions.get(submodule_key, {})
         return submodule_perms.get(action, False)
     ```
