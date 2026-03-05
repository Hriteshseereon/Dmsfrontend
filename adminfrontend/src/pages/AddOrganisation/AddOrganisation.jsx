import React, { useState } from "react";
import {
  Form,
  Card,
  Button,
  Space,
  Steps,
  Progress,
  Divider,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateOrganization } from "../../queries/useCreateOrganization";

import OrganisationStep from "./steps/OrganisationStep";
import PartnersStep from "./steps/PartnersStep";
import LegalStep from "./steps/LegalStep";
import BranchStep from "./steps/BranchStep";
import FinalizeStep from "./steps/FinalizeStep";
import { buildOrganisationPayload } from "./payload/buildOrganisationPayload";

export default function AddOrganisation() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateOrganization();

  const [currentStep, setCurrentStep] = useState(0);
  const [orgType, setOrgType] = useState("");
  const [hasBranch, setHasBranch] = useState(false);

  const steps = [
    { title: "Organisation" },
    { title: "Partners / Directors" },
    { title: "Legal Details" },
    { title: "Branches" },
    { title: "Finalize" },
  ];

  const nextStep = async () => {
    try {
      await form.validateFields();
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      message.error("Please complete required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const values = form.getFieldsValue(true);
    const payload = buildOrganisationPayload(values);

    mutate(payload, {
      onSuccess: () => {
        message.success("Organisation created successfully");
        navigate("/organizations");
      },
      onError: () => {
        message.error("Failed to create organisation");
      },
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <Card
        title="Add Organisation"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Exit
          </Button>
        }
      >
        <Progress
          percent={((currentStep + 1) / steps.length) * 100}
          showInfo={false}
        />
        <Steps current={currentStep} items={steps} size="small" />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          {currentStep === 0 && (
            <OrganisationStep form={form} setOrgType={setOrgType} />
          )}
          {currentStep === 1 && <PartnersStep form={form} orgType={orgType} />}
          {currentStep === 2 && <LegalStep />}
          {currentStep === 3 && (
            <BranchStep form={form} setHasBranch={setHasBranch} />
          )}
          {currentStep === 4 && <FinalizeStep />}

          <Divider />

          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button disabled={currentStep === 0} onClick={prevStep}>
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                icon={<CheckOutlined />}
              >
                Create Organisation
              </Button>
            )}
          </Space>
        </Form>
      </Card>
    </div>
  );
}
