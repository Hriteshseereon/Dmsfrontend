import React, { useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Card,
  Tag,
  Divider,
  DatePicker,
} from "antd";
import { useEffect } from "react";
import { getOrganization } from "../../../../../api/organizations";
import useSessionStore from "../../../../../../src/store/sessionStore";

import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";

dayjs.extend(customParseFormat);

const { Option } = Select;

const DATE_FORMAT = "DD/MM/YYYY";

// --- SAMPLE DATA (same shape as before) ---


const typeOptions = [
  { name: "Real Estate", code: "Real Estate" },
  { name: "Distribution", code: "Distribution" },
  { name: "Transport", code: "Transport" },
  { name: "Investment", code: "Investment" },
  { name: "Trading", code: "Trading" },
  { name: "Property", code: "Property" },
  { name: "Pvt Ltd", code: "Pvt Ltd" },
  { name: "Partnership", code: "Partnership" },
  { name: "Public", code: "Public" },
];

const branchType = [
  { name: "Main Branch", code: "main branch" },
  { name: "SubBranch", code: "submain" },
  { name: "Area", code: "area" },
  { name: "Locality", code: "locality" },
];

// --- RENDER SUB-COMPONENTS (for Modals) ---

const RenderOrganisationFields = ({ disabled = false }) => (
  <>
    <h3 className="text-lg font-semibold text-amber-700 mb-2 border-b border-amber-300 pb-1">
      Organisation Information
    </h3>
    <Row gutter={24}>
      <Col span={4}>
        <Form.Item
          label="Org Name"
          name="orgName"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter Organisation Name" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Phone No" name="orgPhoneNo">
          <Input placeholder="Enter Phone Number" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Mobile No" name="orgMobileNo">
          <Input placeholder="Enter Mobile Number" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Address" name="orgAddress">
          <Input.TextArea
            rows={1}
            placeholder="Enter Address"
            disabled={disabled}
          />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Cont. Person" name="contPerson">
          <Input placeholder="Enter Contact Person" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Fax No" name="faxNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="TIN No" name="tinNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item
          label={<span className="text-amber-700">ET Date</span>}
          name="etDate"
        >
          <DatePicker className="w-full" disabled={disabled} format={DATE_FORMAT} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item
          label={<span className="text-amber-700">CST Date</span>}
          name="cstDate"
        >
          <DatePicker className="w-full" disabled={disabled} format={DATE_FORMAT} />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item label="TAN No" name="tanNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="PAN No" name="panNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="FL No" name="flNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="EOL No" name="eolNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Email" name="email">
          <Input placeholder="Enter Email" disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="URL" name="url">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Trade No" name="tradeNo">
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label=" Type" name="type">
          <Select disabled={disabled} placeholder="Select Type">
            {typeOptions.map((option) => (
              <Option key={option.code} value={option.code}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select disabled={disabled} placeholder="Select Status">
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  </>
);

const RenderBranchMaster = ({ disabled = false }) => (
  <>
    <Divider className="my-6" />
    <h3 className="text-lg font-semibold text-amber-700 mb-2 border-b border-amber-300 pb-1">
      Branch Master
    </h3>
    <Form.List name="branches">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, fieldKey, ...restField }, index) => (
            <Card
              key={key}
              title={<span className="text-blue-700">Branch {index + 1}</span>}
              extra={
                !disabled && (
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 hover:text-red-700"
                  />
                )
              }
              style={{ marginBottom: 16, border: "1px solid #7dd3fc" }}
            >
              <Form.Item
                {...restField}
                name={[name, "branchKey"]}
                fieldKey={[fieldKey, "branchKey"]}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Row gutter={24}>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "brShortName"]}
                    fieldKey={[fieldKey, "brShortName"]}
                    label="Short Name"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "branchName"]}
                    fieldKey={[fieldKey, "branchName"]}
                    label="Branch Name"
                    rules={[{ required: true }]}
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "branchHead"]}
                    fieldKey={[fieldKey, "branchHead"]}
                    label="Branch Head"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "address"]}
                    fieldKey={[fieldKey, "address"]}
                    label="Address"
                  >
                    <Input.TextArea rows={1} disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "branchMobileNo"]}
                    fieldKey={[fieldKey, "branchMobileNo"]}
                    label="Mobile No"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "email"]}
                    fieldKey={[fieldKey, "email"]}
                    label="E-Mail"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "state"]}
                    fieldKey={[fieldKey, "state"]}
                    label="State"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "location"]}
                    fieldKey={[fieldKey, "location"]}
                    label="Location"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    fieldKey={[fieldKey, "type"]}
                    label="Type"
                  >
                    <Select disabled={disabled} placeholder="Select Branch Type">
                      {branchType.map((option) => (
                        <Option key={option.code} value={option.code}>
                          {option.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          {!disabled && (
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="border-blue-400 text-blue-700 hover:bg-blue-100"
              >
                Add Branch
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  </>
);

const RenderCompanyDepoMaster = ({ disabled = false }) => (
  <>
    <Divider className="my-6" />
    <h3 className="text-lg font-semibold text-amber-700 mb-2 border-b border-amber-300 pb-1">
      Company Depo Master
    </h3>
    <Form.List name="depos">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, fieldKey, ...restField }, index) => (
            <Card
              key={key}
              title={<span className="text-green-700">Depo {index + 1}</span>}
              extra={
                !disabled && (
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 hover:text-red-700"
                  />
                )
              }
              style={{ marginBottom: 16, border: "1px solid #86efac" }}
            >
              <Form.Item
                {...restField}
                name={[name, "depoKey"]}
                fieldKey={[fieldKey, "depoKey"]}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Row gutter={24}>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "cShortName"]}
                    fieldKey={[fieldKey, "cShortName"]}
                    label="C. Short Name"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "compName"]}
                    fieldKey={[fieldKey, "compName"]}
                    label="Comp Name"
                    rules={[{ required: true }]}
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "address"]}
                    fieldKey={[fieldKey, "address"]}
                    label="Address"
                  >
                    <Input.TextArea rows={1} disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "phoneNo"]}
                    fieldKey={[fieldKey, "phoneNo"]}
                    label="Phone No"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "faxNo"]}
                    fieldKey={[fieldKey, "faxNo"]}
                    label="Fax No"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "email"]}
                    fieldKey={[fieldKey, "email"]}
                    label="E-Mail"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "transactionType"]}
                    fieldKey={[fieldKey, "transactionType"]}
                    label="Transaction Type"
                  >
                    <Select disabled={disabled} placeholder="Select Type">
                      <Option value="Super Stockist">Super Stockist</Option>
                      <Option value="Depo">Depo</Option>
                      <Option value="Factory">Factory</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "tranStatus"]}
                    fieldKey={[fieldKey, "tranStatus"]}
                    label="Tran. Status"
                  >
                    <Select disabled={disabled} placeholder="Select Status">
                      <Option value="Inside">Inside</Option>
                      <Option value="Outside">Outside</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "igstApplicable"]}
                    fieldKey={[fieldKey, "igstApplicable"]}
                    label="IGST Applicable"
                  >
                    <Select disabled={disabled} placeholder="Select Yes/No">
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "state"]}
                    fieldKey={[fieldKey, "state"]}
                    label="State"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "location"]}
                    fieldKey={[fieldKey, "location"]}
                    label="Location"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "seriesName"]}
                    fieldKey={[fieldKey, "seriesName"]}
                    label="Series Name"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "depoHead"]}
                    fieldKey={[fieldKey, "depoHead"]}
                    label="Depo Head"
                  >
                    <Input disabled={disabled} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    fieldKey={[fieldKey, "type"]}
                    label="Type"
                  >
                    <Select disabled={disabled} placeholder="Select Depo Type">
                      {branchType.map((option) => (
                        <Option key={option.code} value={option.code}>
                          {option.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          {!disabled && (
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="border-green-400 text-green-700 hover:bg-green-100"
              >
                Add Company Depo
              </Button>
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  </>
);

// --- MAIN PAGE COMPONENT ---

export default function Organisation() {
  const navigate = useNavigate();
  const { currentOrgId } = useSessionStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  const [editForm] = Form.useForm();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedViewRecord, setSelectedViewRecord] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const tableData = useMemo(
    () =>
      data.map((org) => ({
        ...org,
        orgEmail: org.email,
      })),
    [data]
  );
  useEffect(() => {
    if (!currentOrgId) return;

    const fetchOrganisation = async () => {
      setLoading(true);
      try {
        const res = await getOrganization(currentOrgId);
console.log("ORG API RESPONSE:", res);
        const formattedData = {
          key: res.id,
          orgName: res.registered_name,
          orgPhoneNo: res.phone_number_1?.toString() || "",
          contPerson: res.contact_person,
          orgAddress: res.address?.address_line_1 || "",
          organisation_type: res.organisation_type,
          email: res.email,
          status: res.status || "Active",

          branches: res.branches?.map((b) => ({
            branchKey: b.id,
            brShortName: b.short_name,
            branchName: b.name,
            address: b.address?.address_line_1 || "",
            branchHead: b.branch_head_name,
            branchMobileNo: b.phone_number_1 ? String(b.phone_number_1) : "",
            email: b.email ? String(b.email) : "",

            state: b.state,
            location: b.location,
            type: b.type,
          })) || [],

          depos: res.depos?.map((d) => ({
            depoKey: d.id,
            cShortName: d.short_name,
            compName: d.company_name,
            address: d.address?.address_line_1 || "",
            phoneNo: d.phone_number,
            email: d.email,
            state: d.state,
            location: d.location,
          })) || [],
        };

        setData([formattedData]); // ✅ show only clicked org
      } catch (err) {
        console.error("Organisation fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisation();
  }, [currentOrgId]);

const filteredData = tableData.filter((item) => {
  const search = searchText.toLowerCase();

  return (
    item.orgName?.toLowerCase().includes(search) ||
    item.orgPhoneNo?.toString().toLowerCase().includes(search) ||
    item.orgEmail?.toLowerCase().includes(search) ||
   

    (item.branches || []).some((b) =>
      b.branchName?.toLowerCase().includes(search)
    ) ||

    (item.depos || []).some((d) =>
      d.compName?.toLowerCase().includes(search)
    )
  );
});

  // --- Handlers ---

  const handleAdd = () => {
    // navigate to your AddOrganisation page
    navigate("/organisation/add"); // change path if needed
  };

  const handleEdit = (record) => {
    setSelectedEditRecord(record);
    const recordWithDayjs = {
      ...record,
      etDate: record.etDate ? dayjs(record.etDate, DATE_FORMAT) : null,
      cstDate: record.cstDate ? dayjs(record.cstDate, DATE_FORMAT) : null,
    };
    editForm.setFieldsValue(recordWithDayjs);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedViewRecord(record);
    setIsViewModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEditRecord(null);
    editForm.resetFields();
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedViewRecord(null);
  };

  const handleFormSubmit = (values, mode) => {
    const formattedValues = {
      ...values,
      etDate: values.etDate ? values.etDate.format(DATE_FORMAT) : null,
      cstDate: values.cstDate ? values.cstDate.format(DATE_FORMAT) : null,
    };

    const newRecord = {
      ...formattedValues,
      status: formattedValues.status || "Active",
      branches: formattedValues.branches || [],
      depos: formattedValues.depos || [],
    };

    if (mode === "edit" && selectedEditRecord) {
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedEditRecord.key
            ? {
              ...newRecord,
              key: item.key,
              branches: newRecord.branches.map((b) => ({
                ...b,
                branchKey: b.branchKey || Date.now() + Math.random(),
              })),
              depos: newRecord.depos.map((d) => ({
                ...d,
                depoKey: d.depoKey || Date.now() + Math.random() * 2,
              })),
            }
            : item
        )
      );
      handleCloseEditModal();
    }
  };

  // --- Expanded Row (Branches + Depos) ---

  const expandedRowRender = (record) => {
    const branchesWithKeys = record.branches.map((b) => ({
      ...b,
      key: b.branchKey,
    }));
    const deposWithKeys = record.depos.map((d) => ({
      ...d,
      key: d.depoKey,
    }));

    const branchColumns = [
      {
        title: (
          <span className="font-semibold text-amber-800">Short Name</span>
        ),
        dataIndex: "brShortName",
        key: "brShortName",
        width: 100,
        render: (text) => <span className="text-amber-800">{text}</span>,
      },
      {
        title: <span className="font-semibold text-amber-800">Name</span>,
        dataIndex: "branchName",
        key: "branchName",
        width: 150,
        render: (text) => (
          <span className="text-amber-800 font-medium">{text}</span>
        ),
      },

      {
        title: <span className="font-semibold text-amber-800">Address</span>,
        dataIndex: "address",
        key: "address",
        ellipsis: true,
        width: 150,
        render: (text) => <span className="text-amber-800">{text}</span>,
      },
      // {
      //   title: (
      //     <span className="font-semibold text-amber-800">Mobile No</span>
      //   ),
      //   dataIndex: "branchMobileNo",
      //   key: "branchMobileNo",
      //   width: 150,
      //   render: (text) => <span className="text-amber-800">{text}</span>,
      // },
      // {
      //   title: <span className="font-semibold text-amber-800">E-Mail</span>,
      //   dataIndex: "email",
      //   key: "email",
      //   width: 200,
      //   render: (text) => <span className="text-amber-800">{text}</span>,
      // }


    ];

    const depoColumns = [
      {
        title: (
          <span className="font-semibold text-amber-800">Short Name</span>
        ),
        dataIndex: "cShortName",
        key: "cShortName",
        width: 150,
        render: (text) => <span className="text-amber-800">{text}</span>,
      },
      {
        title: (
          <span className="font-semibold text-amber-800">Company Name</span>
        ),
        dataIndex: "compName",
        key: "compName",
        width: 150,
        render: (text) => (
          <span className="text-amber-800 font-medium">{text}</span>
        ),
      },
      {
        title: <span className="font-semibold text-amber-800">Address</span>,
        dataIndex: "address",
        key: "address",
        ellipsis: true,
        width: 150,
        render: (text) => <span className="text-amber-800">{text}</span>,
      },
      {
        title: (
          <span className="font-semibold text-amber-800">Phone No</span>
        ),
        dataIndex: "phoneNo",
        key: "phoneNo",
        width: 150,
        render: (text) => <span className="text-amber-800">{text}</span>,
      },
    ];

    return (
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
        <h2 className="text-lg font-semibold text-amber-700 mb-2 border-b border-amber-300 pb-1">
          Associated Branches ({branchesWithKeys.length})
        </h2>
        <Table
          columns={branchColumns}
          dataSource={branchesWithKeys}
          pagination={false}
          scroll={{ y: 200 }}
          className="custom-scroll-table mb-0"
          rowClassName={() => "bg-amber-100/50 hover:bg-amber-100"}
          size="small"
        />

        {/* <h2 className="text-lg font-semibold text-amber-700 mt-4 mb-2 border-b border-amber-300 pb-1">
          Associated Company Depos ({deposWithKeys.length})
        </h2>
        <Table
          columns={depoColumns}
          dataSource={deposWithKeys}
          pagination={false}
          scroll={{ y: 200 }}
          className="custom-scroll-table mb-0"
          rowClassName={() => "bg-amber-100/50 hover:bg-amber-100"}
          size="small"
        /> */}
      </div>
    );
  };

  // --- COLUMNS (NO ADDRESS / EMAIL IN MAIN TABLE) ---

  const columns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">
          Organisation Name
        </span>
      ),
      dataIndex: "orgName",
      width: 200,
      render: (text) => (
        <span className="text-amber-800 font-semibold">{text}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Organisation Type</span>
      ),
      dataIndex: "organisation_type",
      width: 120,
      render: (text) => (
        <span className="text-amber-800 font-medium">{text}</span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Phone No</span>
      ),
      dataIndex: "orgPhoneNo",
      width: 120,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },

    {
      title: (
        <span className="text-amber-700 font-semibold">
          Branches 
        </span>
      ),
      dataIndex: "nestedCount",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <span className="text-amber-700 font-medium">
            BR: {record.branches.length}
          </span>
          {/* <span className="text-amber-700 font-medium">
            DP: {record.depos.length}
          </span> */}
        </div>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Status</span>
      ),
      dataIndex: "status",
      width: 90,
      render: (status) => {
        const color = status === "Active" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: (
        <span className="text-amber-700 font-semibold">Actions</span>
      ),
      width: 90,
      fixed: "right",
      render: (record) => (
        <div className="flex gap-3">
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => handleView(record)}
          />
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => handleEdit(record)}
          />
        </div>
      ),
    },
  ];

  // --- MODALS ---

  const EditOrganisationModal = () => (
    <Modal
      title={
        <span className="text-amber-700 font-semibold">
          Edit Organisation
        </span>
      }
      open={isEditModalOpen}
      onCancel={handleCloseEditModal}
      footer={null}
      width={1200}
      style={{ top: 20 }}
    >
      <Form
        layout="vertical"
        form={editForm}
        onFinish={(values) => handleFormSubmit(values, "edit")}
        className="max-h-[80vh] overflow-y-auto pr-4"
      >
        <RenderOrganisationFields />
        <RenderBranchMaster />
        <RenderCompanyDepoMaster />

        <div className="flex justify-end gap-2 mt-4 sticky bottom-0 bg-white pt-4 border-t">
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-amber-500 border-amber-500 hover:bg-amber-600"
          >
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );

  const ViewOrganisationModal = () => (
    <Modal
      title={
        <span className="text-amber-700 font-semibold">
          View Organisation Details
        </span>
      }
      open={isViewModalOpen}
      onCancel={handleCloseViewModal}
      footer={[
        <Button key="close" onClick={handleCloseViewModal}>
          Close
        </Button>,
      ]}
      width={1200}
      style={{ top: 20 }}
    >
      <Form
        layout="vertical"
        initialValues={{
          ...selectedViewRecord,
          etDate: selectedViewRecord?.etDate
            ? dayjs(selectedViewRecord.etDate, DATE_FORMAT)
            : null,
          cstDate: selectedViewRecord?.cstDate
            ? dayjs(selectedViewRecord.cstDate, DATE_FORMAT)
            : null,
        }}
        className="max-h-[80vh] overflow-y-auto pr-4"
      >
        <RenderOrganisationFields disabled />
        <RenderBranchMaster disabled />
        <RenderCompanyDepoMaster disabled />
      </Form>
    </Modal>
  );

  // --- MAIN RENDER ---

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-amber-700 font-semibold">
              Organisation Master
            </span>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64! placeholder-amber-400! text-amber-700! border-amber-300! "

              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-amber-500! border-amber-500! hover:bg-amber-600!"
                onClick={handleAdd}
              >
                Add
              </Button>
            </div>
          </div>
        }
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          expandable={{ expandedRowRender }}
          pagination={false}
          scroll={{ x: 800 }}
          rowKey="key"
        />

      </Card>

      <EditOrganisationModal />
      <ViewOrganisationModal />
    </div>
  );
}
