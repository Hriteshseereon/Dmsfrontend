import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Upload,
  Button,
  Card,
  Divider,
  Checkbox,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { LEGAL_DOCUMENTS } from "../constants.js";

export default function Step2_LegalDetails({ normFile, handlePreview }) {
  return (
    <>
      {/* ── Select which docs to fill ── */}
      <Form.Item label="Select Legal Documents" name="selectedLegalDocs">
        <Checkbox.Group style={{ width: "100%" }}>
          <Row gutter={[16, 8]}>
            {LEGAL_DOCUMENTS.map((doc) => (
              <Col xs={24} sm={12} md={4} key={doc.key}>
                <Checkbox value={doc.key}>{doc.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Form.Item>

      {/* ── Custom / Other Documents ── */}
      <Divider orientation="left">Other / Custom Documents</Divider>
      <Form.List name="customLegalDocs">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16, background: "#fffbeb" }}
                title={`Custom Document ${name + 1}`}
                extra={
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{ color: "#ef4444", cursor: "pointer" }}
                  />
                }
              >
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Document Name"
                      name={[name, "name"]}
                    >
                      <Input placeholder="e.g. Fire Safety Certificate" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Document Number"
                      name={[name, "number"]}
                    >
                      <Input placeholder="Enter document number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Upload Document"
                      name={[name, "document"]}
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={() => false}
                        onPreview={handlePreview}
                      >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Validity Period"
                      name={[name, "validity"]}
                    >
                      <DatePicker.RangePicker
                        style={{ width: "100%" }}
                        format="DD-MM-YYYY"
                        placeholder={["DD-MM-YYYY", "DD-MM-YYYY"]}
                        inputReadOnly={false}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
            <Button
              type="dashed"
              onClick={() => add({})}
              icon={<PlusOutlined />}
              block
            >
              Add More Document
            </Button>
          </>
        )}
      </Form.List>

      {/* ── Selected doc detail cards ── */}
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.selectedLegalDocs !== curr.selectedLegalDocs
        }
      >
        {({ getFieldValue }) => {
          const selected = getFieldValue("selectedLegalDocs") || [];
          return selected.map((docKey) => {
            const doc = LEGAL_DOCUMENTS.find((d) => d.key === docKey);
            if (!doc) return null;
            return (
              <Card
                key={doc.key}
                size="small"
                style={{ marginBottom: 16, background: "#fffbeb" }}
                title={`${doc.label}${doc.full_label ? ` (${doc.full_label})` : ""}`}
              >
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={`${doc.label} Number`}
                      name={["legalDetails", doc.key, "number"]}
                    >
                      <Input placeholder={`Enter ${doc.label} number`} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label={`${doc.label} Document`}
                      name={["legalDetails", doc.key, "document"]}
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={() => false}
                        onPreview={handlePreview}
                      >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  {doc.validityRequired && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Validity Period"
                        name={["legalDetails", doc.key, "validity"]}
                      >
                        <DatePicker.RangePicker
                          style={{ width: "100%" }}
                          format="DD-MM-YYYY"
                          placeholder={["DD-MM-YYYY", "DD-MM-YYYY"]}
                          inputReadOnly={false}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Card>
            );
          });
        }}
      </Form.Item>
    </>
  );
}
