import React from "react";
import { Row, Col, Form, Input, Radio, Button, Card, Divider } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

export default function Step3_Branches({ setHasBranch, handlePhoneFormat }) {
  return (
    <>
      {/* ── Has Branch? ── */}
      <Form.Item
        label="Is company associated with branch?"
        name="hasBranch"
        rules={[{ required: true, message: "Please select an option" }]}
      >
        <Radio.Group onChange={(e) => setHasBranch(e.target.value)}>
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      </Form.Item>

      {/* ── Branch list (shown only when hasBranch = true) ── */}
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.hasBranch !== curr.hasBranch}
      >
        {({ getFieldValue }) =>
          getFieldValue("hasBranch") ? (
            <Form.List name="branches" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{
                        marginBottom: 16,
                        background: "#fffbeb",
                        border: "1px solid #fef3c7",
                      }}
                      title={`Branch ${name + 1}`}
                      extra={
                        fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            style={{ color: "#ef4444", cursor: "pointer" }}
                          />
                        )
                      }
                    >
                      <Row gutter={[16, 8]}>
                        {/* Basic Info */}
                        <Col xs={12} sm={6} md={4}>
                          <Form.Item
                            {...restField}
                            label="Short Name"
                            name={[name, "shortName"]}
                            rules={[{ max: 5, message: "Max 5 chars" }]}
                          >
                            <Input placeholder="5 chars" maxLength={5} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="Branch Name"
                            name={[name, "branchName"]}
                          >
                            <Input placeholder="Branch name" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="City"
                            name={[name, "city"]}
                          >
                            <Input placeholder="City" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="State"
                            name={[name, "state"]}
                            rules={[
                              {
                                pattern: /^[A-Za-z\s]+$/,
                                message: "Only letters are allowed",
                              },
                            ]}
                          >
                            <Input placeholder="State" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="PIN No"
                            name={[name, "pinNo"]}
                            rules={[
                              {
                                pattern: /^[0-9]{6}$/,
                                message: "Enter a valid 6-digit PIN code",
                              },
                            ]}
                          >
                            <Input placeholder="PIN" />
                          </Form.Item>
                        </Col>

                        {/* Address */}
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item
                            {...restField}
                            label="Address Line 1"
                            name={[name, "address1"]}
                          >
                            <Input placeholder="Address 1" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item
                            {...restField}
                            label="Address Line 2"
                            name={[name, "address2"]}
                          >
                            <Input placeholder="Address 2" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item
                            {...restField}
                            label="Branch GSTIN"
                            name={[name, "gstin"]}
                          >
                            <Input placeholder="GSTIN" />
                          </Form.Item>
                        </Col>

                        {/* Contacts */}
                        <Col xs={24}>
                          <Divider orientation="left" plain>
                            Branch Contact Details
                          </Divider>
                          <Form.List
                            name={[name, "contacts"]}
                            initialValue={[{}]}
                          >
                            {(
                              contactFields,
                              { add: addContact, remove: removeContact },
                            ) => (
                              <>
                                {contactFields.map(
                                  ({
                                    key: cKey,
                                    name: cName,
                                    ...cRestField
                                  }) => (
                                    <Row
                                      key={cKey}
                                      gutter={8}
                                      align="middle"
                                      style={{ marginBottom: 8 }}
                                    >
                                      <Col xs={24} sm={8}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Contact Person"
                                          name={[cName, "person"]}
                                          rules={[
                                            {
                                              pattern: /^[A-Za-z\s]+$/,
                                              message:
                                                "Only letters are allowed",
                                            },
                                          ]}
                                        >
                                          <Input
                                            placeholder="Contact person"
                                            size="small"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={12} sm={7}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Contact No"
                                          name={[cName, "number"]}
                                          rules={[
                                            {
                                              pattern: /^\+?[0-9\s-]{8,20}$/,
                                              message: "Invalid phone format",
                                            },
                                          ]}
                                        >
                                          <Input
                                            placeholder="Contact no"
                                            size="small"
                                            onChange={handlePhoneFormat([
                                              "branches",
                                              name,
                                              "contacts",
                                              cName,
                                              "number",
                                            ])}
                                            maxLength={15}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={10} sm={7}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Email"
                                          name={[cName, "email"]}
                                          rules={[
                                            {
                                              type: "email",
                                              message: "Invalid email",
                                            },
                                          ]}
                                        >
                                          <Input
                                            placeholder="Email"
                                            size="small"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col
                                        xs={2}
                                        sm={2}
                                        style={{ textAlign: "center" }}
                                      >
                                        <MinusCircleOutlined
                                          onClick={() => removeContact(cName)}
                                          style={{
                                            color: "#ef4444",
                                            cursor: "pointer",
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ),
                                )}
                                <Button
                                  type="dashed"
                                  onClick={() => addContact()}
                                  size="small"
                                  icon={<PlusOutlined />}
                                >
                                  Add Contact
                                </Button>
                              </>
                            )}
                          </Form.List>
                        </Col>
                      </Row>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Branch
                  </Button>
                </>
              )}
            </Form.List>
          ) : null
        }
      </Form.Item>
    </>
  );
}
