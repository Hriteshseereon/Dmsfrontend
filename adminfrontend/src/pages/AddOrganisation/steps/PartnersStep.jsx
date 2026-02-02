import { Form, Input, Card, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

export default function PartnersStep({ orgType }) {
  if (!orgType) return null;

  return (
    <Form.List name="partners">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name }) => (
            <Card
              key={key}
              title={`Partner ${name + 1}`}
              extra={<MinusCircleOutlined onClick={() => remove(name)} />}
            >
              <Form.Item
                label="Name"
                name={[name, "name"]}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Email" name={[name, "email"]}>
                <Input />
              </Form.Item>
            </Card>
          ))}

          <Button onClick={() => add()} icon={<PlusOutlined />}>
            Add Partner
          </Button>
        </>
      )}
    </Form.List>
  );
}
