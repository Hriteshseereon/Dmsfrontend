import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  Table,
  Button,
  Modal,
  Input,
  InputNumber,
  Row,
  Col,
  message,
  Form,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  addProductUnitConversion,
  getProductUnitConversions,
  getProductReferenceUnits,
  setDisplayUnit,
  getUnits,
} from "@/api/product";
import { useProductUnitConversions } from "@/queries/useProductUnitConversions";

// Reference type is always "UNIT" — hidden from UI
const FIXED_REFERENCE_TYPE = "UNIT";

export default function UnitConversionTab({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const {
    unitConversions,
    isLoading: isUnitConversionsLoading,
    addUnitConversion,
    isAdding,
    refreshData,
  } = useProductUnitConversions(selectedItem?.id);
  const [referenceUnits, setReferenceUnits] = useState([]);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    reference_type: FIXED_REFERENCE_TYPE,
    set_as_display: false,
  });
  const [baseUnit, setBaseUnit] = useState(null);
  const [units, setUnits] = useState([]);
  /* ================= NORMALIZER ================= */
  const normalizeReferenceUnits = (res) => {
    console.log("📦 Raw reference units response:", res);
    const rows = [];

    if (res?.base_unit) {
      rows.push({
        type: "BASE",
        uom_id: null,
        label: res.base_unit.label,
      });
    }

    if (Array.isArray(res?.units)) {
      res.units.forEach((u) => {
        rows.push({
          type: "UNIT",
          uom_id: u.id,
          label: u.label,
        });
      });
    }
    return rows;
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!selectedItem) return;

    Promise.all([getProductReferenceUnits(selectedItem.id), getUnits()])
      .then(([refRes, unitsRes]) => {
        const units = refRes?.data?.units || refRes?.units || [];
        const base = units.find((u) => u.is_base_unit);

        setBaseUnit(base);

        const normalized = normalizeReferenceUnits(refRes?.data || refRes);
        setReferenceUnits(normalized);

        setUnits(unitsRes);

        if (base) {
          setFormData((prev) => ({
            ...prev,
            reference_unit_id: base.id,
          }));
        }
      })
      .catch(() => message.error("Failed to load reference units"));
  }, [selectedItem]);

  /* ================= SET DISPLAY ================= */
  const handleSetDisplay = async (reference_unit_id) => {
    try {
      await setDisplayUnit(reference_unit_id);
      message.success("Display unit updated");
      refreshData();
    } catch (error) {
      console.error("❌ Error setting display unit:", error);
      message.error("Failed to set display unit");
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!formData.unit_group_id || !formData.multiplier) {
      message.error("Upper unit and multiplier are required");
      return;
    }

    if (!formData.reference_unit_id) {
      message.error("Lower unit is required");
      return;
    }

    const payload = {
      product: selectedItem.id,
      unit_group_id: formData.unit_group_id,
      reference_type: FIXED_REFERENCE_TYPE,
      reference_unit_id: formData.reference_unit_id,
      multiplier: formData.multiplier,
      set_as_display: formData.set_as_display || false,
    };

    try {
      await addUnitConversion(payload);
      message.success("Unit created successfully");
      setOpen(false);
      setFormData({
        reference_type: FIXED_REFERENCE_TYPE,
        set_as_display: false,
        unit_group_id: null,
        reference_unit_id: null,
        multiplier: null,
      });
    } catch (error) {
      console.error("❌ Error creating unit:", error);
      message.error("Failed to create unit");
    }
  };

  return (
    <>
      <style>{`
        /* ================= CARD ================= */
        .amber-card .ant-card-head {
          color: #92400e;
        }

        /* ================= TABLE ================= */
        .amber-table .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }
        .amber-table .ant-table-thead > tr > th {
          background: #fffbeb;
          color: #92400e;
          font-weight: 600;
        }
        .amber-table .ant-table-tbody > tr > td {
          color: #78350f;
          border-bottom: 1px solid #fde68a;
        }
        .amber-table .ant-table-tbody > tr:hover > td {
          background: #fffbeb;
        }

        /* ================= ADD BUTTON ================= */
        .amber-btn {
          background-color: #f59e0b !important;
          border-color: #f59e0b !important;
        }
        .amber-btn:hover {
          background-color: #d97706 !important;
          border-color: #d97706 !important;
        }

        /* ================= DISPLAY BUTTON ================= */
        .display-btn {
          color: #16a34a !important;
          font-weight: 500;
        }
        .display-btn:hover {
          color: #15803d !important;
        }

        /* ================= SELECT FOCUS ================= */
        .ant-select-focused .ant-select-selector {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.2) !important;
        }

        /* ================= MODAL ================= */
        .amber-modal .ant-modal-title {
          color: #92400e;
          font-weight: 600;
          font-size: 16px;
        }
        .amber-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
          padding: 0;
        }
        .amber-modal .ant-modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid #fde68a;
          background: #fffbeb;
          border-radius: 12px 12px 0 0;
          margin-bottom: 0;
        }
        .amber-modal .ant-modal-body {
          padding: 24px;
          background: #ffffff;
        }
        .amber-modal .ant-modal-footer {
          padding: 12px 24px;
          border-top: 1px solid #fde68a;
          background: #fffbeb;
          border-radius: 0 0 12px 12px;
          margin-top: 0;
        }

        /* ================= MODAL OK BUTTON ================= */
        .amber-modal .ant-btn-primary {
          background-color: #f59e0b !important;
          border-color: #f59e0b !important;
          border-radius: 6px;
          font-weight: 500;
        }
        .amber-modal .ant-btn-primary:hover {
          background-color: #d97706 !important;
          border-color: #d97706 !important;
        }
        .amber-modal .ant-btn-primary:disabled {
          background-color: #fcd34d !important;
          border-color: #fcd34d !important;
          color: #fff !important;
          opacity: 0.7;
        }

        /* ================= MODAL CANCEL BUTTON ================= */
        .amber-modal .ant-btn-default {
          border-radius: 6px;
        }
        .amber-modal .ant-btn-default:hover {
          color: #92400e !important;
          border-color: #f59e0b !important;
        }

        /* ================= FORM LABELS ================= */
        .amber-modal .ant-form-item-label > label {
          color: #78350f;
          font-weight: 500;
          font-size: 13px;
        }

        /* ================= INPUT / INPUT NUMBER FOCUS ================= */
        .amber-modal .ant-input:focus,
        .amber-modal .ant-input:hover,
        .amber-modal .ant-input-focused {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.15) !important;
        }
        .amber-modal .ant-input-number:hover .ant-input-number-input,
        .amber-modal .ant-input-number-focused {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.15) !important;
        }
        .amber-modal .ant-input-number:hover {
          border-color: #f59e0b !important;
        }

        /* ================= SELECT IN MODAL ================= */
        .amber-modal .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #f59e0b !important;
        }
        .amber-modal .ant-select-focused:not(.ant-select-disabled) .ant-select-selector {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.15) !important;
        }

        /* ================= DIVIDER BETWEEN FIELDS ================= */
        .amber-modal .ant-form-item {
          margin-bottom: 18px;
        }

        /* ================= CONVERSION ARROW HINT ================= */
        .conversion-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fffbeb;
          border: 1px dashed #f59e0b;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 18px;
          color: #92400e;
          font-size: 13px;
          font-weight: 500;
        }
        .conversion-hint .arrow {
          color: #f59e0b;
          font-size: 16px;
        }
      `}</style>

      {/* ================= ITEM SEARCH ================= */}
      <Select
        showSearch
        style={{ width: 300, marginBottom: 16 }}
        placeholder="Search & select item"
        optionFilterProp="label"
        onChange={(id) => {
          const item = items.find((i) => i.id === id);
          console.log("🔍 Selected item:", item);
          setSelectedItem(item);
        }}
        options={items.map((i) => ({
          value: i.id,
          label: `${i.name} (${i.vendor_name})`,
        }))}
      />

      {selectedItem && (
        <Card
          className="amber-card"
          title={`Units for ${selectedItem.name}`}
          extra={
            <Button
              className="amber-btn"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Add Unit
            </Button>
          }
        >
          {/* ================= TABLE ================= */}
          <Table
            className="amber-table"
            rowKey="id"
            pagination={false}
            dataSource={unitConversions?.units || []}
            loading={isUnitConversionsLoading}
            columns={[
              { title: "Upper Unit", dataIndex: "unit_name" },
              { title: "Lower Unit", dataIndex: "reference" },
              {
                title: "Conversion Multiplier",
                dataIndex: "multiplier",
                render: (value) => Number(value),
              },
              {
                title: "Display",
                dataIndex: "is_display_unit",
                render: (isDisplay, record) =>
                  isDisplay ? (
                    <strong style={{ color: "#16a34a" }}>Yes</strong>
                  ) : (
                    <Button
                      size="small"
                      type="link"
                      className="display-btn"
                      onClick={() => handleSetDisplay(record.conversion_id)}
                    >
                      Set Display
                    </Button>
                  ),
              },
            ]}
          />

          {/* ================= MODAL ================= */}
          <Modal
            className="amber-modal"
            title="Add Unit Conversion"
            open={open}
            onOk={handleSave}
            onCancel={() => {
              setOpen(false);
              setFormData({
                reference_type: FIXED_REFERENCE_TYPE,
                set_as_display: false,
              });
            }}
            okText="Add Unit"
            okButtonProps={{ disabled: isAdding, loading: isAdding }}
            width={480}
          >
            {/* Visual hint showing the relationship */}
            {/* <div className="conversion-hint">
              <span>Lower Unit</span>
              <span className="arrow">×&nbsp;multiplier&nbsp;→</span>
              <span>Upper Unit</span>
            </div> */}

            <Row gutter={16}>
              {/* Lower Unit (was: New Unit Name) */}

              {/* Upper Unit (was: Reference Unit) — always shown since type is fixed to UNIT */}
              <Col span={12}>
                <Form.Item label="Base Unit">
                  <Input
                    value={baseUnit?.label}
                    disabled
                    placeholder="Base unit"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Lower Unit" required>
                  <Select
                    showSearch
                    placeholder="e.g. kg, litre, box"
                    optionFilterProp="label"
                    value={formData.reference_unit_id}
                    style={{ width: "100%" }}
                    onChange={(v) =>
                      setFormData({ ...formData, reference_unit_id: v })
                    }
                    options={referenceUnits
                      .filter((u) => u.type === "UNIT")
                      .map((u) => ({
                        value: u.uom_id,
                        label: u.label,
                      }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Upper Unit" required>
                  <Select
                    showSearch
                    placeholder="Select upper unit"
                    optionFilterProp="label"
                    value={formData.unit_group_id}
                    onChange={(v) =>
                      setFormData({ ...formData, unit_group_id: v })
                    }
                    options={units.map((u) => ({
                      value: u.id,
                      label: u.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              {/* Conversion Multiplier */}
              <Col span={12}>
                <Form.Item label="Multiplier" required>
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="e.g. 100"
                    min={0}
                    value={formData.multiplier}
                    onChange={(v) =>
                      setFormData({ ...formData, multiplier: v })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Modal>
        </Card>
      )}
    </>
  );
}
