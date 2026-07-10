import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  AutoComplete,
  Row,
  Col,
  Card,
  Tag,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";

// TODO: point these at your actual API module, e.g. "../../../../../api/whatsappgroup"
import {
  getAllWhatsappGroups,
  addWhatsappGroup,
  getWhatsappGroupById,
  updateWhatsappGroup,
  deleteWhatsappGroup,
  getGroupMembers,
  addGroupMember,
  getGroupMemberById,
  updateGroupMember,
  deleteGroupMember,
} from "../../../../../../api/whatapgroup.js";

// Just suggestions shown while typing a new group name — user can still type any custom name.
const GROUP_NAME_SUGGESTIONS = [
  "Sale Contract Confirmation",
  "Purchase Contract Confirmation",
  "Despatch Order",
  "Delivery Report",
  "Outstanding Report",
].map((name) => ({ value: name }));

export default function WhatappGroup() {
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Add / Edit group
  const [groupForm] = Form.useForm();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Manage members (sub-group)
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Add / Edit member
  const [memberForm] = Form.useForm();
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const fetchGroups = async () => {
    setGroupsLoading(true);
    try {
      const res = await getAllWhatsappGroups();
      const formatted = (res || []).map((item) => ({
        key: item.id,
        groupName: item.group_name,
        memberCount: item.member_count,
      }));
      setGroups(formatted);
    } catch (error) {
      console.log(error);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchMembers = async (group) => {
    setMembersLoading(true);

    try {
      const res = await getGroupMembers();

      const filtered = (res || []).filter((item) => item.group === group.key);

      const formatted = filtered.map((item) => ({
        key: item.id,
        personName: item.person_name,
        designation: item.designation,
        whatsappNumber: item.whatsapp_number,
      }));

      setMembers(formatted);
    } catch (error) {
      console.log(error);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  /* ---------------- GROUP HANDLERS (create group first) ---------------- */
  const openAddGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
    setGroupModalOpen(true);
  };

  const openEditGroup = (record) => {
    setEditingGroup(record);
    groupForm.setFieldsValue({ groupName: record.groupName });
    setGroupModalOpen(true);
  };

  const handleGroupSubmit = async (values) => {
    try {
      const payload = { group_name: values.groupName };

      if (editingGroup) {
        await updateWhatsappGroup(editingGroup.key, payload);
        message.success("Group updated successfully");
      } else {
        await addWhatsappGroup(payload);
        message.success("WhatsApp group created successfully");
      }

      setGroupModalOpen(false);
      groupForm.resetFields();
      fetchGroups();
    } catch (error) {
      console.log(error);
      message.error("Failed to save WhatsApp group");
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await deleteWhatsappGroup(id);
      message.success("Group deleted successfully");
      fetchGroups();
    } catch (error) {
      console.log(error);
      message.error("Failed to delete group");
    }
  };

  const handleManageMembers = (group) => {
    setSelectedGroup(group);
    setMembersOpen(true);
    fetchMembers(group);
  };

  /* ---------------- MEMBER HANDLERS (added inside a created group) ---------------- */
  const openAddMember = () => {
    setEditingMember(null);
    memberForm.resetFields();
    setMemberModalOpen(true);
  };

  const openEditMember = async (record) => {
    try {
      const res = await getGroupMemberById(record.key);

      setEditingMember(record);

      memberForm.setFieldsValue({
        personName: res.person_name,
        designation: res.designation,
        whatsappNumber: res.whatsapp_number,
      });

      setMemberModalOpen(true);
    } catch (error) {
      console.log(error);
      message.error("Failed to load member");
    }
  };
  const handleMemberSubmit = async (values) => {
    try {
      const payload = {
        group: selectedGroup.key,
        person_name: values.personName,
        designation: values.designation,
        whatsapp_number: values.whatsappNumber,
      };
      if (editingMember) {
        await updateGroupMember(editingMember.key, payload);
        message.success("Member updated successfully");
      } else {
        await addGroupMember(payload);
        message.success("Member added successfully");
      }

      setMemberModalOpen(false);
      memberForm.resetFields();
      fetchMembers(selectedGroup);
      fetchGroups(); // refresh member counts on the main table
    } catch (error) {
      console.log(error);
      message.error("Failed to save member");
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteGroupMember(id);
      message.success("Member removed successfully");
      fetchMembers(selectedGroup);
      fetchGroups();
    } catch (error) {
      console.log(error);
      message.error("Failed to remove member");
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  const groupColumns = [
    {
      title: (
        <span className="text-amber-700 font-semibold">
          WhatsApp Group Name
        </span>
      ),
      dataIndex: "groupName",
      render: (text) => (
        <div className="flex items-center gap-2">
          <WhatsAppOutlined className="text-green-500 text-base" />
          <span className="text-amber-800 font-medium">{text}</span>
        </div>
      ),
    },
    // {
    //   title: <span className="text-amber-700 font-semibold">Members</span>,
    //   dataIndex: "memberCount",
    //   width: 140,
    //   render: (count) => <Tag color="gold">{count ?? 0} member(s)</Tag>,
    // },
    {
      title: <span className="text-amber-700 font-semibold">Actions</span>,
      width: 260,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<TeamOutlined />}
            className="bg-amber-500! hover:bg-amber-600! border-none! text-white!"
            onClick={() => handleManageMembers(record)}
          >
            Manage Members
          </Button>
          <EditOutlined
            className="cursor-pointer! text-blue-500! hover:text-blue-600! text-base"
            onClick={() => openEditGroup(record)}
          />
          <Popconfirm
            title="Delete this WhatsApp group and all its members?"
            onConfirm={() => handleDeleteGroup(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="cursor-pointer! text-gray-500! hover:text-gray-700! text-base" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const memberColumns = [
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">
          Name of Person
        </span>
      ),
      dataIndex: "personName",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">
          Designation
        </span>
      ),
      dataIndex: "designation",
      render: (t) => <span className="text-amber-800">{t}</span>,
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">
          WhatsApp Number
        </span>
      ),
      dataIndex: "whatsappNumber",
      render: (t) => (
        <span className="text-amber-800 flex items-center gap-1">
          <WhatsAppOutlined className="text-green-500" />
          {t}
        </span>
      ),
    },
    {
      title: (
        <span className="text-amber-700 font-semibold text-xs">Actions</span>
      ),
      width: 100,
      render: (_, record) => (
        <div className="flex gap-3">
          <EditOutlined
            className="cursor-pointer! text-blue-500! hover:text-blue-600!"
            onClick={() => openEditMember(record)}
          />
          <Popconfirm
            title="Remove this member from the group?"
            onConfirm={() => handleDeleteMember(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="cursor-pointer! text-gray-500! hover:text-gray-700!" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-amber-700 text-lg font-semibold m-0">
          WhatsApp Group Master
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddGroup}
          className="bg-amber-500! hover:bg-amber-600! border-none!"
        >
          Add Group
        </Button>
      </div>

      {/* ---------------- GROUP TABLE ---------------- */}
      <div className="border border-amber-300 rounded-lg p-4 bg-white shadow-md">
        <Table
          columns={groupColumns}
          dataSource={groups}
          rowKey="key"
          loading={groupsLoading}
          pagination={false}
          locale={{
            emptyText:
              'No WhatsApp groups yet — click "Add Group" to create one',
          }}
        />
      </div>

      {/* ---------------- ADD / EDIT GROUP MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-lg font-semibold">
            {editingGroup ? "Edit WhatsApp Group" : "Create WhatsApp Group"}
          </span>
        }
        open={groupModalOpen}
        onCancel={() => setGroupModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={groupForm} layout="vertical" onFinish={handleGroupSubmit}>
          <Form.Item
            label="WhatsApp Group Name"
            name="groupName"
            rules={[
              { required: true, message: "WhatsApp Group Name is required" },
            ]}
          >
            <AutoComplete
              options={GROUP_NAME_SUGGESTIONS}
              placeholder="Enter or select a group name"
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setGroupModalOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              className="bg-amber-500! border-none! text-white"
            >
              {editingGroup ? "Update" : "Create Group"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---------------- MANAGE MEMBERS MODAL (SUB-GROUP) ---------------- */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <WhatsAppOutlined className="text-green-500 text-xl" />
            <span className="text-amber-700 text-xl font-semibold">
              {selectedGroup?.groupName}
            </span>
          </div>
        }
        open={membersOpen}
        onCancel={() => setMembersOpen(false)}
        footer={null}
        width={900}
      >
        <div className="flex justify-end mb-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddMember}
            className="bg-amber-500! hover:bg-amber-600! border-none!"
          >
            Add Member
          </Button>
        </div>

        <Card bordered className="border-amber-300">
          <Table
            columns={memberColumns}
            dataSource={members}
            rowKey="key"
            size="small"
            loading={membersLoading}
            pagination={false}
            locale={{ emptyText: "No members added yet" }}
          />
        </Card>
      </Modal>

      {/* ---------------- ADD / EDIT MEMBER MODAL ---------------- */}
      <Modal
        title={
          <span className="text-amber-700 text-lg font-semibold">
            {editingMember ? "Edit Member" : "Add Member"} —{" "}
            {selectedGroup?.groupName}
          </span>
        }
        open={memberModalOpen}
        onCancel={() => setMemberModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Name of Person"
                name="personName"
                rules={[
                  { required: true, message: "Name of Person is required" },
                ]}
              >
                <Input placeholder="Enter name of person" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Designation"
                name="designation"
                rules={[{ required: true, message: "Designation is required" }]}
              >
                <Input placeholder="Enter designation" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="WhatsApp Number"
                name="whatsappNumber"
                rules={[
                  { required: true, message: "WhatsApp Number is required" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Enter a valid 10 digit WhatsApp number",
                  },
                ]}
              >
                <Input placeholder="Enter WhatsApp number" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setMemberModalOpen(false)}>Cancel</Button>
            <Button
              htmlType="submit"
              className="bg-amber-500! border-none! text-white"
            >
              {editingMember ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
