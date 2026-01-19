import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Table,
  Empty,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

/**
 * Props:
 * item = {
 *   itemName,
 *   baseUnit
 * }
 */
export default function UnitConversionManager({ item }) {
  // 🛑 Guard: item not selected yet
  if (!item) {
    return (
      <Card title="Unit Conversion">
        <Empty description="Select an item to manage unit conversions" />
      </Card>
    );
  }

  const [form] = Form.useForm();
  const [units, setUnits] = useState([]);

  const handleSave = (values) => {
    setUnits(values.units || []);
    form.resetFields();
  };

  return (
    <Card
      title={`Unit Conversion – ${item.itemName}`}
      style={{ marginTop: 24 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{ units: [] }}
      >
        <Form.List name="units">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row key={field.key} gutter={16} align="middle">
                  <Col span={10}>
                    <Form.Item
                      label="Unit Name"
                      name={[field.name, "unitName"]}
                      fieldKey={[field.fieldKey, "unitName"]}
                      rules={[{ required: true, message: "Enter unit name" }]}
                    >
                      <Input placeholder="PACK / BOX" />
                    </Form.Item>
                  </Col>

                  <Col span={10}>
                    <Form.Item
                      label={`1 Unit = ? ${item.baseUnit}`}
                      name={[field.name, "multiplier"]}
                      fieldKey={[field.fieldKey, "multiplier"]}
                      rules={[{ required: true, message: "Enter multiplier" }]}
                    >
                      <InputNumber
                        min={1}
                        style={{ width: "100%" }}
                        placeholder={`How many ${item.baseUnit}`}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Button
                      danger
                      type="text"
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(field.name)}
                      style={{ marginTop: 30 }}
                    />
                  </Col>
                </Row>
              ))}

              <Form.Item>
                <Button
                  block
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                >
                  Add Unit
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Button type="primary" htmlType="submit">
          Save Units
        </Button>
      </Form>

      <Table
        style={{ marginTop: 24 }}
        rowKey="unitName"
        dataSource={units}
        pagination={false}
        columns={[
          { title: "Unit", dataIndex: "unitName" },
          {
            title: "Conversion",
            render: (_, r) =>
              `1 ${r.unitName} = ${r.multiplier} ${item.baseUnit}`,
          },
        ]}
      />
    </Card>
  );
}
