import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  Table,
  Button,
  Modal,
  Input,
  InputNumber,
  Checkbox,
  Row,
  Col,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  addProductUnitConversion,
  getProductUnitConversions,
  getProductReferenceUnits,
} from "../../../../../../../api/product";

const REFERENCE_TYPES = ["BASE", "UNIT"];

export default function UnitConversionTab({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [unitConversions, setUnitConversions] = useState([]);
  const [referenceUnits, setReferenceUnits] = useState([]);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    reference_type: "BASE",
    set_as_display: false,
  });

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

    console.log("✅ Normalized reference units:", rows);
    return rows;
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!selectedItem) return;

    console.log("🔄 Loading data for item:", selectedItem);

    // Load unit conversions
    getProductUnitConversions(selectedItem.id)
      .then((res) => {
        console.log("📥 Raw unit conversions response:", res);
        console.log("📥 Response type:", typeof res);
        console.log("📥 Is array?:", Array.isArray(res));

        // Handle different response formats
        const data = res?.data || res;
        console.log("✅ Processed unit conversions:", data);

        setUnitConversions(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("❌ Error loading unit conversions:", error);
        message.error("Failed to load unit conversions");
        setUnitConversions([]);
      });

    // Load reference units
    getProductReferenceUnits(selectedItem.id)
      .then((res) => {
        console.log("📥 Raw reference units response:", res);
        const normalized = normalizeReferenceUnits(res?.data || res);
        setReferenceUnits(normalized);
      })
      .catch((error) => {
        console.error("❌ Error loading reference units:", error);
        message.error("Failed to load reference units");
        setReferenceUnits([]);
      });
  }, [selectedItem]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    console.log("💾 Saving form data:", formData);

    if (!formData.unit_name || !formData.multiplier) {
      message.error("Unit name and multiplier are required");
      return;
    }

    if (formData.reference_type === "UNIT" && !formData.reference_unit_id) {
      message.error("Reference unit is required");
      return;
    }

    const payload = {
      product: selectedItem.id,
      unit_name: formData.unit_name,
      reference_type: formData.reference_type,
      reference_unit_id:
        formData.reference_type === "UNIT" ? formData.reference_unit_id : null,
      multiplier: formData.multiplier,
      set_as_display: formData.set_as_display || false,
    };

    console.log("📤 Sending payload:", payload);

    try {
      const createResponse = await addProductUnitConversion(payload);
      console.log("✅ Create response:", createResponse);
      message.success("Unit created successfully");

      // Reload the data
      const updated = await getProductUnitConversions(selectedItem.id);
      console.log("🔄 Updated unit conversions:", updated);

      // Handle different response formats
      const data = updated?.data || updated;
      console.log("✅ Setting unit conversions to:", data);

      setUnitConversions(Array.isArray(data) ? data : []);

      setOpen(false);
      setFormData({ reference_type: "BASE", set_as_display: false });
    } catch (error) {
      console.error("❌ Error creating unit:", error);
      console.error("❌ Error details:", error.response?.data);
      message.error("Failed to create unit");
    }
  };

  console.log("🎨 Current state:", {
    selectedItem,
    unitConversionsCount: unitConversions.length,
    unitConversions,
    referenceUnitsCount: referenceUnits.length,
  });

  return (
    <>
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
          label: i.name,
        }))}
      />

      {selectedItem && (
        <Card
          title={`Units for ${selectedItem.name}`}
          extra={
            <Button
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
            rowKey="id"
            pagination={false}
            dataSource={unitConversions}
            columns={[
              { title: "Unit", dataIndex: "unit_name" },
              { title: "Reference", dataIndex: "reference_type" },
              { title: "Multiplier", dataIndex: "multiplier" },
              {
                title: "Display",
                dataIndex: "set_as_display",
                render: (v) => (v ? "Yes" : "No"),
              },
            ]}
          />

          {/* ================= MODAL ================= */}
          <Modal
            title="Add Unit"
            open={open}
            onOk={handleSave}
            onCancel={() => setOpen(false)}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Input
                  placeholder="Unit Name"
                  value={formData.unit_name}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_name: e.target.value })
                  }
                />
              </Col>

              <Col span={12}>
                <Select
                  value={formData.reference_type}
                  style={{ width: "100%" }}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      reference_type: v,
                      reference_unit_id: null,
                    })
                  }
                >
                  {REFERENCE_TYPES.map((r) => (
                    <Select.Option key={r} value={r}>
                      {r}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              {formData.reference_type === "UNIT" && (
                <Col span={24} style={{ marginTop: 12 }}>
                  <Select
                    showSearch
                    placeholder="Reference Unit"
                    optionFilterProp="label"
                    value={formData.reference_unit_id}
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
                </Col>
              )}

              <Col span={24} style={{ marginTop: 12 }}>
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Multiplier"
                  min={0}
                  value={formData.multiplier}
                  onChange={(v) => setFormData({ ...formData, multiplier: v })}
                />
              </Col>

              <Col span={24} style={{ marginTop: 12 }}>
                <Checkbox
                  checked={formData.set_as_display}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      set_as_display: e.target.checked,
                    })
                  }
                >
                  Set as display unit
                </Checkbox>
              </Col>
            </Row>
          </Modal>
        </Card>
      )}
    </>
  );
}
