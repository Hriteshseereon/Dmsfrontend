import { Row, Col, Form, Input, Select } from "antd";
const { Option } = Select;

export default function OrganisationStep({ setOrgType }) {
  return (
    <Row gutter={[16, 8]}>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Registered Name"
          name="registeredName"
          rules={[{ required: true, message: "Please enter registered name" }]}
        >
          <Input placeholder="Enter registered name" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Alternate Phone Number"
          name="phone2"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Secondary Email"
          name="secondaryEmail"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Address Line 1"
          name={["organisationAddress", "address"]}
          rules={[{ required: true, message: "Enter address" }]}
        >
          <Input placeholder="Address line" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Address Line 2"
          name={["organisationAddress", "address2"]}
        >
          <Input placeholder="Address line" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="City"
          name={["organisationAddress", "city"]}
          rules={[{ required: true, message: "Enter city" }]}
        >
          <Input placeholder="City" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Form.Item
          label="State"
          name={["organisationAddress", "state"]}
          rules={[{ required: true, message: "Enter state" }]}
        >
          <Input placeholder="State" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Form.Item
          label="PIN Code"
          name={["organisationAddress", "pin"]}
          rules={[{ required: true, message: "Enter PIN" }]}
        >
          <Input placeholder="PIN" maxLength={6} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Head Office Location"
          name="businessLocation"
          rules={[{ required: true, message: "Please select location" }]}
        >
          {/* <LocationPicker /> */}
          <Input placeholder="Enter location" maxLength={6} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Organisation Type"
          name="organisationType"
          rules={[
            { required: true, message: "Please select organisation type" },
          ]}
        >
          <Select
            placeholder="Select organisation type"
            onChange={handleOrgTypeChange}
          >
            <Option value="pvt">Private Limited (Pvt Ltd)</Option>
            <Option value="LLP">LLP</Option>
            <Option value="opc">OPC</Option>
            <Option value="partnership">Partnership</Option>
            <Option value="proprietor">Proprietor</Option>
          </Select>
        </Form.Item>
      </Col>
      {rule?.askCount && (
        <Col md={6}>
          <Form.Item label={`Number of ${rule.label}s`} name="partnersCount">
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder={`Enter number of ${rule.label}s (optional)`}
            />
          </Form.Item>
        </Col>
      )}
    </Row>
  );
}
