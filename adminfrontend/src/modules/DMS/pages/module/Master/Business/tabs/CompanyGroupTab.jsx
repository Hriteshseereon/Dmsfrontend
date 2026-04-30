import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, message, Spin } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  addCompanyGroup,
  getCompanyGroupById,
  getCompanyGroups,
  updateCompanyGroup,
} from "../../../../../../../api/bussinesspatnr";

export default function CompanyGroupTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form] = Form.useForm();

  // -------- Helpers --------
  const mapToUI = (item) => ({
    key: item.id,
    id: item.id,
    companyName: item.name,
  });

  // -------- API Calls --------
  const fetchCompanyGroups = async () => {
    setLoading(true);
    try {
      const res = await getCompanyGroups();
      const formatted = res.map(mapToUI);
      setData(formatted);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch company groups");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedRecord) {
        await updateCompanyGroup(selectedRecord.id, {
          name: values.companyName,
        });
        message.success("Company updated successfully");
      } else {
        await addCompanyGroup({
          name: values.companyName,
        });
        message.success("Company added successfully");
      }

      await fetchCompanyGroups();
      closeModal();
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
    }
  };

  const handleView = async (record) => {
    try {
      setLoading(true);
      const res = await getCompanyGroupById(record.id);
      setSelectedRecord(mapToUI(res));
      setIsViewOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    form.resetFields();
  };

  // -------- Effects --------
  useEffect(() => {
    fetchCompanyGroups();
  }, []);

  // -------- Filter --------
  const filteredData = data.filter((item) =>
    item.companyName.toLowerCase().includes(searchText.toLowerCase()),
  );

  // -------- Columns --------
  const columns = [
    {
      title: "Company Name",
      dataIndex: "companyName",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12 }}>
          <EyeOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => handleView(record)}
          />
          <EditOutlined
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => {
              setSelectedRecord(record);
              form.setFieldsValue({
                companyName: record.companyName,
              });
              setIsModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div>
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="bg-amber-600! hover:bg-amber-700! border-none! text-white!"
          >
            Add Company
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        {/* Add/Edit Modal */}
        <Modal
          open={isModalOpen}
          onCancel={closeModal}
          footer={null}
          title={selectedRecord ? "Edit Company" : "Add Company"}
        >
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[{ required: true, message: "Company name is required" }]}
            >
              <Input placeholder="Enter Company Name" />
            </Form.Item>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button onClick={closeModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-amber-600! hover:bg-amber-700! border-none! text-white!"
              >
                {selectedRecord ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* View Modal */}
        <Modal
          open={isViewOpen}
          onCancel={() => setIsViewOpen(false)}
          footer={null}
          title="View Company"
        >
          <p>{selectedRecord?.companyName}</p>
        </Modal>
      </div>
    </Spin>
  );
}
