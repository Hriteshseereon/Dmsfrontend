import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Checkbox,
  Divider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import moment from "moment";

// --- Data Definitions ---
const initialUserData = [
  {
    key: 1,
    userName: "ADMIN",
    password: "******",
    phone: "123456765",
    address: "Pune",
    email: "das@123gmail.com",
    userType: "Administrator",
    fullName: "KOUSHAL",
    designation: "ADMIN",
    privilegeUser: "ADMIN",
    privilegeType: "Permanent",
    startDate: null,
    endDate: null,
    moduleName: ["Assets", "Admin"],
    subModule: { Assets: ["Reports & Analytics"], Admin: ["Organisation", "Profile Setting"] },
  },
];

const userType = [
  "Administrator",
  "User",
  "Admin",
  "Accounts",
  "HR",
  "Operations",
  "Transport",
  "Broker",
  "Assistant",
];

const moduleOptions = {
  Admin: ["Organisation", "Profile Setting", "User & Role"],
  Purchase: [
    "Purchase Souda",
    "Purchase Indent",
    "Purchase Transit",
    "Purchase Invoice",
    "Purchase Return",
  ],
  Sale: ["Sale Souda", "Sale Indent", "Sale Transit", "Sale Invoice", "Sale Return"],
  Assets: ["Reports & Analytics", "Master"],
  Master: ["Product Master", "Business Partner Master", "Reason Master"],
  Payroll: ["Report"],
};

export default function UserCreationMaster() {
  // --- State Management ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState(initialUserData);

  // Forms for Add, Edit, and View modals
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewForm] = Form.useForm();

  // State for permissions (shared across forms for dynamic rendering)
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedSubModules, setSelectedSubModules] = useState({});
  const [privilegeType, setPrivilegeType] = useState("Permanent");

  // --- Utility Functions ---

  const getFormInstance = () => (isAddModalOpen ? addForm : editForm);

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      typeof val === "string"
        ? val.toLowerCase().includes(searchText.toLowerCase())
        : Array.isArray(val)
        ? val.join(" ").toLowerCase().includes(searchText.toLowerCase())
        : typeof val === "object"
        ? Object.values(val)
            .flat()
            .join(" ")
            .toLowerCase()
            .includes(searchText.toLowerCase())
        : false
    )
  );

  const handleModuleChange = (checkedValues, formInstance) => {
    const currentForm = formInstance || getFormInstance();
    setSelectedModules(checkedValues);
    const updatedSubModules = {};

    // Preserve previously selected submodules for selected modules
    checkedValues.forEach((mod) => {
      // Use existing submodules from state if available, otherwise an empty array
      updatedSubModules[mod] = selectedSubModules[mod] || []; 
    });

    setSelectedSubModules(updatedSubModules);
    currentForm.setFieldsValue({ moduleName: checkedValues, subModule: updatedSubModules });
  };
  
  const handleSubModuleChange = useCallback((module, checkedValues, formInstance) => {
    const currentForm = formInstance || getFormInstance();
    setSelectedSubModules((prev) => {
      const updated = { ...prev, [module]: checkedValues };
      currentForm.setFieldsValue({ subModule: updated });
      return updated;
    });
  }, [addForm, editForm, isAddModalOpen, isEditModalOpen]); // Dependencies now include both forms

  // Helper to reset all form-related states
  const resetAllStates = () => {
    addForm.resetFields();
    editForm.resetFields();
    viewForm.resetFields();
    setSelectedModules([]);
    setSelectedSubModules({});
    setPrivilegeType("Permanent");
    setSelectedRecord(null);
  };
  
  const handleFormSubmit = (values, isEdit = false) => {
    const requiredModules = selectedModules;
    let subModulesValid = true;
    for (const mod of requiredModules) {
      if (!selectedSubModules[mod] || selectedSubModules[mod].length === 0) {
        subModulesValid = false;
        Modal.error({
          title: "Validation Error",
          content: `Please select at least one Sub-Module for the module: ${mod}`,
        });
        return;
      }
    }

    const formattedData = {
      ...values,
      moduleName: selectedModules,
      subModule: selectedSubModules,
      privilegeType: privilegeType,       startDate:
        privilegeType === "Temporary" && values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
      endDate:
        privilegeType === "Temporary" && values.endDate
          ? values.endDate.format("YYYY-MM-DD")
          : null,
      password: isEdit && !values.password ? selectedRecord.password : values.password,
    };

    if (isEdit) {
      setData((prev) =>
        prev.map((item) =>
          item.key === selectedRecord.key
            ? { ...formattedData, key: item.key }
            : item
        )
      );
      setIsEditModalOpen(false);
    } else {
      setData((prev) => [
        ...prev,
        { ...formattedData, key: prev.length > 0 ? prev[prev.length - 1].key + 1 : 1 },
      ]);
      setIsAddModalOpen(false);
    }

    resetAllStates();
  };

  const renderFormFields = (
    disabled = false, 
    currentForm, 
    currentPrivilegeType,
    currentSelectedModules,
    currentSelectedSubModules,
    handleModChange,
    handleSubModChange,
    setPT 
  ) => {
    const formToUse = currentForm;
    const isView = disabled;
    const modulesSource = isView ? currentSelectedModules : currentSelectedModules;
    const subModulesSource = isView ? currentSelectedSubModules : currentSelectedSubModules;
    const privilegeTypeSource = isView ? currentPrivilegeType : currentPrivilegeType;
    
    return (
      <>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="User Name"
              name="userName"
              rules={[{ required: true, message: "Enter User Name" }]}
            >
              <Input placeholder="Enter User Name" disabled={disabled} />
            </Form.Item>
          </Col>
        <Col span={6}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: "Enter Phone Number" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    if (!/^[0-9]+$/.test(value)) {
                      return Promise.reject("Only numbers are allowed");
                    }

                    if (value.length < 10) {
                      return Promise.reject("Phone must be at least 10 digits");
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter Phone"
                disabled={disabled}
                maxLength={10}
                onKeyDown={(e) => {
                  // allow only digits & necessary control keys
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];

                  if (allowedKeys.includes(e.key)) return;

                  if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  e.target.value = cleaned; // force-controlled numeric value
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Enter Address" }]}
            >
              <Input placeholder="Enter Address" disabled={disabled} />
            </Form.Item>
          </Col>
                 <Col span={6}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Enter Email" },
                {
                  type: "email",
                  message: "Enter a valid email address",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    // Additional strict validation if needed
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                    if (!emailRegex.test(value)) {
                      return Promise.reject("Enter a valid email format");
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Enter Email" disabled={disabled} />
            </Form.Item>
          </Col>

        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: !disabled && isAddModalOpen, message: "Enter Password" }]} 
            >
              <Input.Password placeholder={isEditModalOpen ? "Leave blank to keep old password" : "Enter Password"} disabled={disabled && !isAddModalOpen} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="User Type"
              name="userType"
              rules={[{ required: true, message: "Select User Type" }]}
            >
              <Select placeholder="Select User Type" disabled={disabled}>
                <Select.Option value="Administrator">Administrator</Select.Option>
                <Select.Option value="User">User</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Full Name" name="fullName">
              <Input placeholder="Enter Full Name" disabled={disabled} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Date"
              name="date"
            >
              <DatePicker
                style={{ width: "100%" }}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label="Privilege User"
              name="privilegeUser"
              rules={[{ required: true, message: "Select Privilege User" }]}
            >
              <Select placeholder="Select Privilege User Type" disabled={disabled}>
                {userType.map((u, idx) => (
                  <Select.Option key={idx} value={u}>
                    {u}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Privilege Type"
              name="privilegeType"
              rules={[{ required: true, message: "Select Privilege Type" }]}
            >
              <Select
                placeholder="Select Privilege Type"
                disabled={disabled}
                onChange={(value) => {
                  if (setPT) setPT(value); 
                  if (value === "Permanent" && !disabled) {
                    formToUse.setFieldsValue({ startDate: null, endDate: null });
                  }
                }}
              >
                <Select.Option value="Permanent">Permanent</Select.Option>
                <Select.Option value="Temporary">Temporary</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[
                {
                  required: privilegeTypeSource === "Temporary" && !disabled,
                  message: "Select Start Date",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabled={disabled || privilegeTypeSource !== "Temporary"}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                {
                  required: privilegeTypeSource === "Temporary" && !disabled,
                  message: "Select End Date",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabled={disabled || privilegeTypeSource !== "Temporary"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" className="text-amber-700 font-semibold">
          Module & Sub-Module Permissions
        </Divider>

        {/* --- Module Selection (Checkbox.Group) --- */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Module Name"
              name="moduleName"
              rules={[{ required: true, message: "Select at least one Module" }]}
              initialValue={modulesSource}
            >
              <Checkbox.Group
                options={Object.keys(moduleOptions)}
                value={modulesSource}
                onChange={(checkedValues) => handleModChange(checkedValues, formToUse)}
                disabled={disabled}
                className="flex flex-wrap gap-4"
              />
            </Form.Item>
          </Col>
        </Row>

        {modulesSource.length > 0 && (
          <Row gutter={16}>
            <Col span={24}>
              <p className="text-amber-700 font-semibold mb-2">Select Sub-Modules:</p>
            </Col>
          </Row>
        )}

        {/* --- Sub-Module Selection --- */}
        {modulesSource.map((mod) => (
          <Row gutter={16} key={mod}>
            <Col span={24}>
              <Form.Item
                label={<span className="font-medium text-gray-700">{mod} Sub-Modules</span>}
                name={["subModule", mod]}
                rules={[
                  {
                    required: true,
                    message: `Select at least one sub-module for ${mod}`,
                  },
                ]}
                initialValue={subModulesSource[mod] || []}
                className="mb-4"
              >
                <Checkbox.Group
                  options={moduleOptions[mod] || []}
                  value={subModulesSource[mod] || []}
                  onChange={(subs) => handleSubModChange(mod, subs, formToUse)}
                  disabled={disabled}
                  className="flex flex-wrap gap-4"
                />
              </Form.Item>
            </Col>
          </Row>
        ))}
      </>
    );
  };
  
  // --- Table Columns ---
  const columns = [
    {
      title: <span className="text-amber-700 font-semibold">User Name</span>,
      dataIndex: "userName",
      width: 100,
      render: (text, record) => (
        <span className="text-amber-800">
          {text} {record.privilegeType === "Temporary" ? "(T)" : "(P)"}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Validity</span>,
      dataIndex: "startDate",
      width: 100,
      render: (start, record) =>
        record.privilegeType === "Temporary" ? (
          <span className="text-amber-700">
            {record.startDate} - {record.endDate}
          </span>
        ) : (
          <span className="text-amber-700">-</span>
        ),
    },
    {
      title: <span className="text-amber-700 font-semibold">User Type</span>,
      dataIndex: "userType",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Full Name</span>,
      dataIndex: "fullName",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Designation</span>,
      dataIndex: "designation",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Privilege User</span>,
      dataIndex: "privilegeUser",
      width: 100,
      render: (text) => <span className="text-amber-800">{text}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Module</span>,
      dataIndex: "moduleName",
      width: 100,
      render: (modules) => <span className="text-amber-800">{modules.join(", ")}</span>,
    },
    {
      title: <span className="text-amber-700 font-semibold">Sub-Module</span>,
      dataIndex: "subModule",
      width: 100,
      render: (subModule) => (
        <span className="text-amber-800">
          {Object.entries(subModule || {})
            .map(([mod, subs]) => `${subs.join(", ")}`)
            .join("; ")}
        </span>
      ),
    },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 80,
      render: (record) => (
        <div className="flex gap-3">
          {/* View Action */}
          <EyeOutlined
            className="cursor-pointer! text-blue-500!"
            onClick={() => {
              setSelectedRecord(record);
              // Set view form fields
              viewForm.setFieldsValue({
                ...record,
                date: record.startDate ? moment(record.startDate) : null,
                startDate: record.startDate ? moment(record.startDate) : null,
                endDate: record.endDate ? moment(record.endDate) : null,
              });
              setSelectedModules(record.moduleName);
              setSelectedSubModules(record.subModule);
              setPrivilegeType(record.privilegeType);
              setIsViewModalOpen(true);
            }}
          />
          {/* Edit Action */}
          <EditOutlined
            className="cursor-pointer! text-red-500!"
            onClick={() => {
              setSelectedRecord(record);
              // Set edit form fields
              editForm.setFieldsValue({
                ...record,
                date: record.startDate ? moment(record.startDate) : null,
                startDate: record.startDate ? moment(record.startDate) : null,
                endDate: record.endDate ? moment(record.endDate) : null,
              });
              setSelectedModules(record.moduleName);
              setSelectedSubModules(record.subModule);
              setPrivilegeType(record.privilegeType);
              setIsEditModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  // --- JSX Rendering ---
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            className="w-64! placeholder-amber-400! text-amber-700! border-amber-300! "
        
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            className=" text-amber-700! border-amber-300! hover:bg-amber-100!"
            onClick={() => setSearchText("")}
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<DownloadOutlined />}
            className="text-amber-700! border-amber-300! hover:bg-amber-100!"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-amber-500! border-amber-500! hover:bg-amber-600!"
            onClick={() => {
              resetAllStates();
              setIsAddModalOpen(true);
            }}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white border rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-0 text-amber-700">
          User Creation Records
        </h2>
        <p className="text-amber-600 mb-3">Manage your system users</p>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ y: 220 }}
          className="custom-scroll-table mb-0"
        />
      </div>
      <Modal
        title={
          <span className="text-amber-700 font-semibold">
            Add New User
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          resetAllStates();
        }}
        footer={null}
        width={1100}
        maskClosable={false}
      >
        <Form
          layout="vertical"
          form={addForm}
          onFinish={(values) => handleFormSubmit(values, false)}
          initialValues={{
             privilegeType: "Permanent", 
                 }}
        >
          {renderFormFields(
            false, 
            addForm, 
            privilegeType, 
            selectedModules, 
            selectedSubModules, 
            handleModuleChange, 
            handleSubModuleChange,
            setPrivilegeType 
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                resetAllStates();
              }}
              className="border-amber-300! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! border-amber-500! hover:bg-amber-600!"
            >
              Add
            </Button>
          </div>
        </Form>
      </Modal>
        <Modal
        title={
          <span className="text-amber-700! font-semibold!">
            Edit User: {selectedRecord?.userName}
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          resetAllStates();
        }}
        footer={null}
        width={1100}
        maskClosable={false}
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={(values) => handleFormSubmit(values, true)}
        >
          {renderFormFields(
            false, 
            editForm, 
            privilegeType, 
            selectedModules, 
            selectedSubModules, 
            handleModuleChange, 
            handleSubModuleChange,
            setPrivilegeType 
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                resetAllStates();
              }}
              className="border-amber-300! text-amber-700! hover:bg-amber-100!"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-amber-500! border-amber-500! hover:bg-amber-600!"
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title={<span className="text-amber-700 font-semibold">View User: {selectedRecord?.userName}</span>}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          resetAllStates();
        }}
        footer={null}
        width={1100}
      >
        <Form layout="vertical" form={viewForm}>
          {renderFormFields(
            true, 
              viewForm, 
            privilegeType, 
            selectedModules, 
            selectedSubModules, 
            handleModuleChange, 
            handleSubModuleChange,
            null )}
        </Form>
      </Modal>
    </div>
  );
}