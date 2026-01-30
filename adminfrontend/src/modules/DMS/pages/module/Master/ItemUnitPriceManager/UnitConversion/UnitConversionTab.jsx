import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  Table,
  Button,
  Modal,
  Input,
  InputNumber,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  addProductUnitConversion,
  getProductUnitConversions,
  getProductReferenceUnits,
} from "../../../../../../../api/product";

export default function UnitConversionTab({
  items,
  selectedItem,
  setSelectedItem,
  unitConversions,
  setUnitConversions,
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [referenceType, setReferenceType] = useState("BASE");
  const [referenceUnits, setReferenceUnits] = useState([]);
  useEffect(() => {
    if (!selectedItem || referenceType !== "UNIT") return;

    getProductReferenceUnits(selectedItem.id).then((res) => {
      setReferenceUnits(Array.isArray(res) ? res : res.results || []);
    });
  }, [selectedItem, referenceType]);

  useEffect(() => {
    if (!selectedItem) return;
    getProductUnitConversions(selectedItem.id).then(setUnitConversions);
  }, [selectedItem]);

  const handleSave = async () => {
    await addProductUnitConversion({
      product: selectedItem.id,
      unit_name: formData.unit_name,
      multiplier: formData.multiplier,
      reference_type: "BASE",
    });

    message.success("Unit added");
    setOpen(false);
  };

  if (!selectedItem) {
    return (
      <Select
        style={{ width: 300 }}
        placeholder="Select item"
        onChange={(id) => setSelectedItem(items.find((i) => i.id === id))}
        options={items.map((i) => ({
          value: i.id,
          label: i.name,
        }))}
      />
    );
  }

  return (
    <Card
      title={`Units for ${selectedItem.name}`}
      extra={
        <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Add Unit
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={[
          { title: "Unit", dataIndex: "unit_name" },
          { title: "Multiplier", dataIndex: "multiplier" },
        ]}
        dataSource={unitConversions}
        pagination={false}
      />

      <Modal open={open} onOk={handleSave} onCancel={() => setOpen(false)}>
        <Input
          placeholder="Unit Name"
          onChange={(e) =>
            setFormData({ ...formData, unit_name: e.target.value })
          }
        />
        <InputNumber
          style={{ width: "100%", marginTop: 12 }}
          placeholder="Multiplier"
          onChange={(v) => setFormData({ ...formData, multiplier: v })}
        />
      </Modal>
    </Card>
  );
}
