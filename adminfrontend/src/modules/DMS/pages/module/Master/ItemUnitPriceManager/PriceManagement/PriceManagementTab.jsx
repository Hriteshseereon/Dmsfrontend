import React, { useEffect, useMemo, useState } from "react";
import { Table, Input, Select, InputNumber, Button, Tooltip, message } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";

import { useProductPrice } from "@/queries/useProductPrice";

const toNumber = (v) =>
  v === null || v === undefined || v === "" ? null : Number(v);

/* ================= PRICE EDITOR (one per row) ================= */
/**
 * Price input + Update button for a single product row.
 * Uses the same per-product price API / hook as before — only the layout changed.
 * React-query caches each product's price, so rows don't refetch needlessly.
 */
function PriceRowEditor({ item }) {
  const { priceData, isLoading, updatePrice, isUpdating } = useProductPrice(
    item.id,
  );

  const [price, setPrice] = useState(null);

  /* ================= SYNC PRICE ================= */
  useEffect(() => {
    if (!priceData) return;
    setPrice(toNumber(priceData.rate));
  }, [priceData]);

  const savedPrice = toNumber(priceData?.rate);
  const isDirty = price !== savedPrice;
  const unitPrices = priceData?.uom_prices || [];

  /* ================= UPDATE PRICE ================= */
  const handlePriceSubmit = () => {
    if (!price) {
      message.error("Please enter price");
      return;
    }

    updatePrice(
      {
        product: item.id,
        rate: price,
      },
      {
        onSuccess: () => {
          message.success(`Price updated for ${item.name} ✅`);
        },
        onError: () => {
          message.error(`Failed to update price for ${item.name}`);
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-2">
      <InputNumber
        prefix="₹"
        style={{ width: 150 }}
        placeholder="Base Unit Price"
        value={price}
        min={0}
        disabled={isLoading}
        onChange={setPrice}
        onPressEnter={() => isDirty && handlePriceSubmit()}
      />

      <Button
        className="amber-primary-btn"
        type="primary"
        size="small"
        loading={isUpdating}
        disabled={!isDirty}
        onClick={handlePriceSubmit}
      >
        Update
      </Button>

      {unitPrices.length > 0 && (
        <Tooltip
          title={
            <div>
              {unitPrices.map((u, i) => (
                <div key={`${u.unit_name}-${i}`}>
                  {u.unit_name}
                  {u.uom_id === null ? " (Base)" : ""}: ₹ {Number(u.price)}
                </div>
              ))}
            </div>
          }
        >
          <InfoCircleOutlined className="text-amber-600 cursor-pointer" />
        </Tooltip>
      )}
    </div>
  );
}

export default function PriceManagementTab({ items, loading = false }) {
  const [search, setSearch] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

  /* ================= GROUP COLLAPSE (same as Item Master) ================= */
  const toggleGroupCollapse = (groupName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedGroups({});
  };

  const uniqueGroupNames = useMemo(() => {
    const set = new Set();
    (items || []).forEach((item) => {
      if (item.product_group_name) {
        set.add(item.product_group_name);
      }
    });
    return Array.from(set).sort();
  }, [items]);

  const handleCollapseAll = () => {
    const allCollapsed = {};
    uniqueGroupNames.forEach((name) => {
      allCollapsed[name] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  /* ================= GROUPING & FILTERING ================= */
  const filteredData = useMemo(() => {
    let result = items || [];

    if (selectedGroupFilter) {
      result = result.filter(
        (it) => it.product_group_name === selectedGroupFilter,
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) => {
          if (!val) return false;
          return JSON.stringify(val).toLowerCase().includes(q);
        }),
      );
    }

    return result;
  }, [items, selectedGroupFilter, search]);

  const tableData = useMemo(() => {
    const groupsMap = {};
    (filteredData || []).forEach((item) => {
      const groupName = item.product_group_name || "OTHER PRODUCTS";
      if (!groupsMap[groupName]) {
        groupsMap[groupName] = [];
      }
      groupsMap[groupName].push(item);
    });

    const rows = [];
    let slCounter = 1;

    Object.keys(groupsMap)
      .sort()
      .forEach((groupName) => {
        const groupItems = groupsMap[groupName];
        const isCollapsed = Boolean(collapsedGroups[groupName]);

        // Group Header Row
        rows.push({
          isGroupHeader: true,
          id: `group-header-${groupName}`,
          groupName,
          itemCount: groupItems.length,
        });

        // Items in this group
        if (!isCollapsed) {
          groupItems.forEach((item) => {
            rows.push({
              ...item,
              isGroupHeader: false,
              slNo: slCounter++,
            });
          });
        }
      });

    return rows;
  }, [filteredData, collapsedGroups]);

  /* ================= TABLE COLUMNS ================= */
  const COLUMN_COUNT = 8; // group-header row spans all columns
  const hideOnGroupHeader = (record) =>
    record.isGroupHeader ? { colSpan: 0 } : {};
  const headerTitle = (text) => (
    <span className="font-semibold text-amber-800">{text}</span>
  );

  const columns = [
    {
      title: headerTitle("SL No."),
      dataIndex: "slNo",
      width: 75,
      align: "center",
      onCell: (record) => {
        if (record.isGroupHeader) {
          return {
            colSpan: COLUMN_COUNT,
            className: "!p-0 cursor-pointer select-none",
            onClick: () => toggleGroupCollapse(record.groupName),
          };
        }
        return { className: "text-center" };
      },
      render: (val, record) => {
        if (record.isGroupHeader) {
          const isCollapsed = collapsedGroups[record.groupName];
          return (
            <div className="bg-[#fff3d4] hover:bg-[#ffecc0] transition-colors py-2 px-3 flex items-center justify-between border-y-2 border-amber-300">
              <div className="flex items-center gap-2.5">
                <span className="text-amber-800 text-xs font-bold transition-transform inline-block">
                  {isCollapsed ? "▶" : "▼"}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                <span className="text-xs uppercase text-amber-700 font-bold tracking-wider">
                  Product Group:
                </span>
                <span className="uppercase text-amber-950 font-black text-sm tracking-wide">
                  {record.groupName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {record.itemCount} {record.itemCount === 1 ? "Item" : "Items"}
                </span>
                <span className="text-[11px] text-amber-700 italic">
                  {isCollapsed ? "(Click to expand)" : "(Click to collapse)"}
                </span>
              </div>
            </div>
          );
        }
        return <span className="font-semibold text-amber-800">{val}</span>;
      },
    },
    {
      title: headerTitle("Item Name"),
      dataIndex: "name",
      onCell: hideOnGroupHeader,
      render: (t) => <span className="font-medium text-amber-950">{t}</span>,
    },
    {
      title: headerTitle("Type"),
      dataIndex: "product_type",
      onCell: hideOnGroupHeader,
    },
    {
      title: headerTitle("Company"),
      dataIndex: "company_group_name",
      onCell: hideOnGroupHeader,
    },
    {
      title: headerTitle("Base Unit"),
      dataIndex: "base_unit",
      onCell: hideOnGroupHeader,
    },
    {
      title: headerTitle("Lower Unit"),
      dataIndex: "lower_unit",
      onCell: hideOnGroupHeader,
    },
    {
      title: headerTitle("Upper Unit"),
      dataIndex: "upper_unit",
      onCell: hideOnGroupHeader,
    },
    {
      title: headerTitle("Price"),
      width: 300,
      onCell: hideOnGroupHeader,
      render: (_, record) =>
        record.isGroupHeader ? null : <PriceRowEditor item={record} />,
    },
  ];

  return (
    <>
      <style>
        {`
/* header */
.amber-table .ant-table-thead > tr > th {
  background: #fffbeb;
  color: #92400e;
  font-weight: 600;
}

/* body cells */
.amber-table .ant-table-tbody > tr > td {
  border-bottom: 1px solid #fde68a;
  color: #78350f;
}

/* row hover */
.amber-table .ant-table-tbody > tr:hover > td {
  background: #fffbeb;
}

/* ===== UPDATE BUTTON ===== */
.amber-primary-btn:not(:disabled) {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
}

.amber-primary-btn:not(:disabled):hover {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
}

/* ===== PRICE INPUT FOCUS ===== */
.amber-table .ant-input-number-focused {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.2) !important;
}
`}
      </style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {/* SEARCH & PRODUCT GROUP FILTER */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Input
            prefix={<SearchOutlined className="text-amber-500" />}
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 220 }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          />

          <Select
            placeholder="All Product Groups"
            value={selectedGroupFilter || undefined}
            onChange={(val) => setSelectedGroupFilter(val || "")}
            allowClear
            style={{ width: 220 }}
            className="border-amber-400! text-amber-700!"
            options={[
              { value: "", label: "All Product Groups" },
              ...uniqueGroupNames.map((g) => ({ value: g, label: g })),
            ]}
          />

          <Button
            onClick={() => {
              setSearch("");
              setSelectedGroupFilter("");
            }}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Reset
          </Button>

          <Button
            onClick={handleExpandAll}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Expand All
          </Button>

          <Button
            onClick={handleCollapseAll}
            className="border-amber-400! text-amber-700! hover:bg-amber-100!"
          >
            Collapse All
          </Button>
        </div>
      </div>

      <Table
        className="amber-table"
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={false}
        scroll={{ x: 1000 }}
        style={{ marginTop: 16 }}
      />
    </>
  );
}
