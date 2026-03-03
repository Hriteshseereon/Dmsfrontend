import React from "react";
import {
  Form,
  Button,
  Card,
  Space,
  Divider,
  Progress,
  Steps,
  Alert,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { STEPS } from "./constants.js";
import { useOrganisationForm } from "./useOrganisationForm.js";
import Step0_OrgDetails from "./steps/Step0_OrgDetails.jsx";
import Step1_Partners from "./steps/Step1_Partners.jsx";
import Step2_LegalDetails from "./steps/Step2_LegalDetails.jsx";
import Step3_Branches from "./steps/Step3_Branches.jsx";
import Step4_Finalize from "./steps/Step4_Finalize.jsx";

export default function AddOrganisation() {
  const [form] = Form.useForm();

  const {
    // state
    currentStep,
    orgType,
    hasBranch,
    setHasBranch,
    submitError,
    setSubmitError,
    rule,
    isEdit,
    isLoading,
    isCreating,
    isUpdating,
    // handlers
    nextStep,
    prevStep,
    handleSubmit,
    handleOrgTypeChange,
    handlePhoneFormat,
    handleFormValueChange,
    normFile,
    handlePreview,
  } = useOrganisationForm(form);

  // ── Step content router ─────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step0_OrgDetails
            form={form}
            rule={rule}
            orgType={orgType}
            handleOrgTypeChange={handleOrgTypeChange}
            handlePhoneFormat={handlePhoneFormat}
            normFile={normFile}
            handlePreview={handlePreview}
          />
        );
      case 1:
        return (
          <Step1_Partners
            form={form}
            rule={rule}
            orgType={orgType}
            handlePhoneFormat={handlePhoneFormat}
            normFile={normFile}
            handlePreview={handlePreview}
          />
        );
      case 2:
        return (
          <Step2_LegalDetails
            normFile={normFile}
            handlePreview={handlePreview}
          />
        );
      case 3:
        return (
          <Step3_Branches
            setHasBranch={setHasBranch}
            handlePhoneFormat={handlePhoneFormat}
          />
        );
      case 4:
        return <Step4_Finalize />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#d97706",
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  {isEdit ? "Edit Organisation" : "Add Organisation"}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Step {currentStep + 1} of {STEPS.length}:{" "}
                  {STEPS[currentStep].title}
                </p>
              </div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
                size="middle"
              >
                Exit
              </Button>
            </div>
          }
          bordered={false}
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: "8px",
          }}
        >
          {/* Submit error banner */}
          {submitError && (
            <Alert
              message="Submission Failed"
              description={submitError}
              type="error"
              showIcon
              closable
              onClose={() => setSubmitError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Progress bar + Steps indicator */}
          <div style={{ marginBottom: 32 }}>
            <Progress
              percent={((currentStep + 1) / STEPS.length) * 100}
              strokeColor="#d97706"
              showInfo={false}
              style={{ marginBottom: 16 }}
            />
            <Steps current={currentStep} size="small" items={STEPS} />
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormValueChange}
            autoComplete="off"
            size="middle"
          >
            {/* Step Content */}
            {isEdit && isLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                }}
              >
                <Spin size="large" tip="Loading organisation data..." />
              </div>
            ) : (
              <div style={{ minHeight: "400px" }}>{renderStepContent()}</div>
            )}

            {/* Navigation */}
            <Divider />
            <Form.Item style={{ marginBottom: 0 }}>
              <Space
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  size="large"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  icon={<ArrowLeftOutlined />}
                >
                  Previous
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    htmlType="button"
                    onClick={nextStep}
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    style={{
                      background: "linear-gradient(to right, #f59e0b, #ea580c)",
                      borderColor: "transparent",
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    disabled={isCreating || isUpdating}
                    onClick={handleSubmit}
                    icon={<CheckOutlined />}
                    loading={isCreating || isUpdating}
                    style={{
                      background: "linear-gradient(to right, #10b981, #059669)",
                      borderColor: "transparent",
                    }}
                  >
                    {isEdit ? "Update Organisation" : "Create Organisation"}
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
