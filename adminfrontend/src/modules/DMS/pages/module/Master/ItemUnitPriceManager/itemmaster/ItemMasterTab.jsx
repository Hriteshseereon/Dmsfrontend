import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Space,
  message,
  Tag,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  SaveOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  getProductGroups,
  getHSNSACCodes,
  getSACCodes,
  getVendors,
  addproduct,
  getProducts, // ✅ FIX 1
  getProductById,
  updateProductById,
  getUnits,
  getProductGroupHSN,
  deleteProductById,
} from "../../../../../../../api/product";
import { getCompanyGroupDropdown } from "../../../../../../../api/bussinesspatnr";
// import {
//   createItemMasterDraft,
//   saveItemMasterDraft,
//   loadItemMasterDraft,
//   deleteItemMasterDraft,
//   deserialiseItemMasterDraft,
//   getAllItemMasterDrafts,
// } from "../../../../../../../utils/itemMasterDraftUtils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Option } = Select;

const ITEM_TYPES = ["CONSUMER", "BULK"];
const ITEM_CATEGORY = ["GOODS", "SERVICE"];
// const BASE_UNITS = ["LTR", "KG", "PCS", "GM", "ML", "BOX", "PACK"];

/* ================= FORM FIELD ================= */
function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontWeight: 500, color: "#92400e" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ItemMasterTab({ items, setItems }) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [groups, setGroups] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [hsnSacCodes, setHsnSacCodes] = useState({
    hsn: [],
    sac: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    gstPercent: 0,
    cgstPercent: 0,
    sgstPercent: 0,
    net_weight: 0,
    net_weight_gram: 0,
    gross_weight: 0,
    gross_weight_gram: 0,
    base_unit: null,
    lower_unit: null,
    upper_unit: null,
    multiplier: null,
    is_active: true,
  });
  const [search, setSearch] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

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

  // Draft state
  // const [activeDraftId, setActiveDraftId] = useState(null);
  // const [draftSavedAt, setDraftSavedAt] = useState(null);
  // const [draftTableKey, setDraftTableKey] = useState(0);
  // const autosaveTimer = useRef(null);
  // const activeDraftIdRef = useRef(null);
  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    Promise.all([
      getProductGroups(),
      // getVendors(),
      getCompanyGroupDropdown(), // ✅ FIX 2
      getHSNSACCodes(),
      getSACCodes(),
      getUnits(),
    ])
      .then(([g, v, hsn, sac, u]) => {
        setGroups(g);
        setVendors(v);
        setHsnSacCodes({
          hsn: hsn,
          sac: sac,
        });
        setUnits(u);
      })
      .catch(() => message.error("Failed to load master data"));
  }, []);
  // get the hsn sac code
  const handleProductGroupChange = async (value) => {
    try {
      setLoading(true);

      // set product group first
      setFormData((prev) => ({
        ...prev,
        product_group: value,
      }));

      // call API
      const res = await getProductGroupHSN(value);

      console.log("HSN Mapping 👉", res);

      setFormData((prev) => ({
        ...prev,
        product_group: value,
        hsn_code: res?.hsn_code || null,
        sac_code: res?.sac_code || null,
      }));
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch tax details");
    } finally {
      setLoading(false);
    }
  };
  /* ================= GST SPLIT ================= */
  const handleGstChange = (value = 0) => {
    const gst = Math.min(100, Math.max(0, value));
    setFormData((p) => ({
      ...p,
      gstPercent: gst,
      cgstPercent: gst / 2,
      sgstPercent: gst / 2,
    }));
  };

  // Initialize GST fields to 0 on component mount
  // ================= DRAFT FUNCTIONALITY =================
  // const handleFormValuesChange = useCallback(() => {
  //   if (editingId || viewMode) return;

  //   if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

  //   autosaveTimer.current = setTimeout(() => {
  //     const meta = {
  //       itemName: formData.itemName,
  //       itemType: formData.itemType,
  //       company: formData.company,
  //     };

  //     if (!activeDraftIdRef.current) {
  //       const newId = createItemMasterDraft(formData, meta);
  //       activeDraftIdRef.current = newId;
  //       setActiveDraftId(newId);
  //     } else {
  //       saveItemMasterDraft(activeDraftIdRef.current, formData, meta);
  //     }

  //     setDraftSavedAt(new Date());
  //     setDraftTableKey((k) => k + 1);
  //   }, 1500);
  // }, [formData, editingId, viewMode]);

  // const handleManualSave = () => {
  //   if (editingId || viewMode) return;

  //   const meta = {
  //     itemName: formData.itemName,
  //     itemType: formData.itemType,
  //     company: formData.company,
  //   };

  //   if (!activeDraftIdRef.current) {
  //     const newId = createItemMasterDraft(formData, meta);
  //     activeDraftIdRef.current = newId;
  //     setActiveDraftId(newId);
  //   } else {
  //     saveItemMasterDraft(activeDraftIdRef.current, formData, meta);
  //   }

  //   setDraftSavedAt(new Date());
  //   setDraftTableKey((k) => k + 1);
  //   message.success("Draft saved");
  // };

  // const handleContinueDraft = (draftId) => {
  //   const draft = loadItemMasterDraft(draftId);
  //   if (!draft) {
  //     message.error("Draft not found");
  //     return;
  //   }

  //   const restored = deserialiseItemMasterDraft(draft.values);
  //   setFormData(restored);
  //   activeDraftIdRef.current = draftId; // ← sync ref
  //   setActiveDraftId(draftId);
  //   setDraftSavedAt(new Date(draft.savedAt));
  //   setEditingId(null);
  //   setViewMode(false);
  //   setOpen(true);
  // };

  // const discardActiveDraft = () => {
  //   if (activeDraftIdRef.current) {
  //     deleteItemMasterDraft(activeDraftIdRef.current);
  //     activeDraftIdRef.current = null;
  //     setActiveDraftId(null);
  //     setDraftSavedAt(null);
  //     setDraftTableKey((k) => k + 1);
  //   }
  // };

  // Auto-save when formData changes
  // useEffect(() => {
  //   if (!open || editingId || viewMode) return; // ← guard added
  //   handleFormValuesChange();
  // }, [formData]);

  // handle delete product
  const handleDeleteProduct = async (id) => {
    try {
      setLoading(true);
      await deleteProductById(id);
      message.success("Product deleted successfully");
      const updated = await getProducts();
      setItems(updated);
    } catch (err) {
      console.error(err);
      message.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };
  /* ================= SAFE EDIT MAPPING ================= */
  const openEdit = async (record, view = false) => {
    try {
      setLoading(true);

      const data = await getProductById(record.id);

      setEditingId(record.id);

      setFormData({
        itemName: data.name,
        itemType: data.product_type,
        company: data.company_group,
        product_group: data.product_group,
        itemCategory: data.category,
        hsn_code: data.hsn_code,
        sac_code: data.sac_code || null,
        base_unit: data.base_unit,
        lower_unit: data.lower_unit,
        upper_unit: data.upper_unit,
        multiplier: data.multiplier,
        is_active: data.is_active,
        gstPercent: Number(data.gst_percentage),
        cgstPercent: Number(data.gst_percentage) / 2,
        sgstPercent: Number(data.gst_percentage) / 2,
        currentStock: Number(data.current_stock),
        net_weight: Number(data.net_weight) || 0,
        net_weight_gram:
          Number(data.net_weight_gram) || Number(data.net_weight || 0) * 1000,
        gross_weight: Number(data.gross_weight) || 0,
        gross_weight_gram:
          Number(data.gross_weight_gram) ||
          Number(data.gross_weight || 0) * 1000,
      });

      setViewMode(view);
      setOpen(true);
    } catch (err) {
      message.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (
      !formData.itemName ||
      !formData.product_group ||
      !formData.base_unit ||
      !formData.itemType ||
      !formData.company ||
      !formData.itemCategory ||
      (formData.itemCategory === "GOODS" && !formData.hsn_code) ||
      (formData.itemCategory === "SERVICE" && !formData.sac_code)
    ) {
      message.error("Please fill all required fields");
      return;
    }
    console.log("Submitting", formData);
    const payload = {
      name: formData.itemName,
      product_group: formData.product_group,
      hsn_code: formData.itemCategory === "GOODS" ? formData.hsn_code : null,
      sac_code: formData.itemCategory === "SERVICE" ? formData.sac_code : null,
      base_unit: formData.base_unit,
      lower_unit: formData.lower_unit,
      upper_unit: formData.upper_unit,
      multiplier: formData.multiplier,
      product_type: formData.itemType,
      category: formData.itemCategory,
      gst_percentage: formData.gstPercent,
      cgst: formData.cgstPercent,
      sgst: formData.sgstPercent,
      current_stock: formData.currentStock || 0,
      // vendor: formData.company,
      company_group: formData.company,
      net_weight: formData.net_weight,
      net_weight_gram: formData.net_weight_gram,
      gross_weight: formData.gross_weight,
      gross_weight_gram: formData.gross_weight_gram,
      is_active: formData.is_active,
    };

    try {
      setLoading(true);

      if (editingId) {
        // UPDATE
        await updateProductById(payload, editingId);
        message.success("Product updated successfully");
      } else {
        // ADD
        await addproduct(payload);
        message.success("Product added successfully");
        // Delete draft on successful save for new items
        // if (activeDraftId) {
        //   discardActiveDraft();
        // }
      }

      const updated = await getProducts();
      setItems(updated);

      setOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (err) {
      console.error(err);
      message.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GROUPING & FILTERING ================= */

  const filteredData = useMemo(() => {
    let result = items || [];

    if (selectedGroupFilter) {
      result = result.filter(
        (it) => it.product_group_name === selectedGroupFilter
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) => {
          if (!val) return false;
          return JSON.stringify(val).toLowerCase().includes(q);
        })
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

  /* ================= TABLE COLUMNS WITH SL NO & GROUP HEADERS ================= */
  const columns = [
    {
      title: <span className="font-semibold text-amber-800">SL No.</span>,
      dataIndex: "slNo",
      width: 75,
      align: "center",
      onCell: (record) => {
        if (record.isGroupHeader) {
          return {
            colSpan: 10,
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
      title: <span className="font-semibold text-amber-800">Item Name</span>,
      dataIndex: "name",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
      render: (t) => <span className="font-medium text-amber-950">{t}</span>,
    },
    {
      title: <span className="font-semibold text-amber-800">Type</span>,
      dataIndex: "product_type",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Company</span>,
      dataIndex: "company_group_name",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Base Unit</span>,
      dataIndex: "base_unit",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Lower Unit</span>,
      dataIndex: "lower_unit",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Upper Unit</span>,
      dataIndex: "upper_unit",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Net Weight</span>,
      dataIndex: "net_weight",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Gross Weight</span>,
      dataIndex: "gross_weight",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
    },
    {
      title: <span className="font-semibold text-amber-800">Action</span>,
      width: 100,
      align: "center",
      onCell: (record) => (record.isGroupHeader ? { colSpan: 0 } : {}),
      render: (_, r) => (
        <Space>
          <Tooltip title="View Item">
            <EyeOutlined
              className="action-view cursor-pointer text-amber-600 hover:text-amber-800"
              onClick={() => openEdit(r, true)}
            />
          </Tooltip>
          <Tooltip title="Edit Item">
            <EditOutlined
              className="action-edit cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => openEdit(r)}
            />
          </Tooltip>
          <Tooltip title="Delete Item">
            <DeleteOutlined
              className="text-gray-500! cursor-pointer! text-base! hover:text-red-600!"
              onClick={() => handleDeleteProduct(r.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Draft Table Component
  // function ItemMasterDraftTable({ refreshKey, onContinue, onDelete }) {
  //   const [drafts, setDrafts] = useState([]);

  //   useEffect(() => {
  //     setDrafts(getAllItemMasterDrafts());
  //   }, [refreshKey]);

  //   if (!drafts.length) return null;

  //   const handleDelete = (id) => {
  //     deleteItemMasterDraft(id);
  //     onDelete?.();
  //     setDrafts(getAllItemMasterDrafts());
  //   };

  //   const columns = [
  //     {
  //       title: (
  //         <span className="text-amber-700 font-semibold text-xs">
  //           Item Name
  //         </span>
  //       ),
  //       dataIndex: "name",
  //       render: (t) => <span className="text-amber-800 font-medium">{t}</span>,
  //     },
  //     {
  //       title: (
  //         <span className="text-amber-700 font-semibold text-xs">Type</span>
  //       ),
  //       dataIndex: "type",
  //       render: (t) => <span className="text-amber-700 text-sm">{t}</span>,
  //     },
  //     {
  //       title: (
  //         <span className="text-amber-700 font-semibold text-xs">Company</span>
  //       ),
  //       dataIndex: "company",
  //       render: (t) => <span className="text-amber-700 text-sm">{t}</span>,
  //     },
  //     {
  //       title: (
  //         <span className="text-amber-700 font-semibold text-xs">
  //           Last Saved
  //         </span>
  //       ),
  //       dataIndex: "savedAt",
  //       render: (v) => (
  //         <Tag
  //           icon={<ClockCircleOutlined />}
  //           color="gold"
  //           className="text-xs font-normal"
  //         >
  //           {v ? dayjs(v).fromNow() : "Not saved"}
  //         </Tag>
  //       ),
  //     },
  //     {
  //       title: (
  //         <span className="text-amber-700 font-semibold text-xs">Actions</span>
  //       ),
  //       render: (_, record) => (
  //         <div className="flex gap-2">
  //           <Button
  //             size="small"
  //             type="primary"
  //             icon={<EditOutlined />}
  //             className="bg-amber-500! hover:bg-amber-600! border-none! text-xs!"
  //             onClick={() => onContinue(record.id)}
  //           >
  //             Continue
  //           </Button>
  //           <Button
  //             size="small"
  //             danger
  //             icon={<DeleteOutlined />}
  //             className="text-xs!"
  //             onClick={() => handleDelete(record.id)}
  //           >
  //             Delete
  //           </Button>
  //         </div>
  //       ),
  //     },
  //   ];

  //   return (
  //     <div className="border border-amber-200 rounded-lg p-4 bg-white shadow-sm mb-4">
  //       <div className="flex items-center gap-2 mb-2">
  //         <FileTextOutlined className="text-amber-500 text-lg" />
  //         <h2 className="text-base font-semibold text-amber-700 m-0">
  //           Saved Drafts
  //         </h2>
  //         <Tag color="gold" className="ml-1">
  //           {drafts.length}
  //         </Tag>
  //       </div>
  //       <Table
  //         columns={columns}
  //         dataSource={drafts}
  //         rowKey="id"
  //         size="small"
  //         bordered
  //         pagination={false}
  //         rowClassName="hover:bg-amber-50"
  //       />
  //     </div>
  //   );
  // }

  return (
    <>
      <style>
        {`
/* ===== TABLE BORDER ===== */
// .amber-table .ant-table {
//   border: 1px solid #f59e0b;
//   border-radius: 8px;
//   overflow: hidden;
// }

/* header */
.amber-table .ant-table-thead > tr > th {
  background: #fffbeb;
  color: #92400e;
  // border-bottom: 2px solid #f59e0b;
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

/* pagination active */
.amber-table .ant-pagination-item-active {
  border-color: #f59e0b;
}
.amber-table .ant-pagination-item-active a {
  color: #f59e0b;
}

/* ===== ADD BUTTON ===== */
.amber-add-btn {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
}

.amber-add-btn:hover {
  background-color: #d97706 !important;
  border-color: #d97706 !important;
}

/* ===== ACTION ICONS ===== */
.action-view {
  color: #2151f0;
  font-size: 16px;
  cursor: pointer;
}

.action-view:hover {
  color: #15803d;
}

.action-edit {
  color: #ed0b0b;
  font-size: 16px;
  cursor: pointer;
}

.action-edit:hover {
  color: #1d4ed8;
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
        {/* LEFT: SEARCH & PRODUCT GROUP FILTER */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
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

        {/* RIGHT: ADD BUTTON */}
        <Button
          className="amber-add-btn"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setFormData({
              gstPercent: 0,
              cgstPercent: 0,
              sgstPercent: 0,
              net_weight: 0,
              gross_weight: 0,
            });
            setEditingId(null);
            setViewMode(false);
            setOpen(true);
          }}
        >
          Add Item
        </Button>
      </div>

      <Table
        className="amber-table"
        rowKey="id"
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 1000 }}
        style={{ marginTop: 16 }}
      />

      <Modal
        open={open}
        width={800}
        onCancel={() => setOpen(false)}
        onOk={viewMode ? null : handleSave}
        okButtonProps={{
          disabled: viewMode,
          loading,
          style: {
            backgroundColor: "#f59e0b",
            borderColor: "#f59e0b",
          },
        }}
        title={
          <div className="flex items-center gap-3">
            <span className="text-amber-700 font-semibold text-lg">
              {viewMode ? "View Item" : editingId ? "Edit Item" : "Add Item"}
            </span>

            {/* Draft indicator - shown only for new item forms */}
            {/* {!editingId && !viewMode && (
              <div className="flex items-center gap-2 ml-2">
                {activeDraftId ? (
                  <Tag
                    color="gold"
                    icon={<SaveOutlined />}
                    className="cursor-default select-none"
                  >
                    Draft saved
                  </Tag>
                ) : (
                  <Tag
                    color="default"
                    className="cursor-default select-none text-xs"
                  >
                    Not saved yet
                  </Tag>
                )}

                {/* Manual save button */}
            {/* <Button
                  size="small"
                  icon={<SaveOutlined />}
                  className="border-amber-400! text-amber-700! hover:bg-amber-100! text-xs!"
                  onClick={handleManualSave}
                >
                  Save Draft
                </Button> */}
            {/* </div> */}
            {/* )} */}
          </div>
        }
      >
        <div style={{ paddingTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              {" "}
              <FormField label="Item Name" required>
                <Input
                  disabled={viewMode}
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Item Type" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select item type"
                  style={{ width: "100%" }}
                  value={formData.itemType}
                  onChange={(value) =>
                    setFormData({ ...formData, itemType: value })
                  }
                >
                  {ITEM_TYPES.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Company Group Name" required>
                <Select
                  disabled={viewMode}
                  showSearch
                  placeholder="Select company"
                  style={{ width: "100%" }}
                  value={formData.company}
                  onChange={(value) =>
                    setFormData({ ...formData, company: value })
                  }
                  optionFilterProp="label"
                  options={vendors.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Category" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select category"
                  value={formData.itemCategory}
                  style={{ width: "100%" }}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      itemCategory: value,
                      hsnCode: null,
                      sacCode: null,
                    })
                  }
                >
                  {ITEM_CATEGORY.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </FormField>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FormField label="Product Group" required>
                <Select
                  showSearch
                  placeholder="Select product group"
                  loading={loading}
                  style={{ width: "100%" }}
                  value={formData.product_group}
                  onChange={handleProductGroupChange}
                  optionFilterProp="label"
                  options={groups.map((g) => ({
                    value: g.id, // UUID goes to backend
                    label: g.name, // Name shown to user
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              {/* GOODS → HSN */}
              {formData.itemCategory === "GOODS" && (
                <FormField label="HSN Code" required>
                  {/* <Select
                    showSearch
                    placeholder="Select HSN code"
                    value={formData.hsn_code || undefined}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      setFormData({ ...formData, hsn_code: value })
                    }
                    options={hsnSacCodes.hsn.map((h) => ({
                      value: h.id,
                      label: `${h.hsn_code} - ${h.description}`,
                    }))}
                  /> */}
                  <Input
                    value={formData.hsn_code || ""}
                    disabled
                    placeholder="Auto-filled from product group"
                  />
                </FormField>
              )}

              {/* SERVICE → SAC */}
              {formData.itemCategory === "SERVICE" && (
                <FormField label="SAC Code" required>
                  {/* <Select
                    disabled={!!formData.product_group && !!formData.hsn_code}
                    showSearch
                    placeholder="Select SAC code"
                    value={formData.sac_code || undefined}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      setFormData({ ...formData, sac_code: value })
                    }
                    options={hsnSacCodes.sac.map((s) => ({
                      value: s.id,
                      label: `${s.sac_code} - ${s.description}`,
                    }))}
                  /> */}
                  <Input
                    value={formData.sac_code || ""}
                    disabled
                    placeholder="Auto-filled from product group"
                  />
                </FormField>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <FormField label="GST %" required>
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: "100%" }}
                  value={formData.gstPercent}
                  onChange={handleGstChange}
                  formatter={(value) => `${value}`}
                  parser={(value) => value.replace("%", "")}
                  placeholder="%"
                />
              </FormField>
            </Col>
            <Col span={8}>
              <FormField label="CGST %">
                <InputNumber
                  style={{ width: "100%" }}
                  value={formData.cgstPercent}
                  disabled
                  formatter={(value) => `${value}%`}
                />
              </FormField>
            </Col>

            <Col span={8}>
              <FormField label="SGST %">
                <InputNumber
                  style={{ width: "100%" }}
                  value={formData.sgstPercent}
                  disabled
                  formatter={(value) => `${value}%`}
                />
              </FormField>
            </Col>

            <Col span={12}>
              <FormField label="Base Unit" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select unit"
                  style={{ width: "100%" }}
                  value={formData.base_unit}
                  onChange={(value) =>
                    setFormData({ ...formData, base_unit: value })
                  }
                  optionFilterProp="label"
                  options={units.map((u) => ({
                    value: u.name,
                    label: u.name,
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Lower Unit" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select unit"
                  style={{ width: "100%" }}
                  value={formData.lower_unit}
                  onChange={(value) =>
                    setFormData({ ...formData, lower_unit: value })
                  }
                  optionFilterProp="label"
                  options={units.map((u) => ({
                    value: u.name,
                    label: u.name,
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Uppper Unit" required>
                <Select
                  disabled={viewMode}
                  placeholder="Select unit"
                  style={{ width: "100%" }}
                  value={formData.upper_unit}
                  onChange={(value) =>
                    setFormData({ ...formData, upper_unit: value })
                  }
                  optionFilterProp="label"
                  options={units.map((u) => ({
                    value: u.name,
                    label: u.name,
                  }))}
                />
              </FormField>
            </Col>
            <Col span={12}>
              <FormField label="Multiplier" required>
                <InputNumber
                  style={{ width: "100%" }}
                  value={formData.multiplier}
                  onChange={(value) =>
                    setFormData({ ...formData, multiplier: value })
                  }
                />
              </FormField>
            </Col>
            <Col span={12}>
              {" "}
              <FormField label="Current Stock">
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  step={1}
                  placeholder="0"
                  style={{ width: "100%" }}
                  value={formData.currentStock}
                  onChange={(value) =>
                    setFormData({ ...formData, currentStock: value || 0 })
                  }
                />
              </FormField>
            </Col>
            <Col span={6}>
              <FormField label="Net Weight (Gram)">
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  style={{ width: "100%" }}
                  value={formData.net_weight_gram}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      net_weight_gram: value || 0,
                      net_weight: (value || 0) / 1000,
                    }))
                  }
                />
              </FormField>
            </Col>
            <Col span={6}>
              <FormField label="Net Weight (KG)">
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  style={{ width: "100%" }}
                  value={formData.net_weight}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      net_weight: value || 0,
                      net_weight_gram: (value || 0) * 1000,
                    }))
                  }
                />
              </FormField>
            </Col>

            <Col span={6}>
              <FormField label="Gross Weight (Gram)">
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  style={{ width: "100%" }}
                  value={formData.gross_weight_gram}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      gross_weight_gram: value || 0,
                      gross_weight: (value || 0) / 1000,
                    }))
                  }
                />
              </FormField>
            </Col>
            <Col span={6}>
              <FormField label="Gross Weight (KG)">
                <InputNumber
                  disabled={viewMode}
                  min={0}
                  style={{ width: "100%" }}
                  value={formData.gross_weight}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      gross_weight: value || 0,
                      gross_weight_gram: (value || 0) * 1000,
                    }))
                  }
                />
              </FormField>
            </Col>

            <Col span={12}>
              <FormField label="Status">
                <Select
                  style={{ width: "100%" }}
                  value={formData.is_active}
                  onChange={(value) =>
                    setFormData({ ...formData, is_active: value })
                  }
                >
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </FormField>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
}
