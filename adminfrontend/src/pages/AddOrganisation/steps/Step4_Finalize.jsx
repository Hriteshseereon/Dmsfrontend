import React from "react";
import { Row, Col, Form, Card, Divider, Checkbox } from "antd";
import { modulesList } from "../constants.js";

export default function Step4_Finalize() {
  return (
    <>
      <Divider orientation="left" style={{ color: "#d97706", fontWeight: 600 }}>
        Enable Modules
      </Divider>
      <Row gutter={[16, 8]}>
        {modulesList.map((module) => (
          <Col xs={24} sm={12} md={6} key={module.id}>
            <Card
              hoverable
              className="
                relative h-full
                border-gray-200
                transition-all
                [&:has(input:checked)]:border-amber-500
                [&:has(input:checked)]:bg-amber-50
              "
            >
              {/* Checkbox – Top Right */}
              <div className="absolute top-3 right-3">
                <Form.Item
                  name={`module_${module.id}`}
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Checkbox />
                </Form.Item>
              </div>

              {/* Content */}
              <div className="pt-4">
                <h4 className="text-sm font-semibold text-gray-800">
                  {module.label}
                </h4>
                {module.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {module.description}
                  </p>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
