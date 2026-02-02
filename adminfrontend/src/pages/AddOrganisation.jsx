import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Upload,
  Radio,
  InputNumber,
  Divider,
  Checkbox,
  message as antMessage,
  DatePicker,
  Steps,
  Progress,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import LocationPicker from "../modules/DMS/helpers/LocationPicker.jsx";
import { useCreateOrganization } from "../queries/useCreateOrganization.js";
import { useNavigate, useParams } from "react-router-dom";
import { useGetOrganization } from "../queries/useGetOrganization.js";
import { useUpdateOrganization } from "../queries/useUpdateOrganization.js";
const { Option } = Select;
const { TextArea } = Input;

const ORG_RULES = {
  PRIVATE_LIMITED: {
    label: "Director",
    askCount: true,
    showPercent: true,
    company_website: true,
  },
  LLP: {
    label: "Partner",
    askCount: true,
    showPercent: true,
    company_website: true,
  },
  Partnership: {
    label: "Partner",
    askCount: true,
    showPercent: true,
    company_website: true,
  },
  Proprietorship: { label: "Proprietor", askCount: false, showPercent: false },
  OPC: { label: "One Person Company", askCount: false, showPercent: false },
};

const SHOW_COMPANY_DETAILS_FOR = ["PRIVATE_LIMITED", "LLP", "Partnership"];

const modulesList = [
  { id: "DMS", label: "DMS", description: "Distributed Management System" },
  { id: "AMS", label: "AMS", description: "Asset Management System" },
  { id: "WMS", label: "WMS", description: "Wealth Management System" },
  // {
  //   id: "HRMS",
  //   label: "HRMS",
  //   description: "Human Resource Management System",
  // },
];

export default function AddOrganisation() {
  const { orgId } = useParams();
  const isEdit = Boolean(orgId);
  const { data: orgData, isLoading } = useGetOrganization(orgId);
  const { mutate: updateOrg, isPending: isUpdating } = useUpdateOrganization();
  const { mutate: createOrg, isPending: isCreating } = useCreateOrganization();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [orgType, setOrgType] = useState("");
  const [hasBranch, setHasBranch] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const rule = ORG_RULES[orgType];
  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);
  const navigate = useNavigate();

  const steps = [
    { title: "Organisation", description: "Basic Details" },
    { title: "Partners/Directors", description: rule?.label || "Details" },
    { title: "Legal Details", description: "Documents" },
    { title: "Branch", description: "Locations" },
    { title: "Finalize", description: "Modules & Review" },
  ];

  const mapOrgToForm = (org) => ({
    registeredName: org.registered_name,
    organisationType: org.organisation_type,
    phone: org.phone_number_1,
    phone2: org.phone_number_2,
    email: org.email,
    secondaryEmail: org.secondary_email,

    organisationAddress: {
      address: org.addresses?.[0]?.address_line_1,
      address2: org.addresses?.[0]?.address_line_2,
      city: org.addresses?.[0]?.city,
      state: org.addresses?.[0]?.state,
      pin: org.addresses?.[0]?.pin_code,
    },

    partners: org.persons?.map((p) => ({
      name: p.full_name,
      email: p.email,
      mobileNumber: p.phone_number_1,
      whatsappNumber: p.whatsapp_number,
      gender: p.gender,
    })),

    hasBranch: org.branches?.length > 0,
    branches: org.branches?.map((b) => ({
      branchName: b.name,
      shortName: b.short_name,
      city: b.address?.city,
      state: b.address?.state,
      pinNo: b.address?.pin_code,
    })),

    ...org.modules?.reduce((acc, m) => {
      acc[`module_${m}`] = true;
      return acc;
    }, {}),
  });

  useEffect(() => {
    if (orgData && isEdit) {
      const values = mapOrgToForm(orgData);

      form.setFieldsValue(values);

      setOrgType(values.organisationType);
      setHasBranch(values.hasBranch);
      setCurrentStep(0);
    }
  }, [orgData, isEdit]);



  const handleOrgTypeChange = (value) => {
    setOrgType(value);
    if (ORG_RULES[value].askCount) {
      form.setFieldsValue({ partners: [] });
    } else {
      form.setFieldsValue({ partners: [{}] });
    }
  };

  const nextStep = async () => {
    try {
      // Validate current step fields
      const fieldsToValidate = getFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      antMessage.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['registeredName', 'phone', 'phone2', 'email', 'secondaryEmail',
          ['organisationAddress', 'address'], ['organisationAddress', 'city'],
          ['organisationAddress', 'state'], ['organisationAddress', 'pin'],
          'businessLocation', 'organisationType'];
        return [];
      case 1:
        return orgType ? ["partners"] : [];
      case 2:
        return []; // Legal details are optional
      case 3:
        return hasBranch ? ["branches"] : [];
      default:
        return [];
    }
  };
  // add a payload builder to handle file uploads and nested structures
  const buildPayload = (values) => {
    return {
      // ================= ORG CORE =================
      registered_name: values.registeredName ?? "",
      rms_org_id: values.rmsOrgId ?? null,

      organisation_type: values.organisationType ?? "",
      // legal_type: values.organisationType ?? "",

      phone_number_1: values.phone ?? "",
      phone_number_2: values.phone2 ?? null,

      email: values.email ?? "",
      secondary_email: values.secondaryEmail ?? null,

      is_active: true,

      // ================= HQ ADDRESS =================
      addresses: [
        {
          address_line_1: values?.organisationAddress?.address ?? "",
          address_line_2: values?.organisationAddress?.address2 ?? "",
          city: values?.organisationAddress?.city ?? "",
          state: values?.organisationAddress?.state ?? "",
          pin_code: values?.organisationAddress?.pin ?? "",
          country: "India",

          address_type: "OWN",
          address_category: "HQ",
          is_branch: false,
        },
      ],

      // ================= PERSONS =================
      persons: (values.partners ?? []).map((p) => ({
        full_name: p?.name ?? "",
        role:
          values.organisationType === "pvt"
            ? "DIRECTOR"
            : values.organisationType === "LLP" ||
              values.organisationType === "partnership"
              ? "PARTNER"
              : "PROPRIETOR",

        phone_number_1: p?.mobileNumber || p?.contactNumber || null,
        phone_number_2: null,
        whatsapp_number: p?.whatsappNumber ?? null,

        email: p?.email ?? null,
        gender: p?.gender ?? null,

        // ---------- FAMILY ----------
        family_details: {
          spouse_name: p?.spouseName ?? null,
          children_details:
            p?.childrenCount !== undefined ? String(p.childrenCount) : null,
          parents_details: p?.fatherName ?? null,
        },

        // ---------- BANK ----------
        bank_details: {
          bank_name: p?.bankName ?? null,
          account_holder_name: p?.name ?? null,
          account_number: p?.accountNo ?? null,
          ifsc_code: p?.ifsc ?? null,
          branch_name: p?.bankBranch ?? null,
        },

        // ---------- COMPANY ----------
        company_details: p?.companyDetails
          ? {
            company_name: p.companyDetails.companyName ?? null,
            registration_no: p.companyDetails.registrationNo ?? null,
            gst_no: p.companyDetails.gstNo ?? null,
            address: p.companyDetails.address?.city ?? null,
            location: p.companyDetails.address?.state ?? null,
          }
          : null,
      })),

      // ================= BRANCHES =================
      branches: values.hasBranch
        ? (values.branches ?? []).map((b) => ({
          name: b?.branchName ?? "",
          short_name: b?.shortName ?? "",
          phone_number_1: null,
          email: null,
          // type: "HQ",

          address: {
            address_line_1: b?.address1 ?? "",
            address_line_2: b?.address2 ?? "",
            city: b?.city ?? "",
            state: b?.state ?? "",
            pin_code: b?.pinNo ?? "",
            country: "India",
            address_type: "RENTED",
          },
        }))
        : [],

      // ================= DEPOS =================
      depos: [],

      // ================= MODULES =================
      modules_input: modulesList
        .filter((m) => values[`module_${m.id}`])
        .map((m) => m.id),
    };
  };

  const handleSubmit = () => {
    setSubmitError(null);

    const values = form.getFieldsValue(true);
    const payload = buildPayload(values);

    if (isEdit) {
      updateOrg(
        { id: orgId, data: payload },
        {
          onSuccess: () => {
            antMessage.success("Organisation updated successfully");
          },
          onError: (error) => {
            antMessage.error("Failed to update organisation");
            console.error("Update Organization Error:", error);
          },
        },
      );
    } else {
      createOrg(payload, {
        onSuccess: () => {
          antMessage.success("Organisation created successfully");
        },
        onError: (error) => {
          antMessage.error("Failed to create organisation");
          console.error("Create Organisation Error:", error);
        }
      });
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Step 0: Organisation Details
  const renderOrganisationDetails = () => (
    <>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Registered Name"
            name="registeredName"
            rules={[
              { required: true, message: "Please enter registered name" },
            ]}
          >
            <Input placeholder="Enter registered name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: "Please enter phone number" },
            {
              pattern: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit mobile number",
            }]}
          >
            <Input placeholder="Enter phone number" maxLength={10} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Alternate Phone Number"
            name="phone2"
            rules={[{ message: "Please enter phone number" }]}
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
            rules={[{ message: "Please select location" }]}
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
              <Option value="PRIVATE_LIMITED">Private Limited (Pvt Ltd)</Option>
              <Option value="LLP">LLP</Option>
              <Option value="OPC">OPC</Option>
              <Option value="Partnership">Partnership</Option>
              <Option value="Proprietorship">Proprietor</Option>
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
    </>
  );

  // Step 1: Partner/Director Details
  const renderPartnerDetails = () => {
    if (!orgType) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#999", fontSize: "16px" }}>
            Please select an organisation type in the previous step
          </p>
        </div>
      );
    }

    return (
      <Form.List name="partners" initialValue={rule?.askCount ? [] : [{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16, border: "1px solid #fef3c7" }}
                title={`${rule.label} ${name + 1}`}
                extra={
                  rule.askCount &&
                  fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ color: "#ef4444", cursor: "pointer" }}
                    />
                  )
                }
              >
                <Divider
                  orientation="left"
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                    marginTop: 0,
                  }}
                >
                  Director Personal Details
                </Divider>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label={`${rule.label} Name`}
                      name={[name, "name"]}
                      rules={[{ message: "Please enter name" }]}
                    >
                      <Input placeholder="Enter name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Email"
                      name={[name, "email"]}
                      rules={[{ type: "email", message: "Invalid email" }]}
                    >
                      <Input placeholder="Enter email" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Secondary Email"
                      name={[name, "email2"]}
                      rules={[{ type: "email", message: "Invalid email" }]}
                    >
                      <Input placeholder="Enter secondary email" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Contact Number"
                      name={[name, "contactNumber"]}
                    >
                      <Input placeholder="Enter contact number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Mobile Number"
                      name={[name, "mobileNumber"]}
                    >
                      <Input placeholder="Enter mobile number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="WhatsApp Number"
                      name={[name, "whatsappNumber"]}
                    >
                      <Input placeholder="Enter WhatsApp number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Gender"
                      name={[name, "gender"]}
                    >
                      <Radio.Group>
                        <Radio value="Male">Male</Radio>
                        <Radio value="Female">Female</Radio>
                        <Radio value="Other">Other</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Date of Birth"
                      name={[name, "dob"]}
                      rules={[
                        {
                          message: "Please select date of birth",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Select DOB"
                        format="DD-MM-YYYY"
                      />
                    </Form.Item>
                  </Col>

                  {rule.showPercent && (
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label="% of Interest"
                        name={[name, "percentage"]}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: "100%" }}
                          placeholder="Enter percentage"
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Father Name"
                      name={[name, "fatherName"]}
                    >
                      <Input placeholder="Enter father name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Spouse Name"
                      name={[name, "spouseName"]}
                    >
                      <Input placeholder="Enter spouse name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Number of Children"
                      name={[name, "childrenCount"]}
                    >
                      <InputNumber
                        min={0}
                        placeholder="0"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Divider
                    orientation="left"
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      marginTop: 0,
                    }}
                  >
                    Director Address
                  </Divider>
                  <Col xs={24}>
                    <Divider orientation="left" plain>
                      Current Address
                    </Divider>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line1"
                      name={[name, "currentAddress", "address1"]}
                    >
                      <Input placeholder="Address line1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line2"
                      name={[name, "currentAddress", "address2"]}
                    >
                      <Input placeholder="Address line2" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="City"
                      name={[name, "currentAddress", "city"]}
                    >
                      <Input placeholder="City" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="State"
                      name={[name, "currentAddress", "state"]}
                    >
                      <Input placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="PIN"
                      name={[name, "currentAddress", "pin"]}
                    >
                      <Input placeholder="PIN" maxLength={6} />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Divider orientation="left" plain>
                      Permanent Address
                    </Divider>
                    <Form.Item
                      {...restField}
                      name={[name, "isPermanentAddressSame"]}
                      valuePropName="checked"
                    >
                      <Checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            const currentAddress = form.getFieldValue([
                              "partners",
                              name,
                              "currentAddress",
                            ]);
                            form.setFieldsValue({
                              partners: {
                                [name]: {
                                  permanentAddress: currentAddress || {},
                                },
                              },
                            });
                          } else {
                            form.setFieldsValue({
                              partners: {
                                [name]: {
                                  permanentAddress: {},
                                },
                              },
                            });
                          }
                        }}
                      >
                        {" "}
                        Same as Current Address{" "}
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line1"
                      name={[name, "permanentAddress", "address1"]}
                    >
                      <Input placeholder="Address line1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      {...restField}
                      label="Address Line2"
                      name={[name, "permanentAddress", "address2"]}
                    >
                      <Input placeholder="Address line2" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="City"
                      name={[name, "permanentAddress", "city"]}
                    >
                      <Input placeholder="City" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="State"
                      name={[name, "permanentAddress", "state"]}
                    >
                      <Input placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      label="PIN"
                      name={[name, "permanentAddress", "pin"]}
                    >
                      <Input placeholder="PIN" maxLength={6} />
                    </Form.Item>
                  </Col>
                  <Divider
                    orientation="left"
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      marginTop: 0,
                    }}
                  >
                    Director Documents
                  </Divider>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        label={<span>Passport Size Photo</span>}
                        name={[name, "photo"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload beforeUpload={() => false}>
                          <Button
                            icon={<UploadOutlined />}
                            style={{ borderRadius: "6px" }}
                          >
                            Upload Photo
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={<span s>Aadhaar Number</span>}
                        name={[name, "adharNo"]}
                      >
                        <Input
                          placeholder="1234 5678 9012"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Form.Item
                        {...restField}
                        label={<span>Aadhaar Document</span>}
                        name={[name, "adharDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload beforeUpload={() => false}>
                          <Button style={{ borderRadius: "6px" }}>
                            Upload Aadhaar
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={<span>PAN Number</span>}
                        name={[name, "panNo"]}
                      >
                        <Input
                          placeholder="ABCDE1234F"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={<span>PAN Document</span>}
                        name={[name, "panDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload beforeUpload={() => false}>
                          <Button style={{ borderRadius: "6px" }}>
                            Upload PAN
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        {...restField}
                        label={<span>GST Number</span>}
                        name={[name, "gstNo"]}
                      >
                        <Input
                          placeholder="22AAAAA0000A1Z5"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                      <Form.Item
                        {...restField}
                        label={
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            GST Document
                          </span>
                        }
                        name={[name, "gstDocument"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload beforeUpload={() => false}>
                          <Button style={{ borderRadius: "6px" }}>
                            Upload GST
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider
                    orientation="left"
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Bank Details
                  </Divider>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        {...restField}
                        label={<span>Bank Name</span>}
                        name={[name, "bankName"]}
                      >
                        <Input
                          placeholder="Enter bank name"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        {...restField}
                        label={<span>Account Number</span>}
                        name={[name, "accountNo"]}
                      >
                        <Input
                          placeholder="Enter account number"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        {...restField}
                        label={<span>IFSC Code</span>}
                        name={[name, "ifsc"]}
                      >
                        <Input
                          placeholder="SBIN0001234"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        {...restField}
                        label={<span>Branch Name</span>}
                        name={[name, "branchName"]}
                      >
                        <Input
                          placeholder="Enter branch name"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {SHOW_COMPANY_DETAILS_FOR.includes(orgType) && (
                    <>
                      <Divider
                        orientation="left"
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Director Associate Company Details
                      </Divider>

                      <Row gutter={[16, 16]}>
                        {rule.company_website && (
                          <Col xs={24} sm={6}>
                            <Form.Item
                              {...restField}
                              label={
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  Company Website
                                </span>
                              }
                              name={[name, "companyWebsite"]}
                            >
                              <Input
                                placeholder="https://www.example.com"
                                style={{ borderRadius: "6px" }}
                              />
                            </Form.Item>
                          </Col>
                        )}

                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            label={<span>Company Certificate</span>}
                            name={[name, "documents"]}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                          >
                            <Upload beforeUpload={() => false} multiple>
                              <Button
                                icon={<UploadOutlined />}
                                style={{ borderRadius: "6px" }}
                              >
                                Upload Certificate
                              </Button>
                            </Upload>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label={<span>Company Name</span>}
                            name={[name, "companyDetails", "companyName"]}
                          >
                            <Input
                              placeholder="Enter company name"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label={<span>Registration Number</span>}
                            name={[name, "companyDetails", "registrationNo"]}
                          >
                            <Input
                              placeholder="Enter registration number"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label={<span>Company GST Number</span>}
                            name={[name, "companyDetails", "gstNo"]}
                          >
                            <Input
                              placeholder="22AAAAA0000A1Z5"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label={<span>City</span>}
                            name={[name, "companyDetails", "address", "city"]}
                          >
                            <Input
                              placeholder="Enter city"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <Form.Item
                            {...restField}
                            label={<span>State</span>}
                            name={[name, "companyDetails", "address", "state"]}
                          >
                            <Input
                              placeholder="Enter state"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={4}>
                          <Form.Item
                            {...restField}
                            label={<span>PIN Code</span>}
                            name={[name, "companyDetails", "address", "pin"]}
                          >
                            <Input
                              maxLength={6}
                              placeholder="123456"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Row>
              </Card>
            ))}
            {rule.askCount && (
              <Button
                type="dashed"
                onClick={() => add({})}
                icon={<PlusOutlined />}
                block
              >
                Add {rule.label}
              </Button>
            )}
          </>
        )}
      </Form.List>
    );
  };

  // Step 2: Legal Details
  const renderLegalDetails = () => (
    <Row gutter={[16, 8]}>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="TIN No" name="tinNo">
          <Input placeholder="Enter TIN" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="TIN Document"
          name="tinDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="PAN No" name="panNo">
          <Input placeholder="Enter PAN" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="PAN Document"
          name="panDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="GSTIN" name="gstin">
          <Input placeholder="Enter GSTIN" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="GSTIN Document"
          name="gstinDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="ET No" name="etNo">
          <Input placeholder="Enter ET No" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="ET Document"
          name="etDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="CST No" name="cstNo">
          <Input placeholder="Enter CST" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="CST Document"
          name="cstDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="Udyam Certificate No" name="udyamNo">
          <Input placeholder="Udyam No" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Udyam Document"
          name="udyamDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="MSME Certificate No" name="msmeNo">
          <Input placeholder="MSME No" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="MSME Document"
          name="msmeDocument"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="Trade License No" name="tradeNo">
          <Input placeholder="Trade No" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Edible Certificate"
          name="edibleCertificate"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload Document
            </Button>
          </Upload>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item
          label="Startup India Certificate"
          name="startupIndiaCertificate"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload beforeUpload={() => false}>
            <Button icon={<UploadOutlined />} size="small">
              Upload Document
            </Button>
          </Upload>
        </Form.Item>
      </Col>
    </Row>
  );

  // Step 3: Branch Details
  const renderBranchDetails = () => (
    <>
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
                        <Col xs={12} sm={6} md={4}>
                          <Form.Item
                            {...restField}
                            label="Short Name"
                            name={[name, "shortName"]}
                            rules={[{ max: 2, message: "Max 2 chars" }]}
                          >
                            <Input placeholder="2 chars" maxLength={2} />
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
                          >
                            <Input placeholder="State" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                          <Form.Item
                            {...restField}
                            label="PIN No"
                            name={[name, "pinNo"]}
                          >
                            <Input placeholder="PIN" />
                          </Form.Item>
                        </Col>
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
                                        >
                                          <Input
                                            placeholder="Contact no"
                                            size="small"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={10} sm={7}>
                                        <Form.Item
                                          {...cRestField}
                                          label="Email"
                                          name={[cName, "email"]}
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

  // Step 4: Finalize (Modules & Additional Info)
  const renderFinalize = () => (
    <>
      <Divider orientation="left" style={{ color: "#d97706", fontWeight: 600 }}>
        Enable Modules
      </Divider>
      <Row gutter={[16, 8]}>
        {modulesList.map((module) => (
          <Col xs={24} sm={12} md={6} key={module.id}>
            <Form.Item
              name={`module_${module.id}`}
              valuePropName="checked"
              className="mb-0"
            >
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
                  <Checkbox />
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
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Divider
        orientation="left"
        style={{ color: "#d97706", fontWeight: 600, marginTop: 24 }}
      >
        Additional Information
      </Divider>
      <Row gutter={[16, 8]}>
        <Col xs={24}>
          <Form.Item label="Remarks" name="remarks">
            <TextArea rows={4} placeholder="Optional notes or remarks" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderOrganisationDetails();
      case 1:
        return renderPartnerDetails();
      case 2:
        return renderLegalDetails();
      case 3:
        return renderBranchDetails();
      case 4:
        return renderFinalize();
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
                  Add Organisation
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Step {currentStep + 1} of {steps.length}:{" "}
                  {steps[currentStep].title}
                </p>
              </div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
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

          {/* Progress Bar */}
          <div style={{ marginBottom: 32 }}>
            <Progress
              percent={((currentStep + 1) / steps.length) * 100}
              strokeColor="#d97706"
              showInfo={false}
              style={{ marginBottom: 16 }}
            />
            <Steps current={currentStep} size="small" items={steps} />
          </div>

          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            size="middle"
          >
            {/* Step Content */}
            

            {
              (isEdit && isLoading) ? (
                // make it in centered container
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                  <Spin size="large" tip="Loading organisation data..." />
                </div>
              ) : <div style={{ minHeight: "400px" }}>{renderStepContent()}</div>
            }

            {/* Navigation Buttons */}
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

                {currentStep < steps.length - 1 ? (
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
